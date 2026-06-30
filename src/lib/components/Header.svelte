<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from '$lib/gsap';
    import { introComplete } from '$lib/intro';
    import logo from '$lib/assets/PW_Logo.png';
  
    let el = $state<HTMLElement>();
    onMount(() =>
      introComplete.subscribe((v) => {
        if (v && el)
          gsap.fromTo(el, { autoAlpha: 0, y: -20 },
            { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.25 });
      })
    );
  </script>
  
  <header bind:this={el} style="opacity:0"
    class="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-5 md:px-8 py-4">
    <a href="#top" class="block w-28 md:w-36"><img src={logo} alt="Produktworld" class="w-full" /></a>
    <nav class="hidden sm:flex items-center gap-7 text-xs tracking-[0.22em] uppercase">
      <a href="#signup" class="hover:text-lightaccent transition-colors">Lineup</a>
      <a href="#signup" class="hover:text-lightaccent transition-colors">Billets</a>
    </nav>
    <a href="#signup"
      class="sm:hidden text-xs tracking-[0.2em] uppercase border border-beige/40 px-3 py-1 rounded-full">
      Billets
    </a>
  </header>