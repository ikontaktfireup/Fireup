# FireUp – strona wizytówka

Statyczna strona jednostronicowa dla usług PPOŻ/BHP (Instrukcje
Bezpieczeństwa Pożarowego, audyty PPOŻ, szkolenia, próbne ewakuacje).
Bez backendu i bez procesu budowania — czysty HTML/CSS/JS.

## Struktura

```
index.html           strona (nawigacja, hero, usługi, DZPW, wycena, o mnie, kontakt)
assets/css/style.css  style (design tokens jako CSS custom properties)
assets/js/main.js     menu mobilne, animacja przy scrollu, kalkulator wyceny IBP, formularz DZPW
```

## Podgląd lokalny

Dowolny serwer statyczny wystarczy, np.:

```bash
python -m http.server 8000
```

i otwórz `http://localhost:8000/index.html`. Otwarcie pliku
bezpośrednio przez `file://` też działa, ale niektóre przeglądarki
ograniczają wtedy zachowanie fetch/CORS — serwer lokalny jest
bezpieczniejszą opcją.

## Edycja treści

Wszystkie dane kontaktowe (telefon, obszar działania, godziny) są
wpisane wprost w `index.html` w sekcji `#kontakt` oraz w przycisku
`tel:` w nagłówku i w pływającym przycisku telefonu na dole strony —
przy zmianie numeru trzeba zaktualizować wszystkie wystąpienia
`tel:601799162`.

## Formularz wyceny (sekcja `#wycena`)

Formularz liczy orientacyjną wycenę IBP na podstawie rodzaju obiektu,
powierzchni, liczby kondygnacji, typu zlecenia (nowa/aktualizacja) i
kategorii ZL — logika i stawki (do zmiany na własne) są w
`assets/js/main.js` w stałych `QUOTE_TYPE_BASE` i `QUOTE_ZL_ADDON`.
Po wyliczeniu wyceny formularz pokazuje pola kontaktowe i wysyła całość
(dane o obiekcie + wycenę + kontakt) mailem przez
[Web3Forms](https://web3forms.com) — darmowy serwis do obsługi
formularzy na stronach statycznych, bez potrzeby własnego backendu.

Klucz jest już ustawiony w `index.html` (pole `access_key` w sekcji
`#wycena`). Jeśli trzeba go kiedyś podmienić (np. po rotacji klucza):

1. Wejdź na https://web3forms.com i wygeneruj darmowy Access Key,
   podając swój e-mail (nie trzeba zakładać konta z hasłem).
2. W `index.html`, w sekcji `#wycena`, podmień wartość pola
   `<input type="hidden" name="access_key" ...>` na nowy klucz.
3. Wyślij testowe zgłoszenie z opublikowanej strony, żeby potwierdzić,
   że e-mail dochodzi (Web3Forms wysyła link aktywacyjny po pierwszym
   zgłoszeniu).

Formularz działa też bez JavaScriptu (wysyła się jako zwykły POST i
przenosi na domyślną stronę z podziękowaniem od Web3Forms) — nie
pokaże wtedy wyliczonej wyceny, ale kontakt i dane obiektu i tak
dotrą na maila.

## Formularz DZPW (sekcja `#dzpw`)

Osobny formularz zapytania o Dokument Zabezpieczenia przed Wybuchem —
bez kalkulatora, bo cena wymaga indywidualnej analizy procesu
technologicznego, substancji i stref zagrożenia wybuchem. Wysyła dane
przez ten sam Web3Forms i ten sam `access_key`, ale z osobnym
tematem (`subject`) i nadawcą (`from_name`), więc zgłoszenia IBP i
DZPW łatwo odróżnić w skrzynce. Logika wysyłki (AJAX + fallback bez
JS) jest analogiczna do formularza wyceny IBP, zdefiniowana osobno w
`assets/js/main.js`.

## Progressive enhancement

Sekcje ze scroll-reveal (klasa `.reveal`) są w pełni widoczne, jeśli
`assets/js/main.js` się nie wykona — ukrywanie i animacja aktywują się
dopiero po dodaniu klasy `js-anim` do `<html>` przez skrypt
(`assets/css/style.css`, reguły `.js-anim .reveal`).

## Deploy

Strona jest opublikowana przez GitHub Pages pod
https://ikontaktfireup.github.io/Fireup/ — buduje się automatycznie
z katalogu głównego gałęzi `main` przy każdym pushu, bez dodatkowej
konfiguracji CI.
