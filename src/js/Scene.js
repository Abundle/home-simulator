import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
/* Postprocessing */
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass';
/* Shaders */
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import { SAOShader } from 'three/examples/jsm/shaders/SAOShader';
import { DepthLimitedBlurShader } from 'three/examples/jsm/shaders/DepthLimitedBlurShader';
import { UnpackDepthRGBAShader } from 'three/examples/jsm/shaders/UnpackDepthRGBAShader';

/*import 'three/examples/js/controls/OrbitControls';
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
import 'three/examples/js/shaders/UnpackDepthRGBAShader';*/
// import 'three/examples/js/WebGL.js';

import { TweenMax, Expo } from 'gsap/all';

// TODO: implement new Three.js modules https://threejs.org/docs/#manual/en/introduction/Import-via-modules
// TODL: split file

import Stats from 'three/examples/jsm/libs/stats.module.js';
// import Stats from 'three/examples/js/libs/stats.min';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
// import dat from 'three/examples/js/libs/dat.gui.min.js';

import { setDrawer, scrollToCategory } from './Categories';
import modelName from '../assets/house.glb';

// TODO: check if importing the levels as different object works with opacity changes
// TODO: think about mobile version (no dynamic lighting, something similar to Google Maps?)
// TODO: check https://materializecss.com/floating-action-button.html & https://stackoverflow.com/questions/37446746/threejs-how-to-use-css3renderer-and-webglrenderer-to-render-2-objects-on-the-sa
// TODO: for improving light through window check:
//  Alphatest customDepthMaterial https://threejs.org/examples/webgl_animation_cloth.html
//  DepthWrite https://stackoverflow.com/questions/15994944/transparent-objects-in-threejs/15995475#15995475
// TODO: check performance drop in Firefox: https://stackoverflow.com/questions/18727396/webgl-and-three-js-running-great-on-chrome-but-horrible-on-firefox
// TODO: check WebAssembly memory full after a couple of reloads (memory leak?)

// Inspiration:
// House design style https://www.linkedin.com/feed/update/urn:li:activity:6533419696492945408
// LittlestTokyo https://threejs.org/examples/#webgl_animation_keyframes
// French website https://voyage-electrique.rte-france.com/
// Behance https://www.behance.net/gallery/54361197/City
// Codepen portfolio https://codepen.io/Yakudoo/
// Blog: https://jolicode.com/blog/making-3d-for-the-web

/* Global constants */
const WEBPACK_MODE = process.env.NODE_ENV;

/* Initiate global scene variables */
let camera, scene, labelScene, renderer, labelRenderer;
let pointLight, directionalLight;
let mixer, controls, label, stats;
let INTERSECTED, SELECTABLE;
let composer, outlinePass;

/* Camera stuff */
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let aspect = screenWidth / screenHeight;
const frustumSize = 25; // 10
const defaultCameraPosition = { x: -30, y: 40, z: 60 }; // { x: 5, y: 3, z: 8 };

/* Three.js variables */
const cameraVector = new THREE.Vector3();
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const outlinePassParameters = {
    edgeStrength: 3,
    edgeGlow: 0.0,
    edgeThickness: 1,
    pulsePeriod: 0,
    rotate: false,
    usePatternTexture: false,
};
const SAOparameters = {
    output: 0,
    saoBias: 1,
    saoIntensity: 0.006, // 0.08
    saoScale: 10,
    saoKernelRadius: 75,
    saoMinResolution: 0,
    saoBlur: true,
    saoBlurRadius: 5,
    saoBlurStdDev: 7,
    saoBlurDepthCutoff: 0.0008
};
const meshGroup = new THREE.Group();
const labelPivot = new THREE.Object3D();

/* For debugging */
let assistantCamera;
let cameraHelper;

