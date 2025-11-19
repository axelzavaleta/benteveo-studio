// authCheck.js

// Función para actualizar la interfaz del usuario
const updateUserInterface = (user) => {
  const userAccount = document.querySelector(".user-account");
  const userBtn = document.getElementById("user-btn");
  const usernameMenu = document.getElementById("username-menu");
  const authButtons = document.querySelector(".auth-buttons");
  const cartContainer = document.querySelector(".cart-container");
  
  console.log("🔄 Actualizando interfaz para usuario:", user?.userName);
  console.log("🖼️ Avatar URL disponible:", user?.userAvatarUrl);
  console.log("📝 Tipo de avatar:", typeof user?.userAvatarUrl);
  
  if (userAccount && userBtn && usernameMenu) {
    // Mostrar elementos de usuario logueado
    if (authButtons) authButtons.classList.add("hidden");
    if (cartContainer) cartContainer.classList.remove("hidden");
    userAccount.classList.remove("hidden");
    
    // Actualizar nombre de usuario
    usernameMenu.textContent = user.userName;
    
    // Actualizar imagen de perfil
    const userImg = userBtn.querySelector("img");
    
    if (user.userAvatarUrl && user.userAvatarUrl !== "" && user.userAvatarUrl !== null) {
      console.log("✅ Intentando cargar avatar del backend...");
      
      const testImg = new Image();
      testImg.onload = function() {
        console.log("✅ Avatar cargado exitosamente");
        userImg.src = user.userAvatarUrl;
        userImg.alt = `${user.userName} avatar`;
        userImg.className = "w-full h-full rounded-full object-cover";
        userImg.style = "";
      };
      testImg.onerror = function() {
        console.log("❌ Error cargando avatar, usando SVG por defecto");
        userImg.src = "/src/assets/user.svg";
        userImg.alt = "user-logo";
        userImg.className = "w-8 h-8";
        userImg.style = "";
      };
      testImg.src = user.userAvatarUrl;
      
    } else {
      console.log("ℹ️ No hay avatar disponible, usando SVG por defecto");
      userImg.src = "/src/assets/user.svg";
      userImg.alt = "user-logo";
      userImg.className = "w-8 h-8";
      userImg.style = "";
    }
  }
}

// Función para verificar el estado de autenticación
const checkAuthStatus = () => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  
  console.log("🔍 Verificando estado de autenticación...");
  console.log("🔑 Token existe:", !!token);
  console.log("👤 Datos de usuario en localStorage:", userData);
  
  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      console.log("✅ Usuario autenticado:", user.userName);
      updateUserInterface(user);
    } catch (error) {
      console.error("❌ Error parseando usuario:", error);
      showAuthButtons();
    }
  } else {
    console.log("❌ Usuario no autenticado");
    showAuthButtons();
  }
}

// Función para mostrar botones de autenticación
const showAuthButtons = () => {
  const authButtons = document.querySelector(".auth-buttons");
  const cartContainer = document.querySelector(".cart-container");
  const userAccount = document.querySelector(".user-account");
  
  if (authButtons) authButtons.classList.remove("hidden");
  if (cartContainer) cartContainer.classList.add("hidden");
  if (userAccount) userAccount.classList.add("hidden");
}

// Hacer la función global para que auth.js pueda usarla
window.updateUserInterface = updateUserInterface;

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
});