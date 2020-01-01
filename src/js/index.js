import { MDCRipple } from '@material/ripple/index';
import { MDCFormField } from '@material/form-field';
import { MDCRadio } from '@material/radio';
import { MDCList } from '@material/list';

// Local import
// TODO: insert GitHub/portfolio link or console message with portfolio & GitHub link?
// TODO: check normalize npm package
// TODO: edit README

import Scene from './Scene';
import Categories from './Categories';
import items from './utils/items';
import Cards from './utils/Cards';
import Views from './Views';
import '../scss/main.scss';

/* For debugging */
// import './utils/transpile.test';

const initList = selector => {
    const elem = new MDCList(document.querySelector(selector));
    elem.singleSelection = true;
    return elem;
};

const initCategoryList = () => {
    // TODO: remove focus after drawer closes (also for the radio buttons?)
    Object.keys(items.categoryIcons).map((category, index) => {
        const button = Categories.createCategoryButton(category, items.categoryIcons[category], index);
        document.getElementById('drawer-categories').innerHTML += button;
    });
};

const listListen = mdcList => {
    mdcList.listen('MDCList:action', event => {
        const target = event.detail.index;
        const category = event.target.children[target];

        if (Categories.getDrawer()) { // Drawer already open
            Categories.scrollToCategory(category.id);

        } else {
            // Otherwise toggle the drawer state
            Scene.toggleDrawer();
            // !SceneUtils.getAnimating() && Scene.toggleDrawer();

            Categories.scrollToCategory(category.id);
        }
    });
};

const initCards = content => {
    document.getElementById('cards').innerHTML = content;

    connectObserver(observer);
    document.querySelectorAll('.mdc-card__actions').forEach(element => {
        element.addEventListener('click', event => {
            // const id = event.target.id.split('-')[1];
            Scene.getObject(event.target.id);
        });
    });
};
const initViews = content => {
    document.getElementById('views').innerHTML = content;

    const radio = new MDCRadio(document.querySelector('.mdc-radio'));
    const formField = new MDCFormField(document.querySelector('.mdc-form-field'));
    formField.input = radio;
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
        // console.log(item.offsetTop);
    });
};

const initControls = () => {
    // TODO: check if all this can be done at the Object.keys(categoryIcons).map.. function
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

    /*formField.listen('MDCFormField:change', event => {
        Scene.selectFloor(event.target.value);
    });*/
};

const list = initList('.mdc-list');
initCategoryList();
listListen(list);
Scene.init();
initCards(Cards);
initViews(Views);
initControls();

initRipples('.mdc-card__primary-action', false);
// When clicked rapidly, the ripples distort the layout. Disabling for now
/*initRipples('.mdc-button', false);
initRipples('.mdc-icon-button', true);*/
