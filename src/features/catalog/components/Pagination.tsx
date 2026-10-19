import { ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function Pagination({
  currentPage = 1,
  totalPages = 4,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex justify-end items-center gap-2 font-mono text-xs pt-8">
      {pages.map((p) => {
        const isActive = p === currentPage
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange?.(p)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
              isActive
                ? 'bg-[#D97938] text-black font-bold shadow-md'
                : 'bg-[#1C1613] text-[#A39B95] border border-[#2A201A] hover:text-white hover:border-[#3A2D24]'
            }`}
          >
            {p}
          </button>
        )
      })}

      {/* Próximo */}
      <button
        type="button"
        onClick={() => onPageChange?.(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage >= totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C1613] text-[#A39B95] border border-[#2A201A] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
