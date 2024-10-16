import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Info,
  Calendar,
  HardDrive,
  Hash,
  Box,
  Cpu,
  Layers,
  Scale,
} from "lucide-react";
import { useChatContext } from "@/app/ChatContext";

const ModelSelector = () => {
  const { models, selectedModel, setSelectedModel } = useChatContext();

  const selectedModelData = models.find(
    (model) => model.name === selectedModel
  );

  return (
    <div className="flex items-center space-x-2">
      <Select value={selectedModel} onValueChange={setSelectedModel}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {models && models.length > 0 ? (
              models.map((model) => (
                <SelectItem
                  key={model.name}
                  value={model.name}
                  className="flex items-center justify-between py-2"
                >
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-1 ml-2">
                    {model.details.parameter_size}
                  </span>
                </SelectItem>
              ))
            ) : (
              <SelectItem value="you have to run ollama first" disabled={true}>
                you have to run ollama first
              </SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <Info className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          {selectedModelData ? (
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-semibold text-lg">
                  {selectedModelData.name}
                </h4>
                <span className="text-xs bg-primary/10 rounded-full px-2 py-1">
                  {selectedModelData.details.parameter_size}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    {new Date(
                      selectedModelData.modified_at
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-gray-500" />
                  <span>
                    {(selectedModelData.size / 1024 / 1024 / 1024).toFixed(2)}{" "}
                    GB
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <span>{selectedModelData.digest.slice(0, 10)}...</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Box className="h-4 w-4 text-gray-500" />
                  <span>{selectedModelData.details.format}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-gray-500" />
                  <span>{selectedModelData.details.family}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-gray-500" />
                  <span>{selectedModelData.details.families || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-2 col-span-2">
                  <Scale className="h-4 w-4 text-gray-500" />
                  <span>{selectedModelData.details.quantization_level}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No model selected
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ModelSelector;
