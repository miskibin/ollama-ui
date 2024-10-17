import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MessageSquare,
  Users,
  Building,
  VoteIcon,
  FileSearch,
  TrendingUp,
  Droplet,
  BookOpen,
  Heart,
  Shield,
  Truck,
  Briefcase,
  Leaf,
  Home,
  Scale,
  Euro,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/use-media-query";

const conversationStarters = [
  {
    icon: <FileText className="text-blue-500" size={24} />,
    text: "Ustawy o gospodarce",
    action: "Jakie ustawy dotyczące gospodarki uchwalono w ostatnim kwartale?",
  },
  {
    icon: <VoteIcon className="text-green-500" size={24} />,
    text: "Głosowania nad klimatem",
    action: "Jakie były ostatnie głosowania dotyczące zmian klimatycznych?",
  },
  {
    icon: <Users className="text-purple-500" size={24} />,
    text: "Komisje ds. edukacji",
    action:
      "Jakie posiedzenia komisji dotyczące edukacji odbyły się w tym miesiącu?",
  },
  {
    icon: <FileSearch className="text-indigo-500" size={24} />,
    text: "Projekty ustaw o zdrowiu",
    action:
      "Jakie projekty ustaw (druki) dotyczące ochrony zdrowia złożono w tym roku?",
  },
  {
    icon: <MessageSquare className="text-red-500" size={24} />,
    text: "Interpelacje o infrastrukturze",
    action:
      "Jakie były najważniejsze interpelacje poselskie dotyczące infrastruktury drogowej?",
  },
  {
    icon: <Building className="text-yellow-500" size={24} />,
    text: "Ustawy o budżecie",
    action: "Jakie ustawy dotyczące budżetu państwa uchwalono w ostatnim roku?",
  },
  {
    icon: <Droplet className="text-blue-300" size={24} />,
    text: "Głosowania dot. powodzi",
    action:
      "Jakie głosowania odbyły się w sprawie pomocy dla obszarów dotkniętych powodzią?",
  },
  {
    icon: <TrendingUp className="text-orange-500" size={24} />,
    text: "Projekty ustaw gospodarczych",
    action:
      "Jakie projekty ustaw dotyczące wzrostu gospodarczego zostały ostatnio złożone?",
  },
  {
    icon: <BookOpen className="text-teal-500" size={24} />,
    text: "Komisje ds. nauki",
    action:
      "Jakie posiedzenia komisji dotyczące szkolnictwa wyższego odbyły się w tym semestrze?",
  },
  {
    icon: <Heart className="text-pink-500" size={24} />,
    text: "Ustawy o opiece zdrowotnej",
    action:
      "Jakie ustawy dotyczące systemu opieki zdrowotnej uchwalono w ostatnim półroczu?",
  },
  {
    icon: <Truck className="text-gray-500" size={24} />,
    text: "Interpelacje o transporcie",
    action:
      "Jakie interpelacje poselskie dotyczące transportu publicznego złożono w tym roku?",
  },
  {
    icon: <Shield className="text-red-700" size={24} />,
    text: "Głosowania nad bezpieczeństwem",
    action:
      "Jakie były ostatnie głosowania dotyczące bezpieczeństwa narodowego?",
  },
  {
    icon: <Truck className="text-amber-600" size={24} />,
    text: "Projekty ustaw logistycznych",
    action:
      "Jakie projekty ustaw dotyczące logistyki i transportu towarowego złożono ostatnio?",
  },
  {
    icon: <Briefcase className="text-indigo-600" size={24} />,
    text: "Komisje ds. pracy",
    action:
      "Jakie posiedzenia komisji dotyczące rynku pracy odbyły się w ostatnim kwartale?",
  },
  {
    icon: <Leaf className="text-green-600" size={24} />,
    text: "Ustawy o środowisku",
    action: "Jakie ustawy dotyczące ochrony środowiska uchwalono w tym roku?",
  },
  {
    icon: <Home className="text-cyan-600" size={24} />,
    text: "Interpelacje o mieszkalnictwie",
    action:
      "Jakie były najważniejsze interpelacje poselskie dotyczące polityki mieszkaniowej?",
  },
  {
    icon: <Scale className="text-purple-600" size={24} />,
    text: "Głosowania nad prawem",
    action:
      "Jakie głosowania odbyły się w sprawie zmian w systemie sądownictwa?",
  },
  {
    icon: <Euro className="text-yellow-600" size={24} />,
    text: "Projekty ustaw podatkowych",
    action:
      "Jakie projekty ustaw dotyczące zmian w systemie podatkowym zostały ostatnio złożone?",
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

  const randomStarters = useMemo(() => {
    return [...conversationStarters]
      .sort(() => 0.5 - Math.random())
      .slice(0, starterCount);
  }, [starterCount]);

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 sm:p-6">
      <div className="mb-6 sm:mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
          Twój asystent parlamentarny
        </h2>
        <Link
          href="https://sejm-stats.pl"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm text-muted-foreground hover:underline"
        >
          powered by <strong>sejm-stats.pl</strong>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {randomStarters.map((starter, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex flex-col items-center justify-center p-4 h-auto w-full text-center hover:bg-primary/10 transition-colors duration-200 border-2 border-border rounded-lg shadow-sm"
            onClick={() => onStarterClick(starter.action)}
          >
            <span className="flex-shrink-0 mb-3 p-2 bg-background rounded-full shadow-sm">
              {React.cloneElement(starter.icon, {
                size: 32,
              })}
            </span>
            <span className="text-foreground text-sm font-medium leading-tight">
              {starter.text}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default InitialChatContent;
