const userBtn = document.getElementById("user-btn");
const logoutBtn = document.querySelector("#logout-btn");

const toggleUserMenu = () => {
  const userMenu = document.querySelector(".user-menu");
  userMenu.toggleAttribute("data-active");

  userMenu.hasAttribute("data-active") 
    ? userMenu.classList.remove("hidden") 
    : userMenu.classList.add("hidden");
}

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  location.href = "/index";
}

userBtn.addEventListener("click", toggleUserMenu)
logoutBtn.addEventListener("click", logout);