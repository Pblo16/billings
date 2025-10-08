import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Trash2, X } from 'lucide-react'
import { useState } from 'react'

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

      {/* Archivo nuevo seleccionado */}
      {hasNewFile && (
        <div className="flex items-center gap-3 bg-primary/5 p-3 border rounded-md">
          <FileText className="w-5 h-5 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{selectedFile.name}</p>
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
