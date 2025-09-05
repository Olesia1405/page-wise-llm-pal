import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Скопировано!",
      description: "Сообщение скопировано в буфер обмена",
    });
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`
        max-w-[80%] group relative
        ${isUser 
          ? 'bg-gradient-primary text-primary-foreground' 
          : 'bg-gradient-secondary text-foreground'
        }
        rounded-2xl px-6 py-4 shadow-card
        transition-all duration-300 hover:shadow-glow
      `}>
        <div className="flex items-start gap-3">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
            ${isUser 
              ? 'bg-primary-foreground/20 text-primary-foreground' 
              : 'bg-primary text-primary-foreground'
            }
          `}>
            {isUser ? 'You' : 'AI'}
          </div>
          <div className="flex-1">
            <div className="prose prose-invert max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
            {message.model && !isUser && (
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                {message.model}
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className={`
            absolute top-2 right-2 opacity-0 group-hover:opacity-100 
            transition-opacity duration-200 h-8 w-8 p-0
            ${isUser ? 'hover:bg-primary-foreground/20' : 'hover:bg-primary/20'}
          `}
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
};