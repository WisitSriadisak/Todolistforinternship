'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskFilters, TaskInput, Profile } from '@/types'

export function useTasks(filters: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('tasks')
      .select(`*, category:categories(id,name,color), assignees:task_assignees(user_id, profile:profiles(id,email,display_name,friend_code))`)

    if (filters.status !== 'all')      query = query.eq('status', filters.status)
    if (filters.category_id !== 'all') query = query.eq('category_id', filters.category_id)
    if (filters.priority !== 'all')    query = query.eq('priority', filters.priority)
    if (filters.search)                query = query.ilike('title', `%${filters.search}%`)

    const order = filters.sortBy === 'priority'
      ? { column: 'priority', ascending: false }
      : { column: filters.sortBy, ascending: filters.sortBy === 'due_date' }

    const { data } = await query.order(order.column, { ascending: order.ascending })

    setTasks((data || []).map(t => ({
      ...t,
      assignees: (t.assignees || []).map((a: any) => a.profile).filter(Boolean) as Profile[]
    })))
    setLoading(false)
  }, [filters]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchTasks() }, [fetchTasks])

  async function createTask(input: TaskInput) {
    const { data: { user } } = await supabase.auth.getUser()
    const { assignee_ids = [], ...taskData } = input
    const { data: task } = await supabase.from('tasks')
      .insert({ ...taskData, user_id: user!.id }).select().single()
    if (task && assignee_ids.length > 0) {
      await supabase.from('task_assignees')
        .insert(assignee_ids.map(uid => ({ task_id: task.id, user_id: uid })))
    }
    fetchTasks()
  }

  async function updateTask(id: string, updates: Partial<TaskInput>) {
    const { assignee_ids, ...taskData } = updates
    if (Object.keys(taskData).length > 0) {
      await supabase.from('tasks').update(taskData).eq('id', id)
    }
    if (assignee_ids !== undefined) {
      await supabase.from('task_assignees').delete().eq('task_id', id)
      if (assignee_ids.length > 0)
        await supabase.from('task_assignees')
          .insert(assignee_ids.map(uid => ({ task_id: id, user_id: uid })))
    }
    fetchTasks()
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(ts => ts.filter(t => t.id !== id))
  }

  return { tasks, loading, createTask, updateTask, deleteTask, refetch: fetchTasks }
}
