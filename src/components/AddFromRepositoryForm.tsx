'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

export default function AddFromRepositoryForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    repoUrl: '',
    accessToken: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await apiClient.createLibrary({
        repoUrl: formData.repoUrl,
        accessToken: formData.accessToken
      })
      setSuccess(true)
      setFormData({ repoUrl: '', accessToken: '' })
    } catch (err) {
      console.error('Error creating library:', err)
      if (err instanceof Error) {
        setError(`${err.message}`)
      } else {
        setError('Failed to create library. Please check your repository URL and access token.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-stone-900 mb-2">Library Added Successfully!</h3>
        <p className="text-stone-600 mb-4">Your library is being processed and will be available shortly.</p>
        <button
          onClick={() => setSuccess(false)}
          className="text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Add Another Library
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <div>
        <label htmlFor="repoUrl" className="block text-sm font-medium text-stone-700 mb-2">
          Repository URL
        </label>
        <input
          type="url"
          id="repoUrl"
          name="repoUrl"
          value={formData.repoUrl}
          onChange={handleInputChange}
          required
          className="block w-full min-w-0 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          style={{ width: '500px', minWidth: '500px' }}
        />
        <p className="mt-1 text-xs text-stone-500">
          GitLab repository URL
        </p>
      </div>

      <div>
        <label htmlFor="accessToken" className="block text-sm font-medium text-stone-700 mb-2">
          Access Token
        </label>
        <input
          type="text"
          id="accessToken"
          name="accessToken"
          value={formData.accessToken}
          onChange={handleInputChange}
          required
          className="block w-full min-w-0 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          style={{ width: '500px', minWidth: '500px' }}
        />
        <p className="mt-1 text-xs text-stone-500">
          GitLab access token with read permissions
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !formData.repoUrl || !formData.accessToken}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Creating Library...
          </div>
        ) : (
          'Create Library'
        )}
      </button>
    </form>
    </div>
  )
}