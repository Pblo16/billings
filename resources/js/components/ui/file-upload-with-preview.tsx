import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface FileUploadWithPreviewProps {
  value?: File | string | null
  onChange: (file: File | null) => void
  onDelete?: () => void
  accept?: string
  disabled?: boolean
  readOnly?: boolean
  placeholder?: string
  existingFileUrl?: string
  existingFileName?: string
}

const FileUploadWithPreview = ({
  value,
  onChange,
  onDelete,
  accept,
  disabled = false,
  readOnly = false,
  placeholder = 'Choose file',
  existingFileUrl,
  existingFileName,
}: FileUploadWithPreviewProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(
    value instanceof File ? value : null,
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Detectar si es una imagen basado en el accept
  const isImage = accept?.includes('image/')

  // Generar URL de preview para archivo nuevo
  useEffect(() => {
    if (selectedFile && isImage) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [selectedFile, isImage])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    onChange(file)
  }

  const handleClearSelection = () => {
    setSelectedFile(null)
    onChange(null)
  }

  // Determinar qué mostrar
  const hasExistingFile = existingFileUrl && !selectedFile
  const hasNewFile = selectedFile

  return (
    <div className="space-y-3">
      {/* Archivo existente */}
      {hasExistingFile && (
        <div className="space-y-2 md:max-w-32 lg:max-w-72">
          {isImage ? (
            <div className="group relative">
              <img
                src={existingFileUrl}
                alt={existingFileName || 'Current image'}
                className="border rounded-md w-full h-48 object-cover"
              />
              <div className="absolute inset-0 flex justify-center items-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 rounded-md transition-opacity">
                <a
                  href={existingFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white text-sm hover:underline"
                >
                  View full size
                </a>
                {onDelete && !readOnly && !disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-muted/50 p-3 border rounded-md">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {existingFileName || 'Current file'}
                </p>
                <a
                  href={existingFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs hover:underline"
                >
                  View file
                </a>
              </div>
              {onDelete && !readOnly && !disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="hover:bg-destructive/10 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Archivo nuevo seleccionado */}
      {hasNewFile && (
        <div className="space-y-2 max-w-16">
          {isImage && previewUrl ? (
            <div className="group relative">
              <img
                src={previewUrl}
                alt={selectedFile.name}
                className="border rounded-md w-full h-48 object-cover"
              />
              <div className="absolute inset-0 flex justify-center items-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-md transition-opacity">
                {!readOnly && !disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleClearSelection}
                  >
                    <X className="mr-2 w-4 h-4" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="mt-2 text-muted-foreground text-xs">
                {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-primary/5 p-3 border rounded-md">
              <FileText className="w-5 h-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {selectedFile.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!readOnly && !disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Input para seleccionar archivo */}
      {!readOnly && (
        <Input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    </div>
  )
}

export default FileUploadWithPreview
