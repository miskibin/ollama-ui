Od miesiąca tworzę asystenta prawnego, który z każdym tygodniem lepiej rozumie polskie prawo.
Robię to za darmo, a kod jest otwarty.

2 tygodnie temu udostępniłem prototyp, wiedząc, że nie jest jeszcze gotowy, z nadzieją na krytykę.
Nie zawiodłem się, zgłoszenia błędów były bezcenne. [zgloszenia]
Potrzebowałem informacji zwrotnej aby zrozumieć odbiorców. 

To była faza pierwsza pierwsza projektu. 
Nie chcialem tracić dziesiątek godzin na analizowanie danych, a bardziej pokazać kocept i sprawdzić czy jest to warte dalszego rozwoju.
W między czasie starałem się zrozumieć, jak wydawane są ustawy w polsce. 
Otóż jest to zaskakująco podobne do tego jak pisze się aplikacje - tylko dużo gorsze. 
Najpierw wydawana jest pierwsza wersja ustawy. 
Na przykład kodeks karny został wydany 97 roku. 
Potem kazdego roku wydawane są poprawki. Są to takie dokuemnty ktore nie maja sensu, Sa tam zdania typu: w art3. zamienia się słowo "kot" na "pies".  
https://api.sejm.gov.pl/eli/acts/DU/2024/1228/text.pdf
I dopiero jak taki dokuemnt z poprawkami zostanie opublikowany, wtedy publikuje się tekst jedonlity ustawy. Ten tkst jedonolity to tekst orginalnej ustawy z naniesionymi juz poprawkami. 
Z tego właśnie korzystam. Gwarantuje to, ze zawsze korzystam z najnowszego prawa. W pierwszej wersji aplikacji  analizowałem również te dokumenty z poprawkami co wprowadziło szum do moich danych.

Musiałem rozwiązać inne zagadnienie. Mianowicie problem ze streszczaniem ustaw. 
Istnieje taki koncept jak "lost in the middle" w kotekście AI. Oznacza to, że przy długich tekstach model zapomina o tym co jest w środku i skupia się na początku i końcu. Ponieważ ustawa ma zazwyczaj pare set stron, a ja próbowałem streszczać ją w całości, to model tak naprawdę skupiał się na kilku pierwszych i ostatnich artykułach i tyle. Niestety póki co nie mogłem sobie na zapisywanie artykułów pojedńczo, bo jedna ustawa może zawierać nawet kilka tysięcy artykułów a ustaw jest około 2000. 


Jedna myśl jaka mi się narzuciła, to że projektowanie aplikacji AI jest bezlitosne. 
W tradycyjnych aplikajach to ja decyduję co zobaczy użytkownik po każdym kliknięciu. 
Tutaj 2 użytkowników może zapytać o to samo w innych słowach i dostać 2 różne odpowiedzi.
Oczywiście są sposoby na to aby odpowiedzi były zgodne, ale nie jest to tak oczywiste jak w przypadku tradycyjnych aplikacji. W mojej poprzedniej aplikacji łatwo było zauważyć włożony wysiłek, ładne wykresy zaawansowane statystyki i tak dalej. Tutaj dla osób niewtajemniczonych może to wyglądać  jak nakładka na chat gpt.
Kolejnym wyzwaniem są sami użytkownicy. Wydaje się, że część z nas boi się AI i świadomie lub nie chce, żeby to wszystko nie działało. Dla tych osób mam dobrą wiadomość, póki co będą jeszcze zdarzać się błędy.


## Wstęp
• Asystent prawny - month update
• Open source + darmowy
• Prototyp -> feedback bezcenny ✓

## Walka z google
- Prawne podejście
- najnowszą wersja ustaw
- źródła
- 5 kroków generowania odpowiedzi, reasoning [paint]



## 1 etap
• Problem: Lost in the middle oraz `cut`
- smieci w danych
- słabe prompty
- słabe modele
- brak testow



## 2 etap
1. Jak sie tworzy ustawy
    • Pierwsza wersja (np. KK '97)
    • Coroczne poprawki ("kot" -> "pies")
    • Tekst jednolity = stable release
    • [POKAŻ LINK PDF]
- testy
- splitting
• PRoblem: 2000 ustaw x tysiące artykułów
- metadane

## 3. etap
- crossreference
- knowelage graph
- interpreatecje.

## AI vs Traditional
• Brak pełnej kontroli nad outputem
• To samo pytanie = różne odpowiedzi
• Trudno pokazać real value
• User feedback = niektórzy "chcą" błędów

### Koszty koszty koszty.