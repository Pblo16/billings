#!/usr/bin/env bash
set -euo pipefail

echo "[assets] Downloading build assets from GitHub Actions..."

# Verificar variables requeridas
if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "ERROR: GITHUB_TOKEN environment variable is not set"
  exit 1
fi

if [ -z "${GITHUB_REPOSITORY:-}" ]; then
  echo "ERROR: GITHUB_REPOSITORY environment variable is not set"
  exit 1
fi

BRANCH="${RENDER_GIT_BRANCH:-master}"
echo "[assets] Looking for workflow runs on branch: $BRANCH"

# Obtener el último workflow run exitoso del branch actual
WORKFLOW_RUN=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
  "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runs?branch=${BRANCH}&status=success&event=push&per_page=5" \
  | jq -r '.workflow_runs[] | select(.name == "CI") | .id' | head -n 1)

if [ "$WORKFLOW_RUN" = "null" ] || [ -z "$WORKFLOW_RUN" ]; then
  echo "ERROR: No successful CI workflow run found for branch ${BRANCH}"
  echo "DEBUG: Checking recent workflow runs..."
  curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
    "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runs?per_page=5" \
    | jq -r '.workflow_runs[] | "\(.name) - \(.status) - \(.conclusion) - \(.head_branch)"'
  exit 1
fi

echo "[assets] Found workflow run: $WORKFLOW_RUN"

# Obtener el artifact ID
ARTIFACT_ID=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
  "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runs/${WORKFLOW_RUN}/artifacts" \
  | jq -r '.artifacts[] | select(.name=="build-assets") | .id')

if [ "$ARTIFACT_ID" = "null" ] || [ -z "$ARTIFACT_ID" ]; then
  echo "ERROR: build-assets artifact not found"
  exit 1
fi

echo "[assets] Downloading artifact: $ARTIFACT_ID"

# Descargar el artifact
curl -L -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/artifacts/${ARTIFACT_ID}/zip" \
  -o /tmp/build-assets.zip

echo "[assets] Extracting assets..."
unzip -q /tmp/build-assets.zip -d /var/www/html/public/
rm /tmp/build-assets.zip

echo "[assets] Assets downloaded successfully!"
ls -lah /var/www/html/public/build/
