import { ArrowRight } from 'lucide-react'

interface CollectionBannerItem {
  id: string
  titleLine1: string
  titleLine2: string
  descriptionLine1: string
  descriptionLine2: string
  descriptionLine3: string
  image: string
  alt: string
  href: string
}

const collections: CollectionBannerItem[] = [
  {
    id: 'genesis',
    titleLine1: 'Lançamentos gênesis',
    titleLine2: 'de edição limitada',
    descriptionLine1: 'Colecione edições escassas',
    descriptionLine2: 'diretamente dos criadores antes',
    descriptionLine3: 'da revelação pública.',
    image: '/assets/nfts/hero-ape.jpg',
    alt: 'NFT Macaco Jaqueta Verde - Edição Limitada',
    href: '#mercado',
  },
  {
    id: 'digital-art',
    titleLine1: 'Arte digital selecionada',
    titleLine2: 'e muito mais',
    descriptionLine1: 'Explore novos artistas,',
    descriptionLine2: 'coleções verificadas e obras',
    descriptionLine3: 'digitais que definem a cultura.',
    image: '/assets/nfts/ape-turtleneck.jpg',
    alt: 'NFT Macaco Gola Alta - Arte Digital Selecionada',
    href: '#mercado',
  },
]

interface NFTCollectionsProps {
  className?: string
}

export function NFTCollections({ className = '' }: NFTCollectionsProps) {
  return (
    <section className={`col-span-full w-full py-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col sm:flex-row items-stretch rounded-2xl bg-[#1C1613] border border-[#2A201A] shadow-xl shadow-black/40 hover:border-[#D97938]/40 transition-all duration-300 overflow-hidden"
          >
            {/* Imagem do NFT com cantos arredondados, sem espaçamento com o bg do card */}
            <div className="relative aspect-square w-full sm:w-48 md:w-56 lg:w-60 shrink-0 overflow-hidden rounded-2xl">
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                className="h-full w-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Conteúdo textual alinhado à direita com padding interno */}
            <div className="flex flex-1 flex-col justify-between items-end text-right p-5 sm:p-6 sm:pr-8 space-y-3 w-full">
              {/* Título Monospaçado em duas linhas */}
              <h3 className="font-mono text-base sm:text-lg lg:text-xl font-bold text-white tracking-wide leading-snug">
                {item.titleLine1}
                <br />
                {item.titleLine2}
              </h3>

              {/* Descrição em linhas */}
              <p className="font-mono text-xs sm:text-sm text-[#A39B95] leading-relaxed max-w-[280px]">
                {item.descriptionLine1}
                <br />
                {item.descriptionLine2}
                <br />
                {item.descriptionLine3}
              </p>

              {/* Botão Explorar */}
              <div className="pt-1">
                <a
                  href={item.href}
                  className="group/btn inline-flex items-center gap-1.5 rounded-lg bg-[#D97938] px-5 py-2 font-mono text-xs sm:text-sm font-bold text-[#140E0A] shadow-md hover:bg-[#E58847] active:scale-95 transition-all cursor-pointer"
                >
                  <span>Explorar</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default NFTCollections