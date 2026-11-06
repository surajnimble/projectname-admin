import type { ChatMessageData, ChatMessageListData, ConversationData, ConversationListData, PageData } from '@/lib/api/contract';

type Raw = Record<string, unknown>;
const text = (value: unknown): string => typeof value === 'string' ? value : '';
const number = (value: unknown): number => typeof value === 'number' && Number.isFinite(value) ? value : 0;
const object = (value: unknown): Raw => value && typeof value === 'object' && !Array.isArray(value) ? value as Raw : {};
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const flag = (value: unknown): boolean => value === true;

const page = <T>(raw: Raw, itemList: T[]): PageData<T> => ({
  totalRecord: number(raw.totalRecord),
  totalPage: number(raw.totalPage),
  currentPage: number(raw.currentPage),
  limit: number(raw.limit),
  hasNext: flag(raw.hasNext),
  hasPrevious: flag(raw.hasPrevious),
  nextPage: number(raw.nextPage),
  previousPage: number(raw.previousPage),
  itemList,
});

export const toConversation = (rawValue: unknown): ConversationData => {
  const raw = object(rawValue);
  const last = object(raw.lastMessageData);
  return {
    conversationId: text(raw.conversationId),
    lastMessageAt: text(raw.lastMessageAt),
    isActive: flag(raw.isActive),
    createdAt: text(raw.createdAt),
    lastMessageData: {
      messageId: text(last.messageId), body: text(last.body), senderId: text(last.senderId),
      isRead: flag(last.isRead), createdAt: text(last.createdAt),
    },
    participantList: array(raw.participantList).map((value) => {
      const participant = object(value); const user = object(participant.userData); const vendor = object(participant.vendorData);
      return {
        userId: text(participant.userId), lastReadAt: text(participant.lastReadAt), isArchived: flag(participant.isArchived),
        userData: { userId: text(user.userId), name: text(user.name), avatarUrl: text(user.avatarUrl) },
        vendorData: { vendorId: text(vendor.vendorId), shopName: text(vendor.shopName), slug: text(vendor.slug) },
      };
    }),
  };
};

export const toConversationList = (raw: Raw = {}): ConversationListData =>
  page(raw, array(raw.conversationList).map(toConversation));

export const toChatMessage = (rawValue: unknown): ChatMessageData => {
  const raw = object(rawValue); const sender = object(raw.senderData);
  return {
    messageId: text(raw.messageId), conversationId: text(raw.conversationId), senderId: text(raw.senderId),
    body: text(raw.body), attachments: array(raw.attachments).filter((value): value is string => typeof value === 'string'),
    isRead: flag(raw.isRead), readAt: text(raw.readAt), isDeleted: flag(raw.isDeleted), createdAt: text(raw.createdAt),
    senderData: { userId: text(sender.userId), name: text(sender.name), avatarUrl: text(sender.avatarUrl) },
  };
};

export const toChatMessageList = (raw: Raw = {}): ChatMessageListData =>
  page(raw, array(raw.messageList).map(toChatMessage));
