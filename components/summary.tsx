import React from "react";
import { Bot, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SummarySectionProps {
  summary: string;
}

export default function SummarySection({ summary }: SummarySectionProps) {
  return (
    <div className="mb-4 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg" />
      <div className="relative bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-primary/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-primary">Streszczenie</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {summary}
        </p>
      </div>
    </div>
  );
}
