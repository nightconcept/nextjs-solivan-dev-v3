import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest'; // Added vi for mocking
import Home from './page'; // Adjust the import path if necessary

// Mock child components to isolate the Home component test
vi.mock('@/components/header', () => ({ default: () => <div>Mock Header</div> }));
vi.mock('@/components/profile-card', () => ({ default: () => <div>Mock Profile Card</div> }));
vi.mock('@/components/blog-post-list', () => ({ default: () => <div>Mock Blog Post List</div> }));
vi.mock('@/components/footer', () => ({ default: () => <div>Mock Footer</div> }));

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />);
    // No assertion needed here, the test passes if render doesn't throw
  });

  it('renders the "Recent Posts" heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: /recent posts/i });
    expect(heading).toBeInTheDocument();
  });
});