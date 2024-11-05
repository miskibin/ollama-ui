Od miesiąca tworzę asystenta prawnego. Za darmo, a kod jest otwarty.
2 tygodnie temu udostępniłem prototyp, wiedząc, że nie jest jeszcze gotowy, z nadzieją na krytykę.
Nie zawiodłem się, zgłoszenia błędów były bezcenne. 
Potrzebowałem informacji zwrotnej aby zrozumieć odbiorców. 

To była faza pierwsza pierwsza projektu. 
Nie tracić dziesiątek godzin na analizowanie danych, a pokazać kocept i sprawdzić czy jest to warte dalszego rozwoju.
W między czasie starałem się zrozumieć, jak wydawane są ustawy w polsce. 
Otóż jest to zaskakująco podobne do tego jak pisze się aplikacje tylko dużo gorsze. 
Najpierw wydawana jest pierwsza wersja ustawy. 
Na przykład kodeks karny został wydany 97 roku. 
Potem wydawane są poprawki. Są to takie dokuemnty bez sensu. W których jest na przykład napisane w art3. zamienia się słowo "kot" na "pies".  
https://api.sejm.gov.pl/eli/acts/DU/2024/1228/text.pdf
I dopiero jak taki dokuemnt z poprawkami zostanie opublikowany, wtedy publikuje się tekst jedonlity ustawy. Ten tkst jedonolity to tekst orginalnej ustawy + poprawki. 
Z tego właśnie korzystam.  Niestety początkowo nie rozumiejąc danych analizowałem również te poprawki co wprowadziło szum do moich danych.

Jednak teraz mając już pewność, że korzystam z samych najnowszych tekstów jednolitych ustaw,  Musiałem rozwiązać inne zagadnienie. Mianowicie problem ze streszczaniem ustaw. 
Istnieje taki koncept jak "lost in the middle" w kotekście AI. Oznacza to, że przy długich tekstach model zapomina o tym co jest w środku i skupia się na początku i końcu. Ponieważ ustawa ma zazwyczaj pare set stron, a ja próbowałem streszczać ją w całości, to model tak naprawdę skupiał się na kilku pierwszych i ostatnich artykułach i tyle. Niestety póki co nie mogłem sobie na zapisywanie artykułów pojedńczo, bo jedna ustawa może zawierać nawet kilka tysięcy artykułów a ustaw jest około 2000. 


Jedna myśl jaka mi się narzuciła, to że projektowanie aplikacji AI jest bezlitosne. 
W tradycyjnych aplikajach to ja decyduję co zobaczy użytkownik po każdym kliknięciu. 
Tutaj 2 użytkowników może zapytać o to samo w innych słowach i dostać 2 różne odpowiedzi.
Oczywiście są sposoby na to aby odpowiedzi były zgodne, ale nie jest to tak oczywiste jak w przypadku tradycyjnych aplikacji. W mojej poprzedniej aplikacji łatwo było zauważyć włożony wysiłek, ładne wykresy zaawansowane statystyki i tak dalej. Tutaj dla osób niewtajemniczonych może to wyglądać  jak nakładka na chat gpt.
Kolejnym wyzwaniem są sami użytkownicy. Wydaje się, że część z nas boi się AI i świadomie lub nie chce, żeby to wszystko nie działało. Dla tych osób mam dobrą wiadomość, póki co będą jeszcze zdarzać się błędy.
