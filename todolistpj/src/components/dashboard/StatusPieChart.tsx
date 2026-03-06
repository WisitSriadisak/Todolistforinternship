'use client'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants'

interface Task {
  status: string
}

interface Props {
  tasks: Task[]
}

export default function StatusPieChart({ tasks }: Props) {
  const data = (Object.keys(STATUS_LABELS) as Array<keyof typeof STATUS_LABELS>)
    .map((key) => ({
      name: STATUS_LABELS[key],
      value: tasks.filter((t) => t.status === key).length,
      color: STATUS_COLORS[key],
    }))
    .filter((d) => d.value > 0)

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-[#0f172a] mb-4">สัดส่วนสถานะ</h3>
      {data.length === 0 ? (
        <p className="text-sm text-[#64748b] text-center py-8">ยังไม่มีข้อมูล</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={75}
              labelLine={false}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: number, name: string) => [`${v} งาน`, name]}
              contentStyle={{ fontFamily: 'Kanit', fontSize: 12, borderRadius: 8 }}
            />
            <Legend
              iconType="circle"
              formatter={(value) => (
                <span style={{ fontFamily: 'Kanit', fontSize: 12 }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
