<?php

namespace App\Traits;

use App\Models\Document;
use App\Models\DocumentRelation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

trait HandlesDocuments
{
  /**
   * Upload and attach a document to a model
   *
   * @param UploadedFile $file The uploaded file
   * @param Model $relatedModel The model to attach the document to
   * @param string $relationType The type of relation (e.g., 'cv', 'invoice', 'license')
   * @param string $storagePath The storage path (e.g., 'cvs', 'invoices')
   * @param string $disk The storage disk (default: 'public')
   * @return Document The created document
   */
  protected function uploadDocument(
    UploadedFile $file,
    Model $relatedModel,
    string $relationType,
    string $storagePath = 'documents',
    string $disk = 'public'
  ): Document {
    // Guardar archivo en storage
    $path = $file->store($storagePath, $disk);

    // Crear documento
    $document = Document::create([
      'name' => $file->getClientOriginalName(),
      'path' => $path,
      'disk' => $disk,
      'mime_type' => $file->getMimeType(),
      'size' => $file->getSize(),
      'uploaded_by_id' => Auth::id(),
    ]);

    // Crear relación polimórfica
    DocumentRelation::create([
      'document_id' => $document->id,
      'related_type' => get_class($relatedModel),
      'related_id' => $relatedModel->id,
      'relation_type' => $relationType,
    ]);

    return $document;
  }

  /**
   * Delete a document from a model
   *
   * @param Model $relatedModel The model the document is attached to
   * @param int|string $documentId The document ID to delete
   * @param string|null $relationType Optional: filter by relation type
   * @param string $disk The storage disk (default: 'public')
   * @return RedirectResponse
   */
  protected function deleteDocumentFromModel(
    Model $relatedModel,
    int|string $documentId,
    ?string $relationType = null,
    string $disk = 'public'
  ): RedirectResponse {
    try {
      // Construir query para buscar la relación
      $query = DocumentRelation::where('related_type', get_class($relatedModel))
        ->where('related_id', $relatedModel->id)
        ->where('document_id', $documentId);

      // Filtrar por tipo de relación si se especifica
      if ($relationType) {
        $query->where('relation_type', $relationType);
      }

      $documentRelation = $query->first();

      if (!$documentRelation) {
        return back()->with('error', 'Document not found');
      }

      $document = $documentRelation->document;

      // Eliminar archivo físico del storage
      if ($document && Storage::disk($disk)->exists($document->path)) {
        Storage::disk($disk)->delete($document->path);
      }

      // Eliminar relación y documento
      $documentRelation->delete();
      if ($document) {
        $document->delete();
      }

      return back()->with('success', 'Document deleted successfully');
    } catch (\Exception $e) {
      return back()->with('error', 'Failed to delete document: ' . $e->getMessage());
    }
  }

  /**
   * Replace an existing document with a new one
   *
   * @param UploadedFile $file The new file to upload
   * @param Model $relatedModel The model the document is attached to
   * @param string $relationType The type of relation
   * @param string $storagePath The storage path
   * @param string $disk The storage disk (default: 'public')
   * @return Document The new document
   */
  protected function replaceDocument(
    UploadedFile $file,
    Model $relatedModel,
    string $relationType,
    string $storagePath = 'documents',
    string $disk = 'public'
  ): Document {
    // Eliminar documento anterior si existe
    $existingRelation = DocumentRelation::where('related_type', get_class($relatedModel))
      ->where('related_id', $relatedModel->id)
      ->where('relation_type', $relationType)
      ->first();

    if ($existingRelation) {
      $oldDocument = $existingRelation->document;

      // Eliminar archivo físico
      if ($oldDocument && Storage::disk($disk)->exists($oldDocument->path)) {
        Storage::disk($disk)->delete($oldDocument->path);
      }

      // Eliminar registros
      $existingRelation->delete();
      if ($oldDocument) {
        $oldDocument->delete();
      }
    }

    // Subir nuevo documento
    return $this->uploadDocument($file, $relatedModel, $relationType, $storagePath, $disk);
  }

  /**
   * Get all documents of a specific type for a model
   *
   * @param Model $relatedModel The model to get documents for
   * @param string|null $relationType Optional: filter by relation type
   * @return \Illuminate\Database\Eloquent\Collection
   */
  protected function getDocuments(Model $relatedModel, ?string $relationType = null)
  {
    $query = DocumentRelation::where('related_type', get_class($relatedModel))
      ->where('related_id', $relatedModel->id)
      ->with('document');

    if ($relationType) {
      $query->where('relation_type', $relationType);
    }

    return $query->get()->pluck('document');
  }

  /**
   * Generate appropriate URL for a document based on disk type
   *
   * @param \Illuminate\Contracts\Filesystem\Filesystem $disk The storage disk instance
   * @param Document $document The document to generate URL for
   * @return string The document URL
   */
  protected function getDocumentUrl($disk, Document $document): string
  {
    // Para discos S3 (como Backblaze), generar URL temporal
    /** @var \Illuminate\Filesystem\FilesystemAdapter|AwsS3Adapter $disk */
    if (method_exists($disk, 'temporaryUrl')) {
      try {
        return $disk->temporaryUrl($document->path, now()->addMinutes(10));
      } catch (\Exception $e) {
        // Fallback a URL normal si temporaryUrl falla
        return $disk->url($document->path);
      }
    }

    // Para discos locales o públicos, usar URL normal
    return $disk->url($document->path);
  }
}
