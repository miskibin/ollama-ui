import React from "react";
import { motion } from "framer-motion";
import CapabilityCard from "./capbility-card";

const CapabilitiesSection = () => {
  const capabilities = [
    {
      title: "Rozmowy na temat istniejącego prawa",
      status: "available" as const,
      description: "Analiza i interpretacja obecnych przepisów prawnych",
    },
    {
      title: "Integracja z Wikipedią",
      status: "available" as const,
      description: "Dostęp do danych z Wikipedii ",
    },
    {
      title: "Projekty ustaw",
      status: "coming" as const,
      description: "Analiza projektów ustaw w procesie legislacyjnym",
    },
    {
      title: "Interpelacje poselskie",
      status: "coming" as const,
      description: "Dostęp do bazy interpelacji i zapytań poselskich",
    },
    {
      title: "Posiedzenia komisji parlamentarnych",
      status: "coming" as const,
      description: "Informacje o pracach komisji sejmowych",
    },
    {
      title: "Prawo Unii Europejskiej",
      status: "unavailable" as const,
      description: "Analiza prawa UE obecnie niedostępna",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-12 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Możliwości Asystenta
          </h2>
          <p className="text-lg text-muted-foreground">
            Sprawdź, co potrafi Asystent RP i jakie funkcje są w przygotowaniu
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((capability, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CapabilityCard {...capability} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default CapabilitiesSection;
