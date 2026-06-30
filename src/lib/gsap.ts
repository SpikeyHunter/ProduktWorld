import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { browser } from '$app/environment';

// Import premium plugins from your local folder instead of the public NPM registry
import { SplitText } from './gsap-bonus/SplitText.js';
import { DrawSVGPlugin } from './gsap-bonus/DrawSVGPlugin.js';
import { ScrambleTextPlugin } from './gsap-bonus/ScrambleTextPlugin.js';

if (browser) {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin);
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin };