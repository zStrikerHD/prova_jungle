import { Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useCart } from '../context'
import { multiplyEth } from '@/lib/money'

export function CartList() {
  const { items, removeItem, updateQuantity, syncError } = useCart()

  if (items.length === 0) {
    return (
      <div className="py-16 text-center font-mono space-y-4">
        <p className="text-[#998F86]">Seu carrinho está vazio.</p>
        <Link
          to="/"
          className="inline-block rounded-xl bg-[#D97938] px-6 py-2.5 text-xs font-bold text-[#140D0A] uppercase tracking-wider hover:bg-[#E58847] transition-all"
        >
          Continuar explorando
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full font-mono text-xs">
      {syncError && <p role="alert" className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-red-300">{syncError}</p>}
      {/* Cabeçalho da Tabela */}
      <div className="grid grid-cols-12 gap-4 pb-4 border-b border-[#2A201A] text-[#C4BCB4] font-medium tracking-wider">
        <div className="col-span-5 sm:col-span-5">NFTs</div>
        <div className="col-span-2 text-center sm:text-left">Preço</div>
        <div className="col-span-3 text-center">Edições</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {/* Lista de Itens */}
      <div className="divide-y divide-[#2A201A]">
        {items.map((item) => {
          const itemTotal = multiplyEth(item.nft.priceEth, item.quantity)
          const tokenId = String(item.nft.id || '1').padStart(4, '0')

          return (
            <div
              key={item.nftId}
              className="grid grid-cols-12 gap-4 py-5 items-center group"
            >
              {/* Coluna 1: Imagem + Info */}
              <div className="col-span-5 sm:col-span-5 flex items-center gap-3.5">
                <Link
                  to="/mercado/nft/$id"
                  params={{ id: item.nft.id }}
                  className="relative aspect-square w-12 sm:w-16 h-12 sm:h-16 shrink-0 overflow-hidden rounded-xl bg-[#1C1512] border border-[#2A201A] group-hover:border-[#D97938]/60 transition-all cursor-pointer"
                >
                  <img
                    src={item.nft.imageUrl}
                    alt={item.nft.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="space-y-1 truncate">
                  <Link
                    to="/mercado/nft/$id"
                    params={{ id: item.nft.id }}
                    className="font-bold text-white text-xs sm:text-sm hover:text-[#D97938] transition-colors truncate block"
                  >
                    {item.nft.title}
                  </Link>
                  <span className="text-[11px] text-[#8A7E75] block">
                    ID do token: #{tokenId}
                  </span>
                </div>
              </div>

              {/* Coluna 2: Preço unitário */}
              <div className="col-span-2 text-center sm:text-left font-medium text-white text-xs sm:text-sm">
                {item.nft.priceEth} ETH
              </div>

              {/* Coluna 3: Seletor de Edições */}
              <div className="col-span-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.nftId, item.quantity - 1)}
                  aria-label="Diminuir quantidade"
                  className="w-5 h-5 rounded-full bg-[#D97938] hover:bg-[#E58847] text-[#140D0A] flex items-center justify-center font-bold text-xs active:scale-95 transition-all cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold text-white text-xs sm:text-sm w-4 text-center">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.nftId, item.quantity + 1)}
                  aria-label="Aumentar quantidade"
                  className="w-5 h-5 rounded-full bg-[#D97938] hover:bg-[#E58847] text-[#140D0A] flex items-center justify-center font-bold text-xs active:scale-95 transition-all cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Coluna 4: Total + Excluir */}
              <div className="col-span-2 flex items-center justify-end gap-3 sm:gap-4">
                <span className="font-bold text-[#D97938] text-xs sm:text-sm whitespace-nowrap">
                  {itemTotal} ETH
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.nftId)}
                  aria-label={`Remover ${item.nft.title}`}
                  className="text-[#8A7E75] hover:text-[#D97938] transition-colors cursor-pointer p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
