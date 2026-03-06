'use client'
import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import type { Task, TaskFilters, Category } from '@/types'

const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  status: 'all',
  category_id: 'all',
  priority: 'all',
  sortBy: 'created_at',
}

interface Props {
  filters: TaskFilters
  categories: Category[]
  tasks: Task[]
  onChange: (f: TaskFilters) => void
}

export default function TaskFilter({ filters, categories, tasks, onChange }: Props) {
  const [searchVal, setSearchVal] = useState(filters.search)

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchVal !== filters.search) {
        onChange({ ...filters, search: searchVal })
      }
    }, 300)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchVal])

  const hasFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.category_id !== 'all' ||
    filters.priority !== 'all' ||
    filters.sortBy !== 'created_at'

  const now = new Date()
  const overdue = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < now && t.status !== 'done'
  ).length
  const inprogress = tasks.filter((t) => t.status === 'inprogress').length

  function reset() {
    setSearchVal('')
    onChange(DEFAULT_FILTERS)
  }

  const selectClass =
    'h-[38px] px-3 border border-[#e2e8f0] rounded-lg text-sm text-[#334155] bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]'

  return (
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
          />
          <input
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="ค้นหางาน..."
            className="h-[38px] pl-8 pr-3 border border-[#e2e8f0] rounded-lg text-sm text-[#334155] bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] w-44"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as any })}
          className={selectClass}
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="todo">ยังไม่เริ่ม</option>
          <option value="inprogress">กำลังทำ</option>
          <option value="done">เสร็จแล้ว</option>
          <option value="cancelled">ยกเลิก</option>
        </select>

        {/* Category */}
        <select
          value={filters.category_id}
          onChange={(e) => onChange({ ...filters, category_id: e.target.value })}
          className={selectClass}
        >
          <option value="all">หมวดหมู่ทั้งหมด</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          value={filters.priority}
          onChange={(e) => onChange({ ...filters, priority: e.target.value as any })}
          className={selectClass}
        >
          <option value="all">ความสำคัญทั้งหมด</option>
          <option value="low">ต่ำ</option>
          <option value="medium">กลาง</option>
          <option value="high">สูง</option>
          <option value="urgent">ด่วน!</option>
        </select>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
          className={selectClass}
        >
          <option value="created_at">ล่าสุด</option>
          <option value="due_date">กำหนดส่ง</option>
          <option value="priority">ความสำคัญ</option>
        </select>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={reset}
            className="flex items-center gap-1 h-[38px] px-3 text-sm text-[#64748b] border border-[#e2e8f0] rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X size={14} /> รีเซ็ต
          </button>
        )}
      </div>

      {/* Stat bar */}
      <p className="text-xs text-[#64748b] mt-2">
        ทั้งหมด {tasks.length} รายการ · กำลังทำ {inprogress} · เกินกำหนด {overdue}
      </p>
    </div>
  )
}
