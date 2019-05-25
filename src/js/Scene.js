import * as THREE from 'three';
import { TweenMax, Expo, Power0 } from 'gsap/all';

import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import 'three/examples/js/loaders/DRACOLoader';
import 'three/examples/js/postprocessing/EffectComposer';
import 'three/examples/js/postprocessing/RenderPass';
import 'three/examples/js/postprocessing/OutlinePass';
import 'three/examples/js/postprocessing/ShaderPass';
import 'three/examples/js/postprocessing/SAOPass';
import 'three/examples/js/shaders/CopyShader';
import 'three/examples/js/shaders/FXAAShader';
import 'three/examples/js/shaders/SAOShader';
import 'three/examples/js/shaders/DepthLimitedBlurShader';
import 'three/examples/js/shaders/UnpackDepthRGBAShader';
// import 'three/examples/js/WebGL.js';

import Stats from 'three/examples/js/libs/stats.min';
import dat from 'three/examples/js/libs/dat.gui.min.js';

import modelName from '../assets/house.glb';
/*import modelName from '../assets/testORM.gltf';
import '../assets/testORM.bin';
import '../assets/GrayA.png';*/
// import modelName from '../assets/Flamingo.glb';
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

// TODO: check if importing the levels as different object works with opacity changes
// TODO: think about mobile version
// TODO: for improving light through window check:
//  Alphatest customDepthMaterial https://threejs.org/examples/webgl_animation_cloth.html
//  DepthWrite https://stackoverflow.com/questions/15994944/transparent-objects-in-threejs/15995475#15995475
// Inspiration:
// House design style https://www.linkedin.com/feed/update/urn:li:activity:6533419696492945408
// LittlestTokyo https://threejs.org/examples/#webgl_animation_keyframes
// French website https://voyage-electrique.rte-france.com/
// Behance https://www.behance.net/gallery/54361197/City
// Codepen portfolio https://codepen.io/Yakudoo/
// Blog: https://jolicode.com/blog/making-3d-for-the-web

/* Global constants */
const WEBPACK_MODE = process.env.NODE_ENV;

