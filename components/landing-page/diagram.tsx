import { motion } from "framer-motion";
import { ArrowDownIcon, ArrowRightIcon, Download } from "lucide-react";
import {
  MessageSquare,
  Search,
  Database,
  ExternalLink,
  FileText,
  User,
  Brain,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Zap,
  LucideProps,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const Arrow = ({ direction = "down", label = "" }) => {
  const Icon = direction === "down" ? ArrowDownIcon : ArrowRightIcon;
  return (
    <motion.div
      className="flex items-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
    >
      <Icon className="w-6 h-6 text-gray-400" />
      {label && <span className="ml-2 text-sm text-gray-500">{label}</span>}
    </motion.div>
  );
};

interface FlowItemProps {
  item: {
    icon: React.ComponentType<LucideProps>;
    label: string;
  };
}

const FlowItem = ({ item }: FlowItemProps) => (
  <motion.div variants={itemVariants} className="w-full max-w-xs">
    <div className="p-3 px-1 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center hover:shadow-md transition-shadow duration-300 bg-white">
      <item.icon className="w-5 h-5 mr-2 text-purple-600" />
      <h3 className="font-medium text-center text-gray-800">{item.label}</h3>
    </div>
  </motion.div>
);

const FlowDiagram = () => {
  const flowItems = [
    { icon: User, label: "Zapytanie" },
    { icon: FileText, label: "Czy potrzebne dane zewnętrzne" },
    { icon: Brain, label: "Użycie narzędzia" },
    { icon: XCircle, label: "Analiza i przetwarzanie danych" },
    { icon: CheckCircle, label: "Analiza kontekstu" },
    { icon: Download, label: "Przetworzenie dokumentów z kontekstu" },
    { icon: CheckCircle, label: "Odpowiedź" },
  ];
  return (
    <motion.div
      className=" flex-col items-center space-y-4 mb-4 hidden sm:flex"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <FlowItem item={flowItems[0]} />
      <Arrow />
      <FlowItem item={flowItems[1]} />
      <div className="text-center text-gray-500">lub</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <div className="flex flex-col items-center space-y-4">
          <Arrow direction="down" label="Tak" />
          <FlowItem item={flowItems[2]} />
          <Arrow />
          <FlowItem item={flowItems[3]} />
        </div>
        <div className="flex flex-col items-center space-y-4">
          <Arrow direction="down" label="Nie" />
          <FlowItem item={flowItems[4]} />
          <Arrow direction="down" label="" />
          <FlowItem item={flowItems[5]} />
        </div>
      </div>
      <Arrow />
      <FlowItem item={flowItems[6]} />
    </motion.div>
  );
};

export default FlowDiagram;
