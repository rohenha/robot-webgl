import * as THREE from 'three'
import * as dat from 'dat.gui'
import Hammer from 'hammerjs'
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
    // this.scene.background = new THREE.Color('#f5f5f7')
    this.debugObject = {
      envMapIntensity: 20
    }
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    this.position = {
      x: 0,
      y: 0
    }
    this.rotation = {
      delta: 0,
      easing: 0.55 + Math.random() * 0.065,
      friction: 0.09 + Math.random() * 0.05,
      position: 0,
      target: 0,
      v: 0,
      tmp: 0,
    }
    this.tick = this.tick.bind(this)
    this.init()
  }

  init() {
    // const fog = new THREE.Fog('#f5f5f7', 10, 40)
    // this.scene.fog = fog
    this.setRenderer()
    this.setEnvMap()
    this.setCamera()
    this.setFirstLight()
    this.setSecondLight()
    this.setThirdLight()
    this.setFourthLight()
    // this.setPlane()
    this.setRotation()
    // this.setControls()
    this.gltfLoader.load('/models/robot/robot.glb', this.afterModelLoaded.bind(this))
    window.addEventListener('resize', this.resize.bind(this))
    this.resize()
  }

  setRotation() {
    this.hammer = new Hammer.Manager(this.canvas, {})
    this.hammer.add( new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL, threshold: 0 }) );
    this.hammer.on('panstart', this.onPanStart.bind(this))
    this.hammer.on('panmove', this.onPanMove.bind(this))
  }

  onPanStart(e) {
    this.rotation.tmp = e.center.x
  }

  onPanMove(e) {
    this.rotation.target += e.center.x - this.rotation.tmp
    this.rotation.tmp = e.center.x
  }

  ease() {
    this.rotation.delta = this.rotation.target - this.rotation.position;
    this.rotation.v += this.rotation.delta * this.rotation.easing;
    this.rotation.v *= this.rotation.friction;
    this.rotation.position += this.rotation.v;
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    })
    this.renderer.physicallyCorrectLights = true
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.toneMapping = THREE.CineonToneMapping
    this.renderer.toneMappingExposure = 0.1
    this.renderer.shadowMap.enabled = true
    this.renderer.setClearColor( 0x000000, 0 ); // the defaul
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.gui.add(this.renderer, 'toneMapping', {
      No: THREE.NoToneMapping,
      Linear: THREE.LinearToneMapping,
      Reihnard: THREE.ReinhardToneMapping,
      Cineon: THREE.CineonToneMapping,
      ACESFilmic: THREE.ACESFilmicToneMapping
    }).onFinishChange(() => {
        this.renderer.toneMapping = Number(this.renderer.toneMapping)
        this.updateAllMaterials()
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

    this.gui.add(this.debugObject, 'envMapIntensity', 0, 100, 0.01)
    .name('Environment Map Intensity')
    .onChange(this.updateAllMaterials.bind(this))
  }

  setControls () {
    this.controls = new OrbitControls(this.camera, this.canvas)
    this.controls.enableDamping = true
  }

  afterModelLoaded(gltf) {
    this.robot = gltf.scene
    this.robot.scale.set(0.1, 0.1, 0.1)
    this.robot.position.set(6, -7, 3)
    this.gui.add(this.robot.position, 'x', -30, 30, 0.01).name('robot X')
    this.gui.add(this.robot.position, 'y', -30, 30, 0.01).name('robot Y')
    this.gui.add(this.robot.position, 'z', -30, 30, 0.01).name('robot Z')
    this.scene.add(gltf.scene)
    this.updateAllMaterials()
    this.tick()
  }

  setFirstLight () {
    const directionalLight = new THREE.DirectionalLight('#FFFFFF', 3)
    directionalLight.position.set(20, 2, 0)
    directionalLight.intensity = 300
    this.scene.add(directionalLight)

    directionalLight.shadow.normalBias = 0.05

    const directionalLightCameraHelper = new THREE.DirectionalLightHelper(directionalLight)
    this.scene.add(directionalLightCameraHelper)

    this.gui.add(directionalLight, 'intensity', 0, 300, 0.1).name('Light Intensity 1')
    this.gui.add(directionalLight.position, 'x', -15, 15, 0.001).name('Light X 1')
    this.gui.add(directionalLight.position, 'y', -15, 15, 0.001).name('Light Y 1')
    this.gui.add(directionalLight.position, 'z', -15, 15, 0.001).name('Light Z 1')
  }

  setSecondLight () {
    const directionalLight = new THREE.DirectionalLight('#FFFFFF', 3)
    directionalLight.position.set(-10, 8, 0)
    directionalLight.intensity = 300
    this.scene.add(directionalLight)

    directionalLight.shadow.normalBias = 0.05

    const directionalLightCameraHelper = new THREE.DirectionalLightHelper(directionalLight)
    this.scene.add(directionalLightCameraHelper)

    this.gui.add(directionalLight, 'intensity', 0, 300, 0.1).name('Light Intensity 2')
    this.gui.add(directionalLight.position, 'x', -15, 15, 0.001).name('Light X 2')
    this.gui.add(directionalLight.position, 'y', -15, 15, 0.001).name('Light Y 2')
    this.gui.add(directionalLight.position, 'z', -15, 15, 0.001).name('Light Z 2')
  }

  setThirdLight () {
    const directionalLight = new THREE.DirectionalLight('#FF66F9', 200)
    directionalLight.position.set(20, -3, 2)
    directionalLight.target.position.set(0, -7, 0)
    this.scene.add(directionalLight)
    this.scene.add(directionalLight.target)

    directionalLight.shadow.normalBias = 0.05

    const directionalLightCameraHelper = new THREE.DirectionalLightHelper(directionalLight)
    this.scene.add(directionalLightCameraHelper)

    this.gui.add(directionalLight, 'intensity', 0, 200, 0.1).name('Light Intensity 3')
    this.gui.add(directionalLight.position, 'x', -15, 15, 0.001).name('Light X 3')
    this.gui.add(directionalLight.position, 'y', -15, 15, 0.001).name('Light Y 3')
    this.gui.add(directionalLight.position, 'z', -15, 15, 0.001).name('Light Z 3')
  }

  setFourthLight () {
    const directionalLight = new THREE.DirectionalLight('#FF66F9', 3)
    directionalLight.position.set(-4, -3, 9)

    this.scene.add(directionalLight)

    directionalLight.shadow.normalBias = 0.05

    const directionalLightCameraHelper = new THREE.DirectionalLightHelper(directionalLight)
    this.scene.add(directionalLightCameraHelper)

    this.gui.add(directionalLight, 'intensity', 0, 200, 0.1).name('Light Intensity 4')
    this.gui.add(directionalLight.position, 'x', -15, 15, 0.001).name('Light X 4')
    this.gui.add(directionalLight.position, 'y', -15, 15, 0.001).name('Light Y 4')
    this.gui.add(directionalLight.position, 'z', -15, 15, 0.001).name('Light Z 4')
    
    this.gui.add(directionalLight.target.position, 'x', -15, 15, 0.001).name('Light X target')
    this.gui.add(directionalLight.target.position, 'y', -15, 15, 0.001).name('Light Y target')
    this.gui.add(directionalLight.target.position, 'z', -15, 15, 0.001).name('Light Z target')
  }

  setCamera () {
    this.camera = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 100)
    this.camera.position.set(0, 7, 30)
    this.camera.lookAt(0, -1, 0)
    this.scene.add(this.camera)
    this.gui.add(this.camera.position, 'x', -30, 30, 0.01).name('Camera X')
    this.gui.add(this.camera.position, 'y', -30, 30, 0.01).name('Camera Y')
    this.gui.add(this.camera.position, 'z', -30, 30, 0.01).name('Camera Z')
  }

  // setPlane() {
  //   const material = new THREE.MeshStandardMaterial({
  //     color: "#f5f5f7"
  //   })
  //   material.roughness = 0.7
  //   const plane = new THREE.Mesh(
  //     new THREE.PlaneGeometry(5, 5),
  //     material
  //     // new THREE.MeshBasicMaterial({
  //     //     map: bakedShadow
  //     // })
  //   )
  //   plane.scale.set(30, 30, 30)
  //   plane.rotation.x = - Math.PI * 0.5
  //   plane.position.y = - 7
  //   // plane.receiveShadow = true
  //   this.scene.add(plane)
  // }

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
          // child.castShadow = true
          // child.receiveShadow = true
          child.material.envMapIntensity = this.debugObject.envMapIntensity
          child.material.needsUpdate = true
      }
    })
  }

  tick() {
    this.ease()
    // this.controls.update()
    this.robot.rotation.y = this.rotation.position / 200 * Math.PI
    this.renderer.render(this.scene, this.camera)

    window.requestAnimationFrame(this.tick)
  }
}