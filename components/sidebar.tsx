"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  Zap,
  Thermometer,
  BarChart,
  RepeatIcon,
  Sprout,
  Sun,
  Moon,
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
import { useTheme } from "next-themes";

interface SidebarProps {
  models: { name: string }[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  customSystem: string;
  setCustomSystem: (system: string) => void;
  options: {
    temperature: number;
    topP: number;
    topK: number;
    repeatPenalty: number;
    seed?: number | null;
    num_ctx?: number;
  };
  setOptions: (options: SidebarProps["options"]) => void;
  streamResponse: boolean;
  setStreamResponse: (stream: boolean) => void;
  clearChat: () => void;
}

export function Sidebar({
  models,
  selectedModel,
  setSelectedModel,
  customSystem,
  setCustomSystem,
  options,
  setOptions,
  streamResponse,
  setStreamResponse,
  clearChat,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="w-96 h-full overflow-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-500" />
            Chat Settings
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon className="h-6 w-6 text-gray-600" />
            ) : (
              <Sun className="h-6 w-6 text-yellow-400" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Models</SelectLabel>
                {models.map((model) => (
                  <SelectItem key={model.name} value={model.name}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">System</label>
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
                seed: parseInt(e.target.value) || null,
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
                num_ctx: parseInt(e.target.value) || undefined,
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

        <Button onClick={clearChat} variant="destructive" className="w-full">
          Clear Chat
        </Button>
      </CardFooter>
    </Card>
  );
}
