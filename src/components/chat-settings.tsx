"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  Thermometer,
  BarChart,
  RepeatIcon,
  Zap,
  Sprout,
  Syringe,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useChatContext } from "@/app/ChatContext";

import { LucideIcon } from "lucide-react";

const LabelWithIcon = ({
  icon: Icon,
  text,
  value,
}: {
  icon: LucideIcon;
  text: string;
  value?: string;
}) => (
  <label className="flex w-full items-center justify-between text-sm font-medium mb-1">
    <div className="flex items-center">
      <Icon className="w-4 h-4 mr-2" />
      {text}
    </div>
    {value && <span className="font-semibold">{value}</span>}
  </label>
);

const ChatSettings = () => {
  const {
    models,
    selectedModel,
    setSelectedModel,
    customSystem,
    setCustomSystem,
    options,
    setOptions,
    streamResponse,
    clearMessages,
    setStreamResponse,
  } = useChatContext();

  return (
    <>
      <CardContent className="space-y-6 pt-4">
        <div>
          <LabelWithIcon icon={Syringe} text="System prompt" />
          <Textarea
            placeholder="You are experienced software engineer..."
            value={customSystem}
            onChange={(e) => setCustomSystem(e.target.value)}
            className="w-full p-2 rounded border"
          />
        </div>

        <div>
          <LabelWithIcon
            icon={Thermometer}
            text="Temperature"
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

        <div>
          <LabelWithIcon
            icon={BarChart}
            text="Top P"
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
            text="Repeat Penalty"
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
          <LabelWithIcon icon={Zap} text="Top K" />
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
          <LabelWithIcon icon={Sprout} text="Seed" />
          <Input
            type="number"
            value={options.seed || ""}
            onChange={(e) =>
              setOptions({
                ...options,
                seed: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className="w-full"
            placeholder="Random seed (optional)"
          />
        </div>

        <div>
          <LabelWithIcon icon={Zap} text="Max tokens to generate" />
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
            placeholder="typically 4096"
          />
        </div>

        <div className="flex items-center justify-between">
          <LabelWithIcon icon={Zap} text="Stream Responses" />
          <Switch
            checked={streamResponse}
            onCheckedChange={setStreamResponse}
          />
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={clearMessages}
          variant="destructive"
          className="w-full"
        >
          Clear Chat
        </Button>
      </CardFooter>
    </>
  );
};

export default ChatSettings;
