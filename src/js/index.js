import { MDCRipple } from '@material/ripple/index';

// Local import
import '../scss/main.scss';
import * as Scene from './Scene';

const ripple = new MDCRipple(document.querySelector('.mdc-button'));

Scene.init();

document.querySelector('.reset-view-button').addEventListener('click', () => {
    Scene.resetCamera();
    Scene.resetSelected();
});

document.querySelector('.front-view-button').addEventListener('click', () => {
    Scene.animateCamera({ x: 0, y: 0, z: 5 });
    Scene.resetSelected();
});

document.querySelector('.top-view-button').addEventListener('click', () => {
    Scene.animateCamera({ x: 0, y: 5, z: 0.5 });
    Scene.resetSelected();
});

document.querySelector('.side-view-button').addEventListener('click', () => {
    Scene.animateCamera({ x: 5, y: 0, z: 0 });
    Scene.resetSelected();
});