export const init = async () => {
    //let canvasElement = document.getElementById('canvas');
    const container = document.getElementById('container');
    const progress = document.getElementById('progress');

    window.addEventListener('resize', resizeCanvas, false); // TODO: check options
    document.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfe3dd);
    // scene.fog = new THREE.Fog(scene.background, 1, 5000);

    labelScene = new THREE.Scene();
    labelScene.scale.set(0.005, 0.005, 0.005);
    label = createLabel();

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

    labelRenderer = new CSS3DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    container.appendChild(labelRenderer.domElement);

    camera = new THREE.PerspectiveCamera(
        20,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    // Making the Euler angles make more sense (from https://stackoverflow.com/questions/28569026/three-js-extract-rotation-in-radians-from-camera)
    camera.rotation.order = 'YXZ';
    /*camera = new THREE.OrthographicCamera(
        frustumSize * aspect / - 2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / - 2,
        1,
        100 // 30
    );*/
    // camera.position.set(defaultCameraPosition.x, defaultCameraPosition.y, defaultCameraPosition.z);
    assistantCamera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
    assistantCamera.position.set(-10, 30, 10);
    assistantCamera.lookAt(0, 0, 0);

    controls = new OrbitControls(camera, labelRenderer.domElement);
    // controls = new OrbitControls(camera, renderer.domElement);
    // controls = new THREE.OrbitControls(assistantCamera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    // controls.target.set(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.color.setHSL(0.1, 1, 0.5);
    directionalLight.position.set(0, 8, 20);
    scene.add(directionalLight);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    const d = 10;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.far = 3500; //3500
    directionalLight.shadow.bias = -0.0001;

    /*pointLight = new THREE.PointLight(0xf15b27, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);*/

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemisphereLight.color.setHSL(0.6, 1, 0.6);
    hemisphereLight.groundColor.setHSL(0.095, 1, 0.75);
    hemisphereLight.position.set(0, 50, 0);
    //scene.add(hemisphereLight);

    const loader = new GLTFLoader();
    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    DRACOLoader.setDecoderPath(WEBPACK_MODE === 'development' ?
        './node_modules/three/examples/js/libs/draco/gltf/' : './assets/draco/gltf/'
    );
    loader.setDRACOLoader(new DRACOLoader());
    // Optional: Pre-fetch Draco WASM/JS module, to save time while parsing.
    await DRACOLoader.getDecoderModule();

    loader.load(modelName, gltf => {
        removeLoadingScreen();

        const model = gltf.scene;
        // let animations = gltf.animations;
        // model.position.set(1, 0, 1);
        // model.position.set(1, 0, 0);
        // model.scale.set(100, 100, 100);
        // model.scale.set(0.01, 0.01, 0.01);
        const meshArray = [];

        model.traverse(node => {
            if (node instanceof THREE.Mesh) {
                // console.log(node.material);
                node.receiveShadow = true;
                node.castShadow = true;
                node.material.transparent = true;

                // Creating a bounding box with Box3 for tracking size of objects and camera zoom
                // node.geometry.computeBoundingBox();
                // let boundingBox = node.geometry.boundingBox.clone();

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
        const percentage = Math.round(xhr.loaded / xhr.total * 100);
        progress.textContent = percentage.toString();

        console.log('Model ' + percentage + '% loaded');
    },
    error => {
        console.log('Error', error);
    });

    /* Postprocessing */
    composer = new EffectComposer(renderer); // TODO: check https://github.com/mrdoob/three.js/wiki/Migration-Guide#r104--r105
    composer.setSize(window.innerWidth, window.innerHeight);

    const renderPass = new RenderPass(scene, camera);
    // let renderPass = new THREE.RenderPass(scene, assistantCamera);
    composer.addPass(renderPass);

    outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    // outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, assistantCamera);
    outlinePass.params = outlinePassParameters;
    outlinePass.visibleEdgeColor.set('#ffffff');
    outlinePass.hiddenEdgeColor.set('#190a05');
    composer.addPass(outlinePass);

    const saoPass = new SAOPass(scene, camera, false, true);
    // let saoPass = new THREE.SAOPass(scene, assistantCamera, false, true);
    saoPass.params = SAOparameters;
    composer.addPass(saoPass);

    // Init gui
    let gui = new GUI();
    // var gui = new dat.GUI();
    gui.add( saoPass.params, 'output', {
        'Beauty': SAOPass.OUTPUT.Beauty,
        'Beauty+SAO': SAOPass.OUTPUT.Default,
        'SAO': SAOPass.OUTPUT.SAO,
        'Depth': SAOPass.OUTPUT.Depth,
        'Normal': SAOPass.OUTPUT.Normal
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
    gui.add( saoPass.params, 'saoBlurDepthCutoff', 0.0, 0.1 );

    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution' ].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    composer.addPass(effectFXAA);

    /* Helpers */
    cameraHelper = new THREE.CameraHelper(camera);
    // scene.add(cameraHelper);

    const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 2);
    scene.add(dirLightHelper);

    const hemiSphereHelper = new THREE.HemisphereLightHelper(hemisphereLight, 2);
    scene.add(hemiSphereHelper);

    /*let pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
    scene.add(pointLightHelper);*/

    let axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);
};

const start = () => {
    animate();

    resetCamera();
    /*animateCamera(defaultCameraPosition, 1, 1.25, Expo.easeOut);
    setLookAt({ x: 0, y: 3, z: 0 });*/
    // TweenMax.to(camera.position, 1.25, { ease: Expo.easeOut, x: 5, y: 3 });
};

/*let stop = () => {
    cancelAnimationFrame(frameId);
};*/

// let radius = 10, theta = 0;
const animate = () => {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) { // TODO: check if if-statement is necessary here
        mixer.update(delta);
    }
    controls.update(delta);

    /* For debugging */
    stats.begin();
    // stats.update();
    /*theta += 1;
    directionalLight.position.x = radius * Math.cos(THREE.Math.degToRad(theta));*/
    // directionalLight.position.y = radius * Math.sin(THREE.Math.degToRad(theta));
    // directionalLight.position.z = radius * Math.cos(THREE.Math.degToRad(theta));
    // pointLight.position.x = radius * Math.sin(THREE.Math.degToRad(theta));
    // pointLight.position.z = radius * Math.cos(THREE.Math.degToRad(theta));

    if (label.object.userData.set) {
        labelPivot.rotation.y = camera.rotation.y;

        /*camera.getWorldDirection(cameraVector);
        labelPivot.rotation.y = -cameraVector.x * (Math.PI / 180);
        console.log(labelPivot.rotation.y, cameraVector.x)*/
    }

    // camera.lookAt(scene.position);
    // camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    cameraHelper.update();

    composer.render();
    // renderer.render(scene, assistantCamera);
    // renderer.render(scene, camera);
    labelRenderer.render(labelScene, camera);

    stats.end();
};

const resizeCanvas = () => { // Check https://threejs.org/docs/index.html#manual/en/introduction/FAQ for resize formula
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
/*let addSelectedObject = object => {
    selectedObjects = [];
    selectedObjects.push(object);
};*/

const onMouseMove = event => {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    // raycaster.setFromCamera(mouse, assistantCamera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        // If an object can be selected, the name of the mesh will begin with an 'S', so selectable will be true
        SELECTABLE = intersects[0].object.name.charAt(0) === 'S';

        // console.log(intersects[0].object);
        if (SELECTABLE) {
            const selectedObject = intersects[0].object;
            // addSelectedObject(selectedObject);
            outlinePass.selectedObjects = [selectedObject];
            // outlinePass.selectedObjects = selectedObjects;
        } else {
            outlinePass.selectedObjects = [];
        }
    }
};

const onClick = event => {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    // raycaster.setFromCamera(mouse, assistantCamera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        // If an object can be selected, the name of the mesh will begin with an 'S', so selectable will be true
        SELECTABLE = intersects[0].object.name.charAt(0) === 'S';
        // console.log(intersects[0].object)

        if (INTERSECTED !== intersects[0].object && SELECTABLE) {
            if (INTERSECTED) {
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            }
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex(0xff0000);

            // console.log(INTERSECTED.position);
            // console.log(intersects[0].object.position);
            selectObject(INTERSECTED);
        }
    } else {
        resetSelected();
    }
};

const removeLoadingScreen = () => {
    const loadingScreen = document.getElementById('loading-screen');

    if (loadingScreen.classList) {
        loadingScreen.classList.add('hidden');
    } else {
        loadingScreen.className += ' hidden';
    }
};

export const animateCamera = (objectPosition, targetZoom = 1, duration = 2, easing = Expo.easeInOut) => {
// export let animateCamera = (objectPosition, targetZoom = 1, duration = 2, easing = Expo.easeInOut, lookAt = { x: 0, y: 5, z: 0 }) => {
    TweenMax.to(camera.position, duration, {
        x: objectPosition.x,
        y: objectPosition.y,
        z: objectPosition.z,
        ease: easing,
        onUpdate: () => {
            camera.updateProjectionMatrix();
        }
    });
    TweenMax.to(camera, duration, {
        zoom: targetZoom,
        ease: Expo.easeInOut,
        /*onUpdate: () => {
            camera.updateProjectionMatrix();
        }*/
    });

    /*let direction = new Vector3();
    camera.getWorldDirection(direction);
    console.log(direction);*/
    // controls.target.set(x, y, z);

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

export const setLookAt = (lookAt, duration = 2, easing = Expo.easeInOut) => {
    // Animate lookAt point
    TweenMax.to(controls.target, duration, {
        x: lookAt.x,
        y: lookAt.y,
        z: lookAt.z,
        ease: easing,
        /*onUpdate: () => {
            camera.updateProjectionMatrix();
        }*/
    });
};

export const setFov = (fov, duration = 2, easing = Expo.easeInOut) => {
    // Animate camera fov
    TweenMax.to(camera, duration, {
        fov: fov,
        ease: easing,
        /*onUpdate: () => {
            camera.updateProjectionMatrix();
        }*/
    });
};

let animateOpacity = (objects, targetOpacity) => {
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

export const selectFloor = value => {
    const meshes = meshGroup.children;

    const setVisibility = (level, opacity, visibility) => {
        for (let j = 0; j < meshes.length; j++) {
            if (meshes[j].material.name.includes(level.toString())) {
                // console.log('true', meshes[j].material.name);
                meshes[j].material.opacity = opacity;
                meshes[j].visible = visibility;
                // meshes[j].material.visible = visibility;
            }
        }
    };

    for (let i = 1; i <= value; i++) {
        setVisibility(i, 1, true); // TODO: set glass opacity differently
    }
    for (let i = 4; i > value; i--) {
        setVisibility(i, 0, false);
    }
};

export const selectObject = object => {
    // Abstract the level of selected object from its material name and use it to select the level
    // Check if an integer was indeed received
    const level = object.material.name.charAt(0);
    const objectSize = object.geometry.boundingSphere.radius;
    // Zoom based on boundingSphere of geometry
    const zoom = Math.sin(objectSize);
    // let zoom = 1 / (Math.round(objectSize) * 0.75);
    let fov = sigmoid(objectSize) * 10 + 15;

    /*const box = new THREE.BoxHelper( object, 0xffff00 );
    scene.add(box);*/

    if (level) {
        selectFloor(level);

        const objectNameArray = object.userData.name.split(' ');
        const category = objectNameArray[objectNameArray.length - 1];

        // setLabel(label, object, objectSize, category);
        setLabel(label, object.position, objectSize, category);

        // TODO: animate camera (or object) to the side when drawer opens + Reflect selected category in the category buttons
        /*setDrawer(true);
        scrollToCategory(category);
        // camera.translateX(10);*/

        /*animateCamera({
            x: 10,
            y: object.position.y + 10,
            z: object.position.z + 2,
        }, zoom);*/

        document.getElementById('radio-' + level).checked = true;
    }

    animateCamera({
        x: -(object.position.x + objectSize / 2 + 1),
        y: object.position.y + objectSize / 2 + 6, // 4
        z: object.position.z + objectSize / 2 + 3,
    }, zoom);
    /*animateCamera({
        x: -object.position.x + 3,
        y: object.position.y + 5,
        z: object.position.z + 3,
    }, zoom);*/

    setLookAt(object.position);
    // setFov(fov);

    // console.log(zoom, objectSize)
    // console.log('fov: ' + fov, 'zoom: ' + zoom, objectSize)
    // console.log('sigmoid: ' + sigmoid(objectSize), 'boundingSphere: ' + objectSize)
    // setFov(Math.round(22 / objectSize));
};

export const createLabel = () => {
    // HTML
    const element = document.createElement('div');
    // element.className = 'animated bounceInDown' ;
    // element.width = '5px';
    element.style.opacity = '0.25';
    element.style.background = '#ffffff';
    element.style.fontSize = '50px'; //2em
    element.style.color = 'black';
    element.style.padding = '1em';
    /*element.style = {
       className: 'animated bounceInDown',
       innerHTML: 'Lorem ipsum. Plain text inside a div.',
       background: '#0094ff',
       fontSize: '2em',
       color: 'black',
       padding: '1em'
   };*/
    document.body.appendChild(element);

    // CSS Object
    const object = new CSS3DObject(element);
    object.position.set(0, 0, 0);
    labelScene.add(object);

    // console.log(element);

    return { // TODO: why return an object again?
        element: element,
        object: object
    };
    // return element;
};

// TODO: Check https://stackoverflow.com/questions/37446746/threejs-how-to-use-css3renderer-and-webglrenderer-to-render-2-objects-on-the-sa
//  & https://discourse.threejs.org/t/scale-css3drenderer-respect-to-webglrenderer/4938/6
export const setLabel = (label, position, radius, text) => {
    const scale = 200;

    label.element.style.opacity = '0.9';
    label.element.innerHTML = 'Lorem ipsum: ' + text;

    const labelWidth = label.element.offsetWidth / 2;
    // const labelWidth = label.element.getBoundingClientRect().width;
    // console.log('label width', labelWidth);

    labelScene.add(labelPivot);
    labelPivot.add(label.object);
    labelPivot.position.set(scale * position.x, scale * position.y, scale * position.z);

    label.object.position.x = scale * radius + labelWidth;
    /*label.object.position.x = 200 * (labelPivot.position.x + radius) + labelWidth;
    label.object.position.y = 200 * labelPivot.position.y;
    label.object.position.z = 200 * labelPivot.position.z;*/

    label.object.userData = { set: true };
};

export const removeLabel = label => {
    label.element.innerHTML = '';
    label.element.style.opacity = '0.25';

    labelScene.add(label.object);
    label.object.position.set(0, 0, 0);
    label.object.userData = { set: false };

    console.log('remove label');
};

export const resetCamera = () => {
    // Reset camera
    animateCamera(defaultCameraPosition, 1, 2, Expo.easeOut);
    // animateCamera(defaultCameraPosition);
    setLookAt({ x: 0, y: 1, z: 0 }, 2, Expo.easeOut);
    setFov(20);
};

export const resetSelected = () => {
    if (INTERSECTED) {
        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
    }
    INTERSECTED = null;

    removeLabel(label);
};

export const sigmoid = x => {
    return 1 / (1 + Math.pow(Math.E, -x));
    // return 1 / (1 + Math.pow(Math.E, -x));
};
