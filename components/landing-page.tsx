import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  MessageSquare,
  Search,
  Database,
  Shield,
  Github,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Provider = "google" | "discord";

interface LoginPageProps {
  onOAuthSignIn: (provider: Provider) => void;
  windowHeight: string;
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
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
    className="flex items-start space-x-4 p-4 rounded-lg bg-secondary/50"
  >
    <Icon className="h-6 w-6 text-primary mt-1" />
    <div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </motion.div>
);

export const LoginPage: React.FC<LoginPageProps> = ({
  onOAuthSignIn,
  windowHeight,
}) => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="flex flex-col" style={{ minHeight: windowHeight }}>
      <div className="grid md:grid-cols-2 py-5 w-full gap-8 px-4 max-w-7xl mx-auto items-center flex-grow">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-6"
        >
          <motion.div variants={fadeIn}>
            <h1 className="text-4xl font-bold mb-2">Asystent RP</h1>
            <p className="text-xl text-muted-foreground">
              Twój inteligentny przewodnik po najważniejszych ustawach
              Rzeczypospolitej Polskiej
            </p>
          </motion.div>

          <motion.div variants={stagger} className="space-y-4">
            <FeatureCard
              icon={MessageSquare}
              title="Inteligentna Analiza"
              description="Zadawaj pytania w naturalnym języku i otrzymuj precyzyjne odpowiedzi na temat kluczowych ustaw"
            />

            <FeatureCard
              icon={Search}
              title="Interpretacja Aktów Prawnych"
              description="Zrozum najważniejsze ustawy i ich znaczenie dla funkcjonowania państwa"
            />

            <FeatureCard
              icon={Database}
              title="Baza Wiedzy"
              description="Dostęp do wyselekcjonowanych, najistotniejszych aktów prawnych RP"
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-center">Zaloguj się</CardTitle>
              <CardDescription className="text-center">
                Wymagane logowanie ze względu na koszty utrzymania usługi i
                limity zapytań
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => onOAuthSignIn("google")}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Zaloguj się przez Google
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => onOAuthSignIn("discord")}
                  className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
                >
                  <Lock className="mr-2 h-5 w-5" />
                  Zaloguj się przez Discorda
                </Button>
              </motion.div>

              <div className="pt-4 text-center">
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 mr-2" />
                  Dane nie są w żaden sposób przetwarzane.
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full py-6 mt-8 border-t"
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Michał Skibiński. Wszelkie prawa zastrzeżone.
          </div>
          <a
            href="https://github.com/miskibin/ollama-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </motion.footer>
    </div>
  );
};

export default LoginPage;
