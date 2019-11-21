import { gsap, Power4, ScrollToPlugin } from 'gsap/all';
import { MDCDrawer } from '@material/drawer';
import { panView } from './Scene';

gsap.registerPlugin(ScrollToPlugin);

const container = document.querySelector('.mdc-drawer__content');
const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));

export const createCategoryButton = (categoryName, iconName, index) => {
    return `<button id=${ categoryName + '-' + index }
                    class='category-button mdc-icon-button'
                    aria-label=${ categoryName }
                    aria-hidden='true'
                    aria-pressed='false'
            >
                <i class='material-icons mdc-icon-button__icon mdc-icon-button__icon--on'>favorite</i>
                <i class='material-icons mdc-icon-button__icon'>favorite_border</i>
            </button>`;
};

export const toggleDrawer = () => {
    const distance = drawer.open ? -1.5 : 1.5;
    panView(distance);
    drawer.open = !drawer.open;
};

export const setDrawer = open => {
    drawer.open = open;
};

export const getDrawer = () => {
    return drawer.open;
};

export const scrollToCategory = id => {
    const categoryName = id.split('-')[0];
    const offset = document.getElementById(categoryName).offsetTop;

    animateContainer(offset);
};

export const scrollToItem = item => {
    const offset = document.getElementById(item).offsetTop;

    animateContainer(offset);
};

const animateContainer = offset => {
    gsap.to(container, 1.25, {
        delay: 0.2,
        ease: Power4.easeInOut,
        scrollTo: offset - 12
    });
};
