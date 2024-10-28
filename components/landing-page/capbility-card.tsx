import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle } from "lucide-react";

type CapabilityStatus = "available" | "coming" | "unavailable";

interface CapabilityCardProps {
  title: string;
  status: CapabilityStatus;
  description?: string;
}

const getStatusConfig = (status: CapabilityStatus) => {
  switch (status) {
    case "available":
      return {
        icon: CheckCircle,
        iconColor: "text-primary",
        bgColor: "bg-primary/10",
        borderColor: "border-primary",
        label: "Dostępne",
      };
    case "coming":
      return {
        icon: Clock,
        iconColor: "text-secondary-foreground",
        bgColor: "bg-secondary",
        borderColor: "border-secondary",
        label: "Wkrótce",
      };
    case "unavailable":
      return {
        icon: XCircle,
        iconColor: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive",
        label: "Niedostępne",
      };
  }
};

const CapabilityCard: React.FC<CapabilityCardProps> = ({
  title,
  status,
  description,
}) => {
  const config = getStatusConfig(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`h-32 p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor} backdrop-blur-sm flex flex-col justify-between shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-foreground line-clamp-2">{title}</h3>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
          <config.icon className={`h-5 w-5 ${config.iconColor}`} />
          <span
            className={`text-xs font-medium ${config.iconColor} whitespace-nowrap`}
          >
            {config.label}
          </span>
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2 font-medium">
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default CapabilityCard;
