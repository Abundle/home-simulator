import {
    Scene,
    Clock,
    Vector2,
    Group,
    Object3D,
    Color,
    Mesh,
    WebGLRenderer,
    PerspectiveCamera,
    AmbientLight, DirectionalLight, HemisphereLight,
    DirectionalLightHelper, HemisphereLightHelper, AxesHelper,
    Matrix4,
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
// TODO: disable sao by default when performance drops & on lower-tier devices
// TODO: think about mobile version (layout, disable postprocessing etc.)
// TODO: for improving light through window check:
//  Alphatest customDepthMaterial https://threejs.org/examples/webgl_animation_cloth.html
//  DepthWrite https://stackoverflow.com/questions/15994944/transparent-objects-in-threejs/15995475#15995475 + Check https://threejs.org/examples/webgl_camera_logarithmicdepthbuffer.html
// TODO: check Firefox reclicking label + refreshing page does not reset the level radio buttons
// TODO: check Three.js documentation for changes
// TODO: fix  3D model errors, check https://stackoverflow.com/questions/52441072/gltf2-accessor-unit-length

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

/* Other Three.js variables */
const clock      = new Clock();
const raycaster  = new Raycaster();
const meshGroup  = new Group();
const labelPivot = new Object3D();
const stats      = new Stats();

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
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const aspect = screenWidth / screenHeight;
    // const canvasElement = document.getElementById('canvas');
    const container = document.getElementById('container');
    const progress = document.getElementById('progress');

    window.addEventListener('resize', resizeCanvas, false); // TODO: check options
    document.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    scene = new Scene();
    scene.background = new Color(0xbfe3dd);
    // scene.fog = new THREE.Fog(scene.background, 1, 5000);

    labelScene = new Scene();
    labelScene.scale.set(0.005, 0.005, 0.005);
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
    // Making the Euler angles make more sense (from https://stackoverflow.com/questions/28569026/three-js-extract-rotation-in-radians-from-camera)
    camera.rotation.order = 'YXZ';

    // TODO: temporarly disable controls when camera is moving
    controls = new OrbitControls(camera, labelRenderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.enablePan     = isDev;
    controls.maxPolarAngle = isDev ? Math.PI : Math.PI /2;
    controls.minDistance   = isDev ? 0 : 25;
    controls.maxDistance   = isDev ? Infinity : 125;

    scene.add(new AmbientLight(0x666666));

    const directionalLight = new DirectionalLight(0xFFFFFF);
    scene.add(directionalLight);

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

    updateSunLight(directionalLight, 20);

    /*pointLight = new THREE.PointLight(0xf15b27, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);*/

    const hemisphereLight = new HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemisphereLight.color.setHSL(0.6, 1, 0.6);
    hemisphereLight.groundColor.setHSL(0.095, 1, 0.75);
    hemisphereLight.position.set(0, 50, 0);
    // scene.add(hemisphereLight);

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
    composer.setSize(window.innerWidth, window.innerHeight);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    outlinePass = new OutlinePass(new Vector2(window.innerWidth, window.innerHeight), scene, camera);
    outlinePass.params = SceneUtils.outlinePassParameters;
    outlinePass.visibleEdgeColor.set('#ffffff');
    outlinePass.hiddenEdgeColor.set('#190a05');
    composer.addPass(outlinePass);

    const saoPass = new SAOPass(scene, camera, false, true);
    saoPass.params = SceneUtils.SAOparameters;
    composer.addPass(saoPass);

    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution' ].value.set(1 / window.innerWidth, 1 / window.innerHeight);
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

    const delta = clock.getDelta();
    controls.update(delta);

    if (label.object.userData.set) {
        labelPivot.quaternion.slerp(camera.quaternion, 0.08); // t is value between 0 and 1
        // labelPivot.rotation.y = camera.rotation.y;
    }

    if (SceneUtils.getPerformanceMonitor()) {
        stats.begin();
    }

    // camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    if (isDev) {
        dirLightHelper.update();
    }

    composer.render();
    labelRenderer.render(labelScene, camera);

    if (SceneUtils.getPerformanceMonitor()) {
        stats.end();
    }
};

