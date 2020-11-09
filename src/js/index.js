import { MDCRipple } from '@material/ripple/index';
import { MDCFormField } from '@material/form-field';
import { MDCRadio } from '@material/radio';
import { MDCList } from '@material/list';
import { MDCCheckbox } from '@material/checkbox';

// Local import
import Scene from './Scene';
import Categories from './Categories';
import items from './utils/items';
import Cards from './Cards';
import Levels from './Levels';
import Controls from './Controls';

// Style import
import '../scss/main.scss';

/* For testing Babel polyfills */
// import './utils/transpile.test';

// TODO: add close button to drawer
// TODO: if an item in drawer is selected/focused (highlighted), make other items in drawer darker

const isMobile = window.screen.width <= 900;
const categoryList = new MDCList(document.querySelector('#drawer-categories'));
categoryList.singleSelection = true;

const initCategoryList = categoryIcons => {
    Object.keys(categoryIcons).map((category, index) => {
        const button = Categories.createCategoryButton(category, categoryIcons[category], index);
        document.querySelector('#drawer-categories').innerHTML += button;
    });
};

const listListen = mdcList => {
    mdcList.listen('MDCList:action', event => {
        const target = event.detail.index;
        const category = event.target.children[target];

        if (Categories.getDrawerState()) { // Drawer already open
            Categories.scrollToCategory(category.id);

        } else {
            // Otherwise toggle the drawer state
            Scene.toggleDrawer();

            Categories.scrollToCategory(category.id);
        }
    });
};

const initCards = content => {
    document.querySelector('#cards').innerHTML = content;
    connectObserver(observer);

    document.querySelectorAll('.mdc-card__actions').forEach(element => {
        element.addEventListener('click', event => {
            const object = Scene.getObject(event.target.id);
            Scene.selectObject(object);  // Drawer stays open in this case
        });
    });
};

const initLevels = content => {
    document.querySelector('#levels').innerHTML = content;

    const radio = new MDCRadio(document.querySelector('.mdc-radio'));
    const formField = new MDCFormField(document.querySelector('#levels > .mdc-form-field'));
    formField.input = radio;

    Scene.selectFloor(Scene.nrOfLevels);

    formField.listen('change', event => { Scene.selectFloor(event.target.value); });
};

const initRipples = (selectors, isUnbounded = false) => {
    document.querySelectorAll(selectors).forEach(element => {
        const ripple = new MDCRipple(element);
        ripple.unbounded = isUnbounded;
        return ripple;
    });
    // [].map.call(document.querySelectorAll(elements), element => new MDCRipple(element));
    // list.listElements.map(element => new MDCRipple(element));
};

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.intersectionRatio > 0) { // In the view
            const index = entry.target.id.split('-')[1];
            categoryList.selectedIndex = Number(index);
        }
    });
}, {
    root: document.querySelector('aside'),
    rootMargin: '0px 0px -75% 0px',
    delay: 500,
});

const connectObserver = obs => {
    document.querySelectorAll('.category-title').forEach(item => {
        obs.observe(item);
    });
};

const initControls = content => {
    document.querySelector('#controls').innerHTML = content;

    document.querySelector('.reset-view-button').addEventListener('click', () => {
        Scene.resetCamera();
        Scene.resetSelected();
    });

    document.querySelector('.front-view-button').addEventListener('click', () => {
        Scene.animateCamera({ x: 0, y: 150, z: 300 });
        Scene.animateLookAt({ x: 0, y: 0, z: 0 });
        Scene.resetSelected();
    });

    document.querySelector('.top-view-button').addEventListener('click', () => {
        Scene.animateCamera({ x: 0, y: 300, z: 1 });
        Scene.animateLookAt({ x: 0, y: 0, z: 0 });
        Scene.resetSelected();
    });

    document.querySelector('.back-view-button').addEventListener('click', () => {
        Scene.animateCamera({ x: 0, y: 150, z: -300 });
        Scene.animateLookAt({ x: 0, y: 0, z: 0 });
        Scene.resetSelected();
    });

    const controlsList = new MDCList(document.querySelector('#controls > .mdc-list'));
    controlsList.singleSelection = true;
    const liteModeCheckbox = new MDCCheckbox(document.querySelector('.lite-mode-checkbox'));
    const performanceCheckbox = new MDCCheckbox(document.querySelector('.performance-monitor-checkbox'));

    liteModeCheckbox.checked = isMobile;
    performanceCheckbox.checked = Scene.isDev;

    Scene.showSAO(!liteModeCheckbox.checked);
    Scene.castShadows(!liteModeCheckbox.checked);
    Scene.showPerformanceMonitor(performanceCheckbox.checked);

    performanceCheckbox.listen('change', event => {
        Scene.showPerformanceMonitor(event.target.checked);
    });
    liteModeCheckbox.listen('change', event => { // Lite mode
        Scene.showSAO(!event.target.checked);
        Scene.castShadows(!event.target.checked);
    });
};

initCategoryList(items.categoryIcons);
listListen(categoryList);
Scene.init();
initCards(Cards);
initLevels(Levels);
initControls(Controls);
initRipples('.mdc-button, .mdc-card__primary-action');

const greet = 'Hey there!';
const beNice = 'Good to see you here, hope you\'re doing great.';
const persuasion = 'Interested in my work?';
const link = 'Here\'s my portfolio: https://aidanbundel.com';
const exitConvo = 'Made with 💜';

console.log(`
  %c
  ${ greet }
  ${ beNice }
  ${ persuasion }
  ${ link }
  
  ${ exitConvo }
`, 'color: purple');
