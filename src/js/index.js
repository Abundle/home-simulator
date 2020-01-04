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
import '../scss/main.scss';

/* For testing Babel */
// import './utils/transpile.test';

// TODO: add title top left + insert GitHub & portfolio link or console message with portfolio & GitHub link?

const initList = selector => {
    const elem = new MDCList(document.querySelector(selector));
    elem.singleSelection = true;
    return elem;
};

const initCategoryList = categoryIcons => {
    // TODO: remove focus after drawer closes (also for the radio buttons?)
    Object.keys(categoryIcons).map((category, index) => {
        const button = Categories.createCategoryButton(category, categoryIcons[category], index);
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
const initLevels = content => {
    document.getElementById('levels').innerHTML = content;

    const radio = new MDCRadio(document.querySelector('.mdc-radio'));
    const formField = new MDCFormField(document.querySelector('#levels > .mdc-form-field'));
    formField.input = radio;

    formField.listen('change', event => {
        Scene.selectFloor(event.target.value);
    });
    /*document.querySelector('.mdc-form-field').addEventListener('change', event => {
        Scene.selectFloor(event.target.value);
    });*/
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

const initControls = content => {
    document.getElementById('controls').innerHTML = content;

    document.querySelector('.reset-view-button').addEventListener('click', () => {
        Scene.resetCamera();
        Scene.resetSelected();
    });

    document.querySelector('.front-view-button').addEventListener('click', () => {
        Scene.animateCamera({ x: 0, y: 1, z: 75 });
        Scene.animateLookAt({ x: 0, y: 3, z: 0 });
        Scene.animateFov(15);
        Scene.resetSelected();
    });

    document.querySelector('.top-view-button').addEventListener('click', () => {
        Scene.animateCamera({ x: 0, y: 75, z: 1 }); // TODO: from back to top view not working properly
        Scene.animateLookAt({ x: 0, y: 0, z: 0 });
        Scene.animateFov(15);
        Scene.resetSelected();
    });

    document.querySelector('.back-view-button').addEventListener('click', () => {
        Scene.animateCamera({ x: 0, y: 1, z: -75 });
        Scene.animateLookAt({ x: 0, y: 3, z: 0 });
        Scene.animateFov(15);
        Scene.resetSelected();
    });

    const checkbox = new MDCCheckbox(document.querySelector('.mdc-checkbox'));
    const formField = new MDCFormField(document.querySelector('#controls > .mdc-form-field'));
    formField.input = checkbox;

    formField.listen('change', event => {
        Scene.showPerformanceMonitor(event.target.checked);
    });
};

const list = initList('.mdc-list');
initCategoryList(items.categoryIcons);
listListen(list);
Scene.init();
initCards(Cards);
initLevels(Levels);
initControls(Controls);

initRipples('.mdc-card__primary-action', false);
// When clicked rapidly, the ripples distort the layout. Disabling for now
/*initRipples('.mdc-button', false);
initRipples('.mdc-icon-button', true);*/
