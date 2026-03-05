'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskFilters } from '@/types'

export function useTasks(filters: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('tasks')
      .select(`*, category:categories(id,name,color), assignees:task_assignees(user_tag)`)

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
      assignees: t.assignees?.map((a: any) => a.user_tag) || []
    })))
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  async function createTask(input: Partial<Task> & { assignees?: string[] }) {
    const { data: { user } } = await supabase.auth.getUser()
    const { assignees = [], ...taskData } = input
    const { data: task } = await supabase.from('tasks')
      .insert({ ...taskData, user_id: user!.id }).select().single()
    if (task && assignees.length > 0) {
      await supabase.from('task_assignees').insert(assignees.map(u => ({ task_id: task.id, user_tag: u })))
    }
    fetchTasks()
  }

  async function updateTask(id: string, updates: Partial<Task> & { assignees?: string[] }) {
    const { assignees, ...taskData } = updates
    await supabase.from('tasks').update(taskData).eq('id', id)
    if (assignees !== undefined) {
      await supabase.from('task_assignees').delete().eq('task_id', id)
      if (assignees.length > 0)
        await supabase.from('task_assignees').insert(assignees.map(u => ({ task_id: id, user_tag: u })))
    }
    fetchTasks()
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(ts => ts.filter(t => t.id !== id))
  }

  return { tasks, loading, createTask, updateTask, deleteTask, refetch: fetchTasks }
}