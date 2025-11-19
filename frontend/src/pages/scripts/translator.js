let isTranslated = false;
let originalTexts = {};

/* -----------------------------------------
   EXTRAER TODOS LOS TEXTOS DEL DOCUMENTO
----------------------------------------- */
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

/* -----------------------------------------
   TRADUCIR ELEMENTO NUEVO DINÁMICAMENTE
----------------------------------------- */
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

/* -----------------------------------------
   TRADUCIR TODA LA PÁGINA
----------------------------------------- */
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

/* -----------------------------------------
   API DE TRADUCCIÓN
----------------------------------------- */
async function translateText(text, targetLang) {
  const sourceLang = targetLang === "en" ? "es" : "en";

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
    text
  )}`;

  const response = await fetch(url);
  const data = await response.json();

  return data[0].map((item) => item[0]).join("");
}

/* -----------------------------------------
   RESTAURAR TEXTO ORIGINAL
----------------------------------------- */
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