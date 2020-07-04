import { gsap, Power4, ScrollToPlugin } from 'gsap/all';
import { MDCDrawer } from '@material/drawer';

// let isScrolling = false;

// TODO: implement with multiple images for one item (drawer expands and shows multiple cards?)
const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
const container = document.querySelector('.mdc-drawer__content');

gsap.registerPlugin(ScrollToPlugin);

const createCategoryButton = (categoryName, iconName, index) => {
    return `<li id=${ categoryName + '-' + index }  
                class='mdc-list-item'
                aria-label=${ categoryName }
                role='option' 
                >
                <span class='mdc-list-item__graphic material-icons' aria-hidden='true'>${ iconName }</span>
                <span class='mdc-list-item__text'>${ categoryName.replace('_', ' ') }</span>
            </li>`;
};

const getDrawer = () => {
    return drawer.open;
};

const setDrawer = open => {
    drawer.open = open;
    console.log(drawer.open, open);
};

const scrollToCategory = id => {
    const offset = document.getElementById(id).offsetTop;

    animateContainer(offset);
};

const scrollToItem = item => {
    const offset = document.getElementById(item).offsetTop;

    animateContainer(offset);
};

const animateContainer = offset => {
    gsap.to(container, {
        duration: 1,
        delay: 0.2,
        ease: Power4.easeInOut,
        scrollTo: offset - 12,
        /*onUpdate: () => {
            setScrolling(true);
        },
        onComplete: () => {
            setScrolling(false);
        }*/
    });
};

/*const getScrolling = () => { return isScrolling; };
const setScrolling = bool => { isScrolling = bool; };*/

export default {
    createCategoryButton,
    getDrawer,
    setDrawer,
    scrollToCategory,
    scrollToItem,
    // getScrolling,
};

