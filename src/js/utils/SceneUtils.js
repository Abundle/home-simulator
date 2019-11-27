import {Scene} from 'three';

let INTERSECTED, SELECTABLE;
let isAnimating = false;
// let selectedObject;

// let scene = new Scene();
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
    saoBlurRadius: 4,
    saoBlurStdDev: 7,
    saoBlurDepthCutoff: 0.0008
};

const removeLoadingScreen = () => {
    const loadingScreen = document.getElementById('loading-screen');

    if (loadingScreen.classList) {
        loadingScreen.classList.add('hidden');
    } else {
        loadingScreen.className += ' hidden';
    }
};

// TODO: implement with Redux-like state
const getAnimating = () => { return isAnimating; };
const setAnimating = bool => { isAnimating = bool; };

const getIntersected = () => { return INTERSECTED; };
const setIntersected = object => { INTERSECTED = object; };

const getSelectable = () => { return SELECTABLE; };
const setSelectable = bool => { SELECTABLE = bool; };

export default {
    outlinePassParameters,
    SAOparameters,
    removeLoadingScreen,
    getAnimating,
    setAnimating,
    getIntersected,
    setIntersected,
    getSelectable,
    setSelectable,
};

/*export const setSelectedObject = object => {
    selectedObject = object;
};

export const getSelectedObjectPosition = () => {
    return selectedObject.position;
};

export const sigmoid = x => {
    return 1 / (1 + Math.pow(Math.E, -x));
    // return 1 / (1 + Math.pow(Math.E, -x));
};*/

