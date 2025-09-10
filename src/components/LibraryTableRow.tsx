import StatusBadge from './StatusBadge'
import { type Library } from '@/lib/api'

interface LibraryTableRowProps {
  library: Library
}

export default function LibraryTableRow({ library }: LibraryTableRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('sv-SE')
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <button 
          onClick={() => window.location.href = `${window.location.origin}/${library.id}`}
          className="text-emerald-600 font-medium hover:underline text-left"
        >
          {library.title}
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-stone-900 max-w-xs truncate">
          {library.description}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={library.state} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
        {library.totalTokens?.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
        {formatDate(library.lastUpdateDate)}
      </td>
    </tr>
  )
}