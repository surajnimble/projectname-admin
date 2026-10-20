import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from './dialog';

afterEach(() => cleanup());

describe('Dialog', () => {
  it('opens with the title and description', () => {
    render(
      <Dialog open onClose={vi.fn()} title="Update commission" description="Change the rate" closeLabel="Close">
        <p>Body</p>
      </Dialog>,
    );

    expect(screen.getByRole('heading', { name: 'Update commission' })).toBeInTheDocument();
    expect(screen.getByText('Change the rate')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
  });

  it('closes when the close button is pressed', () => {
    const onClose = vi.fn();
    render(
      <Dialog open onClose={onClose} title="Update commission" closeLabel="Close">
        <p>Body</p>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('is closed when open is false', () => {
    const { container } = render(
      <Dialog open={false} onClose={vi.fn()} title="Update commission" closeLabel="Close">
        <p>Body</p>
      </Dialog>,
    );

    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
  });
});
