import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Book,
  Code,
  Coffee,
  FileText,
  Flame,
  Globe,
  HeartHandshake,
  Puzzle,
  Ruler,
  Sandwich,
  Shirt,
  ShoppingCart,
  Sparkles,
  Trees,
  Utensils,
  Wrench,
} from "lucide-react";
import Image from "next/image";

interface InitialChatContentProps {
  onStarterClick: (text: string) => void;
}

const allConversationStarters = [
  {
    icon: <Sandwich className="text-yellow-500" size={24} />,
    text: "Suggest a recipe for a quick lunch",
    action:
      "Suggest a recipe for a quick and easy lunch using common pantry ingredients.",
  },
  {
    icon: <Code className="text-blue-500" size={24} />,
    text: "Explain a programming concept",
    action:
      "Explain the concept of recursion in programming and provide a simple example.",
  },
  {
    icon: <Book className="text-green-500" size={24} />,
    text: "Summarize a classic novel",
    action:
      "Provide a brief summary of the plot and main themes of the novel '1984' by George Orwell.",
  },
  {
    icon: <Puzzle className="text-purple-500" size={24} />,
    text: "Create a brain teaser",
    action:
      "Create an original, challenging brain teaser or riddle for me to solve.",
  },
  {
    icon: <Coffee className="text-brown-500" size={24} />,
    text: "Coffee brewing tips",
    action: "Share some tips for brewing the perfect cup of coffee at home.",
  },
  {
    icon: <Globe className="text-blue-400" size={24} />,
    text: "Interesting geography facts",
    action:
      "Tell me five interesting geography facts about countries around the world.",
  },
  {
    icon: <Ruler className="text-gray-600" size={24} />,
    text: "Explain a math concept",
    action:
      "Explain the Pythagorean theorem and its practical applications in everyday life.",
  },
  {
    icon: <HeartHandshake className="text-red-500" size={24} />,
    text: "Conflict resolution advice",
    action:
      "Provide advice on how to resolve a conflict with a coworker professionally.",
  },
  {
    icon: <Shirt className="text-indigo-500" size={24} />,
    text: "Fashion history lesson",
    action:
      "Give a brief history of a famous fashion trend or item of clothing.",
  },
  {
    icon: <Trees className="text-green-600" size={24} />,
    text: "Gardening tips for beginners",
    action:
      "Share some essential gardening tips for beginners starting their first vegetable garden.",
  },
  {
    icon: <Sparkles className="text-yellow-400" size={24} />,
    text: "Creative writing prompt",
    action:
      "Provide a creative writing prompt for a short story set in a futuristic world.",
  },
  {
    icon: <Utensils className="text-orange-500" size={24} />,
    text: "Cooking technique explanation",
    action: "Explain the sous-vide cooking technique and its benefits.",
  },
  {
    icon: <FileText className="text-gray-500" size={24} />,
    text: "Resume writing tips",
    action:
      "Offer some key tips for writing an effective resume that stands out to employers.",
  },
  {
    icon: <ShoppingCart className="text-blue-600" size={24} />,
    text: "Budgeting advice",
    action:
      "Provide practical advice for creating and sticking to a monthly budget.",
  },
  {
    icon: <Flame className="text-red-600" size={24} />,
    text: "Fitness routine suggestion",
    action:
      "Suggest a 15-minute high-intensity workout routine that can be done at home without equipment.",
  },
  {
    icon: <Wrench className="text-gray-700" size={24} />,
    text: "Home maintenance checklist",
    action: "Create a seasonal home maintenance checklist for homeowners.",
  },
];

const InitialChatContent: React.FC<InitialChatContentProps> = ({
  onStarterClick,
}) => {
  const randomStarters = useMemo(() => {
    const shuffled = [...allConversationStarters].sort(
      () => 0.5 - Math.random()
    );
    return shuffled.slice(0, 4); // Display 8 random starters
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="mb-8">
        <Image
          src="/ollama.png"
          alt="Ollama Logo"
          width={200}
          height={200}
          className="rounded-md "
        />
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
