import type { NFT } from '@/types'

// Imagens locais do projeto
const apeHero = '/assets/nfts/hero-ape.jpg'
const apeBucket = '/assets/nfts/ape-bucket-hat.jpg'
const apeTurtleneck = '/assets/nfts/ape-turtleneck.jpg'
const apeHeadphones = '/assets/nfts/ape-headphones.jpg'

// Itens icônicos do Figma (primeiros 12 itens de "Arte digital")
const figmaTopItems = [
  {
    id: '1',
    title: 'Emerald Ape #042',
    description: 'Chimpanzé lendário com jaqueta bomber verde esmeralda e óculos escuros clássicos.',
    imageUrl: apeHero,
    priceEth: '1.19',
    author: 'Kurio Studios',
    authorAvatar: apeHero,
    edition: '#042 de 100',
    totalEditions: 100,
    availableEditions: 14,
    category: 'Arte digital',
    network: 'Ethereum',
    likesCount: 142,
  },
  {
    id: '2',
    title: 'Sage Nomad #009',
    description: 'Viajante solitário com chapéu bucket verde musgo e moletom roxo neon.',
    imageUrl: apeBucket,
    priceEth: '1.69',
    author: 'Kurio Studios',
    authorAvatar: apeBucket,
    edition: '#009 de 50',
    totalEditions: 50,
    availableEditions: 7,
    category: 'Arte digital',
    network: 'Ethereum',
    likesCount: 230,
  },
  {
    id: '3',
    title: 'Neon Vessel #552',
    description: 'Lorde cibernético com gola alta esmeralda, brinco de ouro e blazer marfim.',
    imageUrl: apeTurtleneck,
    priceEth: '1.99',
    author: 'Vessel Labs',
    authorAvatar: apeTurtleneck,
    edition: '#552 de 1000',
    totalEditions: 1000,
    availableEditions: 88,
    category: 'Arte digital',
    network: 'Ethereum',
    likesCount: 412,
  },
  {
    id: '4',
    title: 'Cosmic Bloom #118',
    description: 'Edição limitada em tons místicos com moletom lilás e chapéu clássico.',
    imageUrl: apeHeadphones,
    priceEth: '1.29',
    author: 'Kurio Studios',
    authorAvatar: apeBucket,
    edition: '#118 de 300',
    totalEditions: 300,
    availableEditions: 22,
    category: 'Arte digital',
    network: 'Ethereum',
    likesCount: 89,
  },
  {
    id: '5',
    title: 'Violet Nomad #314',
    description: 'Chimpanzé explorador com expressão serena e moletom confortável.',
    imageUrl: apeBucket,
    priceEth: '1.39',
    author: 'Kurio Studios',
    authorAvatar: apeBucket,
    edition: '#314 de 500',
    totalEditions: 500,
    availableEditions: 45,
    category: 'Arte digital',
    network: 'Ethereum',
    likesCount: 110,
  },
  {
    id: '6',
    title: 'Ivory Baron #088',
    description: 'Visual elegante com terno bege refinado e olhar perspicaz.',
    imageUrl: apeTurtleneck,
    priceEth: '1.79',
    author: 'Vessel Labs',
    authorAvatar: apeTurtleneck,
    edition: '#088 de 250',
    totalEditions: 250,
    availableEditions: 12,
    category: 'Arte digital',
    network: 'Ethereum',
    likesCount: 305,
  },
  {
    id: '7',
    title: 'Golden Beat #207',
    description: 'Músico digital com fones estéreo dourados e jaqueta esportiva bomber.',
    imageUrl: apeHeadphones,
    priceEth: '0.99',
    author: 'SoundBeat',
    authorAvatar: apeHeadphones,
    edition: '#207 de 100',
    totalEditions: 100,
    availableEditions: 3,
    category: 'Arte digital',
    network: 'Ethereum',
    likesCount: 178,
  },
  {
    id: '8',
    title: 'Golden Pulse #104',
    description: 'Harmônicos digitais com fones de alta fidelidade e tonalidade dourada.',
    imageUrl: apeHeadphones,
    priceEth: '0.69',
    author: 'SoundBeat',
    authorAvatar: apeHeadphones,
    edition: '#104 de 200',
    totalEditions: 200,
    availableEditions: 18,
    category: 'Arte digital',
    network: 'Ethereum',
    likesCount: 145,
  },
  {
    id: '9',
    title: 'Golden Signal #160',
    description: 'Conectado aos nós descentralizados com áudio de alta fidelidade.',
    imageUrl: apeHeadphones,
    priceEth: '0.39',
    author: 'SoundBeat',
    authorAvatar: apeHeadphones,
    edition: '#160 de 200',
    totalEditions: 200,
    availableEditions: 19,
    category: 'Arte digital',
    network: 'Ethereum',
    likesCount: 95,
  },
  {
    id: '10',
    title: 'Cyber Genesis #001',
    description: 'Gênese do metaverso em alta definição fotográfica.',
    imageUrl: apeHero,
    priceEth: '5.50',
    author: 'Aiko Takahashi',
    authorAvatar: apeHero,
    edition: '#001 de 10',
    totalEditions: 10,
    availableEditions: 2,
    category: 'Arte digital',
    network: 'Ethereum',
    likesCount: 512,
  },
  {
    id: '11',
    title: 'Quantum Ape #777',
    description: 'Arte generativa algorítmica compilada a partir de blocos ethereum.',
    imageUrl: apeTurtleneck,
    priceEth: '0.08',
    author: 'Vessel Labs',
    authorAvatar: apeTurtleneck,
    edition: '#777 de 1000',
    totalEditions: 1000,
    availableEditions: 120,
    category: 'Arte digital',
    network: 'Ethereum',
    likesCount: 64,
  },
  {
    id: '12',
    title: 'Battle Ape Titan',
    description: 'Personagem jogável para arenas competitivas no ecossistema Web3.',
    imageUrl: apeHero,
    priceEth: '0.45',
    author: 'Kurio Games',
    authorAvatar: apeHero,
    edition: '#014 de 150',
    totalEditions: 150,
    availableEditions: 32,
    category: 'Arte digital',
    network: 'Ethereum',
    likesCount: 88,
  },
]

