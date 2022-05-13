import { Vector2 } from 'three';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

/* Local import */
import Config from '../data/Config';

let SELECTABLE,         // If an object is clickable
    SHOW,               // Performance monitor visibility
    isAnimating,        // Whether camera is animating
    isDragging,         // Whether time handle is being dragged
    isFocus = false;    // Whether an object has been clicked
let INTERSECTED,        // If an object is intersected
    SELECTED,           // If an object is clicked
    TIME,               // Current time status (controls lights, light direction, background color, etc.), i.e. time and rotation.
    TIME_ANGLE,         // Last recorded time angle. Different from angle in the TIME object, since this is a value that is only set when the time handle animation has finished.
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

const getTime = () => { return TIME; };
const setTime = time => { TIME = time; };

const getFinalTimeAngle = () => { return TIME_ANGLE; };
const setFinalTimeAngle = timeAngle => { TIME_ANGLE = timeAngle; };

const getDragging = () => { return isDragging; };
const setDragging = bool => { isDragging = bool; };

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

/*const getCurrentTimeStatus = () => {
    const hour = new Date().getHours();

    if (Config.times.DAY.startHour < hour && hour < Config.times.DAY.endHour ) {
        return { time: 'DAY', hour };
    } else if (Config.times.NIGHT.startHour < hour && hour < Config.times.NIGHT.endHour ) {
        return { time: 'NIGHT', hour };
    } else {
        return { time: 'TWILIGHT', hour };
    }
}*/

const setNightThemeUI = bool => {
    if (document.querySelector('#levels > .mdc-form-field')) {
        if (bool) {
            document.querySelector('#levels > .mdc-form-field').classList.add('night-theme-levels');
        } else {
            document.querySelector('#levels > .mdc-form-field').classList.remove('night-theme-levels');
        }
    }

    if (document.querySelector('#controls > .mdc-list')) {
        if (bool) {
            document.querySelector('#controls > .mdc-list').classList.add('night-theme-controls-button');
        } else {
            document.querySelector('#controls > .mdc-list').classList.remove('night-theme-controls-button');
        }
    }

    if (bool) {
        document.querySelector('.controls-container').classList.add('night-theme-controls');
    } else {
        document.querySelector('.controls-container').classList.remove('night-theme-controls');
        document.querySelector('.controls-container').classList.add('day-theme-controls');
    }
};

const shortestAngleDistance = (start, end) => {
    // From https://stackoverflow.com/questions/2708476/rotation-interpolation
    // And https://gamedev.stackexchange.com/questions/46552/360-degree-rotation-skips-back-to-0-degrees-when-using-math-atan2y-x
    const shortestAngle = ((((end - start) % 360) + 540) % 360) - 180;
    // Cap rotational 'speed' with a max angle difference
    return Math.min(7, shortestAngle);
}
const lerpAngle = (start, end, alpha) => start + alpha * shortestAngleDistance(start, end);

const angleToTime = angle => {
    // Map from angles to time
    const h = Math.floor((angle % 720) * (1 / 30));
    const m = (angle % 30) * 2;
    // Correct negative numbers
    const hours = h < 0 ? 24 + h : h;
    const minutes = m < 0 ? 60 + m : m;
    return { hours, minutes };
}

const timeToAngle = ({ hours, minutes }) => (hours % 24) * 30 + (minutes * 0.5);

const formatTime = ({ hours, minutes }) => {
    // Pad zeros to single digits
    const h = padSingleDigit(hours);
    const m = padSingleDigit(minutes);
    return `${ h }:${ m }`;
};
const padSingleDigit = n => n < 10 ? n.toString().padStart(2, '0') : n;

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
    getTime,
    setTime,
    getFinalTimeAngle,
    setFinalTimeAngle,
    getDragging,
    setDragging,
    initThreeGUI,
    getMouseObject,
    createLabel,
    setNightThemeUI,
    lerpAngle,
    angleToTime,
    timeToAngle,
    formatTime,
    padSingleDigit,
};
