import * as THREE from './three125/three.js';
import { MTLLoader } from './three125/MTLLoader.js';
import { OBJLoader } from './three125/OBJLoader.js';


import { TransformControls } from './three125/TransformControls.js';
import { CanvasUI } from './three125/CanvasUI.js';


import { LoadingBar } from './LoadingBar.js';

class App {
    constructor() {
        alert(`test - ${Date.now()}`);
        this.createUI();

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
      
        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
        this.transformControls.addEventListener('change', this.render.bind(this));
        this.transformControls.addEventListener('dragging-changed', (event) => {
            this.orbitControls.enabled = !event.value;
        });

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

    createUI() {

        const config = {
            panelSize: { width: 0.15, height: 0.038 },
            height: 128,
            info: { type: "text" }
        }
        const content = {
            info: "Debug info"
        }

        const ui = new CanvasUI(content, config);

        this.ui = ui;
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
         

            console.log("!!!! -0- onSelect");
            console.log("!!!! -0- onSelect", self.obj3D);
            if (self.obj3D === undefined ) return;
            console.log("!!!! -1- onSelect");
            if (self.reticle.visible) {
                self.obj3D.position.setFromMatrixPosition(self.reticle.matrix);
                self.obj3D.visible = true;
                self.scene.add(self.transformControls);
                console.log("!!!! -2- onSelect", self.obj3D);
            }
        }

        this.controller = this.renderer.xr.getController(0);        
        this.controller.addEventListener('select', onSelect);        
        this.controller.addEventListener('touch', () => { let date = new Date(); console.log(`click - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} `); });
        
        this.scene.add(this.controller);

        //this.gestures = new ControllerGestures(this.renderer);
        //this.gestures.addEventListener('tap', (ev) => {
        //    //console.log( '!!! tap' ); 
        //    self.ui.updateElement('info', 'tap');
        //    if (!self.obj3D.object.visible) {               
        //        //self.obj3D.object.position.set(0, -0.3, -0.5).add(ev.position);
        //        if (self.reticle.visible) {
        //            self.obj3D.position.setFromMatrixPosition(self.reticle.matrix);                    
        //        }
        //        self.obj3D.visible = true;
                
        //       //self.scene.add(self.obj3D.object);
        //    }
        //});
        //this.gestures.addEventListener('doubletap', (ev) => {
        //    //console.log( 'doubletap');             
        //    self.ui.updateElement('info', 'doubletap');
        //});
        //this.gestures.addEventListener('press', (ev) => {
        //    //console.log( 'press' );                
        //    self.ui.updateElement('info', 'press');
        //});
        //this.gestures.addEventListener('pan', (ev) => {
        //    //console.log( ev );
        //    self.ui.updateElement('info', 'pan');
        //    if (ev.initialise !== undefined) {
        //        self.startPosition = self.obj3D.object.position.clone();
        //    } else {
        //        const pos = self.startPosition.clone().add(ev.delta.multiplyScalar(3));
        //        self.obj3D.object.position.copy(pos);
        //        self.ui.updateElement('info', `pan x:${ev.delta.x.toFixed(3)}, y:${ev.delta.y.toFixed(3)}, x:${ev.delta.z.toFixed(3)}`);
        //    }
        //});
        //this.gestures.addEventListener('swipe', (ev) => {
        //    //console.log( ev );   
        //    self.ui.updateElement('info', 'swipe');
        //    if (self.obj3D.object.visible) {
        //        self.obj3D.object.visible = false;
        //        self.scene.remove(self.obj3D.object);
        //    }
        //});
        //this.gestures.addEventListener('pinch', (ev) => {
        //    //console.log( 'pinch' );
        //    self.ui.updateElement('info', 'pinch');
        //    if (ev.initialise !== undefined) {
        //        self.startScale = self.obj3D.object.scale.clone();
        //    } else {
        //        const scale = self.startScale.clone().multiplyScalar(ev.scale);
        //        self.obj3D.object.scale.copy(scale);
        //        //self.ui.updateElement('info', `pinch delta:${ev.delta.toFixed(3)} scale:${ev.scale.toFixed(2)}`);
        //    }
        //});
        //this.gestures.addEventListener('rotate', (ev) => {
        //    //      sconsole.log( ev ); 
        //    self.ui.updateElement('info', 'rotate');
        //    if (ev.initialise !== undefined) {
        //        self.startQuaternion = self.knight.object.quaternion.clone();
        //    } else {
        //        self.obj3D.object.quaternion.copy(self.startQuaternion);
        //        self.obj3D.object.rotateY(ev.theta);
        //        self.ui.updateElement('info', `rotate ${ev.theta.toFixed(3)}`);
        //    }
        //});

        self.renderer.setAnimationLoop(self.render.bind(self));
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

                self.scene.add(obj);               
                self.obj3D = obj;                
                self.obj3D.visible = false;
                
                self.loadingBar.visible = false;
                
                self.transformControls.attach(self.obj3D);

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


    initAR() {
        let currentSession = null;
        const self = this;

        const sessionInit = { requiredFeatures: ['hit-test'] };

        function onSessionStarted(session) {
            self.ui.mesh.position.set(0, -0.15, -0.3);
            session.addEventListener('end', onSessionEnded);
            self.renderer.xr.setReferenceSpaceType('local');
            self.renderer.xr.setSession(session);
            currentSession = session;
        }

        function onSessionEnded() {
            self.camera.remove(self.ui.mesh);
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