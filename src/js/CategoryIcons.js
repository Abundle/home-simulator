import { TweenLite, Power4 } from 'gsap/all';

const container = document.querySelector('.mdc-drawer__content');

export let createCategoryButton = (categoryName, iconName, index) => { // id=${ categoryName + '-' + index }
    return `<button id=${ categoryName + '-' + index }
                    class='mdc-icon-button'
                    aria-label=${ categoryName }
                    aria-hidden='true'
                    aria-pressed='false'
            >
                <i class='material-icons mdc-icon-button__icon mdc-icon-button__icon--on'>favorite</i>
                <i class='material-icons mdc-icon-button__icon'>favorite_border</i>
            </button>`;
};

export let scrollToCategory = category => {
    let id = category.split('-')[0];
    let offset = document.getElementById(id).offsetTop;

    TweenLite.to(container, 1.25, {
        delay: 0.2,
        ease: Power4.easeInOut,
        scrollTo: offset - 12
    });
};
