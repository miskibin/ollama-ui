import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, FileText, Brain, Database } from "lucide-react";

const AboutSection = () => {
  const features = [
    {
      icon: FileText,
      title: "100 000+",
      description: "przeanalizowanych stron",
    },
    {
      icon: Brain,
      title: "GPT 4",
      description: "i inne modele językowe",
    },
    {
      icon: Database,
      title: "7 000+",
      description: "aktów prawnych",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative max-w-4xl mx-auto px-4 z-0" // Added relative positioning and z-0
    >
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl font-semibold mb-6 text-primary"
      >
        O narzędziu
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-muted-foreground mb-6 leading-relaxed"
      >
        Asystent RP to zaawansowane narzędzie wykorzystujące sztuczną
        inteligencję do analizy i interpretacji polskiego prawa. Dzięki
        dostępowi do obszernej bazy aktów prawnych, asystent może szybko i
        precyzyjnie odpowiadać na pytania dotyczące przepisów, ułatwiając
        zrozumienie skomplikowanych kwestii prawnych.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <feature.icon className="h-12 w-12 text-primary mb-3" />
            <h3 className="text-2xl font-bold mb-1 text-primary">
              {feature.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-wrap gap-4 items-center my-12"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-muted-foreground mb-6 leading-relaxed"
        >
          Narzędzie powstało w ramach projektu{" "}
          <a
            href="https://sejm-stats.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline transition-colors duration-300"
          >
            Sejm Stats
          </a>
          , którego celem jest analiza i wizualizacja danych związanych z pracą
          Sejmu RP.
        </motion.p>
        <a
          href="https://discord.com/invite/zH2J3z5Wbf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:underline transition-colors duration-300"
        >
          Dołącz do nas na Discord <ExternalLink className="h-4 w-4" />
        </a>
        <a
          href="https://patronite.pl/sejm-stats"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:underline transition-colors duration-300"
        >
          Wesprzyj nas na Patronite <ExternalLink className="h-4 w-4" />
        </a>
      </motion.div>
    </motion.div>
  );
};

export default AboutSection;
