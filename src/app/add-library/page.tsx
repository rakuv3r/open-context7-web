'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AddFromRepositoryForm from '@/components/AddFromRepositoryForm'

export default function AddLibraryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* From Repository */}
        <div className="bg-white rounded-lg border border-stone-200 p-8">
          <AddFromRepositoryForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}