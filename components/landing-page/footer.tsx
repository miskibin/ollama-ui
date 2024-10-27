import React from "react";
import { Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 border-t border-secondary/20 bg-background/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="text-sm text-muted-foreground">
          © {currentYear} Michał Skibiński. Wszelkie prawa zastrzeżone.
        </div>
        <nav className="flex flex-wrap justify-center items-center gap-6">
          <a
            href="https://github.com/miskibin/ollama-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            <span>GitHub</span>
          </a>

          <a
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Polityka prywatności
          </a>
          <a
            href="/terms-of-service"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Regulamin
          </a>
          <a
            href="mailto:michalskibinski109@gmail.com"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Kontakt
          </a>
        </nav>
      </div>
    </footer>
  );
}
