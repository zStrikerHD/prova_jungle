interface DiarioArticle {
  id: string
  date: string
  readTime: string
  title: string
  description: string
  image: string
  alt: string
  href: string
}

const articles: DiarioArticle[] = [
  {
    id: 'propriedade-nfts',
    date: '12 de setembro',
    readTime: 'Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs',
    description: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
    image: '/assets/nfts/ape-turtleneck.jpg',
    alt: 'NFT Macaco Gola Alta - Como funciona a propriedade de NFTs',
    href: '#diario',
  },
  {
    id: 'artistas-digitais',
    date: '13 de setembro',
    readTime: 'Leitura de 2 min',
    title: '10 artistas digitais para acompanhar',
    description: 'Conheça criadores que moldam a cultura digital.',
    image: '/assets/nfts/hero-ape.jpg',
    alt: 'NFT Macaco Jaqueta Verde - 10 artistas digitais para acompanhar',
    href: '#diario',
  },
  {
    id: 'raridade-atributos',
    date: '15 de setembro',
    readTime: 'Leitura de 3 min',
    title: 'Raridade, atributos e procedência',
    description: 'Entenda raridade, procedência, direitos autorais e utilidade.',
    image: '/assets/nfts/ape-bucket-hat.jpg',
    alt: 'NFT Macaco Chapéu Bucket - Raridade, atributos e procedência',
    href: '#diario',
  },
  {
    id: 'proteger-carteira',
    date: '15 de setembro',
    readTime: 'Leitura de 2 min',
    title: 'Como proteger sua carteira',
    description: 'Proteja sua carteira, seus ativos e sua identidade.',
    image: '/assets/nfts/ape-headphones.jpg',
    alt: 'NFT Macaco Headphone - Como proteger sua carteira',
    href: '#diario',
  },
]

interface NFTOnProps {
  className?: string
}

export function NFTOn({ className = '' }: NFTOnProps) {
  return (
    <section className={`col-span-full w-full py-12 ${className}`}>
      {/* Cabeçalho Centralizado */}
      <div className="text-center space-y-2 mb-10">
        <h2 className="font-mono text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
          Diário da Cunhagem
        </h2>
        <p className="font-mono text-xs sm:text-sm text-[#A39B95] max-w-2xl mx-auto leading-relaxed">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </div>

      {/* Grid com os 4 Cards de Artigos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.map((item) => (
          <article
            key={item.id}
            className="group flex flex-col rounded-[20px] bg-[#1C1512] border border-[#2A201A] shadow-xl shadow-black/40 hover:border-[#D97938]/40 transition-all duration-300 overflow-hidden"
          >
            {/* Imagem do Card com cantos arredondados */}
            <div className="relative aspect-square w-full overflow-hidden rounded-t-[20px] rounded-b-2xl bg-[#140E0A]">
              <img
                src={item.image}
                alt={item.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Conteúdo do Artigo */}
            <div className="flex flex-1 flex-col justify-between p-5 text-left font-mono">
              <div>
                {/* Data e Tempo de Leitura */}
                <div className="text-[11px] sm:text-xs text-[#8A7E75] tracking-wide">
                  {item.date} <span className="mx-1 text-[#4A3D34]">|</span> {item.readTime}
                </div>

                {/* Título */}
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug mt-2.5 mb-2 group-hover:text-[#D97938] transition-colors">
                  {item.title}
                </h3>

                {/* Descrição */}
                <p className="text-xs text-[#A39B95] leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              {/* Link Ler mais com seta */}
              <div className="pt-2">
                <a
                  href={item.href}
                  className="group/link inline-flex items-center gap-1.5 text-xs font-bold text-[#D97938] hover:text-[#E58847] transition-colors"
                >
                  <span>Ler mais</span>
                  <span className="transition-transform group-hover/link:translate-x-1">→</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default NFTOn