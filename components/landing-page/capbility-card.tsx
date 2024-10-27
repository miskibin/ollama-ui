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
        iconColor: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        label: "Dostępne",
      };
    case "coming":
      return {
        icon: Clock,
        iconColor: "text-blue-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        label: "Wkrótce",
      };
    case "unavailable":
      return {
        icon: XCircle,
        iconColor: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
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
      className={`h-32 p-4 rounded-lg border ${config.borderColor} ${config.bgColor} backdrop-blur-sm flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-gray-900 line-clamp-2">{title}</h3>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
          <config.icon className={`h-5 w-5 ${config.iconColor}`} />
          <span className={`text-xs ${config.iconColor} whitespace-nowrap`}>
            {config.label}
          </span>
        </div>
      </div>
      {description && (
        <p className="text-sm text-gray-600 line-clamp-2 mt-2">{description}</p>
      )}
    </motion.div>
  );
};

export default CapabilityCard;
