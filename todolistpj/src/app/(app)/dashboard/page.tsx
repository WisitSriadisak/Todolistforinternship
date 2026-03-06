import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import StatsRow from '@/components/dashboard/StatsRow'
import ProgressCard from '@/components/dashboard/ProgressCard'
import CategoryBarChart from '@/components/dashboard/CategoryBarChart'
import StatusPieChart from '@/components/dashboard/StatusPieChart'
import OverdueList from '@/components/dashboard/OverdueList'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date, category_id, category:categories(id,name,color)')
    .eq('user_id', user!.id)

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, color')
    .eq('user_id', user!.id)

  const allTasks = (tasks || []) as any[]
  const allCategories = categories || []

  return (
    <>
      <Header title="Dashboard" userEmail={user?.email} />
      <div className="p-6 space-y-6">
        <StatsRow tasks={allTasks} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <ProgressCard tasks={allTasks} />
            <StatusPieChart tasks={allTasks} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <CategoryBarChart tasks={allTasks} categories={allCategories} />
            <OverdueList tasks={allTasks} />
          </div>
        </div>
      </div>
    </>
  )
}
