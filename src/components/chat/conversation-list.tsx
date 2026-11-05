'use client';

import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConversations } from '@/hooks/use-chat';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/constants';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import type { ConversationData } from '@/lib/api/contract';

const { chat } = MESSAGES;

const conversationColumns: DataTableColumn<ConversationData>[] = [
  {
    key: 'participant',
    header: chat.columns.participant,
    width: 'w-64',
    cell: (row) => {
      const participant = row.participantList[0];
      if (!participant) return <span className="text-fg-muted">{chat.noParticipant}</span>;
      const vendor = participant.vendorData;
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center">
            <span className="text-xs font-medium">{participant.userData.name?.slice(0, 1).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-medium text-fg">{vendor?.shopName || participant.userData.name}</p>
            <p className="text-xs text-fg-muted">{vendor?.slug || ''}</p>
          </div>
        </div>
      );
    },
  },
  {
    key: 'lastMessage',
    header: chat.columns.lastMessage,
    cell: (row) => (
      <p className="text-sm text-fg-muted truncate">{row.lastMessageData.body || chat.noMessages}</p>
    ),
  },
  {
    key: 'lastMessageAt',
    header: chat.columns.lastActivity,
    width: 'w-48',
    cell: (row) => <span className="text-sm text-fg-muted">{row.lastMessageAt}</span>,
  },
  {
    key: 'isActive',
    header: chat.columns.status,
    width: 'w-32',
    cell: (row) => (
      <Badge intent={row.isActive ? 'success' : 'default'}>
        {row.isActive ? chat.statuses.active : chat.statuses.inactive}
      </Badge>
    ),
  },
];

export function ConversationList() {
  const { can } = usePermission();
  const {
    data,
    isLoading,
    error,
    search,
    setSearch,
    refresh,
  } = useConversations();

  return (
    <div className="p-6">
      <Card className="overflow-hidden mb-4">
        <div className="flex items-center justify-between p-4 bg-surface-muted/50">
          <div>
            <h2 className="text-fg font-semibold">{chat.title}</h2>
            <p className="text-fg-muted text-sm">{chat.subtitle}</p>
          </div>
          {can(PERMISSIONS.chatView) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => showSuccess(chat.startComingSoon)}
              disabled={!can(PERMISSIONS.chatView)}
            >
              {chat.startConversation}
            </Button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <DataTable
          columns={conversationColumns}
          rows={data.itemList}
          rowKey={(row) => row.conversationId}
          toolbar={{
            search: {
              value: search,
              placeholder: chat.searchPlaceholder,
              onChange: setSearch,
            },
          }}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refresh()}
          emptyTitle={chat.empty}
        />
      </Card>
    </div>
  );
}
