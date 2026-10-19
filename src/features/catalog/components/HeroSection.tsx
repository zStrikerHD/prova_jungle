import { useState, useEffect } from 'react'
import { Search, ArrowRight } from 'lucide-react'

const slides = [
  {
    tag: 'Bem-vindo à Kurio',
    titleLine1: 'SEJA DONO DO FUTURO',
    titleLine2: 'DA ARTE DIGITAL',
    description:
      'Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.',
    image: '/assets/nfts/hero-ape.jpg',
    alt: 'NFT Macaco Jaqueta Verde',
  },
  {
    tag: 'Destaques da Semana',
    titleLine1: 'COLEÇÕES EXCLUSIVAS',
    titleLine2: 'E LIMITADAS',
    description:
      'Explore edições verificadas na blockchain. Valorize a originalidade e a arte gerada por artistas renomados da comunidade Web3.',
    image: '/assets/nfts/ape-bucket-hat.jpg',
    alt: 'NFT Macaco Chapéu Bucket',
  },
  {
    tag: 'Nova Geração',
    titleLine1: 'ARTE DIGITAL RARA',
    titleLine2: 'DIRETO NA BLOCKCHAIN',
    description:
      'Negocie obras de arte premium com liquidez instantânea e contratos inteligentes transparentes. Conecte sua carteira e comece agora.',
    image: '/assets/nfts/ape-turtleneck.jpg',
    alt: 'NFT Macaco Gola Alta',
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const slide = slides[currentSlide]

  return (
    <>
      {/* =======================================================
          LAYOUT MOBILE: Barra de Busca Exata + Card Banner Figma
         ======================================================= */}
      <div className="block md:hidden space-y-4 font-mono">
        {/* 1. Barra de Busca e Filtro (Screenshot 3 do Figma) */}
        <div className="flex items-center gap-2.5">
          {/* Campo de Busca escuro com texto e lupa dourados */}
          <div className="flex-1 h-[48px] rounded-[18px] border border-[#2E1E17] bg-[#1E1410] px-3.5 flex items-center gap-2.5">
            <Search className="h-4 w-4 text-[#C49A6C] shrink-0 stroke-[2.2]" />
            <input
              type="text"
              placeholder="Explorar coleções"
              className="w-full bg-transparent text-xs text-[#FAF4EE] placeholder-[#C49A6C] outline-none font-mono"
            />
          </div>

          {/* Botão de Filtro Sólido Âmbar com Ícone Escuro */}
          <button
            type="button"
            className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[18px] bg-[#C87C45] text-[#140D0A] shadow-md hover:bg-[#D97938] transition-colors cursor-pointer"
            aria-label="Abrir filtros"
          >
            {/* Ícone de Sliders com círculos característicos do Figma */}
            <svg
              className="h-4 w-4 text-[#140D0A]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="4" y1="8" x2="14" y2="8" />
              <circle cx="17" cy="8" r="2.5" fill="#140D0A" />
              <line x1="10" y1="16" x2="20" y2="16" />
              <circle cx="7" cy="16" r="2.5" fill="#140D0A" />
            </svg>
          </button>
        </div>

        {/* 2. Banner Card Mobile Exato (Screenshot 2 do Figma - 366 Fill × 190) */}
        <div className="relative rounded-[24px] bg-[#221510] p-4 sm:p-5 shadow-xl overflow-hidden min-h-[190px] flex flex-col justify-between">
          {/* Formas elípticas decorativas de fundo em tons de marrom conforme Figma */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 366 190" fill="none" preserveAspectRatio="none">
              <ellipse cx="60" cy="95" rx="100" ry="85" fill="#2E1B14" fillOpacity="0.5" />
              <ellipse cx="140" cy="100" rx="75" ry="90" fill="#382118" fillOpacity="0.4" />
            </svg>
          </div>

          <div className="relative z-10 flex items-start justify-between gap-3">
            {/* Texto Esquerdo */}
            <div className="space-y-1 max-w-[58%]">
              <span className="text-[11px] text-[#C49A6C] font-mono block">
                Bem-vindo à Kurio
              </span>

              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight leading-tight pt-0.5">
                SEJA DONO DA<br />CULTURA DIGITAL
              </h2>

              <p className="text-[11px] text-[#C49A6C]/90 leading-tight pt-1">
                Descubra NFTs selecionados de criadores do mundo todo.
              </p>

              <div className="pt-2">
                <a
                  href="#mercado"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97938] hover:text-[#E58847] uppercase tracking-wider transition-colors"
                >
                  <span>EXPLORAR</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </a>
              </div>
            </div>

            {/* Imagens Sobrepostas à Direita */}
            <div className="relative shrink-0 pr-1 pt-0.5">
              {/* Imagem Principal */}
              <div className="h-28 w-28 overflow-hidden rounded-[20px] bg-[#1C1512] shadow-xl">
                <img
                  src="/assets/nfts/hero-ape.jpg"
                  alt="NFT Macaco Destaque"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Imagem Secundária com Borda Clara Destacada */}
              <div className="absolute -bottom-1 -left-3 h-14 w-14 overflow-hidden rounded-[14px] border-2 border-[#FAF5EE] bg-[#FAF5EE] shadow-2xl">
                <img
                  src="/assets/nfts/ape-bucket-hat.jpg"
                  alt="NFT Macaco Secundário"
                  className="h-full w-full object-cover rounded-[12px]"
                />
              </div>
            </div>
          </div>

          {/* 3 Dots de Paginação Centralizados na base do card */}
          <div className="relative z-10 flex items-center justify-center gap-2 pt-3">
            {[0, 1, 2].map((idx) => (
              <span
                key={idx}
                className="h-2 w-2 rounded-full bg-[#D97938] inline-block opacity-90"
              />
            ))}
          </div>
        </div>
      </div>

      {/* =======================================================
          LAYOUT DESKTOP: Slider com Tipografia Ampla e Carrossel
         ======================================================= */}
      <section className="hidden md:block relative overflow-hidden py-10 md:py-16 font-mono">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-[110px] items-center">
          
          <div className="space-y-8 md:space-y-10 transition-all duration-500 ease-in-out">
            <span className="text-sm tracking-wider text-[#A39B95] block">
              {slide.tag}
            </span>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-white leading-[1.2] tracking-tight">
                {slide.titleLine1}
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-white leading-[1.2] tracking-tight">
                {slide.titleLine2}
              </h1>
            </div>

            <p className="text-sm leading-[1.8] text-[#A39B95] max-w-lg min-h-[60px]">
              {slide.description}
            </p>

            <div className="pt-4 md:pt-6">
              <a
                href="#mercado"
                className="inline-block rounded-xl bg-[#D97938] px-8 py-3.5 text-sm font-bold text-[#140E0A] tracking-wider uppercase shadow-lg shadow-[#D97938]/20 hover:bg-[#E58847] active:scale-95 transition-all"
              >
                EXPLORAR
              </a>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="relative aspect-square w-full max-w-[460px] overflow-hidden rounded-[32px] border border-[#2A201A] shadow-2xl shadow-black/60 bg-[#1C1613]">
              <img
                key={slide.image}
                src={slide.image}
                alt={slide.alt}
                fetchPriority={currentSlide === 0 ? 'high' : 'auto'}
                className="h-full w-full object-cover transition-opacity duration-700 ease-in-out"
              />
            </div>
          </div>

        </div>

        <div className="flex justify-center items-center gap-3 pt-10">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              aria-label={`Ir para slide ${index + 1}`}
              className={`h-6 flex items-center justify-center rounded-full transition-all duration-300 after:block after:h-2.5 after:rounded-full ${
                currentSlide === index
                  ? 'w-6 after:w-6 after:bg-[#D97938]'
                  : 'w-6 after:w-2.5 after:bg-[#382B23] hover:after:bg-[#A39B95]'
              }`}
            />
          ))}
        </div>
      </section>
    </>
  )
}
