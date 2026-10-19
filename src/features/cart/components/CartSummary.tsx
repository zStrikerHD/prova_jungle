import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { useCart } from '../context'
import { useAuth } from '@/features/auth'
import { Button } from '@/components/ui'
import { formatEth, multiplyEth, percentEth, sumEth } from '@/lib/money'
import { apiClient } from '@/lib/api/client'
import type { Quote } from '@/types'

export function CartSummary() {
  const router = useRouter()
  const { items } = useCart()
  const { isAuthenticated } = useAuth()
  const [coupon, setCoupon] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoteSignature, setQuoteSignature] = useState('')

  const cartSignature = JSON.stringify(items.map((item) => [item.nftId, item.edition, item.quantity, item.nft.priceEth]))
  const activeQuote = quoteSignature === cartSignature ? quote : null
  const localSubtotal = sumEth(items.map((item) => multiplyEth(item.nft.priceEth, item.quantity)))
  const subtotal = activeQuote?.subtotalEth || localSubtotal
  const networkFee = activeQuote?.networkFeeEth || (items.length > 0 ? '0.016' : '0')
  const discountAmount = activeQuote?.discountEth || percentEth(subtotal, discountPercent)
  const total = activeQuote?.totalEth || sumEth([subtotal, networkFee, `-${discountAmount}`])

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCoupon = coupon.trim().toUpperCase()

    if (cleanCoupon === '') {
      setCouponError('Por favor, digite um código de cupom.')
      setCouponSuccess('')
      return
    }
    try {
      const { data } = await apiClient.post<Quote>('/quotes', { coupon: cleanCoupon, items })
      setQuote(data); setQuoteSignature(cartSignature); setDiscountPercent(data.coupon ? 15 : 0); setCouponError(''); setCouponSuccess(`Cupom ${data.coupon} aplicado.`)
      if (data.coupon) sessionStorage.setItem('kurio_coupon', data.coupon)
    } catch (error) {
      setQuote(null); setDiscountPercent(0); setCouponSuccess('')
      setCouponError((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Não foi possível validar o cupom.')
    }
  }

  const removeCoupon = () => { sessionStorage.removeItem('kurio_coupon'); setCoupon(''); setQuote(null); setQuoteSignature(''); setDiscountPercent(0); setCouponError(''); setCouponSuccess('Cupom removido.') }

  return (
    <div className="font-mono space-y-6">
      <h3 className="font-bold text-base sm:text-lg text-white">
        Resumo da carteira
      </h3>

      {/* Código promocional */}
      <div className="space-y-2">
        <label className="text-xs text-[#C4BCB4] block">
          Código promocional
        </label>
        <form onSubmit={handleApplyCoupon} className="flex items-center">
          <input
            type="text"
            placeholder="Digite o código promocional..."
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            className="w-full rounded-l-lg border border-[#2A201A] bg-[#1C130F] px-3.5 py-2.5 text-xs text-white placeholder:text-[#5A473C] focus:border-[#D97938] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-r-lg bg-[#D97938] hover:bg-[#E58847] active:scale-95 text-[#140D0A] font-bold text-xs px-5 py-2.5 transition-colors cursor-pointer shrink-0 uppercase tracking-wider"
          >
            Aplicar
          </button>
        </form>
        {couponError && (
          <span className="text-[11px] text-rose-400 block animate-fadeIn">
            {couponError}
          </span>
        )}
        {couponSuccess && (
          <span className="text-[11px] text-[#D97938] block font-bold animate-fadeIn">
            ✓ {couponSuccess}
            {activeQuote?.coupon && <button type="button" onClick={removeCoupon} className="ml-2 underline">Remover</button>}
          </span>
        )}
      </div>

      {/* Detalhamento de valores */}
      <div className="space-y-3.5 pt-2 text-xs">
        <div className="flex justify-between items-center text-[#C4BCB4]">
          <span>Subtotal</span>
          <span className="text-white font-medium">
            {formatEth(subtotal, 2)} ETH
          </span>
        </div>

        <div className="flex justify-between items-center text-[#C4BCB4]">
          <span>Desconto do lançamento</span>
          <span className="text-white font-medium">
            {discountPercent > 0 ? `(-) ${formatEth(discountAmount, 2)} ETH (-${discountPercent}%)` : '(-) 00.00'}
          </span>
        </div>

        <div className="flex justify-between items-start text-[#C4BCB4]">
          <div>
            <span>Taxa de rede</span>
            <span className="text-[10px] text-[#8A7E75] block">
              Taxa estimada
            </span>
          </div>
          <span className="text-white font-medium">
            {formatEth(networkFee)} ETH
          </span>
        </div>

        {/* Total Final */}
        <div className="pt-3 border-t border-[#2A201A] flex justify-between items-center">
          <span className="font-bold text-sm sm:text-base text-white">
            Total
          </span>
          <span className="font-bold text-lg sm:text-xl text-[#D97938]">
            {formatEth(total)} ETH
          </span>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="space-y-3 pt-2">
        <Button
          type="button"
          onClick={() => {
            router.navigate({ to: '/pagamento' })
          }}
          className="w-full rounded-xl bg-[#D97938] hover:bg-[#E58847] active:scale-95 text-[#140E0A] font-bold text-xs sm:text-sm tracking-wider uppercase py-3.5 shadow-lg shadow-[#D97938]/20 transition-all cursor-pointer"
        >
          {isAuthenticated ? 'Finalizar compra' : 'Conectar e finalizar'}
        </Button>

        <Link
          to="/"
          className="text-xs text-[#D97938] hover:text-[#E58847] transition-colors block text-center"
        >
          Continuar explorando
        </Link>
      </div>
    </div>
  )
}
