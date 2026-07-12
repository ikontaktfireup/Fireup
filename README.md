# FireUp – strona wizytówka

Statyczna strona jednostronicowa dla usług PPOŻ/BHP (Instrukcje
Bezpieczeństwa Pożarowego, audyty PPOŻ, szkolenia, próbne ewakuacje).
Bez backendu i bez procesu budowania — czysty HTML/CSS/JS.

## Struktura

```
index.html           strona (nawigacja, hero, usługi, o mnie, kontakt)
assets/css/style.css  style (design tokens jako CSS custom properties)
assets/js/main.js     menu mobilne + animacja pojawiania się sekcji przy scrollu
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

## Progressive enhancement

Sekcje ze scroll-reveal (klasa `.reveal`) są w pełni widoczne, jeśli
`assets/js/main.js` się nie wykona — ukrywanie i animacja aktywują się
dopiero po dodaniu klasy `js-anim` do `<html>` przez skrypt
(`assets/css/style.css`, reguły `.js-anim .reveal`).

## Deploy

Repozytorium nie zawiera obecnie konfiguracji hostingu/CI. Strona jest
w pełni statyczna, więc nadaje się bezpośrednio pod GitHub Pages,
Cloudflare Pages, Netlify albo dowolny hosting plików statycznych —
wystarczy wskazać katalog główny repo jako źródło.
