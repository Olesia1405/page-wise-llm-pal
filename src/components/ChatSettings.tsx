import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';

interface ChatSettingsProps {
  temperature: number;
  onTemperatureChange: (temperature: number) => void;
  maxTokens: number;
  onMaxTokensChange: (maxTokens: number) => void;
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
  streamResponse: boolean;
  onStreamResponseChange: (stream: boolean) => void;
}

export const ChatSettings = ({
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
  systemPrompt,
  onSystemPromptChange,
  streamResponse,
  onStreamResponseChange,
}: ChatSettingsProps) => {
  return (
    <Card className="p-4 bg-gradient-secondary border-chat-border space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-primary" />
        <h3 className="font-medium text-sm">Настройки</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="temperature" className="text-xs">
              Температура
            </Label>
            <span className="text-xs text-muted-foreground">
              {temperature.toFixed(1)}
            </span>
          </div>
          <Slider
            id="temperature"
            min={0}
            max={2}
            step={0.1}
            value={[temperature]}
            onValueChange={(value) => onTemperatureChange(value[0])}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Творческий подход к ответам (0 = точный, 2 = креативный)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxTokens" className="text-xs">
            Максимум токенов
          </Label>
          <Input
            id="maxTokens"
            type="number"
            min={1}
            max={4096}
            value={maxTokens}
            onChange={(e) => onMaxTokensChange(parseInt(e.target.value) || 1000)}
            className="bg-secondary border-chat-border text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="systemPrompt" className="text-xs">
            Системный промпт
          </Label>
          <textarea
            id="systemPrompt"
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange(e.target.value)}
            className="w-full min-h-[80px] px-3 py-2 text-xs bg-secondary border border-chat-border rounded-md resize-none focus:border-primary focus:outline-none"
            placeholder="Введите системный промпт для настройки поведения модели..."
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="stream" className="text-xs">
            Потоковый ответ
          </Label>
          <Switch
            id="stream"
            checked={streamResponse}
            onCheckedChange={onStreamResponseChange}
          />
        </div>
      </div>
    </Card>
  );
};