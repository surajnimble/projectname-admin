import type { Metadata } from 'next';
import { ChatPage } from '@/components/chat/chat-page';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = {
  title: MESSAGES.chat.title,
};

export default function ChatPageWrapper() {
  return <ChatPage />;
}
