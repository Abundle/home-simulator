import { Vector2 } from 'three';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

/* For debugging */
const WEBPACK_MODE = process.env.NODE_ENV;
const isDev = WEBPACK_MODE === 'development';

let SELECTABLE,
    SHOW,
    INTERSECTED,
    SELECTED,
    isAnimating,
    isFocus = false;
let SAO, BOKEH = {};

const outlinePassParameters = {
    edgeStrength: 3,
    edgeGlow: 0.0,
    edgeThickness: 1,
    pulsePeriod: 0,
    rotate: false,
    usePatternTexture: false,
};

const saoParameters = {
    output: 0,
    saoBias: 1,
    saoIntensity: 0.01,
    saoScale: 10,
    saoKernelRadius: 75,
    saoMinResolution: 0,
    saoBlur: true,
    saoBlurRadius: 4,
    saoBlurStdDev: 7,
    saoBlurDepthCutoff: 0.0008
};

const bokehParameters = {
    focus: 0,
    aperture: 0,
    maxblur: 0.01
};

const removeLoadingScreen = () => {
    const loadingScreen = document.getElementById('loading-screen');

    if (loadingScreen.classList) {
        loadingScreen.classList.add('hidden');
    } else {
        loadingScreen.className += ' hidden';
    }
};

const getAnimating = () => { return isAnimating; };
const setAnimating = bool => { isAnimating = bool; };

const getFocus = () => { return isFocus; };
const setFocus = bool => { isFocus = bool; };

const getIntersected = () => { return INTERSECTED; };
const setIntersected = object => { INTERSECTED = object; };

const getSelectable = () => { return SELECTABLE; };
const setSelectable = bool => { SELECTABLE = bool; };

const getSelectedObject = () => { return SELECTED; };
const setSelectedObject = object => { SELECTED = object; };

const getPerformanceMonitor = () => { return SHOW; };
const setPerformanceMonitor = bool => { SHOW = bool; };

const getSaoPass = () => { return SAO; };
const setSaoPass = pass => { SAO = pass; };

const getBokehPass = () => { return BOKEH; };
const setBokehPass = pass => { BOKEH = pass; };

const initGUI = (saoPass, bokehPass) => {
    const gui = new GUI();

    gui.add(saoPass.params, 'output', {
        'Beauty'    : SAOPass.OUTPUT.Beauty,
        'Beauty+SAO': SAOPass.OUTPUT.Default,
        'SAO'       : SAOPass.OUTPUT.SAO,
        'Depth'     : SAOPass.OUTPUT.Depth,
        'Normal'    : SAOPass.OUTPUT.Normal
    }).onChange(value => {
        saoPass.params.output = parseInt(value);
    });
    gui.add(bokehParameters, 'focus', 0, 50, 1).onChange(value => {
        bokehPass.uniforms['focus'].value = value;
    });
    gui.add(bokehParameters, 'aperture', 0, 10, 0.1).onChange(value => {
        bokehPass.uniforms['aperture'].value = value * 0.001;
    });
    gui.add(bokehParameters, 'maxblur', 0, 0.01, 0.001).onChange(value => {
        bokehPass.uniforms['maxblur'].value = value;
    });
    gui.close(true);
    gui.add(saoPass.params, 'saoBias', - 1, 1);
    gui.add(saoPass.params, 'saoIntensity', 0, 1);
    gui.add(saoPass.params, 'saoScale', 0, 10);
    gui.add(saoPass.params, 'saoKernelRadius', 1, 100);
    gui.add(saoPass.params, 'saoMinResolution', 0, 1);
    gui.add(saoPass.params, 'saoBlur');
    gui.add(saoPass.params, 'saoBlurRadius', 0, 200);
    gui.add(saoPass.params, 'saoBlurStdDev', 0.5, 150);
    gui.add(saoPass.params, 'saoBlurDepthCutoff', 0.0, 0.1);
};

const getMouseObject = event => {
    const mouse = new Vector2();

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    return mouse;
};

const createLabel = () => {
    // HTML
    const element = document.createElement('div');

    element.className = 'label-card';
    element.style.opacity = isDev ? '10%' : '0';
    element.innerHTML = `
        <div class='mdc-card'>
            <div id='label-image' class='mdc-card__media mdc-card__media--square'></div>
                <div class='mdc-card__primary'>
                    <h2 id='label-title' class='mdc-card__title mdc-typography--headline6'></h2>
                    <h3 id='label-subtitle' class='mdc-card__subtitle mdc-typography--subtitle2'></h3>
                    <div class='mdc-card__secondary mdc-typography--body2'>Click for more info</div>
                </div>
        </div>
    `;
    // <div id='label-image' class='mdc-card__media mdc-card__media--square' style='background-image: url(${ require('../assets/img/placeholder.jpg') });'></div>
    document.body.appendChild(element);

    // CSS Object
    const object = new CSS3DObject(element);
    object.position.set(0, 0, 0);
    object.userData = { set: false };
    // object.applyMatrix4(new Matrix4().makeTranslation(0, 500, 0));
    // element.style.height = '700px';

    return {
        element: element,
        object: object
    };
};

// TODO: enable manually switching day/evening/night as well
const setNightThemeUI = bool => {
    if (document.querySelector('#levels > .mdc-form-field')) {
        if (bool) {
            document.querySelector('#levels > .mdc-form-field').classList.add('night-theme');
        } else {
            document.querySelector('#levels > .mdc-form-field').classList.remove('night-theme');
        }
    }
};

export default {
    outlinePassParameters,
    saoParameters,
    bokehParameters,
    removeLoadingScreen,
    getAnimating,
    setAnimating,
    getFocus,
    setFocus,
    getIntersected,
    setIntersected,
    getSelectable,
    setSelectable,
    getSelectedObject,
    setSelectedObject,
    getPerformanceMonitor,
    setPerformanceMonitor,
    getSaoPass,
    setSaoPass,
    getBokehPass,
    setBokehPass,
    initGUI,
    getMouseObject,
    createLabel,
    setNightThemeUI,
};
