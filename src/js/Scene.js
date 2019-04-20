import * as THREE from 'three';
import { TweenMax, Expo, Power0 } from 'gsap/all';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/loaders/DRACOLoader';
import 'three/examples/js/postprocessing/EffectComposer';
import 'three/examples/js/postprocessing/RenderPass';
import 'three/examples/js/postprocessing/OutlinePass';
import 'three/examples/js/postprocessing/ShaderPass';
import 'three/examples/js/shaders/CopyShader';
import Stats from 'three/examples/js/libs/stats.min';

import modelName from '../assets/house.glb';
// import modelName from '../assets/test.glb';
// import modelName from '../assets/house.gltf';
// import '../assets/model.bin';
// import modelName from '../assets/aircraft.glb';
// import modelName from '../assets/Duck.glb';
// import modelName from '../assets/LittlestTokyo.glb';
/*import modelName from '../assets/DamagedHelmet/DamagedHelmet.gltf';
import '../assets/DamagedHelmet/DamagedHelmet.bin';
import '../assets/DamagedHelmet/Default_albedo.jpg';
import '../assets/DamagedHelmet/Default_emissive.jpg';
import '../assets/DamagedHelmet/Default_metalRoughness.jpg';
import '../assets/DamagedHelmet/Default_normal.jpg';
import '../assets/DamagedHelmet/Default_AO.jpg';*/

// TODO: reduce .glb file size (refer to only one texture map), check if importing the levels as different object works
//  with opacity changes
// Inspiration:
// https://threejs.org/examples/#webgl_animation_keyframes
// French website https://voyage-electrique.rte-france.com/
// Behance https://www.behance.net/gallery/54361197/City
// Codepen portfolio https://codepen.io/Yakudoo/

/* Global constants */
const WEBPACK_MODE = process.env.NODE_ENV;

/* Initiate global variables */
let camera, scene, renderer, pointLight;
let mixer, controls, stats;
let INTERSECTED;
let composer, outlinePass;

/* Camera stuff */
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let aspect = screenWidth / screenHeight;
let frustumSize = 10;
let defaultCameraPosition = { x: 5, y: 3, z: 8 };

/* Three.js variables */
let clock = new THREE.Clock();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

/* For debugging */
let assistantCamera;
let cameraHelper;

export let init = () => {
    //let canvasElement = document.getElementById('canvas');
    let container = document.getElementById('container');
    let progress = document.getElementById('progress');

    window.addEventListener('resize', resizeCanvas, false); // TODO: check options
    document.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    /* For debugging */
    stats = new Stats();
    container.appendChild(stats.dom);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    //renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    // renderer.gammaFactor = 2.2;
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfe3dd);

    camera = new THREE.OrthographicCamera(
        frustumSize * aspect / - 2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / - 2,
        1,
        30
    );
    camera.position.set(20, 12, 8);
    assistantCamera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
    assistantCamera.position.set(50, 20, 8);

    controls = new THREE.OrbitControls(assistantCamera, renderer.domElement);
    // controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    // controls.target.set(0, 0, 0);

    scene.add( new THREE.AmbientLight(0x404040));

    pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.copy(camera.position);
    scene.add(pointLight);

    let loader = new THREE.GLTFLoader();
    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    THREE.DRACOLoader.setDecoderPath(WEBPACK_MODE === 'development' ?
        './node_modules/three/examples/js/libs/draco/gltf/' : './assets/draco/gltf/'
    );
    loader.setDRACOLoader(new THREE.DRACOLoader());
    // Optional: Pre-fetch Draco WASM/JS module, to save time while parsing.
    THREE.DRACOLoader.getDecoderModule();

    loader.load(modelName, gltf => {
        removeLoadingScreen();

        let model = gltf.scene;
        let animations = gltf.animations;
        model.position.set(1, 0, 1);
        // model.position.set(1, 0, 0);
        model.scale.set(0.5, 0.5, 0.5);
        // model.scale.set(0.01, 0.01, 0.01);

        model.traverse(node => {
            if (node instanceof THREE.Mesh) {
                console.log(node.material);
                node.material.aoMapIntensity = 4;
                // TODO: set transparancy to true (for every floor)
            }
        });

        scene.add(model);
        /*mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(animations[0]).play();*/

        start();
    },
    xhr => {
        let percentage = Math.round(xhr.loaded / xhr.total * 100);
        progress.textContent = percentage.toString();

        console.log('Model ' + percentage + '% loaded');
    },
    error => {
        console.log('Error', error);
    });

    composer = new THREE.EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);

    let renderPass = new THREE.RenderPass(scene, assistantCamera);
    composer.addPass(renderPass);

    /*let copyPass = new THREE.ShaderPass( THREE.CopyShader );
    composer.addPass( copyPass );*/

    outlinePass = new THREE.OutlinePass(new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, assistantCamera);
    composer.addPass(outlinePass);

    /* Helpers */
    cameraHelper = new THREE.CameraHelper(camera);
    // scene.add(cameraHelper);

    let pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
    scene.add(pointLightHelper);

    let axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
};

