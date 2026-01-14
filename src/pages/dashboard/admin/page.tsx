import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { api } from '@/lib/axios'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const user = useAppSelector((s) => s.auth.user)
  const refreshToken = useAppSelector((s) => s.auth.refreshToken)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } catch (err) {
      console.error('Logout API error:', err)
    } finally {
      dispatch(logout())
      navigate('/login', { replace: true })
      toast.success('Logged out successfully')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">School Administration</h1>
          <p className="text-blue-700 mb-6">Manage school operations and resources</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">Administrative Tools</h2>
              <ul className="text-blue-700 space-y-2">
                <li>✓ Staff Management</li>
                <li>✓ Student Management</li>
                <li>✓ Course Management</li>
                <li>✓ Reports & Analytics</li>
              </ul>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">User Information</h2>
              <div className="text-blue-700 space-y-2">
                <p><strong>Name:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>ID:</strong> {user?.userId}</p>
                <p><strong>Roles:</strong> {user?.roles.join(', ')}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-900">
            <p className="font-semibold">Welcome to Admin Dashboard</p>
            <p className="text-sm mt-2">You can manage school operations, staff, and students.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
