'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTasks } from '@/lib/hooks/useTasks'
import { useCategories } from '@/lib/hooks/useCategories'
import TaskCard from '@/components/tasks/TaskCard'
import TaskFilter from '@/components/tasks/TaskFilter'
import TaskModal from '@/components/tasks/TaskModal'
import Header from '@/components/layout/Header'
import type { Task, TaskFilters } from '@/types'

const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  status: 'all',
  category_id: 'all',
  priority: 'all',
  sortBy: 'created_at',
}

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks(filters)
  const { categories } = useCategories()

  function openCreate() {
    setEditTask(null)
    setModalOpen(true)
  }

  function openEdit(task: Task) {
    setEditTask(task)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditTask(null)
  }

  return (
    <>
      <Header title="งานทั้งหมด" />
      <div className="p-6">
        {/* Filter + New button */}
        <div className="flex items-start gap-3 mb-5">
          <TaskFilter
            filters={filters}
            categories={categories}
            tasks={tasks}
            onChange={setFilters}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors shrink-0 h-[38px]"
          >
            <Plus size={16} />
            งานใหม่
          </button>
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#64748b]">
            <p className="text-lg font-medium">ไม่พบงาน</p>
            <p className="text-sm mt-1">ลองปรับ filter หรือกดปุ่ม &quot;งานใหม่&quot; เพื่อเพิ่มงาน</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEdit}
                onDelete={deleteTask}
                onStatusChange={(id, status) => updateTask(id, { status })}
              />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <TaskModal
          task={editTask}
          categories={categories}
          onSave={async (data) => {
            if (editTask) await updateTask(editTask.id, data)
            else await createTask(data)
            closeModal()
          }}
          onClose={closeModal}
        />
      )}
    </>
  )
}
