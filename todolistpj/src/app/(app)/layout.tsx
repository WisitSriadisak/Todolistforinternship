import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar userEmail={user.email || ''} />
      <main className="flex-1 ml-[240px] min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
