import { MDCRipple } from '@material/ripple/index';
import { MDCFormField } from '@material/form-field';
import { MDCRadio } from '@material/radio';
import { MDCList } from '@material/list';
import { MDCDrawer } from '@material/drawer';
import { MDCIconButtonToggle } from '@material/icon-button';

// import * as WEBGL from 'three/examples/js/WebGL';

// Local import
import '../scss/main.scss';
import * as Scene from './Scene';

const ripple = new MDCRipple(document.querySelector('.mdc-button'));
const radio = new MDCRadio(document.querySelector('.mdc-radio'));
const formField = new MDCFormField(document.querySelector('.mdc-form-field'));
formField.input = radio;

const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
/*const topAppBar = MDCTopAppBar.attachTo(document.getElementById('app-bar'));
topAppBar.setScrollTarget(document.getElementById('main-content'));
topAppBar.listen('MDCTopAppBar:nav', () => {
    drawer.open = !drawer.open;
});*/

let categoryButton1 = new MDCIconButtonToggle(document.getElementById('category-1'));
categoryButton1.listen('MDCIconButtonToggle:change', () => {
    if (drawer.open && categoryButton2.on) {
        categoryButton2.on = false;
    } else {
        drawer.open = !drawer.open;
    }
    // drawer.open = !drawer.open;
});

let categoryButton2 = new MDCIconButtonToggle(document.getElementById('category-2'));
categoryButton2.listen('MDCIconButtonToggle:change', () => {
    if (drawer.open && categoryButton1.on) {
        categoryButton1.on = false;
    } else {
        drawer.open = !drawer.open;
    }
});

// const list = new MDCList(document.querySelector('.mdc-list'));
// const listItemRipples = list.listElements.map((listItemEl) => new MDCRipple(listItemEl));

/*if ( WEBGL.isWebGLAvailable() === false ) {
    document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}*/

Scene.init();

document.querySelector('.reset-view-button').addEventListener('click', () => {
    Scene.resetCamera();
    Scene.resetSelected();
});

document.querySelector('.front-view-button').addEventListener('click', () => {
    Scene.animateCamera({ x: 0, y: 0, z: 30 });
    Scene.resetSelected();
});

document.querySelector('.top-view-button').addEventListener('click', () => {
    Scene.animateCamera({ x: 0, y: 30, z: 0.5 });
    Scene.resetSelected();
});

document.querySelector('.side-view-button').addEventListener('click', () => {
    Scene.animateCamera({ x: 30, y: 0, z: 0 });
    Scene.resetSelected();
});

document.querySelector('.mdc-form-field').addEventListener('change', (event) => {
    Scene.selectFloor(event.target.value);
});
