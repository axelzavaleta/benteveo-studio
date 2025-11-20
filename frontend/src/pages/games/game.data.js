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

  gameImg.src = game.productImageUrl || "/src/assets/no-image.png";
  gameTitle.textContent = game.productName;

  const tagsContainer = document.getElementById("game-tags");
  tagsContainer.innerHTML = "";

  if (game.tags?.length > 0) {
    game.tags.forEach(tag => {
      const span = document.createElement("span");
      span.classList.add("game-tag");
      span.textContent = tag;

      tagsContainer.appendChild(span);
    });
  } else {
    tagsContainer.style.display = "none";
  }

  gameEntryDesc.textContent = game.productDesc || "Sin descripción disponible.";
  gamePrice.textContent = game.productPrice;
  gameLongDesc.textContent = game.longDesc || "Sin detalles adicionales.";
  gameDeveloper.textContent = game.developer || "Desarrollador desconocido";
  gameSize.textContent = game.size || "No especificado";
  gameReleaseDate.textContent = game.releaseDate || "Próximamente";
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

    renderGame(game);
  } catch (error) {
    console.error(error);
    document.querySelector(".game-presentation").innerHTML = `
      <p class="text-center text-red-500 text-xl">Producto no encontrado.</p>
    `;
  }
}

loadGame();