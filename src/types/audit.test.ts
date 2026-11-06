import { describe, expect, it } from 'vitest';
import { toAuditLogList } from './audit';

describe('toAuditLogList', () => {
  it('maps the backend audit serializer fields and impersonation attribution', () => {
    const result = toAuditLogList({
      totalRecord: 1,
      totalPage: 1,
      currentPage: 1,
      limit: 10,
      auditLogList: [{
        auditLogId: 'audit-1',
        actorId: 'customer-1',
        actorRole: 'CUSTOMER',
        impersonatedById: 'admin-1',
        action: 'UPDATE',
        entity: 'Order',
        entityId: 'order-1',
        description: 'Updated order while impersonating',
        changes: { status: { from: 'PENDING', to: 'PROCESSING' } },
        meta: { source: 'admin-impersonation' },
        ip: '127.0.0.1',
        userAgent: 'Test Browser',
        createdAt: '2026-11-05T09:00:00.000Z',
        actorData: { userId: 'customer-1', name: 'Customer One', email: 'customer@example.test' },
        impersonatedByData: { userId: 'admin-1', name: 'Admin One', email: 'admin@example.test' },
      }],
    });

    expect(result.itemList[0]).toMatchObject({
      auditLogId: 'audit-1',
      actorId: 'customer-1',
      actorRole: 'CUSTOMER',
      impersonatedById: 'admin-1',
      description: 'Updated order while impersonating',
      actorData: { name: 'Customer One', email: 'customer@example.test' },
      impersonatedByData: { name: 'Admin One', email: 'admin@example.test' },
      userAgent: 'Test Browser',
    });
  });

  it('supports legacy userData records without inventing an impersonator', () => {
    const result = toAuditLogList({
      auditLogList: [{
        auditLogId: 'legacy-1',
        userId: 'user-1',
        userData: { userId: 'user-1', name: 'Legacy User', email: 'legacy@example.test' },
      }],
    });

    expect(result.itemList[0]?.actorId).toBe('user-1');
    expect(result.itemList[0]?.actorData.name).toBe('Legacy User');
    expect(result.itemList[0]?.impersonatedById).toBe('');
    expect(result.itemList[0]?.impersonatedByData.name).toBe('');
  });

  it('returns a safe empty page when the API omits audit logs', () => {
    expect(toAuditLogList().itemList).toEqual([]);
  });
});
