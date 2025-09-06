import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, Settings, Coffee, Utensils, LogOut } from 'lucide-react'
import { verifyAdminSession } from '@/lib/auth'

// Check authentication for admin routes
async function checkAuth() {
  const isAuthenticated = await verifyAdminSession()
  if (!isAuthenticated) {
    redirect('/admin-login')
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkAuth()

  return (
    <div className="min-h-screen bg-mokka-cr/30">
      <header className="bg-mokka-gy text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Mokka Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-mokka-cr/80">Admin Panel</span>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-mokka-cr/80 hover:text-white hover:bg-mokka-cr/20 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm bg-white border-mokka-tq/20">
              <div className="px-6 space-y-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 h-9 px-4 py-2 has-[>svg]:px-3 w-full justify-start text-mokka-gy hover:bg-mokka-tq/10 hover:text-mokka-tq"
                >
                  <Users className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/admin/events"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 h-9 px-4 py-2 has-[>svg]:px-3 w-full justify-start text-mokka-gy hover:bg-mokka-tq/10 hover:text-mokka-tq"
                >
                  <Calendar className="w-4 h-4" />
                  Events
                </Link>
                <Link
                  href="/admin/rsvps"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 h-9 px-4 py-2 has-[>svg]:px-3 w-full justify-start text-mokka-gy hover:bg-mokka-tq/10 hover:text-mokka-tq"
                >
                  <Users className="w-4 h-4" />
                  RSVPs
                </Link>
                <Link
                  href="/admin/menu"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 h-9 px-4 py-2 has-[>svg]:px-3 w-full justify-start text-mokka-gy hover:bg-mokka-tq/10 hover:text-mokka-tq"
                >
                  <Utensils className="w-4 h-4" />
                  Menu
                </Link>
                <Link
                  href="/admin/settings"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 h-9 px-4 py-2 has-[>svg]:px-3 w-full justify-start text-mokka-gy hover:bg-mokka-tq/10 hover:text-mokka-tq"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>
            </div>
          </aside>
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
