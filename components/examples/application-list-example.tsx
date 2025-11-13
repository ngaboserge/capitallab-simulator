'use client'

/**
 * Example component showing how to use the new Application Service
 * This demonstrates the integration between frontend and backend
 */

import { useApplications, useCreateApplication } from '@/lib/api/use-application'
import { useState } from 'react'

// Status labels and colors
const APPLICATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  IB_REVIEW: 'IB Review',
  QUERY_TO_ISSUER: 'Query to Issuer',
  UNDER_REVIEW: 'Under Review',
  CMA_REVIEW: 'CMA Review',
  QUERY_ISSUED: 'Query Issued',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn'
}

const APPLICATION_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  SUBMITTED: 'bg-purple-100 text-purple-800',
  IB_REVIEW: 'bg-indigo-100 text-indigo-800',
  QUERY_TO_ISSUER: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-orange-100 text-orange-800',
  CMA_REVIEW: 'bg-cyan-100 text-cyan-800',
  QUERY_ISSUED: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-gray-100 text-gray-800'
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function ApplicationListExample() {
  const { applications, loading, error, refetch } = useApplications()
  const { createApplication, loading: creating } = useCreateApplication()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [targetAmount, setTargetAmount] = useState('')

  const handleCreateApplication = async () => {
    const amount = parseFloat(targetAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid target amount')
      return
    }

    try {
      await createApplication({ target_amount: amount })
      setShowCreateForm(false)
      setTargetAmount('')
      refetch()
    } catch (err) {
      console.error('Failed to create application:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading applications...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={refetch}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">IPO Applications</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : 'New Application'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Create New Application</h3>
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Target Amount (SAR)"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleCreateApplication}
              disabled={creating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No applications found</p>
          <p className="text-sm text-gray-500 mt-1">Create your first IPO application to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      {(app as any).companies?.legal_name || 'Unknown Company'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status]}`}>
                      {APPLICATION_STATUS_LABELS[app.status]}
                    </span>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Application Number:</span>
                      <span className="ml-2 font-medium">{app.application_number || 'Not assigned'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Target Amount:</span>
                      <span className="ml-2 font-medium">
                        {app.target_amount ? formatCurrency(app.target_amount) : 'Not set'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Submission Date:</span>
                      <span className="ml-2 font-medium">
                        {app.submitted_at ? formatDate(app.submitted_at) : 'Not submitted'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">IB Advisor:</span>
                      <span className="ml-2 font-medium">
                        {(app as any).assigned_ib_advisor?.full_name || 'Not assigned'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${app.completion_percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {app.completion_percentage}%
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = `/cma-issuer-live?app=${app.id}`}
                  className="ml-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
