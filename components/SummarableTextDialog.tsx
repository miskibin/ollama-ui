"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, FileSearch, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Artifact } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { extractSummarableTexts } from "@/lib/parseJson";
import { useChatLogic } from "@/hooks/useChatLogic";
import { formatNumber } from "@/lib/utils";

interface SummarableTextDialogProps {
  artifacts: Artifact[];
}

export default function Component({ artifacts }: SummarableTextDialogProps) {
  const summarableTexts = useMemo(
    () => extractSummarableTexts(artifacts),
    [artifacts]
  );
  const { handleSummarize } = useChatLogic();
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
          className="text-xs cursor-pointer text-primary border-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          variant="outline"
        >
          <FileText className="w-3 h-3 mr-1" />
          Otwórz dokumenty
        </Badge>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0 bg-muted/50">
          <DialogTitle className="font-semibold flex items-center text-lg">
            <FileText className="w-5 h-5 mr-2" />
            Lista dokumentów
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow overflow-auto">
          <div className="p-6">
            <ul className="space-y-6">
              {summarableTexts.map((item, index) => (
                <li key={index} className="bg-card p-4 rounded-lg shadow-sm">
                  <h3 className="mb-3 text-base font-medium">
                    {truncateText(item.title, 1050)
                      .split("\n")
                      .map((line, i) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))}
                  </h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(item.url, "_blank")}
                      className="bg-background hover:bg-accent"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Otwórz plik
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setIsOpen(false);
                        handleSummarize(
                          item.url,
                          "",
                          `Podsumowanie dokumentu: [${item.title}](${item.url})\n\n${item.summary}`
                        );
                      }}
                    >
                      <FileSearch className="mr-2 h-4 w-4" />
                      Streść
                    </Button>
                    <div className="flex gap-2 ml-auto">
                      <Badge
                        variant="secondary"
                        className="text-xs text-muted-foreground"
                      >
                        Ilość znaków: {formatNumber(item.text_length)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-xs text-muted-foreground"
                      >
                        zgodność: {item.similarity.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
        <DialogFooter className="border-t bg-muted/50 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-center w-full text-muted-foreground text-sm">
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
