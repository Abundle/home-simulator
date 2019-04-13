// Local import
import '../scss/main.scss';
import * as Scene from './Scene';
// import Scene from './Scene';

// Node modules import
import { MDCRipple } from '@material/ripple/index';

const ripple = new MDCRipple(document.querySelector('.mdc-button'));

Scene.init();
// Scene.animate();