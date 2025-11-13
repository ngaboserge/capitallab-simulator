'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useFeedbackLocalStorage, FeedbackItem } from '@/lib/api/use-feedback-localstorage';
import { useSimpleAuth } from '@/lib/auth/simple-auth-context';
import { FeedbackDocumentUpload } from './feedback-document-upload';
import { MessageSquare, Send, CheckCircle, Clock, AlertCircle, Upload } from 'lucide-react';
import { useEffect } from 'react';

interface FeedbackCommunicationProps {
  applicationId: string;
  isIBAdvisor?: boolean;
}

export function FeedbackCommunication({ applicationId, isIBAdvisor = false }: FeedbackCommunicationProps) {
  const { profile } = useSimpleAuth();
  const { feedback, loading, updateFeedback, addComment, getComments, refresh } = useFeedbackLocalStorage(
    applicationId,
    profile?.id,
    profile?.full_name || profile?.username,
    profile?.role
  );
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [expandedUpload, setExpandedUpload] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState('');
  const [newResponse, setNewResponse] = useState<Record<string, string>>({});
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Auto-refresh every 10 seconds for IB Advisors to see issuer updates
  useEffect(() => {
    if (isIBAdvisor) {
      const interval = setInterval(() => {
        refresh();
        setLastRefresh(new Date());
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isIBAdvisor, refresh]);

  const loadComments = async (feedbackId: string) => {
    if (expandedFeedback === feedbackId) {
      setExpandedFeedback(null);
      return;
    }

    try {
      const feedbackComments = await getComments(feedbackId);
      setComments(prev => ({ ...prev, [feedbackId]: feedbackComments }));
      setExpandedFeedback(feedbackId);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async (feedbackId: string) => {
    if (!newComment.trim()) return;

    try {
      await addComment(feedbackId, newComment);
      setNewComment('');
      await loadComments(feedbackId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateStatus = async (feedbackId: string, status: 'IN_PROGRESS' | 'RESOLVED') => {
    try {
      const response = newResponse[feedbackId];
      await updateFeedback(feedbackId, { status, response });
      setNewResponse(prev => ({ ...prev, [feedbackId]: '' }));
      await refresh();
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED': return <CheckCircle className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4" />;
      case 'PENDING': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading feedback...</p>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = feedback.filter(f => f.status === 'PENDING').length;
  const inProgressCount = feedback.filter(f => f.status === 'IN_PROGRESS').length;
  const resolvedCount = feedback.filter(f => f.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold text-orange-900">Pending</h3>
            <p className="text-2xl font-bold text-orange-700">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-900">In Progress</h3>
            <p className="text-2xl font-bold text-blue-700">{inProgressCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-900">Resolved</h3>
            <p className="text-2xl font-bold text-green-700">{resolvedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span>Feedback Items ({feedback.length})</span>
              {!isIBAdvisor && pendingCount > 0 && (
                <Badge className="bg-orange-100 text-orange-800">
                  {pendingCount} items need attention
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {isIBAdvisor && (
                <span className="text-xs text-gray-500">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refresh();
                  setLastRefresh(new Date());
                }}
              >
                <Clock className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No feedback items yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <Card
                  key={item.id}
                  className={`${
                    item.status === 'RESOLVED' 
                      ? 'bg-green-50 border-green-300 shadow-sm' 
                      : item.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 border-blue-300 shadow-md'
                      : 'bg-white border-orange-300 shadow-lg'
                  } transition-all hover:shadow-xl`}
                >
                  <CardContent className="p-6">
                    {/* Feedback Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge variant="outline" className="font-semibold text-sm px-3 py-1">
                            📁 {item.category}
                          </Badge>
                          <Badge className={`${getPriorityColor(item.priority)} font-semibold px-3 py-1`}>
                            {item.priority === 'HIGH' ? '🔴' : item.priority === 'MEDIUM' ? '🟡' : '🟢'} {item.priority}
                          </Badge>
                          <Badge className={`${getStatusColor(item.status || 'PENDING')} font-semibold px-3 py-1`}>
                            {getStatusIcon(item.status || 'PENDING')}
                            <span className="ml-1">{(item.status || 'PENDING').replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <div className="bg-white bg-opacity-50 p-4 rounded-lg border border-gray-200 mb-3">
                          <p className="text-sm font-semibold text-gray-500 mb-1">
                            {isIBAdvisor ? 'Your Feedback:' : 'IB Advisor Feedback:'}
                          </p>
                          <p className="text-base text-gray-900 leading-relaxed">{item.issue}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(item.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="flex items-center">
                            👤 {item.creator?.full_name || 'IB Advisor'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Responses */}
                    {(item.issuer_response || item.ib_response) && (
                      <div className="mt-4 space-y-3">
                        {item.issuer_response && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="p-1 bg-blue-200 rounded">
                                <MessageSquare className="h-4 w-4 text-blue-700" />
                              </div>
                              <p className="text-sm font-semibold text-blue-900">
                                {isIBAdvisor ? 'Issuer Response:' : 'Your Response:'}
                              </p>
                            </div>
                            <p className="text-sm text-blue-900 leading-relaxed">{item.issuer_response}</p>
                          </div>
                        )}
                        {item.ib_response && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="p-1 bg-green-200 rounded">
                                <CheckCircle className="h-4 w-4 text-green-700" />
                              </div>
                              <p className="text-sm font-semibold text-green-900">
                                {isIBAdvisor ? 'Your Response:' : 'IB Advisor Response:'}
                              </p>
                            </div>
                            <p className="text-sm text-green-900 leading-relaxed">{item.ib_response}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Response Input for Issuer */}
                    {!isIBAdvisor && item.status !== 'RESOLVED' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          💬 Your Response to IB Advisor:
                        </label>
                        <Textarea
                          value={newResponse[item.id] || ''}
                          onChange={(e) => setNewResponse(prev => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="Explain what actions you've taken or will take to address this feedback..."
                          rows={3}
                          className="text-sm border-2 border-gray-300 focus:border-blue-500"
                        />
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-gray-500">
                            💡 Tip: Be specific about what you've done or plan to do
                          </p>
                          {newResponse[item.id]?.trim() && (
                            <Button
                              size="sm"
                              onClick={() => {
                                handleUpdateStatus(item.id, item.status === 'PENDING' ? 'IN_PROGRESS' : item.status as any);
                              }}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send Response
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadComments(item.id)}
                          className="border-2"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {expandedFeedback === item.id ? 'Hide' : 'Show'} Discussion
                        </Button>

                        <div className="flex items-center space-x-2">
                          {!isIBAdvisor && item.status === 'PENDING' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(item.id, 'IN_PROGRESS')}
                              className="bg-blue-600 hover:bg-blue-700 px-6"
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Start Working
                            </Button>
                          )}

                          {!isIBAdvisor && item.status === 'IN_PROGRESS' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                              className="bg-green-600 hover:bg-green-700 px-6"
                              disabled={!newResponse[item.id]?.trim()}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Resolved
                            </Button>
                          )}

                          {item.status === 'RESOLVED' && (
                            <Badge className="bg-green-600 text-white px-4 py-2">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              ✅ Completed
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Document Upload Section for Issuer */}
                      {!isIBAdvisor && item.status !== 'RESOLVED' && (
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedUpload(expandedUpload === item.id ? null : item.id)}
                            className="w-full border-2 border-blue-300 hover:bg-blue-50"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {expandedUpload === item.id ? 'Hide' : 'Show'} Document Upload
                          </Button>

                          {expandedUpload === item.id && (
                            <div className="animate-fade-in">
                              <FeedbackDocumentUpload
                                feedbackId={item.id}
                                category={item.category}
                                onUploadComplete={async (files) => {
                                  const fileNames = files.map(f => f.name).join(', ');
                                  const message = `📎 Uploaded ${files.length} document(s) for ${item.category}: ${fileNames}`;
                                  await addComment(item.id, message);
                                  alert('✅ Documents uploaded and IB Advisor has been notified!');
                                }}
                              />
                            </div>
                          )}

                          {/* Quick Notify Button */}
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="p-2 bg-blue-100 rounded">
                                  <Send className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-blue-900">
                                    Made changes or updates?
                                  </p>
                                  <p className="text-xs text-blue-700">
                                    Notify your IB Advisor to review
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={async () => {
                                  const message = `✅ Updates completed for: ${item.category}. Please review the changes.`;
                                  await addComment(item.id, message);
                                  alert('✅ IB Advisor has been notified!');
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Notify IB Advisor
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Comments Thread */}
                    {expandedFeedback === item.id && (
                      <div className="mt-4 pt-4 border-t-2 border-gray-200 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-lg">
                        <div className="flex items-center space-x-2 mb-4">
                          <MessageSquare className="h-5 w-5 text-gray-600" />
                          <h4 className="text-base font-semibold text-gray-900">Discussion Thread</h4>
                          {comments[item.id] && comments[item.id].length > 0 && (
                            <Badge variant="outline" className="ml-2">
                              {comments[item.id].length} {comments[item.id].length === 1 ? 'message' : 'messages'}
                            </Badge>
                          )}
                        </div>
                        
                        {comments[item.id] && comments[item.id].length > 0 ? (
                          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                            {comments[item.id].map((comment) => (
                              <div
                                key={comment.id}
                                className={`p-4 rounded-lg shadow-sm ${
                                  comment.author?.role === 'IB_ADVISOR'
                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 ml-8'
                                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 mr-8'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <div className={`p-1 rounded ${
                                      comment.author?.role === 'IB_ADVISOR' ? 'bg-green-200' : 'bg-blue-200'
                                    }`}>
                                      {comment.author?.role === 'IB_ADVISOR' ? '🏦' : '🏢'}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                      {comment.author?.full_name}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {comment.author?.role === 'IB_ADVISOR' ? 'IB Advisor' : 'Issuer'}
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 mb-4">
                            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No messages yet. Start the conversation!</p>
                          </div>
                        )}

                        {/* Add Comment */}
                        <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            💬 Add a message:
                          </label>
                          <div className="flex space-x-2">
                            <Textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Ask a question or provide an update..."
                              rows={2}
                              className="text-sm border-2 border-gray-300 focus:border-blue-500"
                            />
                            <Button
                              onClick={() => handleAddComment(item.id)}
                              disabled={!newComment.trim()}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 px-4"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
