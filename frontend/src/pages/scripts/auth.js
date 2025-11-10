const registerForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const pictureProfileInput = registerForm.querySelector("#profile-picture");
const pictureProfileImg = registerForm.querySelector("#profile-picture-img");
let dataImg = "";

const handleProfileImage = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    pictureProfileImg.src = e.target.result;
    dataImg = e.target.result;
  };
  reader.readAsDataURL(file);
}

const handleRegister = async (e) => {
  e.preventDefault();

  const usernameInput = registerForm.querySelector("#username");
  const emailInput = registerForm.querySelector("#email-signup");
  const telephoneInput = registerForm.querySelector("#telephone-signup");
  const passwordInput = registerForm.querySelector("#password-signup");
  const repeatPasswordInput = registerForm.querySelector("#repeat-password-signup");
  const msgError = registerForm.querySelector("#message-error");
  const submitBtn = registerForm.querySelector("input[type='submit']")

  const userName = usernameInput.value.trim();
  const userEmail = emailInput.value.trim();
  const userPhoneNumber = telephoneInput.value.trim();
  const userPassword = passwordInput.value;
  const repeatPassword = repeatPasswordInput.value;
  const userAvatarUrl = dataImg;

  const displayError = (message, inputsError = []) => {
    msgError.textContent = message;
    submitBtn.setAttribute("disabled", true);
    
    inputsError.forEach(input => input.classList.add("field-modal-error"));

    setTimeout(() => {
      submitBtn.removeAttribute("disabled");
      msgError.textContent = "";
      
      inputsError.forEach(input => input.classList.remove("field-modal-error"));
    }, 3000);
  };

  if (!userName || !userEmail || !userPassword) {
    return displayError("Se deben rellenar los campos obligatorios.", [usernameInput, emailInput, passwordInput]);
  }

  if (userName.length < 4) {
    return displayError("El nombre de usuario debe tener minimo 4 caracteres.", [usernameInput])
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    return displayError("Formato de email invalido.", [emailInput])
  }

  if (userPhoneNumber && !parseInt(userPhoneNumber)) {
    return displayError("El campo telefono solo puede contener numeros.", [telephoneInput]);
  }

  if (userPassword.length <= 4) {
    return displayError("La contraseña debe tener mas 4 caracteres.", [passwordInput])
  }

  if (userPassword !== repeatPassword) {
    return displayError("Las contraseñas no coinciden.", [passwordInput, repeatPasswordInput])
  }

  const userData = {
    userName,
    userEmail,
    userPassword,
    userPhoneNumber,
    userAvatarUrl,
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
    if (!res.ok) return displayError(response.error);

    const token = response.token;
    const user = response.publicUserData;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    registerForm.reset();
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
}

const handleLogin = async (e) => {
  e.preventDefault();

  const emailInput = loginForm.querySelector("#email-login");
  const passwordInput = loginForm.querySelector("#password-login");
  const msgError = loginForm.querySelector("#message-error");
  const submitBtn = loginForm.querySelector("input[type='submit']")

  const userEmail = emailInput.value.trim();
  const userPassword = passwordInput.value;

  const displayError = (message) => {
    msgError.textContent = message;
    submitBtn.setAttribute("disabled", true);

    setTimeout(() => {
      submitBtn.removeAttribute("disabled");
      msgError.textContent = "";
    }, 3000);
  };

  if (!userEmail || !userPassword) {
    return displayError("Se deben rellenar todos los campos.")
  }

  if (userPassword.length <= 4) {
    return displayError("La contraseña debe tener minimo 4 caracteres.")
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail)) {
    return displayError("Formato de email invalido.")
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
    if (!res.ok) return displayError(response.error);

    const token = response.token;
    const user = response.publicUserData;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    if (user.userStatus.userStatusName !== "activo") {
      return displayError("Usuario suspendido!!")
    }

    const route = user.userRole.userRoleName === "admin"
      ? "/src/pages/admin/admin.html"
      : "/index";

    msgError.classList.add("login-successfully")
    msgError.textContent = "Inicio de sesion realizado con exito!!";

    loginForm.reset();
    submitBtn.setAttribute("disabled", true);

    setTimeout(() => {
      location.href = route;
    }, 2000);
  } catch (err) {
    console.error("Error de red:", err);
    msgError.textContent = "Error en la conexion. Intentalo mas tarde.";
  }
}

pictureProfileInput.addEventListener("change", handleProfileImage)
registerForm.addEventListener("submit", handleRegister);
loginForm.addEventListener("submit", handleLogin);

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