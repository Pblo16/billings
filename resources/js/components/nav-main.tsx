import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { type NavMainProps, type NavItem } from '@/types'
import { Link, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Minus, Plus } from 'lucide-react'
import { CollapsibleContent } from '@radix-ui/react-collapsible'

export function NavMain({ data }: { data: NavMainProps }) {
  const page = usePage()
  // Persist open state for each menu by path (multi-level)
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({})

  // Helper to build a unique key for each menu/submenu
  const getMenuKey = (parentKeys: string[], title: string) => {
    return [...parentKeys, title].join('>')
  }

  // Load persisted state on mount
  useEffect(() => {
    const persisted = localStorage.getItem('sidebarOpenMenus')
    if (persisted) {
      setOpenMenus(JSON.parse(persisted))
    }
  }, [])

  // Persist state on change
  useEffect(() => {
    localStorage.setItem('sidebarOpenMenus', JSON.stringify(openMenus))
  }, [openMenus])

  // Helper to toggle menu
  const handleToggle = (key: string, open: boolean) => {
    setOpenMenus((prev) => ({ ...prev, [key]: open }))
  }

  // Recursive renderer for nav items (multi-level)
  const renderNavItems = (items: NavItem[], parentKeys: string[] = []) => {
    return items.map((item, index) => {
      const key = getMenuKey(parentKeys, item.title)
      const isOpen = openMenus[key] ?? index === 1
      const hasChildren = Array.isArray(item.items) && item.items.length > 0
      // Determinar la indentación: solo el primer nivel tiene padding
      const liClass = parentKeys.length === 0 ? 'pl-2' : 'pl-0'
      return (
        <Collapsible
          key={key}
          open={isOpen}
          onOpenChange={(open) => handleToggle(key, open)}
          className="group/collapsible"
        >
          <li className={liClass}>
            <CollapsibleTrigger asChild>
              <Link
                href={item.href}
                className="flex items-center gap-2"
                prefetch
              >
                <SidebarMenuButton
                  isActive={page.url.startsWith(
                    typeof item.href === 'string' ? item.href : item.href?.url,
                  )}
                  tooltip={{ children: item.title }}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
                {hasChildren ? (
                  <span className="flex items-center ml-auto">
                    {!isOpen && <Plus size={16} />}
                    {isOpen && <Minus size={16} />}
                  </span>
                ) : null}
              </Link>
            </CollapsibleTrigger>
            {hasChildren ? (
              <CollapsibleContent>
                <ul className="pl-4">
                  {renderNavItems(item.items ?? [], [
                    ...parentKeys,
                    item.title,
                  ])}
                </ul>
              </CollapsibleContent>
            ) : null}
          </li>
        </Collapsible>
      )
    })
  }

  return (
    <nav aria-label="Main Navigation">
      <SidebarGroup className="px-2 py-0">
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <ul>{renderNavItems(data.navMain)}</ul>
      </SidebarGroup>
    </nav>
  )
}
