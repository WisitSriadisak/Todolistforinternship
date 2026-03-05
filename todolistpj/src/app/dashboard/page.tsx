import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  // ดึงสถิติด้วย Server Component
  const { data: tasks } = await supabase.from('tasks').select('status, priority, due_date')

  const total      = tasks?.length || 0
  const done       = tasks?.filter(t => t.status === 'done').length || 0
  const inprogress = tasks?.filter(t => t.status === 'inprogress').length || 0
  const overdue    = tasks?.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length || 0

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'งานทั้งหมด', value: total,      color: 'text-white' },
          { label: 'เสร็จแล้ว',  value: done,       color: 'text-green-400' },
          { label: 'กำลังทำ',   value: inprogress,  color: 'text-yellow-400' },
          { label: 'เกินกำหนด', value: overdue,     color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
            <p className="text-slate-400 text-sm mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      {/* เพิ่ม Chart Components ต่อได้เลย */}
    </div>
  )
}