let start = () => {
    animate();

    animateCamera(defaultCameraPosition, 1, 1.25, Expo.easeOut);
    // TweenMax.to(camera.position, 1.25, { ease: Expo.easeOut, x: 5, y: 3 });
};

/*let stop = () => {
    cancelAnimationFrame(frameId);
};*/

let radius = 10, theta = 0;
let animate = () => {
    requestAnimationFrame(animate);

    let delta = clock.getDelta();
    if (mixer) { // TODO: check if if-statement is necessary here
        mixer.update(delta);
    }
    controls.update(delta);

    /* For debugging */
    stats.update();
    theta += 1;
    pointLight.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
    // pointLight.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
    pointLight.position.z = radius * Math.cos(THREE.Math.degToRad(theta));

    camera.lookAt(scene.position);
    camera.updateMatrixWorld();
    cameraHelper.update();

    composer.render();
    // renderer.render(scene, assistantCamera);
    // renderer.render(scene, camera);

    stats.end();
};

let resizeCanvas = () => { // Check https://threejs.org/docs/index.html#manual/en/introduction/FAQ for resize formula
    console.log('resize');

    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    aspect = screenWidth / screenHeight;

    renderer.setSize(screenWidth, screenHeight);

    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
    cameraHelper.update();

    /*camera.fov = Math.atan(window.innerHeight / 2 / camera.position.z) * 2 * THREE.Math.RAD2DEG;
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();*/

    // Perspective camera
    /*camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );*/
};

let selectedObjects = [];
let addSelectedObject = (object) => {
    selectedObjects = [];
    selectedObjects.push(object);
};

let onMouseMove = event => {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, assistantCamera);
    // raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    let intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) { // TODO: make only selectable objects have an outline
        let selectedObject = intersects[0].object;
        addSelectedObject(selectedObject);
        outlinePass.selectedObjects = selectedObjects;
    }
};

let onClick = event => {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, assistantCamera);
    // raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    let intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        if (INTERSECTED !== intersects[0].object) {
            if (INTERSECTED) {
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            }
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex(0xff0000);

            console.log(intersects[0].object.name);

            animateCamera({
                x: THREE.Math.randInt(-10, 10),
                y: 3,
                z: THREE.Math.randInt(-10, 10),
            }, THREE.Math.randInt(1, 5));
            // animateCamera(intersects[0].object.position);
        }
    } else {
        resetSelected();
    }
};

let removeLoadingScreen = () => {
    let loadingScreen = document.getElementById('loading-screen');

    if (loadingScreen.classList) {
        loadingScreen.classList.add('hidden');
    } else {
        loadingScreen.className += ' hidden';
    }
};

export let animateCamera = (objectPosition, targetZoom = 1, duration = 2, easing = Expo.easeInOut) => {
    TweenMax.to(camera.position, duration, {
        x: objectPosition.x,
        y: objectPosition.y,
        z: objectPosition.z,
        ease: easing,
        /*onUpdate: () => {
            console.log(camera.position);
        }*/
    });
    TweenMax.to(camera, duration, {
        zoom: targetZoom,
        ease: Expo.easeInOut,
        onUpdate: () => {
            camera.updateProjectionMatrix();
        }
    });

    /*TweenMax(camera.position)
        .to({
            x: 25,
            y: 25,
            z: 25,
        }, 1000)
        .easing(Expo.easeInOut)
        .on('update', ({ x, y, z }) => {
            console.log(x, y, z);
            camera.lookAt(1, 1, 0);
        })
        .start();*/
};

let setOpacity = (objects, targetOpacity) => {
    /*TweenMax.to(object, duration, {
        opacity: targetOpacity,
        ease: Expo.easeInOut,
        onUpdate: () => {
            console.log(object.opacity)
        }
    });*/

    /*opacityTween = new Tween(Object.assign({}, currentOpacity))
        .to(Object.assign({}, targetOpacity), 500)
        .delay(500)
        .on('update', (o) => {
            for (let i = 0; i < targetProperties.objects.length; i++) {
                targetProperties.objects[i].material.opacity = o[i];
            }
        });
    opacityTween.start();*/
};

export let selectFloor = (value) => {
    console.log(value);
};

export let resetCamera = () => {
    // Reset camera
    animateCamera(defaultCameraPosition);
};

export let resetSelected = () => {
    if (INTERSECTED) {
        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
    }
    INTERSECTED = null;
};