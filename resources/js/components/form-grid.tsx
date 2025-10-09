import { Button } from './ui/button'

interface FormGridProps {
  children: React.ReactNode
  ext?: React.ReactNode
  isSubmitting?: boolean
  submitButtonText?: string
  actions?: React.ReactNode[]
}

export default function FormGrid({
  children,
  ext,
  isSubmitting = false,
  submitButtonText = 'Submit',
  actions,
}: FormGridProps) {
  return (
    <div
      className="md:items-start gap-4 grid grid-cols-1 md:grid-cols-[auto_200px]"
    >
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
      <div className="md:col-start-1 md:row-start-2 mt-4 md:mt-0">{ext}</div>
      <div
        className="gap-2 grid grid-cols-1 md:grid-cols-2 md:col-start-2 md:row-span-2 md:row-start-1 mt-4 md:mt-0 p-4 border-2 h-fit"
      >
        <Button
          type="submit"
          disabled={isSubmitting}
          className="col-span-1 md:col-span-2 px-3 text-sm"
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
        {actions &&
          actions.map((action, index) => <div key={index}>{action}</div>)}
      </div>
    </div>
  )
}
