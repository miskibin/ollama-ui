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
import { Badge } from "./ui/badge";
import { extractTitlesAndUrls } from "@/lib/parseJson";

interface SummarableTextDialogProps {
  onSummarize: (item: SummarableText) => void;
  message: Message;
}

const SummarableTextDialog: React.FC<SummarableTextDialogProps> = ({
  onSummarize,
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
          className="text-xs cursor-pointer text-primary border-primary hover:bg-accent transition-colors"
          variant="secondary"
        >
          <Database className="w-3 h-3 mr-1" />
          Otwórz dokumenty
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] p-0">
        <DialogHeader className="md:px-6 md:py-4 border-b sm:px-6 sm:py-4 px-4 py-2">
          <DialogTitle className="font-semibold flex items-center sm:text-lg text-base">
            <Database className="w-5 h-5 mr-2" />
            Lista dokumentów
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-100px)]">
          <div className="md:p-6 p-2">
            {summarableTexts.length > 0 ? (
              <ul className="space-y-4">
                {summarableTexts.map((item, index) => (
                  <li
                    key={index}
                    className="bg-muted md:p-4 rounded-lg sm:p-4 p-2"
                  >
                    <h3 className="md:mb-3 text-wrap sm:mb-3 mb-2">
                      {truncateText(item.title, 1050)
                        .split("\n")
                        .map((line, i) => (
                          <span key={i}>
                            {line}
                            <br />
                            <br />
                          </span>
                        ))}
                    </h3>
                    <div className="flex flex-wrap space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(item.url, "_blank")}
                        className="sm:mb-0 mb-2"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Otwórz plik
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsOpen(false);
                          onSummarize(item);
                        }}
                        className="sm:mb-0 mb-2"
                      >
                        <FileSearch className="mr-2 h-4 w-4" />
                        Streść
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
        <DialogFooter className="border-t bg-muted/50 sm:px-6 sm:py-3 px-4 py-2">
          <div className="flex items-center justify-center w-full text-muted-foreground sm:text-sm text-xs">
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
