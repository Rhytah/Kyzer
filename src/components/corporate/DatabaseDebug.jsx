// src/components/corporate/DatabaseDebug.jsx
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Database, AlertCircle, CheckCircle } from 'lucide-react'

export default function DatabaseDebug() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const testOrganizationMembers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Test 1: Check if organization_members table exists
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'organization_members')
        .eq('table_schema', 'public')

      if (tableError) {
        throw new Error(`Table check failed: ${tableError.message}`)
      }

      // Test 2: Try to query organization_members with minimal fields
      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select('id, user_id, role, status')
        .limit(5)

      if (membersError) {
        throw new Error(`Query failed: ${membersError.message}`)
      }

      // Test 3: Check if organizations table exists
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name, domain')
        .limit(5)

      if (orgsError) {
        throw new Error(`Organizations query failed: ${orgsError.message}`)
      }

      setResults({
        tableExists: tableInfo?.length > 0,
        membersCount: members?.length || 0,
        membersData: members,
        orgsCount: orgs?.length || 0,
        orgsData: orgs
      })

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testProfilesTable = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .limit(5)

      if (error) {
        throw new Error(`Profiles query failed: ${error.message}`)
      }

      setResults(prev => ({
        ...prev,
        profilesCount: profiles?.length || 0,
        profilesData: profiles
      }))

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-primary-default" />
        <h3 className="text-lg font-semibold text-text-dark">Database Debug</h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <Button 
            onClick={testOrganizationMembers}
            disabled={loading}
          >
            Test Organization Members
          </Button>
          <Button 
            onClick={testProfilesTable}
            disabled={loading}
            variant="secondary"
          >
            Test Profiles Table
          </Button>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-text-light">
            <div className="animate-spin w-4 h-4 border-2 border-primary-default border-t-transparent rounded-full"></div>
            Testing database connection...
          </div>
        )}

        {error && (
          <div className="p-3 bg-error-light border border-error-default rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-error-default" />
              <span className="text-error-default font-medium">Error:</span>
            </div>
            <p className="text-error-default text-sm mt-1">{error}</p>
          </div>
        )}

        {results && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-default" />
              <span className="text-success-default font-medium">Database Test Results:</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Organization Members Table:</strong> {results.tableExists ? '✅ Exists' : '❌ Not Found'}</p>
                <p><strong>Members Count:</strong> {results.membersCount}</p>
                {results.membersData && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-primary-default">View Members Data</summary>
                    <pre className="mt-2 p-2 bg-background-light rounded text-xs overflow-auto">
                      {JSON.stringify(results.membersData, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
              
              <div>
                <p><strong>Organizations Count:</strong> {results.orgsCount}</p>
                {results.orgsData && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-primary-default">View Organizations Data</summary>
                    <pre className="mt-2 p-2 bg-background-light rounded text-xs overflow-auto">
                      {JSON.stringify(results.orgsData, null, 2)}
                    </pre>
                  </details>
                )}
              </div>

              {results.profilesCount !== undefined && (
                <div>
                  <p><strong>Profiles Count:</strong> {results.profilesCount}</p>
                  {results.profilesData && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-primary-default">View Profiles Data</summary>
                      <pre className="mt-2 p-2 bg-background-light rounded text-xs overflow-auto">
                        {JSON.stringify(results.profilesData, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
