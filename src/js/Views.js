const views = [
    'Basement',
    'Ground floor',
    'Upper floor',
    'House'
];

const Views = `
    <div class='mdc-form-field'>
    ${ views.map((view, index) => {
        const i = index + 1;
        
        return `
            <div class='mdc-radio'>
                <input class='mdc-radio__native-control' 
                       type='radio' 
                       id='radio-${ i }' 
                       name='radios' 
                       value=${ i } ${ i === views.length ? 'checked' : ''}
                       >
                <div class='mdc-radio__background'>
                    <div class='mdc-radio__outer-circle'></div>
                    <div class='mdc-radio__inner-circle'></div>
                </div>
            </div>
            <label for='radio-${ i }'>${ view }</label>
        `;
    }).join('') }
`;

export default Views;