// Demais itens para completar Arte digital (total = 33)
const extraDigitalArtTitles = [
  'Cyber Ronin #012', 'Solar Simian #077', 'Astral Ape #204', 'Obsidian Ape #100',
  'Zenith Chimp #033', 'Aura Primate #050', 'Chrono Beast #099', 'Hyperion Ape #018',
  'Neon Samurai #142', 'Genesis Vessel #888', 'Vortex Ape #007', 'Mirage Nomad #420',
  'Eclipse Primate #015', 'Radiant Simian #089', 'Titan Ape #055', 'Velvet Baron #120',
  'Shadow Nomad #300', 'Nova Vessel #999', 'Prism Ape #063', 'Celestial Ape #011',
  'Zero Ape #001'
]

const apeImages = [apeHero, apeBucket, apeTurtleneck, apeHeadphones]

// Outras categorias conforme Figma
const otherCategorySpecs = [
  {
    category: 'Fotografia',
    count: 12,
    prefix: 'Midnight Lens',
    author: 'Aiko Takahashi',
    desc: 'Fotografia urbana com iluminação noturna e texturas hiper-realistas.',
  },
  {
    category: 'Música',
    count: 65,
    prefix: 'Sonic Wave',
    author: 'SoundBeat',
    desc: 'Batidas subaquáticas e frequências graves sintetizadas em alta definição.',
  },
  {
    category: 'Arte 3D',
    count: 39,
    prefix: 'Voxel Horizon',
    author: 'Kurio 3D',
    desc: 'Escultura tridimensional com iluminação volumétrica e traçador de raios.',
  },
  {
    category: 'Colecionáveis',
    count: 23,
    prefix: 'Sage Nomad',
    author: 'Kurio Studios',
    desc: 'Peça de colecionador lendária com características raras do metaverso.',
  },
  {
    category: 'Generativa',
    count: 17,
    prefix: 'Quantum Ape',
    author: 'Vessel Labs',
    desc: 'Arte algorítmica compilada em tempo real diretamente da blockchain.',
  },
  {
    category: 'Jogos',
    count: 19,
    prefix: 'Cyber Gladiator',
    author: 'Kurio Games',
    desc: 'Personagem jogável e avatar customizável para arenas do metaverso.',
  },
  {
    category: 'Assinaturas',
    count: 13,
    prefix: 'VIP Alpha Pass',
    author: 'Kurio Protocol',
    desc: 'Acesso perpétuo a airdrops exclusivos, canais de alfa e lançamentos antecipados.',
  },
  {
    category: 'Utilidade',
    count: 18,
    prefix: 'Gas Reducer Pass',
    author: 'Kurio Protocol',
    desc: 'Subsídio automático de gas fees e cashback em transações.',
  },
]

