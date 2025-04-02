import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest'; // Import from vitest
import Header from './header';
import '@testing-library/jest-dom'; // Keep this for DOM matchers

// Mock the ThemeToggle component using vi.mock
vi.mock('./theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle-mock">ThemeToggle</div>,
}));

// Mock next/link using vi.mock - Corrected structure
vi.mock('next/link', () => {
  // Return an object with the default export being the mock component
  return {
    default: ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: () => void }) => {
      // Added onClick prop handling to simulate mobile menu closing
      return <a href={href} onClick={onClick}>{children}</a>;
    }
  };
});

// Mock lucide-react icons using vi.mock
vi.mock('lucide-react', () => ({
  Leaf: () => <svg data-testid="leaf-icon"></svg>,
  Menu: () => <svg data-testid="menu-icon"></svg>,
  X: () => <svg data-testid="x-icon"></svg>,
}));


describe('Header Component', () => {
  beforeEach(() => {
    render(<Header />);
  });

  it('renders the home link with correct text and icon', () => {
    const homeLink = screen.getByRole('link', { name: /^\/home\/danny$/ });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
    expect(screen.getByTestId('leaf-icon')).toBeInTheDocument();
  });

  it('renders desktop navigation links', () => {
    const blogLinks = screen.getAllByRole('link', { name: 'Blog' });
    const aboutLinks = screen.getAllByRole('link', { name: 'About' });
    expect(blogLinks.length).toBeGreaterThan(0);
    expect(aboutLinks.length).toBeGreaterThan(0);
  });

  it('renders the ThemeToggle', () => {
    expect(screen.getByTestId('theme-toggle-mock')).toBeInTheDocument();
  });

  it('renders the mobile menu button with menu icon initially', () => {
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
  });

  it('does not render the mobile menu content initially', () => {
    const mobileMenuContainer = screen.queryByRole('link', { name: 'Blog' })?.closest('.sm\\:hidden');
    expect(mobileMenuContainer).not.toBeInTheDocument();
  });

  describe('Mobile Menu Interaction', () => {
    beforeEach(() => {
      // Click the button to open the menu before each test in this block
      fireEvent.click(screen.getByRole('button'));
    });

    it('opens the mobile menu on button click', () => {
      // Verify the mobile menu container is present by checking for its unique class or content
      // Since beforeEach opened the menu, we expect the 'x-icon' and mobile links to be visible.
      // Let's find an element known to be *inside* the mobile menu.
      const blogLinkInMobile = screen.getAllByRole('link', { name: 'Blog' }).find(link => link.closest('.sm\\:hidden'));
      expect(blogLinkInMobile).toBeInTheDocument(); // If the link is found, the menu is open

      // Also check other elements expected inside the open mobile menu
      const aboutLinkInMobile = screen.getAllByRole('link', { name: 'About' }).find(link => link.closest('.sm\\:hidden'));
      expect(aboutLinkInMobile).toBeInTheDocument();
      const themeToggleInMobile = screen.getAllByTestId('theme-toggle-mock').find(toggle => toggle.closest('.sm\\:hidden'));
      expect(themeToggleInMobile).toBeInTheDocument();
    });

    it('shows the X icon when mobile menu is open', () => {
      // Menu is opened in beforeEach
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('menu-icon')).not.toBeInTheDocument();
    });

    it('closes the mobile menu on button click (X)', () => {
      // Menu is opened in beforeEach, click the button (now showing X) to close it
      fireEvent.click(screen.getByRole('button'));

      // Verify menu is closed
      const mobileMenuContainer = screen.queryByRole('link', { name: 'Blog' })?.closest('.sm\\:hidden');
      expect(mobileMenuContainer).not.toBeInTheDocument();
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument(); // Should be back to menu icon
      expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
    });

     it('closes the mobile menu when a link inside it is clicked', () => {
        // Menu is opened in beforeEach
        const blogLinkInMobileMenu = screen.getAllByRole('link', { name: 'Blog' }).find(link => link.closest('.sm\\:hidden'));
        expect(blogLinkInMobileMenu).toBeInTheDocument(); // Ensure the link exists

        if (blogLinkInMobileMenu) {
            fireEvent.click(blogLinkInMobileMenu); // Simulate click on the link
        }

        // Verify menu is closed
        const mobileMenuContainer = screen.queryByRole('link', { name: 'Blog' })?.closest('.sm\\:hidden');
        expect(mobileMenuContainer).not.toBeInTheDocument();
        expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('x-icon')).not.toBeInTheDocument();
     });
  });
});