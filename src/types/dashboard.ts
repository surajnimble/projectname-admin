import type { DashboardStatsData } from '@/lib/api/contract';

type RawDashboardStats = Partial<Record<keyof DashboardStatsData, unknown>>;

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

export const toDashboardStats = (raw: RawDashboardStats = {}): DashboardStatsData => ({
  totalUsers: toNumber(raw.totalUsers),
  totalVendors: toNumber(raw.totalVendors),
  pendingVendors: toNumber(raw.pendingVendors),
  totalProducts: toNumber(raw.totalProducts),
  totalOrders: toNumber(raw.totalOrders),
  revenue30d: toNumber(raw.revenue30d),
  openTickets: toNumber(raw.openTickets),
  pendingReturns: toNumber(raw.pendingReturns),
  pendingRefunds: toNumber(raw.pendingRefunds),
});
