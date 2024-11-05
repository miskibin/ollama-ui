import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import {
  MessageSquare,
  User,
  Brain,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  type LucideProps,
} from "lucide-react";

const Arrow = ({ direction = "down", label = "" }) => {
  const Icon = direction === "down" ? ArrowDownIcon : ArrowRightIcon;
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-foreground" />
      {label && <span className="text-xs text-foreground">{label}</span>}
    </div>
  );
};

interface FlowItemProps {
  item: {
    icon: React.ComponentType<LucideProps>;
    label: string;
  };
}

const FlowItem = ({ item }: FlowItemProps) => (
  <div className="w-full max-w-xs">
    <div className="p-2 rounded-md border bg-primary/50 text-card-foreground flex items-center justify-center gap-2">
      <item.icon className="w-4 h-4 text-foreground" />
      <span className="text-sm font-medium">{item.label}</span>
    </div>
  </div>
);

const DescriptionSection = ({
  title,
  content,
  isIntro,
}: {
  title: string;
  content: string;
  isIntro?: boolean;
}) => (
  <div className="space-y-2">
    <h3 className={`${isIntro ? "text-lg font-semibold" : "font-medium"}`}>
      {title}
    </h3>
    <p className="text-sm text-muted-foreground">{content}</p>
  </div>
);

const Description = () => {
  const sections = [
    {
      title: "Opis Procesu",
      content:
        "Proces rozpoczyna się od zapytania użytkownika i podąża jedną z dwóch możliwych ścieżek:",
      isIntro: true,
    },
    {
      title: "Ścieżka Danych Zewnętrznych",
      content:
        "Gdy wymagane są dane zewnętrzne, system wykorzystuje specjalistyczne narzędzia do analizy i przetwarzania danych, zapewniając kompleksowe wyniki.",
    },
    {
      title: "Ścieżka Analizy Kontekstu",
      content:
        "W przypadku zapytań niewymagających danych zewnętrznych, system analizuje istniejący kontekst i przetwarza odpowiednie dokumenty w celu sformułowania właściwej odpowiedzi.",
    },
    {
      title: "Odpowiedź Końcowa",
      content:
        "Obie ścieżki zbiegają się, aby wygenerować końcową odpowiedź, łącząc przeanalizowane dane ze zrozumieniem kontekstu dla optymalnych rezultatów.",
    },
  ];

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <DescriptionSection
          key={section.title}
          title={section.title}
          content={section.content}
          isIntro={section.isIntro}
        />
      ))}
    </div>
  );
};

const FlowDiagram = () => {
  const flowItems = [
    { icon: User, label: "Zapytanie" },
    { icon: FileText, label: "Czy potrzebne dane zewnętrzne" },
    { icon: Brain, label: "Użycie narzędzia" },
    { icon: XCircle, label: "Analiza i przetwarzanie danych" },
    { icon: CheckCircle, label: "Analiza kontekstu" },
    { icon: Download, label: "Przetworzenie dokumentów" },
    { icon: CheckCircle, label: "Odpowiedź" },
  ];

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-6 w-full max-w-7xl">
        <Description />
        <div className="flex-col items-center space-y-6 hidden sm:flex">
          <FlowItem item={flowItems[0]} />
          <Arrow />
          <FlowItem item={flowItems[1]} />
          <span className="text-xs text-foreground">lub</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            <div className="flex flex-col items-center space-y-5">
              <Arrow direction="down" label="Tak" />
              <FlowItem item={flowItems[2]} />
              <Arrow />
              <FlowItem item={flowItems[3]} />
            </div>
            <div className="flex flex-col items-center space-y-5">
              <Arrow direction="down" label="Nie" />
              <FlowItem item={flowItems[4]} />
              <Arrow />
              <FlowItem item={flowItems[5]} />
            </div>
          </div>
          <Arrow />
          <FlowItem item={flowItems[6]} />
        </div>
      </div>
    </div>
  );
};

export default FlowDiagram;
