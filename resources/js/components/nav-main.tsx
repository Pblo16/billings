import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { type NavItem, type NavMainProps } from '@/types'
import { Link, usePage } from '@inertiajs/react'
import { CollapsibleContent } from '@radix-ui/react-collapsible'
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export function NavMain({ data }: { data: NavMainProps }) {
  const page = usePage()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  // Persist open state for each menu by path (multi-level)
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({})
  const [isInitialized, setIsInitialized] = useState(false)

  // Helper to build a unique key for each menu/submenu
  const getMenuKey = useCallback((parentKeys: string[], title: string) => {
    return [...parentKeys, title].join('>')
  }, [])

  // Helper to check if a menu item or any of its children is active
  const isItemActive = useCallback(
    (item: NavItem): boolean => {
      const itemHref =
        typeof item.href === 'string' ? item.href : item.href?.url || ''
      if (itemHref !== '#' && page.url.startsWith(itemHref)) {
        return true
      }
      if (item.items && item.items.length > 0) {
        return item.items.some((child) => isItemActive(child))
      }
      return false
    },
    [page.url],
  )

  // Helper to get all parent keys that should be open based on active route
  const getActiveMenuKeys = useCallback(
    (items: NavItem[], parentKeys: string[] = []): string[] => {
      const activeKeys: string[] = []
      items.forEach((item) => {
        const key = getMenuKey(parentKeys, item.title)
        if (isItemActive(item)) {
          activeKeys.push(key)
          if (item.items && item.items.length > 0) {
            const childKeys = getActiveMenuKeys(item.items, [
              ...parentKeys,
              item.title,
            ])
            activeKeys.push(...childKeys)
          }
        }
      })
      return activeKeys
    },
    [getMenuKey, isItemActive],
  )

  // Load persisted state on mount and merge with active route
  useEffect(() => {
    const persisted = localStorage.getItem('sidebarOpenMenus')
    const persistedState = persisted ? JSON.parse(persisted) : {}

    // Get keys that should be open based on current route
    const activeKeys = getActiveMenuKeys(data.navMain)
    const activeState: { [key: string]: boolean } = {}
    activeKeys.forEach((key) => {
      activeState[key] = true
    })

    // Merge persisted state with active state (active state takes precedence)
    setOpenMenus({ ...persistedState, ...activeState })
    setIsInitialized(true)
  }, [data.navMain, getActiveMenuKeys])

  // Update open menus when route changes
  useEffect(() => {
    if (!isInitialized) return

    const activeKeys = getActiveMenuKeys(data.navMain)
    if (activeKeys.length > 0) {
      setOpenMenus((prev) => {
        const newState = { ...prev }
        activeKeys.forEach((key) => {
          newState[key] = true
        })
        return newState
      })
    }
  }, [page.url, isInitialized, data.navMain, getActiveMenuKeys])

  // Persist state on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('sidebarOpenMenus', JSON.stringify(openMenus))
    }
  }, [openMenus, isInitialized])

  // Helper to toggle menu
  const handleToggle = (key: string, open: boolean) => {
    setOpenMenus((prev) => ({ ...prev, [key]: open }))
  }

  // Render dropdown items recursively
  const renderDropdownItems = (items: NavItem[], parentKeys: string[] = []) => {
    return items.map((item) => {
      const hasChildren = Array.isArray(item.items) && item.items.length > 0
      const key = getMenuKey(parentKeys, item.title)

      if (hasChildren) {
        return (
          <DropdownMenu key={key} modal={false}>
            <DropdownMenuTrigger asChild>
              <DropdownMenuItem
                className="flex justify-between items-center cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <span className="flex items-center gap-2">
                  {item.icon && <item.icon className="size-4" />}
                  {item.title}
                </span>
                <ChevronRight className="size-4" />
              </DropdownMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="start"
              className="w-48"
              sideOffset={4}
              alignOffset={-4}
              onCloseAutoFocus={(e) => e.preventDefault()}
              onPointerDownOutside={(e) => {
                const target = e.target as HTMLElement
                if (target.closest('[data-radix-popper-content-wrapper]')) {
                  e.preventDefault()
                }
              }}
              onInteractOutside={(e) => {
                const target = e.target as HTMLElement
                if (target.closest('[data-radix-popper-content-wrapper]')) {
                  e.preventDefault()
                }
              }}
            >
              {renderDropdownItems(item.items ?? [], [
                ...parentKeys,
                item.title,
              ])}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }

      return (
        <DropdownMenuItem key={key} asChild>
          <Link
            href={item.href}
            className="flex items-center gap-2 cursor-pointer"
            prefetch
          >
            {item.icon && <item.icon className="size-4" />}
            {item.title}
          </Link>
        </DropdownMenuItem>
      )
    })
  }

  // Recursive renderer for nav items (multi-level)
  const renderNavItems = (items: NavItem[], parentKeys: string[] = []) => {
    return items.map((item) => {
      const key = getMenuKey(parentKeys, item.title)
      const isOpen = openMenus[key] ?? false
      const hasChildren = Array.isArray(item.items) && item.items.length > 0
      const liClass = parentKeys.length === 0 ? 'pl-0' : 'pl-0'

      // When collapsed and has children, use dropdown
      if (isCollapsed && hasChildren && parentKeys.length === 0) {
        return (
          <li key={key} className={liClass}>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  isActive={page.url.startsWith(
                    typeof item.href === 'string' ? item.href : item.href?.url,
                  )}
                  tooltip={{ children: item.title }}
                  className="w-full"
                >
                  {item.icon && <item.icon className="size-4" />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                className="w-48"
                sideOffset={4}
                alignOffset={-4}
                onCloseAutoFocus={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => {
                  const target = e.target as HTMLElement
                  if (target.closest('[data-radix-popper-content-wrapper]')) {
                    e.preventDefault()
                  }
                }}
                onInteractOutside={(e) => {
                  const target = e.target as HTMLElement
                  if (target.closest('[data-radix-popper-content-wrapper]')) {
                    e.preventDefault()
                  }
                }}
              >
                {renderDropdownItems(item.items ?? [], [
                  ...parentKeys,
                  item.title,
                ])}
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        )
      }

      // When collapsed without children, simple button
      if (isCollapsed && !hasChildren) {
        return (
          <li key={key} className={liClass}>
            <Link href={item.href} prefetch>
              <SidebarMenuButton
                isActive={page.url.startsWith(
                  typeof item.href === 'string' ? item.href : item.href?.url,
                )}
                tooltip={{ children: item.title }}
                className="w-full"
              >
                {item.icon && <item.icon className="size-4" />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </Link>
          </li>
        )
      }

      // When expanded, use collapsible
      return (
        <Collapsible
          key={key}
          open={isOpen}
          onOpenChange={(open) => handleToggle(key, open)}
          className="group/collapsible"
        >
          <li className={liClass}>
            {hasChildren ? (
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  isActive={page.url.startsWith(
                    typeof item.href === 'string' ? item.href : item.href?.url,
                  )}
                  tooltip={{ children: item.title }}
                  className="justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon className="size-4" />}
                    <span>{item.title}</span>
                  </div>
                  <span className="group-data-[collapsible=icon]:hidden flex items-center transition-transform duration-200">
                    {!isOpen && <ChevronDown size={16} />}
                    {isOpen && <ChevronUp size={16} />}
                  </span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
            ) : (
              <Link href={item.href} className="w-full" prefetch>
                <SidebarMenuButton
                  isActive={page.url.startsWith(
                    typeof item.href === 'string' ? item.href : item.href?.url,
                  )}
                  tooltip={{ children: item.title }}
                  className="w-full"
                >
                  {item.icon && <item.icon className="size-4" />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            )}
            {hasChildren ? (
              <CollapsibleContent className="z-50 overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down duration-300 ease-in-out">
                <ul className="pl-2">
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
      <SidebarGroup className="py-0 pl-2 transition-all">
        <SidebarGroupLabel className="transition-opacity">
          Platform
        </SidebarGroupLabel>
        <ul className="space-y-3">{renderNavItems(data.navMain)}</ul>
      </SidebarGroup>
    </nav>
  )
}
