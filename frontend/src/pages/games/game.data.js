const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const renderGame = (game) => {
  const gameImg = document.getElementById("game-img");
  const gameTitle = document.getElementById("game-title");
  const gameEntryDesc = document.getElementById("game-entry-description");
  const gamePrice = document.getElementById("game-price");
  const gameLongDesc = document.getElementById("game-large-description");
  const gameDeveloper = document.getElementById("game-developer");
  const gameSize = document.getElementById("game-size");
  const gameReleaseDate = document.getElementById("release-date-game");

  gameImg.src = game.productCoverImageUrl || "/src/assets/no-image.png";
  gameTitle.textContent = game.productName;

  const tagsContainer = document.getElementById("game-tags");
  const languageListContainer = document.getElementById("language-item-list");
  const platformListContainer = document.getElementById("platforms-item-list");
  
  if (game.tags.length > 0) {
    game.tags.forEach(tag => {
      const span = document.createElement("span");
      span.classList.add("game-tag");
      span.textContent = tag.tagName;

      tagsContainer.appendChild(span);
    });
  } else {
    tagsContainer.style.display = "none";
  }

  if (game.languages.length > 0) {
    game.languages.forEach(language => {
      const li = document.createElement("li");
      li.textContent = language.languageName;
      li.classList.add("languageItem");

      languageListContainer.append(li);
    })
  }

  if (game.platforms.length > 0) {
    game.platforms.forEach(platform => {
      const li = document.createElement("li");
      li.classList.add("platformItem");
      li.textContent = platform.platformName;

      platformListContainer.append(li);
    })
  }

  gameEntryDesc.textContentparameter = game.productShortDesc || "Sin descripción disponible.";
  gamePrice.textContent = game.productPrice;
  gameLongDesc.textContent = game.productLongDesc || "Sin detalles adicionales.";
  gameDeveloper.textContent = game.productDeveloper || "Desarrollador desconocido";

  if (game.productSize >= 1000) {
    const newSize = Number(game.productSize) / 1000;
    gameSize.textContent = `${newSize} GB` || "No especificado";
  } else {
    gameSize.textContent = `${game.productSize} MB` || "No especificado";
  }
  
  gameReleaseDate.textContent = game.productReleaseDate || "Próximamente";
} 

async function loadGame() {
  try {
    const response = await fetch(`http://localhost:3000/product/${productId}`, {
      method: "GET",
      headers: { 
        "Content-Type": "Application/json"
      }
    })
    const game = await response.json();

    console.log(game);
    

    renderGame(game);
  } catch (error) {
    console.error(error);
    document.querySelector(".game-presentation").innerHTML = `
      <p class="text-center text-red-500 text-xl">Producto no encontrado.</p>
    `;
  }
}

loadGame();