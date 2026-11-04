import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PermissionPicker } from './permission-picker';

const available = [
  'dashboard:view',
  'dashboard:stats',
  'vendor:list',
  'vendor:approve',
  'order:list',
];

afterEach(cleanup);

describe('PermissionPicker', () => {
  it('lists every available permission grouped by namespace', () => {
    render(<PermissionPicker available={available} selected={[]} onChange={vi.fn()} />);

    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Vendor')).toBeTruthy();
    expect(screen.getByText('Order')).toBeTruthy();
    expect(screen.getAllByRole('checkbox')).toHaveLength(available.length);
  });

  it('marks the currently granted permissions as checked', () => {
    render(
      <PermissionPicker
        available={available}
        selected={['dashboard:view', 'vendor:list']}
        onChange={vi.fn()}
      />,
    );

    const checked = screen
      .getAllByRole('checkbox')
      .filter((box) => box.getAttribute('data-state') === 'checked');
    expect(checked).toHaveLength(2);
  });

  it('reports the picked permission back', () => {
    const onChange = vi.fn();
    render(<PermissionPicker available={available} selected={[]} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('vendor:approve'));

    expect(onChange).toHaveBeenCalledWith(['vendor:approve']);
  });

  it('filters the list by the search term', () => {
    render(<PermissionPicker available={available} selected={[]} onChange={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Search permissions'), {
      target: { value: 'approve' },
    });

    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    expect(screen.getByLabelText('vendor:approve')).toBeTruthy();
  });

  it('shows an empty state when nothing matches', () => {
    render(<PermissionPicker available={available} selected={[]} onChange={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Search permissions'), {
      target: { value: 'zzzz' },
    });

    expect(screen.getByText('No permission matches your search.')).toBeTruthy();
  });

  it('selects and clears everything', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PermissionPicker available={available} selected={[]} onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select all' }));
    const picked = onChange.mock.calls[0]?.[0] ?? [];
    expect([...picked].sort()).toEqual([...available].sort());

    rerender(
      <PermissionPicker available={available} selected={available} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
