import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, FileSearch, Plus, Database, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message, SummarableText } from "@/lib/types";
import { useChatStore } from "@/lib/store";
import { Badge } from "./ui/badge";
import { extractTitlesAndUrls } from "@/lib/parseJson";

interface SummarableTextDialogProps {
  onSummarize: (item: SummarableText) => void;
  onAddToContext: (item: SummarableText) => void;
  message: Message;
}

const SummarableTextDialog: React.FC<SummarableTextDialogProps> = ({
  onSummarize,
  onAddToContext,
  message,
}) => {
  const summarableTexts = extractTitlesAndUrls(message.pluginData || "");
  const [isOpen, setIsOpen] = useState(false);
  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Badge
          className="text-xs cursor-pointer hover:bg-accent transition-colors"
          variant="secondary"
        >
          <Database className="w-3 h-3 mr-1" />
          Otwórz dokumenty
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Lista dokumentów
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-100px)]">
          <div className="p-6">
            {summarableTexts.length > 0 ? (
              <ul className="space-y-4">
                {summarableTexts.map((item, index) => (
                  <li key={index} className="bg-muted p-4  rounded-lg">
                    <h3 className=" mb-3 text-wrap">
                      {truncateText(item.title, 250)}
                    </h3>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(item.url, "_blank")}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Otwórz plik
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSummarize(item)}
                      >
                        <FileSearch className="mr-2 h-4 w-4" />
                        Streść
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddToContext(item)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Dodaj do kontekstu
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">
                Brak dokumentów do wyświetlenia.
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="px-6 py-3 border-t bg-muted/50">
          <div className="flex items-center justify-center w-full text-sm text-muted-foreground">
            <Info className="w-4 h-4 mr-2" />
            <span>
              Wyświetlone dokumenty mogą być wykorzystane do streszczenia lub
              dodania do kontekstu rozmowy.
            </span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SummarableTextDialog;
