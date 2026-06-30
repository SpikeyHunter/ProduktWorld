<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from '$lib/gsap';
  
    let pin: HTMLDivElement, word: HTMLHeadingElement, wipe: HTMLDivElement, cta: HTMLDivElement;
  
    onMount(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(wipe, { scaleY: 1 }); gsap.set(word, { autoAlpha: 0 }); gsap.set(cta, { autoAlpha: 1 });
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: { trigger: pin, start: 'top top', end: '+=140%', scrub: true, pin: true }
      });
      tl.to(word, { scale: 1.6, ease: 'none' })
        .to(wipe, { scaleY: 1, ease: 'power2.inOut' }, 0.15)
        .to(word, { color: '#0D0706', duration: 0.2 }, 0.32)   // word flips dark as red floods in
        .to(word, { autoAlpha: 0, scale: 2.1, ease: 'power2.in' }, 0.55)
        .to(cta,  { autoAlpha: 1, ease: 'power2.out' }, 0.6);
      return () => tl.scrollTrigger?.kill();
    });
  </script>
  
  <section id="signup">
    <div bind:this={pin} class="relative h-[100svh] overflow-hidden flex items-center justify-center">
      <div bind:this={wipe} class="absolute inset-0 -z-10"
        style="background: var(--color-lightred); transform: scaleY(0); transform-origin: bottom;"></div>
  
      <h2 bind:this={word} class="font-display font-black text-beige text-center select-none"
        style="font-size: clamp(3rem, 18vw, 16rem);">ENTREZ</h2>
  
      <div bind:this={cta} style="opacity:0"
        class="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <h3 class="font-display font-black text-darkaccent" style="font-size: clamp(2rem, 8vw, 5rem);">
          Rejoignez le cirque
        </h3>
        <p class="max-w-md text-darkaccent/80">
          Trois jours. Musique + arts. New City Gas. Inscrivez-vous pour l’accès prioritaire aux billets.
        </p>
        <a href="https://your-signup-link.com" target="_blank" rel="noopener"
          class="group inline-flex items-center gap-2 rounded-full bg-darkaccent px-8 py-4
                 text-beige uppercase tracking-[0.2em] text-sm transition-transform hover:scale-105">
          S’inscrire <span class="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>
    </div>
  </section>