const resizeCanvas = () => { // Check https://threejs.org/docs/index.html#manual/en/introduction/FAQ for resize formula
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Perspective camera
    camera.aspect = screenWidth / screenHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(screenWidth, screenHeight);
    composer.setSize(screenWidth, screenHeight);
    labelRenderer.setSize(screenWidth, screenHeight);
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
            camera.updateProjectionMatrix();
        }*/
    });
    gsap.to(camera, {
        duration: duration,
        zoom: targetZoom,
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

const updateSunLight = (light, radius) => {
    const time = new Date().getHours();
    // const time = new Date().getSeconds();
    const timeToRadians = time * (Math.PI / 24);
    // const timeToRadians = time * (Math.PI / 30);
    const sinTime = radius * Math.sin(timeToRadians);
    const cosTime = radius * Math.cos(timeToRadians);

    light.position.set(cosTime, sinTime, sinTime);

    if (sinTime > 0.2) { // Day
        light.intensity = 0.65;
    } else if (sinTime < 0.2 && sinTime > 0) { // Twilight
        light.intensity = sinTime / 0.2;
    } else { // Night
        light.intensity = 0;
    }
};

const selectObject = object => {
    // Abstract the level of selected object from its material name and use it to select the level
    // Check if an integer was indeed received
    const level          = object.material.name.charAt(0);
    const objectSize     = object.geometry.boundingSphere.radius;
    const objectPosition = object.position;
    // Zoom based on boundingSphere of geometry
    const zoom           = Math.sin(objectSize);
    // let zoom = 1 / (Math.round(objectSize) * 0.75);
    // const fov = sigmoid(objectSize) * 10 + 15;

    /*const box = new THREE.BoxHelper( object, 0xffff00 );
    scene.add(box);*/

    // setSelectedObject(object);

    animateCamera({
        x: -(objectPosition.x + objectSize / 2 + 1),
        y: objectPosition.y + objectSize / 2 + 6, // 4
        z: objectPosition.z + objectSize / 2 + 3,
    }, zoom);

    animateLookAt(objectPosition);

    if (level) {
        selectFloor(level);

        const objectNameArray = object.userData.name.split(' ');
        const category        = objectNameArray[1];
        const id              = objectNameArray[2];

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
    element.style.opacity = '0';
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
    labelScene.add(object);

    return {
        element: element,
        object: object
    };
};

// TODO: check https://discourse.threejs.org/t/scale-css3drenderer-respect-to-webglrenderer/4938/6
// TODO: create line as indicator from label to object
// TODO: scroll to selected category (instead of card) in the category buttons when drawer opens?
const setLabel = (label, position, radius, category, id) => {
    const scale = 200;
    // Get selected item info based on the id
    const objectInfo = items.cardContents[category].find(object => object.id === parseInt(id));

    closeDrawer();

    document.querySelector('.label-card').dataset.item = `${ category }-${ id }`;
    document.getElementById('label-title').textContent = objectInfo.title;
    document.getElementById('label-subtitle').textContent = objectInfo.subtitle;
    document.getElementById('label-image').style.backgroundImage = `url(${ objectInfo.image })`;

    document.querySelector('.label-card').addEventListener('click', clickLabel);

    // Calculate the width of the label after inserting text
    const labelWidth = label.element.offsetWidth / 2;

    // Add the CSS3DObject as child to the (invisible) Object3D
    labelScene.add(labelPivot);
    labelPivot.add(label.object);
    labelPivot.position.set(scale * position.x, scale * position.y, scale * position.z);

    label.element.style.opacity = '0.8';
    label.element.style.pointerEvents = 'auto';
    label.object.position.x = scale * radius + labelWidth; // TODO: flip label to other side because of the sidebar?

    label.object.userData = { set: true };
};

const removeLabel = label => {
    // label.element.innerHTML = '';
    label.element.style.opacity = '0';
    label.element.style.pointerEvents = 'none';

    closeDrawer();

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

// TODO: reset translation if another object is selected + add animation
const panView = distance => {
    const duration = 0.5;
    const easing = Expo.easeInOut;

    const object = new Object3D().copy(camera);
    object.position.setX(distance);
    // const cameraTargetPosition = new THREE.Vector3().copy(camera.position).setX(distance);
    const cameraMatrix = new Matrix4().copy(object.matrix);

    // Copy the camera's first column (which is x) of its local transformation matrix to empty vector
    const translationVector = new Vector3().setFromMatrixColumn(cameraMatrix , 0);
    // Multiply the vector with the translation distance
    translationVector.multiplyScalar(distance);

    const testX = Math.round( translationVector.x * 1e4 ) / 1e4;
    const testZ = Math.round( translationVector.z * 1e4 ) / 1e4;

    /*TweenMax.to(camera.position, duration, {
        x: camera.position.x + distance,
        easing: easing,
        onUpdate: () => {
            camera.updateProjectionMatrix();
        }
    });
    // Change X and Z values (i.e. the horizontal plane) only
    TweenMax.to(controls.target, duration, {
        x: controls.target.x + testX,
        z: controls.target.z + testZ,
        easing: easing,
    });*/

    /*cameraTargetPosition.setX(distance);
    // Interpolate camPos toward targetPos
    cameraPosition.lerp(cameraTargetPosition, 0.05);
    // Apply new camPos to your camera
    camera.position.copy(cameraPosition);
    // camera.position.lerp(cameraTargetPosition, 0.8)*/

    /*// Translation vector code from Three.js OrbitControls:
    // https://github.com/mrdoob/three.js/blob/master/examples/js/controls/OrbitControls.js#L334
    const translationVector = new THREE.Vector3();*/

    camera.translateX(distance);
    /*// Copy the camera's first column (which is x) of its local transformation matrix to empty vector
    translationVectorNoAnimation.setFromMatrixColumn(camera.matrix , 0);
    // Multiply the vector with the translation distance
    translationVector.multiplyScalar(distance);*/
    // Add the translation vector to the controls.target point, i.e. the camera's lookAt
    controls.target.x += testX;
    controls.target.z += testZ;
    // controls.target.add(translationVectorNoAnimation);

    // console.log(testX, testZ);
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

    removeLabel(label);
};

const closeDrawer = () => {
    if (Categories.getDrawer()) {
        panView(-6);
        Categories.setDrawer(false);
    }
};

const toggleDrawer = () => {
    const distance = Categories.getDrawer() ? -6: 6; // TODO: reimplement value based on viewport width
    panView(distance);
    Categories.setDrawer(!Categories.getDrawer());
};

const showPerformanceMonitor = bool => {
    stats.dom.style.display = bool ? 'block' : 'none';
    SceneUtils.setPerformanceMonitor(bool);
};

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
};

