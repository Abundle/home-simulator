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

/* For testing Babel */
// TODO: keep an eye out for Babel 8 https://github.com/babel/babel/tree/master/eslint/babel-eslint-parser
/*if (Scene.isDev) {
    import './utils/transpile.test';
}*/

// TODO: add close button to drawer?
// TODO: if an item in drawer is selected/focused (highlighted), make other items in drawer darker

const isMobile = window.screen.width <= 760;

const initList = selector => {
    const elem = new MDCList(document.querySelector(selector));
    elem.singleSelection = true;
    return elem;
};

const initCategoryList = categoryIcons => {
    // TODO: remove focus after drawer closes (also for the level radio buttons)
    Object.keys(categoryIcons).map((category, index) => {
        const button = Categories.createCategoryButton(category, categoryIcons[category], index);
        document.getElementById('drawer-categories').innerHTML += button;
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
    document.getElementById('cards').innerHTML = content;

    connectObserver(observer);
    document.querySelectorAll('.mdc-card__actions').forEach(element => {
        element.addEventListener('click', event => {
            const object = Scene.getObject(event.target.id);
            Scene.selectObject(object);  // Drawer stays open in this case
        });
    });
};

const initLevels = content => {
    document.getElementById('levels').innerHTML = content;

    const radio = new MDCRadio(document.querySelector('.mdc-radio'));
    const formField = new MDCFormField(document.querySelector('#levels > .mdc-form-field'));
    formField.input = radio;

    Scene.selectFloor(4);

    formField.listen('change', event => { Scene.selectFloor(event.target.value); });
};

const initRipples = (selectors, isUnbounded) => {
    document.querySelectorAll(selectors).forEach(element => {
    // [].map.call(document.querySelectorAll(selectors), element => {
        const ripple = new MDCRipple(element);
        ripple.unbounded = isUnbounded;
        return ripple;
    });
    // [].map.call(document.querySelectorAll(elements), element => new MDCRipple(element));
    // list.listElements.map(element => new MDCRipple(element));
};

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        // console.log(entry.target.id, 'intersection');
        if (entry.intersectionRatio > 0) { // In the view
            const index = entry.target.id.split('-')[1];
            list.selectedIndex = Number(index);
        } /*else { // Out of view
            console.log(entry.target.id, 'out of view');
        }*/
    });
}, {
    root: document.querySelector('aside'),
    rootMargin: '0px 0px -75% 0px',
    delay: 250,
});

const connectObserver = obs => {
    document.querySelectorAll('.category-title').forEach(item => {
    // [...document.querySelectorAll('.category-title')].map(item => {
        obs.observe(item);
    });
};

const initControls = content => { // TODO: make light at 'night'
    document.getElementById('controls').innerHTML = content;

    document.querySelector('.reset-view-button').addEventListener('click', () => {
        Scene.resetCamera();
        Scene.resetSelected();
    });

    document.querySelector('.front-view-button').addEventListener('click', () => {
        Scene.animateCamera({ x: 0, y: 30, z: 60 });
        Scene.animateLookAt({ x: 0, y: 0, z: 0 });
        // Scene.animateFov(15);
        Scene.resetSelected();
    });

    document.querySelector('.top-view-button').addEventListener('click', () => {
        Scene.animateCamera({ x: 0, y: 60, z: 1 });
        Scene.animateLookAt({ x: 0, y: 0, z: 0 });
        // Scene.animateFov(15);
        Scene.resetSelected();
    });

    document.querySelector('.back-view-button').addEventListener('click', () => {
        Scene.animateCamera({ x: 0, y: 30, z: -60 });
        Scene.animateLookAt({ x: 0, y: 0, z: 0 });
        // Scene.animateFov(15);
        Scene.resetSelected();
    });

    const formField = new MDCFormField(document.querySelector('#controls > .mdc-form-field'));
    const performanceCheckbox = new MDCCheckbox(document.querySelector('.performance-checkbox'));
    const saoCheckbox = new MDCCheckbox(document.querySelector('.sao-checkbox'));

    saoCheckbox.checked = false;//!isMobile;
    performanceCheckbox.checked = Scene.isDev;

    Scene.showSAO(saoCheckbox.checked);
    Scene.showPerformanceMonitor(performanceCheckbox.checked);

    formField.input = performanceCheckbox;
    formField.input = saoCheckbox;

    performanceCheckbox.listen('change', event => {
        Scene.showPerformanceMonitor(event.target.checked);
    });
    saoCheckbox.listen('change', event => {
        Scene.showSAO(event.target.checked);
    });
};

const list = initList('.mdc-list');
initCategoryList(items.categoryIcons);
listListen(list);
Scene.init();
initCards(Cards);
initLevels(Levels);
initControls(Controls);

initRipples('.mdc-button, .mdc-card__primary-action', false);
// When clicked rapidly, the ripples distort the layout. Disabling for now
/*initRipples('.mdc-button', false);
initRipples('.mdc-icon-button', true);*/

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
