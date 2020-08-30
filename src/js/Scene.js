import {
    Scene,
    Vector2,
    Group,
    Object3D,
    Color,
    Mesh,
    WebGLRenderer,
    MOUSE,
    PerspectiveCamera,
    AmbientLight, DirectionalLight, HemisphereLight, PointLight,
    CameraHelper, AxesHelper, HemisphereLightHelper, PointLightHelper,
    Vector3,
    Raycaster,
    sRGBEncoding,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
/* Postprocessing */
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
/* Shaders */
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader';

import { WEBGL } from 'three/examples/jsm/WebGL.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { gsap, Expo } from 'gsap/all';

// Local import
import Categories from './Categories';
import SceneUtils from './utils/SceneUtils';
import modelName from '../assets/House.glb';
import items from './utils/items.js';

// TODO: test on large screens
// TODO: for improving light through window check:
//  Alphatest customDepthMaterial https://threejs.org/examples/webgl_animation_cloth.html
//  DepthWrite https://stackoverflow.com/questions/15994944/transparent-objects-in-threejs/15995475#15995475 + Check https://threejs.org/examples/webgl_camera_logarithmicdepthbuffer.html

// Inspiration:
// House design style https://www.linkedin.com/feed/update/urn:li:activity:6533419696492945408
// LittlestTokyo https://threejs.org/examples/#webgl_animation_keyframes
// French website https://voyage-electrique.rte-france.com/
// Behance https://www.behance.net/gallery/54361197/City
// Codepen portfolio https://codepen.io/Yakudoo/
// Blog: https://jolicode.com/blog/making-3d-for-the-web
// WebGL 2 and WebGPU: https://discourse.threejs.org/t/whats-going-on-with-webgl2-webgpu/13115/56
// Three.js fundamentals https://threejsfundamentals.org/
// Smart autocompletion: https://tabnine.com/
// How to clean up the scene https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects
// Library for calculating position of the sun https://github.com/mourner/suncalc

/* For debugging */
const WEBPACK_MODE = process.env.NODE_ENV;
const isDev = WEBPACK_MODE === 'development';

/* Three.js variables */
const container     = document.getElementById('container');
const renderer      = new WebGLRenderer(); // { canvas: canvasElement }
const scene         = new Scene();
const labelScene    = new Scene();
const labelRenderer = new CSS3DRenderer();
const raycaster     = new Raycaster();
const labelPivot    = new Object3D();
const meshGroup     = new Group();
const stats         = new Stats();

const screenWidth   = window.innerWidth;
const screenHeight  = window.innerHeight;
const aspect        = screenWidth / screenHeight;
const camera        = new PerspectiveCamera(
    5,
    aspect,
    1,
    1000
);
const controls      = new OrbitControls(camera, labelRenderer.domElement);
const composer      = new EffectComposer(renderer);
const outlinePass   = new OutlinePass(new Vector2(screenWidth, screenHeight), scene, camera);
const effectFXAA    = new ShaderPass(FXAAShader);
const label         = SceneUtils.createLabel();

const panViewDistance    = 200; // TODO: distance should be determined relatively to width of sidebar
const labelScale         = 200;
const labelToCameraRatio = 75;
const nrOfLevels         = 4;

/* Lights & colors */
const dayLightColor           = new Color(0xbfe3dd);
const dayLightColorAmbient    = new Color(0x666666);
const dayLightColorHemiSky    = new Color(0x3284ff);
const dayLightColorHemiGround = new Color(0xffc87f);
const twilightColor           = new Color(0x571000);
const twilightColorHemiSky    = new Color(0xb82b00);
const twilightColorHemiGround = new Color(0xb82b00);
const nightLightColor         = new Color(0x000112);
const nightLightColorAmbient  = new Color(0xdefff9);
const nightLightColorHemiSky  = new Color(0x0d103d);

const directionalLight = new DirectionalLight(0xFFFFFF);
const ambientLight     = new AmbientLight(0xFFFFFF);
const hemisphereLight  = new HemisphereLight(0xFFFFFF, 0xFFFFFF, 0.3);
const pointLights      = {
    'hallway': { object: new PointLight(0xfff1e0, 1, 5), position: new Vector3(-6, 5, 0) },
    'kitchen': { object: new PointLight(0xffffff, 1, 5), position: new Vector3(-3, 5, -0.75) },
    'kitchen_table': { object: new PointLight(0xffd6aa, 1, 10), position: new Vector3(0, 5, -0.75) },
    'living_room': { object: new PointLight(0xfff1e0, 1, 5), position: new Vector3(3, 5, -0.75) },
};

const init = () => {
    const progress = document.getElementById('progress');

    window.addEventListener('resize', resizeCanvas);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    // scene.scale.set(scale, scale, scale);
    scene.background = new Color();
    // scene.fog = new THREE.Fog(scene.background, 1, 5000);

    /*var geometry = new THREE.PlaneBufferGeometry( 5, 20, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    var plane = new THREE.Mesh( geometry, material );
    scene.add( plane );*/

    labelScene.add(label.object);
    labelScene.scale.setScalar(1 / labelScale); // Scale down label size scene

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(screenWidth, screenHeight);
    renderer.outputEncoding = sRGBEncoding; // See https://threejs.org/docs/#examples/en/loaders/GLTFLoader
    renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    labelRenderer.setSize(screenWidth, screenHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    container.appendChild(labelRenderer.domElement);

    camera.aspect = aspect;
    /* Making the Euler angles make more sense
    (from https://stackoverflow.com/questions/28569026/three-js-extract-rotation-in-radians-from-camera)
    rotation.y will be the camera yaw in radians
    rotation.x will be the camera pitch in radians
    rotation.z will be the camera roll in radians
     */
    camera.rotation.order = 'YXZ';

    controls.mouseButtons = { // This way orbiting does not interfere with selecting objects
        LEFT: MOUSE.PAN,
        MIDDLE: MOUSE.ROTATE, // TODO: fix touchpad gestures (that do not have a dedicated middle mouse button)
        RIGHT: MOUSE.DOLLY
    };
    controls.enableDamping = true; // if enabled, you must call .update () in your animation loop
    controls.dampingFactor = 0.25;
    controls.maxPolarAngle = isDev ? Math.PI : Math.PI /2;
    controls.minDistance   = isDev ? 0 : 10;
    controls.maxDistance   = isDev ? Infinity : 500;

    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width  = 2048;
    directionalLight.shadow.mapSize.height = 2048;

    const d = 10;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;

    scene.add(directionalLight);
    scene.add(ambientLight);

    // Create a PointLight and turn on shadows for the light
    for (const pointLight of Object.values(pointLights)) {
        pointLight.object.castShadow = true;
        pointLight.object.position.copy(pointLight.position);
        scene.add(pointLight.object);
    }

    hemisphereLight.position.set(0, 35, 0);
    scene.add(hemisphereLight);

    const loader = new GLTFLoader();
    // Provide a DRACOLoader instance to decode compressed mesh data
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(isDev ?
        './node_modules/three/examples/js/libs/draco/gltf/' : './assets/draco/'
    );
    loader.setDRACOLoader(dracoLoader);

    loader.load(modelName, gltf => {
        SceneUtils.removeLoadingScreen();

        const model = gltf.scene;

        model.traverse(node => {
            if (node instanceof Mesh) {
                node.receiveShadow = true;
                node.castShadow = true;
                node.material.transparent = true;

                const layer = parseInt(node.material.name.charAt(0));
                node.layers.set(layer);

                // Creating a bounding box with Box3 for tracking size of objects and camera zoom
                // node.geometry.computeBoundingBox();
                // let boundingBox = node.geometry.boundingBox.clone();
            }
        });
        meshGroup.add(model); // Will create a group in a group, but it seems to work as well
        scene.add(meshGroup);

        if (WEBGL.isWebGLAvailable()) { // TODO: check detector.js in other project
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

    /* Set lights */
    updateSunLight();

    /* Postprocessing */
    initPostprocessing();

    /* Performance monitor */
    stats.dom.style.display = 'none';
    container.appendChild(stats.dom);

    /* Init helpers */
    if (isDev) {
        const dirLightCamHelper = new CameraHelper(directionalLight.shadow.camera);
        scene.add(dirLightCamHelper);

        const hemiSphereHelper = new HemisphereLightHelper(hemisphereLight, 2);
        scene.add(hemiSphereHelper);

        const axesHelper = new AxesHelper(3);
        scene.add(axesHelper);

        for (const pointLight of Object.values(pointLights)) {
            const pointLightHelper = new PointLightHelper(pointLight.object, 0.5);
            scene.add(pointLightHelper);
        }
    }
};

const initPostprocessing = () => {
    composer.setSize(screenWidth, screenHeight);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    outlinePass.params = SceneUtils.outlinePassParameters;
    outlinePass.visibleEdgeColor.set('#ffffff');
    outlinePass.hiddenEdgeColor.set('#190a05');
    composer.addPass(outlinePass);

    const saoPass = new SAOPass(scene, camera, false, true);
    saoPass.params = SceneUtils.saoParameters;
    SceneUtils.setSaoPass(saoPass);
    composer.addPass(saoPass);

    effectFXAA.uniforms['resolution'].value.set(1 / screenWidth, 1 / screenHeight);
    composer.addPass(effectFXAA);

    const gammaCorrection = new ShaderPass(GammaCorrectionShader);
    composer.addPass(gammaCorrection);

    const bokehPass = new BokehPass(scene, camera, SceneUtils.bokehParameters);
    SceneUtils.setBokehPass(bokehPass);
    composer.addPass(bokehPass);

    isDev && SceneUtils.initGUI(saoPass, bokehPass);
};

// Three.js functions setup based on https://github.com/dirkk0/threejs_daynight/blob/master/index.html
const start = () => {
    animate();
    resetCamera();
};

const animate = () => {
    requestAnimationFrame(animate);

    // TODO: update sun light every hour instead of continuously, see
    //  https://stackoverflow.com/questions/42518873/best-way-to-call-periodically-twice-a-day-an-api-from-node-js-to-get-data
    // updateSunLight();

    if (label.object.userData.set) {
        label.object.quaternion.set(0, 0, 0, 0);

        labelPivot.quaternion.slerp(camera.quaternion, 0.08); // t is value between 0 and 1
        // labelPivot.rotation.y = camera.rotation.y;

        // Scale and position label when zooming in or out
        const labelToCameraScale = objectPosition.distanceTo(camera.position) / labelToCameraRatio;
        label.object.scale.setScalar(labelToCameraScale);
        label.object.position.y = labelToCameraScale * 100 + 150;
    }

    // Required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();
    controls.enabled = !SceneUtils.getAnimating(); // temporarily disable controls when camera is animating

    SceneUtils.getPerformanceMonitor() && stats.begin();

    composer.render();
    labelRenderer.render(labelScene, camera);

    SceneUtils.getPerformanceMonitor() && stats.end();
};

const resizeCanvas = () => {
    // From https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_outline.html
    camera.aspect = screenWidth / screenHeight;

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
    labelRenderer.setSize(width, height);

    effectFXAA.uniforms['resolution'].value.set(1/width, 1/height);
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
        const hoveredObject = intersects[0].object;
        SceneUtils.setSelectable(hoveredObject.name.indexOf('S_') !== -1);

        if (SceneUtils.getSelectable()) {
            hoverObject(hoveredObject);
            outlinePass.selectedObjects = [hoveredObject];
            document.body.style.cursor = 'pointer';
        } else {
            outlinePass.selectedObjects = [];
            document.body.style.cursor = 'default';
        }
    }
};

const onClick = event => {
    const intersects = getIntersects(event, raycaster);

    if (SceneUtils.getFocus()) {
        resetCamera();
        resetSelected();
    } else {
        if (intersects.length > 0) {
            // If an object can be selected, the name of the mesh will begin with an 'S_', so selectable will be true
            SceneUtils.setSelectable(intersects[0].object.name.indexOf('S_') !== -1);

            if (SceneUtils.getIntersected() !== intersects[0].object && SceneUtils.getSelectable()) {
                /*if (INTERSECTED) {
                    INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
                }*/
                SceneUtils.setIntersected(intersects[0].object);
                // INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                // INTERSECTED.material.color.setHex(0xff0000);

                // console.log(INTERSECTED);
                selectObject(SceneUtils.getIntersected());
                removeLabel(label);
                document.body.style.cursor = 'default';
            } else { // Non-selectable object was clicked
                resetSelected();
            }
        } else { // Background was clicked
            resetSelected();
        }
    }
};

const changeLightColors = (transitionAlpha, colors) => {
    scene.background.lerp(colors[0], Math.min(1, transitionAlpha));
    ambientLight.color.lerp(colors[1], Math.min(1, transitionAlpha));
    hemisphereLight.color.lerp(colors[2], Math.min(1, transitionAlpha));
    hemisphereLight.groundColor.lerp(colors[3], Math.min(1, transitionAlpha));
};

// TODO: add moonlight as well?
let time = 12;
let dayAlpha = 1;
let twilightAlpha = 1;
let nightAlpha = 1;
const dt = 0.01;
const updateSunLight = () => {
    /*Roughly simulate day- and nightlight
    Inspired by https://github.com/dirkk0/threejs_daynight*/
    if (isDev) {
        time += dt;
        if (time > 24) {
            time = 0;
        }
    } else {
        time = new Date().getHours();
    }

    // Initial time (00:00) is a quarter turn counterclockwise
    const timeToRadians = -Math.PI / 2 + time * (2 * Math.PI / 24);
    const radius = 50; // Distance between sun and model
    const nSin = radius * Math.sin(timeToRadians);
    const nCos = radius * Math.cos(timeToRadians);

    const f = Math.max(0, nSin / 50); // Intensity from 0 to 1

    directionalLight.position.set(nCos, nSin, nSin);
    directionalLight.intensity = f;
    ambientLight.intensity = f;

    if (nSin >= 15) { // Day
        twilightAlpha = 0;
        nightAlpha = 0;
        dayAlpha += dt * 0.1; // Color transition speed

        changeLightColors(
            dayAlpha,
            [dayLightColor, dayLightColorAmbient, dayLightColorHemiSky, dayLightColorHemiGround]);

        SceneUtils.setNightThemeUI(false);
        setPointLights(false);
    } else if (nSin < 15 && nSin > 0) { // Twilight
        dayAlpha = 0;
        twilightAlpha += dt * 0.1;

        changeLightColors(
            twilightAlpha,
            [twilightColor, twilightColor, twilightColorHemiSky, twilightColorHemiGround]);

        SceneUtils.setNightThemeUI(false);
        setPointLights(true);
    } else { // Night
        twilightAlpha = 0;
        nightAlpha += dt * 0.1;

        changeLightColors(
            nightAlpha,
            [nightLightColor, nightLightColorAmbient, nightLightColorHemiSky, nightLightColor]);

        // TODO: AO does not look very nice in this scenario, so tweak values (at night)
        SceneUtils.setNightThemeUI(true);
        setPointLights(true);
    }
};

const setPointLights = bool => {
    Object.values(pointLights).forEach(light => {
        light.object.intensity = bool ? 1 : 0;
    });
};

const selectFloor = floor => {
    const setVisibility = (level, visibility) => {
        if (visibility) {
            camera.layers.enable(level);
            raycaster.layers.enable(level);
        } else {
            camera.layers.disable(level);
            raycaster.layers.disable(level);
        }
    };

    for (let i = 1; i <= floor; i++) { setVisibility(i, true); }
    for (let i = nrOfLevels; i > floor; i--) { setVisibility(i, false); }
};

const animateCamera = (targetPosition,
    targetZoom = 1,
    duration = 1.5,
    easing= Expo.easeInOut,
    _openDrawer = false) => {
    gsap.to(camera.position, {
        duration: duration,
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        ease: easing,
        onStart: () => {
            SceneUtils.setAnimating(true);

            container.removeEventListener('mousemove', onMouseMove);
            container.removeEventListener('click', onClick);
        },
        onComplete: () => {
            SceneUtils.setAnimating(false);

            container.addEventListener('mousemove', onMouseMove);
            container.addEventListener('click', onClick);

            if (_openDrawer) {
                openDrawer();
            }
        }
    });
    gsap.to(camera, {
        duration: duration,
        zoom: targetZoom,
        ease: Expo.easeInOut,
        onUpdate: () => {
            camera.updateProjectionMatrix();
        },
    });
};

const animateLookAt = (lookAt, duration = 1.5, easing = Expo.easeInOut) => {
    // Animate lookAt point
    gsap.to(controls.target, {
        duration: duration,
        x: lookAt.x,
        y: lookAt.y,
        z: lookAt.z,
        ease: easing,
        onStart: () => {
            SceneUtils.setAnimating(true);
        },
        onComplete: () => {
            SceneUtils.setAnimating(false);
        }
    });
};

const hoverObject = object => {
    const objectNameArray = object.userData.name.split(' ');
    const category        = objectNameArray[1];
    const id              = objectNameArray[2];

    setLabel(label, object.position, object.geometry.boundingSphere.radius, category, id);
};

const selectObject = object => {
    const objectNameArray = object.userData.name.split(' ');
    const category        = objectNameArray[1];
    const id              = objectNameArray[2];
    // Abstract the level of selected object from its material name and use it to select the level
    const level          = object.material.name.charAt(0);
    const objectSize     = object.geometry.boundingSphere.radius;
    const objectPosition = object.position;
    // Zoom based on boundingSphere of geometry
    const zoom = 1; // Math.sin(objectSize);

    SceneUtils.setSelectedObject(object);

    animateCamera({
        x: objectPosition.x + objectSize + 15,
        y: objectPosition.y + objectSize + 15,
        z: objectPosition.z + objectSize + 15,
    }, zoom, undefined, undefined, true);

    animateLookAt(objectPosition);

    setTimeout(() => { // TODO: check if this can be done differently
        Categories.scrollToItem(`${ category }-${ id }`);
    }, 2000);

    if (level) {
        selectFloor(level);
        document.getElementById('radio-' + level).checked = true;
    }
};

const getObject = name => { // TODO: create name dynamically (e.g. 'name = Kitchen_Block' => 'S_Kitchen_1_-_Kitchen_Block')
    // const object = meshGroup.getObjectByName(name);
    // const object = meshGroup.getObjectById(id);
    return meshGroup.getObjectByName(name);
};

const objectPosition = new Vector3();
// TODO: create line as indicator from label to object
const setLabel = (label, position, radius, category, id) => {
    // Get selected item info based on the id
    const objectInfo = items.cardContents[category].find(object => object.id === parseInt(id));

    if (document.querySelector('.label-card')) {
        // document.querySelector('.label-card').dataset.item = `${ category }-${ id }`;
        document.getElementById('label-title').textContent = objectInfo.title;
        document.getElementById('label-subtitle').textContent = `From ${ objectInfo.subtitle }`;
        document.getElementById('label-image').style.backgroundImage = `url(${ objectInfo.image })`;
    }

    // Calculate the width of the label after inserting text
    // const labelHeight = label.element.offsetHeight;
    // const labelWidth = label.element.offsetWidth / 2;

    // For calculating the distance between camera and selected object when scaling the label on camera zoom
    objectPosition.copy(labelPivot.position);
    objectPosition.divideScalar(labelScale);

    // Add the CSS3DObject as child to the (invisible) Object3D
    labelScene.add(labelPivot);
    labelPivot.add(label.object);

    // Correct for scaling down label
    labelPivot.position.set(labelScale * position.x, labelScale * position.y, labelScale * position.z);

    label.element.style.opacity = '90%';
    label.object.userData = { set: true };
};

const removeLabel = label => {
    // label.element.innerHTML = '';
    label.element.style.opacity = isDev ? '10%' : '0';
    label.element.style.pointerEvents = 'none';

    labelScene.add(label.object);
    label.object.position.set(0, 0, 0);
    label.object.userData = { set: false };
};

const panView = bool => {
    bool ? camera.setViewOffset(screenWidth, screenHeight, panViewDistance, 0, screenWidth, screenHeight)
        : camera.clearViewOffset();
};

const resetCamera = () => {
    const pos = { x: -100, y: 150, z: 250 };

    // Reset camera
    animateCamera(pos, 1, undefined, Expo.easeOut);
    animateLookAt({ x: 0, y: 0, z: 0 });
};

const resetSelected = () => {
    /*if (INTERSECTED) {
        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
    }*/
    SceneUtils.setIntersected(null);

    closeDrawer();
    removeLabel(label);
    SceneUtils.setSelectedObject(undefined);
};

const openDrawer = () => {
    panView(true);
    Categories.setDrawerState(true);
    SceneUtils.setFocus(Categories.getDrawerState() && SceneUtils.getSelectedObject() !== undefined);

    // When drawer is opened, disable label hovering & outline and some of the OrbitControls
    controls.enablePan = false;
    controls.enableZoom = false;

    !SceneUtils.getFocus() && removeLabel(label);

    container.removeEventListener('mousemove', onMouseMove);

    // Set blur effect to focus on side panel
    SceneUtils.getFocus() ? showBlur({ focus: 27, aperture: 0.003 })
        : showBlur({ focus: 0, aperture: 10 });
};

const closeDrawer = () => {
    panView(false);
    Categories.setDrawerState(false);
    SceneUtils.setFocus(false);

    controls.enablePan = true;
    controls.enableZoom = true;

    container.addEventListener('mousemove', onMouseMove);

    showBlur();
};

const toggleDrawer = () => {
    Categories.getDrawerState() ? closeDrawer(): openDrawer();
};

const showSAO = bool => {
    SceneUtils.getSaoPass().params.output = bool ? 0 : 1; // 0 = SAO and 1 = Beauty
};

const showBlur = (values = { focus: 0, aperture: 0 }) => {
    Object.entries(values).map(([key, value]) => {
        SceneUtils.getBokehPass().uniforms[key].value = value;
    });
};

const showPerformanceMonitor = bool => {
    stats.dom.style.display = bool ? 'block' : 'none';
    SceneUtils.setPerformanceMonitor(bool);
};

const castShadows = bool => {
    directionalLight.castShadow = bool;
    for (const pointLight of Object.values(pointLights)) {
        pointLight.object.castShadow = bool;
    }
    /*scene.traverse(node => {
        if (node instanceof Mesh) {
            node.receiveShadow = bool;
            node.castShadow = bool;
        }
    });*/
};

export default {
    init,
    selectFloor,
    animateCamera,
    animateLookAt,
    getObject,
    selectObject,
    hoverObject,
    resetCamera,
    resetSelected,
    toggleDrawer,
    showPerformanceMonitor,
    showSAO,
    castShadows,
    nrOfLevels,
    isDev,
};

