import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button, type ButtonProps } from './button';
import '@testing-library/jest-dom';
import Link from 'next/link';

/**
 * Test suite for the Button component.
 * Uses Vitest as the test runner and React Testing Library for rendering and interaction.
 */

describe('Button Component', () => {
	/**
	 * Test case: Renders a default button with provided children text.
	 * Verifies basic rendering and text content.
	 */
	it('renders a default button with children', () => {
		render(<Button>Click Me</Button>);
		// Find the button element by its accessible role and name (case-insensitive)
		const button = screen.getByRole('button', { name: /click me/i });
		// Assert that the button element is present in the rendered DOM
		expect(button).toBeInTheDocument();
		// Assert that the button displays the correct text content
		expect(button).toHaveTextContent('Click Me');
		// Optionally, you could check for specific default classes if needed:
		// expect(button).toHaveClass('bg-primary'); // Example check for default variant class
	});

	// Define the possible variants based on ButtonProps for parameterized testing
	// This ensures tests cover all visual styles defined in buttonVariants
	const variants: Array<ButtonProps['variant']> = [
		'default',
		'destructive',
		'outline',
		'secondary',
		'ghost',
		'link'
	];

	/**
	 * Test case: Iterates through each defined variant using `forEach`.
	 * Ensures the button renders correctly for each visual style variant.
	 */
	variants.forEach((variant) => {
		// Test description dynamically includes the variant being tested
		it(`renders correctly with variant "${variant}"`, () => {
			// Render the button with the current variant from the loop
			render(<Button variant={variant}>Variant {variant}</Button>);
			// Assert that a button with the expected text (including the variant name) is rendered
			expect(screen.getByRole('button', { name: `Variant ${variant}` })).toBeInTheDocument();
			// Note: More specific tests could check for the exact CSS classes applied by each variant.
		});
	});

	// Define the possible sizes based on ButtonProps for parameterized testing
	// This ensures tests cover all size options defined in buttonVariants
	const sizes: Array<ButtonProps['size']> = ['default', 'sm', 'lg', 'icon'];

	/**
	 * Test case: Iterates through each defined size using `forEach`.
	 * Ensures the button renders correctly for each size option.
	 */
	sizes.forEach((size) => {
		// Test description dynamically includes the size being tested
		it(`renders correctly with size "${size}"`, () => {
			// The 'icon' size typically doesn't have visible text content.
			// Use a placeholder text or rely on aria-label for identification in tests.
			const buttonText = size === 'icon' ? 'Icon' : `Size ${size}`;
			// Render the button with the current size from the loop
			render(<Button size={size}>{buttonText}</Button>);
			// Assert that a button with the expected text (or placeholder for icon) is rendered
			expect(screen.getByRole('button', { name: buttonText })).toBeInTheDocument();
			// Note: More specific tests could check for the exact CSS classes applied by each size.
		});
	});

	/**
	 * Test case: Renders the component as its child element when the `asChild` prop is true.
	 * This tests the integration with Radix UI's Slot component functionality, which merges
	 * the button's props (like styles) onto the child element.
	 * We use a simple `<a>` tag here as the child to isolate and test the `asChild` behavior,
	 * avoiding the potential complexity of mocking the Next.js Link component if it's not necessary
	 * for testing the core `asChild` functionality itself.
	 */
	it('renders as child element when asChild prop is true', () => {
		render(
			// Pass `asChild` prop along with other desired button props (variant, size)
			<Button asChild variant="link" size="sm">
				{/* Provide a child element (here, a simple anchor tag) */}
				<Link href="/test">Child Link</Link>
			</Button>
		);
		// Find the element by its link role (it should be rendered as the 'a' tag, not a 'button')
		const linkElement = screen.getByRole('link', { name: /child link/i });
		// Assert the link element is present in the DOM
		expect(linkElement).toBeInTheDocument();
		// Assert the rendered element's tag name is indeed 'A'
		expect(linkElement.tagName).toBe('A');
		// Assert that *no* element with the role 'button' was rendered
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
		// Assert that the button's CVA classes (from variant and size props) are applied to the anchor tag
		expect(linkElement).toHaveClass('text-primary'); // Class from the 'link' variant
		expect(linkElement).toHaveClass('h-9'); // Class from the 'sm' size
	});

	/**
	 * Test case: Ensures standard HTML button attributes (like type, aria-label)
	 * are correctly passed through to the underlying button element.
	 */
	it('passes through standard HTML button attributes', () => {
		render(
			<Button type="submit" aria-label="Submit Form">
				Submit
			</Button>
		);
		const button = screen.getByRole('button', { name: /submit/i });
		// Assert the 'type' attribute is correctly set on the button element
		expect(button).toHaveAttribute('type', 'submit');
		// Assert the 'aria-label' attribute is correctly set
		expect(button).toHaveAttribute('aria-label', 'Submit Form');
	});

	/**
	 * Test case: Verifies the button's behavior when the `disabled` prop is set.
	 * It should be visually and functionally disabled (not clickable).
	 */
	it('handles disabled state', () => {
		// Create a mock function using Vitest's `vi.fn()` to track if onClick is called
		const handleClick = vi.fn();
		render(
			<Button disabled onClick={handleClick}>
				Disabled
			</Button>
		);
		const button = screen.getByRole('button', { name: /disabled/i });
		// Assert the button has the disabled state (using jest-dom matcher)
		expect(button).toBeDisabled();
		// Assert the 'disabled' HTML attribute is present
		expect(button).toHaveAttribute('disabled');
		// Simulate a user click event on the disabled button
		fireEvent.click(button);
		// Assert that the mock onClick handler was *not* called
		expect(handleClick).not.toHaveBeenCalled();
	});

	/**
	 * Test case: Verifies that the provided `onClick` handler function is called
	 * when the button (which is not disabled) is clicked.
	 */
	it('calls onClick handler when clicked', () => {
		// Create a mock function
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Clickable</Button>);
		const button = screen.getByRole('button', { name: /clickable/i });
		// Optional: Ensure the button is not disabled before attempting click
		expect(button).not.toBeDisabled();
		// Simulate a user click event
		fireEvent.click(button);
		// Assert that the mock onClick handler was called exactly once
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	/**
	 * Test case: Ensures that the `ref` prop is correctly forwarded to the
	 * underlying HTML button element using React.forwardRef.
	 */
	it('forwards ref correctly', () => {
		// Create a ref object using React.createRef
		const ref = React.createRef<HTMLButtonElement>();
		render(<Button ref={ref}>Ref Button</Button>);
		// Assert that the `current` property of the ref is an instance of HTMLButtonElement
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
		// Assert that the ref points to the correct button element (e.g., by checking its text content)
		expect(ref.current).toHaveTextContent('Ref Button');
	});

	/**
	 * Test case: Verifies rendering specifically for the 'icon' size variant.
	 * Checks for correct classes, accessibility attributes (like aria-label),
	 * and the presence of expected child elements (e.g., an icon).
	 */
	it('renders icon variant correctly', () => {
		render(
			// Use a relevant variant (like 'outline') combined with the 'icon' size.
			// Provide an `aria-label` for accessibility, as icon buttons lack visible text.
			<Button variant="outline" size="icon" aria-label="Settings">
				{/* Include a child element representing the icon. Use data-testid for easy selection. */}
				<span data-testid="icon-child">⚙️</span>
			</Button>
		);
		// Find the button using its aria-label
		const button = screen.getByRole('button', { name: /settings/i });
		// Assert the button is rendered
		expect(button).toBeInTheDocument();
		// Assert the icon child element (identified by data-testid) is rendered within the button
		expect(screen.getByTestId('icon-child')).toBeInTheDocument();
		// Assert that the specific height and width classes for the 'icon' size are applied
		expect(button).toHaveClass('h-10', 'w-10'); // Check for 'h-10' and 'w-10' classes
	});
});
