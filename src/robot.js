import * as THREE from 'three'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

export default class Robot {
  constructor(canvas) {
    this.canvas = canvas
    this.gltfLoader = new GLTFLoader()
    this.textureLoader = new THREE.CubeTextureLoader()
    this.gui = new dat.GUI()
    this.scene = new THREE.Scene({
    })
    this.scene.background = new THREE.Color('#f5f5f7')
    this.debugObject = {
      envMapIntensity: 5
    }
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    this.position = {
      x: 0,
      y: 0
    }
    this.tick = this.tick.bind(this)
    this.init()
  }

  init() {
    const fog = new THREE.Fog('#f5f5f7', 10, 40)
    this.scene.fog = fog
    this.setRenderer()
    this.setEnvMap()
    this.setCamera()
    this.setLights()
    this.setPlane()
    // this.setControls()
    // this.gltfLoader.load('/models/robot-5/scene.gltf', this.afterModelLoaded.bind(this))
    this.gltfLoader.load('/models/bottle/scene.gltf', this.afterModelLoaded.bind(this))
    window.addEventListener('resize', this.resize.bind(this))
    window.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.resize()
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    })
    this.renderer.physicallyCorrectLights = true
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.toneMapping = THREE.ReinhardToneMapping
    this.renderer.toneMappingExposure = 3
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.gui.add(this.renderer, 'toneMapping', {
      No: THREE.NoToneMapping,
      Linear: THREE.LinearToneMapping,
      Reihnard: THREE.ReinhardToneMapping,
      Cineon: THREE.CineonToneMapping,
      ACESFilmic: THREE.ACESFilmicToneMapping
    }).onFinishChange(() => {
        this.renderer.toneMapping = Number(this.renderer.toneMapping)
        updateAllMaterials()
    })
    this.gui.add(this.renderer, 'toneMappingExposure', 0, 5, 0.01)
  }

  setEnvMap() {
    const environmentMap = this.textureLoader.load([
        '/textures/environmentMaps/0/px.jpg',
        '/textures/environmentMaps/0/nx.jpg',
        '/textures/environmentMaps/0/py.jpg',
        '/textures/environmentMaps/0/ny.jpg',
        '/textures/environmentMaps/0/pz.jpg',
        '/textures/environmentMaps/0/nz.jpg',
    ])
    environmentMap.encoding = THREE.sRGBEncoding
    this.scene.environment = environmentMap

    this.gui.add(this.debugObject, 'envMapIntensity', 0, 10, 0.01)
    .name('Environment Map Intensity')
    .onChange(this.updateAllMaterials.bind(this))
  }

  setControls () {
    this.controls = new OrbitControls(this.camera, this.canvas)
    this.controls.enableDamping = true
  }

  afterModelLoaded(gltf) {
    this.robot = gltf.scene
    this.robot.scale.set(0.01, 0.01, 0.01)
    this.robot.position.set(0, 1, 0)
    this.robot.rotation.z = 0.1 * Math.PI
    this.robot.castShadow = true
    this.scene.add(gltf.scene)
    this.updateAllMaterials()
    this.tick()
  }

  setLights () {
    const directionalLight = new THREE.DirectionalLight('#FFFFFF', 3)
    directionalLight.position.set(5, 12, -13)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.far = 40
    directionalLight.shadow.camera.top = 9
    directionalLight.shadow.camera.right = 9
    directionalLight.shadow.camera.bottom = - 9
    directionalLight.shadow.camera.left = - 9
    directionalLight.shadow.mapSize.set(1024, 1024)
    this.scene.add(directionalLight)

    directionalLight.shadow.normalBias = 0.05

    // const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
    // this.scene.add(directionalLightCameraHelper)

    this.gui.add(directionalLight, 'intensity', 0, 10, 0.1).name('Light Intensity')
    this.gui.add(directionalLight.position, 'x', -15, 15, 0.001).name('Light X')
    this.gui.add(directionalLight.position, 'y', -15, 15, 0.001).name('Light Y')
    this.gui.add(directionalLight.position, 'z', -15, 15, 0.001).name('Light Z')
  }

  setCamera () {
    this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100)
    this.camera.position.set(15, 4, 0)
    this.camera.lookAt(0, 0, 0)
    this.scene.add(this.camera)
    this.gui.add(this.camera.position, 'x', -15, 15, 0.01, 'Camera X')
    this.gui.add(this.camera.position, 'y', -15, 15, 0.01, 'Camera Y')
    this.gui.add(this.camera.position, 'z', -15, 15, 0.01, 'Camera Z')
  }

  setPlane() {
    const material = new THREE.MeshStandardMaterial({
      color: "#f5f5f7"
    })
    material.roughness = 0.7
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      material
      // new THREE.MeshBasicMaterial({
      //     map: bakedShadow
      // })
    )
    plane.scale.set(30, 30, 30)
    plane.rotation.x = - Math.PI * 0.5
    plane.position.y = - 7
    plane.receiveShadow = true
    this.scene.add(plane)
  }

  resize() {
    this.sizes.width = window.innerWidth
    this.sizes.height = window.innerHeight

    // Update camera
    this.camera.aspect = this.sizes.width / this.sizes.height
    this.camera.updateProjectionMatrix()

    // Update renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  updateAllMaterials() {
    this.scene.traverse(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          // console.log(child);
          // child.material.envMap = environmentMap
          child.castShadow = true
          child.receiveShadow = true
          child.material.envMapIntensity = this.debugObject.envMapIntensity
          child.material.needsUpdate = true
      }
    })
  }

  onMouseMove(event) {
    this.position = {
      x: event.clientX,
      y: event.clientY
    }
    // console.log((this.position.x / this.sizes.width - 0.5));
  }

  tick() {
    // this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.robot.rotation.y = (this.position.x / this.sizes.width) * (Math.PI * 1)
    this.robot.rotation.x = (this.position.y / this.sizes.height) * (Math.PI * 0.3)

    window.requestAnimationFrame(this.tick)
  }
}