import {
  PerspectiveCamera,
  Scene,
  SpotLight,
  MeshStandardMaterial,
  PlaneGeometry,
  Mesh,
  WebGLRenderer,
  sRGBEncoding,
  ReinhardToneMapping,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls'

export const renderSpotlight = ({ containerId }: { containerId: string }) => {
  const container = document.getElementById(containerId) as HTMLElement

  let camera: InstanceType<typeof PerspectiveCamera>,
    scene: InstanceType<typeof Scene>,
    renderer: InstanceType<typeof WebGLRenderer>,
    lightPrimary: InstanceType<typeof SpotLight>,
    lightSecondary: InstanceType<typeof SpotLight>,
    floorMat: InstanceType<typeof MeshStandardMaterial>
  const params = {
    exposure: 0.8,
    light: {
      maxPointY: 0.5,
      bulbPower: 400,
      positionsY: [0.3, 3],
      secondary: {
        bulbPower: 200,
        positionsGap: 1.2,
      },
    },
  }

  const lightPositionsRangeY =
    params.light.positionsY[1] - params.light.positionsY[0]

  const init = () => {
    camera = new PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    camera.position.x = -4
    camera.position.z = 4
    camera.position.y = 2

    scene = new Scene()

    lightPrimary = new SpotLight(0x88aeff, 1, 100, 2.8)
    lightSecondary = new SpotLight(0xe45d5d, 1, 2, 2.6)

    lightPrimary.position.set(0, 2, 0)
    lightSecondary.position.set(0, 0.2, 0)
    scene.add(lightSecondary)
    scene.add(lightPrimary)

    floorMat = new MeshStandardMaterial({
      roughness: 0.8,
      color: 0x6d9bff,
      metalness: 0.2,
      bumpScale: 0.0005,
    })

    const floorGeometry = new PlaneGeometry(200, 200)
    const floorMesh = new Mesh(floorGeometry, floorMat)
    floorMesh.rotation.x = -Math.PI / 2.0
    scene.add(floorMesh)

    renderer = new WebGLRenderer()
    renderer.physicallyCorrectLights = true
    renderer.outputEncoding = sRGBEncoding
    renderer.toneMapping = ReinhardToneMapping
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableZoom = false
    controls.enableRotate = false

    window.addEventListener('resize', onWindowResize)
    window.addEventListener('mousemove', onMouseMove, false)
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function animate() {
    requestAnimationFrame(animate)
    render()
  }

  function render() {
    renderer.toneMappingExposure = Math.pow(params.exposure, 5.0)
    floorMat.needsUpdate = true
    lightPrimary.power = params.light.bulbPower
    lightSecondary.power = params.light.secondary.bulbPower
    renderer.render(scene, camera)
  }

  init()
  animate()

  function onMouseMove(event: MouseEvent) {
    event.preventDefault()

    const yDiff = ((pos) => {
      return (
        (pos > params.light.maxPointY ? 1 - pos : pos) / params.light.maxPointY
      )
    })(event.clientY / window.innerHeight)
    const x1 = (event.clientX / window.innerWidth) * 2 - 1
    const y1 = params.light.positionsY[1] - lightPositionsRangeY * yDiff

    const x2 = x1 * params.light.secondary.positionsGap
    const y2 = y1 * params.light.secondary.positionsGap

    lightPrimary.position.set(x1, y1, 0)
    lightSecondary.position.set(x2, y2, 0)
  }
}
