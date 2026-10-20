import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardWidget } from './dashboard-widget';

const renderWidget = (hasMore: boolean, onViewAll = vi.fn()) =>
  render(
    <DashboardWidget
      title="Test widget"
      hasMore={hasMore}
      onViewAll={onViewAll}
      isLoading={false}
      error=""
      onRetry={vi.fn()}
      isEmpty={false}
      emptyTitle="Empty"
      emptyBody="Nothing here."
    >
      <p>Row</p>
    </DashboardWidget>,
  );

describe('DashboardWidget', () => {
  it('shows View all only when there are more rows', () => {
    const { unmount } = renderWidget(true);
    expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
    unmount();

    renderWidget(false);
    expect(screen.queryByRole('button', { name: /view all/i })).not.toBeInTheDocument();
  });

  it('calls the View all handler', () => {
    const onViewAll = vi.fn();
    renderWidget(true, onViewAll);

    fireEvent.click(screen.getByRole('button', { name: /view all/i }));

    expect(onViewAll).toHaveBeenCalledTimes(1);
  });
});
