'use client'
import { Pencil, Trash2 } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'
import { th } from 'date-fns/locale'
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/constants'
import type { Task, TaskStatus, Profile } from '@/types'

const STATUSES: TaskStatus[] = ['todo', 'inprogress', 'done', 'cancelled']

interface Props {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}

function AssigneeAvatar({ profile }: { profile: Profile }) {
  const name = profile.display_name || profile.email
  const initial = name[0]?.toUpperCase() || '?'
  const colors = ['#6366f1','#ec4899','#14b8a6','#f59e0b','#8b5cf6','#10b981','#ef4444','#3b82f6']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <span
      title={name}
      className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: color }}
    >
      {initial}
    </span>
  )
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: Props) {
  const isOverdue =
    task.due_date &&
    isPast(new Date(task.due_date)) &&
    !isToday(new Date(task.due_date)) &&
    task.status !== 'done'
  const isDone = task.status === 'done'

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden ${
        isOverdue ? 'border-red-200' : 'border-[#e2e8f0]'
      }`}
    >
      {/* Card Body */}
      <div className="p-4 flex-1">
        {/* Top Row: badges + actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
              style={{ backgroundColor: STATUS_COLORS[task.status] }}
            >
              {STATUS_LABELS[task.status]}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
              style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
            >
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-[#94a3b8] hover:text-[#6366f1] transition-colors rounded"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-[#94a3b8] hover:text-red-500 transition-colors rounded"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className={`font-semibold text-sm leading-snug mb-1 ${
            isDone ? 'line-through text-[#94a3b8]' : 'text-[#0f172a]'
          }`}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p
            className={`text-xs leading-relaxed line-clamp-2 mb-2 ${
              isDone ? 'text-[#94a3b8]' : 'text-[#64748b]'
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Category */}
        {task.category && (
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: task.category.color }}
            />
            <span className="text-xs text-[#64748b]">{task.category.name}</span>
          </div>
        )}

        {/* Due date */}
        {task.due_date && (
          <p className={`text-xs mb-2 ${isOverdue ? 'text-red-500 font-medium' : 'text-[#64748b]'}`}>
            กำหนดส่ง: {format(new Date(task.due_date), 'd MMM yyyy', { locale: th })}
            {isOverdue && ' (เกินกำหนด)'}
          </p>
        )}

        {/* Assignees */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mt-1">
            {task.assignees.map((p) => (
              <div key={p.id} className="flex items-center gap-1 bg-indigo-50 rounded-full px-2 py-0.5">
                <AssigneeAvatar profile={p} />
                <span className="text-xs text-[#6366f1] leading-none">
                  {p.display_name || p.email.split('@')[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Switcher */}
      <div className="flex border-t border-[#e2e8f0]">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(task.id, s)}
            title={STATUS_LABELS[s]}
            className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
              task.status === s ? 'text-white' : 'text-[#94a3b8] hover:bg-slate-50'
            }`}
            style={task.status === s ? { backgroundColor: STATUS_COLORS[s] } : {}}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  )
}