/* Initiate global variables */
let camera, scene, renderer;
let pointLight, directionalLight;
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
let SAOparameters = {
    output: 0,
    saoBias: 1,
    saoIntensity: 0.08,
    saoScale: 10,
    saoKernelRadius: 75,
    saoMinResolution: 0,
    saoBlur: true,
    saoBlurRadius: 5,
    saoBlurStdDev: 7,
    saoBlurDepthCutoff: 0.0008
};
let meshGroup = new THREE.Group();

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

    renderer = new THREE.WebGLRenderer(); // { antialias: true }
    //renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    // scene.background = new THREE.Color().setHSL(0.6, 0, 1);
    scene.background = new THREE.Color(0xbfe3dd);
    // scene.fog = new THREE.Fog(scene.background, 1, 5000);

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

    let ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.color.setHSL(0.1, 1, 0.5);
    directionalLight.position.set(0, 8, 20);
    scene.add(directionalLight);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    let d = 10;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.far = 1000; //3500
    directionalLight.shadow.bias = -0.0001;

    /*pointLight = new THREE.PointLight(0xf15b27, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);*/

    let hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemisphereLight.color.setHSL(0.6, 1, 0.6);
    hemisphereLight.groundColor.setHSL(0.095, 1, 0.75);
    hemisphereLight.position.set(0, 50, 0);
    //scene.add(hemisphereLight);

    // GROUND
    /*let groundGeo = new THREE.PlaneBufferGeometry(10, 10);
    let groundMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); // MeshLambertMaterial
    groundMat.color.setHSL(0.095, 1, 0.75);
    let ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -5;
    ground.rotation.x = - Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);*/

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
        // let animations = gltf.animations;
        // model.position.set(1, 0, 1);
        // model.position.set(1, 0, 0);
        // model.scale.set(0.2, 0.2, 0.2);
        // model.scale.set(0.01, 0.01, 0.01);
        let meshArray = [];

        model.traverse(node => {
            if (node instanceof THREE.Mesh) {
                // console.log(node.material);
                node.receiveShadow = true;
                node.castShadow = true;
                node.material.transparent = true;

                meshArray.push(node);
                // ground.material.aoMap = node.material.aoMap;

                /*node.material.map = node.material.aoMap;
                node.material.aoMap = null;*/
                // node.material.aoMapIntensity = 4;

                // console.log(node);
            }
        });

        meshGroup.children = meshArray;
        scene.add(meshGroup);
        // scene.add(model);
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

    /* Postprocessing */
    composer = new THREE.EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);

    let renderPass = new THREE.RenderPass(scene, assistantCamera);
    composer.addPass(renderPass);

    /*let copyPass = new THREE.ShaderPass( THREE.CopyShader );
    composer.addPass( copyPass );*/

    outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, assistantCamera);
    composer.addPass(outlinePass);

    let saoPass = new THREE.SAOPass(scene, assistantCamera, false, true);
    saoPass.params = SAOparameters;
    composer.addPass(saoPass);

    // Init gui
    /*var gui = new dat.GUI();
    gui.add( saoPass.params, 'output', {
        'Beauty': THREE.SAOPass.OUTPUT.Beauty,
        'Beauty+SAO': THREE.SAOPass.OUTPUT.Default,
        'SAO': THREE.SAOPass.OUTPUT.SAO,
        'Depth': THREE.SAOPass.OUTPUT.Depth,
        'Normal': THREE.SAOPass.OUTPUT.Normal
    } ).onChange( function ( value ) {
        saoPass.params.output = parseInt( value );
    } );
    gui.add( saoPass.params, 'saoBias', - 1, 1 );
    gui.add( saoPass.params, 'saoIntensity', 0, 1 );
    gui.add( saoPass.params, 'saoScale', 0, 10 );
    gui.add( saoPass.params, 'saoKernelRadius', 1, 100 );
    gui.add( saoPass.params, 'saoMinResolution', 0, 1 );
    gui.add( saoPass.params, 'saoBlur' );
    gui.add( saoPass.params, 'saoBlurRadius', 0, 200 );
    gui.add( saoPass.params, 'saoBlurStdDev', 0.5, 150 );
    gui.add( saoPass.params, 'saoBlurDepthCutoff', 0.0, 0.1 );*/

    let effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    effectFXAA.uniforms['resolution' ].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.addPass(effectFXAA);

    /* Helpers */
    cameraHelper = new THREE.CameraHelper(camera);
    // scene.add(cameraHelper);

    let dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 2);
    scene.add(dirLightHelper);

    let hemiSphereHelper = new THREE.HemisphereLightHelper(hemisphereLight, 2);
    scene.add(hemiSphereHelper);

    /*let pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
    scene.add(pointLightHelper);*/

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
    /*theta += 1;
    directionalLight.position.x = radius * Math.cos(THREE.Math.degToRad(theta));*/
    // directionalLight.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
    // directionalLight.position.z = radius * Math.cos(THREE.Math.degToRad(theta));
    // pointLight.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
    // pointLight.position.z = radius * Math.cos(THREE.Math.degToRad(theta));

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
let addSelectedObject = object => {
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
        // console.log(selectedObject);
        // addSelectedObject(selectedObject);
        outlinePass.selectedObjects = [selectedObject];
        // outlinePass.selectedObjects = selectedObjects;
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

            console.log(intersects[0].object.material);

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
    let meshes = meshGroup.children;

    let setVisibility = (level, opacity, visibility) => {
        for (let j = 0; j < meshes.length; j++) {
            if (meshes[j].material.name.includes(level.toString())) {
                // console.log('true', meshes[j].material.name);
                meshes[j].material.opacity = opacity;
                meshes[j].material.visible = visibility;
            }
        }
    };

    for (let i = 1; i <= value; i++) {
        setVisibility(i, 1, true);
    }
    for (let i = 4; i > value; i--) {
        setVisibility(i, 0, false);
    }
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
