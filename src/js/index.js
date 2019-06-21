import { MDCRipple } from '@material/ripple/index';
import { MDCFormField } from '@material/form-field';
import { MDCRadio } from '@material/radio';
import { MDCDrawer } from '@material/drawer';
import { MDCIconButtonToggle } from '@material/icon-button';

// import * as WEBGL from 'three/examples/js/WebGL';

// Local import
import '../scss/main.scss';
import * as Scene from './Scene';
import { Cards } from './Cards';
import { createCategoryButton, scrollToCategory } from './CategoryIcons';
import { categoryIcons } from './items';

const radio = new MDCRadio(document.querySelector('.mdc-radio'));
const formField = new MDCFormField(document.querySelector('.mdc-form-field'));
formField.input = radio;

// TODO: add tooltips to category buttons https://www.zeolearn.com/magazine/material-design-tooltip-with-css-html
// TODO: remove the declaration part MDCs (MDCDrawer.attachTo(document.querySelector('.mdc-drawer')) is already enough)
// TODO: create separat function for getting/setting drawer.open boolean
const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));

const selectors = '.mdc-button, .mdc-card__primary-action';
const ripples = [].map.call(document.querySelectorAll(selectors), element => {
    return new MDCRipple(element);
});

// let categoryButtons = [];
Object.keys(categoryIcons).map((category, index) => { // TODO: remove focus after drawer closes
    let button = createCategoryButton(category, categoryIcons[category], index);
    document.getElementById('category-icons').innerHTML += button;

    /*categoryButtons.push(button);
    let buttonElement = document.getElementById('category-' + index);
    categoryButtons.push(new MDCIconButtonToggle(buttonElement));*/
});

let categoryButtons = [];
let lastClickedId;
document.querySelectorAll('.mdc-icon-button').forEach(element => {
    let buttonElement = new MDCIconButtonToggle(element);
    categoryButtons.push(buttonElement);

    element.addEventListener('click', event => {
        let target = event.target;

        if (target.localName === 'i') {
            target = target.parentElement;
        }

        if (drawer.open && target.id !== lastClickedId) {
            // Set all buttons to false except the clicked element and update last clicked element
            categoryButtons.forEach(button => {
                button.on = button.root_ === target;
                /*if (button.root_ === target) {
                    button.on = true;
                } else {
                    button.on = false;
                }*/
            });
            lastClickedId = target.id;

            scrollToCategory(lastClickedId);
            // Scene.drawerOpen(true);
        } else {
            // Otherwise act as normal toggle buttons and save the last clicked element id
            drawer.open = !drawer.open;
            lastClickedId = target.id;

            scrollToCategory(lastClickedId);
            // Scene.drawerOpen(drawer.open);
        }
    });
});

/*let buttons = document.getElementById('category-icons').childNodes;
for (let i = 0; i < buttons.length; i++) {
    let button = buttons[i];
    let buttonElement = new MDCIconButtonToggle(button);
}*/

/*buttons.listen('MDCIconButtonToggle:change', () => {

    /!*if (drawer.open && categoryButton2.on) {
        categoryButton2.on = false;
    } else {
        drawer.open = !drawer.open;
    }*!/
});*/

/*const iconButtonRipples = [].map.call(document.querySelectorAll('.mdc-icon-button'), (element) => {
    let ripple = new MDCRipple(element);
    ripple.unbounded = true;
    return ripple;
});*/

/*if ( WEBGL.isWebGLAvailable() === false ) {
    document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}*/

// TODO: check if purifying is necessary: https://github.com/cure53/DOMPurify
document.getElementById('cards').innerHTML = Cards;

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

document.querySelector('.mdc-form-field').addEventListener('change', event => {
    Scene.selectFloor(event.target.value);
});
