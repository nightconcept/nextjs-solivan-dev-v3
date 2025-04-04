import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './tests/setup.ts',
		// Exclude Playwright spec files
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'**/cypress/**',
			'**/.{idea,git,cache,output,temp}/**',
			'**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
			'**/*.spec.ts' // Exclude Playwright tests
		],
		// Add this coverage section
		coverage: {
			provider: 'v8', // Specify v8 provider
			reporter: ['text', 'lcov'], // Add 'lcov' for Coveralls
			reportsDirectory: './coverage', // Standard directory for reports
			// Define files to include in coverage analysis
			include: ['src/**/*.{ts,tsx}'],
			// Define files to exclude from coverage analysis
			exclude: [
				'src/**/*.test.{ts,tsx}', // Exclude test files
				'src/components/ui/**', // Example: Exclude UI library components if not testing directly
				'src/lib/metadata.config.ts', // Example: Exclude config files
				'src/app/**', // Exclude Next.js app directory files if mainly testing libs/components
				'src/content/**', // Exclude markdown content
				'src/styles/**', // Exclude CSS
				'src/templates/**', // Exclude templates
				'src/hooks/**', // Potentially exclude simple hooks if desired
				'**/node_modules/**',
				'**/dist/**',
				'**/.*/**', // Exclude hidden files/folders
				'**/*.config.*', // Exclude config files
				'**/main.tsx', // Example: Exclude entry points if necessary
				'tests/**' // Exclude test setup files
			],
			all: true // Ensure uncovered files are included in the report (set thresholds later if needed)
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src') // Point alias to src directory
		}
	}
});
