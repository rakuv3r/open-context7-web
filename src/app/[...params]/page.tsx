'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AddTagModal from '@/components/AddTagModal'
import { apiClient } from '@/lib/api'

interface FiltersState {
  topic: string
  tokens: number
  tag: string
}

interface LibraryMeta {
  title?: string
  description?: string
  repoUrl?: string
  state?: 'finalized' | 'processing' | 'failed'
  libraryType?: string
  tags?: string[] | Record<string, any>
  [key: string]: any
}

export default function LibraryDetailPage() {
  const params = useParams()
  const [org, project, tag] = params.params as string[]
  
  const [filters, setFilters] = useState<FiltersState>({
    topic: '',
    tokens: 10000,
    tag: tag || 'latest'
  })
  const [documents, setDocuments] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [libraryInfo, setLibraryInfo] = useState<LibraryMeta | null>(null)
  const [copied, setCopied] = useState(false)
  const [showAddTagModal, setShowAddTagModal] = useState(false)
  const [rebuildStatus, setRebuildStatus] = useState<string | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(documents)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleTagAdded = async () => {
    try {
      const meta = await apiClient.getLibraryMeta(org, project)
      setLibraryInfo(meta)
    } catch (err) {
      console.error('Failed to reload library meta:', err)
    }
  }

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const meta = await apiClient.getLibraryMeta(org, project)
        setLibraryInfo(meta)
      } catch (err) {
        console.error('Failed to load library meta:', err)
        setLibraryInfo(null)
      }
    }
    
    if (org && project) {
      loadMeta()
    }
  }, [org, project])

  const handleSearch = async () => {
    if (!org || !project) return
    
    setLoading(true)
    setError(null)

    try {
      const result = await apiClient.queryLibrary(org, project, {
        topic: filters.topic || 'comprehensive documentation overview',
        tokens: filters.tokens
      }, filters.tag === 'latest' ? undefined : filters.tag)
      
      setDocuments(result)
    } catch (err) {
      setError('Failed to search documents')
      console.error('Error searching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (org && project) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org, project, filters.tag])

  useEffect(() => {
    if (!documents) return
    
    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 1000)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.tokens])

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <div className="absolute inset-x-0 top-0 -z-10 h-[260px]" style={{background: 'linear-gradient(180deg, rgba(0, 153, 101, 0.08) 0%, rgba(0, 153, 101, 0) 100%), linear-gradient(180deg, color(display-p3 0.020 0.588 0.412 / 0.08) 0%, color(display-p3 0.020 0.588 0.412 / 0) 100%)'}}></div>
      
      <Header />
      
      <main className="flex-grow pt-0">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-0">
          <div className="mx-auto flex w-full max-w-7xl flex-col px-4 pt-10 sm:px-6 lg:px-8">
            
            <div className="w-full rounded-[12px] border border-emerald-600 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <div className="flex-1">
                    <h2 className="mb-[4px] flex items-center gap-2 text-[18px] font-semibold leading-[100%] tracking-[0%] text-stone-800">
                      {libraryInfo?.title || project}
                    </h2>
                    {libraryInfo?.repoUrl && (
                      <a 
                        href={libraryInfo.repoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block max-w-[300px] truncate align-top text-base font-normal leading-normal decoration-solid decoration-from-font hover:underline sm:max-w-sm md:max-w-md lg:max-w-lg text-emerald-600"
                        title={libraryInfo.repoUrl}
                      >
                        {libraryInfo.repoUrl}
                      </a>
                    )}
                    {libraryInfo?.description && (
                      <h3 className="text-base font-normal leading-[140%] text-stone-600">
                        {libraryInfo.description}
                      </h3>
                    )}
                  </div>
                  
                  {libraryInfo?.libraryType === 'git' && (
                    <div className="mt-4 flex w-full flex-col gap-2 self-start sm:ml-10 sm:mt-0 sm:w-auto">
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-1">
                        <div className="group relative">
                          <select
                            value={filters.tag}
                            onChange={(e) => {
                              if (e.target.value === '__new_version__') {
                                setShowAddTagModal(true)
                                e.target.value = filters.tag
                              } else {
                                setFilters({ ...filters, tag: e.target.value })
                              }
                            }}
                            className="h-8 w-full rounded-[6px] border border-stone-300 bg-stone-50 px-2 sm:w-auto cursor-pointer hover:bg-stone-100 text-sm text-stone-700 focus:outline-none"
                          >
                            <option value="latest">Latest</option>
                            {libraryInfo?.tags && (Array.isArray(libraryInfo.tags) 
                              ? libraryInfo.tags 
                              : Object.keys(libraryInfo.tags)
                            ).map(tag => (
                              <option key={tag} value={tag}>
                                {tag}
                              </option>
                            ))}
                            <option disabled>────────────</option>
                            <option value="__new_version__">
                              ✚ New Version
                            </option>
                          </select>
                        </div>
                        
                        <button 
                          onClick={async () => {
                            setRebuildStatus(null)
                            try {
                              await apiClient.rebuildLibrary(org, project)
                              const meta = await apiClient.getLibraryMeta(org, project)
                              setLibraryInfo(meta)
                              setRebuildStatus('Rebuild completed successfully')
                              setTimeout(() => setRebuildStatus(null), 3000)
                            } catch (err: any) {
                              console.error('Failed to rebuild library:', err)
                              const errorMessage = err.message || 'Unknown error'
                              if (errorMessage.includes('No changes detected')) {
                                setRebuildStatus('No changes detected since last build')
                              } else {
                                setRebuildStatus(`Rebuild failed: ${errorMessage}`)
                              }
                              setTimeout(() => setRebuildStatus(null), 5000)
                            }
                          }}
                          className="flex h-8 w-full items-center justify-center gap-1.5 rounded-[6px] border border-stone-300 bg-stone-50 px-2 py-2 text-stone-600 transition sm:w-auto hover:bg-stone-100"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="text-sm sm:hidden">Rebuild</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col-reverse gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                  <div className="flex flex-wrap gap-2 text-sm sm:gap-1">
                    {libraryInfo?.state === 'finalized' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Finalized
                      </span>
                    )}
                    {libraryInfo?.state === 'processing' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Processing
                      </span>
                    )}
                    {libraryInfo?.state === 'failed' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Failed
                      </span>
                    )}
                    
                    {libraryInfo && Object.entries(libraryInfo).map(([key, value]) => {
                      if (['state', 'accessToken', 'org', 'project', 'lastCommitId', 'title', 'description', 'repoUrl', 'tags', 'libraryType'].includes(key)) return null
                      return (
                        <div key={key} className="flex items-center gap-1 rounded-[6px] bg-stone-100 px-3 py-1.5">
                          <span className="text-[14px] font-normal leading-[100%] tracking-[0%] text-stone-500">{key}:</span>
                          <span className="text-[14px] font-normal leading-[100%] tracking-[0%] text-stone-800">
                            {key === 'last_update_date' && value ? 
                              new Date(String(value)).toLocaleString('sv-SE') :
                              typeof value === 'number' ? value.toLocaleString() : String(value)
                            }
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {rebuildStatus && (
                  <div className={`mt-4 p-3 rounded-md text-sm ${
                    rebuildStatus.includes('failed') 
                      ? 'bg-red-50 text-red-800 border border-red-200' 
                      : rebuildStatus.includes('No changes detected')
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      : 'bg-green-50 text-green-800 border border-green-200'
                  }`}>
                    {rebuildStatus}
                  </div>
                )}
              </div>
            </div>
            
            <h2 className="mb-2 mt-4 text-xs font-normal uppercase leading-none tracking-wider text-stone-400 md:mt-6">Search by topic</h2>
            <div className="w-full rounded-[12px] border border-stone-300 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex w-full flex-col gap-1">
                <label className="text-sm font-normal leading-[100%] tracking-[0%] text-stone-500 md:text-[16px]">Show docs for...</label>
                <div className="flex flex-col gap-2 sm:flex-row md:gap-4">
                  <input
                    type="text"
                    placeholder="e.g. data fetching, routing, middleware"
                    className="h-[40px] w-full rounded-[6px] border border-stone-300 bg-white px-3 py-0 text-sm leading-[100%] text-stone-800 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 md:text-[16px]"
                    value={filters.topic}
                    onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    maxLength={100}
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={loading}
                    className="flex h-[40px] items-center justify-center gap-1 whitespace-nowrap rounded-[6px] bg-stone-200 px-3 text-sm font-normal leading-[100%] tracking-[0%] text-stone-800 hover:bg-stone-300 disabled:cursor-not-allowed disabled:opacity-50 md:text-[16px]"
                  >
                    {loading ? 'Loading...' : 'Show Results'}
                  </button>
                </div>
              </div>
            </div>
            
            <h2 className="mb-2 mt-4 text-xs font-normal uppercase leading-none tracking-wider text-stone-400 md:mt-6">Result</h2>
            <div className="w-full rounded-[12px] border border-stone-300 bg-white p-6 shadow-sm sm:p-8">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              
              <div className="mb-4 flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="relative flex w-full items-center gap-2 rounded-[6px] bg-stone-100 pl-[12px] sm:w-auto">
                  <label htmlFor="token-input" className="text-sm font-normal leading-[100%] tracking-[0%] text-stone-500 md:text-[16px]">Tokens:</label>
                  <input
                    id="token-input"
                    type="number"
                    min="0"
                    max="100000"
                    step="1"
                    className="h-[40px] w-full rounded-[6px] border-2 border-stone-300 bg-white px-3 py-0 text-sm leading-[100%] text-stone-700 focus:border-emerald-600 focus:outline-none sm:w-[200px] md:text-[16px]"
                    value={filters.tokens}
                    onChange={(e) => setFilters({ ...filters, tokens: parseInt(e.target.value) || 10000 })}
                  />
                </div>
                
                <div className="hidden h-[40px] flex-wrap gap-[1px] overflow-hidden rounded-[6px] sm:inline-flex">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex h-[40px] items-center justify-center gap-1 bg-stone-200 px-3 py-2 text-sm font-normal leading-[100%] tracking-[0%] text-stone-800 md:text-[16px]"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="h-[250px] w-full rounded-xl bg-stone-100 p-3 sm:h-[350px] md:h-[434px] md:p-5 flex items-center justify-center">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    <p className="ml-4 text-gray-600">Searching documentation...</p>
                  </div>
                </div>
              ) : (
                <textarea
                  readOnly
                  className="h-[250px] w-full rounded-xl bg-stone-100 p-3 align-top font-mono text-xs text-stone-800 focus:outline-none sm:h-[350px] md:h-[434px] md:p-5 md:text-sm"
                  spellCheck="false"
                  value={documents || 'No results found. Try adjusting your search topic.'}
                />
              )}
              
              <div className="mb-3 mt-3 flex w-full flex-col gap-2 sm:hidden">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex w-full items-center justify-center gap-1 rounded-[6px] bg-stone-200 px-3 py-2 text-sm font-normal leading-[100%] tracking-[0%] text-stone-800"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      <AddTagModal
        isOpen={showAddTagModal}
        onClose={() => setShowAddTagModal(false)}
        org={org}
        project={project}
        existingTags={libraryInfo?.tags ? (Array.isArray(libraryInfo.tags) ? libraryInfo.tags : Object.keys(libraryInfo.tags)) : []}
        onTagAdded={handleTagAdded}
      />
    </div>
  )
}