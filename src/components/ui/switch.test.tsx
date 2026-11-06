import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from '@/components/ui/switch';

describe('Switch', () => {
  it('preserves its original pill shape and isolates only the outer edge from theme styling', () => {
    render(<Switch aria-label="Inventory active" checked onChange={() => {}} />);

    const control = screen.getByRole('switch', { name: 'Inventory active' });

    // The existing dimensions and rounded track are part of the shared UI contract.
    expect(control).toHaveClass('rounded-full', 'h-[1.15rem]', 'w-8');
    // Track fill still uses the active theme; focus/hover edge styling does not.
    expect(control).toHaveClass('data-[state=checked]:bg-primary');
    expect(control).toHaveAttribute('data-switch-fixed-edge', '');
    expect(control).not.toHaveClass('focus-visible:border-ring');
    expect(control).not.toHaveClass('focus-visible:ring-ring/50');
    expect(control).not.toHaveClass('data-hover-color');
  });

  it('keeps the controlled checked state and onChange behavior intact', () => {
    const onChange = vi.fn();
    render(<Switch aria-label="Inventory active" checked={false} onChange={onChange} />);

    const control = screen.getByRole('switch', { name: 'Inventory active' });
    expect(control).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
