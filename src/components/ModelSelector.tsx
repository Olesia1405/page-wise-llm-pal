import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens: number;
}

export const models: Model[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Самая мощная модель OpenAI',
    maxTokens: 4096
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI', 
    description: 'Быстрая и эффективная модель',
    maxTokens: 16384
  },
  {
    id: 'llama-3.1-sonar-small-128k-online',
    name: 'Llama 3.1 Sonar Small',
    provider: 'Perplexity',
    description: 'Модель с доступом в интернет',
    maxTokens: 4096
  },
  {
    id: 'llama-3.1-sonar-large-128k-online',
    name: 'Llama 3.1 Sonar Large',
    provider: 'Perplexity',
    description: 'Мощная модель с веб-поиском',
    maxTokens: 4096
  }
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  const currentModel = models.find(m => m.id === selectedModel);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Модель</label>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-full bg-secondary border-chat-border">
          <SelectValue placeholder="Выберите модель" />
        </SelectTrigger>
        <SelectContent className="bg-secondary border-chat-border">
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id} className="focus:bg-chat-hover">
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {model.provider}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {model.description}
                  </p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {currentModel && (
        <div className="text-xs text-muted-foreground">
          Максимум токенов: {currentModel.maxTokens.toLocaleString()}
        </div>
      )}
    </div>
  );
};