import type {
  ConversationData,
  ConversationListData,
  MessageData,
  MessageListData,
} from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const baseList = (raw: Record<string, unknown>) => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
});

const mapList = <T>(raw: Record<string, unknown>, mapper: (item: Record<string, unknown>) => T): T[] =>
  Array.isArray(raw.list)
    ? raw.list.filter(isObject).map((item) => mapper(item))
    : [];

export const toConversation = (raw: Record<string, unknown> = {}): ConversationData => {
  const lmd = raw.lastMessageData as Record<string, unknown> | undefined;
  return {
    conversationId: toString(raw.conversationId),
    lastMessageAt: toString(raw.lastMessageAt),
    isActive: raw.isActive === true,
    createdAt: toString(raw.createdAt),
    lastMessageData: {
      messageId: toString(lmd?.messageId),
      body: toString(lmd?.body),
      senderId: toString(lmd?.senderId),
      isRead: lmd?.isRead === true,
      createdAt: toString(lmd?.createdAt),
    },
    participantList: Array.isArray(raw.participantList)
      ? raw.participantList.filter(isObject).map((p) => {
          const ud = p.userData as Record<string, unknown> | undefined;
          const vd = p.vendorData as Record<string, unknown> | undefined;
          return {
            userId: toString(p.userId),
            lastReadAt: toString(p.lastReadAt),
            isArchived: p.isArchived === true,
            userData: {
              userId: toString(ud?.userId),
              name: toString(ud?.name),
              avatarUrl: toString(ud?.avatarUrl),
            },
            vendorData: vd
              ? {
                  vendorId: toString(vd.vendorId),
                  shopName: toString(vd.shopName),
                  slug: toString(vd.slug),
                }
              : null,
          };
        })
      : [],
  };
};

export const toConversationList = (raw: Record<string, unknown> = {}): ConversationListData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.conversationList)
    ? raw.conversationList.filter(isObject).map(toConversation)
    : [],
  unreadTotal: toNumber(raw.unreadTotal),
});

export const toMessage = (raw: Record<string, unknown> = {}): MessageData => {
  const sd = raw.senderData as Record<string, unknown> | undefined;
  return {
    messageId: toString(raw.messageId),
    conversationId: toString(raw.conversationId),
    senderId: toString(raw.senderId),
    body: toString(raw.body),
    attachments: Array.isArray(raw.attachments) ? raw.attachments.filter(isObject).map(String) : [],
    isRead: raw.isRead === true,
    readAt: toString(raw.readAt),
    isDeleted: raw.isDeleted === true,
    createdAt: toString(raw.createdAt),
    senderData: {
      userId: toString(sd?.userId),
      name: toString(sd?.name),
      avatarUrl: toString(sd?.avatarUrl),
    },
  };
};

type RawMessageList = Partial<
  Record<keyof Omit<MessageListData, 'itemList'>, unknown>
> & {
  messageList?: unknown;
};

export const toMessageList = (raw: RawMessageList = {}): MessageListData => ({
  ...baseList(raw),
  itemList: Array.isArray(raw.messageList)
    ? raw.messageList.filter(isObject).map(toMessage)
    : [],
});
