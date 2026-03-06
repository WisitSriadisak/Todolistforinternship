export type TaskStatus   = 'todo' | 'inprogress' | 'done' | 'cancelled'
export type TaskPriority = 'low'  | 'medium'      | 'high' | 'urgent'

export interface Category {
  id: string; user_id: string; name: string; color: string; created_at: string
}

export interface Profile {
  id: string
  email: string
  display_name: string | null
  friend_code: string
  created_at: string
}

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected'

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
  profile?: Profile
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
  assignees?: Profile[]
}

export interface TaskFilters {
  search: string
  status: TaskStatus | 'all'
  category_id: string | 'all'
  priority: TaskPriority | 'all'
  sortBy: 'created_at' | 'due_date' | 'priority'
}
