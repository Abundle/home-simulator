import { MDCRipple } from '@material/ripple/index';
import { MDCFormField } from '@material/form-field';
import { MDCRadio } from '@material/radio';
import { MDCIconButtonToggle } from '@material/icon-button';

// import * as WEBGL from 'three/examples/js/WebGL';

// Local import
// TODO: structure imports 1 way, either '* as Foo' or '{ Bar } from Foo'
import '../scss/main.scss';
import * as Scene from './Scene';
import { Cards } from './Cards';
import { createCategoryButton, toggleDrawer, getDrawer, scrollToCategory } from './Categories';
// import * as Categories from './Categories';
import { categoryIcons } from './items';

// TODO: add tooltips to category buttons https://www.zeolearn.com/magazine/material-design-tooltip-with-css-html
// TODO: remove the declaration part MDCs (MDCDrawer.attachTo(document.querySelector('.mdc-drawer')) is already enough)
const radio = new MDCRadio(document.querySelector('.mdc-radio'));
const formField = new MDCFormField(document.querySelector('.mdc-form-field'));
formField.input = radio;

const selectors = '.mdc-button, .mdc-card__primary-action';
const ripples = [].map.call(document.querySelectorAll(selectors), element => {
    return new MDCRipple(element);
});

// TODO: remove focus after drawer closes, also for the radio buttons
Object.keys(categoryIcons).map((category, index) => {
    const button = createCategoryButton(category, categoryIcons[category], index);
    document.getElementById('category-icons').innerHTML += button;

    /*categoryButtons.push(button);
    let buttonElement = document.getElementById('category-' + index);
    categoryButtons.push(new MDCIconButtonToggle(buttonElement));*/
});

const categoryButtons = [];
let lastClickedId;
document.querySelectorAll('.mdc-icon-button').forEach(element => {
    const buttonElement = new MDCIconButtonToggle(element);
    categoryButtons.push(buttonElement);

    element.addEventListener('click', event => {
        let target = event.target;

        // If click on the <i> element inside the button, save the <button> parent as target
        if (target.localName === 'i') {
            target = target.parentElement;
        }

        if (getDrawer() && target.id !== lastClickedId) {
            // Set all buttons to false except the clicked element and update last clicked element
            categoryButtons.forEach(button => {
                button.on = button.root_ === target;
            });
            lastClickedId = target.id;

            scrollToCategory(lastClickedId);
        } else {
            // Otherwise act as normal toggle buttons and save the last clicked element id
            toggleDrawer();
            // drawer.open = !drawer.open;
            lastClickedId = target.id;

            scrollToCategory(lastClickedId);
        }
    });
});

// TODO: check if purifying is necessary: https://github.com/cure53/DOMPurify
document.getElementById('cards').innerHTML = Cards;

Scene.init();

document.querySelector('.reset-view-button').addEventListener('click', () => {
    Scene.resetCamera();
    Scene.resetSelected();
});

document.querySelector('.front-view-button').addEventListener('click', () => {
    Scene.animateCamera({ x: 0, y: 2, z: 80 });
    Scene.animateLookAt({ x: 0, y: 3, z: 0 });
    Scene.animateFov(15);
    Scene.resetSelected();
});

document.querySelector('.top-view-button').addEventListener('click', () => {
    Scene.animateCamera({ x: 0, y: 85, z: 2 }); // 0.5
    Scene.animateLookAt({ x: 0, y: 0, z: 0 });
    Scene.animateFov(15);
    Scene.resetSelected();
});

document.querySelector('.side-view-button').addEventListener('click', () => {
    Scene.animateCamera({ x: 80, y: 2, z: 0 });
    Scene.animateLookAt({ x: 0, y: 3, z: 0 });
    Scene.animateFov(15);
    Scene.resetSelected();
});

document.querySelector('.mdc-form-field').addEventListener('change', event => {
    Scene.selectFloor(event.target.value);
});
