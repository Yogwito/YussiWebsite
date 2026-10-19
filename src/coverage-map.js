import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Cobertura: globo 3D (three + three-globe).
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
        end: () => `+=${Math.round(window.innerHeight * 2.4)}`,
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

  const worldFeatures = countries.features.filter((feature) => feature.properties.NAME !== 'Colombia')
  const departmentFeatures = departments.features.map((feature) => ({
    ...feature,
    properties: { ...feature.properties, isCaldas: feature.properties.dpto_cnmbr === 'CALDAS' }
  }))

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.35 : 1.75))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 3000)
  scene.add(new THREE.AmbientLight(0x9fd4ff, 0.55))
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6)
  keyLight.position.set(-220, 180, 260)
  scene.add(keyLight)
  const rimLight = new THREE.DirectionalLight(0x69c9f4, 0.9)
  rimLight.position.set(260, -120, -200)
  scene.add(rimLight)

  // Campo de estrellas sutil detrás del globo.
  const starGeometry = new THREE.BufferGeometry()
  const starPositions = new Float32Array(1400 * 3)
  for (let i = 0; i < 1400; i++) {
    const r = 700 + Math.random() * 500
    const t = Math.random() * Math.PI * 2
    const u = Math.acos(2 * Math.random() - 1)
    starPositions.set([r * Math.sin(u) * Math.cos(t), r * Math.sin(u) * Math.sin(t), r * Math.cos(u)], i * 3)
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xbfe6ff, size: 1.4, transparent: true, opacity: 0.55, sizeAttenuation: false }))
  scene.add(stars)

  let currentMode = 'caldas'
  const globe = new ThreeGlobe({ animateIn: false })
    .showAtmosphere(true)
    .atmosphereColor('#5ab8f0')
    .atmosphereAltitude(0.16)
    .showGraticules(false)
    // Países como malla de puntos: textura liviana y reconocible.
    .hexPolygonsData(worldFeatures)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.42)
    .hexPolygonAltitude(0.004)
    .hexPolygonColor(() => 'rgba(140, 205, 245, 0.62)')
    // Colombia en relieve, con Caldas elevado.
    .polygonsData(departmentFeatures)
    .polygonCapCurvatureResolution(2)
    .polygonsTransitionDuration(reducedMotion ? 0 : 600)
    .arcStartLat(() => MANIZALES.lat)
    .arcStartLng(() => MANIZALES.lng)
    .arcEndLat('endLat')
    .arcEndLng('endLng')
    .arcColor(() => ['rgba(105, 201, 244, 0.95)', 'rgba(255, 255, 255, 0.95)'])
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
    .pointColor(() => '#e6f7ff')
    .pointResolution(14)
    .pointsTransitionDuration(reducedMotion ? 0 : 500)

  globe.globeMaterial(new THREE.MeshPhongMaterial({
    color: '#08203f',
    emissive: '#0b2c55',
    emissiveIntensity: 0.32,
    specular: '#3d7fb8',
    shininess: 14
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
      const ease = reducedMotion ? 1 : 0.12
      const len = camera.position.length() + (target.length() - camera.position.length()) * ease
      camera.position.lerp(target, ease).setLength(len)
      camera.lookAt(0, 0, 0)
    }
    if (!reducedMotion) stars.rotation.y += 0.00012
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
    placeMarker(mode === 'caldas' ? 0.05 : mode === 'colombia' ? 0.04 : 0.03)
    globe
      .atmosphereAltitude(mode === 'world' ? 0.22 : 0.15)
      .polygonAltitude((f) => (f.properties.isCaldas ? (mode === 'caldas' ? 0.045 : 0.034) : mode === 'caldas' ? 0.012 : 0.02))
      .polygonCapColor((f) => (f.properties.isCaldas ? '#69c9f4' : mode === 'caldas' ? 'rgba(20, 70, 122, 0.95)' : 'rgba(27, 106, 186, 0.95)'))
      .polygonSideColor((f) => (f.properties.isCaldas ? 'rgba(20, 110, 175, 0.95)' : 'rgba(8, 40, 80, 0.9)'))
      .polygonStrokeColor((f) => (f.properties.isCaldas ? 'rgba(230, 248, 255, 1)' : 'rgba(170, 225, 255, 0.55)'))
      .arcsData(ROUTES[mode])
      .arcAltitudeAutoScale(mode === 'caldas' ? 0.2 : mode === 'colombia' ? 0.3 : 0.45)
      .pointsData(mode === 'colombia' ? CITIES : mode === 'world' ? ROUTES.world.map((r) => ({ lat: r.endLat, lng: r.endLng })) : [])
      .pointAltitude(mode === 'world' ? 0.02 : 0.03)
      .pointRadius(mode === 'world' ? 0.45 : 0.16)
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
