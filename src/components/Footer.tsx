import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-stone-600">
          <a 
            href="https://github.com/rakuv3r/open-context7-mcp" 
            className="text-stone-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            MCP Server
          </a>
          <span className="text-stone-400">•</span>
          <a 
            href="https://github.com/rakuv3r/open-context7-api" 
            className="text-stone-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            API
          </a>
          <span className="text-stone-400">•</span>
          <a 
            href="https://github.com/rakuv3r/open-context7-web" 
            className="text-stone-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Web
          </a>
        </div>
      </div>
    </footer>
  )
}