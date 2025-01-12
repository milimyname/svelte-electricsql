# Svelte integration for ElectricSQL

Electric is Postgres sync for modern apps.

Electric provides an HTTP interface to Postgres to enable massive number of clients to query and get real-time updates to data in "shapes" i.e. subsets of the database. Electric turns Postgres into a real-time database.

This packages exposes a `useShape` hook for pulling shape data into your Svelte components.

`Shapes` and `ShapeStreams` instances are cached globally so re-using shapes in multiple components is cheap.

## Install

`npm i svelte-electricsql`

## How to use

> [!WARNING]  
> Do not destructure the shape object returned by `useShape`. The shape object is reactive and will not update if destructured.

```svelte
<script>
	import { useShape } from 'svelte-electricsql';

	const shape = useShape({
		url: `http://localhost:3000/v1/shape`,
		params: {
			table: 'foo'
		}
	});
</script>

{#if shape.loading}
	<p>Loading...</p>
{:else}
	<ul>
		{#each shape.data as item, i}
			<li>{i + 1}: {item.name}</li>
		{/each}
	</ul>
{/if}
```

## Links

[Npm package](https://www.npmjs.com/package/svelte-electricsql)
