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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatContext } from "@/app/ChatContext";

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
    clearChat,
    setStreamResponse,
  } = useChatContext();

  return (
    <>
      <CardContent className="space-y-8 pt-8">
        <div>
          <label className="flex items-center text-sm font-medium mb-1">
            <Syringe className="w-4 h-4 mr-2 text-blue-500" />
            System prompt
          </label>
          <Textarea
            placeholder="You are experienced software engineer..."
            value={customSystem}
            onChange={(e) => setCustomSystem(e.target.value)}
            className="w-full p-2 rounded border"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-1">
            <Thermometer className="w-4 h-4 mr-2 text-red-500" />
            Temperature: {options.temperature.toFixed(1)}
          </label>
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
          <label className="flex items-center text-sm font-medium mb-1">
            <BarChart className="w-4 h-4 mr-2 text-green-500" />
            Top P: {options.topP.toFixed(1)}
          </label>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={[options.topP]}
            onValueChange={([topP]) => setOptions({ ...options, topP })}
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-1">
            <RepeatIcon className="w-4 h-4 mr-2 text-purple-500" />
            Repeat Penalty: {options.repeatPenalty.toFixed(1)}
          </label>
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
          <label className="flex items-center text-sm font-medium mb-1">
            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
            Top K: {options.topK}
          </label>
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
          <label className="flex items-center text-sm font-medium mb-1">
            <Sprout className="w-4 h-4 mr-2 text-green-500" />
            Seed
          </label>
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
          <label className="flex items-center text-sm font-medium mb-1">
            <Zap className="w-4 h-4 mr-2 text-blue-500" />
            Context length (input)
          </label>
          <Input
            type="number"
            value={options.num_ctx || ""}
            onChange={(e) =>
              setOptions({
                ...options,
                num_ctx: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            className="w-full"
            placeholder="typically 4096"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm font-medium">
            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
            Stream Responses
          </label>
          <Switch
            checked={streamResponse}
            onCheckedChange={setStreamResponse}
          />
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={clearChat} variant="outline" className="w-full">
          Clear Chat
        </Button>
      </CardFooter>
    </>
  );
};

export default ChatSettings;
