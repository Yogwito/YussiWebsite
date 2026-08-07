import { gsap } from 'gsap'

// Centro urbano de Manizales. Mantener este punto independiente de las rutas.
const MANIZALES = { lat: 5.0703, lng: -75.5138 }

const COPY = {
  es: {
    caldas: {
      kicker: 'Cobertura regional',
      status: 'Atendemos pedidos en Caldas desde nuestra planta en Manizales.',
      points: ['Origen de producción en Manizales', 'Coordinación directa de cada despacho']
    },
    colombia: {
      kicker: 'Cobertura nacional',
      status: 'Despachamos a distintas regiones de Colombia según el alcance de cada pedido.',
      points: ['Rutas ilustrativas desde Manizales', 'Logística definida durante la cotización']
    },
    world: {
      kicker: 'Cobertura internacional',
      status: 'Coordinamos envíos internacionales por regiones, de acuerdo con el destino y el pedido.',
      points: ['Norteamérica, Latinoamérica y Europa', 'Condiciones de envío confirmadas antes de producir']
    }
  },
  en: {
    caldas: {
      kicker: 'Regional coverage',
      status: 'We serve orders across Caldas from our production facility in Manizales.',
      points: ['Production origin in Manizales', 'Direct coordination for every shipment']
    },
    colombia: {
      kicker: 'National coverage',
      status: 'We ship to different regions of Colombia according to each order.',
      points: ['Illustrative routes from Manizales', 'Logistics defined during the quote']
    },
    world: {
      kicker: 'International coverage',
      status: 'We coordinate international shipping by region, according to destination and order.',
      points: ['North America, Latin America and Europe', 'Shipping terms confirmed before production']
    }
  }
}

const ROUTES = {
  caldas: [
    { endLat: 5.4478, endLng: -74.6631 },
    { endLat: 5.4216, endLng: -75.7032 },
    { endLat: 4.9825, endLng: -75.6036 },
    { endLat: 5.2536, endLng: -75.154 }
  ],
  colombia: [
    { endLat: 10.9685, endLng: -74.7813 },
    { endLat: 6.2442, endLng: -75.5812 },
    { endLat: 4.711, endLng: -74.0721 },
    { endLat: 3.4516, endLng: -76.532 },
    { endLat: 7.1193, endLng: -73.1227 }
  ],
  world: [
    { endLat: 39, endLng: -98, region: 'North America' },
    { endLat: -16, endLng: -60, region: 'Latin America' },
    { endLat: 50, endLng: 10, region: 'Europe' }
  ]
}

const VIEW = {
  caldas: { lat: 5.08, lng: -75.28, altitude: 0.45 },
  colombia: { lat: 4.4, lng: -73.9, altitude: 1.18 },
  world: { lat: 14, lng: -61, altitude: 2.45 }
}

export function initCoverageMap() {
  const section = document.getElementById('coverage')
  if (!section) return

  const tabs = [...section.querySelectorAll('[data-coverage-mode]')]
  const panel = document.getElementById('coverage-panel')
  const kicker = document.getElementById('coverage-kicker')
  const status = document.getElementById('coverage-status')
  const points = document.getElementById('coverage-points')
  let mode = 'caldas'
  let scene = null

  const getLang = () => document.documentElement.lang === 'en' ? 'en' : 'es'

  const updateCopy = () => {
    const content = COPY[getLang()][mode]
    kicker.textContent = content.kicker
    status.textContent = content.status
    points.innerHTML = content.points.map((point) => `<li>${point}</li>`).join('')
  }

  const selectMode = (nextMode, moveFocus = false) => {
    mode = nextMode
    tabs.forEach((tab) => {
      const active = tab.dataset.coverageMode === mode
      tab.classList.toggle('is-active', active)
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
      if (active) {
        panel.setAttribute('aria-labelledby', tab.id)
        if (moveFocus) tab.focus()
      }
    })
    updateCopy()
    scene?.setMode(mode)
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectMode(tab.dataset.coverageMode))
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()

      let target = index
      if (event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length
      if (event.key === 'Home') target = 0
      if (event.key === 'End') target = tabs.length - 1
      selectMode(tabs[target].dataset.coverageMode, true)
    })
  })

  document.addEventListener('languagechange', updateCopy)
  updateCopy()

  const observer = new IntersectionObserver(async (entries) => {
    if (!entries.some((entry) => entry.isIntersecting) || scene) return
    observer.disconnect()

    try {
      scene = await createCoverageScene()
      scene.setMode(mode, true)
    } catch (error) {
      console.warn('Coverage map fallback enabled:', error)
      document.getElementById('coverage-map').dataset.state = 'fallback'
    }
  }, { rootMargin: '500px 0px', threshold: 0 })

  observer.observe(section)
}

