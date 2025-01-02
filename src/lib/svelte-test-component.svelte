<script lang="ts">
	import { useShape, type UseShapeResult, type UseShapeOptions } from '$lib/shape.svelte';
	import type { Row } from '@electric-sql/client';

	type SourceData = Row<unknown>;
	type Selection = UseShapeResult<SourceData>;

	let {
		testId = 'shape-data',
		options
	}: {
		testId?: string;
		options: UseShapeOptions<Row<unknown>, Selection>;
	} = $props();

	const shape = useShape(options);
</script>

<div data-testid={testId}>
	<div data-testid="loading">{shape.isLoading}</div>
	<div data-testid="error">{shape.isError}</div>
	<div data-testid="error-message">{JSON.stringify(shape.error)}</div>
	<div data-testid="data">{JSON.stringify(shape.data)}</div>
	<div data-testid="last-synced">{shape.lastSyncedAt}</div>
</div>
