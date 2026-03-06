'use client'
import { useState, useEffect } from 'react'
import { AtSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, isPast, isToday } from 'date-fns'
import { th } from 'date-fns/locale'
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/constants'
import Header from '@/components/layout/Header'
import type { Task } from '@/types'

export default function TaggedPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTaggedTasks() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Get task_ids where I'm an assignee
      const { data: assignments } = await supabase
        .from('task_assignees')
        .select('task_id')
        .eq('user_id', user.id)

      const taskIds = assignments?.map((a: any) => a.task_id) || []
      if (taskIds.length === 0) { setTasks([]); setLoading(false); return }

      const { data } = await supabase
        .from('tasks')
        .select('*, category:categories(id,name,color), assignees:task_assignees(user_id, profile:profiles(id,email,display_name,friend_code,created_at))')
        .in('id', taskIds)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })

      setTasks((data || []).map((t: any) => ({
        ...t,
        assignees: t.assignees?.map((a: any) => a.profile).filter(Boolean) || [],
      })))
      setLoading(false)
    }
    fetchTaggedTasks()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Header title="งานที่เพื่อนแท็กเรา" />
      <div className="p-6">
        <p className="text-sm text-[#64748b] mb-6">งานที่เพื่อนได้มอบหมายให้คุณ</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#64748b]">
            <AtSign size={40} className="mb-3 opacity-30" />
            <p className="text-lg font-medium">ยังไม่มีงานที่ถูกแท็ก</p>
            <p className="text-sm mt-1">เมื่อเพื่อนมอบหมายงานให้คุณ จะแสดงที่นี่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => {
              const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)) && task.status !== 'done'
              const isDone = task.status === 'done'
              return (
                <div key={task.id} className={"bg-white rounded-xl border shadow-sm p-4 " + (isOverdue ? "border-red-200" : "border-[#e2e8f0]")}>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: STATUS_COLORS[task.status] }}>
                      {STATUS_LABELS[task.status]}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                  </div>
                  {/* Title */}
                  <h3 className={"font-semibold text-sm leading-snug mb-1 " + (isDone ? "line-through text-[#94a3b8]" : "text-[#0f172a]")}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={"text-xs leading-relaxed line-clamp-2 mb-2 " + (isDone ? "text-[#94a3b8]" : "text-[#64748b]")}>
                      {task.description}
                    </p>
                  )}

                  {/* Category */}
                  {task.category && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: task.category.color }} />
                      <span className="text-xs text-[#64748b]">{task.category.name}</span>
                    </div>
                  )}

                  {/* Due date */}
                  {task.due_date && (
                    <p className={"text-xs " + (isOverdue ? "text-red-500 font-medium" : "text-[#64748b]")}>
                      กำหนดส่ง: {format(new Date(task.due_date), 'd MMM yyyy', { locale: th })}
                      {isOverdue && ' (เกินกำหนด)'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