async function createCoverageScene() {
  const map = document.getElementById('coverage-map')
  const canvas = document.getElementById('coverage-canvas')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!supportsWebGL(canvas)) throw new Error('WebGL is not available')

  const [
    THREE,
    { default: ThreeGlobe },
    { OrbitControls }
  ] = await Promise.all([
    import('three'),
    import('three-globe'),
    import('three/examples/jsm/controls/OrbitControls.js')
  ])

  const [countries, departments] = await Promise.all([
    fetch('/data/countries.min.geojson').then(assertResponse).then((response) => response.json()),
    fetch('/data/colombia-departments.min.geojson').then(assertResponse).then((response) => response.json())
  ])

  const worldFeatures = countries.features
    .filter((feature) => feature.properties.NAME !== 'Colombia')
    .map((feature) => ({
      ...feature,
      properties: { ...feature.properties, mapLayer: 'country' }
    }))

  const departmentFeatures = departments.features.map((feature) => ({
    ...feature,
    properties: {
      ...feature.properties,
      mapLayer: 'department',
      isCaldas: feature.properties.dpto_cnmbr === 'CALDAS'
    }
  }))

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.35 : 1.7))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 2000)
  scene.add(new THREE.HemisphereLight(0xdff4ff, 0x020b18, 0.82))

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.35)
  keyLight.position.set(-180, 140, 220)
  scene.add(keyLight)

  let currentMode = 'caldas'
  const globe = new ThreeGlobe()
    .showAtmosphere(false)
    .atmosphereColor('#071a34')
    .atmosphereAltitude(0.14)
    .showGraticules(false)
    .polygonsData([...worldFeatures, ...departmentFeatures])
    .polygonStrokeColor((feature) => getPolygonStroke(feature, currentMode))
    .polygonCapCurvatureResolution(2)
    .polygonsTransitionDuration(reducedMotion ? 0 : 700)
    .arcStartLat(() => MANIZALES.lat)
    .arcStartLng(() => MANIZALES.lng)
    .arcEndLat('endLat')
    .arcEndLng('endLng')
    .arcColor(() => ['#2f9fe4', '#dff4ff'])
    .arcStroke(0.46)
    .arcDashLength(reducedMotion ? 1 : 0.52)
    .arcDashGap(reducedMotion ? 0 : 0.12)
    .arcDashInitialGap(() => Math.random())
    .arcDashAnimateTime(reducedMotion ? 0 : 2500)
    .ringsData(reducedMotion ? [] : [MANIZALES])
    .ringLat('lat')
    .ringLng('lng')
    .ringColor(() => (time) => `rgba(105, 201, 244, ${Math.max(0, 1 - time)})`)
    .ringMaxRadius(3)
    .ringPropagationSpeed(1.4)
    .ringRepeatPeriod(1300)
    .pointLat('endLat')
    .pointLng('endLng')
    .pointAltitude(0.035)
    .pointRadius((point) => point.region ? 0.34 : currentMode === 'caldas' ? 0.08 : 0.18)
    .pointResolution(12)
    .pointColor(() => '#b9ecff')
    .pointsTransitionDuration(reducedMotion ? 0 : 700)

  globe.globeMaterial(new THREE.MeshPhongMaterial({
    color: '#0a2343',
    emissive: '#06162c',
    emissiveIntensity: 0.18,
    shininess: 18
  }))
  scene.add(globe)

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = !reducedMotion
  controls.dampingFactor = 0.06
  controls.enablePan = false
  controls.minDistance = 126
  controls.maxDistance = 390
  controls.rotateSpeed = 0.42
  controls.zoomSpeed = 0.65
  let isInteracting = false
  controls.addEventListener('start', () => { isInteracting = true })
  controls.addEventListener('end', () => { isInteracting = false })

  const markerAnchor = new THREE.Group()
  markerAnchor.name = 'yussi-production-origin'
  placeOnGlobe(markerAnchor, globe, THREE, 0.034)
  globe.add(markerAnchor)

  const originLabel = map.querySelector('.coverage-origin')
  const projected = new THREE.Vector3()
  let visible = true
  let rafId = 0
  let cameraTween = null
  let worldMotionStartedAt = performance.now()

  const resize = () => {
    const { width, height } = map.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(map)
  resize()

  const render = () => {
    if (!visible) {
      rafId = 0
      return
    }

    if (currentMode === 'world' && !reducedMotion && !isInteracting) {
      const elapsed = performance.now() - worldMotionStartedAt
      globe.rotation.y = Math.sin(elapsed / 7200) * 0.09
    }
    controls.update()
    markerAnchor.getWorldPosition(projected)
    projected.project(camera)
    const originX = (projected.x * 0.5 + 0.5) * map.clientWidth
    const originY = (-projected.y * 0.5 + 0.5) * map.clientHeight
    originLabel.style.setProperty('--origin-x', `${originX}px`)
    originLabel.style.setProperty('--origin-y', `${originY}px`)
    originLabel.classList.toggle('align-left', originX > map.clientWidth * 0.72)
    originLabel.classList.toggle('is-behind', projected.z > 1)
    renderer.render(scene, camera)
    rafId = requestAnimationFrame(render)
  }

  const visibilityObserver = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? false
    if (visible && !rafId) render()
  }, { threshold: 0.01 })
  visibilityObserver.observe(map)

  const setMode = (mode, immediate = false) => {
    currentMode = mode
    map.dataset.mode = mode
    if (mode === 'world') worldMotionStartedAt = performance.now()
    else globe.rotation.y = 0
    placeOnGlobe(
      markerAnchor,
      globe,
      THREE,
      mode === 'caldas' ? 0.034 : mode === 'colombia' ? 0.03 : 0.024
    )
    const view = VIEW[mode]
    const destination = globe.getCoords(view.lat, view.lng, view.altitude)

    cameraTween?.kill()
    if (immediate || reducedMotion) {
      camera.position.set(destination.x, destination.y, destination.z)
      camera.lookAt(0, 0, 0)
    } else {
      cameraTween = gsap.to(camera.position, {
        x: destination.x,
        y: destination.y,
        z: destination.z,
        duration: 1.4,
        ease: 'power3.inOut',
        onUpdate: () => camera.lookAt(0, 0, 0)
      })
    }

    globe
      .showAtmosphere(mode === 'world')
      .showGraticules(mode === 'world')
      .atmosphereColor(mode === 'world' ? '#69c9f4' : '#071a34')
      .ringsData(reducedMotion || mode === 'caldas' ? [] : [MANIZALES])
      .ringMaxRadius(mode === 'caldas' ? 0.1 : mode === 'colombia' ? 0.65 : 3)
      .polygonsData([...worldFeatures, ...departmentFeatures])
      .polygonAltitude((feature) => getPolygonStyle(feature, mode).altitude)
      .polygonCapColor((feature) => getPolygonStyle(feature, mode).color)
      .polygonSideColor((feature) => getPolygonStyle(feature, mode).side)
      .polygonStrokeColor((feature) => getPolygonStroke(feature, mode))
      .arcsData(ROUTES[mode])
      .pointsData(mode === 'world' ? ROUTES[mode] : [])
      .arcAltitudeAutoScale(mode === 'caldas' ? 0.18 : mode === 'colombia' ? 0.28 : 0.42)

    controls.minDistance = mode === 'caldas' ? 125 : 132
    controls.maxDistance = mode === 'world' ? 430 : 330
  }

  camera.position.set(0, 0, 260)
  camera.lookAt(0, 0, 0)
  map.dataset.state = 'ready'
  render()

  return { setMode }
}

