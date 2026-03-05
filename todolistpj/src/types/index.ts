export type TaskStatus   = 'todo' | 'inprogress' | 'done' | 'cancelled'
export type TaskPriority = 'low'  | 'medium'      | 'high' | 'urgent'

export interface Category {
  id: string; user_id: string; name: string; color: string; created_at: string
}

export interface Task {
  id: string
  user_id: string
  category_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  created_at: string
  updated_at: string
  category?: Category
  assignees?: string[]
}

export interface TaskFilters {
  search: string
  status: TaskStatus | 'all'
  category_id: string | 'all'
  priority: TaskPriority | 'all'
  sortBy: 'created_at' | 'due_date' | 'priority'
}