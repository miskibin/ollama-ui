import React from "react";
import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="w-full py-6 border-t border-secondary/20 bg-background/50 backdrop-blur-sm"
    >
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          © {currentYear} Michał Skibiński. Wszelkie prawa zastrzeżone.
        </div>
        <div className="flex items-center gap-4">
          <motion.a
            whileHover={{ scale: 1.05 }}
            href="https://github.com/miskibin/ollama-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>GitHub Repository</span>
          </motion.a>
          <span className="text-sm text-muted-foreground">
            powered by{" "}
            <a
              href="https://sejm-stats.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              sejm-stats.pl
            </a>
          </span>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
