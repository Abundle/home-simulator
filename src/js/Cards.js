const Cards = contents => Object.keys(contents).map((category, index) => `
    <h1 id=${ category + '-' + index } class='mdc-typography--headline5 category-title'>${ category.replace('_', ' ') }</h1>
    
    ${ contents[category].content.map(item => `
        <div id='${ category }-${ item.id }' class='mdc-card mdc-card--outlined'>
            <a href=${ item.url } target='_blank'>
                <div class='mdc-card__primary-action'>
                    <div class='mdc-card__media mdc-card__media--16-9' style='background-image: url(${ item.image });'>
                        <div class='mdc-card__media-content'>
                            <div class='mdc-card__primary'>
                                <h2 class='mdc-card__title mdc-typography mdc-typography--headline6'>${ item.title }</h2>
                                <h3 class='mdc-card__subtitle mdc-typography mdc-typography--subtitle2'>${ item.subtitle }</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
            ${ item.text === '' ? '' : `<div class='mdc-card__secondary mdc-typography mdc-typography--body2'>${ item.text }</div>`}
            <div class='mdc-card__actions'>
                <div class='mdc-card__action-buttons'>
                    <button class='mdc-button mdc-card__action mdc-card__action--button'>
                      <div id='${ item.name }' class='mdc-button__ripple'></div>
                      <span class='mdc-button__label'>Focus on item</span>
                      <i class='material-icons mdc-button__icon' aria-hidden='true'>${ item.icon }</i>
                    </button>
                </div>
                <div class='mdc-card__action-icons'>
                    <a href=${ item.url } target='_blank'>
                        <button class='material-icons mdc-icon-button mdc-card__action mdc-card__action--icon' title='Go to link'>launch</button>
                    </a>
                </div>
            </div>
        </div>
    `).join('') }
`).join('');

export default Cards;
