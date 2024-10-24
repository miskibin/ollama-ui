import { motion } from "framer-motion";
import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";

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
    icon: React.ComponentType<{ className: string }>;
    label: string;
  };
}

const FlowItem = ({ item }: FlowItemProps) => (
  <motion.div variants={itemVariants} className="w-full max-w-xs">
    <div className="p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center hover:shadow-md transition-shadow duration-300 bg-white">
      <item.icon className="w-6 h-6 mr-2 text-purple-600" />
      <h3 className="text-lg font-medium text-center text-gray-800">
        {item.label}
      </h3>
    </div>
  </motion.div>
);

interface FlowDiagramProps {
  flowItems: Array<{
    icon: React.ComponentType<{ className: string }>;
    label: string;
  }>;
}

const FlowDiagram = ({ flowItems }: FlowDiagramProps) => {
  return (
    <motion.div
      className="flex flex-col items-center space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <FlowItem item={flowItems[0]} />
      <Arrow />
      <FlowItem item={flowItems[1]} />
      <Arrow />
      <FlowItem item={flowItems[2]} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <div className="flex flex-col items-center space-y-4">
          <Arrow direction="right" label="Tak" />
          <div className="space-y-4">
            <FlowItem item={flowItems[4]} />
            <div className="text-center text-gray-500">lub</div>
            <FlowItem item={flowItems[5]} />
          </div>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <Arrow direction="right" label="Nie" />
          <FlowItem item={flowItems[3]} />
        </div>
      </div>
      <Arrow />
      <FlowItem item={flowItems[6]} />
      <Arrow />
      <FlowItem item={flowItems[0]} />
    </motion.div>
  );
};

export default FlowDiagram;
