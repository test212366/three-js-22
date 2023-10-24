import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
 
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'


import kh from './ks.jpeg'
import ua from './ua.jpeg'
import blob from './download.png'


 
 
 


function range(a,b) {
	let r = Math.random()
	return a * r + b * (1 - r)
}


export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		this.scene1 = new THREE.Scene()

		
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		// this.renderer.setClearColor(0xeeeeee, 1)
		this.renderer.useLegacyLights = true
		this.renderer.outputEncoding = THREE.sRGBEncoding
 

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )


		this.raycaster = new THREE.Raycaster()
		this.pointer = new THREE.Vector2()
		this.point = new THREE.Vector3()
		this.container.appendChild(this.renderer.domElement)
 

		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {})


		this.camera = new THREE.PerspectiveCamera( 70,
			 this.width / this.height,
			 0.01,
			 10
		)
 
		this.camera.position.set(0, 0, 2) 
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.time = 0


		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)

		this.isPlaying = true

		this.addBlobs()		 

		this.addObjects()		 
		this.resize()
		this.render()
		this.setupResize()
		this.raycasterEvent()
 
	}



	updateBlobs() {
		this.blobs.forEach(b => {

			b.userData.life += 0.2
			b.scale.setScalar(Math.sin( 0.5 * b.userData.life))

			if(b.userData.life > 2 * Math.PI) {
				b.userData.life = -2 * Math.PI

				let theta = range(0, 2 * Math.PI)
				let r = range(0.05, 0.14)

				b.position.x = this.point.x + r * Math.sin(theta)
				b.position.y = this.point.y + r * Math.cos(theta)


			}
		
		})
	}


	addBlobs() {
		let number = 50

		let bl = new THREE.Mesh(
			new THREE.PlaneGeometry(0.3, 0.3),
			new THREE.MeshBasicMaterial({
				map: new THREE.TextureLoader().load(blob),
				transparent: true,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				depthWrite: false,
				opacity: 0.9
			})
		)

		bl.position.z = 0.1


		this.blobs = []



		for (let i = 0; i < number; i++) {
			let b = bl.clone()

			let theta = range(0, 2 * Math.PI)
			let r = range(0.1, 0.2)
			b.position.x = r * Math.sin(theta)
			b.position.y = r * Math.cos(theta)
			b.userData.life = range(-2 * Math.PI, 2 * Math.PI)

			this.blobs.push(b)
			this.scene1.add(b)
			
		}
	}


	raycasterEvent() {
		
		
		
		window.addEventListener('pointermove', e => {
	  
			this.pointer.x = (e.clientX / this.width) * 2 - 1
			this.pointer.y = - (e.clientY / this.height) * 2 + 1


			this.raycaster.setFromCamera(this.pointer, this.camera)
			const intersects = this.raycaster.intersectObjects([this.plane])
	 
			if(intersects[0]) {
		 

				this.point.copy(intersects[0].point)
			}
		})
	}

	settings() {
		let that = this
		this.settings = {
			progress: 0
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height


		this.imageAspect = 730/1300
		let a1, a2
		if(this.height / this.width > this.imageAspect) {
			a1 = (this.width / this.height) * this.imageAspect
			a2 = 1
		} else {
			a1 = 1
			a2 = (this.height / this.width) / this.imageAspect
		} 


		this.material.uniforms.resolution.value.x = this.width
		this.material.uniforms.resolution.value.y = this.height
		this.material.uniforms.resolution.value.z = a1
		this.material.uniforms.resolution.value.w = a2


		const dist = this.camera.position.z
		const height = 1
		this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist))


		if(this.width / this.height > 1) {
			this.plane.scale.x = this.camera.aspect
		} else {
			this.plane.scale.y = 1/this.camera.aspect
		}



		this.camera.updateProjectionMatrix()



	}


	addObjects() {
		let that = this
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				mask: {value: new THREE.TextureLoader().load(blob)},

				bg: {value: new THREE.TextureLoader().load(ua)},
				resolution: {value: new THREE.Vector4()}
			},
			transparent: true,
			vertexShader,
			fragmentShader
		})
		
		this.geometry = new THREE.PlaneGeometry(1,1,1,1)
		this.plane = new THREE.Mesh(this.geometry, this.material)
 
		this.scene.add(this.plane)

		this.plane.position.z = 0.01


		let bgmesh = new THREE.Mesh(
			new THREE.PlaneGeometry(1.8, 1.1  ),
			new THREE.MeshBasicMaterial({
				map: new THREE.TextureLoader().load(kh)
			})
		)

		this.scene.add(bgmesh)
 
	}



	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.05
		this.material.uniforms.time.value = this.time


		this.updateBlobs()


		this.renderer.setRenderTarget(this.renderTarget)
		this.renderer.render(this.scene1, this.camera)
		this.material.uniforms.mask.value = this.renderTarget.texture

		this.renderer.setRenderTarget(null)


		// console.log(this.point.x);
		//this.renderer.setRenderTarget(this.renderTarget)
		this.renderer.render(this.scene, this.camera)
		//this.renderer.setRenderTarget(null)
 
		requestAnimationFrame(this.render.bind(this))
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
 