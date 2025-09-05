import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Globe, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WebPageAnalyzerProps {
  onPageAnalyzed: (content: string, url: string) => void;
}

export const WebPageAnalyzer = ({ onPageAnalyzed }: WebPageAnalyzerProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите URL для анализа",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Here we would normally use the lov-fetch-website tool
      // For now, we'll simulate the analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockContent = `Содержимое веб-страницы: ${url}
      
Это симуляция анализа веб-страницы. В реальной реализации здесь будет:
- Извлечённый текстовый контент
- Метаданные страницы
- Структурированная информация
- Ключевые данные для анализа`;

      onPageAnalyzed(mockContent, url);
      setLastAnalyzedUrl(url);
      
      toast({
        title: "Успешно!",
        description: "Страница проанализирована и добавлена в контекст",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось проанализировать страницу",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleAnalyze();
    }
  };

  return (
    <Card className="p-4 bg-gradient-secondary border-chat-border">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Анализ веб-страницы</h3>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-secondary border-chat-border focus:border-primary"
            disabled={isLoading}
          />
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !url.trim()}
            className="px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Анализ'
            )}
          </Button>
        </div>

        {lastAnalyzedUrl && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Проанализировано: {lastAnalyzedUrl}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          Добавьте URL для анализа содержимого страницы в контекст чата
        </p>
      </div>
    </Card>
  );
};