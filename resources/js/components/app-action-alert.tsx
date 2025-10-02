import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { router } from '@inertiajs/react'

interface AppActionAlertProps {
  query: string | null
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess?: () => void
}
const AppActionAlert = ({
  query,
  open,
  setOpen,
  onSuccess,
}: AppActionAlertProps) => {
  const handleDelete = (query: string) => {
    router.delete(query, {
      preserveScroll: true,
      onSuccess: () => {
        onSuccess?.()
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            remove data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (query) {
                handleDelete(query)
              }
              setOpen(false)
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AppActionAlert
