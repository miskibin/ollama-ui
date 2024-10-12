import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PluginDataDialogProps {
  pluginData: string;
  name: string;
}

const PluginDataDialog: React.FC<PluginDataDialogProps> = ({
  pluginData,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatPluginData = (data: string): string => {
    try {
      const parsedData = JSON.parse(data);
      return JSON.stringify(parsedData, null, 2);
    } catch (error) {
      return data; // If it's not JSON, return as is
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Badge
          className="text-xs cursor-pointer hover:bg-accent transition-colors"
          variant="secondary"
        >
          <Database className="w-3 h-3 mr-1" />
          {name}
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Data from: {name}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-100px)]">
          <pre className="p-6 text-sm bg-muted rounded-b-lg overflow-x-auto whitespace-pre-wrap break-words">
            {formatPluginData(pluginData)}
          </pre>
          <DialogFooter className="px-6 py-3 border-t bg-muted/50">
            <div className="flex items-center justify-center w-full text-sm text-muted-foreground">
              <Info className="w-4 h-4 mr-2" />
              <span>
                Shown data is already processed for AI model. Raw data may
                differ.
              </span>
            </div>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PluginDataDialog;
