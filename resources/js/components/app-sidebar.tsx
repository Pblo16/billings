import { NavFooter } from '@/components/nav-footer'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { dashboard, users } from '@/routes'
import { role } from '@/routes/admin/security'
import { clients, provider } from '@/routes/control'
import { NavMainProps, type NavItem } from '@/types'
import { Link } from '@inertiajs/react'
import {
  Building2,
  Cog,
  LayoutGrid,
  ScanLine,
  Shield,
  Users,
} from 'lucide-react'
import AppLogo from './app-logo'

const mainNavItems: NavMainProps = {
  navMain: [
    {
      title: 'dashboard',
      href: dashboard(),
      icon: LayoutGrid,
    },
    {
      title: 'Admin Panel',
      href: '#',
      icon: Cog,
      items: [
        {
          title: 'Users',
          href: users(),
          icon: Users,
        },
        {
          title: 'Security',
          href: '#',
          icon: Shield,
          items: [
            {
              title: 'Roles',
              href: role(),
            },
          ],
        },
      ],
    },
    {
      title: 'Control',
      href: '#',
      icon: Building2,
      items: [
        {
          title: 'Providers',
          href: provider(),
          icon: ScanLine,
        },
        {
          title: 'Clients',
          href: clients(),
          icon: ScanLine,
        },
      ],
    },
  ],
}
const footerNavItems: NavItem[] = []

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset" className="border-r-2">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={dashboard()} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain data={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
