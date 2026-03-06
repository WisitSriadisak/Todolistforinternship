'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Tag, Users, Bell, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/tasks',      label: 'งานทั้งหมด',        icon: CheckSquare },
  { href: '/categories', label: 'หมวดหมู่',          icon: Tag },
  { href: '/friends',    label: 'เพื่อน',             icon: Users },
  { href: '/tagged',     label: 'งานที่ถูกแท็ก',     icon: Bell },
]

interface Props { userEmail: string }

export default function Sidebar({ userEmail }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed top-0 left-0 w-[240px] h-screen bg-[#f8fafc] border-r border-[#e2e8f0] flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#e2e8f0]">
        <span className="text-base font-bold text-[#0f172a] leading-tight">
          To Do List<br />
          <span className="text-xs font-semibold text-[#6366f1]">By Wisit</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-[#6366f1]'
                  : 'text-[#334155] hover:bg-slate-100 hover:text-[#0f172a]'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-[#e2e8f0] space-y-2">
        <div className="px-3 py-1">
          <p className="text-xs text-[#64748b] truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#64748b] hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}
