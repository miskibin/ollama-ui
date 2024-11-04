import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Map,
  Ruler,
  Cigarette,
  Trees,
  CarFront,
  Scale,
  Baby,
  Building2,
  Wifi,
  DollarSign,
  PiggyBank,
  Dog,
  Bike,
  Heart,
  Volume2,
  Camera,
  Car,
  Angry,
} from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { FaWater } from "react-icons/fa";
const conversationStarters = [
  {
    icon: <Map className="text-green-600" size={24} />,
    text: "Prawo własności nieruchomości",
    action:
      "Jakie są kroki do sprawdzenia legalności nieruchomości przed zakupem? Jak uniknąć problemów z prawem własności?",
  },
  {
    icon: <Building2 className="text-blue-500" size={24} />,
    text: "Wynajem mieszkań",
    action:
      "Jakie są prawa najemcy w Polsce? Co zrobić, gdy właściciel chce nielegalnie podnieść czynsz?",
  },
  {
    icon: <Trees className="text-green-700" size={24} />,
    text: "Wycinka drzew - przepisy 2024",
    action:
      "Jakie zmiany zaszły w przepisach o wycince drzew? Kiedy właściciel potrzebuje pozwolenia?",
  },
  {
    icon: <Heart className="text-red-500" size={24} />,
    text: "Prawo do opieki nad dzieckiem",
    action:
      "Jak ustala się opiekę nad dziećmi po rozwodzie? Co zrobić, gdy jeden rodzic ogranicza kontakt?",
  },
  {
    icon: <Scale className="text-indigo-600" size={24} />,
    text: "Obrona konieczna i samoobrona",
    action:
      "W jakich sytuacjach polskie prawo pozwala na obronę konieczną? Jakie są ograniczenia?",
  },
  {
    icon: <DollarSign className="text-green-500" size={24} />,
    text: "Opodatkowanie spadków i darowizn",
    action:
      "Jakie są stawki podatkowe na spadki i darowizny? Kto jest zwolniony z płacenia podatku?",
  },
  {
    icon: <Dog className="text-amber-600" size={24} />,
    text: "Prawo dotyczące zwierząt domowych",
    action:
      "Jakie przepisy obowiązują właścicieli zwierząt domowych? Czy można zabronić posiadania psa w wynajętym mieszkaniu?",
  },
  {
    icon: <Car className="text-red-600" size={24} />,
    text: "Odszkodowanie po wypadku drogowym",
    action:
      "Jakie są kroki do uzyskania odszkodowania po wypadku drogowym? Czy potrzebne jest orzeczenie lekarskie?",
  },
  {
    icon: <FaWater className="text-orange-500" size={24} />,
    text: "Ochrona środowiska",
    action:
      "Jakie są nowe regulacje dotyczące ochrony środowiska? Co zrobić, gdy sąsiad zatruwa okolicę?",
  },
  {
    icon: <Bike className="text-blue-500" size={24} />,
    text: "Prawa rowerzystów",
    action:
      "Jakie prawa mają rowerzyści w Polsce? Czy można jeździć rowerem po chodniku?",
  },
  {
    icon: <PiggyBank className="text-purple-500" size={24} />,
    text: "Ustalanie wysokości alimentów",
    action:
      "Jak ustalana jest wysokość alimentów na dziecko? Czy można domagać się podwyżki alimentów?",
  },
  {
    icon: <Wifi className="text-cyan-600" size={24} />,
    text: "Ochrona danych osobowych",
    action:
      "Jakie są przepisy dotyczące ochrony danych osobowych w Polsce? Kiedy można żądać ich usunięcia?",
  },
  {
    icon: <Volume2 className="text-red-400" size={24} />,
    text: "Hałas i zakłócenie spokoju",
    action:
      "Jakie są regulacje dotyczące hałasu? Co zrobić, gdy sąsiad ciągle zakłóca ciszę nocną?",
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
    const shuffled = [...conversationStarters].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, starterCount);
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
            className="flex flex-col items-center justify-center p-4 sm:p-6 h-auto w-full hover:scale-105 transition-transform duration-200 bg-card hover:bg-accent/10 border-2"
            onClick={() => onStarterClick(starter.action)}
          >
            <span className="flex-shrink-0 mb-4 p-2 sm:p-3">
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
