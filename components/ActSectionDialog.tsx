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
import {
  FileText,
  FileSearch,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import { ActResponse, isActResponse } from "@/lib/types";
import SummarySection from "./summary";

interface Section {
  type: "TYTUŁ" | "DZIAŁ" | "Rozdział" | "Art";
  number: string;
  content: string;
}

export default function ActSectionsDialog({
  actSections,
}: {
  actSections: ActResponse[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  if (actSections.length === 0 || !actSections.every(isActResponse))
    return null;

  function parseSections(content: string): Section[] {
    const cleanedContent = content
      .split("\n")
      .filter((line) => !line.trim().match(/^Art\.\s*\.\s*Art\.$/))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const sections = cleanedContent.split(
      /(?=(TYTUŁ|DZIAŁ|Rozdział|Art\.)\s*\d+[a-zA-Z]?\.?)/
    );

    return sections
      .filter((section) => section.trim())
      .map((section) => {
        const tytulMatch = section.match(/TYTUŁ\s*(\d+[a-zA-Z]?)/);
        const dzialMatch = section.match(/DZIAŁ\s*(\d+[a-zA-Z]?)/);
        const rozdzialMatch = section.match(/Rozdział\s*(\d+[a-zA-Z]?)/);
        const artMatch = section.match(/Art\.\s*(\d+[a-zA-Z]?[a-zA-Z0-9]*)\./);

        let type: Section["type"];
        let number: string;
        let content: string;

        if (tytulMatch) {
          type = "TYTUŁ";
          number = tytulMatch[1];
          content = section.replace(/TYTUŁ\s*\d+[a-zA-Z]?/, "").trim();
        } else if (dzialMatch) {
          type = "DZIAŁ";
          number = dzialMatch[1];
          content = section.replace(/DZIAŁ\s*\d+[a-zA-Z]?/, "").trim();
        } else if (rozdzialMatch) {
          type = "Rozdział";
          number = rozdzialMatch[1];
          content = section.replace(/Rozdział\s*\d+[a-zA-Z]?/, "").trim();
        } else if (artMatch) {
          type = "Art";
          number = artMatch[1];
          content = section
            .replace(/Art\.\s*\d+[a-zA-Z]?[a-zA-Z0-9]*\./, "")
            .trim();
        } else {
          return null;
        }

        return { type, number, content };
      })
      .filter((section): section is Section => section !== null);
  }

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const renderContent = (content: string) => {
    return content.split("\n").map((line, index, array) => (
      <React.Fragment key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-primary/10 transition-colors duration-200"
        >
          <FileText className="w-3 h-3 mr-1.5" />
          Otwórz dokumenty
        </Badge>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[900px] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary" />
            Użyte fragmenty
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-grow overflow-y-auto">
          <div className="p-4 space-y-4">
            {actSections.map((item, index) => (
              <div key={index} className="border rounded-lg bg-card">
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-medium mb-2">
                      {item.act_title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Znaki: {formatNumber(item.content.length)}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          item.similarity_score > 0.8
                            ? "bg-green-100 text-green-800"
                            : item.similarity_score > 0.6
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        Zgodność: {item.similarity_score.toFixed(2)}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(item.act_url, "_blank")}
                    >
                      <ExternalLink className="mr-1.5 h-3 w-3" />
                      Otwórz
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleSection(index)}
                    >
                      {expandedSections.includes(index) ? (
                        <ChevronUp className="mr-1.5 h-3 w-3" />
                      ) : (
                        <ChevronDown className="mr-1.5 h-3 w-3" />
                      )}
                      {expandedSections.includes(index) ? "Zwiń" : "Rozwiń"}
                    </Button>
                  </div>

                  {/* Content Section */}
                  {expandedSections.includes(index) && (
                    <div className="space-y-3 mt-3 border-t pt-3">
                      <SummarySection summary={item.summary} />
                      {parseSections(item.content).map((section, i) => (
                        <div
                          key={i}
                          className={cn(
                            "rounded p-2",
                            section.type === "TYTUŁ"
                              ? "bg-muted/40"
                              : section.type === "DZIAŁ"
                              ? "bg-muted/30"
                              : section.type === "Rozdział"
                              ? "bg-muted/20"
                              : "bg-muted/10"
                          )}
                        >
                          <div className="flex gap-2 items-baseline">
                            <span className="font-medium text-primary whitespace-nowrap text-sm">
                              {section.type === "Art"
                                ? `Art. ${section.number}`
                                : `${section.type} ${section.number}`}
                            </span>
                            <p className="text-sm">
                              {renderContent(section.content)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t p-4">
          <div className="text-center text-xs text-muted-foreground flex items-center justify-center w-full">
            <Info className="w-4 h-4 mr-1.5 text-primary" />
            Dokumenty mogą być wykorzystane do streszczenia lub dodania do
            kontekstu rozmowy.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
