import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './button';
import Link from 'next/link'; // Import next/link
import '@testing-library/jest-dom';

// Mock cn utility if necessary, but often it's simple enough not to require mocking.
// vi.mock('@/lib/utils', () => ({
//   cn: (...args: any[]) => args.filter(Boolean).join(' '),
// }));

describe('Button Component', () => {
	it('renders a default button with children', () => {
		render(<Button>Click Me</Button>);
		const button = screen.getByRole('button', { name: /click me/i });
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent('Click Me');
		// expect(button).toHaveClass('bg-primary'); // Example check
	});

	// Test Variants - Explicitly list known variants
	const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const; // Use 'as const' for literal types

	variants.forEach((variant) => {
		// Use String() for template literal
		it(`renders correctly with variant "${String(variant)}"`, () => {
			// Pass the correct literal type
			render(<Button variant={variant}>Variant {String(variant)}</Button>);
			expect(
				screen.getByRole('button', { name: `Variant ${String(variant)}` })
			).toBeInTheDocument();
		});
	});

	// Test Sizes - Explicitly list known sizes
	const sizes = ['default', 'sm', 'lg', 'icon'] as const; // Use 'as const' for literal types

	sizes.forEach((size) => {
		// Use String() for template literal
		it(`renders correctly with size "${String(size)}"`, () => {
			// Icon size might not have text content
			const buttonText = size === 'icon' ? 'Icon' : `Size ${String(size)}`;
			// Pass the correct literal type
			render(<Button size={size}>{buttonText}</Button>);
			expect(screen.getByRole('button', { name: buttonText })).toBeInTheDocument();
		});
	});

	it('renders as child element when asChild prop is true', () => {
		render(
			<Button asChild variant="link" size="sm">
				<a href="/test">Child Link</a> {/* Use simple anchor instead of Link */}
			</Button>
		);
		// Should render the 'a' tag, not a 'button'
		const linkElement = screen.getByRole('link', { name: /child link/i });
		expect(linkElement).toBeInTheDocument();
		expect(linkElement.tagName).toBe('A');
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
		// Check if CVA classes are applied (example check)
		expect(linkElement).toHaveClass('text-primary'); // From link variant
		expect(linkElement).toHaveClass('h-9'); // From sm size
	});

	it('passes through standard HTML button attributes', () => {
		render(
			<Button type="submit" aria-label="Submit Form">
				Submit
			</Button>
		);
		const button = screen.getByRole('button', { name: /submit/i });
		expect(button).toHaveAttribute('type', 'submit');
		expect(button).toHaveAttribute('aria-label', 'Submit Form');
	});

	it('handles disabled state', () => {
		const handleClick = vi.fn();
		render(
			<Button disabled onClick={handleClick}>
				Disabled
			</Button>
		);
		const button = screen.getByRole('button', { name: /disabled/i });
		expect(button).toBeDisabled();
		expect(button).toHaveAttribute('disabled');
		fireEvent.click(button);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it('calls onClick handler when clicked', () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Clickable</Button>);
		const button = screen.getByRole('button', { name: /clickable/i });
		expect(button).not.toBeDisabled();
		fireEvent.click(button);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('forwards ref correctly', () => {
		const ref = React.createRef<HTMLButtonElement>();
		render(<Button ref={ref}>Ref Button</Button>);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
		expect(ref.current).toHaveTextContent('Ref Button');
	});

	it('renders icon variant correctly', () => {
		render(
			<Button variant="outline" size="icon" aria-label="Settings">
				<span data-testid="icon-child">⚙️</span>
			</Button>
		);
		const button = screen.getByRole('button', { name: /settings/i });
		expect(button).toBeInTheDocument();
		expect(screen.getByTestId('icon-child')).toBeInTheDocument();
		expect(button).toHaveClass('h-10', 'w-10'); // Icon size classes
	});
});
