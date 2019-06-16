// import { categoryIcons } from './items.js';

export let createCategoryButton = (iconName, index) => {
    return `<button id=${ 'category-' + index }
                    class='mdc-icon-button'
                    aria-label=${ 'Category ' + index }
                    aria-hidden='true'
                    aria-pressed='false'>
                <i class='material-icons mdc-icon-button__icon mdc-icon-button__icon--on'>favorite</i>
                <i class='material-icons mdc-icon-button__icon'>favorite_border</i>
            </button>`;
};

/*export let createCategoryButton = (iconName, index) => {
    return `
        <button id=${ 'category-' + index } class='mdc-icon-button material-icons'>
            ${ iconName }
        </button>
    `;
};*/

/*export const CategoryIcons = Object.keys(categoryIcons).map((icon, index) => `
        <button id=${ 'category-' + index } class='mdc-icon-button material-icons'>
            ${ categoryIcons[icon] }
        </button>
    `).join('');*/

/*export const CategoryIcons = Object.keys(categoryIcons).map((icon, index) => `
        <button id=${ 'category-' + index }
                class='mdc-icon-button'
                aria-label='Add to favorites'
                aria-hidden='true'
                aria-pressed='false'>
            <i class='material-icons mdc-icon-button__icon mdc-icon-button__icon--on'>kitchen</i>
            <i class='material-icons mdc-icon-button__icon'>kitchen_border</i>
        </button>
    `).join('');*/
