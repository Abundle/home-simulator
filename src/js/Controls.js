import items from './utils/items';

const Controls = `
    ${ items.controls.map(view => `
        <button class='${ view }-view-button mdc-button mdc-button--outlined'>
            <span class='mdc-button__ripple'></span>
            <span class='mdc-button__label'>${ view } View</span>
        </button>
    `).join('') }    
    
    <div class='mdc-form-field'>
            <div class='mdc-checkbox'>
                <input type='checkbox'
                       class='mdc-checkbox__native-control'
                       id='checkbox-1'/>
                <div class='mdc-checkbox__background'>
                    <svg class='mdc-checkbox__checkmark'
                       viewBox='0 0 24 24'>
                        <path class='mdc-checkbox__checkmark-path'
                              fill='none'
                              d='M1.73,12.91 8.1,19.28 22.79,4.59'/>
                    </svg>
                    <div class='mdc-checkbox__mixedmark'></div>
                </div>
                <div class='mdc-checkbox__ripple'></div>
            </div>
        <label for='checkbox-1'>Show Performance Monitor</label>
    </div>
`;

export default Controls;
