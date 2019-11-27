import { MDCRipple } from '@material/ripple/index';
import { MDCFormField } from '@material/form-field';
import { MDCRadio } from '@material/radio';
import { MDCIconButtonToggle } from '@material/icon-button';

// Local import
// TODO: insert GitHub/portfolio link or console message with portfolio & GitHub link?
import Scene from './Scene';
import Categories from './Categories';
import categoryIcons from './utils/categoryIcons';
import SceneUtils from './utils/SceneUtils';
import Cards from './Cards';
import Views from './Views';
import '../scss/main.scss';

/* For debugging */
// import './utils/transpile.test';

document.getElementById('views').innerHTML = Views;
// TODO: use Lists instead https://material-components.github.io/material-components-web-catalog/#/component/list
const radio = new MDCRadio(document.querySelector('.mdc-radio'));
const formField = new MDCFormField(document.querySelector('.mdc-form-field'));
const buttonSelectors = '.mdc-button, .mdc-card__primary-action';

formField.input = radio;
[].map.call(document.querySelectorAll(buttonSelectors), element => {
    return new MDCRipple(element);
});

// TODO: remove focus after drawer closes, also for the radio buttons
Object.keys(categoryIcons).map((category, index) => {
    const button = Categories.createCategoryButton(category, categoryIcons[category], index);
    document.getElementById('category-icons').innerHTML += button;
});

// TODO: prevent the outlined buttons to 'CSS fill' when the drawer is temporarily disabled
const categoryButtons = [];
let lastClickedId;
document.querySelectorAll('.category-button').forEach(element => {
    const buttonElement = new MDCIconButtonToggle(element);
    categoryButtons.push(buttonElement);

    element.addEventListener('click', event => {
        let target = event.target; // TODO: use currentTarget? See https://stackoverflow.com/questions/29168719/can-you-target-an-elements-parent-element-using-event-target

        // If click on the <i> element inside the button, save the <button> parent as target
        if (target.localName === 'i') {
            target = target.parentElement;
        }

        // If the drawer is already open and another button is clicked, don't close it
        if (Categories.getDrawer() && target.id !== lastClickedId) {
            // Set all buttons to false except the clicked element and update last clicked element
            categoryButtons.forEach(button => {
                button.on = button.root_ === target;
            });
            lastClickedId = target.id;

            Categories.scrollToCategory(lastClickedId);
        } else {
            // Otherwise act as normal toggle buttons and save the last clicked element id
            !SceneUtils.getAnimating() && Categories.toggleDrawer();
            lastClickedId = target.id;

            Categories.scrollToCategory(lastClickedId);
        }
    });
});

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
