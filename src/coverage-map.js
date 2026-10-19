import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Cobertura: globo 3D (three + three-globe), con el estilo de la imagen estática.
// En escritorio la sección se fija al llegar y el scroll recorre la animación
// de principio a fin (Caldas → Colombia → mundo); al terminar, la página sigue.
// El globo se puede girar arrastrando; al volver a hacer scroll la cámara
// retoma su recorrido. En móvil, con ahorro de datos o con movimiento reducido
// se muestra la imagen estática y el globo se carga a pedido.
const MANIZALES = { lat: 5.0703, lng: -75.5138 }
const STAGE_MODE = { caldas: 'caldas', colombia: 'colombia', abroad: 'world' }

// Recorrido de cámara: pausas en cada vista y transiciones entre ellas.
const KEYS = [
  { at: 0, view: { lat: 5.15, lng: -75.35, altitude: 0.42 } },
  { at: 0.18, view: { lat: 5.15, lng: -75.35, altitude: 0.42 } },
  { at: 0.42, view: { lat: 4.4, lng: -73.9, altitude: 1.15 } },
  { at: 0.58, view: { lat: 4.4, lng: -73.9, altitude: 1.15 } },
  { at: 0.84, view: { lat: 16, lng: -58, altitude: 2.5 } },
  { at: 1, view: { lat: 16, lng: -58, altitude: 2.5 } }
]
const stageAt = (p) => (p < 0.3 ? 'caldas' : p < 0.71 ? 'colombia' : 'abroad')

const CITIES = [
  [4.711, -74.0721], [6.2442, -75.5812], [3.4516, -76.532], [10.9685, -74.7813],
  [10.391, -75.4794], [7.1193, -73.1227], [7.8939, -72.5078], [4.4389, -75.2322],
  [11.2408, -74.199], [1.2136, -77.2811], [4.142, -73.6266], [4.8133, -75.6961]
].map(([lat, lng]) => ({ lat, lng }))
const ROUTES = {
  caldas: [
    { endLat: 5.4478, endLng: -74.6631 }, { endLat: 5.4216, endLng: -75.7032 },
    { endLat: 4.9825, endLng: -75.6036 }, { endLat: 5.2536, endLng: -75.154 }
  ],
  colombia: CITIES.map(({ lat, lng }) => ({ endLat: lat, endLng: lng })),
  world: [
    { endLat: 39, endLng: -98 }, { endLat: 25.8, endLng: -80.2 },
    { endLat: 40.4, endLng: -3.7 }, { endLat: 48.9, endLng: 2.35 }, { endLat: 19.4, endLng: -99.1 }
  ]
}