// Distribuição exata das Redes: Ethereum: 119, Polygon: 78, Solana: 86
// 44 itens multi-rede (20 Eth+Poly, 15 Eth+Sol, 9 Poly+Sol) + 195 itens de rede única
// Os primeiros 33 itens (Arte digital) são todos Ethereum
const otherNetworkSlots: string[] = [
  ...Array(51).fill('Ethereum'), // 33 + 51 = 84 single-network Ethereum
  ...Array(20).fill('Ethereum, Polygon'), // +20 = 104
  ...Array(15).fill('Ethereum, Solana'), // +15 = 119 total Ethereum!
  ...Array(9).fill('Polygon, Solana'), // 20 + 9 + 49 = 78 total Polygon!
  ...Array(49).fill('Polygon'),
  ...Array(62).fill('Solana'), // 15 + 9 + 62 = 86 total Solana!
]

const samplePrices = [
  '0.08', '0.15', '0.29', '0.39', '0.55', '0.75', '0.99', '1.19', '1.29',
  '1.39', '1.49', '1.69', '1.79', '1.95', '1.99', '2.25', '2.50', '2.95',
  '3.40', '3.85', '4.20', '4.75', '5.10', '5.50', '6.20', '7.40', '8.90',
  '9.50', '10.20', '11.50', '11.80'
]

const allNFTs: NFT[] = []

// 1. Inserir os 12 itens icônicos do Figma
figmaTopItems.forEach((item, index) => {
  allNFTs.push({
    ...item,
    isFavorite: false,
    createdAt: new Date(Date.now() - index * 3600000).toISOString(),
  })
})

// 2. Inserir os 21 itens adicionais de Arte digital (totalizando 33)
extraDigitalArtTitles.forEach((title, idx) => {
  const idStr = String(13 + idx)
  const img = apeImages[(idx + 1) % apeImages.length]
  const price = samplePrices[(idx + 3) % samplePrices.length]
  allNFTs.push({
    id: idStr,
    title,
    description: 'Obra digital exclusiva da coleção oficial Kurio Arte Digital.',
    imageUrl: img,
    priceEth: price,
    author: 'Kurio Studios',
    authorAvatar: img,
    edition: `#${String(13 + idx).padStart(3, '0')} de 500`,
    totalEditions: 500,
    availableEditions: 24,
    category: 'Arte digital',
    network: 'Ethereum',
    isFavorite: false,
    likesCount: 80 + idx * 7,
    createdAt: new Date(Date.now() - (13 + idx) * 3600000).toISOString(),
  })
})

// 3. Inserir as demais categorias (Fotografia, Música, etc.)
let runningId = 34
let netSlotIndex = 0

for (const spec of otherCategorySpecs) {
  for (let i = 1; i <= spec.count; i++) {
    const idStr = String(runningId)
    const imgIndex = (runningId - 1) % apeImages.length
    const priceIndex = (runningId - 1) % samplePrices.length
    const net = otherNetworkSlots[netSlotIndex] || 'Polygon'
    netSlotIndex++

    allNFTs.push({
      id: idStr,
      title: `${spec.prefix} #${String(i).padStart(3, '0')}`,
      description: spec.desc,
      imageUrl: apeImages[imgIndex],
      priceEth: samplePrices[priceIndex],
      author: spec.author,
      authorAvatar: apeImages[imgIndex],
      edition: `#${String(i).padStart(3, '0')} de 300`,
      totalEditions: 300,
      availableEditions: 20,
      category: spec.category,
      network: net,
      isFavorite: false,
      likesCount: 40 + ((runningId * 19) % 500),
      createdAt: new Date(Date.now() - runningId * 3600000).toISOString(),
    })

    runningId++
  }
}

export const mockNFTs: NFT[] = allNFTs

export const collectionList = [
  'Arte digital',
  'Fotografia',
  'Música',
  'Arte 3D',
  'Colecionáveis',
  'Generativa',
  'Jogos',
  'Assinaturas',
  'Utilidade',
]

export const networkList = ['Ethereum', 'Polygon', 'Solana']

export const mockCategories = ['Todos', ...collectionList]
