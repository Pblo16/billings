import { Breadcrumbs } from '@/components/breadcrumbs'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types'

export function AppSidebarHeader({
  breadcrumbs = [],
}: {
  breadcrumbs?: BreadcrumbItemType[]
}) {
  return (
    <header className="flex items-center gap-2 px-6 md:px-4 border-sidebar-border/50 border-b h-16 transition-all duration-200 ease-in-out shrink-0">
      <div className="flex items-center gap-2 w-full">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
    </header>
  )
}
