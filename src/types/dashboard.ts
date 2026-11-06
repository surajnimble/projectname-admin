import type { DashboardStatKey, DashboardStatsData } from '@/lib/api/contract';

type RawDashboardStats = Partial<Record<DashboardStatKey, unknown>>;

const DASHBOARD_STAT_KEYS: readonly DashboardStatKey[] = [
  'totalUsers',
  'totalVendors',
  'pendingVendors',
  'totalProducts',
  'totalOrders',
  'revenue30d',
  'openTickets',
  'pendingReturns',
  'pendingRefunds',
  'pendingAdminOrders',
];

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
  pendingAdminOrders: toNumber(raw.pendingAdminOrders),
  availableStats: DASHBOARD_STAT_KEYS.filter((key) =>
    Object.prototype.hasOwnProperty.call(raw, key),
  ),
});
