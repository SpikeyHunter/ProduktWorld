<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import Hero from '$lib/components/Hero.svelte';
    import Signup from '$lib/components/Signup.svelte';
    import Footer from '$lib/components/Footer.svelte';
  </script>
  
  <svelte:head>
    <title>Produktworld — Festival Musique + Arts</title>
    <meta name="description" content="Produktworld · 5–7 septembre 2026 · New City Gas, Montréal." />
  </svelte:head>
  
  <Header />
  <main>
    <Hero />
    <Signup />
    <Footer />
  </main>