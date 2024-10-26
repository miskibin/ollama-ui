import React from "react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <motion.div
    variants={fadeIn}
    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 backdrop-blur-sm border border-secondary/20 hover:border-primary/20 transition-colors"
  >
    <div className="bg-primary/10 p-2 rounded-lg">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  </motion.div>
);

export default FeatureCard;
