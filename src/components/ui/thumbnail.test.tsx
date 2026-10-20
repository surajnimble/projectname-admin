import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Thumbnail } from './thumbnail';

afterEach(() => cleanup());

describe('Thumbnail', () => {
  it('renders the image when a source is given', () => {
    render(<Thumbnail src="https://cdn.test/logo.png" alt="Demo Shop" />);

    const image = screen.getByRole('img', { name: 'Demo Shop' });
    expect(image).toHaveAttribute('src', 'https://cdn.test/logo.png');
  });

  it('falls back to the first letter when there is no image', () => {
    const { container } = render(<Thumbnail alt="Demo Shop" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.textContent).toBe('D');
  });

  it('renders a custom fallback', () => {
    const { container } = render(<Thumbnail alt="Demo Shop" fallback={<span>None</span>} />);

    expect(container.textContent).toBe('None');
  });
});
