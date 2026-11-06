import { describe, expect, it } from 'vitest';
import { toNotificationTemplateList, toNotificationUnreadCount } from './notification';

describe('toNotificationTemplateList', () => {
  it('maps the backend templateList response and itemCount', () => {
    const result = toNotificationTemplateList({
      itemCount: 1,
      templateList: [{
        templateId: 'template-1', key: 'order.confirmed', name: 'Order confirmed',
        channel: 'PUSH', title: 'Order confirmed', body: 'Hello {{name}}',
        variables: ['name'], isActive: true, updatedAt: '2026-11-05T10:00:00.000Z',
      }],
    });

    expect(result.totalRecord).toBe(1);
    expect(result.itemList).toHaveLength(1);
    expect(result.itemList[0]).toMatchObject({ templateId: 'template-1', key: 'order.confirmed', variables: ['name'] });
  });

  it('returns an empty one-page-compatible result when the backend list is empty', () => {
    expect(toNotificationTemplateList({ itemCount: 0, templateList: [] })).toMatchObject({
      totalRecord: 0, totalPage: 0, itemList: [],
    });
  });
});

describe('toNotificationUnreadCount', () => {
  it('maps the backend total field into the unread count view model', () => {
    expect(toNotificationUnreadCount({ total: 7, byType: { ORDER: 3 } })).toEqual({ unreadCount: 7 });
  });
});
