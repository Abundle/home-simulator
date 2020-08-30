import items from './utils/items';

const Controls = `
    <div class="button-container">
    ${ items.controls.map(view => `
        <button class='${ view }-view-button mdc-button mdc-button--outlined'>
            <span class='mdc-button__ripple'></span>
            <span class='mdc-button__label'>${ view }</span>
        </button>
    `).join('') }
    </div>    
    
    <ul class="mdc-list mdc-list--two-line" role="group" aria-label="List with control items">
        <li class="mdc-list-item" role="checkbox" aria-checked="true" tabindex="0">
            <span class="mdc-list-item__ripple"></span>
            <span class="mdc-list-item__graphic">
                <div class="lite-mode-checkbox mdc-checkbox">
                    <input type="checkbox"
                            class="mdc-checkbox__native-control"
                            id="demo-list-checkbox-item-2"
                            checked />
                    <div class="mdc-checkbox__background">
                      <svg class="mdc-checkbox__checkmark"
                            viewBox="0 0 24 24">
                        <path class="mdc-checkbox__checkmark-path"
                              fill="none"
                              d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                      </svg>
                      <div class="mdc-checkbox__mixedmark"></div>
                    </div>
                  </div>
            </span>
            <label class="mdc-list-item__text" for="demo-list-checkbox-item-1">
              <span class="mdc-list-item__primary-text">Lite mode</span>
              <span class="mdc-list-item__secondary-text">Low-impact performance</span>
            </label>
        </li>
      <li class="mdc-list-item" role="checkbox" aria-checked="false">
        <span class="mdc-list-item__ripple"></span>
        <span class="mdc-list-item__graphic">
          <div class="performance-monitor-checkbox mdc-checkbox">
            <input type="checkbox"
                    class="mdc-checkbox__native-control"
                    id="demo-list-checkbox-item-1"  />
            <div class="mdc-checkbox__background">
              <svg class="mdc-checkbox__checkmark"
                    viewBox="0 0 24 24">
                <path class="mdc-checkbox__checkmark-path"
                      fill="none"
                      d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
              </svg>
              <div class="mdc-checkbox__mixedmark"></div>
            </div>
          </div>
        </span>
        <label class="mdc-list-item__text" for="demo-list-checkbox-item-1">
          <span class="mdc-list-item__primary-text">Performance monitor</span>
          <span class="mdc-list-item__secondary-text">Display FPS and memory usage</span>
        </label>
      </li>
    </ul>
`;

export default Controls;
