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
import {
  Database,
  Info,
  Search,
  HelpCircle,
  BookOpen,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/store";
import { Artifact } from "@/lib/types";

interface PluginDataDialogsProps {
  artifacts: Artifact[];
}

const PluginDataDialogs: React.FC<PluginDataDialogsProps> = ({ artifacts }) => {
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});
  const { plugins } = useChatStore();

  if (!artifacts.length) return null;

  // Group artifacts by type
  const artifactsByType = artifacts.reduce(
    (acc: Record<string, Artifact[]>, artifact) => {
      if (!acc[artifact.type]) {
        acc[artifact.type] = [];
      }
      acc[artifact.type].push(artifact);
      return acc;
    },
    {}
  );

  const getPluginInfo = (type: string) => {
    switch (type) {
      case "sejm_stats":
        return {
          title: "Dane sejmowe",
          icon: Building2,
          buttonText: "Dane sejmowe",
        };
      case "wikipedia":
        return {
          title: "Wikipedia",
          icon: BookOpen,
          buttonText: "Dane z Wikipedii",
        };
      default:
        return {
          title: "Dane",
          icon: Database,
          buttonText: "Dane",
        };
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(artifactsByType).map(([type, typeArtifacts]) => {
        const { title, icon: Icon, buttonText } = getPluginInfo(type);
        const plugin = plugins.find((p) => p.enabled);

        return (
          <Dialog
            key={type}
            open={openDialogs[type]}
            onOpenChange={(open) =>
              setOpenDialogs((prev) => ({ ...prev, [type]: open }))
            }
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Icon className="h-4 w-4" />
                {buttonText}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] p-0">
              <DialogHeader className="px-6 py-4 border-b">
                <DialogTitle className="text-lg font-semibold flex items-center">
                  <Icon className="w-5 h-5 mr-2" />
                  {title} {plugin && `- ${plugin.name}`}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(80vh-100px)]">
                {typeArtifacts.map((artifact, index) => (
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
      })}
    </div>
  );
};

export default PluginDataDialogs;
