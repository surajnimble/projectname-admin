import { describe, expect, it } from 'vitest';
import { toChatMessageList, toConversationList } from './chat';

describe('chat response mappers', () => {
  it('maps the serialized conversationList response and pagination', () => {
    const result = toConversationList({
      totalRecord: 1,
      totalPage: 1,
      currentPage: 1,
      limit: 15,
      conversationList: [{
        conversationId: 'conv-1',
        isActive: true,
        lastMessageData: { messageId: 'msg-1', body: 'Hello', senderId: 'user-1' },
        participantList: [{
          userId: 'user-1',
          userData: { userId: 'user-1', name: 'Customer' },
          vendorData: { vendorId: 'vendor-1', shopName: 'Shop' },
        }],
      }],
    });

    expect(result.totalRecord).toBe(1);
    expect(result.itemList[0]?.lastMessageData.body).toBe('Hello');
    expect(result.itemList[0]?.participantList[0]?.vendorData.shopName).toBe('Shop');
  });

  it('maps the serialized messageList response and filters invalid attachment values', () => {
    const result = toChatMessageList({
      totalRecord: 1,
      currentPage: 1,
      totalPage: 1,
      limit: 15,
      messageList: [{
        messageId: 'msg-1',
        body: 'Attached',
        attachments: ['https://cdn.example.test/file.pdf', 5, null],
        senderData: { userId: 'user-1', name: 'Customer' },
      }],
    });

    expect(result.itemList[0]?.attachments).toEqual(['https://cdn.example.test/file.pdf']);
    expect(result.itemList[0]?.senderData.name).toBe('Customer');
  });
});
