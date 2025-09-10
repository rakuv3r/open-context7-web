'use client'

import { useState, useEffect, useCallback } from 'react'
import LibraryTableRow from './LibraryTableRow'
import { apiClient, type Library } from '@/lib/api'

export default function LibraryGrid() {
  const [libraries, setLibraries] = useState<Library[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    let isMounted = true
    
    const fetchLibraries = async () => {
      try {
        if (!isMounted) return
        setSearching(true)
        
        const response = await apiClient.searchLibraries({ 
          query: debouncedQuery || undefined,
          limit: 10 
        })
        
        if (!isMounted) return
        setLibraries(response.results)
      } catch (err) {
        if (!isMounted) return
        setError('Failed to load libraries')
        console.error('Error fetching libraries:', err)
        // Show demo data as fallback when API fails
        setLibraries([
          {
            id: 'react/react',
            title: 'React',
            description: 'A JavaScript library for building user interfaces',
            totalTokens: 125000,
            lastUpdateDate: '2025-01-08',
            state: 'finalized',
            branch: 'main',
            versions: ['18.3.0', '18.2.0', '17.0.2']
          },
          {
            id: 'vercel/next.js',
            title: 'Next.js',
            description: 'The React Framework for Production',
            totalTokens: 89000,
            lastUpdateDate: '2025-01-07',
            state: 'finalized',
            branch: 'main',
            versions: ['14.2.0', '14.1.0', '13.5.6']
          },
          {
            id: 'tailwindlabs/tailwindcss',
            title: 'Tailwind CSS',
            description: 'Rapidly build modern websites without ever leaving your HTML',
            totalTokens: 67000,
            lastUpdateDate: '2025-01-06',
            state: 'processing',
            branch: 'main',
            versions: ['3.4.0', '3.3.0']
          }
        ])
      } finally {
        if (isMounted) {
          setLoading(false)
          setSearching(false)
        }
      }
    }

    fetchLibraries()
    
    return () => {
      isMounted = false
    }
  }, [debouncedQuery])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading libraries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        {/* Search Box */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search libraries..."
              className={`w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${searching ? 'bg-stone-50' : ''}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={searching}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {searching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
              ) : (
                <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
          </div>
        </div>
        
        {error && (
          <p className="text-sm text-stone-600 mt-1">
            Showing demo data - API connection failed
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Tokens
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {libraries.map((library) => (
              <LibraryTableRow key={library.id} library={library} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}