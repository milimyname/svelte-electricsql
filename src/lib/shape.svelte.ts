import {
	Shape,
	ShapeStream,
	type ShapeStreamOptions,
	type Row,
	type GetExtensions
} from '@electric-sql/client';

type UnknownShape = Shape<Row<unknown>>;
type UnknownShapeStream = ShapeStream<Row<unknown>>;

const streamCache = new Map<string, UnknownShapeStream>();
const shapeCache = new Map<UnknownShapeStream, UnknownShape>();

export async function preloadShape<T extends Row<unknown> = Row>(
	options: ShapeStreamOptions<GetExtensions<T>>
): Promise<Shape<T>> {
	const shapeStream = getShapeStream<T>(options);
	const shape = getShape<T>(shapeStream);
	await shape.rows;
	return shape;
}

function sortObjectKeys(obj: unknown): unknown {
	if (typeof obj !== 'object' || obj === null) return obj;
	if (Array.isArray(obj)) return obj.map(sortObjectKeys);

	return Object.keys(obj)
		.sort()
		.reduce<Record<string, unknown>>((sorted, key) => {
			sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
			return sorted;
		}, {});
}

export function sortedOptionsHash<T>(options: ShapeStreamOptions<T>): string {
	return JSON.stringify(sortObjectKeys(options));
}

export function getShapeStream<T extends Row<unknown>>(
	options: ShapeStreamOptions<GetExtensions<T>>
): ShapeStream<T> {
	const shapeHash = sortedOptionsHash(options);

	if (streamCache.has(shapeHash)) {
		const stream = streamCache.get(shapeHash)! as ShapeStream<T>;
		if (!stream.options.signal?.aborted) {
			return stream;
		}
		streamCache.delete(shapeHash);
		shapeCache.delete(stream);
	}

	const newShapeStream = new ShapeStream<T>(options);
	streamCache.set(shapeHash, newShapeStream);
	return newShapeStream;
}

export function getShape<T extends Row<unknown>>(shapeStream: ShapeStream<T>): Shape<T> {
	if (shapeCache.has(shapeStream)) {
		if (!shapeStream.options.signal?.aborted) {
			return shapeCache.get(shapeStream)! as Shape<T>;
		}
		streamCache.delete(sortedOptionsHash(shapeStream.options));
		shapeCache.delete(shapeStream);
	}

	const newShape = new Shape<T>(shapeStream);
	shapeCache.set(shapeStream, newShape);
	return newShape;
}

export interface UseShapeResult<T extends Row<unknown> = Row> {
	/** The array of rows that make up the Shape. */
	data: T[];
	/** The Shape instance used by this useShape */
	shape: Shape<T>;
	/** The ShapeStream instance used by this Shape */
	stream: ShapeStream<T>;
	/** True during initial fetch. False afterward. */
	isLoading: boolean;
	/** Unix time at which we last synced. Undefined when `isLoading` is true. */
	lastSyncedAt?: number;
	error: Shape<T>['error'];
	isError: boolean;
}

export interface UseShapeOptions<SourceData extends Row<unknown>, Selection>
	extends ShapeStreamOptions<GetExtensions<SourceData>> {
	selector?: (value: UseShapeResult<SourceData>) => Selection;
}

export function useShape<
	SourceData extends Row<unknown> = Row,
	Selection = UseShapeResult<SourceData>
>({
	selector = ((arg: UseShapeResult<SourceData>) => arg) as (
		arg: UseShapeResult<SourceData>
	) => Selection,
	...options
}: UseShapeOptions<SourceData, Selection>): Selection {
	const shapeStream = getShapeStream<SourceData>(options);
	const shape = getShape<SourceData>(shapeStream);
	const latestShapeData = $state(parseShapeData(shape));
	const selected = $state(selector(latestShapeData));

	$effect(() => {
		const unsubscribe = shape.subscribe(() => {
			Object.assign(latestShapeData, parseShapeData(shape));
			Object.assign(selected as object, selector(latestShapeData));
		});

		return () => unsubscribe();
	});

	return selected;
}

// Helper function to parse shape data
function parseShapeData<T extends Row<unknown>>(shape: Shape<T>): UseShapeResult<T> {
	return {
		data: shape.currentRows,
		isLoading: shape.isLoading(),
		lastSyncedAt: shape.lastSyncedAt(),
		isError: shape.error !== false,
		shape,
		stream: shape.stream as ShapeStream<T>,
		error: shape.error
	};
}
