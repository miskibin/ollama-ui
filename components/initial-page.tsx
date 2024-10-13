import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MessageSquare,
  VoteIcon,
  Users,
  Scale,
  CalendarDays,
  Building,
  TrendingUp,
  Gavel,
  FileSearch,
  AlertTriangle,
  PieChart,
  BookOpen,
  RefreshCw,
  Briefcase,
} from "lucide-react";

interface InitialChatContentProps {
  onStarterClick: (text: string) => void;
}

const allConversationStarters = [
  {
    icon: <FileText className="text-blue-500" size={24} />,
    text: "Najnowsze ustawy",
    action: "Jakie ustawy zostały uchwalone w ciągu ostatniego miesiąca?",
  },
  {
    icon: <MessageSquare className="text-green-500" size={24} />,
    text: "Ostatnie interpelacje",
    action:
      "Jakie były główne tematy interpelacji poselskich w ostatnim tygodniu?",
  },
  {
    icon: <VoteIcon className="text-red-500" size={24} />,
    text: "Niedawne głosowania",
    action:
      "Jakie były wyniki najważniejszych głosowań w Sejmie w tym miesiącu?",
  },
  {
    icon: <Users className="text-purple-500" size={24} />,
    text: "Aktywność komisji",
    action:
      "Które komisje sejmowe odbyły najwięcej posiedzeń w ostatnim miesiącu?",
  },
  {
    icon: <Scale className="text-orange-500" size={24} />,
    text: "Nowe projekty ustaw",
    action:
      "Jakie nowe projekty ustaw zostały złożone w Sejmie w ostatnim tygodniu?",
  },
  {
    icon: <CalendarDays className="text-teal-500" size={24} />,
    text: "Najbliższe posiedzenia",
    action:
      "Jakie ważne posiedzenia Sejmu są zaplanowane na najbliższy tydzień?",
  },
  {
    icon: <Building className="text-indigo-500" size={24} />,
    text: "Infrastruktura",
    action:
      "Czy w ostatnim miesiącu uchwalono jakieś ustawy dotyczące infrastruktury?",
  },
  {
    icon: <TrendingUp className="text-yellow-500" size={24} />,
    text: "Gospodarka",
    action:
      "Jakie ustawy związane z gospodarką były omawiane na ostatnim posiedzeniu Sejmu?",
  },
  {
    icon: <Gavel className="text-gray-600" size={24} />,
    text: "Wymiar sprawiedliwości",
    action:
      "Czy w ostatnim czasie głosowano nad ustawami dotyczącymi wymiaru sprawiedliwości?",
  },
  {
    icon: <FileSearch className="text-pink-500" size={24} />,
    text: "Projekty w komisjach",
    action:
      "Jakie projekty ustaw są obecnie rozpatrywane przez komisje sejmowe?",
  },
  {
    icon: <AlertTriangle className="text-amber-500" size={24} />,
    text: "Bezpieczeństwo",
    action:
      "Czy w ostatnim miesiącu dyskutowano nad ustawami dotyczącymi bezpieczeństwa narodowego?",
  },
  {
    icon: <PieChart className="text-emerald-500" size={24} />,
    text: "Budżet",
    action: "Jakie były ostatnie decyzje Sejmu dotyczące budżetu państwa?",
  },
  {
    icon: <BookOpen className="text-rose-500" size={24} />,
    text: "Edukacja",
    action:
      "Czy w ostatnim czasie wprowadzono jakieś zmiany w ustawach dotyczących edukacji?",
  },
  {
    icon: <RefreshCw className="text-lime-500" size={24} />,
    text: "Środowisko",
    action:
      "Jakie ustawy dotyczące ochrony środowiska były omawiane w Sejmie w ostatnim miesiącu?",
  },
  {
    icon: <Briefcase className="text-fuchsia-500" size={24} />,
    text: "Prawo pracy",
    action: "Czy w ostatnim czasie głosowano nad zmianami w prawie pracy?",
  },
];

const InitialChatContent: React.FC<InitialChatContentProps> = ({
  onStarterClick,
}) => {
  const randomStarters = useMemo(() => {
    const shuffled = [...allConversationStarters].sort(
      () => 0.5 - Math.random()
    );
    return shuffled.slice(0, 4); // Display 4 random starters
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center">
          Twój asystent parlamentarny
        </h2>
        <p className="text-center text-gray-600">
          Odkryj najnowsze informacje o polskim parlamencie
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full">
        {randomStarters.map((starter, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex items-center justify-start space-x-3 p-4 h-auto"
            onClick={() => onStarterClick(starter.action)}
          >
            <span className="text-primary">{starter.icon}</span>
            <span className="text-foreground text-left">{starter.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default InitialChatContent;
