import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Footer from "@/components/landing-page/footer";

const AboutPage = () => {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">O Asystencie RP</h1>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              Czym jest Asystent RP?
            </h2>
            <p className="text-muted-foreground">
              Asystent RP to część projektu Sejm Stats, stworzona w celu
              ułatwienia dostępu do informacji prawnych i parlamentarnych. To
              narzędzie wykorzystujące sztuczną inteligencję do analizy i
              interpretacji polskiego prawa, które powstało w odpowiedzi na
              potrzebę większej transparentności i dostępności informacji
              prawnych.
            </p>
            <p className="text-muted-foreground mt-4">
              Projekt jest rozwijany jako open source, co oznacza że każdy może
              sprawdzić jego kod źródłowy i przyczynić się do jego rozwoju.
              Naszym celem jest stworzenie narzędzia, które pomoże obywatelom
              lepiej zrozumieć prawo i pracę parlamentu.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Jak działa?</h2>
            <p className="text-muted-foreground">
              Asystent wykorzystuje zaawansowane modele językowe do
              przetwarzania i analizy tekstów prawnych. System został
              przeszkolony na:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>Ustawach i rozporządzeniach z Dziennika Ustaw</li>
              <li>Dokumentach sejmowych (druki, sprawozdania, uchwały)</li>
              <li>Interpelacjach poselskich i odpowiedziach na nie</li>
              <li>Transkrypcjach posiedzeń komisji parlamentarnych</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Wszystkie dane są pobierane z oficjalnych źródeł i regularnie
              aktualizowane. Asystent nie tylko wyszukuje informacje, ale także
              potrafi je interpretować w kontekście i przedstawiać w przystępny
              sposób.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              Bezpieczeństwo i prywatność
            </h2>
            <p className="text-muted-foreground">
              Asystent został zaprojektowany z myślą o ochronie prywatności
              użytkowników:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>Nie przechowujemy danych osobowych ani historii zapytań</li>
              <li>Wszystkie dane są przetwarzane zgodnie z RODO</li>
              <li>Wykorzystujemy tylko oficjalne źródła danych</li>
              <li>
                Kod źródłowy jest otwarty i może być audytowany przez każdego
              </li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Plany rozwoju</h2>
            <p className="text-muted-foreground">
              W najbliższym czasie planujemy wprowadzić:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>
                Rozszerzoną analizę projektów ustaw w procesie legislacyjnym
              </li>
              <li>Integrację z bazą interpelacji poselskich</li>
              <li>
                Dostęp do informacji o posiedzeniach komisji parlamentarnych
              </li>
              <li>Analizę prawa Unii Europejskiej</li>
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Wsparcie projektu</h2>
            <p className="text-muted-foreground">
              Projekt jest rozwijany dzięki wsparciu społeczności. Możesz pomóc
              w jego rozwoju poprzez:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <a
                href="https://patronite.pl/sejm-stats"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Wsparcie na Patronite
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
              <a
                href="https://github.com/miskibin/sejm-stats"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
              >
                Kod źródłowy
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutPage;
