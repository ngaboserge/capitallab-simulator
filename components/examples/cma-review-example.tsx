'use client'

/**
 * Example component showing CMA review workflow
 * Demonstrates how CMA regulators can review and take actions on applications
 */

import { useApplication, useCMAReview, useComments, useAddComment } from '@/lib/api/use-cma-api'
import { 
  APPLICATION_STATUS_LABELS, 
  APPLICATION_STATUS_COLORS,
  RISK_RATINGS,
  formatDateTime 
} from '@/lib/api/cma-utils'
import { useState } from 'react'

interface CMAReviewExampleProps {
  applicationId: string
}

export function CMAReviewExample({ applicationId }: CMAReviewExampleProps) {
  const { application, loading, refetch } = useApplication(applicationId)
  const { startReview, issueQuery, approveApplication, rejectApplication, loading: actionLoading } = useCMAReview()
  const { comments, refetch: refetchComments } = useComments(applicationId)
  const { addComment } = useAddComment()

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewAction, setReviewAction] = useState<'query' | 'approve' | 'reject'>('query')
  const [reviewComment, setReviewComment] = useState('')
  const [riskRating, setRiskRating] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [complianceScore, setComplianceScore] = useState(75)
  const [newComment, setNewComment] = useState('')

  const handleStartReview = async () => {
    const success = await startReview(applicationId, 'Review started by CMA')
    if (success) {
      refetch()
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      alert('Please provide a comment')
      return
    }

    let success = false
    switch (reviewAction) {
      case 'query':
        success = await issueQuery(applicationId, reviewComment, riskRating, complianceScore)
        break
      case 'approve':
        success = await approveApplication(applicationId, reviewComment, riskRating, complianceScore)
        break
      case 'reject':
        success = await rejectApplication(applicationId, reviewComment, riskRating, complianceScore)
        break
    }

    if (success) {
      setShowReviewForm(false)
      setReviewComment('')
      refetch()
      refetchComments()
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    const comment = await addComment(applicationId, newComment, { isInternal: false })
    if (comment) {
      setNewComment('')
      refetchComments()
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading application...</div>
  }

  if (!application) {
    return <div className="p-8 text-center text-red-600">Application not found</div>
  }

  const canStartReview = application.status === 'SUBMITTED'
  const canTakeAction = ['SUBMITTED', 'UNDER_REVIEW', 'QUERY_ISSUED'].includes(application.status)

  return (
    <div className="space-y-6">
      {/* Application Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{application.companies?.legal_name}</h2>
            <p className="text-gray-600 mt-1">Application: {application.application_number}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${APPLICATION_STATUS_COLORS[application.status]}`}>
            {APPLICATION_STATUS_LABELS[application.status]}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Completion:</span>
            <span className="ml-2 font-medium">{application.completion_percentage}%</span>
          </div>
          <div>
            <span className="text-gray-600">IB Advisor:</span>
            <span className="ml-2 font-medium">
              {application.assigned_ib_advisor?.full_name || 'Not assigned'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">CMA Officer:</span>
            <span className="ml-2 font-medium">
              {application.assigned_cma_officer?.full_name || 'Not assigned'}
            </span>
          </div>
        </div>
      </div>

      {/* Review Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">CMA Review Actions</h3>

        {canStartReview && (
          <button
            onClick={handleStartReview}
            disabled={actionLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {actionLoading ? 'Starting...' : 'Start Review'}
          </button>
        )}

        {canTakeAction && !showReviewForm && (
          <div className="flex gap-3">
            <button
              onClick={() => { setReviewAction('query'); setShowReviewForm(true) }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Issue Query
            </button>
            <button
              onClick={() => { setReviewAction('approve'); setShowReviewForm(true) }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => { setReviewAction('reject'); setShowReviewForm(true) }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        )}

        {showReviewForm && (
          <div className="mt-4 space-y-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {reviewAction === 'query' && 'Query Details'}
                {reviewAction === 'approve' && 'Approval Comments'}
                {reviewAction === 'reject' && 'Rejection Reason'}
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter your comments..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Risk Rating</label>
                <select
                  value={riskRating}
                  onChange={(e) => setRiskRating(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="LOW">Low Risk</option>
                  <option value="MEDIUM">Medium Risk</option>
                  <option value="HIGH">High Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Compliance Score: {complianceScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={complianceScore}
                  onChange={(e) => setComplianceScore(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Comments & Communication</h3>

        <div className="space-y-4 mb-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{(comment as any).author?.full_name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {(comment as any).author?.role}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(comment.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-gray-700">{comment.content}</p>
                {comment.is_internal && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Internal
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Add a comment..."
          />
          <button
            onClick={handleAddComment}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Comment
          </button>
        </div>
      </div>
    </div>
  )
}
