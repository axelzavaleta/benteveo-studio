const registerForm = document.getElementById("signup-modal");
const loginForm = document.getElementById("login-modal");
const userBtn = document.getElementById("user-btn");
const logoutBtn = document.querySelector("#logout-btn");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nameInput = registerForm.querySelector("#username");
  const emailInput = registerForm.querySelector("#email-signup");
  const passwordInput = registerForm.querySelector("#password-signup");
  const repeatPasswordInput = registerForm.querySelector("#repeat-password-signup");

  const userName = nameInput.value.trim();
  const userEmail = emailInput.value.trim();
  const userPassword = passwordInput.value;
  const repeatPassword = repeatPasswordInput.value;

  const msgError = registerForm.querySelector("#message-error");
  const submitBtn = registerForm.querySelector("input[type='submit']")

  const displayError = (message) => {
    msgError.textContent = message;
    submitBtn.setAttribute("disabled", true);

    setTimeout(() => {
      submitBtn.removeAttribute("disabled");
      msgError.textContent = "";
    }, 3000);
  };

  if (!userName || !userEmail || !userPassword) {
    displayError("Se deben rellenar todos los campos.")
    return;
  }

  if (userName.length < 4) {
    displayError("El nombre de usuario debe tener minimo 4 caracteres.")
    return;
  }

  if (userPassword.length <= 4) {
    displayError("La contraseña debe tener mas 4 caracteres.")
    return;
  }

  if (userPassword !== repeatPassword) {
    displayError("Las contraseñas no coinciden.")
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(userEmail)) {
    displayError("Formato de email invalido.")
    return;
  }

  const userData = {
    userName,
    userEmail,
    userPassword,
  }

  try {
    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData)
    })

    const response = await res.json();

    if (!res.ok) {
      displayError(response.error);
      return;
    }

    const token = response.token;
    const user = response.publicUserData;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    repeatPasswordInput.value = "";
    submitBtn.setAttribute("disabled", true);

    msgError.classList.add("register-successfully")
    msgError.textContent = "Registro realizado con exito!!";

    setTimeout(() => {
      location.href = "/index";
    }, 2000);
  } catch (err) {
    console.error("Error de red:", err);
    msgError.textContent = "Error en la conexion. Intentalo mas tarde.";
  }
})

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailInput = loginForm.querySelector("#email-login");
  const passwordInput = loginForm.querySelector("#password-login");

  const userEmail = emailInput.value.trim();
  const userPassword = passwordInput.value;

  const msgError = loginForm.querySelector("#message-error");
  const submitBtn = loginForm.querySelector("input[type='submit']")

  const displayError = (message) => {
    msgError.textContent = message;
    submitBtn.setAttribute("disabled", true);

    setTimeout(() => {
      submitBtn.removeAttribute("disabled");
      msgError.textContent = "";
    }, 3000);
  };

  if (!userEmail || !userPassword) {
    displayError("Se deben rellenar todos los campos.")
    return;
  }

  if (userPassword.length <= 4) {
    displayError("La contraseña debe tener minimo 4 caracteres.")
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(userEmail)) {
    displayError("Formato de email invalido.")
    return;
  }

  const userData = {
    userEmail,
    userPassword,
  }

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData)
    })

    const response = await res.json();

    if (!res.ok) {
      displayError(response.error);
      return;
    }

    const token = response.token;
    const user = response.publicUserData;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    if (user.userStatus.userStatusName !== "activo") {
      displayError("Usuario suspendido!!")
      return;
    }

    let route = "/index";
    if (user.userRole.userRoleName === "admin") {
      route = "/src/pages/admin/admin.html";
    }

    emailInput.value = "";
    passwordInput.value = "";
    submitBtn.setAttribute("disabled", true);

    msgError.classList.add("login-successfully")
    msgError.textContent = "Inicio de sesion realizado con exito!!";

    setTimeout(() => {
      location.href = route;
    }, 2000);
  } catch (err) {
    console.error("Error de red:", err);
    msgError.textContent = "Error en la conexion. Intentalo mas tarde.";
  }
})


const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  location.href = "/index";
}

logoutBtn.addEventListener("click", logout);

userBtn.addEventListener("click", () => {
  const userMenu = document.querySelector(".user-menu");
  userMenu.toggleAttribute("data-active");

  if (userMenu.hasAttribute("data-active")) {
    userMenu.classList.remove("hidden");
  } else {
    userMenu.classList.add("hidden");
  }
})