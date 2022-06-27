import * as THREE from './three125/three.js';
import { LoadingBar } from './LoadingBar.js';
import { MTLLoader } from './three125/MTLLoader.js';
import { OBJLoader } from './three125/OBJLoader.js';
import { ControllerGestures } from './three125/ControllerGestures.js';

class App {
    constructor() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        this.clock = new THREE.Clock();

        this.loadingBar = new LoadingBar();
        this.loadingBar.visible = false;

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        this.camera.position.set(0, 1.6, 3);

        this.scene = new THREE.Scene();

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 2);
        ambient.position.set(0.5, 1, 0.25);
        this.scene.add(ambient);

        const light = new THREE.DirectionalLight();
        light.position.set(0.2, 1, 1);
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(this.renderer.domElement);

        this.initScene();                 
        this.setupXR();
        

        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    loadObj3D(texturesURL, objURL, objName) {
        if (texturesURL === null) {
            texturesURL = objURL;
        }

        const self = this;
        
        self.loadingBar.visible = true;

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

                self.initAR();
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

    initScene() {
        
        this.reticle = new THREE.Mesh(
            new THREE.RingBufferGeometry(0.15, 0.20, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xFF0000 })
        );
        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);

        this.renderer.setAnimationLoop(this.render.bind(this));
    }

    setupXR() {
        this.renderer.xr.enabled = true;
        //const btn = new ARButton(this.renderer, { sessionInit: { requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay'], domOverlay: { root: document.body } } });

        const self = this;
        this.hitTestSourceRequested = false;
        this.hitTestSource = null;

        this.gestures = new ControllerGestures(this.renderer);
        this.gestures.addEventListener('tap', (ev) => {
            //console.log( '!!! tap' ); 
            if (self.obj3D !== undefined) {
                if (self.reticle.visible) {
                    self.obj3D.position.setFromMatrixPosition(self.reticle.matrix);
                    self.obj3D.visible = true;
                }
            }
        });
        this.gestures.addEventListener('doubletap', (ev) => {
            //console.log( 'doubletap');
        });
        this.gestures.addEventListener('press', (ev) => {
            //console.log( 'press' );            
        });
        this.gestures.addEventListener('pan', (ev) => {
            //console.log( ev );
            if (ev.initialise !== undefined) {
                self.startPosition = self.obj3D.position.clone();
            } else {
                //const pos = self.startPosition.clone().add( ev.delta.multiplyScalar(3) );
                const pos = self.startPosition.clone().add(ev.delta.multiplyScalar(20));
                self.obj3D.position.copy(pos);
                //self.ui.updateElement('info', `pan x:${ev.delta.x.toFixed(3)}, y:${ev.delta.y.toFixed(3)}, x:${ev.delta.z.toFixed(3)}`);
                console.log("!! info " + `pan x:${ev.delta.x.toFixed(3)}, y:${ev.delta.y.toFixed(3)}, x:${ev.delta.z.toFixed(3)}`);
            }
        });
        this.gestures.addEventListener('swipe', (ev) => {
            //console.log( ev );               
            console.log("!!! swipe");
            if (self.obj3D.visible) {
                self.obj3D.visible = false;
                //self.scene.remove( self.obj3D ); 
            }
        });
        this.gestures.addEventListener('pinch', (ev) => {
            console.log("!!! pinch");
            /*
            //console.log( ev );  
            if (ev.initialise !== undefined) {
                self.startScale = self.obj3D.scale.clone();
            } else {
                const scale = self.startScale.clone().multiplyScalar(ev.scale);
                self.obj3D.scale.copy(scale);               
               
            }
            */
        });
        this.gestures.addEventListener('rotate', (ev) => {
            //console.log( ev ); 
            if (ev.initialise !== undefined) {
                self.startQuaternion = self.obj3D.quaternion.clone();
            } else {
                self.obj3D.quaternion.copy(self.startQuaternion);
                //self.obj3D.rotateY(ev.theta);
                self.obj3D.rotateY(ev.theta * 10);               
                console.log("!!! rotate");
            }
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
        session.requestReferenceSpace('viewer').then(
            function (referenceSpace) {
                session.requestHitTestSource({ space: referenceSpace }).then(
                    function (source) {
                        self.hitTestSource = source;
                    }
                )
            }
        );

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
        const dt = this.clock.getDelta();

        const self = this;

        if (frame) {
            if (this.hitTestSourceRequested === false) this.requestHitTestSource();
            if (this.hitTestSource) this.getHitTestResults(frame);
        }

        if (this.renderer.xr.isPresenting) {
            this.gestures.update();            
        }

        this.renderer.render(this.scene, this.camera);
    }
}

export { App };
