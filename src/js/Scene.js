import * as THREE from 'three';
import { TweenMax, Expo, Power0 } from 'gsap/all';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/loaders/DRACOLoader';
import Stats from 'three/examples/js/libs/stats.min';

// import modelName from '../assets/model.gltf';
// import '../assets/model.bin';
// import modelName from '../assets/aircraft.glb';
// import modelName from '../assets/Duck.glb';
import modelName from '../assets/LittlestTokyo.glb';

// TODO: Check 3D style from this French website https://voyage-electrique.rte-france.com/ and from Behance https://www.behance.net/gallery/54361197/City
// TODO: Check Codepen portfolio https://codepen.io/Yakudoo/
// Inspiration: https://threejs.org/examples/#webgl_animation_keyframes

/* Global constants */
const WEBPACK_MODE = process.env.NODE_ENV;

/* Initiate global variables */
let camera, scene, renderer, pointLight;
let mixer, controls, stats;
let INTERSECTED;

/* Camera stuff */
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let aspect = screenWidth / screenHeight;
let frustumSize = 10;

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
    // document.addEventListener('mousemove', onMouseMove);
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
    controls.target.set(0, 0, 0);
    // controls.target.set(0, 0.5, 0);

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
        model.position.set(1, 0, 0);
        model.scale.set(0.01, 0.01, 0.01);

        /*model.traverse(node => {
            if (node instanceof THREE.Mesh) {
                console.log(node.name);
            }
        });*/

        scene.add(model);
        mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(animations[0]).play();

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

    /* Helpers */
    cameraHelper = new THREE.CameraHelper(camera);
    // scene.add(cameraHelper);

    let axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
};

let start = () => {
    animate();

    animateCamera({ x: 5, y: 3, z: 8 }, 1, 1.25, Expo.easeOut);
    // TweenMax.to(camera.position, 1.25, { ease: Expo.easeOut, x: 5, y: 3 });
};

/*let stop = () => {
    cancelAnimationFrame(frameId);
};*/

// let radius = 10, theta = 0;

let animate = () => {
    requestAnimationFrame(animate);

    let delta = clock.getDelta();
    if (mixer) { // TODO: check if if-statement is necessary here
        mixer.update(delta);
    }
    controls.update(delta);

    stats.update();

    /*theta += 1;
    camera.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
    camera.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
    camera.position.z = radius * Math.cos(THREE.Math.degToRad(theta));
    camera.lookAt(scene.position);
    camera.updateMatrixWorld();*/

    camera.lookAt(scene.position);
    camera.updateMatrixWorld();
    cameraHelper.update();

    // console.log(camera.position);

    // renderer.render(scene, assistantCamera);
    renderer.render(scene, camera);
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

let onMouseMove = event => {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
};

let onClick = event => {
    // console.log(event);

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and mouse position
    // raycaster.setFromCamera(mouse, assistantCamera);
    raycaster.setFromCamera(mouse, camera);

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
        if (INTERSECTED) {
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            // Reset camera
            animateCamera({ x: 5, y: 3, z: 8 });
        }
        INTERSECTED = null;
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

let animateCamera = (objectPosition, targetZoom = 1, duration = 2, easing = Expo.easeInOut) => {

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
            // console.log(camera.zoom);
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