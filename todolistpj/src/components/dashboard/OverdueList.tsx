'use client'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { AlertTriangle } from 'lucide-react'

interface Task {
  id: string
  title: string
  due_date: string | null
  status: string
  category?: { name: string; color: string } | null
}

interface Props {
  tasks: Task[]
}

export default function OverdueList({ tasks }: Props) {
  const now = new Date()
  const overdue = tasks
    .filter((t) => t.due_date && new Date(t.due_date) < now && t.status !== 'done')
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5)

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-red-500" />
        <h3 className="font-semibold text-[#0f172a]">งานเกินกำหนด</h3>
      </div>

      {overdue.length === 0 ? (
        <p className="text-sm text-[#64748b] text-center py-4">ไม่มีงานเกินกำหนด</p>
      ) : (
        <div className="space-y-3">
          {overdue.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#0f172a] truncate">{t.title}</p>
                {t.category && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: t.category.color }}
                    />
                    <span className="text-xs text-[#64748b]">{t.category.name}</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-red-500 font-medium shrink-0">
                {format(new Date(t.due_date!), 'd MMM', { locale: th })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
