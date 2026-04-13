import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from './Toast';

const makeToasts = (overrides = {}) => [
  { id: 1, title: 'Added to cart', sub: 'Smash Burger', icon: '🛒', type: 'success', ...overrides },
];

describe('Toast', () => {
  it('renders toast title and subtitle', () => {
    render(<Toast toasts={makeToasts()} removeToast={vi.fn()} />);
    expect(screen.getByText('Added to cart')).toBeInTheDocument();
    expect(screen.getByText('Smash Burger')).toBeInTheDocument();
  });

  it('renders the toast icon', () => {
    render(<Toast toasts={makeToasts()} removeToast={vi.fn()} />);
    expect(screen.getByText('🛒')).toBeInTheDocument();
  });

  it('renders without subtitle when sub is not provided', () => {
    render(<Toast toasts={makeToasts({ sub: undefined })} removeToast={vi.fn()} />);
    expect(screen.getByText('Added to cart')).toBeInTheDocument();
    expect(screen.queryByText('Smash Burger')).not.toBeInTheDocument();
  });

  it('calls removeToast when close button is clicked', async () => {
    const removeToast = vi.fn();
    render(<Toast toasts={makeToasts()} removeToast={removeToast} />);
    await userEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(removeToast).toHaveBeenCalledWith(1);
  });

  it('calls removeToast when the toast itself is clicked', async () => {
    const removeToast = vi.fn();
    render(<Toast toasts={makeToasts()} removeToast={removeToast} />);
    await userEvent.click(screen.getByText('Added to cart'));
    expect(removeToast).toHaveBeenCalledWith(1);
  });

  it('renders nothing when toasts array is empty', () => {
    const { container } = render(<Toast toasts={[]} removeToast={vi.fn()} />);
    expect(container.querySelector('.toast')).toBeNull();
  });

  it('renders multiple toasts', () => {
    const toasts = [
      { id: 1, title: 'First toast', icon: '✓', type: 'success' },
      { id: 2, title: 'Second toast', icon: '⚠️', type: 'error' },
    ];
    render(<Toast toasts={toasts} removeToast={vi.fn()} />);
    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
  });
});
