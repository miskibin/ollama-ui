"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/landing-page/footer";

const TermsPage = () => {
  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Warunki Korzystania z Usługi
            </CardTitle>
            <CardDescription>
              Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Postanowienia Ogólne
              </h2>
              <p className="text-muted-foreground">
                Niniejsze Warunki Korzystania z Usługi określają zasady
                korzystania z serwisu Asystent RP, zwanego dalej "Serwisem".
                Serwis jest projektem niekomercyjnym, którego celem jest
                ułatwienie dostępu do informacji prawnych i ich interpretacji.
                Korzystanie z Serwisu oznacza akceptację niniejszych warunków.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Charakter Usługi
              </h2>
              <p className="text-muted-foreground mb-4">
                Serwis Asystent RP jest narzędziem informacyjnym i edukacyjnym.
                Należy pamiętać, że:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Informacje dostarczane przez Serwis mają charakter pomocniczy
                  i nie stanowią porady prawnej
                </li>
                <li>
                  Serwis wykorzystuje sztuczną inteligencję do analizy i
                  interpretacji tekstów prawnych, ale nie zastępuje
                  profesjonalnej konsultacji prawnej
                </li>
                <li>
                  W przypadku konkretnych problemów prawnych należy skonsultować
                  się z wykwalifikowanym prawnikiem
                </li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. Zasady Korzystania
              </h2>
              <p className="text-muted-foreground mb-4">
                Użytkownik zobowiązuje się do:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Korzystania z Serwisu zgodnie z jego przeznaczeniem i
                  obowiązującym prawem
                </li>
                <li>
                  Nienadużywania systemu poprzez generowanie nadmiernej liczby
                  zapytań
                </li>
                <li>
                  Niezakłócania działania Serwisu i niepodejmowania prób
                  obejścia zabezpieczeń
                </li>
                <li>Poszanowania praw własności intelektualnej</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. Rejestracja i Logowanie
              </h2>
              <p className="text-muted-foreground">
                Korzystanie z Serwisu wymaga logowania, które służy wyłącznie do
                celów technicznych (limitowanie liczby zapytań) oraz
                umożliwienia zgłaszania błędów. Administrator zastrzega sobie
                prawo do zablokowania dostępu w przypadku naruszenia warunków
                korzystania z usługi.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. Odpowiedzialność
              </h2>
              <p className="text-muted-foreground mb-4">
                Administrator Serwisu:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Nie ponosi odpowiedzialności za decyzje podjęte na podstawie
                  informacji uzyskanych za pośrednictwem Serwisu
                </li>
                <li>Nie gwarantuje nieprzerwanego działania Serwisu</li>
                <li>
                  Zastrzega sobie prawo do wprowadzania zmian w funkcjonowaniu
                  Serwisu
                </li>
                <li>
                  Nie ponosi odpowiedzialności za szkody wynikłe z korzystania z
                  Serwisu
                </li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Własność Intelektualna
              </h2>
              <p className="text-muted-foreground">
                Wszelkie prawa własności intelektualnej do treści i
                funkcjonalności Serwisu należą do Administratora. Użytkownik
                może korzystać z Serwisu wyłącznie w zakresie dozwolonego użytku
                osobistego. Wykorzystywane teksty aktów prawnych pochodzą z
                publicznych źródeł i podlegają odpowiednim licencjom.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Zgłaszanie Błędów
              </h2>
              <p className="text-muted-foreground">
                Użytkownicy mogą zgłaszać błędy w działaniu Serwisu poprzez
                dostępne w nim mechanizmy. Administrator dokłada starań, aby
                zgłoszone błędy były analizowane i poprawiane w miarę
                możliwości.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. Zmiany w Warunkach
              </h2>
              <p className="text-muted-foreground">
                Administrator zastrzega sobie prawo do zmiany niniejszych
                Warunków Korzystania z Usługi. O istotnych zmianach użytkownicy
                będą informowani poprzez Serwis. Dalsze korzystanie z Serwisu po
                wprowadzeniu zmian oznacza ich akceptację.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                9. Postanowienia Końcowe
              </h2>
              <p className="text-muted-foreground">
                W sprawach nieuregulowanych niniejszymi Warunkami Korzystania z
                Usługi zastosowanie mają przepisy prawa polskiego. Wszelkie
                spory będą rozstrzygane przez właściwe sądy polskie. Nieważność
                któregokolwiek z postanowień nie wpływa na ważność pozostałych
                postanowień.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default TermsPage;
