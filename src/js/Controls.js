import Config from './utils/Config';

// TODO: add circular control + reset button
const TimeToggle = `
    <div class='time-toggle'>
        <label for='radio-day' id='label-day'>
            <i class='material-icons mdc-button__icon' aria-hidden='true'>wb_sunny</i>
        </label>
        <input type='radio' value='day' name='radio-time-toggle' id='radio-day'>
        
        <label for='radio-twilight' id='label-twilight'>
            <i class='material-icons mdc-button__icon' aria-hidden='true'>wb_twilight</i>
        </label>
        <input type='radio' value='twilight' name='radio-time-toggle' id='radio-twilight'>
        
        <label for='radio-night' id='label-night'>
            <i class='material-icons mdc-button__icon' aria-hidden='true'>nights_stay</i>
        </label>
        <input type='radio' value='night' name='radio-time-toggle' id='radio-night'>
        
        <div class='toggle'></div>
    </div>
`;

const Controls = `
    <div class='button-container'>
    ${ Config.controls.map(view => `
        <button class='${ view }-view-button mdc-button mdc-button--outlined'>
            <span class='mdc-button__ripple'></span>
            <span class='mdc-button__label'>${ view }</span>
        </button>
    `).join('') }
    </div>    
    
    <ul class='mdc-list mdc-list--two-line' role='group' aria-label='List with control items'>
        <li class='mdc-list-item' role='checkbox' aria-checked=${ Config.isMobile } tabindex='0'>
            <span class='mdc-list-item__ripple'></span>
            <span class='mdc-list-item__graphic'>
                <div class='lite-mode-checkbox mdc-checkbox'>
                    <input type='checkbox'
                            class='mdc-checkbox__native-control'
                            id='demo-list-checkbox-item-2' />
                    <div class='mdc-checkbox__background'>
                      <svg class='mdc-checkbox__checkmark'
                            viewBox='0 0 24 24'>
                        <path class='mdc-checkbox__checkmark-path'
                              fill='none'
                              d='M1.73,12.91 8.1,19.28 22.79,4.59'/>
                      </svg>
                      <div class='mdc-checkbox__mixedmark'></div>
                    </div>
                  </div>
            </span>
            <label class='mdc-list-item__text' for='demo-list-checkbox-item-1'>
              <span class='mdc-list-item__primary-text'>Lite mode</span>
              <span class='mdc-list-item__secondary-text'>Makes things run smoother</span>
            </label>
        </li>
      <li class='mdc-list-item' role='checkbox' aria-checked=${ Config.isDev }>
        <span class='mdc-list-item__ripple'></span>
        <span class='mdc-list-item__graphic'>
          <div class='performance-monitor-checkbox mdc-checkbox'>
            <input type='checkbox'
                    class='mdc-checkbox__native-control'
                    id='demo-list-checkbox-item-1' />
            <div class='mdc-checkbox__background'>
              <svg class='mdc-checkbox__checkmark'
                    viewBox='0 0 24 24'>
                <path class='mdc-checkbox__checkmark-path'
                      fill='none'
                      d='M1.73,12.91 8.1,19.28 22.79,4.59'/>
              </svg>
              <div class='mdc-checkbox__mixedmark'></div>
            </div>
          </div>
        </span>
        <label class='mdc-list-item__text' for='demo-list-checkbox-item-1'>
          <span class='mdc-list-item__primary-text'>Performance monitor</span>
          <span class='mdc-list-item__secondary-text'>Display FPS and memory usage</span>
        </label>
      </li>
    </ul>
    
    ${ TimeToggle }
`;

export default Controls;
