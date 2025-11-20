const GAME_TEXTS = {
  es: {
    loginRequiredTitle: "Error",
    loginRequiredMsg: "Inicie sesión para administrar su carrito",
    successTitle: "Éxito",
    successMsg: "Se ha añadido el producto correctamente al carrito",
    alreadyInCartTitle: "Advertencia",
    alreadyInCartMsg: "Este juego ya esta en su carrito."
  },
  en: {
    loginRequiredTitle: "Error",
    loginRequiredMsg: "Log in to manage your cart",
    successTitle: "Success",
    successMsg: "The product has been added to the cart successfully",
    alreadyInCartTitle: "Warning",
    alreadyInCartMsg: "This game is already in your cart."
  }
};

const gameContainer = document.querySelector(".game-presentation");
const addToCartBtn = document.getElementById("add-to-cart");
const toastContainer = document.getElementById("toast");
const toastTitle = document.getElementById("toast-title");
const toastIcon = document.getElementById("toast-icon");
const toastContent = document.getElementById("toast-content");

const getGameData = (container) => {
  const tags = container.querySelectorAll(".game-tag");

  const gameTags = [];
  tags.forEach(tag => {
    gameTags.push(tag.textContent);
  })

  return {
    gameTitle: container.querySelector("#game-title").textContent,
    gamePrice: parseInt(container.querySelector("#game-price").textContent),
    gameTags: gameTags,
    gameImg: container.querySelector("#game-img").src,
  }
}

const saveToCart = (game) => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  
  const exists = cart.some(item => item.gameTitle === game.gameTitle);

  if (exists) {
    showToast(
      "error",
      GAME_TEXTS[langG].alreadyInCartTitle,
      GAME_TEXTS[langG].alreadyInCartMsg,
    );
    return;
  }

  cart.push(game);

  showToast(
    "success",
    GAME_TEXTS[langG].successTitle,
    GAME_TEXTS[langG].successMsg
  );
  localStorage.setItem("cart", JSON.stringify(cart));
}

const showToast = (status, title, content) => {
  status === "error"
  ? toastIcon.src = "/src/assets/error-circle.svg"
  : toastIcon.src = "/src/assets/check-circle.svg";
  
  toastContainer.classList.add(status);
  toastContainer.classList.add("show");
  toastTitle.textContent = title;
  toastContent.textContent = content;
  
  setTimeout(() => {
    addToCartBtn.removeAttribute("disabled");
    toastContainer.classList.remove("success", "error");
    toastContainer.classList.remove("show");
  }, 3000);
}

const langG = localStorage.getItem("languageGame") || "es";

addToCartBtn.addEventListener("click", () => {
  const isLogged = localStorage.getItem("token");
  toastContainer.classList.remove("hidden");
  addToCartBtn.setAttribute("disabled", true);

  if (!isLogged) {
    return showToast(
      "error",
      GAME_TEXTS[langG].loginRequiredTitle,
      GAME_TEXTS[langG].loginRequiredMsg
    );
  }

  const gameData = getGameData(gameContainer);
  saveToCart(gameData);
})

function protectGameDataFromTranslation() {
  const selectors = [
    "#game-title"
  ];

  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add("no-translate");
    });
  });
}

// ejecutar apenas carga el archivo
protectGameDataFromTranslation();

const item = document.createElement("div");
item.classList.add("cart-item", "no-translate");