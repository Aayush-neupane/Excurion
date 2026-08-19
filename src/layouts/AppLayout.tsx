import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  CalendarDays,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Logo } from '@/components/common/Logo'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { UserAvatar } from '@/components/common/UserAvatar'
import { cn } from '@/lib/utils'
import { notificationApi } from '@/api'
import { useUserStore } from '@/store/useUserStore'
import { useUIStore } from '@/store/useUIStore'
import { useIsMobile } from '@/hooks/useMediaQuery'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CommandPalette } from '@/components/common/CommandPalette'

const NAV_ITEMS: {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/profile', label: 'Profile', icon: User },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

const PAGE_TITLES: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/notifications': 'Notifications',
  '/app/profile': 'Profile',
  '/app/settings': 'Settings',
}

function SidebarNav() {
  const { isMobileNavOpen, setMobileNav } = useUIStore()
  const user = useUserStore((s) => s.user)
  const logout = useUserStore((s) => s.logout)
  const [open, setOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {isMobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileNav(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background lg:hidden"
              aria-label="Mobile navigation"
            >
              <SidebarContent
                onNavigate={() => setMobileNav(false)}
                user={user}
                onLogout={logout}
                onUserMenuChange={setOpen}
                userMenuOpen={open}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card lg:flex" aria-label="Primary navigation">
        <SidebarContent user={user} onLogout={logout} onUserMenuChange={setOpen} userMenuOpen={open} />
      </aside>
    </>
  )
}

interface SidebarContentProps {
  user: ReturnType<typeof useUserStore.getState>['user']
  onLogout: () => void
  onNavigate?: () => void
  onUserMenuChange: (open: boolean) => void
  userMenuOpen: boolean
}

function SidebarContent({ user, onLogout, onNavigate, onUserMenuChange, userMenuOpen }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <NavLink to="/app" onClick={onNavigate} className="flex items-center gap-2" aria-label="Excurion dashboard">
          <Logo />
        </NavLink>
        <button
          className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
          onClick={() => useUIStore.getState().setMobileNav(false)}
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Sidebar">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
          Menu
        </p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/12 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {item.to === '/app/notifications' && (
                  <UnreadBadge />
                )}
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <DropdownMenu open={userMenuOpen} onOpenChange={onUserMenuChange}>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <UserAvatar name={user?.name ?? 'Guest'} className="h-9 w-9" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{user?.name ?? 'Guest'}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {user?.role === 'teacher' ? 'Instructor' : user?.role ?? 'Learner'}
                </span>
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <span className="block text-xs text-muted-foreground">Signed in as</span>
              <span className="text-sm font-medium text-foreground">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => useUIStore.getState().setCommandPaletteOpen(true)}>
              <Search className="h-4 w-4" />
              Command menu
              <kbd className="ml-auto text-[10px] text-muted-foreground">⌘K</kbd>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/app/profile">
                <User />
                Profile
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/app/settings">
                <Settings />
                Settings
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onLogout}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function UnreadBadge() {
  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationApi.getUnreadCount,
  })
  if (!unread) return null
  return (
    <Badge variant="default" className="ml-auto h-5 min-w-5 px-1.5 text-[10px]">
      {unread > 99 ? '99+' : unread}
    </Badge>
  )
}

function Topbar() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const { setCommandPaletteOpen } = useUIStore()
  const title = PAGE_TITLES[location.pathname] ?? 'Dashboard'
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => useUIStore.getState().toggleMobileNav()}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}

      <div className="flex flex-col">
        <h1 className="text-sm font-semibold sm:text-base">{title}</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">{today}</p>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted sm:flex"
          aria-label="Open command menu"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Quick actions
          <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
          onClick={() => (window.location.href = '/app/notifications')}
        >
          <Bell className="h-4 w-4" />
          <UnreadDot />
        </Button>
      </div>
    </header>
  )
}

function UnreadDot() {
  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationApi.getUnreadCount,
  })
  if (!unread) return null
  return (
    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" aria-hidden />
  )
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}