function getPolygonStyle(feature, mode) {
  const { mapLayer, isCaldas, NAME } = feature.properties

  if (mapLayer === 'country') {
    const worldShades = [
      'rgba(45, 91, 133, 0.82)',
      'rgba(58, 108, 151, 0.78)',
      'rgba(72, 120, 158, 0.72)'
    ]
    const shadeIndex = [...(NAME || '')].reduce((sum, char) => sum + char.charCodeAt(0), 0) % worldShades.length

    return {
      altitude: 0.008,
      color: mode === 'world' ? worldShades[shadeIndex] : 'rgba(22, 54, 87, 0.58)',
      side: '#09213e'
    }
  }

  if (isCaldas) {
    return {
      altitude: mode === 'caldas' ? 0.026 : 0.034,
      color: '#69c9f4',
      side: '#145f9b'
    }
  }

  return {
    altitude: mode === 'colombia' ? 0.018 : 0.012,
    color: mode === 'caldas'
      ? 'rgba(18, 62, 102, 0.96)'
      : mode === 'world'
        ? 'rgba(25, 89, 151, 0.9)'
        : 'rgba(22, 96, 169, 0.9)',
    side: mode === 'caldas' ? '#071f3c' : '#0a3769'
  }
}

function getPolygonStroke(feature, mode) {
  if (feature.properties.isCaldas) return 'rgba(215, 246, 255, 0.98)'
  if (feature.properties.mapLayer === 'department') {
    return mode === 'caldas'
      ? 'rgba(105, 201, 244, 0.28)'
      : 'rgba(195, 235, 255, 0.62)'
  }
  return mode === 'world'
    ? 'rgba(105, 201, 244, 0.2)'
    : 'rgba(105, 201, 244, 0.1)'
}

function placeOnGlobe(object, globe, THREE, altitude = 0.035) {
  const position = globe.getCoords(MANIZALES.lat, MANIZALES.lng, altitude)
  const normal = new THREE.Vector3(position.x, position.y, position.z).normalize()
  object.position.set(position.x, position.y, position.z)
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
}

function supportsWebGL(canvas) {
  try {
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  } catch {
    return false
  }
}

function assertResponse(response) {
  if (!response.ok) throw new Error(`Map data request failed: ${response.status}`)
  return response
}
