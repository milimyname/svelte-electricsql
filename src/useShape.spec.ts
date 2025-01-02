import { render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it, beforeEach } from 'vitest';
import { setTimeout as sleep } from 'node:timers/promises';
import ShapeTestComponent from '$lib/svelte-test-component.svelte';
import '@testing-library/jest-dom';

const BASE_URL = 'http://localhost:3000/v1/shape';

describe('useShape', () => {
	let aborter: AbortController;
	let fooTable: string;

	beforeEach(() => {
		aborter = new AbortController();
		fooTable = 'foo';
	});

	it('should handle empty shape data', async () => {
		render(ShapeTestComponent, {
			props: {
				options: {
					url: BASE_URL,
					params: {
						table: fooTable
					},
					signal: aborter.signal,
					subscribe: false
				}
			}
		});

		// Initial loading state
		expect(screen.getByTestId('loading')).toHaveTextContent('true');

		// // Wait for data to load
		// await waitFor(() => {
		// 	expect(screen.getByTestId('loading')).toHaveTextContent('false');
		// });

		expect(screen.getByTestId('data')).toHaveTextContent('[]');
	});

	// it('should handle data with selector', async () => {
	// 	const mockData = [
	// 		{ id: 1, title: 'Test 1' },
	// 		{ id: 2, title: 'Test 2' }
	// 	];

	// 	// Mock the shape stream/data
	// 	vi.mocked(getShape).mockReturnValue({
	// 		currentRows: mockData,
	// 		error: false,
	// 		stream: {},
	// 		isLoading: () => false,
	// 		lastSyncedAt: () => Date.now(),
	// 		subscribe: (callback) => {
	// 			callback();
	// 			return () => {};
	// 		}
	// 	});

	// 	const selector = (data) => ({
	// 		...data,
	// 		data: data.data.filter((item) => item.id === 1)
	// 	});

	// 	render(ShapeTestComponent, {
	// 		props: {
	// 			options: {
	// 				url: BASE_URL,
	// 				params: {
	// 					table: fooTable
	// 				},
	// 				signal: aborter.signal,
	// 				subscribe: true,
	// 				selector
	// 			}
	// 		}
	// 	});

	// 	await waitFor(() => {
	// 		const dataElement = screen.getByTestId('data');
	// 		const parsedData = JSON.parse(dataElement.textContent || '[]');
	// 		expect(parsedData).toHaveLength(1);
	// 		expect(parsedData[0].id).toBe(1);
	// 	});
	// });

	it('should handle loading state changes', async () => {
		render(ShapeTestComponent, {
			props: {
				options: {
					url: BASE_URL,
					params: {
						table: fooTable
					},
					fetchClient: async (input, init) => {
						await sleep(50);
						return fetch(input, init);
					}
				}
			}
		});

		// Check initial loading state
		expect(screen.getByTestId('loading')).toHaveTextContent('true');

		// Wait for loading to complete
		await waitFor(
			() => {
				expect(screen.getByTestId('loading')).toHaveTextContent('false');
			},
			{ timeout: 1000 }
		);
	});

	// it('should handle errors', async () => {
	// 	render(ShapeTestComponent, {
	// 		props: {
	// 			options: {
	// 				url: BASE_URL,
	// 				params: {
	// 					table: fooTable
	// 				},
	// 				signal: aborter.signal,
	// 				fetchClient: async (input, init) => {
	// 					await sleep(50);
	// 					return fetch(input, init);
	// 				}
	// 			}
	// 		}
	// 	});

	// 	await waitFor(() => {
	// 		expect(screen.getByTestId('error')).not.toHaveTextContent('false');
	// 	});
	// });

	// it('should update when data changes', async () => {
	// 	const initialData = [{ id: 1, title: 'Initial' }];
	// 	const updatedData = [...initialData, { id: 2, title: 'Updated' }];

	// 	let currentData = initialData;
	// 	const mockShape = {
	// 		subscribe: (callback) => {
	// 			callback();
	// 			return () => {};
	// 		},
	// 		data: currentData,
	// 		isLoading: false,
	// 		error: false
	// 	};

	// 	vi.mock('@electric-sql/client', () => ({
	// 		getShapeStream: () => mockShape
	// 	}));

	// 	const { rerender } = render(ShapeTestComponent, {
	// 		props: {
	// 			options: {
	// 				url: BASE_URL,
	// 				params: {
	// 					table: fooTable
	// 				},
	// 				signal: aborter.signal,
	// 				subscribe: true
	// 			}
	// 		}
	// 	});

	// 	// Verify initial data
	// 	await waitFor(() => {
	// 		const dataElement = screen.getByTestId('data');
	// 		expect(dataElement).toHaveTextContent(JSON.stringify(initialData));
	// 	});

	// 	// Update data and rerender
	// 	currentData = updatedData;
	// 	rerender();

	// 	// Verify updated data
	// 	await waitFor(() => {
	// 		const dataElement = screen.getByTestId('data');
	// 		expect(dataElement).toHaveTextContent(JSON.stringify(updatedData));
	// 	});
	// });
});
