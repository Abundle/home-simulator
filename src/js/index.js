import { MDCRipple } from '@material/ripple/index';
import { MDCFormField } from '@material/form-field';
import { MDCRadio } from '@material/radio';
import { MDCList } from '@material/list';
import { MDCCheckbox } from '@material/checkbox';

import { gsap } from 'gsap/all';

// Local import
import Scene from './Scene';
import Categories from './Categories';
import Utils from './utils/Utils';
import Config from './utils/Config';
import Cards from './Cards';
import Levels from './Levels';
import Controls from './Controls';
// Style import
import '../scss/main.scss';

/* For testing Babel polyfills */
// import './utils/transpile.test';

// TODO: add close button to drawer
// TODO: if an item in drawer is selected/focused (highlighted), make other items in drawer darker

const categoryList = new MDCList(document.querySelector('#drawer-categories'));
categoryList.singleSelection = true;

const initCategoryList = contents => {
    Object.keys(contents).map((category, index) => {
        const button = Categories.createCategoryButton(category, contents[category].icon, index);
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

    Scene.selectFloor(Config.levels.length);

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
        Scene.animateCamera(Config.cameraViews.front);
        Scene.animateLookAt({ x: 0, y: 0, z: 0 });
        Scene.resetSelected();
    });

    document.querySelector('.top-view-button').addEventListener('click', () => {
        Scene.animateCamera(Config.cameraViews.top);
        Scene.animateLookAt({ x: 0, y: 0, z: 0 });
        Scene.resetSelected();
    });

    document.querySelector('.back-view-button').addEventListener('click', () => {
        Scene.animateCamera(Config.cameraViews.back);
        Scene.animateLookAt({ x: 0, y: 0, z: 0 });
        Scene.resetSelected();
    });

    const controlsList = new MDCList(document.querySelector('#controls > .mdc-list'));
    controlsList.singleSelection = true;
    const liteModeCheckbox = new MDCCheckbox(document.querySelector('.lite-mode-checkbox'));
    const performanceCheckbox = new MDCCheckbox(document.querySelector('.performance-monitor-checkbox'));

    liteModeCheckbox.checked = true; // Config.isMobile;
    performanceCheckbox.checked = Config.isDev;

    Scene.showSAO(!liteModeCheckbox.checked);
    Scene.castShadows(!liteModeCheckbox.checked);
    Scene.showPerformanceMonitor(performanceCheckbox.checked);

    // Lite mode
    liteModeCheckbox.listen('change', event => {
        Scene.showSAO(!event.target.checked);
        Scene.castShadows(!event.target.checked);
    });
    performanceCheckbox.listen('change', event => {
        Scene.showPerformanceMonitor(event.target.checked);
    });

    // Set UI, scene and controls to current time
    const circleRangeElement = document.querySelector('.circle-range');
    const slider = document.querySelector('.slider');
    const timeElement = document.querySelector('.time');
    const box = circleRangeElement.getBoundingClientRect();

    const centerX = (circleRangeElement.offsetWidth / 2) + box.left;
    const centerY = (circleRangeElement.offsetHeight / 2) + box.top;

    const date = new Date();
    const currentTime = { hours: date.getHours(), minutes: date.getMinutes() };
    const currentAngle = Utils.timeToAngle(currentTime);

    const animateTimeSlider = angle => {
        gsap.to(slider, {
            rotation: angle.toFixed(2),
            duration: 2,
            onUpdate: () => {
                const currentRotation = Math.round(gsap.getProperty(slider, 'rotation'));
                const time = Utils.angleToTime(currentRotation);

                Utils.setTime({ time: time, rotation: currentRotation });
                Scene.updateSunLight();

                timeElement.textContent = Utils.formatTime(time);
                slider.style.setProperty(Config.timeHandle.cssVar, Config.timeHandle.activeColor);
            },
            onComplete: () => {
                slider.style.setProperty(Config.timeHandle.cssVar, Config.timeHandle.inActiveColor);
            },
        });
    }

    // Setup initial scene time
    Utils.setTime({ time: currentTime, rotation: currentAngle });
    Scene.updateSunLight();
    Utils.setFinalTimeAngle(currentAngle);

    gsap.to(slider, {
        rotation: Utils.getFinalTimeAngle().toFixed(2),
    });
    // slider.style.transform = `rotate(${ currentAngle }deg)`;
    timeElement.textContent = Utils.formatTime(currentTime);
    slider.style.setProperty(Config.timeHandle.cssVar, Config.timeHandle.inActiveColor);

    window.addEventListener('mouseup',() => {
        Utils.setDragging(false);
        document.body.style.cursor = 'auto';
    });
    slider.addEventListener('mousedown',() => {
        Utils.setDragging(true);
        document.body.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove',event => {
        if (Utils.getDragging()) {
            const posX = event.pageX;
            const posY = event.pageY;

            const deltaX = centerX - posX;
            const deltaY = centerY - posY;

            // Radians to degrees and rotate counterclockwise
            const endAngleAtan2 = Math.atan2(deltaY, deltaX) * (180 / Math.PI) - 90;
            // Map from [-180,180] to [0,360]
            const endAngle = (endAngleAtan2 + 360) % 360;
            // Start from last recorded angle
            const startAngle = Utils.getFinalTimeAngle();
            // Note that this angle has no upper nor lower limit. So in theory this could end up becoming a really large
            // number. This could potentially lead to performance issues, but hey, it's a bit of an edge case.
            const resultAngle = Utils.lerpAngle(startAngle, endAngle, 0.75);

            animateTimeSlider(resultAngle);
            /*slider.style.transform = `rotate(${ resultAngle }deg)`;
            timeElement.textContent = Math.round(resultAngle).toString();*/
            Utils.setFinalTimeAngle(resultAngle);
        }
    });
    timeElement.addEventListener('click',() => {
        // Make it so that the angle difference we're rotating to is within 0-720 range
        const resultAngle = Math.floor(Utils.getFinalTimeAngle() / 720) * 720 + currentAngle;

        animateTimeSlider(resultAngle);
        Utils.setFinalTimeAngle(resultAngle);
    });
};

initCategoryList(Config.contents);
listListen(categoryList);
Scene.init();
initCards(Cards);
initLevels(Levels);
initControls(Controls);
initRipples('.mdc-button, .mdc-card__primary-action');

const greet = 'Hey there!';
const beNice = 'Good to see you here, hope you\'re doing great.';
const persuasion = 'Interested in more of my work?';
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
