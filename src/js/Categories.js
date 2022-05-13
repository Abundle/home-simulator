import { gsap, ScrollToPlugin } from 'gsap/all';
import { MDCDrawer } from '@material/drawer';

const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
const drawerContainer = document.querySelector('.mdc-drawer__content');

gsap.registerPlugin(ScrollToPlugin);

const createCategoryButton = (categoryName, iconName, index) => {
    return `<li id=${ categoryName + '-' + index }  
                class='mdc-deprecated-list-item'
                aria-label=${ categoryName }
                role='option' 
                >
                <span class='mdc-deprecated-list-item__graphic material-icons' aria-hidden='true'>${ iconName }</span>
                <span class='mdc-deprecated-list-item__text'>${ categoryName.replace('_', ' ') }</span>
            </li>`;
};

const getDrawerState = () => { return drawer.open; };
const setDrawerState = open => { drawer.open = open; };

const scrollTo = id => {
    const offset = document.getElementById(id).offsetTop;
    animateContainer(offset);
};

const animateContainer = offset => {
    gsap.to(drawerContainer, {
        duration: 1,
        delay: 0.2,
        ease: 'power4.inOut',
        scrollTo: offset - 12,
    });
};

export default {
    createCategoryButton,
    getDrawerState,
    setDrawerState,
    scrollTo,
    // getScrolling,
};

