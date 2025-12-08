import { MessageCircle } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { ChatModal } from './ChatModal';

export const ChatWidget = () => {
  const { toggleChat, hasUnread, isOpen } = useChatContext();

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={`
          fixed bottom-4 right-4 sm:right-6 z-50
          w-14 h-14 rounded-full
          bg-primary text-primary-foreground
          shadow-lg hover:shadow-xl
          flex items-center justify-center
          transition-all duration-300
          hover:scale-110
          ${isOpen ? 'rotate-0' : 'rotate-0'}
          ${hasUnread ? 'animate-pulse' : ''}
        `}
        aria-label={isOpen ? 'Zatvori chat' : 'Otvori chat'}
      >
        <MessageCircle className="w-6 h-6" />
        
        {/* Unread indicator */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
            !
          </span>
        )}
      </button>

      {/* Chat Modal */}
      <ChatModal />
    </>
  );
};
