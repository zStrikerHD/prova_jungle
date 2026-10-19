import { useState, type FormEvent } from 'react'
import {
  User,
  Wallet,
  Activity,
  Heart,
  Tag,
  Download,
  HelpCircle,
  LogOut,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { CollectorWallets } from './CollectorWallets'
import { apiClient } from '@/lib/api/client'

export type ProfileTab =
  | 'dados'
  | 'carteiras'
  | 'atividade'
  | 'favoritos'
  | 'ofertas'
  | 'downloads'
  | 'suporte'

interface CollectorProfileProps {
  initialTab?: ProfileTab
}

export function CollectorProfile({ initialTab = 'dados' }: CollectorProfileProps) {
  const { user, updateProfile, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab)

  // Form states
  const [displayName, setDisplayName] = useState(user?.displayName || 'Colecionador Alpha')
  const [username, setUsername] = useState(user?.username || 'alpha_collector')
  const [email, setEmail] = useState(user?.email || 'contato@email.com')
  const [ensName, setEnsName] = useState(user?.ensName || 'alpha')
  const [ensDomain, setEnsDomain] = useState(user?.ensDomain || '.eth')
  const [isEnsDropdownOpen, setIsEnsDropdownOpen] = useState(false)
  const [walletNickname, setWalletNickname] = useState(user?.walletNickname || 'Carteira Principal (MetaMask)')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '/assets/nfts/ape-headphones.jpg')

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSaved, setIsSaved] = useState(false)
  const [formError, setFormError] = useState('')

  // Sincronizar se o usuário mudar
  const [prevUser, setPrevUser] = useState(user)
  if (user && prevUser !== user) {
    setPrevUser(user)
    setDisplayName(user.displayName)
    setUsername(user.username)
    setEmail(user.email)
    setEnsName(user.ensName)
    setEnsDomain(user.ensDomain)
    setWalletNickname(user.walletNickname)
    setAvatarUrl(user.avatarUrl)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (newPassword && newPassword !== confirmPassword) { setFormError('As novas senhas não coincidem.'); return }
    const result = await updateProfile({
      displayName,
      username,
      email,
      ensName,
      ensDomain,
      walletNickname,
      avatarUrl,
    })
    if (!result.success) { setFormError(result.error || 'Não foi possível salvar o perfil.'); return }
    if (newPassword) {
      try { await apiClient.post('/profile/password', { currentPassword, newPassword }); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }
      catch (error) { setFormError((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Não foi possível alterar a senha.'); return }
    }
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleRemoveAvatar = () => {
    setAvatarUrl('')
    updateProfile({ avatarUrl: '' })
  }

  const handleChangeAvatar = () => {
    const nextAvatar =
      avatarUrl === '/assets/nfts/ape-headphones.jpg'
        ? '/assets/nfts/ape-turtleneck.jpg'
        : '/assets/nfts/ape-headphones.jpg'
    setAvatarUrl(nextAvatar)
    updateProfile({ avatarUrl: nextAvatar })
  }

  return (
    <div className="w-full px-6 lg:px-[120px] py-8 sm:py-12 font-mono">
      {/* Container Principal: 1200px máx, borda sutil, cantos arredondados */}
      <div className="mx-auto w-full max-w-[1200px] rounded-2xl border border-[#38261E] bg-[#1C130E] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[780px]">
        
        {/* =========================================
            COLUNA ESQUERDA: MENU LATERAL (Meu perfil)
           ========================================= */}
        <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[#38261E] p-6 lg:p-8 flex flex-col justify-between bg-[#19100C]/70">
          <div className="space-y-6">
            {/* Título do Menu */}
            <h2 className="text-sm font-bold text-[#D97938] uppercase tracking-wider">
              Meu perfil
            </h2>

            {/* Lista de Navegação */}
            <nav className="space-y-1 text-xs">
              {/* 1. Dados do perfil */}
              <button
                type="button"
                onClick={() => setActiveTab('dados')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all text-left cursor-pointer ${
                  activeTab === 'dados'
                    ? 'bg-[#2A1B14] text-[#D97938] font-bold border-l-2 border-[#D97938]'
                    : 'text-[#C4BCB4] hover:text-white hover:bg-[#221611]'
                }`}
              >
                <User className="h-4 w-4 shrink-0" />
                <span>Dados do perfil</span>
              </button>

              {/* 2. Carteiras */}
              <button
                type="button"
                onClick={() => setActiveTab('carteiras')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all text-left cursor-pointer ${
                  activeTab === 'carteiras'
                    ? 'bg-[#2A1B14] text-[#D97938] font-bold border-l-2 border-[#D97938]'
                    : 'text-[#C4BCB4] hover:text-white hover:bg-[#221611]'
                }`}
              >
                <Wallet className="h-4 w-4 shrink-0" />
                <span>Carteiras</span>
              </button>

              {/* 3. Atividade */}
              <button
                type="button"
                onClick={() => setActiveTab('atividade')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all text-left cursor-pointer ${
                  activeTab === 'atividade'
                    ? 'bg-[#2A1B14] text-[#D97938] font-bold border-l-2 border-[#D97938]'
                    : 'text-[#C4BCB4] hover:text-white hover:bg-[#221611]'
                }`}
              >
                <Activity className="h-4 w-4 shrink-0" />
                <span>Atividade</span>
              </button>

              {/* 4. Lista de interesse */}
              <button
                type="button"
                onClick={() => setActiveTab('favoritos')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all text-left cursor-pointer ${
                  activeTab === 'favoritos'
                    ? 'bg-[#2A1B14] text-[#D97938] font-bold border-l-2 border-[#D97938]'
                    : 'text-[#C4BCB4] hover:text-white hover:bg-[#221611]'
                }`}
              >
                <Heart className="h-4 w-4 shrink-0" />
                <span>Lista de interesse</span>
              </button>

              {/* 5. Ofertas */}
              <button
                type="button"
                onClick={() => setActiveTab('ofertas')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all text-left cursor-pointer ${
                  activeTab === 'ofertas'
                    ? 'bg-[#2A1B14] text-[#D97938] font-bold border-l-2 border-[#D97938]'
                    : 'text-[#C4BCB4] hover:text-white hover:bg-[#221611]'
                }`}
              >
                <Tag className="h-4 w-4 shrink-0" />
                <span>Ofertas</span>
              </button>

              {/* 6. Arquivos baixados */}
              <button
                type="button"
                onClick={() => setActiveTab('downloads')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all text-left cursor-pointer ${
                  activeTab === 'downloads'
                    ? 'bg-[#2A1B14] text-[#D97938] font-bold border-l-2 border-[#D97938]'
                    : 'text-[#C4BCB4] hover:text-white hover:bg-[#221611]'
                }`}
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>Arquivos baixados</span>
              </button>

              {/* 7. Suporte */}
              <button
                type="button"
                onClick={() => setActiveTab('suporte')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all text-left cursor-pointer ${
                  activeTab === 'suporte'
                    ? 'bg-[#2A1B14] text-[#D97938] font-bold border-l-2 border-[#D97938]'
                    : 'text-[#C4BCB4] hover:text-white hover:bg-[#221611]'
                }`}
              >
                <HelpCircle className="h-4 w-4 shrink-0" />
                <span>Suporte</span>
              </button>
            </nav>
          </div>

          {/* 8. Sair */}
          <div className="pt-6 border-t border-[#38261E] mt-6">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs text-[#998F86] hover:text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* =========================================
            COLUNA DIREITA: FORMULÁRIO (Perfil do colecionador)
           ========================================= */}
        <main className="lg:col-span-9 p-6 sm:p-10 lg:p-12">
          {activeTab === 'dados' ? (
            <div>
              {/* Título da Seção */}
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#38261E]">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Perfil do colecionador
                </h1>
                {isSaved && (
                  <span className="flex items-center gap-1.5 text-xs text-green-400 font-semibold animate-in fade-in">
                    <Check className="h-4 w-4" /> Alterações salvas!
                  </span>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {formError && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300">{formError}</p>}
                {/* Linha 1: Nome de exibição + Nome de usuário */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {/* Nome de exibição */}
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

                  {/* Nome de usuário */}
                  <div className="space-y-2">
                    <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
                      <span>Nome de usuário</span>
                      <span className="text-[#D97938]">*</span>
                    </label>
                    <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nome de usuário"
                        required
                        className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Linha 2: E-mail + Nome ENS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {/* E-mail */}
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

                  {/* Nome ENS */}
                  <div className="space-y-2">
                    <label className="text-xs text-[#C4BCB4] font-medium flex items-center gap-1">
                      <span>Nome ENS</span>
                      <span className="text-[#D97938]">*</span>
                    </label>
                    <div className="relative rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-2.5 flex items-center justify-between focus-within:border-[#D97938] transition-colors">
                      <input
                        type="text"
                        value={ensName}
                        onChange={(e) => setEnsName(e.target.value)}
                        placeholder="nome"
                        className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none pr-2"
                      />
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsEnsDropdownOpen(!isEnsDropdownOpen)}
                          className="flex items-center gap-1 bg-[#241612] border border-[#38261E] px-2.5 py-1 rounded text-xs text-[#D97938] font-bold hover:border-[#D97938] transition-colors cursor-pointer"
                        >
                          <span>{ensDomain}</span>
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        {isEnsDropdownOpen && (
                          <div className="absolute right-0 top-full mt-1.5 w-24 rounded-lg bg-[#241612] border border-[#38261E] py-1 shadow-xl z-20">
                            {['.eth', '.crypto', '.nft'].map((dom) => (
                              <button
                                key={dom}
                                type="button"
                                onClick={() => {
                                  setEnsDomain(dom)
                                  setIsEnsDropdownOpen(false)
                                }}
                                className="w-full px-3 py-1 text-left text-xs text-white hover:bg-[#38261E] transition-colors cursor-pointer"
                              >
                                {dom}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linha 3: Apelido da carteira + Avatar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-start">
                  {/* Apelido da carteira */}
                  <div className="space-y-2">
                    <label className="text-xs text-[#C4BCB4] font-medium">
                      Apelido da carteira
                    </label>
                    <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 focus-within:border-[#D97938] transition-colors">
                      <input
                        type="text"
                        value={walletNickname}
                        onChange={(e) => setWalletNickname(e.target.value)}
                        placeholder="Apelido da carteira"
                        className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                      />
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="space-y-2">
                    <label className="text-xs text-[#C4BCB4] font-medium">
                      Avatar
                    </label>
                    <div className="flex items-center gap-4 pt-1">
                      {/* Avatar preview */}
                      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-[#241612] border border-[#38261E] shrink-0 flex items-center justify-center">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6 text-[#7A6D64]" />
                        )}
                      </div>

                      {/* Botão Alterar */}
                      <button
                        type="button"
                        onClick={handleChangeAvatar}
                        className="rounded-[8px] bg-[#D97938] hover:bg-[#E58847] px-4 py-2 text-xs font-bold text-[#140D0A] uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Alterar
                      </button>

                      {/* Botão Remover */}
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="text-xs text-[#998F86] hover:text-white hover:underline transition-colors cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-seção: Alterar senha */}
                <div className="pt-6 border-t border-[#38261E] space-y-4">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Alterar senha
                  </h3>

                  {/* Senha atual */}
                  <div className="space-y-2 max-w-xl">
                    <label className="text-xs text-[#C4BCB4] font-medium">
                      Senha atual
                    </label>
                    <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 flex items-center justify-between focus-within:border-[#D97938] transition-colors">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Senha atual"
                        className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="text-[#8A7E75] hover:text-[#C4BCB4] transition-colors ml-2 cursor-pointer"
                        aria-label="Exibir ou ocultar senha"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Nova senha */}
                  <div className="space-y-2 max-w-xl">
                    <label className="text-xs text-[#C4BCB4] font-medium">
                      Nova senha
                    </label>
                    <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 flex items-center justify-between focus-within:border-[#D97938] transition-colors">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nova senha"
                        className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-[#8A7E75] hover:text-[#C4BCB4] transition-colors ml-2 cursor-pointer"
                        aria-label="Exibir ou ocultar nova senha"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar nova senha */}
                  <div className="space-y-2 max-w-xl">
                    <label className="text-xs text-[#C4BCB4] font-medium">
                      Confirmar nova senha
                    </label>
                    <div className="rounded-[8px] border border-[#38261E] bg-[#170E0B] px-4 py-3 flex items-center justify-between focus-within:border-[#D97938] transition-colors">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar nova senha"
                        className="w-full bg-transparent text-xs text-white placeholder-[#7A6D64] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-[#8A7E75] hover:text-[#C4BCB4] transition-colors ml-2 cursor-pointer"
                        aria-label="Exibir ou ocultar confirmação de senha"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Botão Salvar */}
                <div className="pt-6">
                  <button
                    type="submit"
                    className="rounded-[8px] bg-[#D97938] hover:bg-[#E58847] active:scale-[0.99] px-8 py-3 text-xs font-bold text-[#140D0A] uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          ) : activeTab === 'carteiras' ? (
            <CollectorWallets />
          ) : (
            <div className="py-24 text-center space-y-3">
              <h2 className="text-base font-bold text-white capitalize">
                {activeTab}
              </h2>
              <p className="text-xs text-[#998F86]">
                Nenhum registro encontrado nesta seção no momento.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
