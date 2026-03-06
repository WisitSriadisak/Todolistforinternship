'use client'
import { CheckCircle2, Clock, AlertCircle, ListTodo, Circle } from 'lucide-react'

interface Task {
  status: string
  due_date: string | null
}

interface Props {
  tasks: Task[]
}

export default function StatsRow({ tasks }: Props) {
  const now = new Date()

  const stats = [
    {
      label: 'งานทั้งหมด',
      value: tasks.length,
      icon: ListTodo,
      color: '#6366f1',
      bg: '#eef2ff',
    },
    {
      label: 'เสร็จแล้ว',
      value: tasks.filter((t) => t.status === 'done').length,
      icon: CheckCircle2,
      color: '#22c55e',
      bg: '#f0fdf4',
    },
    {
      label: 'กำลังทำ',
      value: tasks.filter((t) => t.status === 'inprogress').length,
      icon: Clock,
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      label: 'รอเริ่ม',
      value: tasks.filter((t) => t.status === 'todo').length,
      icon: Circle,
      color: '#94a3b8',
      bg: '#f8fafc',
    },
    {
      label: 'เกินกำหนด',
      value: tasks.filter(
        (t) => t.due_date && new Date(t.due_date) < now && t.status !== 'done'
      ).length,
      icon: AlertCircle,
      color: '#ef4444',
      bg: '#fef2f2',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: s.bg }}
          >
            <s.icon size={18} color={s.color} />
          </div>
          <p className="text-2xl font-bold text-[#0f172a]">{s.value}</p>
          <p className="text-xs text-[#64748b] mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
