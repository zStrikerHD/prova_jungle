import { useState, type FormEvent } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { apiClient } from '@/lib/api/client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Wallet } from '@/types'

export function CollectorWallets() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { data: wallets = [], isLoading } = useQuery({ queryKey: ['wallets', user?.id], queryFn: async () => (await apiClient.get<Wallet[]>('/wallets')).data })

  // Form states pre-filled with user info or defaults
  const [displayName, setDisplayName] = useState(user?.displayName || 'Colecionador Alpha')
  const [walletNickname, setWalletNickname] = useState(user?.walletNickname || 'Minha MetaMask')
  const [network, setNetwork] = useState('')
  const [profileName, setProfileName] = useState(user?.username || 'alpha_collector')
  const [walletAddress, setWalletAddress] = useState('')
  const [secondaryAddressOrEns, setSecondaryAddressOrEns] = useState('')
  const [walletType, setWalletType] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [email, setEmail] = useState(user?.email || 'contato@email.com')
  const [ensName, setEnsName] = useState(user?.ensName || 'alpha')
  const [ensDomain, setEnsDomain] = useState('.eth')
  const [isEnsOpen, setIsEnsOpen] = useState(false)

  // Secondary wallet state
  const [sameAsPrimary, setSameAsPrimary] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPrimary, setIsPrimary] = useState(true)

  const editWallet = (wallet: Wallet) => {
    setEditingId(wallet.id); setWalletNickname(wallet.nickname); setWalletAddress(wallet.address); setNetwork(wallet.network); setWalletType(wallet.type); setIsPrimary(wallet.isPrimary); setSaveError('')
  }

  const startWallet = (primary: boolean) => {
    setEditingId(null); setWalletAddress(''); setWalletNickname(''); setNetwork(''); setWalletType(''); setIsPrimary(primary); setSaveError('')
  }

  const handleSaveWallet = async (e: FormEvent) => {
    e.preventDefault()
    setSaveError('')
    try {
      const payload = { nickname: walletNickname, address: walletAddress, network, type: walletType, isPrimary }
      if (editingId) await apiClient.put(`/wallets/${editingId}`, payload)
      else await apiClient.post('/wallets', payload)
      await queryClient.invalidateQueries({ queryKey: ['wallets', user?.id] })
    } catch (error) {
      setSaveError((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Não foi possível salvar a carteira.'); return
    }
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div>
      {/* 1. Cabeçalho da Seção Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#38261E] gap-2">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
            Carteira principal
          </h1>
          <p className="text-xs text-[#998F86] mt-1">
            Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            startWallet(true)
          }}
          className="text-xs font-bold text-[#D97938] hover:underline self-start sm:self-center transition-colors cursor-pointer"
        >
          Adicionar
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2" aria-live="polite">
        {isLoading && <p className="text-xs text-[#998F86]">Carregando carteirasâ€¦</p>}
        {wallets.map((wallet) => (
          <button key={wallet.id} type="button" onClick={() => editWallet(wallet)} className={`rounded-xl border p-4 text-left text-xs ${editingId === wallet.id ? 'border-[#D97938] bg-[#241612]' : 'border-[#38261E] bg-[#170E0B]'}`}>
            <strong className="block text-white">{wallet.nickname} {wallet.isPrimary ? '· principal' : '· secundária'}</strong>
            <span className="mt-1 block truncate text-[#998F86]">{wallet.address}</span>
            <span className="mt-1 block capitalize text-[#C49A6C]">{wallet.type} · {wallet.network}</span>
          </button>
        ))}
      </div>

      {isSaved && (
        <div className="mb-6 rounded-lg bg-green-950/40 border border-green-500/40 p-3 text-xs text-green-300 flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4" /> Carteira principal salva com sucesso!
        </div>
      )}
      {saveError && <div role="alert" className="mb-6 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300">{saveError}</div>}

      {/* 2. Formulário da Carteira Principal */}
      <form onSubmit={handleSaveWallet} className="space-y-5">
        {/* Linha 1: Nome de exibição* + Apelido da carteira* */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
              <span>Nome de exibição</span>
              <span className="text-[#D97938]">*</span>
            </label>
            <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nome de exibição"
                required
                className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
              <span>Apelido da carteira</span>
              <span className="text-[#D97938]">*</span>
            </label>
            <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
              <input
                type="text"
                value={walletNickname}
                onChange={(e) => setWalletNickname(e.target.value)}
                placeholder="Apelido da carteira"
                required
                className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Linha 2: Rede * + Nome do perfil* */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
              <span>Rede</span>
              <span className="text-[#D97938]">*</span>
            </label>
            <div className="relative rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full bg-transparent text-xs text-white outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="" className="bg-[#170E0B] text-[#7A6D64]">
                  Selecione uma rede
                </option>
                <option value="ethereum" className="bg-[#170E0B] text-white">
                  Ethereum (Mainnet)
                </option>
                <option value="polygon" className="bg-[#170E0B] text-white">
                  Polygon
                </option>
                <option value="arbitrum" className="bg-[#170E0B] text-white">
                  Arbitrum
                </option>
                <option value="optimism" className="bg-[#170E0B] text-white">
                  Optimism
                </option>
                <option value="solana" className="bg-[#170E0B] text-white">
                  Solana
                </option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A6D64]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
              <span>Nome do perfil</span>
              <span className="text-[#D97938]">*</span>
            </label>
            <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Nome do perfil"
                required
                className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Linha 3: Endereço da carteira* + ENS ou carteira secundária */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
              <span>Endereço da carteira</span>
              <span className="text-[#D97938]">*</span>
            </label>
            <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Endereço 0x da carteira"
                className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
              <input
                type="text"
                value={secondaryAddressOrEns}
                onChange={(e) => setSecondaryAddressOrEns(e.target.value)}
                placeholder="ENS ou carteira secundária (opcional)"
                className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Linha 4: Tipo de carteira* + Código de indicação* */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
              <span>Tipo de carteira</span>
              <span className="text-[#D97938]">*</span>
            </label>
            <div className="relative rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
              <select
                value={walletType}
                onChange={(e) => setWalletType(e.target.value)}
                className="w-full bg-transparent text-xs text-white outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="" className="bg-[#170E0B] text-[#7A6D64]">
                  Selecione uma carteira
                </option>
                <option value="metamask" className="bg-[#170E0B] text-white">
                  MetaMask
                </option>
                <option value="coinbase" className="bg-[#170E0B] text-white">
                  Coinbase Wallet
                </option>
                <option value="walletconnect" className="bg-[#170E0B] text-white">
                  WalletConnect
                </option>
                <option value="phantom" className="bg-[#170E0B] text-white">
                  Phantom
                </option>
                <option value="rainbow" className="bg-[#170E0B] text-white">
                  Rainbow
                </option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A6D64]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
              <span>Código de indicação</span>
              <span className="text-[#D97938]">*</span>
            </label>
            <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Código de indicação"
                className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Linha 5: E-mail* + Nome ENS * */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div className="space-y-2">
            <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
              <span>E-mail</span>
              <span className="text-[#D97938]">*</span>
            </label>
            <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@email.com"
                required
                className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
              <span>Nome ENS</span>
              <span className="text-[#D97938]">*</span>
            </label>
            <div className="relative rounded-[8px] border border-[#38261E] bg-[#170E0B] px-3 py-2.5 flex items-center gap-2 focus-within:border-[#D97938] transition-colors">
              {/* Seletor de domínio .eth à esquerda */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEnsOpen(!isEnsOpen)}
                  className="flex items-center gap-1 bg-[#241612] border border-[#38261E] px-2 py-1 rounded text-xs text-[#D97938] font-bold hover:border-[#D97938] transition-colors cursor-pointer"
                >
                  <span>{ensDomain}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {isEnsOpen && (
                  <div className="absolute left-0 top-full mt-1 w-24 rounded-lg bg-[#241612] border border-[#38261E] py-1 shadow-xl z-20">
                    {['.eth', '.crypto', '.nft'].map((dom) => (
                      <button
                        key={dom}
                        type="button"
                        onClick={() => {
                          setEnsDomain(dom)
                          setIsEnsOpen(false)
                        }}
                        className="w-full px-3 py-1 text-left text-xs text-white hover:bg-[#38261E] transition-colors cursor-pointer"
                      >
                        {dom}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="text"
                value={ensName}
                onChange={(e) => setEnsName(e.target.value)}
                placeholder="Nome ENS"
                className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Botão Salvar carteira */}
        <div className="pt-3">
          <button
            type="submit"
            className="rounded-[8px] bg-[#D97938] hover:bg-[#E58847] active:scale-[0.99] px-8 py-3 text-xs font-bold text-[#140D0A] uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            Salvar carteira
          </button>
        </div>
      </form>

      {/* 3. Seção Inferior: Carteira secundária */}
      <div className="mt-10 pt-6 border-t border-[#38261E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">
            Carteira secundária
          </h2>
          <p className="text-xs text-[#998F86] mt-1">
            Você ainda não adicionou uma carteira secundária.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-xs text-[#C4BCB4] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sameAsPrimary}
              onChange={(e) => setSameAsPrimary(e.target.checked)}
              className="accent-[#D97938] h-3.5 w-3.5 rounded cursor-pointer"
            />
            <span>Igual à carteira principal</span>
          </label>

          <button
            type="button"
            onClick={() => {
              const primary = wallets.find((wallet) => wallet.isPrimary)
              startWallet(false)
              if (sameAsPrimary && primary) { setWalletAddress(primary.address); setNetwork(primary.network); setWalletType(primary.type) }
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="text-xs font-bold text-[#D97938] hover:underline transition-colors cursor-pointer"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}
