import { gsap } from 'gsap';
import { ScrollTrigger }    from 'gsap/ScrollTrigger';
import { SplitText }        from 'gsap/SplitText';
import { DrawSVGPlugin }    from 'gsap/DrawSVGPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { browser } from '$app/environment';

if (browser) {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin);
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin };