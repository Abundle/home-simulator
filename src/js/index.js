import { MDCRipple } from '@material/ripple/index';

// Local import
import '../scss/main.scss';
import * as Scene from './Scene';

const ripple = new MDCRipple(document.querySelector('.mdc-button'));

Scene.init();
// Scene.animate();
