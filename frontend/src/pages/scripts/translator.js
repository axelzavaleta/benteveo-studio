const customDictionary = {
  "Inicio": "Home",
  "Nosotros": "About Us",
  "Asistencia": "Help",
  "Servicios": "Services",
  "Catálogo": "Catalog",

  "Prueba": "Test",

  "Desarrollando desde" : "Developing since",
  
  "Comienza tu aventura en 4 pasos": "Start your journey in 4 steps",

  "Sigue estos sencillos pasos para empezar a explorar, encontrar y disfrutar tu próximo juego.":
    "Follow these simple steps to explore, find and enjoy your next game.",

  "Crea una cuenta": "Create an account",
  "Para empezar a explorar, crea una cuenta o inicia sesión. Así podras guardar tus juegos favoritos y tener un proceso de compra seguro y rápido.":
    "To start exploring, create an account or log in. This way you can save and buy your favorite games quickly and safely.",

  "Explorá el catálogo": "Browse the catalog",
  "Explorá nuestro catálogo y descubre el juego perfecto para ti. Entre los distintos titulos, seguro encontrás tu próxima aventura.":
    "Browse our catalog and find the perfect game for you. Among our many titles, you'll surely find your next adventure.",

  "Añade al carrito": "Add to cart",
  "Añade al carrito los juegos que más te gusten. Puedes revisar, editar o eliminar productos antes de finalizar la compra.":
    "Add the games you like the most to your cart. You can check, edit or delete products before completing your purchase.",

  "Completa tu compra": "Complete your purchase",
  "Completa tu compra de forma segura. Recibirás una confirmación por correo electrónico. ¡Y listo! Nosotros nos encargamos de que lo disfrutes al máximo.":
    "Complete your purchase safely. You'll receive a confirmation email. We'll make sure you enjoy it to the fullest."
};

let isTranslated = false;
let originalTexts = {};

function extractTextFromElement(element) {
  const texts = {};
  let idCounter = 0;

  function traverse(element) {
    if (
      element.nodeType === Node.ELEMENT_NODE &&
      element.classList &&
      element.classList.contains("no-translate")
    ) {
      return;
    }

    if (
      element.nodeType === Node.TEXT_NODE &&
      element.textContent.trim() !== "" &&
      !element.parentElement.tagName.match(/SCRIPT|STYLE/i)
    ) {
      const text = element.textContent.trim();
      const textId = "text_" + idCounter++;
      texts[textId] = {
        text,
        element,
        type: "textNode",
      };
    }

    if (element.nodeType === Node.ELEMENT_NODE) {
      const tagName = element.tagName.toLowerCase();

      if (
        (tagName === "input" && element.type !== "hidden") ||
        tagName === "button" ||
        tagName === "textarea"
      ) {
        if (element.value && element.value.trim() !== "") {
          const textId = "attr_value_" + idCounter++;
          texts[textId] = {
            text: element.value,
            element,
            type: "value",
            attribute: "value",
          };
        }
      }

      if (element.placeholder) {
        const textId = "attr_placeholder_" + idCounter++;
        texts[textId] = {
          text: element.placeholder,
          element,
          type: "placeholder",
          attribute: "placeholder",
        };
      }

      if (tagName === "img" && element.alt) {
        const textId = "attr_alt_" + idCounter++;
        texts[textId] = {
          text: element.alt,
          element,
          type: "alt",
          attribute: "alt",
        };
      }
    }

    if (element.childNodes) {
      element.childNodes.forEach((child) => traverse(child));
    }
  }

  traverse(element);
  return texts;
}

async function translateNewElement(element, targetLang) {
  const texts = extractTextFromElement(element);

  for (const [id, data] of Object.entries(texts)) {
    const text = data.text;
    if (text.length < 3 || text.match(/^https?:\/\//)) continue;

    const translated = await translateText(text, targetLang);

    if (data.type === "textNode") {
      data.element.textContent = translated;
    } else if (data.type === "value") {
      data.element.value = translated;
    } else if (data.type === "placeholder") {
      data.element.placeholder = translated;
    } else if (data.type === "alt") {
      data.element.alt = translated;
    }
  }
}

async function translatePage(targetLang) {
  const bodyElement = document.body;
  const allTexts = extractTextFromElement(bodyElement);

  if (!isTranslated) {
    originalTexts = allTexts;
  }

  document.body.classList.add("translating");

  try {
    for (const [id, data] of Object.entries(allTexts)) {
      const text = data.text;
      if (text.length < 3 || text.match(/^https?:\/\//)) continue;

      const translated = await translateText(text, targetLang);

      if (data.type === "textNode") {
        data.element.textContent = translated;
      } else if (data.type === "value") {
        data.element.value = translated;
      } else if (data.type === "placeholder") {
        data.element.placeholder = translated;
      } else if (data.type === "alt") {
        data.element.alt = translated;
      }
    }

    isTranslated = true;

  } catch (error) {
    console.error(error);
    alert("Error al traducir la página.");
  } finally {
    document.body.classList.remove("translating");
  }
}

async function translateText(text, targetLang) {
  const sourceLang = targetLang === "en" ? "es" : "en";

  if (targetLang === "en" && customDictionary[text]) {
    return customDictionary[text];
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
    text
  )}`;

  const response = await fetch(url);
  const data = await response.json();

  return data[0].map((item) => item[0]).join("");
}

function restoreOriginalText() {
  document.body.classList.add("translating");

  try {
    for (const [id, data] of Object.entries(originalTexts)) {
      if (data.type === "textNode") {
        data.element.textContent = data.text;
      } else if (data.type === "value") {
        data.element.value = data.text;
      } else if (data.type === "placeholder") {
        data.element.placeholder = data.text;
      } else if (data.type === "alt") {
        data.element.alt = data.text;
      }
    }

    isTranslated = false;

  } catch (error) {
    console.error("Error al restaurar:", error);
  } finally {
    document.body.classList.remove("translating");
  }
}

/* -----------------------------------------
   EVENTOS DE BOTONES
----------------------------------------- */
const btnES = document.getElementById("btnES");
const btnEN = document.getElementById("btnEN");

btnES.addEventListener("click", () => {
  restoreOriginalText();
  btnES.classList.add("active");
  btnEN.classList.remove("active");
  localStorage.setItem("language", "es");
});

btnEN.addEventListener("click", () => {
  translatePage("en");
  btnEN.classList.add("active");
  btnES.classList.remove("active");
  localStorage.setItem("language", "en");
});

window.addEventListener("load", () => {
  const savedLang = localStorage.getItem("language");

  if (savedLang === "en") {
    translatePage("en");
    btnEN.classList.add("active");
    btnES.classList.remove("active");
  }
});