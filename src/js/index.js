import { MDCRipple } from '@material/ripple/index';
import { MDCFormField } from '@material/form-field';
import { MDCRadio } from '@material/radio';
// import * as WEBGL from 'three/examples/js/WebGL';

// Local import
import '../scss/main.scss';
import * as Scene from './Scene';

const ripple = new MDCRipple(document.querySelector('.mdc-button'));
const radio = new MDCRadio(document.querySelector('.mdc-radio'));
const formField = new MDCFormField(document.querySelector('.mdc-form-field'));
formField.input = radio;

/*if ( WEBGL.isWebGLAvailable() === false ) {
    document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}*/

Scene.init();

document.querySelector('.reset-view-button').addEventListener('click', () => {
    Scene.resetCamera();
    Scene.resetSelected();
});

document.querySelector('.front-view-button').addEventListener('click', () => {
    Scene.animateCamera({ x: 0, y: 0, z: 10 });
    Scene.resetSelected();
});

document.querySelector('.top-view-button').addEventListener('click', () => {
    Scene.animateCamera({ x: 0, y: 10, z: 0.5 });
    Scene.resetSelected();
});

document.querySelector('.side-view-button').addEventListener('click', () => {
    Scene.animateCamera({ x: 10, y: 0, z: 0 });
    Scene.resetSelected();
});

document.querySelector('.mdc-form-field').addEventListener('change', (event) => {
    Scene.selectFloor(event.target.value);
});
