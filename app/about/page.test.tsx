import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import About from './page'; // Adjust the import path if necessary

// Mock child components
vi.mock('@/components/header', () => ({ default: () => <div>Mock Header</div> }));
vi.mock('@/components/footer', () => ({ default: () => <div>Mock Footer</div> }));

describe('About Page', () => {
  it('renders without crashing', () => {
    render(<About />);
  });

  it('renders the "About Me" heading', () => {
    render(<About />);
    const heading = screen.getByRole('heading', { name: /about me/i });
    expect(heading).toBeInTheDocument();
  });
});