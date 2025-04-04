import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest'; // Added beforeEach
import Footer from './footer';
import '@testing-library/jest-dom';

// Mock the SocialLinks component
const mockSocialLinks = vi.fn();
// Define an interface for the props expected by the mocked SocialLinks
interface MockSocialLinksProps {
	spacing?: string; // Based on the test, spacing is a string prop
}

vi.mock('./social-links', () => ({
	// Use default export because SocialLinks seems to be a default export
	default: (props: MockSocialLinksProps) => {
		// Use the defined interface
		mockSocialLinks(props); // Call the mock function with props
		return <div data-testid="social-links-mock">SocialLinks</div>;
	}
}));

describe('Footer Component', () => {
	beforeEach(() => {
		// Reset mock calls before each test
		mockSocialLinks.mockClear();
		render(<Footer />);
	});

	it('renders the copyright text', () => {
		// Use text content matching, allowing for variations in whitespace/encoding
		expect(screen.getByText(/© Danny 2007-2025/)).toBeInTheDocument();
	});

	it('renders the SocialLinks component', () => {
		expect(screen.getByTestId('social-links-mock')).toBeInTheDocument();
	});

	it('passes the correct spacing prop to SocialLinks', () => {
		// Check if the mock function was called with the expected props
		expect(mockSocialLinks).toHaveBeenCalledTimes(1);
		expect(mockSocialLinks).toHaveBeenCalledWith({ spacing: 'compact' });
	});
});
