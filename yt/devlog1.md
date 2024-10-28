Cześć.
Stworzyłem asystenta, który  w tydzień  przeczytał i zapamiętał  więcej dokumentow prawnych - niż wszyscy Posłowie razem wzięci, ale za to miesiąc jego działania nie kosztuje nas 18 tysięcy miesięcznie.
Asystent potrafi rozmawiac na temat dowolnego istniejacego aktu prawnego, choć, żeby kojarzył się bardziej z rządzącymi czasem zdarzy mu się powiedzieć coś od rzeczy.
Ale na co to komu i komu to potrzebne? I kto mi za to placi?
Miesiąc temu powiedział bym, że to pozwoli ci zwyciężyć każdą dyskusję dot. Polskiego prawa, bo w ciągu 10 sekund jestes wstanie wyjechać z dokładnym cytatem i numerem ustawy.
Możesz przeczytać u źródła ile domów od plotu może stać twój dom, czy jak przechowywać broń. Cokolwiek.
Pierwszy beta tester rozwiał jednak moje marzenia. "Żyjemy w czasach demokracji walczącej" powiedział, prawo to to już pieśń przeszłości."
Ale o co możesz spytać asystenta a o co jeszcze nie? 

Asystent przeczytał wszystkie akty prawne zaktualizowane lub napisane po 2022 roku. Nie powinien mieć problemu z rozmową na temat dowolnego z nich. Jest to ponad 7000 tysięcy dokumentów a każedego dnia ich liczba rośnie. 
W przyszłości planuję rozszerzyć bazę o projekty starsze a także, te które procesowane są przez elitę naszego kraju - posłów.
Dodatkowo planuję integrację z informacjami o posiedzeniach komisji parlamentarnych, interpelacjach i inne. 
Jedyne co mnie jeszcze powstrzymuje to koszty. 
W czasie testowania różnych rozwiązań wydałem ponad 500 złotych na dosstępy do różnych modeli i serwerów. Różne modele AI musiały przeprocesować ponad 100 tysięcy stron aktów prawnych aby aplikacja działała. 
Niestety to nie koniec kosztów. Każde zapytanie do mojej aplikacji, kosztuje mnie w granicach jednego grosza. 
Wydaje się mało ale przy 1000 zapytaniach dziennie, to już 10 złotych dziennie. Dlatego jeśli chcesz umożliwić mi dalszy rozwój projektu, rozważ jego wsparcie, Ja będę miał fundusze na dalsze usprawnienia, a ty dostęp do GPT-4 w ramach aplikacji. 

Jeśli chcesz skorzystać z aplikacji, musisz się zalogować, jest to najprostsze zabezpieczenie przed botami, a także pozwala mi to na dodanie limitu zapytań na użytkownika. Poza tym pozwala mi to zebrać feedback. Jeśli nie podoba ci się odpowiedź - kliknij łapkę w dół, a ja przeanalizuję jak mogę ją poprawić.
Ci co mnie śledzą wiedzę, że jestem autorem projektu sejm-stats. To właśnie on służy mi jako źródło danych do chata.A Samo sejm-stats niedługo doczeka się sporej aktualizacji, o której opowiem kiedy indziej. 
Lista wszystkich funkcjonalności dostępna jest na githubie.

Wiem, że dla wielu osób to jak działają tego typu narzędzia jest czarną magią, dlatego chciałbym szybko opowiedzieć  - jak to działa. Na początku należy zwektoryzwoać wszystkie dostępne dokumenty - w naszym przypadku akty prawne. Same tytuły zawierają zbyt mało informacji, a treść jest zbyt długa. Dlatego w naszym przypadku pierwszym krokiem jest streszczenie całości dokumentu. To streszczenie podawane jest potem jako wejście do modelu, który wektoryzuje tekst. To znaczy, zamienia go listę liczb zawierającą informacje semantyczne.

Jeśli chcemy potem wyszukać jakiś dokument np. o Rolnikach, wystarczy, że wpiszemy słowo `kombajn` a model będzie wiedział, że chodzi o rolnictwo.
Całe to procesowanie zrealizowane jest po stron  ie `sejm-stats`. Gdy mamy już przygotowane dane, możemy zacząć budować naszego asystenta. Logika jest następująca.
Użytkownik wpisuje zapytanie: 
1. Model językowy (np GPT-4) analizuje czy pytanie dotyczy polskiego prawa.
2. Jeśli tak,  wysyła zapytanie do `sejm-stats`. Tam pytanie zamieniane jest na wektor liczb, a następnie porównywane z wektorami dokumentów. Zwracane jest kilka najbardziej podobnych dokumentów. Podobieństwo widoczne jest tutaj. 
3. Kiedy odpowiedź zostanie zwrócona asystent analizuje, zwrócone dokumenty i na ich podstawie odpowiada na pytanie.  Jeśli dokumenty nie zawierają odpowiedzi, użytkownik może poprosić asystenta o pobaranie najbardziej pasującej ustawy i przeczytanie jej w celu znalezienia odpowiedzi.


