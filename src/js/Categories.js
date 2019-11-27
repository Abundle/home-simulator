import { gsap, Power4, ScrollToPlugin } from 'gsap/all';
import { MDCDrawer } from '@material/drawer';
import Scene from './Scene';

gsap.registerPlugin(ScrollToPlugin);

const container = document.querySelector('.mdc-drawer__content');
const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));

const createCategoryButton = (categoryName, iconName, index) => {
    return `<button id=${ categoryName + '-' + index }
                    class='category-button mdc-icon-button'
                    aria-label=${ categoryName }
                    aria-hidden='true'
                    aria-pressed='false'
            >
                <i class='material-icons mdc-icon-button__icon mdc-icon-button__icon--on'>info</i>
                <i class='material-icons mdc-icon-button__icon'>${ iconName }_border</i>
            </button>`;
};

const toggleDrawer = () => {
    const distance = getDrawer() ? -1.5 : 1.5;
    Scene.panView(distance);
    setDrawer(!drawer.open);
    // drawer.open = !drawer.open;
};

const getDrawer = () => {
    return drawer.open;
};

const setDrawer = open => {
    drawer.open = open;
};

const scrollToCategory = id => {
    const categoryName = id.split('-')[0];
    const offset = document.getElementById(categoryName).offsetTop;

    animateContainer(offset);
};

const scrollToItem = item => {
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

export default {
    createCategoryButton,
    toggleDrawer,
    getDrawer,
    setDrawer,
    scrollToCategory,
    scrollToItem,
};

