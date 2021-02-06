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
        // TODO: retrieve values from Config
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

    liteModeCheckbox.checked = true; //Config.isMobile;
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
    const info = document.querySelector('.info');
    const box = circleRangeElement.getBoundingClientRect();

    const centerX = (circleRangeElement.offsetWidth / 2) + box.left;
    const centerY = (circleRangeElement.offsetHeight / 2) + box.top;

    const date = new Date();
    const currentHour = date.getHours();
    const currentMinutes = date.getMinutes();

    let isDragging = false;
    let resultAngle = 0;

    slider.style.transform = `rotate(${ Utils.timeToAngle(currentHour, currentMinutes) }deg)`;
    slider.style.setProperty('--time-bg-color', '#6691fa');
    info.textContent = Utils.formatTime(currentHour, currentMinutes);

    window.addEventListener('mouseup',() => {
        isDragging = false;
        document.body.style.cursor = 'auto';
    });
    slider.addEventListener('mousedown',() => {
        isDragging = true;
        document.body.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove',event => {
        if (isDragging) {
            const posX = event.pageX;
            const posY = event.pageY;

            const deltaX = centerX - posX;
            const deltaY = centerY - posY;

            // Radians to degrees and rotate counterclockwise
            const endAngleAtan2 = Math.atan2(deltaY, deltaX) * (180 / Math.PI) - 90;
            // Map from [-180,180] to [0,360]
            const endAngle = (endAngleAtan2 + 360) % 360;
            // Start from last angle
            const startAngle = resultAngle;
            resultAngle = Utils.lerpAngle(startAngle, endAngle, 1);

            /*let endAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) - 90;
            endAngle = (endAngle + 360) % 360; // Map from [-180,180] to [0,360]
            let startAngle = resultAngle % 360;

            let shortestAngle = ((((endAngle - startAngle) % 360) + 540) % 360) - 180;
            resultAngle = startAngle + shortestAngle * 0.01;*/

            gsap.to(slider, {
                rotation: resultAngle.toFixed(2),
                duration: 2,
                onUpdate: () => {
                    const currentRotation = Math.round(gsap.getProperty(slider, 'rotation'));
                    const { hours, minutes } = Utils.angleToTime(currentRotation);
                    info.textContent = Utils.formatTime(hours, minutes);
                    slider.style.setProperty('--time-bg-color', '#f15b27');
                },
                onComplete: () => {
                    slider.style.setProperty('--time-bg-color', '#6691fa');
                },
            });
        }
    });

    /*const currentTimeStatus = SceneUtils.getCurrentTimeStatus();
    const timeElement = document.querySelector(`#radio-${ currentTimeStatus.time.toLowerCase() }`);

    timeElement.checked = true;
    SceneUtils.setTimeStatus(currentTimeStatus);
    SceneUtils.setDarkThemeUI(Config.times[currentTimeStatus.time].darkTheme);

    document.querySelector('.time-toggle').addEventListener('change', event => {
        const time = Object.keys(Config.times).find(key => Config.times[key].value === event.target.value);
        SceneUtils.setTimeStatus({ time, hour: Config.times[time].startHour });
        SceneUtils.setDarkThemeUI(Config.times[time].darkTheme);
        Scene.updateSunLight({ time: time, hour: Config.times[time].startHour });
        console.log('Time manually set:', time)
    });*/
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
