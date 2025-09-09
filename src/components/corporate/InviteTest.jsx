// src/components/corporate/InviteTest.jsx
import { useState } from 'react'
import { useCorporateStore } from '@/store/corporateStore'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import toast from 'react-hot-toast'

export default function InviteTest() {
  const { inviteEmployee, loading, error } = useCorporateStore()
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testRole, setTestRole] = useState('employee')
  const [testMessage, setTestMessage] = useState('Test invitation message')

  const handleTestInvite = async () => {
    try {
      await inviteEmployee(testEmail, testRole, null, testMessage)
      toast.success('Test invitation sent successfully!')
    } catch (error) {
      toast.error('Test invitation failed: ' + error.message)
    }
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Test Invitation System</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Email</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Test Role</label>
          <select
            value={testRole}
            onChange={(e) => setTestRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Test Message</label>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            rows="3"
          />
        </div>
        
        <Button 
          onClick={handleTestInvite}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Test Invitation'}
        </Button>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
            Error: {error}
          </div>
        )}
      </div>
    </Card>
  )
}
