import {
    Scene,
    Vector2,
    Group,
    Object3D,
    Color,
    Mesh,
    WebGLRenderer,
    PerspectiveCamera,
    AmbientLight, DirectionalLight, HemisphereLight,
    DirectionalLightHelper, HemisphereLightHelper, AxesHelper,
    Vector3,
    Raycaster,
    sRGBEncoding,
} from 'three';

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
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';

import { WEBGL } from 'three/examples/jsm/WebGL.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { gsap, Expo } from 'gsap/all';

// Local import
import Categories from './Categories';
import modelName from '../assets/House.glb';
import items from './utils/items.js';
import SceneUtils from './utils/SceneUtils';

// TODO: check if importing the levels as different object works with opacity changes
// TODO: disable sao when performance drops & on lower-tier devices
// TODO: think about mobile version (layout, disable postprocessing etc.)
// TODO: for improving light through window check:
//  Alphatest customDepthMaterial https://threejs.org/examples/webgl_animation_cloth.html
//  DepthWrite https://stackoverflow.com/questions/15994944/transparent-objects-in-threejs/15995475#15995475 + Check https://threejs.org/examples/webgl_camera_logarithmicdepthbuffer.html
// TODO: fix 3D model errors, check https://stackoverflow.com/questions/52441072/gltf2-accessor-unit-length

// Inspiration:
// House design style https://www.linkedin.com/feed/update/urn:li:activity:6533419696492945408
// LittlestTokyo https://threejs.org/examples/#webgl_animation_keyframes
// French website https://voyage-electrique.rte-france.com/
// Behance https://www.behance.net/gallery/54361197/City
// Codepen portfolio https://codepen.io/Yakudoo/
// Blog: https://jolicode.com/blog/making-3d-for-the-web
// WebGL 2: https://threejs.org/docs/#manual/en/introduction/How-to-use-WebGL2
// Three.js fundamentals https://threejsfundamentals.org/
// Smart autocompletion: https://tabnine.com/
// JavaScript functors, applicatives & monads: https://medium.com/@tzehsiang/javascript-functor-applicative-monads-in-pictures-b567c6415221#.rdwll124i
// How to clean up the scene https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects

/* Bug: WebAssembly memory full after a couple of reloads (memory leak with Chrome DevTools
See https://github.com/emscripten-core/emscripten/issues/8126) */

/* Global constants */
const WEBPACK_MODE = process.env.NODE_ENV;

/* Lights */
const directionalLight = new DirectionalLight(0xFFFFFF);
const ambientLight     = new AmbientLight(0x666666);
const hemisphereLight  = new HemisphereLight(0xffffff, 0xffffff, 0.05);

/* Other Three.js variables */
const raycaster        = new Raycaster();
const meshGroup        = new Group();
const labelPivot       = new Object3D();
const stats            = new Stats();

/* Initiate global scene variables */ // TODO: remove
let camera, scene, labelScene, renderer, labelRenderer;
let controls, label;
let composer, outlinePass;

/* For debugging */
const isDev = WEBPACK_MODE === 'development';
let dirLightHelper;

