<script lang="ts">
	import { useShape } from '$lib/shape.svelte';

	const shape = useShape({
		url: `http://localhost:3000/v1/shape`,
		params: {
			table: 'foo'
		}
	});
</script>

{#if shape.isLoading}
	<p>Loading...</p>
{:else}
	{#each shape.data as item, i}
		<div style="display: flex; gap: 10px">
			<p>{i}</p>
			<p>{item.name}</p>
		</div>
	{/each}
{/if}
