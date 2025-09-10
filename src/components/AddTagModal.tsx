'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface AddTagModalProps {
  isOpen: boolean
  onClose: () => void
  org: string
  project: string
  existingTags: string[]
  onTagAdded: () => void
}

export default function AddTagModal({ 
  isOpen, 
  onClose, 
  org, 
  project, 
  existingTags, 
  onTagAdded 
}: AddTagModalProps) {
  const [loading, setLoading] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  // Get all available tags
  const fetchAllTags = async () => {
    if (!isOpen) return
    
    setLoading(true)
    setError(null)
    
    try {
      const tags = await apiClient.getTags(org, project)
      setAllTags(Array.isArray(tags) ? tags : [])
    } catch (err) {
      setError('Failed to load available tags')
      console.error('Error fetching all tags:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllTags()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, org, project])

  // Filter out tags that haven't been added yet
  const availableTags = allTags.filter(tag => !existingTags.includes(tag))

  // Add new tag
  const handleAddTag = async (tag: string) => {
    setAdding(true)
    setError(null)
    
    try {
      await apiClient.addTag(org, project, tag)
      onTagAdded()
      onClose()
    } catch (err) {
      setError(`Failed to add tag: ${tag}`)
      console.error('Error adding tag:', err)
    } finally {
      setAdding(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200">
            <h3 className="text-lg font-semibold text-stone-900">
              Add New Version
            </h3>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="ml-4 text-stone-600">Loading available versions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchAllTags}
                  className="px-4 py-2 bg-stone-200 text-stone-800 rounded-md hover:bg-stone-300 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : availableTags.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-stone-600">No new versions available to add.</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-stone-600 mb-4">
                  Select a version to add to this library:
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      disabled={adding}
                      className="w-full text-left p-3 border border-stone-200 rounded-md hover:bg-stone-50 hover:border-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="font-medium text-stone-900">{tag}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-stone-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}