// TODO: sun lighting check https://stackoverflow.com/questions/15478093/realistic-lighting-sunlight-with-three-js
//  or use library for calculating position of the sun? https://github.com/mourner/suncalc
const init = () => {
    const aspect = screenWidth / screenHeight;
    // const canvasElement = document.getElementById('canvas');
    const container = document.getElementById('container');
    const progress = document.getElementById('progress');

    window.addEventListener('resize', resizeCanvas, false); // TODO: check options
    document.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mousedown', onClick, false);

    scene = new Scene();
    scene.background = new Color();
    // scene.fog = new THREE.Fog(scene.background, 1, 5000);

    // updateSunLight();

    labelScene = new Scene();
    labelScene.scale.set(1 / scale, 1 / scale, 1 / scale); // Scale down label size scene
    label = createLabel();

    renderer = new WebGLRenderer(); // { antialias: true }
    // renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(screenWidth, screenHeight);
    renderer.outputEncoding = sRGBEncoding; // See https://threejs.org/docs/#examples/en/loaders/GLTFLoader
    // renderer.setClearColor(0xCCCCCC);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    labelRenderer = new CSS3DRenderer();
    labelRenderer.setSize(screenWidth, screenHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    container.appendChild(labelRenderer.domElement);

    camera = new PerspectiveCamera(
        20,
        aspect,
        1,
        1000
    );
    /* Making the Euler angles make more sense (from https://stackoverflow.com/questions/28569026/three-js-extract-rotation-in-radians-from-camera)
    rotation.y will be the camera yaw in radians
    rotation.x will be the camera pitch in radians
    rotation.z will be the camera roll in radians
     */
    camera.rotation.order = 'YXZ';

    controls = new OrbitControls(camera, labelRenderer.domElement);
    controls.enableDamping = true; // if enabled, you must call .update () in your animation loop
    controls.dampingFactor = 0.25;
    controls.enablePan     = isDev;
    controls.maxPolarAngle = isDev ? Math.PI : Math.PI /2;
    controls.minDistance   = isDev ? 0 : 15;
    controls.maxDistance   = isDev ? Infinity : 125;

    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width  = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    const d = 10;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.far = 3500;
    directionalLight.shadow.bias = -0.0001;

    scene.add(directionalLight);
    scene.add(ambientLight);

    /*pointLight = new THREE.PointLight(0xf15b27, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);*/

    hemisphereLight.color.setHSL(0.6, 1, 0.6);
    hemisphereLight.groundColor.setHSL(0.095, 1, 0.75);
    hemisphereLight.position.set(0, 35, 0);
    scene.add(hemisphereLight);

    const loader = new GLTFLoader();
    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(isDev ?
        './node_modules/three/examples/js/libs/draco/gltf/' : './assets/draco/'
    );
    loader.setDRACOLoader(dracoLoader);

    loader.load(modelName, gltf => {
        SceneUtils.removeLoadingScreen();

        const model = gltf.scene;
        const meshArray = [];

        model.traverse(node => {
            if (node instanceof Mesh) {
                node.receiveShadow = true;
                node.castShadow = true;
                node.material.transparent = true;

                // Creating a bounding box with Box3 for tracking size of objects and camera zoom
                // node.geometry.computeBoundingBox();
                // let boundingBox = node.geometry.boundingBox.clone();

                meshArray.push(node);
            }
        });
        meshGroup.children = meshArray;
        scene.add(meshGroup);

        if (WEBGL.isWebGLAvailable()) {
            // Initiate function or other initializations here
            start();
        } else {
            const warning = WEBGL.getWebGLErrorMessage();
            container.appendChild(warning);
        }
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
    composer = new EffectComposer(renderer);
    composer.setSize(screenWidth, screenHeight);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    outlinePass = new OutlinePass(new Vector2(screenWidth, screenHeight), scene, camera);
    outlinePass.params = SceneUtils.outlinePassParameters;
    outlinePass.visibleEdgeColor.set('#ffffff');
    outlinePass.hiddenEdgeColor.set('#190a05');
    composer.addPass(outlinePass);

    const saoPass = new SAOPass(scene, camera, false, true);
    saoPass.params = SceneUtils.SAOparameters;
    SceneUtils.setSaoPass(saoPass);
    composer.addPass(saoPass);

    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution' ].value.set(1 / screenWidth, 1 / screenHeight);
    composer.addPass(effectFXAA);

    const gammaCorrection = new ShaderPass(GammaCorrectionShader);
    composer.addPass(gammaCorrection);

    /* Performance monitor */
    stats.dom.style.display = 'none';
    container.appendChild(stats.dom);

    /* Init SAO GUI, helpers */
    if (isDev) {
        SceneUtils.initGUI(saoPass);

        dirLightHelper = new DirectionalLightHelper(directionalLight, 2);
        scene.add(dirLightHelper);

        const hemiSphereHelper = new HemisphereLightHelper(hemisphereLight, 2);
        scene.add(hemiSphereHelper);

        /*let pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
        scene.add(pointLightHelper);*/

        const axesHelper = new AxesHelper(3);
        scene.add(axesHelper);
    }
};

const showSAO = bool => {
    SceneUtils.getSaoPass().params.output = bool ? 0 : 1; // 0 = SAO and 1 = Beauty
};

const start = () => {
    animate();
    resetCamera();
};

/*let stop = () => {
    cancelAnimationFrame(frameId);
};*/

// Setup based on https://github.com/dirkk0/threejs_daynight/blob/master/index.html
const animate = () => {
    requestAnimationFrame(animate);

    updateSunLight();

    if (label.object.userData.set) {
        // Since setViewOffset in panView does not seem to work for CSS3DRenderer..
        if (Categories.getDrawer()) {
            // Project this vector from the camera's normalized device coordinate (NDC) space into world space.
            const vector = new Vector3(-280, 550, 0).unproject(camera);
            // const vector = new Vector3(115, 0, -1).unproject(camera); // TODO: remove magic numbers
            // const vector = new Vector3(-400, label.object.position.y, -1).unproject(camera);

            labelPivot.quaternion.set(0, 0, 0, 0);
            // labelPivot.rotation.y = 0;

            label.object.quaternion.slerp(camera.quaternion, 0.08); // t is value between 0 and 1
            // label.object.rotation.y = camera.rotation.y;

            label.object.position.lerp(vector, 0.75);
        } else {
            label.object.position.set(0, 200, 0);
            // label.object.position.set(335, 0, 0);
            label.object.quaternion.set(0, 0, 0, 0);

            labelPivot.quaternion.slerp(camera.quaternion, 0.08); // t is value between 0 and 1
            // labelPivot.rotation.y = camera.rotation.y;
        }
    }

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();
    // controls.enabled = !SceneUtils.getAnimating(); // TODO: temporarily disable controls when camera is animating

    SceneUtils.getPerformanceMonitor() && stats.begin();

    isDev && dirLightHelper.update();

    composer.render();
    labelRenderer.render(labelScene, camera);

    SceneUtils.getPerformanceMonitor() && stats.end();
};

const resizeCanvas = () => { // See https://threejs.org/docs/index.html#manual/en/introduction/FAQ for resize formula
    // Perspective camera
    camera.aspect = screenWidth / screenHeight;
    camera.updateProjectionMatrix();
    // renderer.setSize(screenWidth, screenHeight);
    composer.setSize(screenWidth, screenHeight);
    labelRenderer.setSize(screenWidth, screenHeight);

    // TODO: fix function
};

const getIntersects = (event, raycaster) => {
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(SceneUtils.getMouseObject(event), camera);

    // Calculate objects intersecting the picking ray
    return raycaster.intersectObjects(scene.children, true);
};

const onMouseMove = event => {
    const intersects = getIntersects(event, raycaster);

    if (intersects.length > 0) {
        // If an object can be selected, the name of the mesh will begin with 'S_', so selectable will be true
        SceneUtils.setSelectable(intersects[0].object.name.indexOf('S_') !== -1);

        if (SceneUtils.getSelectable()) {
            const selectedObject = intersects[0].object;
            outlinePass.selectedObjects = [selectedObject];
        } else {
            outlinePass.selectedObjects = [];
        }
    }
};

// TODO: when label is in front of clickable object, the object is selected instead of the label
const onClick = event => {
    const intersects = getIntersects(event, raycaster);

    if (intersects.length > 0) {
        // If an object can be selected, the name of the mesh will begin with an 'S_', so selectable will be true
        SceneUtils.setSelectable(intersects[0].object.name.indexOf('S_') !== -1);

        if (SceneUtils.getIntersected() !== intersects[0].object && SceneUtils.getSelectable()) {
            /*if (INTERSECTED) { // TODO: blur rest of scene when object is selected?
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
            }*/
            SceneUtils.setIntersected(intersects[0].object);
            // INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            // INTERSECTED.material.color.setHex(0xff0000);

            // console.log(INTERSECTED);
            selectObject(SceneUtils.getIntersected());
        }
    } else {
        resetSelected();
    }
};

const selectFloor = value => {
    const meshes = meshGroup.children;

    const setVisibility = (level, opacity, visibility) => {
        for (let j = 0; j < meshes.length; j++) {
            if (meshes[j].material.name.includes(level.toString())) {
                meshes[j].material.opacity = opacity;
                meshes[j].visible = visibility;
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

const animateCamera = (targetPosition, targetZoom = 1, duration = 2, easing = Expo.easeInOut) => {
    gsap.to(camera.position, {
        duration: duration,
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        ease: easing,
        /*onUpdate: () => {
            SceneUtils.setAnimating(true);
        },
        onComplete: () => {
            SceneUtils.setAnimating(false);
        }*/
    });
    gsap.to(camera, {
        duration: duration,
        zoom: targetZoom, // TODO: zoom does not seem to do anything
        ease: Expo.easeInOut,
    });

};

const animateLookAt = (lookAt, duration = 2, easing = Expo.easeInOut) => {
    // Animate lookAt point
    gsap.to(controls.target, {
        duration: duration,
        x: lookAt.x,
        y: lookAt.y,
        z: lookAt.z,
        ease: easing,
        onUpdate: () => {
            SceneUtils.setAnimating(true);
        },
        onComplete: () => {
            SceneUtils.setAnimating(false);
        }
    });
};

const animateFov = (fov, duration = 2, easing = Expo.easeInOut) => {
    // Animate camera fov
    gsap.to(camera, {
        duration: duration,
        fov: fov,
        ease: easing,
        /*onUpdate: () => {
            camera.updateProjectionMatrix();
        }*/
    });
};

let animateOpacity = (objects, targetOpacity) => {
    /*gsap.to(object, {
        duration: duration,
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

// From https://github.com/dirkk0/threejs_daynight
const updateSunLight = () => {
    const dayLightColor   = new Color(0xbfe3dd);
    const twilightColor   = new Color(0x571a00);
    const nightLightColor = new Color(0x000112);
    const time = new Date().getHours();
    // const time = new Date().getTime() * 0.002 - 300000000;

    const timeToRadians = time * (Math.PI / 12) - Math.PI * 3 / 4;
    const nSin = Math.sin(timeToRadians);
    const nCos = Math.cos(timeToRadians);

    directionalLight.position.set(15 * nSin, 20 * nSin, 20 * nCos);

    if (nSin >= 0.3 ) { // Day
        const f = 0.65; // 0.65

        directionalLight.intensity = f;
        ambientLight.intensity = f * 0.5;

        scene.background.lerp(dayLightColor, 0.05);
    } else if (nSin < 0.3 && nSin > 0) { // Twilight
        const f = nSin / 0.5;

        directionalLight.intensity = f;
        ambientLight.intensity = f * 0.5;

        scene.background.lerp(twilightColor, 0.05);
    } else { // Night
        const f = 0;

        directionalLight.intensity = f;
        ambientLight.intensity = f * 0.2;

        scene.background.lerp(nightLightColor, 0.1);
    }
};

const selectObject = object => {
    // Abstract the level of selected object from its material name and use it to select the level
    // Check if an integer was indeed received
    const level          = object.material.name.charAt(0);
    const objectSize     = object.geometry.boundingSphere.radius;
    const objectPosition = object.position;
    // Zoom based on boundingSphere of geometry
    const zoom           = 1; // Math.sin(objectSize);
    // let zoom = 1 / (Math.round(objectSize) * 0.75);
    // const fov = sigmoid(objectSize) * 10 + 15;

    SceneUtils.setSelectedObject(object);

    animateCamera({
        x: -(objectPosition.x + objectSize + 4),
        y: objectPosition.y + objectSize + 4,
        z: objectPosition.z + objectSize + 6,
    }, zoom);

    animateLookAt(objectPosition);

    if (level) {
        selectFloor(level);

        const objectNameArray = object.userData.name.split(' ');
        const category        = objectNameArray[1];
        const id              = objectNameArray[2];

        // object.add(labelPivot);
        setLabel(label, objectPosition, objectSize, category, id);

        document.getElementById('radio-' + level).checked = true;
    }
};

const getObject = name => { // TODO: create name dynamically (e.g. 'name = Kitchen_Block' => 'S_Kitchen_1_-_Kitchen_Block')
    const object = meshGroup.getObjectByName(name);
    // const object = meshGroup.getObjectById(id);
    console.log(object);
    selectObject(object);  // TODO: drawer should stay open in this case
};

const createLabel = () => {
    // HTML
    const element = document.createElement('div');

    element.className = 'label-card';
    element.style.opacity = isDev ? '50%' : '0';
    element.style.pointerEvents = 'none';
    // element.style.width = '375px';
    element.innerHTML = `
        <div class='mdc-card'>
            <div class='mdc-card__primary-action' tabindex='0'>
                <div id='label-image' class='mdc-card__media mdc-card__media--square'></div>
                <div class='mdc-card__primary'>
                    <h2 id='label-title' class='mdc-card__title mdc-typography mdc-typography--headline6'></h2>
                    <h3 id='label-subtitle' class='mdc-card__subtitle mdc-typography mdc-typography--subtitle2'></h3>
                    <div class='mdc-card__secondary mdc-typography mdc-typography--body2'>Click here for more info</div>
                </div>
            </div>
        </div>
    `;
    // <div id='label-image' class='mdc-card__media mdc-card__media--square' style='background-image: url(${ require('../assets/img/placeholder.jpg') });'></div>
    document.body.appendChild(element);

    // CSS Object
    const object = new CSS3DObject(element);
    object.position.set(0, 0, 0);
    object.userData = { set: false };
    labelScene.add(object);

    return {
        element: element,
        object: object
    };
};

// TODO: check https://discourse.threejs.org/t/scale-css3drenderer-respect-to-webglrenderer/4938/6
// TODO: create line as indicator from label to object
const setLabel = (label, position, radius, category, id) => {
    // Get selected item info based on the id
    const objectInfo = items.cardContents[category].find(object => object.id === parseInt(id));

    // closeDrawer();

    document.querySelector('.label-card').dataset.item = `${ category }-${ id }`;
    document.getElementById('label-title').textContent = objectInfo.title;
    document.getElementById('label-subtitle').textContent = `From ${ objectInfo.subtitle }`;
    document.getElementById('label-image').style.backgroundImage = `url(${ objectInfo.image })`;

    document.querySelector('.label-card').addEventListener('click', clickLabel);

    // Calculate the width of the label after inserting text
    // const labelHeight = label.element.offsetHeight;
    // const labelWidth = label.element.offsetWidth / 2;

    // Add the CSS3DObject as child to the (invisible) Object3D
    labelScene.add(labelPivot);
    labelPivot.add(label.object);
    labelPivot.position.set(scale * position.x, scale * position.y, scale * position.z);

    label.element.style.opacity = '0.8';
    label.element.style.pointerEvents = 'auto';

    // TODO: flip label to other side because of the sidebar or put on top of object?
    // label.object.position.y = Math.round(scale * radius + labelHeight);
    // label.object.position.x = Math.round(scale * radius + labelWidth);
    label.object.userData = { set: true };
};

const removeLabel = label => {
    // label.element.innerHTML = '';
    label.element.style.opacity = '0';
    label.element.style.pointerEvents = 'none';

    // closeDrawer();

    document.querySelector('.label-card').removeEventListener('click', clickLabel);

    labelScene.add(label.object);
    label.object.position.set(0, 0, 0);
    label.object.userData = { set: false };
};

const clickLabel = event => {
    if (!SceneUtils.getAnimating()) {
        toggleDrawer();
        Categories.scrollToItem(event.currentTarget.dataset.item);
        // scrollToItem(`${ category }-${ id }`);
    }
};

// TODO: reset translation if another object is selected
const panView = direction => {
    if (direction === 1) {
        // TODO: distance at 'x' should be determined by width of the sidebar
        camera.setViewOffset(screenWidth, screenHeight, 300 * direction, 0, screenWidth, screenHeight);

        // labelPivot.quaternion.set(0, 0, 0, 0);

        controls.enablePan  = isDev;
        controls.enableZoom = isDev;
    } else {
        camera.clearViewOffset();

        /*label.object.position.set(0, 0, 0, 0);
        label.object.quaternion.set(0, 0, 0, 0);*/

        controls.enablePan  = true;
        controls.enableZoom = true;
    }
};

const resetCamera = (pos = { x: -30, y: 40, z: 60 }) => {
    // TODO: while resetting the view, the drawer should temporarily not be allowed to open

    // Reset camera
    animateCamera(pos, 1, 2, Expo.easeOut);
    animateLookAt({ x: 0, y: 1, z: 0 }, 2, Expo.easeOut);
    animateFov(20);
};

const resetSelected = () => {
    /*if (INTERSECTED) {
        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
    }*/
    SceneUtils.setIntersected(null);

    controls.enablePan = true;

    removeLabel(label);
};

const openDrawer = () => {
    panView(1);
    Categories.setDrawer(true);

};

const closeDrawer = () => {
    panView(-1);
    Categories.setDrawer(false);
};

const toggleDrawer = () => {
    Categories.getDrawer() ? closeDrawer(): openDrawer();
    // Categories.setDrawer(!Categories.getDrawer());
};

const showPerformanceMonitor = bool => {
    stats.dom.style.display = bool ? 'block' : 'none';
    SceneUtils.setPerformanceMonitor(bool);
};

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const scale = 200;
// const panViewDistance = 1.25;

export default {
    init,
    selectFloor,
    animateCamera,
    animateLookAt,
    animateFov,
    getObject,
    resetCamera,
    resetSelected,
    toggleDrawer,
    showPerformanceMonitor,
    showSAO,
    isDev,
};

