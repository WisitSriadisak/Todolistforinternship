'use client'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

interface Task {
  status: string
}

interface Props {
  tasks: Task[]
}

export default function ProgressCard({ tasks }: Props) {
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const data = [{ name: 'progress', value: pct, fill: '#6366f1' }]

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-[#0f172a] mb-4">ความคืบหน้า</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={6}
                background={{ fill: '#f1f5f9' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-[#0f172a]">{pct}%</span>
          </div>
        </div>
        <div className="space-y-2 text-sm text-[#64748b]">
          <p>
            เสร็จแล้ว{' '}
            <span className="font-semibold text-[#0f172a]">{done}</span> จาก{' '}
            <span className="font-semibold text-[#0f172a]">{total}</span> งาน
          </p>
          <p>
            คงเหลือ{' '}
            <span className="font-semibold text-[#0f172a]">{total - done}</span> งาน
          </p>
        </div>
      </div>
    </div>
  )
}
