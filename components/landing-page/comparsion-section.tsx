import React from "react";
import ImageComparison from "./image-slider";
import { motion } from "framer-motion";

export const ComparisonSection = () => {
  const comparisons = [
    {
      beforeImage: "/abb.png",
      afterImage: "/ab.png",
      beforeLabel: "Chrome",
      afterLabel: "Asystent RP",
      alt: "Mam 17 lat i się upiłem. Co teraz?",
      description: "Asystent RP zawsze odpowie w kontekście prawa",
      content: (
        <>
          <h3 className="text-xl font-semibold mb-3">
            Prawne podejście do problemu
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            W przeciwieństwie do standardowych wyszukiwarek, Asystent analizuje
            sytuację w kontekście prawnym. Zamiast ogólnych porad, otrzymujesz
            informacje o prawnych konsekwencjach i możliwych działaniach
            zgodnych z obowiązującym prawem. To nie tylko odpowiedź, ale również
            edukacja prawna dostosowana do konkretnej sytuacji.
          </p>
        </>
      ),
    },
    {
      beforeImage: "/kbb.png",
      afterImage: "/kb.png",
      beforeLabel: "Bing",
      afterLabel: "Asystent RP",
      alt: "Czy mogę wyciąć niewielki krzew na mojej posesji?",
      description: "Informacje w internecie mogą być przeterminowane",
      content: (
        <>
          <h3 className="text-xl font-semibold mb-3">
            Aktualne informacje prawne
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Podczas gdy wyszukiwarki mogą wyświetlać nieaktualne informacje,
            Asystent RP aktualizowany jest codziennie. Nieaktualne ustawy są automatycznie zastępowane nowymi, a użytkownik otrzymuje dostęp do najnowszych przepisów.
          </p>
        </>
      ),
    },
    {
      beforeImage: "/ibb.png",
      afterImage: "/ib.png",
      beforeLabel: "Odpowiedź",
      afterLabel: "Źródło",
      alt: "Nie wierz na słowo - sprawdź w źródle",
      description:
        "Asystent RP zawsze poda źródło odpowiedzi wraz z linkiem i streszczeniem dokumentów",
      content: (
        <>
          <h3 className="text-xl font-semibold mb-3">
            Wiarygodne źródła i transparentność
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Każda odpowiedź Asystenta RP jest poparta konkretnymi źródłami
            prawnymi. Podczas testowania aplikacji, nie zliczę ile razy internet próbował wprowadzić mnie w błąd. Asystent RP zawsze podaje linki do oficjalnych dokumentów, które możesz zrewidować samodzielnie.
          </p>
        </>
      ),
    },
  ];

  return (
    <section className="py-12 w-full mx-0 px-0 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-0 sm:px-6">
        <motion.div 
          className="text-center mb-12 lg:mb-16 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 lg:mb-6">Dlaczego nie google?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base lg:text-lg">
            Porównaj odpowiedzi tradycyjnych wyszukiwarek z Asystentem RP. Na
            tych paru przykładach chciałbym Ci pokazać dlaczego "poprostu
            wygooglować" nie zawsze jest najlepszym rozwiązaniem.
          </p>
        </motion.div>
        <div className="space-y-16 lg:space-y-24">
          {comparisons.map((comparison, index) => (
            <div
              key={index}
              className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-8 xl:gap-12 space-y-6 lg:space-y-0"
            >
              <motion.div
                className={`w-full lg:h-[600px] lg:col-span-8 ${
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}
                initial={{ 
                  opacity: 0, 
                  x: index % 2 === 1 ? 50 : -50 
                }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.4,
                  delay: 0.4
                }}
              >
                <div className="w-full aspect-[4/3] sm:aspect-[16/10]">
                  <ImageComparison {...comparison} />
                </div>
                <p className="text-sm text-center text-muted-foreground mt-3 lg:mt-4 px-4">
                  {comparison.description}
                </p>
              </motion.div>
              <motion.div
                className={`lg:col-span-4 px-4 lg:px-0 ${
                  index % 2 === 1 ? "lg:order-1" : ""
                }`}
                initial={{ 
                  opacity: 0, 
                  x: index % 2 === 1 ? -50 : 50 
                }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.4,
                  delay: 0.4
                }}
              >
                <div className="w-full">{comparison.content}</div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;