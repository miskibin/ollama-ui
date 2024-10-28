import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Map,
  Ruler,
  Cigarette,
  Trees,
  CarFront,
  Skull,
  Scale,
  Home,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

const conversationStarters = [
  {
    icon: <Map className="text-green-600" size={24} />,
    text: "Prawo własności gruntów", // TESTED
    action:
      "Jakie są przepisy dotyczące przekształcenia gruntów rolnych? Wyjaśnij procedurę zmiany przeznaczenia gruntu.",
  },
  {
    icon: <Ruler className="text-blue-500" size={24} />,
    text: "Odległość domu od płotu", // TESTED
    action:
      "Jakie są wymagane odległości budynku mieszkalnego od granicy działki według prawa budowlanego?",
  },
  {
    icon: <Cigarette className="text-gray-500" size={24} />,
    text: "Palenie w miejscach publicznych", // TESTED
    action:
      "Gdzie według prawa można palić papierosy? Jakie są kary za palenie w miejscach niedozwolonych?",
  },
  {
    icon: <Trees className="text-green-700" size={24} />,
    text: "Wycinka drzew - przepisy", //TESTED
    action:
      "Jakie są aktualne przepisy dotyczące wycinki drzew na własnej działce? Kiedy potrzebne jest zezwolenie?",
  },
  {
    icon: <CarFront className="text-red-600" size={24} />,
    text: "Import samochodów",  // TESTED
    action:
      "Jakie przepisy regulują import samochodów do Polski? Jakie są wymogi celne i techniczne?",
  },
  {
    icon: <Scale className="text-indigo-600" size={24} />,
    text: "Prawo do samoobrony", // TESTED
    action:
      "W jakich sytuacjach prawo pozwala na samoobronę? Jakie są granice obrony koniecznej?",
  },
];

interface InitialChatContentProps {
  onStarterClick: (action: string) => void;
}

const InitialChatContent: React.FC<InitialChatContentProps> = ({
  onStarterClick,
}) => {
  const isPhone = useMediaQuery("(max-width: 640px)");
  const isMediumScreen = useMediaQuery(
    "(min-width: 641px) and (max-width: 1024px)"
  );

  const starterCount = useMemo(() => {
    if (isPhone) return 3;
    if (isMediumScreen) return 4;
    return 6;
  }, [isPhone, isMediumScreen]);

  const displayStarters = useMemo(() => {
    return conversationStarters.slice(0, starterCount);
  }, [starterCount]);

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 sm:p-6">
      <div className="mb-8 sm:mb-10 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">
          Twój asystent prawny
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Poznaj swoje prawa i aktualne przepisy
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-4xl">
        {displayStarters.map((starter, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex flex-col items-center justify-center p-6 h-auto w-full hover:scale-105 transition-transform duration-200 bg-card hover:bg-accent/10 border-2"
            onClick={() => onStarterClick(starter.action)}
          >
            <span className="flex-shrink-0 mb-4 p-3">
              {React.cloneElement(starter.icon, {
                size: 28,
              })}
            </span>
            <span className="text-foreground text-sm font-semibold">
              {starter.text}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default InitialChatContent;
