import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

const NAV_SECTIONS = [
  {
    heading: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', end: true }],
  },
  {
    heading: 'Catalog',
    items: [
      { to: '/admin/categories', label: 'Categories', end: false },
      { to: '/admin/products', label: 'Products', end: false },
    ],
  },
  {
    heading: 'Homepage Content',
    items: [
      { to: '/admin/hero', label: 'Hero Images', end: false },
      { to: '/admin/gallery', label: 'Gallery', end: false },
      { to: '/admin/testimonials', label: 'Testimonials', end: false },
      { to: '/admin/faqs', label: 'FAQs', end: false },
    ],
  },
  {
    heading: 'Site Settings',
    items: [
      { to: '/admin/nav-links', label: 'Customer Service Links', end: false },
      { to: '/admin/footer', label: 'Footer & Contact', end: false },
      { to: '/admin/settings', label: 'Booking & Settings', end: false },
    ],
  },
]

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/categories': 'Categories',
  '/admin/products': 'Products',
  '/admin/products/new': 'Add Product',
  '/admin/hero': 'Hero Images',
  '/admin/gallery': 'Gallery',
  '/admin/testimonials': 'Testimonials',
  '/admin/faqs': 'FAQs',
  '/admin/nav-links': 'Customer Service Links',
  '/admin/footer': 'Footer & Contact',
  '/admin/settings': 'Booking & Settings',
}

function currentPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/admin/categories/')) return 'Edit Category'
  if (pathname.endsWith('/edit')) return 'Edit Product'
  return 'Studio Admin'
}

export function AdminLayout() {
  const { username, loading, logout } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!username) return <Navigate to="/admin/login" replace />

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 py-4">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Lifecasting Studio
          </p>
          <p className="font-display text-xl font-semibold">Admin Dashboard</p>
          <div className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-sidebar-accent px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            <p className="text-xs text-muted-foreground">Signed in as {username}</p>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {NAV_SECTIONS.map((section) => (
            <SidebarGroup key={section.heading}>
              <SidebarGroupLabel>{section.heading}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={location.pathname === item.to}>
                        <NavLink to={item.to} end={item.end}>
                          {item.label}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <Button type="button" variant="outline" onClick={() => logout()}>
            Sign out
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center gap-3 border-b bg-background px-4 py-4 md:px-8">
          <SidebarTrigger />
          <h1 className="font-display text-lg font-semibold">{currentPageTitle(location.pathname)}</h1>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
