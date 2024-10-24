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

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15,
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

export const LoginPage: React.FC<LoginPageProps> = ({
  onOAuthSignIn,
  windowHeight,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <div
      className="flex flex-col bg-gradient-to-b from-background to-secondary/20"
      style={{ minHeight: windowHeight }}
    >
      <div className="grid md:grid-cols-2 py-8 md:py-12 w-full gap-12 px-4 max-w-6xl mx-auto items-center flex-grow">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-8"
        >
          <motion.div variants={fadeIn} className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Asystent RP
            </h1>
            <p className="text-xl text-muted-foreground">
              Twój inteligentny przewodnik po polskim prawie
            </p>
          </motion.div>

          <motion.div variants={stagger} className="space-y-4">
            <FeatureCard
              icon={MessageSquare}
              title="Inteligentna Analiza"
              description="Zamiast przeszuwania setki aktów, poprostu spytaj"
            />
            <FeatureCard
              icon={Search}
              title="Interpretacja Aktów Prawnych"
              description="Dopytaj o dowoną kwestię, a asystent odpowie na pytanie"
            />
            <FeatureCard
              icon={Database}
              title="Baza Wiedzy"
              description="Dostęp do wektorowej bezy ponad 7 tysięcy aktów prawnych"
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="flex flex-col items-center"
        >
          <Card className="w-full max-w-sm border-secondary/20 bg-gradient-to-br from-background to-secondary/20 backdrop-blur-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-center">
                Zaloguj się
              </CardTitle>
              <CardDescription className="text-center">
                Wymagane logowanie ze względu na koszty utrzymania usługi i
                limity zapytań
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => onOAuthSignIn("google")}
                  variant="outline"
                  className="w-full bg-gradient-to-r hover:from-secondary hover:to-secondary/50 transition-all duration-300"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Zaloguj się przez Google
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => onOAuthSignIn("discord")}
                  className="w-full bg-[#5865F2] hover:bg-[#4752C4] transition-all duration-300"
                >
                  <Lock className="mr-2 h-5 w-5" />
                  Zaloguj się przez Discorda
                </Button>
              </motion.div>

              <div className="pt-4 text-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center text-sm text-muted-foreground"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Dane nie są w żaden sposób przetwarzane.
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full py-6 border-t border-secondary/20 bg-background/50 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Michał Skibiński. Wszelkie prawa zastrzeżone.
          </div>
          <motion.a
            whileHover={{ scale: 1.05 }}
            href="https://github.com/miskibin/ollama-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>GitHub Repository</span>
          </motion.a>
        </div>
      </motion.footer>
    </div>
  );
};

export default LoginPage;
