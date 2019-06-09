import { items } from './items.js';

export let Cards = /*language=HTML*/`
    ${ items.map((item) => `
         <div class='mdc-card demo-card demo-basic-with-text-over-media'>
            <div class='mdc-card__primary-action demo-card__primary-action' tabindex='0'> 
                <div class='mdc-card__media mdc-card__media--16-9 demo-card__media' style='background-image: url(${ require('../assets/img/' + item.image) });'>
                    <div class='mdc-card__media-content'>
                        <div class='mdc-card__primary'>
                            <h2 class='mdc-card__title mdc-typography mdc-typography--headline6'>${ item.title }</h2>
                            <h3 class='mdc-card__subtitle mdc-typography mdc-typography--subtitle2'>${ item.subtitle }</h3>
                        </div>
                    </div>
                </div>
                <div class='mdc-card__secondary mdc-typography mdc-typography--body2'>Visit ten places on our planet that are undergoing the biggest changes today.</div>
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
    `).join('\n ') }
`;
