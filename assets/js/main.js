document.documentElement.classList.add("js-anim");

// Bazowe stawki wg rodzaju obiektu i dodatki wg kategorii ZL — dopasuj do
// własnego cennika. Wynik to tylko orientacyjny widełkowy szacunek.
const QUOTE_TYPE_BASE = {
  "Mieszkalny wielorodzinny": 900,
  "Biuro lub lokal usługowy": 1100,
  "Obiekt użyteczności publicznej": 1400,
  "Hotel, internat lub zamieszkanie zbiorowe": 1600,
  "Magazyn lub obiekt produkcyjny": 1800,
  "Inny obiekt": 1300,
};

const QUOTE_ZL_ADDON = {
  "ZL I / ZL II (szpital, przedszkole, dom opieki)": 700,
  "ZL III (biuro, sklep, urząd)": 0,
  "ZL IV (budynek mieszkalny)": 0,
  "ZL V (hotel, internat, zamieszkanie zbiorowe)": 400,
};

// Aktualizacja istniejącej IBP wyceniana jako ok. 60–70% ceny nowego opracowania.
const QUOTE_UPDATE_MULTIPLIER = 0.65;

function calcQuoteEstimate({ rodzaj, powierzchnia, kondygnacje, typZlecenia, kategoriaZl, liczbaOsob }) {
  let cena = QUOTE_TYPE_BASE[rodzaj] ?? QUOTE_TYPE_BASE["Inny obiekt"];

  if (powierzchnia > 500) {
    cena += Math.ceil((powierzchnia - 500) / 250) * 150;
  }

  if (kondygnacje > 3) {
    cena += (kondygnacje - 3) * 100;
  }

  if (kategoriaZl === "Nie wiem") {
    // Duża liczba osób / większa złożoność obiektu: dodatek 300–800 zł.
    const osoby = Number(liczbaOsob) || 0;
    if (osoby > 300) cena += 800;
    else if (osoby > 150) cena += 500;
    else if (osoby > 50) cena += 300;
  } else {
    cena += QUOTE_ZL_ADDON[kategoriaZl] ?? 0;
  }

  if (typZlecenia === "Aktualizacja istniejącej IBP") {
    cena *= QUOTE_UPDATE_MULTIPLIER;
  }

  // Szerokie widełki ±20% — to szacunek, nie ostateczna oferta.
  return {
    low: Math.round((cena * 0.8) / 50) * 50,
    high: Math.round((cena * 1.2) / 50) * 50,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const quoteForm = document.getElementById("quote-form");
  if (quoteForm) {
    quoteForm.classList.add("has-calc");

    const zlSelect = document.getElementById("kategoria-zl");
    const osobyField = document.getElementById("liczba-osob-field");
    const osobyInput = osobyField ? osobyField.querySelector("input") : null;
    if (zlSelect && osobyField && osobyInput) {
      const toggleOsobyField = () => {
        const isUnknown = zlSelect.value === "Nie wiem";
        osobyField.hidden = !isUnknown;
        osobyInput.required = isUnknown;
        if (!isUnknown) osobyInput.value = "";
      };
      zlSelect.addEventListener("change", toggleOsobyField);
      toggleOsobyField();
    }

    const step1 = quoteForm.querySelector('[data-step="1"]');
    const resultBox = document.getElementById("quote-result");
    const resultValue = document.getElementById("quote-result-value");
    const estimateField = document.getElementById("orientacyjna-wycena");
    const calcBtn = document.getElementById("quote-calc-btn");

    calcBtn.addEventListener("click", () => {
      for (const field of step1.querySelectorAll("[required]")) {
        if (!field.value) {
          field.reportValidity();
          return;
        }
      }

      const data = new FormData(quoteForm);
      const estimate = calcQuoteEstimate({
        rodzaj: data.get("rodzaj_obiektu"),
        powierzchnia: Number(data.get("powierzchnia")),
        kondygnacje: Number(data.get("kondygnacje")),
        typZlecenia: data.get("typ_zlecenia"),
        kategoriaZl: data.get("kategoria_zl"),
        liczbaOsob: data.get("liczba_osob"),
      });

      const estimateText = `${estimate.low.toLocaleString("pl-PL")} – ${estimate.high.toLocaleString("pl-PL")} zł netto`;
      resultValue.textContent = estimateText;
      if (estimateField) estimateField.value = estimateText;
      resultBox.hidden = false;
      quoteForm.classList.add("calculated");
      resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    // Any edit to step-1 inputs after a calculation invalidates it — otherwise
    // a stale range could stay visible/submitted after the client changes an answer.
    const invalidateEstimate = () => {
      if (!quoteForm.classList.contains("calculated")) return;
      quoteForm.classList.remove("calculated");
      resultBox.hidden = true;
      resultValue.textContent = "—";
      if (estimateField) estimateField.value = "";
    };

    step1.querySelectorAll("input, select").forEach((field) => {
      field.addEventListener("input", invalidateEstimate);
      field.addEventListener("change", invalidateEstimate);
    });

    const successMsg = document.getElementById("quote-success");
    const errorMsg = document.getElementById("quote-error");
    const submitBtn = quoteForm.querySelector(".quote-submit-btn");

    quoteForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorMsg.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = "Wysyłanie…";

      try {
        const response = await fetch(quoteForm.action, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(quoteForm),
        });
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Wysyłka nieudana");
        }

        quoteForm.hidden = true;
        resultBox.hidden = true;
        successMsg.hidden = false;
      } catch (err) {
        errorMsg.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Wyślij zapytanie o wycenę";
      }
    });
  }

  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }
});
