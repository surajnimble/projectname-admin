import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OptionsMenu } from './options-menu';

afterEach(() => cleanup());

describe('OptionsMenu', () => {
  it('keeps the menu closed until the trigger is pressed', () => {
    render(
      <OptionsMenu
        label="Vendor actions"
        items={[{ label: 'Approve', onSelect: vi.fn() }]}
      />,
    );

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Vendor actions' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Approve' })).toBeInTheDocument();
  });

  it('runs the item and closes the menu', () => {
    const onSelect = vi.fn();
    render(<OptionsMenu label="Vendor actions" items={[{ label: 'Approve', onSelect }]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Vendor actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Approve' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders the menu in a portal so scrolling containers cannot clip it', () => {
    render(
      <div style={{ overflow: 'auto' }}>
        <OptionsMenu label="Vendor actions" items={[{ label: 'Approve', onSelect: vi.fn() }]} />
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Vendor actions' }));

    expect(screen.getByRole('menu').parentElement).toBe(document.body);
  });
});
