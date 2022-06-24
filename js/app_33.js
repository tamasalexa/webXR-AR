import * as THREE from './three125/three.js';
import { OrbitControls } from './three125/OrbitControls.js';
import { GLTFLoader } from './three125/GLTFLoader.js';

import { MTLLoader } from './three125/MTLLoader.js';
import { OBJLoader } from './three125/OBJLoader.js';

import { Stats } from './stats.module.js';
import { CanvasUI } from './three125/CanvasUI.js'
import { ARButton } from './ARButton.js';
import { LoadingBar } from './LoadingBar.js';
import { Player } from './three125/Player.js';
import { ControllerGestures } from './three125/ControllerGestures.js'; 

class App{
    constructor() {

        alert(`2 test - ${Date.now()}`);

		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.clock = new THREE.Clock();
        
		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 20 );
		
		this.scene = new THREE.Scene();
        
        this.scene.add(this.camera);
       
		this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
		container.appendChild( this.renderer.domElement );
        
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.target.set(0, 3.5, 0);
        this.controls.update();
        
        this.stats = new Stats();
        document.body.appendChild( this.stats.dom );
        
        this.origin = new THREE.Vector3();
        this.euler = new THREE.Euler();
        this.quaternion = new THREE.Quaternion();

        this.reticle = new THREE.Mesh(
            new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );

        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);

        this.initScene();
        this.setupXR();
        
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    initScene(){
        this.loadingBar = new LoadingBar();
        
        this.assetsPath = './models/obj3D/';
        const loader = new GLTFLoader().setPath(this.assetsPath);
		const self = this;

        this.loadObj3D('./models/obj3DTextures/', './models/obj3D/stair_01/', 'esc3d');

		// Load a GLTF resource
		//loader.load(
		//	// resource URL
		//	`knight2.glb`,
		//	// called when the resource is loaded
		//	function ( gltf ) {
		//		const object = gltf.scene.children[5];
				
		//		object.traverse(function(child){
		//			if (child.isMesh){
  //                      child.material.metalness = 0;
  //                      child.material.roughness = 1;
		//			}
		//		});
				
		//		const options = {
		//			object: object,
		//			speed: 0.5,
		//			animations: gltf.animations,
		//			clip: gltf.animations[0],
		//			app: self,
		//			name: 'knight',
		//			npc: false
		//		};
				
		//		self.obj3D = new Player(options);
  //              self.obj3D.visible = false;
				
		//		self.obj3D.action = 'Dance';
		//		const scale = 0.003;
		//		self.obj3D.scale.set(scale, scale, scale); 
				
  //              self.loadingBar.visible = false;
		//	},
		//	// called while loading is progressing
		//	function ( xhr ) {

		//		self.loadingBar.progress = (xhr.loaded / xhr.total);

		//	},
		//	// called when loading has errors
		//	function ( error ) {

		//		console.log( 'An error happened' );

		//	}
		//);
        
        this.createUI();
    }

    loadObj3D(texturesURL, objURL, objName) {
        if (texturesURL === null) {
            texturesURL = objURL;
        }
        
        const self = this;
        this.loadingBar.visible = true;

        let mtlLoader = new MTLLoader();
        //mtlLoader.setResourcePath(metadata.texturesURL).setPath(metadata.objURL);       
        mtlLoader.setResourcePath(texturesURL).setPath(objURL);
        mtlLoader.load(objName + ".mtl", function (materials) {

            materials.preload();

            let objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath(objURL);
            objLoader.load(objName + '.obj', function (obj) {

                //let isStair = itemType == 10;
                // let scaleVal = 0.001;
                //object.scale.x = object.scale.y = object.scale.z = scaleVal;
                let geometry, material;

                obj.traverse(function (child) {
                    if (child.material) {
                        child.material.side = THREE.DoubleSide;
                    }
                    if (child.isMesh) {
                        //child.scale.x = child.scale.y = child.scale.z = scaleVal;
                    }
                });

                self.scene.add(obj);
                self.obj3D = obj;
                self.obj3D.visible = false;

                self.loadingBar.visible = false;

                //self.transformControls.attach(self.obj3D);

                //translate
                //self.transformControls.setMode("translate");
                //rotate
                //self.transformControls.setMode("rotate");
                //if (self.transformControls.getMode() == 'rotate') {
                //    self.transformControls.showX = false;
                //    self.transformControls.showZ = false;
                //}

                //self.scene.add(self.transformControls);                

                //if (isStair) {
                //    //center the object
                //    new THREE.Box3().setFromObject(object).getCenter(object.position).multiplyScalar(- 1);
                //    item.add(object);
                //} else if (object.children.length > 1) {

                //    while (object.children.length > 0) {
                //        let child = object.children[0];
                //        if (child.isMesh) {
                //            new THREE.Box3().setFromObject(child).getCenter(child.position).multiplyScalar(- 1);
                //            item.add(child);
                //        }
                //    }
                //}

            }, // onProgress callback
                function (xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                    self.loadingBar.progress = (xhr.loaded / xhr.total);
                },

                // onError callback
                function (error) {
                    console.error('An error happened', error);
                }
            );
        });

    }

    
    createUI() {
        
        const config = {
            panelSize: { width: 0.15, height: 0.038 },
            height: 128,
            info:{ type: "text" }
        }
        const content = {
            info: "Debug info"
        }
        
        const ui = new CanvasUI( content, config );
        
        this.ui = ui;
    }
    
    setupXR(){
        this.renderer.xr.enabled = true;

        this.hitTestSourceRequested = false;
        this.hitTestSource = null;
        
        const self = this;
        let controller, controller1;
        
        function onSessionStart(){
            self.ui.mesh.position.set( 0, -0.15, -0.3 );
            self.camera.add( self.ui.mesh );
        }
        
        function onSessionEnd(){
            self.camera.remove( self.ui.mesh );
        }
        
        const btn = new ARButton( this.renderer, { onSessionStart, onSessionEnd });//, sessionInit: { optionalFeatures: [ 'dom-overlay' ], domOverlay: { root: document.body } } } );
        
        this.gestures = new ControllerGestures( this.renderer );
        this.gestures.addEventListener( 'tap', (ev)=>{
            //console.log( 'tap' ); 
            self.ui.updateElement('info', 'tap' );
            //if (!self.obj3D.visible){
            //    self.obj3D.visible = true;
            //    self.obj3D.position.set( 0, -0.3, -0.5 ).add( ev.position );
            //    self.scene.add( self.obj3D ); 
            //}
            
            if (!self.obj3D.visible) {                
                //self.obj3D.position.set(0, -0.3, -0.5).add(ev.position);
                self.obj3D.position.setFromMatrixPosition(self.reticle.matrix);
                self.obj3D.visible = true;
                //self.scene.add(self.obj3D);
            }

        });
        this.gestures.addEventListener( 'doubletap', (ev)=>{
            //console.log( 'doubletap'); 
            self.ui.updateElement('info', 'doubletap' );
        });
        this.gestures.addEventListener( 'press', (ev)=>{
            //console.log( 'press' );    
            self.ui.updateElement('info', 'press' );
        });
        this.gestures.addEventListener( 'pan', (ev)=>{
            //console.log( ev );
            if (ev.initialise !== undefined){
                self.startPosition = self.obj3D.position.clone();
            }else{
                //const pos = self.startPosition.clone().add( ev.delta.multiplyScalar(3) );
                const pos = self.startPosition.clone().add(ev.delta.multiplyScalar(20));
                self.obj3D.position.copy( pos );
                self.ui.updateElement('info', `pan x:${ev.delta.x.toFixed(3)}, y:${ev.delta.y.toFixed(3)}, x:${ev.delta.z.toFixed(3)}` );
            } 
        });
        this.gestures.addEventListener( 'swipe', (ev)=>{
            //console.log( ev );   
            self.ui.updateElement('info', `swipe ${ev.direction}` );
            if (self.obj3D.visible){
                self.obj3D.visible = false;
                //self.scene.remove( self.obj3D ); 
            }
        });
        this.gestures.addEventListener( 'pinch', (ev)=>{
            //console.log( ev );  
            if (ev.initialise !== undefined){
                self.startScale = self.obj3D.scale.clone();
            }else{
                const scale = self.startScale.clone().multiplyScalar(ev.scale);
                self.obj3D.scale.copy( scale );
                self.ui.updateElement('info', `pinch delta:${ev.delta.toFixed(3)} scale:${ev.scale.toFixed(2)}` );
            }
        });
        this.gestures.addEventListener( 'rotate', (ev)=>{
            //      sconsole.log( ev ); 
            if (ev.initialise !== undefined){
                self.startQuaternion = self.obj3D.quaternion.clone();
            }else{
                self.obj3D.quaternion.copy( self.startQuaternion );
                //self.obj3D.rotateY(ev.theta);
                self.obj3D.rotateY(ev.theta * 10);
                self.ui.updateElement('info', `rotate ${ev.theta.toFixed(3)}`  );
            }
        });
        
        this.renderer.setAnimationLoop( this.render.bind(this) );
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }

    requestHitTestSource() {
        const self = this;

        const session = this.renderer.xr.getSession();

        session.requestReferenceSpace('viewer').then(function (referenceSpace) {

            session.requestHitTestSource({ space: referenceSpace }).then(function (source) {

                self.hitTestSource = source;

            });

        });

        session.addEventListener('end', function () {

            self.hitTestSourceRequested = false;
            self.hitTestSource = null;
            self.referenceSpace = null;

        });

        this.hitTestSourceRequested = true;

    }

    getHitTestResults(frame) {
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);

        if (hitTestResults.length) {

            const referenceSpace = this.renderer.xr.getReferenceSpace();
            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);

            this.reticle.visible = true;
            this.reticle.matrix.fromArray(pose.transform.matrix);

        } else {

            this.reticle.visible = false;

        }

    }
    
	//render( ) {   
    render(timestamp, frame) {

        if (frame) {
            if (this.hitTestSourceRequested === false) this.requestHitTestSource()

            if (this.hitTestSource) this.getHitTestResults(frame);
        }
        //const dt = this.clock.getDelta();
        this.stats.update();
        if ( this.renderer.xr.isPresenting ){
            this.gestures.update();
            this.ui.update();
        }
        //if ( this.obj3D !== undefined ) this.obj3D.update(dt);
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };