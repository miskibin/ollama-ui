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
import { FileText, FileSearch, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Artifact } from "@/lib/types";
import { Badge } from "./ui/badge";
import { extractSummarableTexts } from "@/lib/parseJson";

interface SummarableTextDialogProps {
  artifacts: Artifact[];
  onSummarize: (pdfUrl: string) => void;
}

export default function SummarableTextDialog({ artifacts, onSummarize }: SummarableTextDialogProps) {
  const summarableTexts = extractSummarableTexts(artifacts);
  const [isOpen, setIsOpen] = useState(false);

  if (summarableTexts.length === 0) {
    return null;
  }

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
          <FileText className="w-3 h-3 mr-1" />
          Otwórz dokumenty
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b flex-shrink-0">
          <DialogTitle className="font-semibold flex items-center text-base sm:text-lg">
            <FileText className="w-5 h-5 mr-2" />
            Lista dokumentów
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow overflow-auto">
          <div className="p-4 sm:p-6">
            <ul className="space-y-4">
              {summarableTexts.map((item, index) => (
                <li
                  key={index}
                  className="bg-muted p-3 sm:p-4 rounded-lg"
                >
                  <h3 className="mb-2 sm:mb-3 text-sm sm:text-base">
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
                  <div className="flex flex-wrap gap-2">
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
                      onClick={() => {
                        setIsOpen(false);
                        onSummarize(item.url);
                      }}
                    >
                      <FileSearch className="mr-2 h-4 w-4" />
                      Streść
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
        <DialogFooter className="border-t bg-muted/50 px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0">
          <div className="flex items-center justify-center w-full text-muted-foreground text-xs sm:text-sm">
            <Info className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-center">
              Wyświetlone dokumenty mogą być wykorzystane do streszczenia lub
              dodania do kontekstu rozmowy.
            </span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}