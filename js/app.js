import * as THREE from './three125/three.js';
import { MTLLoader } from './three125/MTLLoader.js';    
import { OBJLoader } from './three125/OBJLoader.js';
import { RGBELoader } from './three125/RGBELoader.js';

import { LoadingBar } from './LoadingBar.js';

class App {
    constructor() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        this.loadingBar = new LoadingBar();
        this.loadingBar.visible = false;

      

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        this.camera.position.set(0, 1.6, 0);

        this.scene = new THREE.Scene();

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        ambient.position.set(0.5, 1, 0.25);
        this.scene.add(ambient);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(this.renderer.domElement);
        //this.setEnvironment();

        this.reticle = new THREE.Mesh(
            new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2),
            new THREE.MeshBasicMaterial()
        );

        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);

        this.setupXR();

        window.addEventListener('resize', this.resize.bind(this));

    }

    setupXR() {
        this.renderer.xr.enabled = true;

        if ('xr' in navigator) {

            navigator.xr.isSessionSupported('immersive-ar').then((supported) => {

                if (supported) {
                    const collection = document.getElementsByClassName("ar-button");
                    [...collection].forEach(el => {
                        el.style.display = 'block';
                    });
                }
            });

        }

        const self = this;

        this.hitTestSourceRequested = false;
        this.hitTestSource = null;

        function onSelect() {
            console.log("!!!! -0- onSelect", self.obj3D);
            if (self.obj3D === undefined) return;
            console.log("!!!! -1- onSelect");
            if (self.reticle.visible) {
                self.obj3D.position.setFromMatrixPosition(self.reticle.matrix);
                self.obj3D.visible = true;
                console.log("!!!! -2- onSelect", self.obj3D);
            }
        }

        this.controller = this.renderer.xr.getController(0);
        console.log("this.controller", this.controller);
        console.log("this.renderer.xr", this.renderer.xr);

        this.controller.addEventListener('select', onSelect);
        this.controller.addEventListener('touch', () => { let date = new Date(); console.log(`click - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} `); });

        this.scene.add(this.controller);
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    //setEnvironment(){
    //    const loader = new RGBELoader().setDataType( THREE.UnsignedByteType );
    //    const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
    //    pmremGenerator.compileEquirectangularShader();

    //    const self = this;

    //    loader.load( '../../assets/hdr/venice_sunset_1k.hdr', ( texture ) => {
    //      const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
    //      pmremGenerator.dispose();

    //      self.scene.environment = envMap;

    //    }, undefined, (err)=>{
    //        console.error( 'An error occurred setting the environment');
    //    } );
    //}

    //showObj3D_orig(id){
    //       this.initAR();

    //	const loader = new GLTFLoader( ).setPath(this.assetsPath);
    //       const self = this;

    //       this.loadingBar.visible = true;

    //	// Load a glTF resource
    //	loader.load(
    //		// resource URL
    //		`obj3D${id}.glb`,
    //		// called when the resource is loaded
    //		function ( gltf ) {

    //			self.scene.add( gltf.scene );
    //               self.obj3D = gltf.scene;

    //               self.obj3D.visible = false; 

    //               self.loadingBar.visible = false;

    //               self.renderer.setAnimationLoop( self.render.bind(self) );
    //		},
    //		// called while loading is progressing
    //		function ( xhr ) {

    //			self.loadingBar.progress = (xhr.loaded / xhr.total);

    //		},
    //		// called when loading has errors
    //		function ( error ) {

    //			console.log( 'An error happened' );

    //		}
    //       );
    //}			

    showObj3D1(objURL) {

        this.initAR();
        const self = this;
        this.loadingBar.visible = true;
        const loader = new OBJLoader();
        loader.load(
            // resource URL
            objURL,

            // onLoad callback
            // Here the loaded data is assumed to be an object
            function (obj) {
                // Add the loaded object to the scene
                self.scene.add(obj);

                self.obj3D = obj;

                self.obj3D.visible = false;

                self.loadingBar.visible = false;

                self.renderer.setAnimationLoop(self.render.bind(self));



            },

            // onProgress callback
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                self.loadingBar.progress = (xhr.loaded / xhr.total);
            },

            // onError callback
            function (error) {
                console.error('An error happened', error);
            }
        );



    }

    showObj3D(texturesURL, objURL, objName) {
        if (texturesURL === null) {
            texturesURL = objURL;
        }
        this.initAR();
        const self = this;
        this.loadingBar.visible = true;

        let mtlLoader = new MTLLoader();
        //mtlLoader.setResourcePath(metadata.texturesURL).setPath(metadata.objURL);       
        mtlLoader.setResourcePath(texturesURL).setPath(objURL );
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

                //if (obj.type == "Group") {

                //    if (isStair || obj.children.length > 1) {
                        //if (isStair) {
                        //obj.rotation.x = (3 * Math.PI) / 2;
                        //}

                        //let box = new THREE.Box3().setFromObject(object);
                        //let width = (Math.abs(box.max.x) + Math.abs(box.min.x));
                        //let height = (Math.abs(box.max.y) + Math.abs(box.min.y));
                        //let depth = (Math.abs(box.max.z) + Math.abs(box.min.z));
                        //console.log("width = " + width);
                        //console.log("height = " + height);
                        //console.log("depth = " + depth);

                        //let boxGeometry = new THREE.BoxGeometry(width, height, depth);
                        //geometry = new THREE.Geometry();
                        //geometry.vertices = boxGeometry.vertices;
                        //geometry.faces = boxGeometry.faces;
                        //geometry.faceVertexUvs = boxGeometry.faceVertexUvs;

                        //material = new THREE.MeshLambertMaterial({ color: 0xa1a1cf, opacity: 0, transparent: true });
                  //  } else if (obj.children.length == 1 && obj.children[0].isMesh) {
                        //let child = object.children[0];
                        //child.geometry.scale(scaleVal, scaleVal, scaleVal);
                        //geometry = child.geometry;
                        //material = child.material;
                   // }
                //}
               

                self.scene.add(obj);

                self.obj3D = obj;

                self.obj3D.visible = false;

                self.loadingBar.visible = false;

                self.renderer.setAnimationLoop(self.render.bind(self));
              
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


    initAR() {
        let currentSession = null;
        const self = this;

        const sessionInit = { requiredFeatures: ['hit-test'] };


        function onSessionStarted(session) {

            session.addEventListener('end', onSessionEnded);

            self.renderer.xr.setReferenceSpaceType('local');
            self.renderer.xr.setSession(session);

            currentSession = session;

        }

        function onSessionEnded() {

            currentSession.removeEventListener('end', onSessionEnded);

            currentSession = null;

            if (self.obj3D !== null) {
                self.scene.remove(self.obj3D);
                self.obj3D = null;
            }

            self.renderer.setAnimationLoop(null);

        }

        if (currentSession === null) {

            navigator.xr.requestSession('immersive-ar', sessionInit).then(onSessionStarted);

        } else {

            currentSession.end();

        }
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

    render(timestamp, frame) {

        if (frame) {
            if (this.hitTestSourceRequested === false) this.requestHitTestSource()

            if (this.hitTestSource) this.getHitTestResults(frame);
        }

        this.renderer.render(this.scene, this.camera);

    }
}

export { App };