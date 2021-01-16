import Config from './utils/Config';

const Levels = `
    <div class='mdc-form-field'>
    ${ Config.levels.map((level, index) => {
        const i = index + 1;
        
        return `
            <div class='mdc-radio mdc-radio--touch'>
                <input class='mdc-radio__native-control' 
                       type='radio' 
                       id='radio-${ i }' 
                       name='radio-levels' 
                       value=${ i } 
                       ${ i === Config.levels.length ? 'checked' : ''}
                       >
                <div class='mdc-radio__background'>
                    <div class='mdc-radio__outer-circle'></div>
                    <div class='mdc-radio__inner-circle'></div>
                </div>
                <div class='mdc-radio__ripple'></div>
            </div>
            <label for='radio-${ i }'>${ level }</label>
        `;
    }).join('') }
`;

export default Levels;

