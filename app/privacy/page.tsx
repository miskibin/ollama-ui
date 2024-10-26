"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/landing-page/footer";

const PrivacyPage = () => {
  return (
    <>
      <div className=" container  m-8 mx-auto">
        <Card className="mb-8 container">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Polityka Prywatności
            </CardTitle>
            <CardDescription>Ostatnia aktualizacja: 10.26.2024</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Informacje Ogólne
              </h2>
              <p className="text-muted-foreground">
                Niniejsza Polityka Prywatności określa zasady przetwarzania i
                ochrony danych użytkowników serwisu Asystent RP. Administratorem
                danych jest właściciel projektu niekomercyjnego Asystent RP.
                Projekt ma charakter non-profit i służy celom edukacyjnym oraz
                informacyjnym.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Cel Przetwarzania Danych
              </h2>
              <p className="text-muted-foreground mb-4">
                Dane są przetwarzane w następujących celach:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Zapewnienie prawidłowego funkcjonowania serwisu poprzez
                  limitowanie liczby zapytań (rate limiting)
                </li>
                <li>
                  Umożliwienie użytkownikom zgłaszania błędów i problemów
                  technicznych
                </li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. Zakres Zbieranych Danych
              </h2>
              <p className="text-muted-foreground mb-4">
                Serwis zbiera wyłącznie następujące dane:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Unikalny identyfikator użytkownika (userID) pozyskiwany
                  podczas logowania
                </li>
                <li>
                  Informacje techniczne związane ze zgłaszanymi błędami (jeśli
                  użytkownik zdecyduje się je zgłosić)
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Serwis nie zbiera żadnych dodatkowych danych osobowych ani nie
                przetwarza szczególnych kategorii danych osobowych.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. Podstawa Prawna
              </h2>
              <p className="text-muted-foreground">
                Przetwarzanie danych odbywa się na podstawie art. 6 ust. 1 lit.
                b RODO (przetwarzanie jest niezbędne do wykonania umowy) oraz
                art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes
                administratora - zapewnienie prawidłowego funkcjonowania
                serwisu).
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. Okres Przechowywania Danych
              </h2>
              <p className="text-muted-foreground">
                Dane są przechowywane przez okres niezbędny do realizacji celów,
                dla których zostały zebrane, nie dłużej jednak niż przez okres
                12 miesięcy od ostatniej aktywności użytkownika lub do momentu
                zgłoszenia żądania ich usunięcia.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Prawa Użytkownika
              </h2>
              <p className="text-muted-foreground mb-4">
                Użytkownik ma prawo do:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Dostępu do swoich danych</li>
                <li>Żądania ich usunięcia</li>
                <li>Ograniczenia przetwarzania</li>
                <li>Przenoszenia danych</li>
                <li>Wniesienia sprzeciwu wobec przetwarzania</li>
                <li>
                  Wniesienia skargi do organu nadzorczego (Prezes Urzędu Ochrony
                  Danych Osobowych)
                </li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Bezpieczeństwo</h2>
              <p className="text-muted-foreground">
                Administrator dokłada wszelkich starań, aby zapewnić
                bezpieczeństwo danych użytkowników poprzez stosowanie
                odpowiednich środków technicznych i organizacyjnych. Dostęp do
                danych mają wyłącznie osoby upoważnione i jedynie w zakresie
                niezbędnym do realizacji celów przetwarzania.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Kontakt</h2>
              <p className="text-muted-foreground">
                W sprawach związanych z ochroną danych osobowych można
                kontaktować się z administratorem poprzez email:
                michalskibinski109@gmail.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPage;
