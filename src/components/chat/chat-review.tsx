'use client';

import { RefreshButton } from '@/components/common/refresh-button';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/lib/api/api.service';
import type { ChatMessageData, ConversationData, PageData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';
import { isImageUrl, safeExternalUrl } from '@/lib/utils/external-url';
import { ImagePreview } from '@/components/common/image-preview';

const m = MESSAGES.chat;
const PAGE_SIZE = 15;
const participantName = (item: ConversationData['participantList'][number]) =>
  item.vendorData.shopName || item.userData.name || item.userId;

export function ChatReview() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'true' | 'false' | ''>('true');
  const [page, setPage] = useState(1);
  const [conversations, setConversations] = useState<PageData<ConversationData> | null>(null);
  const [selected, setSelected] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<PageData<ChatMessageData> | null>(null);
  const [messagePage, setMessagePage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState('');
  const [messageError, setMessageError] = useState('');

  const loadConversations = useCallback(async () => {
    setLoading(true); setError('');
    const response = await apiService.getAdminChatConversations({ page, limit: PAGE_SIZE, search: search.trim() || undefined, isActive: status || undefined });
    setLoading(false);
    if (response.status) {
      setConversations(response.data);
      setSelected((current) => current ? response.data.itemList.find((row) => row.conversationId === current.conversationId) ?? current : null);
    } else setError(response.message);
  }, [page, search, status]);

  const loadMessages = useCallback(async (conversationId: string) => {
    setMessageLoading(true); setMessageError('');
    const response = await apiService.getAdminChatMessages(conversationId, { page: messagePage, limit: PAGE_SIZE });
    setMessageLoading(false);
    if (response.status) setMessages(response.data); else setMessageError(response.message);
  }, [messagePage]);

  useEffect(() => { void loadConversations(); }, [loadConversations]);
  useEffect(() => {
    if (selected) void loadMessages(selected.conversationId);
    else setMessages(null);
  }, [selected?.conversationId, loadMessages]);

  const selectConversation = (conversation: ConversationData) => {
    setSelected(conversation); setMessagePage(1); setMessages(null);
  };

  return <div className="flex flex-col gap-4">
    <PageHeader title={m.title} description={m.subtitle} action={<RefreshButton onRefresh={() => void loadConversations()} isRefreshing={loading} label={m.refresh} />} />
    <Card><CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
      <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={m.search} className="flex-1" />
      <select value={status} onChange={(event) => { setStatus(event.target.value as 'true' | 'false'); setPage(1); }} className="h-10 rounded-md border border-input bg-background px-3 text-sm text-fg">
        <option value="">{m.all}</option><option value="true">{m.active}</option><option value="false">{m.inactive}</option>
      </select>
    </CardContent></Card>
    {error ? <ErrorState message={error} onRetry={() => void loadConversations()} /> : <div className="grid min-h-chat-panel gap-4 xl:grid-cols-chat-review">
      <Card className="min-w-0 overflow-hidden"><CardHeader><CardTitle>{m.title}</CardTitle></CardHeader><CardContent className="space-y-2 p-3">
        {loading && !conversations ? <p className="p-4 text-sm text-fg-muted">{MESSAGES.common.loading}</p> : conversations?.itemList.length ? conversations.itemList.map((conversation) => {
          const names = conversation.participantList.map(participantName).filter(Boolean);
          const active = selected?.conversationId === conversation.conversationId;
          return <button key={conversation.conversationId} type="button" onClick={() => selectConversation(conversation)} className={`w-full rounded-lg border p-3 text-left transition-colors ${active ? 'border-primary bg-primary/5' : 'border-border hover:bg-surface-muted/60'}`}>
            <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">{names.join(' ↔ ') || conversation.conversationId}</span><Badge intent={conversation.isActive ? 'success' : 'neutral'}>{conversation.isActive ? m.activeLabel : m.inactiveLabel}</Badge></div>
            <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{conversation.lastMessageData.body || m.lastMessage}</p>
            <p className="mt-2 text-xs text-fg-muted">{conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleString() : ''}</p>
          </button>;
        }) : <EmptyState title={m.empty} />}
        {conversations && <Pagination currentPage={conversations.currentPage || page} totalPage={conversations.totalPage} totalRecord={conversations.totalRecord} limit={conversations.limit || PAGE_SIZE} onPageChange={setPage} />}
      </CardContent></Card>
      <Card className="min-w-0 overflow-hidden"><CardHeader><CardTitle>{m.messages}</CardTitle></CardHeader><CardContent className="space-y-3 p-4">
        {!selected ? <EmptyState title={m.selectConversation} /> : <>
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3"><span className="text-xs text-fg-muted">{m.participants}:</span>{selected.participantList.map((participant) => <Badge key={participant.userId} intent="neutral">{participantName(participant)}</Badge>)}</div>
          {messageError ? <ErrorState message={messageError} onRetry={() => void loadMessages(selected.conversationId)} /> : messageLoading && !messages ? <p className="py-5 text-sm text-fg-muted">{MESSAGES.common.loading}</p> : messages?.itemList.length ? <div className="space-y-3">
            {[...messages.itemList].reverse().map((message) => <div key={message.messageId} className="rounded-lg border border-border bg-surface-muted/40 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-semibold">{message.senderData.name || message.senderId}</span><span className="text-xs text-fg-muted">{message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}</span></div>
              <p className="whitespace-pre-wrap break-words text-sm">{message.isDeleted ? m.deleted : message.body}</p>
              {message.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap items-start gap-2">
                  {message.attachments.map((url) => {
                    const safeUrl = safeExternalUrl(url);
                    if (safeUrl && isImageUrl(safeUrl)) {
                      return (
                        <ImagePreview
                          key={url}
                          src={safeUrl}
                          alt={m.attachments}
                          width={720}
                          height={540}
                          triggerClassName="size-24"
                          className="size-full rounded-lg object-cover"
                        />
                      );
                    }
                    return safeUrl ? (
                      <a key={url} href={safeUrl} target="_blank" rel="noopener noreferrer" className="block max-w-full break-all text-xs text-primary underline">
                        {m.attachments}: {url}
                      </a>
                    ) : (
                      <p key={url} className="max-w-full break-all text-xs text-fg-muted">
                        {m.attachments}: {url}
                      </p>
                    );
                  })}
                </div>
              )}
              <div className="mt-2 text-right text-xs text-fg-muted">{message.isRead ? m.read : m.sent}</div>
            </div>)}
            <Pagination currentPage={messages.currentPage || messagePage} totalPage={messages.totalPage} totalRecord={messages.totalRecord} limit={messages.limit || PAGE_SIZE} onPageChange={setMessagePage} />
          </div> : <EmptyState title={m.empty} />}
        </>}
      </CardContent></Card>
    </div>}
  </div>;
}
