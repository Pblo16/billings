import AppActionAlert from '@/components/app-action-alert'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link } from '@inertiajs/react'
import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

export interface TableAction {
  label: string
  href?: string
  onClick?: () => void
  enabled?: boolean
  variant?: 'default' | 'destructive'
  requiresConfirmation?: boolean
  confirmationQuery?: string
}

interface TableActionsProps {
  actions: TableAction[]
  onActionSuccess?: () => void
}

export const TableActions = ({
  actions,
  onActionSuccess,
}: TableActionsProps) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const [confirmationQuery, setConfirmationQuery] = useState<string | null>(
    null,
  )

  const enabledActions = actions.filter((action) => action.enabled !== false)

  if (enabledActions.length === 0) {
    return null
  }

  const handleActionClick = (action: TableAction) => {
    if (action.requiresConfirmation && action.confirmationQuery) {
      setOpenMenu(false)
      setConfirmationQuery(action.confirmationQuery)
      setOpenDialog(true)
    } else if (action.onClick) {
      action.onClick()
    }
  }

  return (
    <>
      <DropdownMenu open={openMenu} onOpenChange={setOpenMenu}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="p-0 w-8 h-8">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          {enabledActions.map((action, index) => {
            const isLastBeforeDestructive =
              action.variant !== 'destructive' &&
              enabledActions[index + 1]?.variant === 'destructive'

            return (
              <div key={index}>
                {isLastBeforeDestructive && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onSelect={(e) => {
                    if (action.requiresConfirmation || action.onClick) {
                      e.preventDefault()
                      handleActionClick(action)
                    }
                  }}
                  className={
                    action.variant === 'destructive'
                      ? 'text-red-600 focus:text-red-600'
                      : ''
                  }
                >
                  {action.href && !action.requiresConfirmation ? (
                    <Link href={action.href} className="w-full">
                      {action.label}
                    </Link>
                  ) : (
                    action.label
                  )}
                </DropdownMenuItem>
              </div>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <AppActionAlert
        query={confirmationQuery}
        open={openDialog}
        setOpen={setOpenDialog}
        onSuccess={onActionSuccess}
      />
    </>
  )
}
