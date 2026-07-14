# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

FireUp is a static one-page marketing site (Polish) for fire-safety/BHP services (Instrukcje Bezpieczeństwa Pożarowego, PPOŻ audits, training, evacuation drills). No backend, no build process, no package manager — plain HTML/CSS/JS only.

## Structure

```
index.html            page content (nav, hero, services, DZPW, quote calculator, about, contact)
assets/css/style.css   styles — design tokens as CSS custom properties
assets/js/main.js      mobile nav toggle, scroll-reveal animation, IBP quote form logic, DZPW form logic
```

There is no bundler, no dependencies, and no test suite — edits are made directly to these three files.

## Running locally

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/index.html`. Opening `index.html` directly via `file://` also works, but some browsers restrict fetch/CORS behavior in that mode, so the local server is preferred.

## Editing content

All contact details (phone number, service area, hours) are hardcoded directly in `index.html`'s `#kontakt` section, plus the header `tel:` link and the floating call button at the bottom of the page. When changing the phone number, update every occurrence of `tel:601799162`.

## Progressive enhancement

Scroll-reveal sections (`.reveal` class) are fully visible by default if `assets/js/main.js` fails to run. The hide/animate behavior only activates once the script adds the `js-anim` class to `<html>` — see the `.js-anim .reveal` rules in `assets/css/style.css`.

The quote form (`#wycena`) follows the same pattern: its two-step wizard (calculate → reveal contact fields) only activates once `assets/js/main.js` adds `has-calc` to the form (`.quote-form.has-calc [data-step="2"]` in `assets/css/style.css`). Without JS, every field is shown flat and the form still submits natively.

## Quote form (`#wycena`)

Client-side-only pricing estimate (rodzaj obiektu / powierzchnia / kondygnacje / nowa vs. aktualizacja / kategoria ZL). Pricing constants (`QUOTE_TYPE_BASE`, `QUOTE_ZL_ADDON`, `QUOTE_UPDATE_MULTIPLIER`) live in `assets/js/main.js`, reflect the site owner's actual rate structure, and should not be changed without explicit instruction.

Editing a step-1 field after a calculation invalidates the result (`invalidateEstimate` in `assets/js/main.js`): it hides `#quote-result`, clears the hidden `orientacyjna_wycena` field, and re-hides the step-2 contact fields until the client recalculates — this prevents submitting a stale estimate that no longer matches the current inputs.

Leads are delivered via [Web3Forms](https://web3forms.com) (no backend): the form POSTs to `https://api.web3forms.com/submit`, carrying a live `access_key` hidden input in `index.html`. JS intercepts submit for an AJAX post + inline success/error message; without JS the form still submits as a native POST and Web3Forms redirects to its own default thank-you page.

## DZPW form (`#dzpw`)

Separate lead-capture form for Dokument Zabezpieczenia przed Wybuchem — deliberately has no pricing calculator (per the site owner: DZPW cost needs individual analysis of the technological process, substances, installations, and explosion hazard zones, so it must never be folded into the IBP calculator). Same delivery pattern as the IBP form (Web3Forms, same `access_key`) but with its own `subject` (`Nowe zapytanie o Dokument Zabezpieczenia przed Wybuchem – FireUp`) and `from_name`, wired independently in `assets/js/main.js` (`#dzpw-formularz` block) — it shares no DOM ids or JS state with `#quote-form`.

## Deploy

Published via GitHub Pages at https://ikontaktfireup.github.io/Fireup/, building automatically from the repo root on `main` — just commit and push.
