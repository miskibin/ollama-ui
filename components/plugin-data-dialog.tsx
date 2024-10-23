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
import { Database, Info, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/store";
import { Artifact } from "@/lib/types";

interface PluginDataDialogProps {
  artifacts: Artifact[];
}

const PluginDataDialog: React.FC<PluginDataDialogProps> = ({ artifacts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { plugins } = useChatStore();

  if (!artifacts.length) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Database className="h-4 w-4" />
          {artifacts[0].type === "sejm_stats" ? "Dane sejmowe" : "Dane"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Dane z {plugins.find((plugin) => plugin.enabled)?.name}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-100px)]">
          {artifacts.map((artifact, index) => (
            <div key={index} className="border-b last:border-b-0">
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {artifact.question}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    {artifact.searchQuery}
                  </Badge>
                </div>
                <pre className="p-4 text-sm bg-muted rounded-lg overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(artifact.data, null, 2)}
                </pre>
              </div>
            </div>
          ))}
          <DialogFooter className="px-6 py-3 border-t bg-muted/50">
            <div className="flex items-center justify-center w-full text-sm text-muted-foreground">
              <Info className="w-4 h-4 mr-2" />
              <span>
                Wyświetlone dane pochodzą z rozszerzeń i mogą być wstępnie
                przetworzone.
              </span>
            </div>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PluginDataDialog;
