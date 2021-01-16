import { Vector2 } from 'three';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

/* Local import */
import Config from './Config';

let SELECTABLE,         // If an object is clickable
    SHOW,               // Performance monitor visibility
    isAnimating,        // Whether camera is animating
    isFocus = false;    // Whether an object has been clicked
let INTERSECTED,        // If an object is intersected
    SELECTED,           // If an object is clicked
    TIME,               // Current moment
    SAO,
    BOKEH = null;

const removeLoadingScreen = () => {
    const loadingScreen = document.querySelector('#loading-screen');

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

const getTimeStatus = () => { return TIME; };
const setTimeStatus = time => { TIME = time; };

const initThreeGUI = (saoPass, bokehPass) => {
    const gui = new GUI();

    gui.domElement.style.float = 'left';
    gui.domElement.style.marginRight = '0';
    gui.domElement.style.marginLeft = '80px';

    gui.add(saoPass.params, 'output', {
        'Beauty'    : SAOPass.OUTPUT.Beauty,
        'Beauty+SAO': SAOPass.OUTPUT.Default,
        'SAO'       : SAOPass.OUTPUT.SAO,
        'Depth'     : SAOPass.OUTPUT.Depth,
        'Normal'    : SAOPass.OUTPUT.Normal
    }).onChange(value => {
        saoPass.params.output = parseInt(value);
    });
    gui.add(Config.bokehParameters, 'focus', 0, 50, 1).onChange(value => {
        bokehPass.uniforms['focus'].value = value;
    });
    gui.add(Config.bokehParameters, 'aperture', 0, 10, 0.1).onChange(value => {
        bokehPass.uniforms['aperture'].value = value * 0.001;
    });
    gui.add(Config.bokehParameters, 'maxblur', 0, 0.01, 0.001).onChange(value => {
        bokehPass.uniforms['maxblur'].value = value;
    });
    gui.close(true);
    gui.add(saoPass.params, 'saoBias', -1, 1);
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

    // Calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    return mouse;
};

const createLabel = () => {
    // HTML
    const element = document.createElement('div');

    element.className = 'label-card';
    element.style.opacity = Config.isDev ? '10%' : '0';
    element.innerHTML = `
        <div class='mdc-card'>
            <div id='label-image' class='mdc-card__media mdc-card__media--square'></div>
                <div class='mdc-card__primary'>
                    <h2 id='label-title' class='mdc-card__title mdc-typography--headline6'></h2>
                    <h3 id='label-subtitle' class='mdc-card__subtitle mdc-typography--subtitle2'></h3>
                    <div class='mdc-card__secondary mdc-typography--body2'>Click object for more info</div>
                </div>
        </div>
    `;
    // <div id='label-image' class='mdc-card__media mdc-card__media--square' style='background-image: url(${ require('../assets/img/placeholder.jpg') });'></div>
    document.body.appendChild(element);

    // CSS Object
    const object = new CSS3DObject(element);
    object.position.set(0, 0, 0);
    object.userData = { set: false };
    // element.style.height = '700px';

    return {
        element: element,
        object: object
    };
};

const getCurrentTimeStatus = () => {
    const hour = new Date().getHours();

    if (Config.times.DAY.startHour < hour && hour < Config.times.DAY.endHour ) {
        return { time: 'DAY', hour };
    } else if (Config.times.NIGHT.startHour < hour && hour < Config.times.NIGHT.endHour ) {
        return { time: 'NIGHT', hour };
    } else {
        return { time: 'TWILIGHT', hour };
    }
}

const setDarkThemeUI = bool => {
    // TODO: add more UI elements for dark mode
    if (document.querySelector('#levels > .mdc-form-field')) {
        if (bool) {
            document.querySelector('#levels > .mdc-form-field').classList.add('night-theme');
        } else {
            document.querySelector('#levels > .mdc-form-field').classList.remove('night-theme');
        }
    }
};

export default {
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
    getTimeStatus,
    setTimeStatus,
    initThreeGUI,
    getMouseObject,
    createLabel,
    getCurrentTimeStatus,
    setDarkThemeUI,
};
