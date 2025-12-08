import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  hasUnread: boolean;
  lastBookingSuccess: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastBookingSuccess, setLastBookingSuccess] = useState(false);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    if (!isOpen) {
      setHasUnread(false);
    }
    setIsOpen(prev => !prev);
  }, [isOpen]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastBookingSuccess(false);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/live-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message || data.error || 'Žao mi je, došlo je do greške.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check if booking was successful
      if (data.bookingSuccess) {
        setLastBookingSuccess(true);
        // Reset after showing
        setTimeout(() => setLastBookingSuccess(false), 5000);
      }

      // Set unread if chat is closed
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Žao mi je, trenutno imam tehničkih poteškoća. Molimo kontaktirajte nas na telefon +387 51 123 456.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isOpen]);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        messages,
        isLoading,
        hasUnread,
        lastBookingSuccess,
        openChat,
        closeChat,
        toggleChat,
        sendMessage,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
