import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Scale,
  Building,
  FileSearch,
  Briefcase,
  Home,
  Heart,
  Shield,
  Wine,
  Leaf,
  Euro,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/use-media-query";

const conversationStarters = [
  {
    icon: <Wine className="text-purple-500" size={24} />,
    text: "Sprzedaż alkoholu",
    action: "Jakie są aktualne przepisy regulujące sprzedaż alkoholu?",
  },
  {
    icon: <Shield className="text-red-700" size={24} />,
    text: "Broń palna",
    action: "Pokaż obecne przepisy dotyczące posiadania broni palnej",
  },
  {
    icon: <Home className="text-cyan-600" size={24} />,
    text: "Eksmisja lokatora",
    action: "Jakie przepisy regulują eksmisję lokatora z mieszkania?",
  },
  {
    icon: <Briefcase className="text-gray-500" size={24} />,
    text: "Zwolnienie z pracy",
    action: "Jakie są przepisy dotyczące zwolnienia pracownika?",
  },
  {
    icon: <Euro className="text-yellow-600" size={24} />,
    text: "Dziedziczenie",
    action: "Pokaż aktualne przepisy o dziedziczeniu majątku",
  },
  {
    icon: <Users className="text-blue-500" size={24} />,
    text: "Rozwód",
    action: "Jakie są obecne przepisy regulujące rozwód?",
  },
  {
    icon: <Building className="text-amber-600" size={24} />,
    text: "Budowa domu",
    action: "Jakie przepisy regulują budowę domu jednorodzinnego w polsce?",
  },
  {
    icon: <FileSearch className="text-indigo-500" size={24} />,
    text: "Mandat drogowy",
    action: "Pokaż aktualne przepisy dotyczące mandatów drogowych",
  },
  {
    icon: <Leaf className="text-green-600" size={24} />,
    text: "Marihuana",
    action: "Jakie są obecne przepisy dotyczące marihuany?",
  },
  {
    icon: <FileText className="text-red-500" size={24} />,
    text: "Przemoc domowa",
    action: "Pokaż obecne przepisy dotyczące przemocy domowej",
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
          Twój asystent prawny
        </h2>
        <p className="text-sm text-muted-foreground mb-2">
          Dowiedz się więcej o aktualnie obowiązujących przepisach
        </p>
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
