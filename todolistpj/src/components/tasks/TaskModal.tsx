'use client'
import { useState, useEffect } from 'react'
import { X, UserPlus, XCircle, Check } from 'lucide-react'
import { useFriends } from '@/lib/hooks/useFriends'
import type { Task, TaskStatus, TaskPriority, Category, TaskInput, Profile } from '@/types'

interface Props {
  task: Task | null
  categories: Category[]
  onSave: (data: TaskInput) => Promise<void>
  onClose: () => void
}

export default function TaskModal({ task, categories, onSave, onClose }: Props) {
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus]         = useState<TaskStatus>('todo')
  const [priority, setPriority]     = useState<TaskPriority>('medium')
  const [dueDate, setDueDate]       = useState('')
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])
  const [saving, setSaving]         = useState(false)

  const { friends } = useFriends()

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setCategoryId(task.category_id || '')
      setStatus(task.status)
      setPriority(task.priority)
      setDueDate(task.due_date ? task.due_date.slice(0, 10) : '')
      setAssigneeIds(task.assignees?.map(p => p.id) || [])
    } else {
      setTitle('')
      setDescription('')
      setCategoryId('')
      setStatus('todo')
      setPriority('medium')
      setDueDate('')
      setAssigneeIds([])
    }
  }, [task])

  function toggleAssignee(profileId: string) {
    setAssigneeIds(ids =>
      ids.includes(profileId) ? ids.filter(x => x !== profileId) : [...ids, profileId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await onSave({
      title:       title.trim(),
      description: description.trim() || null,
      category_id: categoryId || null,
      status,
      priority,
      due_date:    dueDate || null,
      assignee_ids: assigneeIds,
    })
    setSaving(false)
  }

  const inputClass =
    'w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#6366f1]'
  const selectClass = `${inputClass} bg-white`

  const selectedProfiles: Profile[] =
    friends.map(f => f.profile!).filter(p => p && assigneeIds.includes(p.id))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <h2 className="text-lg font-bold text-[#0f172a]">{task ? 'แก้ไขงาน' : 'งานใหม่'}</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#0f172a] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">
              ชื่องาน <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="ชื่องาน..."
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">คำอธิบาย</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="รายละเอียด..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">หมวดหมู่</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={selectClass}>
                <option value="">ไม่มีหมวดหมู่</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">สถานะ</label>
              <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className={selectClass}>
                <option value="todo">ยังไม่เริ่ม</option>
                <option value="inprogress">กำลังทำ</option>
                <option value="done">เสร็จแล้ว</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>
          </div>

          {/* Priority + DueDate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">ความสำคัญ</label>
              <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className={selectClass}>
                <option value="low">ต่ำ</option>
                <option value="medium">กลาง</option>
                <option value="high">สูง</option>
                <option value="urgent">ด่วน!</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">วันกำหนดส่ง</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Assignees — friend picker */}
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-2">
              <span className="flex items-center gap-1.5"><UserPlus size={14} /> ผู้รับผิดชอบ (เพื่อน)</span>
            </label>

            {friends.length === 0 ? (
              <p className="text-xs text-[#94a3b8] px-1">ยังไม่มีเพื่อน — ไปที่เมนู &quot;เพื่อน&quot; เพื่อเพิ่มเพื่อน</p>
            ) : (
              <div className="space-y-1 max-h-36 overflow-y-auto rounded-lg border border-[#e2e8f0] p-1">
                {friends.map(f => {
                  if (!f.profile) return null
                  const p = f.profile
                  const label = p.display_name || p.email.split('@')[0]
                  const selected = assigneeIds.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleAssignee(p.id)}
                      className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                        selected
                          ? 'bg-indigo-50 text-[#6366f1]'
                          : 'hover:bg-slate-50 text-[#334155]'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-full bg-[#6366f1] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {label[0].toUpperCase()}
                      </span>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium truncate">{label}</p>
                        <p className="text-xs text-[#94a3b8] truncate">{p.email}</p>
                      </div>
                      {selected && <Check size={15} className="text-[#6366f1] shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}

            {selectedProfiles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedProfiles.map(p => {
                  const label = p.display_name || p.email.split('@')[0]
                  return (
                    <span key={p.id} className="flex items-center gap-1 text-xs bg-indigo-50 text-[#6366f1] pl-1 pr-2 py-0.5 rounded-full">
                      <span className="w-4 h-4 rounded-full bg-[#6366f1] text-white flex items-center justify-center text-[9px] font-bold">
                        {label[0].toUpperCase()}
                      </span>
                      {label}
                      <button type="button" onClick={() => toggleAssignee(p.id)} className="hover:text-red-500 transition-colors ml-0.5">
                        <XCircle size={12} />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#0f172a] transition-colors">
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={saving || !title.trim()}
            className="px-5 py-2 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-60"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}
