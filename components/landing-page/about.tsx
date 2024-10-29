import React from "react";
import { motion } from "framer-motion";
import { ExternalLink, FileText, Brain, Database } from "lucide-react";

const AboutSection = () => {
  const features = [
    {
      icon: FileText,
      title: "150 000+",
      description: "przeanalizowanych stron",
    },
    {
      icon: Brain,
      title: "GPT 4",
      description: "i inne modele językowe",
    },
    {
      icon: Database,
      title: "11 000+",
      description: "aktów prawnych",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="relative max-w-4xl mx-auto px-4 z-0"
    >
      <h2 className="text-3xl font-semibold mb-6 text-primary">O narzędziu</h2>
      <p className="text-muted-foreground mb-6 leading-relaxed">
        Asystent RP to zaawansowane narzędzie wykorzystujące sztuczną
        inteligencję do analizy i interpretacji polskiego prawa. Dzięki
        dostępowi do obszernej bazy aktów prawnych, asystent może szybko i
        precyzyjnie odpowiadać na pytania dotyczące przepisów, ułatwiając
        zrozumienie skomplikowanych kwestii prawnych.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <feature.icon className="h-12 w-12 text-primary mb-3" />
            <h3 className="text-2xl font-bold mb-1 text-primary">
              {feature.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 items-center my-12">
        <p className="text-muted-foreground mb-6 leading-relaxed">
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
        </p>
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
      </div>
    </motion.div>
  );
};

export default AboutSection;
