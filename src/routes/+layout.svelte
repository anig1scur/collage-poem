<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';

  let {children} = $props();
</script>

<svelte:head>
	<link rel="icon" href="{favicon}" />
  <title>Collage Poem Maker</title>
</svelte:head>

{@render children?.()}
