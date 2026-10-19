import { useState } from 'react'

export function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <footer className="w-full bg-[#140D0A] text-white font-mono pt-4 pb-6">
      {/* Bloco Principal com o fundo marrom oficial do Figma: #241612, cantos retos/quadrados e margem de 120px */}
      <div className="mx-6 lg:mx-[120px] bg-[#241612] overflow-hidden border border-[#38231C]">
        
        {/* 1. Top Section: Features e Newsletter */}
        <div className="w-full px-6 lg:px-12 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0">
            
            {/* Card 1: W - Segurança da carteira */}
            <div className="lg:pr-8 lg:border-r border-[#38231C] flex flex-col justify-start">
              <div className="w-14 h-14 rounded-full bg-[#D97938] flex items-center justify-center text-xl font-bold text-[#140D0A] select-none shadow-md shadow-[#D97938]/10">
                W
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-5 mb-2.5 tracking-wide">
                Segurança da carteira
              </h3>
              <p className="text-xs text-[#A39B95] leading-relaxed max-w-[240px]">
                Proteja sua carteira e colecione arte digital verificada com confiança.
              </p>
            </div>

            {/* Card 2: C - Criadores em destaque */}
            <div className="lg:px-8 lg:border-r border-[#38231C] flex flex-col justify-start">
              <div className="w-14 h-14 rounded-full bg-[#D97938] flex items-center justify-center text-xl font-bold text-[#140D0A] select-none shadow-md shadow-[#D97938]/10">
                C
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-5 mb-2.5 tracking-wide">
                Criadores em destaque
              </h3>
              <p className="text-xs text-[#A39B95] leading-relaxed max-w-[240px]">
                Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.
              </p>
            </div>

            {/* Card 3: D - Alertas de lançamentos */}
            <div className="lg:px-8 lg:border-r border-[#38231C] flex flex-col justify-start">
              <div className="w-14 h-14 rounded-full bg-[#D97938] flex items-center justify-center text-xl font-bold text-[#140D0A] select-none shadow-md shadow-[#D97938]/10">
                D
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-5 mb-2.5 tracking-wide">
                Alertas de lançamentos
              </h3>
              <p className="text-xs text-[#A39B95] leading-relaxed max-w-[240px]">
                Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.
              </p>
            </div>

            {/* Card 4: Newsletter */}
            <div className="lg:pl-8 flex flex-col justify-start">
              <h3 className="text-sm sm:text-base font-bold text-white leading-snug mb-4 tracking-wide">
                Antecipe-se ao próximo<br />lançamento
              </h3>

              <form onSubmit={handleSubscribe} className="flex items-center rounded-lg overflow-hidden bg-[#1C110E] border border-[#3E251E] focus-within:border-[#D97938]/60 transition-colors">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="digite seu e-mail..."
                  className="flex-1 min-w-0 bg-transparent px-3.5 py-2.5 text-xs text-white placeholder:text-[#6E5D52] font-mono focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#D97938] hover:bg-[#E58847] active:scale-95 text-[#140D0A] font-mono text-xs font-bold px-4 py-2.5 transition-all cursor-pointer shrink-0"
                >
                  {subscribed ? 'Enviado!' : 'Enviar'}
                </button>
              </form>

              <p className="text-xs text-[#A39B95] leading-relaxed mt-3 max-w-[260px]">
                Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
              </p>
            </div>

          </div>
        </div>

        {/* 2. Middle Banner Bar: KURIO | Feito para colecionadores... | contato@email.com | +55 11 4002 8922 */}
        <div className="w-full bg-[#352019] border-y border-[#442A20]/60 py-3.5">
          <div className="w-full px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#C4BCB4]">
            <span className="font-bold text-white tracking-widest text-sm">
              KURIO
            </span>
            <span className="text-center md:text-left text-[#A39B95]">
              Feito para colecionadores, criadores e cultura
            </span>
            <a
              href="mailto:contato@email.com"
              className="hover:text-white transition-colors"
            >
              contato@email.com
            </a>
            <a
              href="tel:+551140028922"
              className="hover:text-white transition-colors"
            >
              +55 11 4002 8922
            </a>
          </div>
        </div>

        {/* 3. Bottom Links & Redes Sociais */}
        <div className="w-full px-6 lg:px-12 pt-12 pb-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            
            {/* Coluna 1: Meu perfil */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white tracking-wider">
                Meu perfil
              </h4>
              <ul className="space-y-2 text-xs text-[#A39B95]">
                <li><a href="#perfil" className="hover:text-white transition-colors">Meu perfil</a></li>
                <li><a href="#colecao" className="hover:text-white transition-colors">Minha coleção</a></li>
                <li><a href="#atividade" className="hover:text-white transition-colors">Atividade</a></li>
                <li><a href="#estudio" className="hover:text-white transition-colors">Estúdio do criador</a></li>
                <li><a href="#interesse" className="hover:text-white transition-colors">Lista de interesse</a></li>
              </ul>
            </div>

            {/* Coluna 2: Central de ajuda */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white tracking-wider">
                Central de ajuda
              </h4>
              <ul className="space-y-2 text-xs text-[#A39B95]">
                <li><a href="#ajuda" className="hover:text-white transition-colors">Central de ajuda</a></li>
                <li><a href="#como-comprar" className="hover:text-white transition-colors">Como comprar NFTs</a></li>
                <li><a href="#carteira-seguranca" className="hover:text-white transition-colors">Carteira e segurança</a></li>
                <li><a href="#politica" className="hover:text-white transition-colors">Política do mercado</a></li>
                <li><a href="#denunciar" className="hover:text-white transition-colors">Denunciar item</a></li>
              </ul>
            </div>

            {/* Coluna 3: Coleções */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white tracking-wider">
                Coleções
              </h4>
              <ul className="space-y-2 text-xs text-[#A39B95]">
                <li><a href="#mercado" className="hover:text-white transition-colors">Arte digital</a></li>
                <li><a href="#mercado" className="hover:text-white transition-colors">Fotografia</a></li>
                <li><a href="#mercado" className="hover:text-white transition-colors">Música</a></li>
                <li><a href="#mercado" className="hover:text-white transition-colors">Arte 3D</a></li>
                <li><a href="#mercado" className="hover:text-white transition-colors">Utilidade</a></li>
              </ul>
            </div>

            {/* Coluna 4: Redes sociais e Carteiras compatíveis */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white tracking-wider mb-3">
                  Redes sociais
                </h4>
                <div className="flex items-center gap-2.5">
                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-lg border border-[#3E251E] bg-[#1C110E] flex items-center justify-center text-[#A39B95] hover:text-[#D97938] hover:border-[#D97938]/50 transition-all"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-lg border border-[#3E251E] bg-[#1C110E] flex items-center justify-center text-[#A39B95] hover:text-[#D97938] hover:border-[#D97938]/50 transition-all"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>

                  {/* Twitter / X */}
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Twitter"
                    className="w-8 h-8 rounded-lg border border-[#3E251E] bg-[#1C110E] flex items-center justify-center text-[#A39B95] hover:text-[#D97938] hover:border-[#D97938]/50 transition-all"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="w-8 h-8 rounded-lg border border-[#3E251E] bg-[#1C110E] flex items-center justify-center text-[#A39B95] hover:text-[#D97938] hover:border-[#D97938]/50 transition-all"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="w-8 h-8 rounded-lg border border-[#3E251E] bg-[#1C110E] flex items-center justify-center text-[#A39B95] hover:text-[#D97938] hover:border-[#D97938]/50 transition-all"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Carteiras compatíveis */}
              <div>
                <h4 className="text-sm font-bold text-white tracking-wider mb-2.5">
                  Carteiras compatíveis
                </h4>
                <div className="inline-flex items-center gap-2 rounded-md border border-[#3E251E] bg-[#1C110E] px-3 py-1.5 text-[10px] tracking-widest text-[#8A7E75] select-none">
                  <span>METAMASK</span>
                  <span className="text-[#5A382C]">•</span>
                  <span>WALLETCONNECT</span>
                  <span className="text-[#5A382C]">•</span>
                  <span>COINBASE</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 4. Copyright no fundo padrão da página */}
      <div className="py-8 text-center text-xs text-[#8A7E75]">
        <p>© 2026 Kurio. Propriedade digital para todos.</p>
      </div>
    </footer>
  )
}

export default Footer
