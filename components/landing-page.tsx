"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Search, Database } from "lucide-react";
import FeatureCard from "./landing-page/featureCard";
import LoginCard from "./landing-page/login";
import Footer from "./landing-page/footer";
import FlowDiagram from "./landing-page/diagram";
import AboutSection from "./landing-page/about";
import CapabilitiesSection from "./landing-page/capabilities";
import Image from "next/image";
export type AuthProvider = "google" | "discord" | "github";

interface LoginPageProps {
  onOAuthSignIn: (provider: AuthProvider) => void;
  windowHeight: string;
}

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const LoginPage: React.FC<LoginPageProps> = ({
  onOAuthSignIn,
  windowHeight,
}) => {
  return (
    <div
      className="flex flex-col bg-gradient-to-b from-background to-secondary/20"
      style={{ minHeight: windowHeight }}
    >
      <div className="w-full mx-auto px-4 mb-12">
        <div className="grid md:grid-cols-2 py-8 md:py-12 gap-12 items-center min-h-screen max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="space-y-8"
          >
            <motion.div variants={fadeIn} className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <Image
                  src="/logo.svg"
                  alt="Asystent RP Logo"
                  width={64}
                  height={64}
                  className="rounded-lg"
                  priority
                />
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Asystent RP
                </h1>
              </div>
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
                description="Dostęp do wektorowej bazy danych ponad 7 tysięcy aktów prawnych"
              />
            </motion.div>
          </motion.div>

          <div className="relative z-10">
            <LoginCard onOAuthSignIn={onOAuthSignIn} />
          </div>
        </div>
        <CapabilitiesSection />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid md:grid-cols-12 gap-8 items-start relative z-0 my-24"
        >
          <div className="md:col-span-7">
            <AboutSection />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="md:col-span-5"
          >
            <FlowDiagram />
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
