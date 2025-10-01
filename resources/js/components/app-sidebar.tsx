import { NavFooter } from '@/components/nav-footer'
import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'

import { dashboard, pablo, products, users } from '@/routes'
import { NavMainProps, type NavItem } from '@/types'
import { Link } from '@inertiajs/react'
import {
  Cog,
  icons,
  LayoutGrid,
  LockKeyholeIcon,
  Shield,
  User,
  Users,
} from 'lucide-react'
import AppLogo from './app-logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

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
              title: 'Pruebas',
              href: products(),
              icon: LockKeyholeIcon,
            },
            {
              title: 'Pablo',
              href: pablo(),
              icon: Shield,
            },
          ],
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
