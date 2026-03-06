'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Task {
  category_id: string | null
}

interface Category {
  id: string
  name: string
  color: string
}

interface Props {
  tasks: Task[]
  categories: Category[]
}

export default function CategoryBarChart({ tasks, categories }: Props) {
  const data = categories
    .map((c) => ({
      name: c.name,
      count: tasks.filter((t) => t.category_id === c.id).length,
      color: c.color,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-[#0f172a] mb-4">งานตามหมวดหมู่</h3>
      {data.length === 0 ? (
        <p className="text-sm text-[#64748b] text-center py-8">ยังไม่มีข้อมูล</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 44)}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontFamily: 'Kanit', fontSize: 12 }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={96}
              tick={{ fontFamily: 'Kanit', fontSize: 12 }}
            />
            <Tooltip
              formatter={(v: number) => [`${v} งาน`, 'จำนวน']}
              contentStyle={{ fontFamily: 'Kanit', fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
