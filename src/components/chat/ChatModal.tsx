import { useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatContext, ChatMessage } from '@/contexts/ChatContext';
import { useState } from 'react';
import { format } from 'date-fns';

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-secondary text-secondary-foreground rounded-bl-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {format(message.timestamp, 'HH:mm')}
        </p>
      </div>
    </div>
  );
};

export const ChatModal = () => {
  const { isOpen, closeChat, messages, isLoading, sendMessage, clearMessages } = useChatContext();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[70vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-semibold">VetHealth Asistent</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-primary-foreground/80">Online 24/7</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
              title="Obriši razgovor"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={closeChat}
            className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Zdravo! Ja sam AI asistent veterinarske ordinacije VetHealth. 
                Kako vam mogu pomoći?
              </p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => sendMessage('Koje usluge nudite?')}
                  className="block w-full text-left px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm transition-colors"
                >
                  Koje usluge nudite?
                </button>
                <button
                  onClick={() => sendMessage('Kako mogu zakazati termin?')}
                  className="block w-full text-left px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm transition-colors"
                >
                  Kako mogu zakazati termin?
                </button>
                <button
                  onClick={() => sendMessage('Koje je vaše radno vrijeme?')}
                  className="block w-full text-left px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm transition-colors"
                >
                  Koje je vaše radno vrijeme?
                </button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Bot className="w-4 h-4 text-secondary-foreground" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Unesite poruku..."
            className="min-h-[44px] max-h-24 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="h-11 w-11 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
