import items from './items.js';

// TODO: instead of require, checkout https://medium.com/@godban/loading-static-and-dynamic-images-with-webpack-8a933e82cb1e & file-loader
const Cards = Object.keys(items).map((category, index) => `
    <h1 id=${ category + '-' + index } class='mdc-typography--headline5 category-title'>${ category.replace('_', ' ') }</h1>
    ${ items[category].map(item => `
        <div id='${ category }-${ item.id }' class='mdc-card'>
            <div class='mdc-card__primary-action' tabindex='0'>
                <div class='mdc-card__media mdc-card__media--16-9' style='background-image: url(${ require('../../assets/img/' + item.image) });'>
                    <div class='mdc-card__media-content'>
                        <div class='mdc-card__primary'>
                            <h2 class='mdc-card__title mdc-typography mdc-typography--headline6'>${ item.title }</h2>
                            <h3 class='mdc-card__subtitle mdc-typography mdc-typography--subtitle2'>${ item.subtitle }</h3>
                        </div>
                    </div>
                </div>
                <div class='mdc-card__secondary mdc-typography mdc-typography--body2'>${ item.content }</div>
            </div>
            <div class='mdc-card__actions'>
                <div class='mdc-card__action-buttons'>
                    <button class='mdc-button mdc-card__action mdc-card__action--button'>Read</button>
                    <button class='mdc-button mdc-card__action mdc-card__action--button'>Bookmark</button>
                </div>
                <div class='mdc-card__action-icons'>
                    <button class='mdc-icon-button mdc-card__action mdc-card__action--icon--unbounded' aria-pressed='false' aria-label='Add to favorites' title='Add to favorites'>
                        <i class='material-icons mdc-icon-button__icon mdc-icon-button__icon--on'>favorite</i>
                        <i class='material-icons mdc-icon-button__icon'>favorite_border</i>
                    </button>
                    <button class='mdc-icon-button material-icons mdc-card__action mdc-card__action--icon--unbounded' title='Share' data-mdc-ripple-is-unbounded='true'>share</button>
                    <button class='mdc-icon-button material-icons mdc-card__action mdc-card__action--icon--unbounded' title='More options' data-mdc-ripple-is-unbounded='true'>more_vert</button>
                </div>
            </div>
        </div>
    `).join('') }
`).join('');

export default Cards;
