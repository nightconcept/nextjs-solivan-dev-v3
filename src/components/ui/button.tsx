import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Defines the base styles and variants for the Button component using class-variance-authority.
 *
 * @see https://cva.style/docs
 *
 * Base styles are applied to all variants.
 * Variants define different visual styles (e.g., 'default', 'destructive') and sizes.
 * Default variants are applied when no specific variant or size is provided.
 */
const buttonVariants = cva(
	// Base styles applied to all buttons
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			// Defines different visual appearances for the button
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline'
			},
			// Defines different sizes for the button
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10' // Specific size for icon-only buttons
			}
		},
		// Default variants applied if not specified in props
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
);

/**
 * Props for the Button component.
 * Extends standard HTML button attributes and CVA variant props.
 */
export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>, // Standard button attributes (e.g., onClick, type, disabled)
		VariantProps<typeof buttonVariants> {
	// Props derived from buttonVariants (variant, size)
	/**
	 * Optional: If true, the button will render as a child element (`Slot`)
	 * preserving the child's props and merging the button styles.
	 * Useful for wrapping other components like links (`<a>`) while maintaining button styling.
	 * @default false
	 * @see https://www.radix-ui.com/primitives/docs/utilities/slot
	 */
	asChild?: boolean;
}

/**
 * A versatile button component with customizable variants and sizes.
 * It leverages `cva` for class variance and `@radix-ui/react-slot` for optional composition.
 * It also forwards refs to the underlying button element.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className, // Additional CSS classes to apply
			variant, // The visual style variant (e.g., 'default', 'destructive')
			size, // The size variant (e.g., 'default', 'sm', 'lg')
			asChild = false, // Whether to render as a Slot
			...props // Other standard button props (e.g., children, onClick)
		},
		ref // Forwarded ref
	) => {
		// Determine the component to render: 'button' by default, or Slot if asChild is true
		const Comp = asChild ? Slot : 'button';
		return (
			// Render the chosen component (button or Slot)
			<Comp
				// Combine base styles, variant styles, size styles, and any additional className props
				className={cn(buttonVariants({ variant, size, className }))}
				// Forward the ref to the underlying element
				ref={ref}
				// Spread the remaining props (like children, onClick, type, etc.) onto the element
				{...props}
			/>
		);
	}
);
// Set a display name for better debugging experience (e.g., in React DevTools)
Button.displayName = 'Button';

// Export the Button component and the buttonVariants configuration
export { Button, buttonVariants };
