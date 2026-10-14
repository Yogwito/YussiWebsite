// Clientes que han confiado en Bordados Yussi.
//
// Este manifiesto es la fuente única de la sección "Clientes" (#clients).
// El renderer (src/clients.js) SOLO muestra entradas con `status: 'verified'`
// que además tengan un `logo`. El resto queda documentado aquí para trazabilidad
// y para incorporarse al mismo pipeline cuando el cliente envíe el asset.
//
// Campos:
//   name        Nombre comercial tal como lo entregó Bordados Yussi (referencia).
//   identified  Nombre jurídico/institucional identificado durante la investigación.
//   slug        kebab-case, usado para el archivo del logo.
//   logo        Ruta del asset final en /img/clients/… (null si no hay asset verificado).
//   category    education | university | public | sports | mall | food | fuel-auto |
//               beauty-health | construction | hotel | pets | fashion | other
//   location    Ciudad/país de referencia comercial.
//   confidence  high | medium | low  (certeza de identidad).
//   status      verified | needs_user_confirmation | needs_user_asset | skipped
//   featured    (opcional) orden entre las marcas destacadas de la sección.
//
// REGLA: no se marca `verified` un logo cuya identidad no esté comprobada.

export const clients = [
  // ── Instituciones educativas / colegios ──────────────────────────────────
  { name: 'Lans', identified: null, slug: 'lans', logo: null, category: 'education', location: 'Manizales, CO', confidence: 'low', status: 'needs_user_asset' },
  { name: 'Universitario (Educación Física)', identified: null, slug: 'universitario-ed-fisica', logo: null, category: 'education', location: 'Manizales, CO', confidence: 'low', status: 'needs_user_asset' },
  { name: 'Tecnológico', identified: null, slug: 'tecnologico', logo: null, category: 'education', location: 'Manizales, CO', confidence: 'low', status: 'needs_user_asset' },
  { name: 'San Felipe Neri', identified: null, slug: 'san-felipe-neri', logo: null, category: 'education', location: 'Manizales, CO', confidence: 'low', status: 'needs_user_asset' },
  { name: 'Instituto para la Ciencia', identified: null, slug: 'instituto-para-la-ciencia', logo: '/img/clients/instituto-para-la-ciencia.webp', category: 'education', location: 'Manizales, CO', confidence: 'high', status: 'verified' },
  { name: 'SENA', identified: 'Servicio Nacional de Aprendizaje (SENA)', slug: 'sena', logo: '/img/clients/sena.svg', category: 'education', location: 'Colombia', confidence: 'high', status: 'verified', featured: 1 },
  { name: 'Cruzada Social', identified: null, slug: 'cruzada-social', logo: null, category: 'education', location: 'Manizales, CO', confidence: 'low', status: 'needs_user_asset' },

  // ── Universidades ─────────────────────────────────────────────────────────
  { name: 'Universidad Católica', identified: 'Universidad Católica de Manizales (UCM)', slug: 'universidad-catolica-manizales', logo: '/img/clients/universidad-catolica-manizales.webp', category: 'university', location: 'Manizales, CO', confidence: 'high', status: 'verified' },
  { name: 'Universidad de Manizales', identified: 'Universidad de Manizales', slug: 'universidad-de-manizales', logo: '/img/clients/universidad-de-manizales.webp', category: 'university', location: 'Manizales, CO', confidence: 'high', status: 'verified' },
  { name: 'Universidad Autónoma de Manizales', identified: 'Universidad Autónoma de Manizales (UAM)', slug: 'universidad-autonoma-manizales', logo: '/img/clients/universidad-autonoma-manizales.webp', category: 'university', location: 'Manizales, CO', confidence: 'high', status: 'verified' },
  { name: 'Universidad de Caldas', identified: 'Universidad de Caldas', slug: 'universidad-de-caldas', logo: '/img/clients/universidad-de-caldas.svg', category: 'university', location: 'Manizales, CO', confidence: 'high', status: 'verified' },
  { name: 'Universidad Nacional', identified: 'Universidad Nacional de Colombia (Sede Manizales)', slug: 'universidad-nacional', logo: '/img/clients/universidad-nacional.svg', category: 'university', location: 'Colombia', confidence: 'high', status: 'verified', featured: 6 },
  { name: 'Universidad del Quindío', identified: 'Universidad del Quindío', slug: 'universidad-del-quindio', logo: '/img/clients/universidad-del-quindio.webp', category: 'university', location: 'Armenia, CO', confidence: 'high', status: 'verified' },

  // ── Instituciones públicas y organizaciones ──────────────────────────────
  { name: 'Cruz Roja', identified: 'Cruz Roja Colombiana', slug: 'cruz-roja', logo: '/img/clients/cruz-roja.svg', category: 'public', location: 'Colombia', confidence: 'high', status: 'verified' },
  { name: 'Alcaldía', identified: 'Alcaldía de Manizales', slug: 'alcaldia-manizales', logo: '/img/clients/alcaldia-manizales.svg', category: 'public', location: 'Manizales, CO', confidence: 'high', status: 'verified' },
  { name: 'Gobernación', identified: 'Gobernación de Caldas', slug: 'gobernacion-caldas', logo: '/img/clients/gobernacion-caldas.svg', category: 'public', location: 'Caldas, CO', confidence: 'high', status: 'verified' },
  { name: 'Policía', identified: 'Policía Nacional de Colombia', slug: 'policia-nacional', logo: '/img/clients/policia-nacional.webp', category: 'public', location: 'Colombia', confidence: 'high', status: 'verified', featured: 2 },
  { name: 'Tránsito', identified: null, slug: 'transito', logo: null, category: 'public', location: 'Manizales/Caldas, CO', confidence: 'low', status: 'needs_user_confirmation' },
  { name: 'Agencia Nacional de Turismo', identified: null, slug: 'agencia-nacional-turismo', logo: null, category: 'public', location: 'Colombia', confidence: 'low', status: 'needs_user_confirmation' },
  { name: 'Fiscalía General de la Nación', identified: 'Fiscalía General de la Nación', slug: 'fiscalia-general', logo: '/img/clients/fiscalia-general.svg', category: 'public', location: 'Colombia', confidence: 'high', status: 'verified' },
  { name: 'Registraduría', identified: 'Registraduría Nacional del Estado Civil', slug: 'registraduria-nacional', logo: '/img/clients/registraduria-nacional.webp', category: 'public', location: 'Colombia', confidence: 'high', status: 'verified' },
  { name: 'Cámara de Comercio', identified: 'Cámara de Comercio de Manizales por Caldas', slug: 'camara-comercio-manizales', logo: '/img/clients/camara-comercio-manizales.webp', category: 'public', location: 'Manizales, CO', confidence: 'high', status: 'verified' },
  { name: 'Federación Nacional de Cafeteros', identified: 'Federación Nacional de Cafeteros de Colombia', slug: 'federacion-cafeteros', logo: '/img/clients/federacion-cafeteros.webp', category: 'public', location: 'Colombia', confidence: 'high', status: 'verified' },
  { name: 'Arquidiócesis de Manizales', identified: 'Arquidiócesis de Manizales', slug: 'arquidiocesis-manizales', logo: '/img/clients/arquidiocesis-manizales.svg', category: 'public', location: 'Manizales, CO', confidence: 'high', status: 'verified' },
  { name: 'Comité Intergremial de Caldas', identified: 'Comité Intergremial de Caldas', slug: 'comite-intergremial-caldas', logo: '/img/clients/comite-intergremial-caldas.webp', category: 'public', location: 'Caldas, CO', confidence: 'high', status: 'verified' },
  { name: 'Artesanías de Aguadas', identified: null, slug: 'artesanias-de-aguadas', logo: null, category: 'public', location: 'Aguadas, Caldas, CO', confidence: 'low', status: 'needs_user_asset' },

  // ── Deportes ──────────────────────────────────────────────────────────────
  { name: 'Once Caldas', identified: 'Once Caldas S.A.', slug: 'once-caldas', logo: '/img/clients/once-caldas.svg', category: 'sports', location: 'Manizales, CO', confidence: 'high', status: 'verified', featured: 3 },

  // ── Centros comerciales ──────────────────────────────────────────────────
  { name: 'Centro Comercial Fundadores', identified: 'Centro Comercial Fundadores', slug: 'cc-fundadores', logo: '/img/clients/cc-fundadores.webp', category: 'mall', location: 'Manizales, CO', confidence: 'high', status: 'verified' },
  { name: 'Cable Plaza', identified: 'Centro Comercial Cable Plaza', slug: 'cable-plaza', logo: '/img/clients/cable-plaza.webp', category: 'mall', location: 'Manizales, CO', confidence: 'high', status: 'verified' },
  { name: 'Parque Caldas', identified: null, slug: 'parque-caldas', logo: '/img/clients/parque-caldas.webp', category: 'mall', location: 'Manizales, CO', confidence: 'high', status: 'verified' },
  { name: 'Sancancio', identified: 'Centro Comercial Sancancio', slug: 'sancancio', logo: null, category: 'mall', location: 'Manizales, CO', confidence: 'medium', status: 'needs_user_asset' },

  // ── Alimentos / restaurantes / cafés ─────────────────────────────────────
  { name: 'Juan Valdez Café', identified: 'Juan Valdez Café', slug: 'juan-valdez', logo: '/img/clients/juan-valdez.webp', category: 'food', location: 'Colombia', confidence: 'high', status: 'verified', featured: 4 },
  { name: 'Dragón Jar', identified: 'DragonJAR (seguridad informática)', slug: 'dragon-jar', logo: '/img/clients/dragon-jar.webp', category: 'food', location: 'CO', confidence: 'high', status: 'verified' },
  { name: 'Fandebonos', identified: null, slug: 'fandebonos', logo: null, category: 'food', location: 'CO', confidence: 'low', status: 'needs_user_asset' },
  { name: 'Burger House (Costa Rica)', identified: null, slug: 'burger-house-cr', logo: null, category: 'food', location: 'Costa Rica', confidence: 'low', status: 'needs_user_asset' },
  { name: 'La Vikina', identified: null, slug: 'la-vikina', logo: '/img/clients/la-vikina.webp', category: 'food', location: 'CO', confidence: 'high', status: 'verified' },
  { name: 'Puerta Negra', identified: null, slug: 'puerta-negra', logo: null, category: 'food', location: 'Manizales, CO', confidence: 'low', status: 'needs_user_asset' },
  { name: 'Margaritas', identified: null, slug: 'margaritas', logo: null, category: 'food', location: 'CO', confidence: 'low', status: 'needs_user_asset' },
  { name: 'La Burguer', identified: null, slug: 'la-burguer', logo: '/img/clients/la-burguer.webp', category: 'food', location: 'CO', confidence: 'high', status: 'verified' },
  { name: 'Oryza', identified: null, slug: 'oryza', logo: '/img/clients/oryza.webp', category: 'food', location: 'CO', confidence: 'high', status: 'verified' },
  { name: 'Juicio', identified: null, slug: 'juicio', logo: '/img/clients/juicio.webp', category: 'food', location: 'CO', confidence: 'high', status: 'verified' },

  // ── Combustibles / automotriz ────────────────────────────────────────────
  { name: 'Terpel', identified: 'Organización Terpel S.A.', slug: 'terpel', logo: '/img/clients/terpel.webp', category: 'fuel-auto', location: 'Colombia', confidence: 'high', status: 'verified', featured: 5 },
  { name: 'Unique Detailing Center', identified: null, slug: 'unique-detailing-center', logo: '/img/clients/unique-detailing-center.webp', category: 'fuel-auto', location: 'CO', confidence: 'high', status: 'verified' },

  // ── Belleza / salud / estética ───────────────────────────────────────────
  { name: 'Beauty Market', identified: null, slug: 'beauty-market', logo: '/img/clients/beauty-market.webp', category: 'beauty-health', location: 'CO', confidence: 'high', status: 'verified' },
  { name: 'Kuma', identified: null, slug: 'kuma', logo: '/img/clients/kuma.webp', category: 'beauty-health', location: 'CO', confidence: 'high', status: 'verified' },
  { name: 'Natural Sun Time Spa', identified: null, slug: 'natural-sun-time-spa', logo: '/img/clients/natural-sun-time-spa.webp', category: 'beauty-health', location: 'CO', confidence: 'high', status: 'verified' },
  { name: 'CEDER', identified: null, slug: 'ceder', logo: '/img/clients/ceder.webp', category: 'beauty-health', location: 'CO', confidence: 'high', status: 'verified' },
  { name: 'Lumia Odontología', identified: null, slug: 'lumia-odontologia', logo: '/img/clients/lumia-odontologia.webp', category: 'beauty-health', location: 'CO', confidence: 'high', status: 'verified' },
  { name: '24K Odontología', identified: null, slug: '24k-odontologia', logo: null, category: 'beauty-health', location: 'CO', confidence: 'low', status: 'needs_user_asset' },
  { name: 'MK Aesthetic (New York)', identified: null, slug: 'mk-aesthetic-ny', logo: null, category: 'beauty-health', location: 'New York, USA', confidence: 'low', status: 'needs_user_asset' },
  { name: 'Vanity Clinic (Barcelona)', identified: null, slug: 'vanity-clinic-bcn', logo: null, category: 'beauty-health', location: 'Barcelona, ES', confidence: 'low', status: 'needs_user_asset' },
  { name: 'Dental Tek (Florida)', identified: null, slug: 'dental-tek-fl', logo: null, category: 'beauty-health', location: 'Florida, USA', confidence: 'low', status: 'needs_user_asset' },

  // ── Construcción / empresas ──────────────────────────────────────────────
  { name: 'Realto Construcciones', identified: null, slug: 'realto-construcciones', logo: null, category: 'construction', location: 'CO', confidence: 'low', status: 'needs_user_asset' },
  { name: 'Constructora Hungría', identified: null, slug: 'constructora-hungria', logo: '/img/clients/constructora-hungria.webp', category: 'construction', location: 'CO', confidence: 'high', status: 'verified' },
  { name: 'TM SAS', identified: null, slug: 'tm-sas', logo: null, category: 'construction', location: 'CO', confidence: 'low', status: 'needs_user_asset' },
  { name: 'Disblanco', identified: null, slug: 'disblanco', logo: '/img/clients/disblanco.webp', category: 'construction', location: 'CO', confidence: 'high', status: 'verified' },

  // ── Hoteles ───────────────────────────────────────────────────────────────
  { name: 'Hotel Carretero', identified: 'Hotel Carretero', slug: 'hotel-carretero', logo: '/img/clients/hotel-carretero.webp', category: 'hotel', location: 'Manizales, CO', confidence: 'high', status: 'verified' },
  { name: 'Hotel Termales del Ruiz', identified: 'Hotel Termales del Ruiz', slug: 'termales-del-ruiz', logo: '/img/clients/termales-del-ruiz.webp', category: 'hotel', location: 'Caldas, CO', confidence: 'high', status: 'verified' },
  { name: 'Hotel Carolina (Costa Rica)', identified: null, slug: 'hotel-carolina-cr', logo: null, category: 'hotel', location: 'Costa Rica', confidence: 'low', status: 'needs_user_asset' },
  { name: 'Salamina Highs Hotel', identified: null, slug: 'salamina-highs-hotel', logo: null, category: 'hotel', location: 'Salamina, Caldas, CO', confidence: 'low', status: 'needs_user_asset' },

  // ── Mascotas / servicios internacionales ─────────────────────────────────
  { name: 'Bark Pals (Miami)', identified: null, slug: 'bark-pals-miami', logo: null, category: 'pets', location: 'Miami, USA', confidence: 'low', status: 'needs_user_asset' },

  // ── Moda / entretenimiento ───────────────────────────────────────────────
  { name: 'Maja Colombia', identified: null, slug: 'maja-colombia', logo: null, category: 'fashion', location: 'Colombia', confidence: 'low', status: 'needs_user_asset' },

  // ── Otros ─────────────────────────────────────────────────────────────────
  { name: 'Vapor House', identified: null, slug: 'vapor-house', logo: null, category: 'other', location: 'CO', confidence: 'low', status: 'needs_user_asset' }
]

// Solo estos se renderizan en el marquee.
export const verifiedClients = clients.filter((c) => c.status === 'verified' && c.logo)
