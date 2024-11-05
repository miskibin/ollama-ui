import React from "react";
import { motion } from "framer-motion";
import {
  Beaker,
  FlaskConical,
  Rocket,
  FileSearch,
  Puzzle,
  Zap,
  AlertCircle,
  Code2,
  BrainCircuit,
  Network,
  Scale,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

const EvolutionSection = () => {
  const phases = [
    {
      icon: Beaker,
      secondaryIcons: [FileSearch, Puzzle, AlertCircle],
      title: "Pierwsze kroki",
      status: "Ukończone",
      features: [
        "Podstawowa analiza ustaw oparta o wstępne streszczenia",
        "Prosta analiza początków dokumentów",
        "Brak zaawansowanej weryfikacji wyników",
        "Ograniczone możliwości filtrowania danych",
      ],
      disclaimer:
        "Ten etap pozwolił mi zebrać feedback od użytkowników i zidentyfikować kluczowe obszary do rozwoju.",
    },
    {
      icon: FlaskConical,
      secondaryIcons: [Code2, BrainCircuit, ShieldAlert],
      title: "Obecny etap",
      status: "W fazie testów",
      features: [
        "Kompleksowy system 60+ testów weryfikacyjnych",
        "Inteligentny podział ustaw na części logiczne",
        "Zaawansowane metadane: tagi, streszczenia, struktura",
        "Analiza wielu ustaw jednocześnie",
      ],
      disclaimer:
        "Mimo znacznych ulepszeń, system wciąż może popełniać błędy. Każda odpowiedź powinna być zweryfikowana w źródłowych dokumentach prawnych.",
    },
    {
      icon: Rocket,
      secondaryIcons: [Network, Scale, Zap],
      title: "Przyszłe funkcje",
      status: "Zaplanowane",
      features: [
        "Automatyczne wykrywanie powiązań między ustawami",
        "System rekomendacji podobnych przepisów",
        "Zaawansowana analiza kontekstowa",
        "Personalizowane widoki i filtry",
      ],
      disclaimer: (
        <span className="flex items-center gap-2">
          
          <a
            href="https://github.com/miskibin/sejm-stats/milestone/1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Śledź postępy na github
          </a>
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-4 py-16">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Ewolucja systemu</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Zobacz jak rozwijam system, aby zapewnić najwyższą jakość i
          precyzję odpowiedzi w kwestiach prawnych. Pamiętaj, że to wciąż
          narzędzie w fazie rozwoju i wymaga weryfikacji odpowiedzi.
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-primary/20 hidden lg:block" />

        <div className="space-y-12 lg:space-y-24">
          {phases.map((phase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`relative lg:grid lg:grid-cols-2 gap-8 items-center ${
                index % 2 === 0 ? "lg:text-right" : "lg:text-left"
              }`}
            >
              <div className="absolute left-1/2 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary hidden lg:block" />

              <div
                className={
                  index % 2 === 0 ? "lg:pr-16" : "lg:pl-16 lg:col-start-2"
                }
              >
                <div
                  className={`p-6 rounded-xl bg-card border border-border shadow-lg ${
                    index % 2 === 0 ? "lg:text-right" : "lg:text-left"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <phase.icon className="w-10 h-10 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-bold text-xl">{phase.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        {phase.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {phase.secondaryIcons.map((Icon, i) => (
                        <Icon
                          key={i}
                          className="w-5 h-5 text-muted-foreground/60"
                        />
                      ))}
                    </div>
                  </div>
                  <ul
                    className={`space-y-3 text-muted-foreground mb-4 ${
                      index % 2 === 0 ? "lg:ml-auto" : ""
                    }`}
                  >
                    {phase.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0 mt-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-sm text-muted-foreground/80 bg-muted p-3 rounded-lg">
                    {phase.disclaimer}
                  </div>
                </div>
              </div>

              {index % 2 === 0 ? <div /> : null}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvolutionSection;
