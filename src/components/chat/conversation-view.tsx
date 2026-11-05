'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConversationMessages } from '@/hooks/use-chat';
import type { MessageData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';

const { chat } = MESSAGES;

interface ConversationViewProps {
  conversationId: string;
}

export function ConversationView({ conversationId }: ConversationViewProps) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const {
    data,
    isLoading,
    sendMessage,
    markRead,
  } = useConversationMessages(conversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    void markRead();
  }, [data.itemList, markRead]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const ok = await sendMessage({ body: inputValue });
    if (ok) {
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 overflow-hidden flex flex-col border-none">
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
            <span className="font-medium text-fg">{chat.backToConversations}</span>
          </div>
          <Badge intent="default">{chat.conversation}</Badge>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {data.itemList.map((message: MessageData) => (
            <div
              key={message.messageId}
              className={`flex gap-3 ${
                message.senderData.name ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center shrink-0">
                <span className="text-xs font-medium">
                  {message.senderData.name?.slice(0, 1).toUpperCase()}
                </span>
              </div>
              <div className="max-w-lg">
                <p className="text-sm text-fg break-words">{message.body}</p>
                <p className="text-xs text-fg-muted mt-1">{message.createdAt}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-border bg-surface">
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={chat.typeMessage}
              disabled={isLoading}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              loading={isLoading}
            >
              {chat.send}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
