import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LibraryGrid from '@/components/LibraryGrid'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      
      <main className="flex-1">
        <LibraryGrid />
      </main>

      <Footer />
    </div>
  )
}