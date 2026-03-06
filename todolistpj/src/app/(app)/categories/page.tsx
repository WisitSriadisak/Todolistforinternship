'use client'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCategories } from '@/lib/hooks/useCategories'
import { CATEGORY_PRESET_COLORS } from '@/lib/constants'
import Header from '@/components/layout/Header'
import type { Category } from '@/types'

interface CategoryCounts {
  [id: string]: number
}

export default function CategoriesPage() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories()
  const [counts, setCounts] = useState<CategoryCounts>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState(CATEGORY_PRESET_COLORS[0])
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchCounts() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('tasks')
        .select('category_id')
        .eq('user_id', user.id)
      const map: CategoryCounts = {}
      data?.forEach((t) => {
        if (t.category_id) map[t.category_id] = (map[t.category_id] || 0) + 1
      })
      setCounts(map)
    }
    fetchCounts()
  }, [categories]) // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditCat(null)
    setName('')
    setColor(CATEGORY_PRESET_COLORS[0])
    setModalOpen(true)
  }

  function openEdit(c: Category) {
    setEditCat(c)
    setName(c.name)
    setColor(c.color)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditCat(null)
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    if (editCat) await updateCategory(editCat.id, name.trim(), color)
    else await createCategory(name.trim(), color)
    setSaving(false)
    closeModal()
  }

  return (
    <>
      <Header title="หมวดหมู่" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#64748b]">จัดการหมวดหมู่งานของคุณ</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <Plus size={16} /> หมวดหมู่ใหม่
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#64748b]">
            <p className="text-lg font-medium">ยังไม่มีหมวดหมู่</p>
            <p className="text-sm mt-1">กดปุ่มด้านบนเพื่อเพิ่มหมวดหมู่ใหม่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex items-center gap-4"
              >
                <div
                  className="w-10 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0f172a] truncate">{c.name}</p>
                  <p className="text-xs text-[#64748b]">{counts[c.id] || 0} งาน</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-1.5 text-[#94a3b8] hover:text-[#6366f1] rounded transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="p-1.5 text-[#94a3b8] hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-lg font-bold text-[#0f172a]">
                {editCat ? 'แก้ไขหมวดหมู่' : 'หมวดหมู่ใหม่'}
              </h2>
              <button
                onClick={closeModal}
                className="text-[#94a3b8] hover:text-[#0f172a] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">
                  ชื่อหมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ชื่อหมวดหมู่..."
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-lg text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave()
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#334155] mb-2">สี</label>
                {/* Preview */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-[#64748b]">{name || 'ตัวอย่าง'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        color === c
                          ? 'ring-2 ring-offset-2 ring-[#6366f1] scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="px-5 py-2 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-60"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
