import * as THREE from 'three';
import { TweenMax, Expo } from 'gsap/all';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/loaders/DRACOLoader';
import Stats from 'three/examples/js/libs/stats.min';

// import model from './assets/model.gltf';
// import model from './assets/Duck.glb';
import modelName from '../assets/LittlestTokyo.glb';

// TODO: Check 3D style from this French website https://voyage-electrique.rte-france.com/ and from Behance https://www.behance.net/gallery/54361197/City
// TODO: Check Codepen portfolio https://codepen.io/Yakudoo/
// Inspiration: https://threejs.org/examples/#webgl_animation_keyframes

const WEBPACK_MODE = process.env.NODE_ENV;

let camera, scene, renderer, pointLight;
let mixer, controls, stats;
let clock = new THREE.Clock();

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let aspect = screenWidth / screenHeight;
let frustumSize = 7;

export let init = () => {
    //let canvasElement = document.getElementById('canvas');
    let container = document.getElementById('container');
    let progress = document.getElementById('progress');

    window.addEventListener('resize', resizeCanvas);
    container.addEventListener('click', onClick);

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
        1000
    );
    // camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(50, 20, 8);
    // camera.position.set(50, 20, 8);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
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
        model.position.set(1, 1, 0);
        model.scale.set(0.01, 0.01, 0.01);

        model.traverse(node => {
            if (node instanceof THREE.Mesh) {
                console.log(node.name);
            }
        });

        scene.add(model);
        mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(animations[0]).play();

        // animate();
        start();
    },
    xhr => {
        let percentage = Math.round(xhr.loaded / xhr.total * 100);
        progress.textContent = percentage.toString();

        console.log('model ' + percentage + '% loaded');
    },
    error => {
        console.log('Error', error);
    });

    /* Helpers */
    let cameraHelper = new THREE.CameraHelper(camera);
    scene.add(cameraHelper);

    let axesHelper = new THREE.AxesHelper( 5 );
    scene.add(axesHelper);

    // animate();
};

let start = () => {
    animate();

    TweenMax.to(camera.position, 1.25, { ease: Expo.easeOut, x: 5, y: 2 });
};

/*let stop = () => {
    cancelAnimationFrame(frameId);
};*/

let animate = () => {
    let delta = clock.getDelta();

    requestAnimationFrame(animate);
    if (mixer) { // TODO: check if if-statement is necessary here
        mixer.update(delta);
    }
    controls.update(delta);
    stats.update();

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

    /*camera.fov = Math.atan(window.innerHeight / 2 / camera.position.z) * 2 * THREE.Math.RAD2DEG;
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();*/

    // Perspective camera
    /*camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );*/
};

let onClick = event => {
    console.log(event);

    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();

    // animateCamera(camera);
};

let removeLoadingScreen = () => {
    let loadingScreen = document.getElementById('loading-screen');

    if (loadingScreen.classList) {
        loadingScreen.classList.add('hidden');
    } else {
        loadingScreen.className += ' hidden';
    }
};

let animateCamera = camera => {
    TweenMax.to(camera.position, 2, {
        x: 25,
        y: 25,
        z: 25,
        ease: Expo.easeInOut,
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