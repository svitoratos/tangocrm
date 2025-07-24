"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { IconMail, IconEye, IconCheck, IconArchive, IconRefresh, IconFilter } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ContactSubmissionsAdmin() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: currentPage.toString(),
        limit: '10'
      });

      const response = await fetch(`/api/admin/contact-submissions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/contact-submissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        // Update the submission in the list
        setSubmissions(prev => 
          prev.map(sub => 
            sub.id === id ? { ...sub, status: status as any } : sub
          )
        );
      } else {
        console.error('Failed to update submission');
      }
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, currentPage]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Contact Submissions</h2>
          <p className="text-slate-600">Manage and respond to contact form submissions</p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <IconRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <IconFilter className="w-4 h-4 text-slate-600" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <IconMail className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No contact submissions found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {submissions.map((submission) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-800">{submission.name}</h3>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getStatusColor(submission.status)
                      )}>
                        {submission.status}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-1">{submission.email}</p>
                    {submission.company && (
                      <p className="text-slate-500 text-sm mb-2">{submission.company}</p>
                    )}
                    <p className="font-medium text-slate-800 mb-2">{submission.subject}</p>
                    <p className="text-slate-600 text-sm line-clamp-2">{submission.message}</p>
                    <p className="text-slate-400 text-xs mt-2">
                      {formatDate(submission.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <IconEye className="w-4 h-4" />
                    </button>
                    
                    {submission.status === 'new' && (
                      <button
                        onClick={() => updateSubmissionStatus(submission.id, 'read')}
                        className="p-2 text-slate-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <IconCheck className="w-4 h-4" />
                      </button>
                    )}
                    
                    {submission.status !== 'archived' && (
                      <button
                        onClick={() => updateSubmissionStatus(submission.id, 'archived')}
                        className="p-2 text-slate-600 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Archive"
                      >
                        <IconArchive className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-600">
            Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} submissions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-slate-600">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Contact Submission Details</h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Name</label>
                  <p className="text-slate-800">{selectedSubmission.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <p className="text-slate-800">{selectedSubmission.email}</p>
                </div>
                
                {selectedSubmission.company && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Company</label>
                    <p className="text-slate-800">{selectedSubmission.company}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Subject</label>
                  <p className="text-slate-800">{selectedSubmission.subject}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Message</label>
                  <p className="text-slate-800 whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getStatusColor(selectedSubmission.status)
                    )}>
                      {selectedSubmission.status}
                    </span>
                    <select
                      value={selectedSubmission.status}
                      onChange={(e) => updateSubmissionStatus(selectedSubmission.id, e.target.value)}
                      className="border border-slate-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Submitted</label>
                  <p className="text-slate-800">{formatDate(selectedSubmission.created_at)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-200">
                <a
                  href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg text-center hover:bg-emerald-700 transition-colors"
                >
                  Reply via Email
                </a>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 