export function initCoverageMap() {
  const section = document.getElementById('coverage')
  const layout = section?.querySelector('[data-coverage]')
  const visual = layout?.querySelector('.coverage-visual')
  const map = document.getElementById('coverage-map')
  if (!layout || !visual || !map) return
  const chapters = [...layout.querySelectorAll('.coverage-chapters [data-stage]')]
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const pinQuery = window.matchMedia('(min-width: 900px) and (min-height: 640px)')
  let progress = 0
  let stage = ''
  let scene = null
  let trigger = null

  // En móvil, con ahorro de datos o con movimiento reducido, el globo
  // (Three.js + GeoJSON) no se descarga solo: imagen estática y botón.
  const lite = () => window.matchMedia('(max-width: 767px)').matches || navigator.connection?.saveData || reducedMotion.matches

  const setStage = (next) => {
    if (next === stage) return
    stage = next
    visual.dataset.stage = next
    chapters.forEach((item) => item.classList.toggle('is-active', next === 'all' || item.dataset.stage === next))
    scene?.setMode(next === 'all' ? 'colombia' : STAGE_MODE[next])
  }

  const setProgress = (p) => {
    progress = p
    setStage(stageAt(p))
    scene?.setProgress(p)
  }

  const applyMotion = () => {
    trigger?.kill(true)
    trigger = null
    layout.classList.remove('is-pinned')
    stage = ''
    if (reducedMotion.matches) {
      setStage('all')
      return
    }
    if (pinQuery.matches && !lite()) {
      // La sección se fija bajo el header y el scroll recorre la animación.
      const header = () => document.querySelector('.site-header')?.offsetHeight || 96
      layout.classList.add('is-pinned')
      trigger = ScrollTrigger.create({
        trigger: layout,
        start: () => `top top+=${header()}`,
        // Recorrido largo: el scroll avanza la animación con calma.
        end: () => `+=${Math.round(window.innerHeight * 5.5)}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setProgress(self.progress)
      })
    } else {
      trigger = ScrollTrigger.create({
        trigger: layout,
        start: 'top 65%',
        end: 'bottom 45%',
        onUpdate: (self) => setProgress(self.progress)
      })
    }
    setProgress(trigger.progress || 0)
  }

  const loadScene = async () => {
    if (scene) return
    try {
      scene = await createCoverageScene(map)
      scene.setMode(stage === 'all' ? 'colombia' : STAGE_MODE[stage || 'caldas'])
      scene.setProgress(stage === 'all' ? 0.5 : progress, true)
    } catch (error) {
      console.warn('Coverage map fallback enabled:', error)
      map.dataset.state = 'fallback'
    }
  }

  applyMotion()
  reducedMotion.addEventListener('change', applyMotion)
  pinQuery.addEventListener('change', applyMotion)

  if (lite()) {
    map.dataset.state = 'static'
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'coverage-activate'
    button.innerHTML = '<span data-es="Ver mapa en 3D" data-en="View 3D map"></span><span class="icon-stitch" aria-hidden="true"></span>'
    const label = button.firstElementChild
    label.textContent = label.dataset[document.documentElement.lang === 'en' ? 'en' : 'es']
    button.addEventListener('click', () => {
      button.remove()
      map.dataset.state = 'idle'
      loadScene()
    })
    map.appendChild(button)
    return
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return
    observer.disconnect()
    loadScene()
  }, { rootMargin: '500px 0px', threshold: 0 })
  observer.observe(layout)
}

async function createCoverageScene(map) {
  const canvas = document.getElementById('coverage-canvas')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!supportsWebGL(canvas)) throw new Error('WebGL is not available')

  const [THREE, { default: ThreeGlobe }, { OrbitControls }] = await Promise.all([
    import('three'),
    import('three-globe'),
    import('three/examples/jsm/controls/OrbitControls.js')
  ])
  const [countries, departments] = await Promise.all([
    fetch('/media/cobertura/paises.min.geojson').then(assertResponse).then((response) => response.json()),
    fetch('/media/cobertura/colombia-departamentos.min.geojson').then(assertResponse).then((response) => response.json())
  ])

  const worldFeatures = countries.features
    .filter((feature) => feature.properties.NAME !== 'Colombia')
    .map((feature) => ({ ...feature, properties: { ...feature.properties, mapLayer: 'country' } }))
  const departmentFeatures = departments.features.map((feature) => ({
    ...feature,
    properties: { ...feature.properties, mapLayer: 'department', isCaldas: feature.properties.dpto_cnmbr === 'CALDAS' }
  }))
  const allFeatures = [...worldFeatures, ...departmentFeatures]

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.35 : 1.75))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 3000)
  scene.add(new THREE.HemisphereLight(0xdff4ff, 0x020b18, 0.82))
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.35)
  keyLight.position.set(-180, 140, 220)
  scene.add(keyLight)

  let currentMode = 'caldas'
  const globe = new ThreeGlobe({ animateIn: false })
    .showAtmosphere(true)
    .atmosphereColor('#8fd3ff')
    .atmosphereAltitude(0.14)
    .showGraticules(false)
    .polygonsData(allFeatures)
    .polygonCapCurvatureResolution(1)
    .polygonsTransitionDuration(reducedMotion ? 0 : 600)
    .arcStartLat(() => MANIZALES.lat)
    .arcStartLng(() => MANIZALES.lng)
    .arcEndLat('endLat')
    .arcEndLng('endLng')
    .arcColor(() => ['#2f9fe4', '#dff4ff'])
    .arcStroke(0.42)
    .arcDashLength(reducedMotion ? 1 : 0.45)
    .arcDashGap(reducedMotion ? 0 : 0.18)
    .arcDashInitialGap(() => Math.random())
    .arcDashAnimateTime(reducedMotion ? 0 : 2200)
    .arcsTransitionDuration(reducedMotion ? 0 : 500)
    .ringsData(reducedMotion ? [] : [MANIZALES, MANIZALES])
    .ringLat('lat')
    .ringLng('lng')
    .ringColor(() => (t) => `rgba(105, 201, 244, ${Math.max(0, 1 - t) * 0.9})`)
    .ringPropagationSpeed(1.6)
    .ringRepeatPeriod(1100)
    .pointLat('lat')
    .pointLng('lng')
    .pointColor(() => '#b9ecff')
    .pointResolution(14)
    .pointsTransitionDuration(reducedMotion ? 0 : 500)

  globe.globeMaterial(new THREE.MeshPhongMaterial({
    color: '#0a2343',
    emissive: '#06162c',
    emissiveIntensity: 0.18,
    shininess: 18
  }))
  scene.add(globe)

  // Girar arrastrando (sin zoom ni desplazamiento, para no competir con el scroll).
  const controls = new OrbitControls(camera, canvas)
  controls.enableZoom = false
  controls.enablePan = false
  controls.enableDamping = !reducedMotion
  controls.dampingFactor = 0.08
  controls.rotateSpeed = 0.45
  let dragging = false
  let releasedAt = 0
  controls.addEventListener('start', () => { dragging = true; map.dataset.dragging = 'true' })
  controls.addEventListener('end', () => { dragging = false; releasedAt = performance.now(); delete map.dataset.dragging })

  const markerAnchor = new THREE.Group()
  globe.add(markerAnchor)
  const placeMarker = (alt) => {
    const p = globe.getCoords(MANIZALES.lat, MANIZALES.lng, alt)
    markerAnchor.position.set(p.x, p.y, p.z)
  }

  const originLabel = map.querySelector('.coverage-origin')
  const projected = new THREE.Vector3()
  const target = new THREE.Vector3()
  let targetProgress = 0
  let following = true
  let visible = true
  let rafId = 0

  const viewAt = (p) => {
    let i = 0
    while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++
    const a = KEYS[i]
    const b = KEYS[i + 1]
    const raw = b.at === a.at ? 0 : Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at)))
    const t = raw * raw * (3 - 2 * raw)
    return {
      lat: a.view.lat + (b.view.lat - a.view.lat) * t,
      lng: a.view.lng + (b.view.lng - a.view.lng) * t,
      altitude: a.view.altitude + (b.view.altitude - a.view.altitude) * t
    }
  }

  const resize = () => {
    const { width, height } = map.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  new ResizeObserver(resize).observe(map)
  resize()

  const render = () => {
    if (!visible) { rafId = 0; return }
    if (dragging || performance.now() - releasedAt < 700) {
      following = false
      controls.update()
    } else if (following) {
      const v = viewAt(targetProgress)
      const c = globe.getCoords(v.lat, v.lng, v.altitude)
      target.set(c.x, c.y, c.z)
      // Interpolación suave que conserva la distancia (no atraviesa el globo).
      const ease = reducedMotion ? 1 : 0.07
      const len = camera.position.length() + (target.length() - camera.position.length()) * ease
      camera.position.lerp(target, ease).setLength(len)
      camera.lookAt(0, 0, 0)
    }
    markerAnchor.getWorldPosition(projected)
    projected.project(camera)
    const x = (projected.x * 0.5 + 0.5) * map.clientWidth
    const y = (-projected.y * 0.5 + 0.5) * map.clientHeight
    originLabel.style.setProperty('--origin-x', `${x}px`)
    originLabel.style.setProperty('--origin-y', `${y}px`)
    originLabel.classList.toggle('align-left', x > map.clientWidth * 0.68)
    originLabel.classList.toggle('is-behind', projected.z > 1)
    renderer.render(scene, camera)
    rafId = requestAnimationFrame(render)
  }

  new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? false
    if (visible && !rafId) render()
  }, { threshold: 0.01 }).observe(map)

  const setMode = (mode) => {
    currentMode = mode
    map.dataset.mode = mode
    placeMarker(mode === 'caldas' ? 0.022 : mode === 'colombia' ? 0.02 : 0.018)
    globe
      .polygonsData(allFeatures)
      .polygonAltitude((f) => polygonStyle(f, mode).altitude)
      .polygonCapColor((f) => polygonStyle(f, mode).color)
      .polygonSideColor((f) => polygonStyle(f, mode).side)
      .polygonStrokeColor((f) => polygonStroke(f, mode))
      .arcsData(ROUTES[mode])
      // En vistas cercanas los arcos van bajos (vistos desde arriba, los altos parecen trazos verticales).
      .arcAltitude(mode === 'world' ? null : mode === 'caldas' ? 0.006 : 0.018)
      .arcAltitudeAutoScale(0.45)
      .arcStroke(mode === 'world' ? 0.42 : mode === 'colombia' ? 0.12 : 0.06)
      .pointsData(mode === 'world' ? ROUTES.world.map((r) => ({ lat: r.endLat, lng: r.endLng })) : [])
      .pointAltitude(0.02)
      .pointRadius(0.34)
      .ringMaxRadius(mode === 'caldas' ? 0.9 : mode === 'colombia' ? 2.2 : 4)
  }

  // El scroll manda: cada cambio de progreso retoma el recorrido de la cámara.
  const setProgress = (p, immediate = false) => {
    targetProgress = p
    following = true
    if (immediate) {
      const v = viewAt(p)
      const c = globe.getCoords(v.lat, v.lng, v.altitude)
      camera.position.set(c.x, c.y, c.z)
      camera.lookAt(0, 0, 0)
    }
  }

  setMode(currentMode)
  setProgress(0, true)
  map.dataset.state = 'ready'
  render()
  return { setMode, setProgress }
}

// Colores del globo original (los de la imagen estática): continentes azul
// acero sobre océano marino, Colombia más viva y Caldas en cian.
function polygonStyle(feature, mode) {
  const { mapLayer, isCaldas, NAME } = feature.properties
  if (mapLayer === 'country') {
    const shades = ['#335f8c', '#386591', '#3e6b96']
    const shade = shades[[...(NAME || '')].reduce((sum, char) => sum + char.charCodeAt(0), 0) % shades.length]
    const color = mode === 'world' ? shade : '#2f5a86'
    // Casi planos y con lateral del mismo tono: sin "sombra" corrida.
    return { altitude: 0.003, color, side: color }
  }
  if (isCaldas) return { altitude: mode === 'caldas' ? 0.016 : 0.018, color: '#69c9f4', side: '#4fb2e6' }
  const color = mode === 'caldas' ? '#1d5a99' : '#2270c2'
  return { altitude: 0.008, color, side: mode === 'caldas' ? '#1a5190' : '#1e65b0' }
}

function polygonStroke(feature, mode) {
  if (feature.properties.isCaldas) return 'rgba(225, 247, 255, 0.95)'
  if (feature.properties.mapLayer === 'department') return mode === 'caldas' ? 'rgba(160, 215, 250, 0.4)' : 'rgba(190, 230, 255, 0.5)'
  return 'rgba(140, 195, 235, 0.22)'
}

function supportsWebGL(canvas) {
  try {
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')))
  } catch {
    return false
  }
}

function assertResponse(response) {
  if (!response.ok) throw new Error(`Map data request failed: ${response.status}`)
  return response
}
