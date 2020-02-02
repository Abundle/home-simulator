import items from './utils/items.js';

const Cards = Object.keys(items.cardContents).map((category, index) => `
    <h1 id=${ category + '-' + index } class='mdc-typography--headline5 category-title'>${ category.replace('_', ' ') }</h1>
    
    ${ items.cardContents[category].map(item => `
        <div id='${ category }-${ item.id }' class='mdc-card mdc-card--outlined'>
            <a href=${ item.url } target='_blank'>
                <div class='mdc-card__primary-action' tabindex='0'>
                    <div class='mdc-card__media mdc-card__media--16-9' style='background-image: url(${ item.image });'>
                        <div class='mdc-card__media-content'>
                            <div class='mdc-card__primary'>
                                <h2 class='mdc-card__title mdc-typography mdc-typography--headline6'>${ item.title }</h2>
                                <h3 class='mdc-card__subtitle mdc-typography mdc-typography--subtitle2'>From ${ item.subtitle }</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
            ${ item.content === '' ? '' : `<div class='mdc-card__secondary mdc-typography mdc-typography--body2'>${ item.content }</div>`}
            <div class='mdc-card__actions mdc-card__actions--full-bleed'>
                <button class='mdc-button mdc-card__action mdc-card__action--button'>
                    <span class='mdc-button__label'><span id='${ item.name }' class='mdc-button__ripple'></span>Select item</span>
                    <i class='material-icons' aria-hidden='true'>${ item.icon }</i>
                </button>
            </div>
        </div>
    `).join('') }
`).join('');

export default Cards;
