'use client';

import { useState } from 'react';
import { ConversationList } from '@/components/chat/conversation-list';
import { ConversationView } from '@/components/chat/conversation-view';

export function ChatPage() {
  const [selectedConversation] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen">
      {selectedConversation ? (
        <ConversationView conversationId={selectedConversation} />
      ) : (
        <ConversationList />
      )}
    </div>
  );
}
