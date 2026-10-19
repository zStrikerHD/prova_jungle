interface FiltersBarProps {
  selectedCategory?: string
  onSelectCategory?: (category: string) => void
  search?: string
  onSearchChange?: (search: string) => void
}

export function FiltersBar({
  selectedCategory = 'Todos',
  onSelectCategory,
  search = '',
  onSearchChange,
}: FiltersBarProps) {
  const categories = ['Todos', 'Cyberpunk', 'Abstrato', '3D Art', 'Ficção Científica', 'Colecionáveis']

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
      {/* Botões de Categoria */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory?.(cat)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-[#D97938] text-black shadow-md'
                : 'bg-[#1C1613] text-[#998F86] hover:text-white border border-[#2A201A]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="w-full md:w-64">
        <input
          type="text"
          placeholder="Buscar no mercado..."
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full rounded-xl border border-[#2A201A] bg-[#1C1613] px-4 py-2 text-xs text-white placeholder:text-[#998F86] focus:border-[#D97938] focus:outline-none"
        />
      </div>
    </div>
  )
}
