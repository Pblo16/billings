import { AppContent } from '@/components/app-content'
import { AppShell } from '@/components/app-shell'
import { AppSidebar } from '@/components/app-sidebar'
import { AppSidebarHeader } from '@/components/app-sidebar-header'
import FlashNotification from '@/components/FlashNotification'
import { type BreadcrumbItem } from '@/types'
import { type PropsWithChildren } from 'react'

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
  return (
    <AppShell variant="sidebar">
      <AppSidebar />
      <AppContent variant="sidebar" className="overflow-x-hidden">
        <AppSidebarHeader breadcrumbs={breadcrumbs} />

        {/* Flash notification visible en todas las páginas */}
        {/* Flash notification visible en todas las páginas */}
        <FlashNotification />
        <div className="h-full overflow-x-auto">{children}</div>
      </AppContent>
    </AppShell>
  )
}
