<script lang="ts">
	import HomeContent from '$lib/components/HomeContent.svelte';
</script>

<svelte:head>
	<title>Produktworld — Informations</title>
	<meta
		name="description"
		content="Produktworld · Informations pratiques · 4–6 septembre 2026 · New City Gas, Montréal."
	/>
</svelte:head>

<!--
	Same page, same content (HomeContent) — visiting /information just makes
	+layout.svelte auto-scroll down to the #information section once the
	preloader finishes. See +layout.svelte for that logic.
-->
<HomeContent />