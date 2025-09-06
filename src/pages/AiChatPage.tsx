import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/ChatMessage';
import { ModelSelector, models } from '@/components/ModelSelector';
import { WebPageAnalyzer } from '@/components/WebPageAnalyzer';
import { ChatSettings } from '@/components/ChatSettings';
import { ChatsList } from '@/components/ChatsList';
import { UserMenu } from '@/components/UserMenu';
import { Send, Trash2, Brain, Sidebar, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

export default function AiChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pageContext, setPageContext] = useState<string | null>(null);
  const [analyzedUrl, setAnalyzedUrl] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Settings
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [systemPrompt, setSystemPrompt] = useState('Ты полезный AI-помощник. Отвечай на русском языке, будь дружелюбным и информативным.');
  const [streamResponse, setStreamResponse] = useState(true);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages for selected chat
  const loadMessages = async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        model: msg.model || undefined,
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить сообщения",
        variant: "destructive",
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  // Create new chat
  const createNewChat = async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chats')
        .insert([
          {
            user_id: user.id,
            title: 'Новый чат',
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать чат",
        variant: "destructive",
      });
      return null;
    }
  };

  // Save message to database
  const saveMessage = async (chatId: string, role: 'user' | 'assistant', content: string, model?: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: chatId,
            role,
            content,
            model,
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
      // Don't show error to user for message saving failures
    }
  };

  // Update chat title based on first message
  const updateChatTitle = async (chatId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    try {
      const { error } = await supabase
        .from('chats')
        .update({ title })
        .eq('id', chatId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    // This is a mock response - in a real implementation, you would call the actual API
    const model = models.find(m => m.id === selectedModel);
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = [
      `Я понял ваш вопрос "${userMessage}". Это интересная тема для обсуждения.`,
      `Отличный вопрос! Позвольте мне подумать над "${userMessage}" и дать развернутый ответ.`,
      `Согласно модели ${model?.name}, могу сказать следующее по поводу "${userMessage}".`,
      `Это зависит от контекста, но относительно "${userMessage}" могу предложить несколько вариантов.`
    ];
    
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    if (pageContext && analyzedUrl) {
      response += `\n\nТакже учитывая контекст страницы ${analyzedUrl}, могу добавить, что это связано с проанализированным содержимым.`;
    }
    
    return response;
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    let chatId = currentChatId;
    
    // Create new chat if none selected
    if (!chatId) {
      chatId = await createNewChat();
      if (!chatId) return;
      setCurrentChatId(chatId);
    }

    const userMessageContent = inputMessage.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Save user message
    await saveMessage(chatId, 'user', userMessageContent);

    // Update chat title if this is the first message
    if (messages.length === 0) {
      await updateChatTitle(chatId, userMessageContent);
    }

    try {
      const responseContent = await generateResponse(userMessageContent);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        model: models.find(m => m.id === selectedModel)?.name,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message
      await saveMessage(chatId, 'assistant', responseContent, assistantMessage.model);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось получить ответ от модели",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setPageContext(null);
    setAnalyzedUrl(null);
    toast({
      title: "Чат очищен",
      description: "История сообщений удалена",
    });
  };

  const handlePageAnalyzed = (content: string, url: string) => {
    setPageContext(content);
    setAnalyzedUrl(url);
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
    loadMessages(chatId);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setPageContext(null);
    setAnalyzedUrl(null);
  };

  return (
    <div className="min-h-screen bg-gradient-chat text-foreground flex">
      {/* Sidebar with chats */}
      <div className={`
        ${sidebarOpen ? 'w-80' : 'w-0'} 
        transition-all duration-300 bg-secondary border-r border-chat-border
        flex-shrink-0 overflow-hidden flex flex-col
      `}>
        <div className="p-4 border-b border-chat-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Чаты</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ChatsList 
          selectedChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Settings sidebar */}
      <div className={`
        ${sidebarOpen ? 'w-80' : 'w-0'} 
        transition-all duration-300 bg-secondary border-r border-chat-border
        flex-shrink-0 overflow-hidden
      `}>
        <div className="p-4 space-y-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Настройки</h2>
          </div>
          
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
          
          <WebPageAnalyzer onPageAnalyzed={handlePageAnalyzed} />
          
          <ChatSettings
            temperature={temperature}
            onTemperatureChange={setTemperature}
            maxTokens={maxTokens}
            onMaxTokensChange={setMaxTokens}
            systemPrompt={systemPrompt}
            onSystemPromptChange={setSystemPrompt}
            streamResponse={streamResponse}
            onStreamResponseChange={setStreamResponse}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-chat-border bg-secondary/50">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="h-8 w-8 p-0"
              >
                <Sidebar className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AI Агент
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {analyzedUrl && (
              <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                Контекст: {analyzedUrl}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Очистить
            </Button>
            <UserMenu />
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <Card className="p-8 text-center bg-gradient-secondary border-chat-border max-w-md">
                  <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Добро пожаловать!</h2>
                  <p className="text-muted-foreground text-sm">
                    Задайте любой вопрос или добавьте веб-страницу для анализа. 
                    Я готов помочь с информацией и ответами.
                  </p>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-6">
                    <Card className="bg-gradient-secondary p-4 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-chat-border bg-secondary/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Напишите ваше сообщение..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 bg-secondary border-chat-border focus:border-primary"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !inputMessage.trim()}
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Модель: {models.find(m => m.id === selectedModel)?.name} • 
              Температура: {temperature} • 
              Макс. токенов: {maxTokens}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}