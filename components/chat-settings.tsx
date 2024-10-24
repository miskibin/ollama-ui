import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Thermometer,
  BarChart,
  RepeatIcon,
  Zap,
  Sprout,
  Settings2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useChatContext } from "@/app/ChatContext";
import { LucideIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

const LabelWithIcon = ({
  icon: Icon,
  text,
  value,
}: {
  icon: LucideIcon;
  text: string;
  value?: string;
}) => (
  <label className="flex items-center justify-between text-sm font-medium mb-1">
    <div className="flex items-center">
      <Icon className="w-4 h-4 mr-2" />
      {text}
    </div>
    {value && <span className="font-semibold">{value}</span>}
  </label>
);

const ChatSettings = ({ isPatron }: { isPatron: boolean }) => {
  const {
    systemPrompt,
    setSystemPrompt,
    options,
    setOptions,
    models,
    selectedModel,
    setSelectedModel,
    patrons,
  } = useChatStore();

  const handleModelChange = (value: string) => {
    if (isPatron === true) {
      setSelectedModel(value);
    }
  };

  return (
    <div className="space-y-8 pt-8">
      <div>
        <div className="flex items-center justify-between mb-2">
          <LabelWithIcon icon={Zap} text="Model" />
          <Badge variant="default">Tylko dla patronów</Badge>
        </div>
        <Select
          onValueChange={handleModelChange}
          value={selectedModel}
          disabled={!isPatron}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Wybierz model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem
                key={model.name}
                value={model.name}
                className="flex justify-between"
              >
                <span>{model.name.split("/")[1].split("-", 3).join("-")}</span>
                <Badge variant="secondary" className="ml-2">
                  {model.description}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full text-sm">
            <Settings2 className="w-4 h-4 mr-2" />
            Opcje zaawansowane
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <LabelWithIcon
                icon={BarChart}
                text="Maks P"
                value={options.topP.toFixed(1)}
              />
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[options.topP]}
                onValueChange={([topP]) => setOptions({ ...options, topP })}
              />
            </div>

            <div>
              <LabelWithIcon
                icon={RepeatIcon}
                text="Kara za powtórzenia"
                value={options.repeatPenalty.toFixed(1)}
              />
              <Slider
                min={1}
                max={2}
                step={0.1}
                value={[options.repeatPenalty]}
                onValueChange={([repeatPenalty]) =>
                  setOptions({ ...options, repeatPenalty })
                }
              />
            </div>
            <div>
              <LabelWithIcon
                icon={Thermometer}
                text="Kreatywność"
                value={options.temperature.toFixed(1)}
              />
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[options.temperature]}
                onValueChange={([temperature]) =>
                  setOptions({ ...options, temperature })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <LabelWithIcon icon={Zap} text="Odpowiadaj na bieżąco" />
              <Switch
                checked={options.streaming}
                onCheckedChange={(streaming) =>
                  setOptions({ ...options, streaming })
                }
              />
            </div>

            <div>
              <LabelWithIcon icon={Zap} text="Maks K" />
              <Input
                type="number"
                value={options.topK}
                onChange={(e) =>
                  setOptions({ ...options, topK: parseInt(e.target.value) })
                }
                className="w-full"
              />
            </div>

            <div>
              <LabelWithIcon icon={Sprout} text="Ziarno" />
              <Input
                type="number"
                value={options.seed || ""}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    seed: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full"
                placeholder="Ziarno losowe (opcjonalne)"
              />
            </div>

            <div>
              <LabelWithIcon icon={Zap} text="Maks. liczba tokenów" />
              <Input
                type="number"
                value={options.num_predict || ""}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    num_predict: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full"
                placeholder="Default: 4096"
              />
            </div>

            {/* <div>
              <LabelWithIcon icon={Zap} text="Prompt systemowy" />
              <Textarea
                placeholder="You are experienced software engineer..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full p-2 rounded border h-20 resize-none text-sm"
              />
            </div> */}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChatSettings;
