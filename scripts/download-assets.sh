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
echo "[assets] Repository: ${GITHUB_REPOSITORY}"
echo "[assets] Token length: ${#GITHUB_TOKEN} characters"

# Debug: Mostrar workflows recientes ANTES de buscar
echo "[assets] DEBUG: Fetching recent workflows from GitHub..."
RECENT_WORKFLOWS=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
  "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runs?per_page=5")

echo "[assets] DEBUG: Recent workflows:"
echo "$RECENT_WORKFLOWS" | jq -r '.workflow_runs[]? | "  - \(.name) | Branch: \(.head_branch) | Status: \(.status) | Conclusion: \(.conclusion)"'

# Obtener el último workflow run exitoso del branch actual
echo "[assets] Searching for successful 'CI' workflow on branch '${BRANCH}' with event 'push'..."
WORKFLOW_RUN=$(echo "$RECENT_WORKFLOWS" | jq -r ".workflow_runs[] | select(.name == \"CI\" and .head_branch == \"${BRANCH}\" and .status == \"completed\" and .conclusion == \"success\") | .id" | head -n 1)

if [ "$WORKFLOW_RUN" = "null" ] || [ -z "$WORKFLOW_RUN" ]; then
  echo ""
  echo "========================================="
  echo "ERROR: No matching CI workflow found!"
  echo "========================================="
  echo "Searched for:"
  echo "  - Workflow name: CI"
  echo "  - Branch: ${BRANCH}"
  echo "  - Status: completed"
  echo "  - Conclusion: success"
  echo ""
  echo "Available workflows (last 10):"
  curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
    "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/runs?per_page=10" \
    | jq -r '.workflow_runs[]? | "  [\(.id)] \(.name) - \(.head_branch) - \(.status)/\(.conclusion) - \(.event)"'
  echo ""
  echo "========================================="
  exit 1
fi

echo "[assets] Found workflow run ID: $WORKFLOW_RUN"

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
