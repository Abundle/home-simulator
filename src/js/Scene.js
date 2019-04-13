import * as THREE from 'three';
// import 'three';
// import 'three/examples/js/WebGL';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/loaders/DRACOLoader';
import Stats from 'three/examples/js/libs/stats.min';

// import model from './assets/Duck.glb';
// import model from './assets/model.gltf';
import model from '../assets/LittlestTokyo.glb';

// TODO: Check 3D style from this French website https://voyage-electrique.rte-france.com/ and from Behance https://www.behance.net/gallery/54361197/City
// TODO: Check Codepen portfolio https://codepen.io/Yakudoo/

const WEBPACK_MODE = process.env.NODE_ENV;

let camera, scene, renderer, pointLight;
let mixer, controls, stats;
let clock = new THREE.Clock();

// Inspiration: https://threejs.org/examples/#webgl_animation_keyframes

export let init = () => {
    //let canvasElement = document.getElementById('canvas');
    let container = document.getElementById('container');
    window.addEventListener('resize', resizeCanvas);
    container.addEventListener('click', () => {
        console.log('click');
    });

    stats = new Stats();
    container.appendChild(stats.dom);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    //renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    // renderer.gammaFactor = 2.2;
    container.appendChild( renderer.domElement );

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfe3dd);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(5, 2, 8);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);

    scene.add( new THREE.AmbientLight(0x404040));

    pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.copy(camera.position);
    scene.add(pointLight);

    // envmap
    /*let path = 'textures/cube/Park2/';
    let format = '.jpg';
    let envMap = new THREE.CubeTextureLoader().load( [
        path + 'posx' + format, path + 'negx' + format,
        path + 'posy' + format, path + 'negy' + format,
        path + 'posz' + format, path + 'negz' + format
    ] );*/

    let loader = new THREE.GLTFLoader();
    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    THREE.DRACOLoader.setDecoderPath(WEBPACK_MODE === 'development' ?
        './node_modules/three/examples/js/libs/draco/gltf/' : './assets/draco/gltf/'
    );
    loader.setDRACOLoader(new THREE.DRACOLoader());
    // Optional: Pre-fetch Draco WASM/JS module, to save time while parsing.
    THREE.DRACOLoader.getDecoderModule();

    loader.load(model, gltf => { //'./assets/Duck.glb'
        let model = gltf.scene;
        model.position.set(1, 1, 0);
        model.scale.set(0.01, 0.01, 0.01);

        scene.add(model);
        mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();

        animate();
    },
    xhr => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    error => {
        console.log('Error', error);
    });
};

export let animate = () => {
    requestAnimationFrame(animate);

    let delta = clock.getDelta();
    mixer.update(delta);
    controls.update(delta);
    stats.update();

    renderer.render(scene, camera);
};

let resizeCanvas = () => { // Check https://threejs.org/docs/index.html#manual/en/introduction/FAQ for resize formula
    console.log('resize');

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
};