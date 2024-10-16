import React, { useMemo } from "react";
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
} from "lucide-react";
import Link from "next/link";

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
  const randomStarters = useMemo(() => {
    return [...conversationStarters]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 lg:px-4 px-0">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold">Twój asystent parlamentarny</h2>
        <p className="text-sm text-gray-600">
          <Link
            href="https://sejm-stats.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            powered by <strong>sejm-stats.pl</strong>
          </Link>
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
        {randomStarters.map((starter, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex items-center justify-start p-3 h-auto w-full text-left"
            onClick={() => onStarterClick(starter.action)}
          >
            <span className="flex-shrink-0 mr-3">{starter.icon}</span>
            <span className="text-foreground text-sm leading-tight">
              {starter.text}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default InitialChatContent;
