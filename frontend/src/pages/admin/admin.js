// --- NAVEGACIÓN ENTRE TABS ---
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function (e) {
    e.preventDefault();
    switchToTab(this.getAttribute('data-tab'));
  });
});

function switchToTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
    content.classList.add('hidden');
  });

  const tabContent = document.getElementById(tabId);
  tabContent.classList.remove('hidden');
  tabContent.classList.add('active');

  const pageTitle = document.getElementById('pageTitle');
  const tabTitles = { 'welcome': 'Inicio', 'games': 'Juegos', 'users': 'Usuarios' };
  pageTitle.textContent = tabTitles[tabId];
}

// ================= Productos (Juegos) =================
const openProductModalBtn = document.querySelector('#openProductModal');
const productModal = document.getElementById('newProductModal');
const closeProductModal = document.getElementById('closeProductModal');
const cancelProductModal = document.getElementById('cancelProductModal');
const productForm = document.getElementById('newProductForm');
const tablaBody = document.getElementById('tablaBody');
const fileInput = document.getElementById('file');
const preview = document.getElementById('preview');

let imagenSeleccionada = "";
let filaEditando = null;
let filaAEliminar = null;

productModal.style.display = "none";

openProductModalBtn.addEventListener('click', () => {
  filaEditando = null;
  productForm.reset();
  imagenSeleccionada = "";
  preview.innerHTML = "";
  productModal.showModal();
  productModal.style.display = "flex";
});

function closeModal() {
  productModal.close();
  productModal.style.display = "none";
}
closeProductModal.addEventListener('click', closeModal);
cancelProductModal.addEventListener('click', closeModal);

productModal.addEventListener('click', (e) => {
  const rect = productModal.getBoundingClientRect();
  if (
    e.clientX < rect.left || e.clientX > rect.right ||
    e.clientY < rect.top || e.clientY > rect.bottom
  ) closeModal();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      imagenSeleccionada = event.target.result;
      preview.innerHTML = `
        <img src="${imagenSeleccionada}" alt="preview"
             class="w-32 h-32 object-cover rounded-lg border border-gray-600">
      `;
    };
    reader.readAsDataURL(file);
  } else {
    imagenSeleccionada = "";
    preview.innerHTML = "";
  }
});

productForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(productForm).entries());
  data.producto_activo = !!data.producto_activo;

  if (filaEditando) {
    filaEditando.dataset.producto = JSON.stringify(data);

    filaEditando.querySelector('td:nth-child(2)').textContent = data.producto_nombre;
    filaEditando.querySelector('td:nth-child(3)').textContent = data.producto_tipo;
    filaEditando.querySelector('td:nth-child(4)').textContent = `$${Number(data.producto_precio).toLocaleString()}`;
    filaEditando.querySelector('td:nth-child(5)').textContent = `${data.producto_tamano_mb || 0} MB`;

    const estado = filaEditando.querySelector('td:nth-child(6) span');
    estado.textContent = data.producto_activo ? 'Activo' : 'Inactivo';
    estado.className = data.producto_activo
      ? 'bg-green-500/20 text-green-500 text-xs font-medium px-2 py-1 rounded-full'
      : 'bg-red-500/20 text-red-500 text-xs font-medium px-2 py-1 rounded-full';

    if (imagenSeleccionada) {
      filaEditando.querySelector('td:nth-child(1)').innerHTML =
        `<img src="${imagenSeleccionada}" class="w-10 h-10 rounded-lg object-cover">`;
    }
    filaEditando = null;
  } else {
    const row = document.createElement('tr');
    row.className = "hover:bg-dark-black/50";
    row.dataset.producto = JSON.stringify(data);

    row.innerHTML = `
      <td class="row">
        ${imagenSeleccionada
          ? `<img src="${imagenSeleccionada}" class="w-10 h-10 rounded-lg object-cover">`
          : `<div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-400">Sin img</div>`}
      </td>
      <td class="row font-medium">${data.producto_nombre}</td>
      <td class="row">${data.producto_tipo}</td>
      <td class="row font-semibold">$${Number(data.producto_precio).toLocaleString()}</td>
      <td class="row">${data.producto_tamano_mb || 0} MB</td>
      <td class="row">
        <span class="${data.producto_activo ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'} text-xs font-medium px-2 py-1 rounded-full">
          ${data.producto_activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td class="row">
        <div class="flex space-x-2">
          <button class="bg-cyan-400 actions hover:bg-cyan-400/50 p-2 rounded editar-btn">
            <img src="/src/assets/edit.svg" alt="editar" class="w-4">
          </button>
          <button class="bg-red-400 actions hover:bg-red-400/50 p-2 rounded eliminar-btn">
            <img src="/src/assets/trash.svg" alt="eliminar" class="invert w-4">
          </button>
        </div>
      </td>
    `;
    tablaBody.appendChild(row);
  }

  productForm.reset();
  imagenSeleccionada = "";
  preview.innerHTML = "";
  closeModal();
});

const deleteModal = document.getElementById('confirmDelete_Modal');
const confirmDeleteBtn = document.getElementById('confirmDelete_Btn');
const cancelDeleteBtn = document.getElementById('cancelDelete_Btn');
const closeDeleteModalBtn = document.getElementById('closeDeleteModal');

function cerrarModalEliminar() {
  deleteModal.close();
}
cancelDeleteBtn.addEventListener('click', cerrarModalEliminar);
closeDeleteModalBtn.addEventListener('click', cerrarModalEliminar);

confirmDeleteBtn.addEventListener('click', () => {
  if (filaAEliminar) filaAEliminar.remove();
  filaAEliminar = null;
  cerrarModalEliminar();
});

tablaBody.addEventListener('click', (e) => {
  const btnEditar = e.target.closest('.editar-btn');
  const btnEliminar = e.target.closest('.eliminar-btn');

  if (btnEditar) {
    filaEditando = btnEditar.closest('tr');
    const data = JSON.parse(filaEditando.dataset.producto);

    Object.entries(data).forEach(([key, val]) => {
    const input = productForm[key];
    if (input && input.type !== "file") {
      input.value = val;
    }
  });
  productForm.producto_activo.checked = data.producto_activo;

    imagenSeleccionada = filaEditando.querySelector('img')?.src || "";
    preview.innerHTML = imagenSeleccionada
      ? `<img src="${imagenSeleccionada}" class="w-32 h-32 object-cover rounded-lg border border-gray-600">`
      : "";

    productModal.showModal();
    productModal.style.display = "flex";
  }

  if (btnEliminar) {
    filaAEliminar = btnEliminar.closest('tr');
    deleteModal.showModal();
  }
});

// ================= USERS (USUARIOS) - SOLO UI =================
const openUserModalBtn = document.getElementById('openUserModal');
const userModal = document.getElementById('newUserModal');
const closeUserModal = document.getElementById('closeUserModal');
const cancelUserModal = document.getElementById('cancelUserModal');
const userForm = document.getElementById('newUserForm');
const avatarFile = document.getElementById('avatarFile');
const avatarPreview = document.getElementById('avatarPreview');

let avatarSeleccionado = "";

if (userModal) userModal.style.display = "none";

// Solo manejar la apertura del modal y UI básica
if (openUserModalBtn) {
  openUserModalBtn.addEventListener('click', () => {
    if (userForm) userForm.reset();
    avatarSeleccionado = "";
    if (avatarPreview) avatarPreview.innerHTML = "";
    if (userModal) {
      userModal.showModal();
      userModal.style.display = "flex";
    }
  });
}

function closeUserForm() {
  if (userModal) {
    userModal.close();
    userModal.style.display = "none";
  }
}

if (closeUserModal) closeUserModal.addEventListener('click', closeUserForm);
if (cancelUserModal) cancelUserModal.addEventListener('click', closeUserForm);

if (userModal) {
  userModal.addEventListener('click', (e) => {
    const rect = userModal.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)
      closeUserForm();
  });
}

if (avatarFile) {
  avatarFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        avatarSeleccionado = event.target.result;
        if (avatarPreview) avatarPreview.innerHTML = `<img src="${avatarSeleccionado}" class="w-24 h-24 rounded-full object-cover border border-gray-600">`;
      };
      reader.readAsDataURL(file);
    } else {
      avatarSeleccionado = "";
      if (avatarPreview) avatarPreview.innerHTML = "";
    }
  });
}

// ELIMINAR completamente el event listener del submit del formulario
// y toda la lógica de la tabla de usuarios del admin.js
// Eso lo manejará admin.user.js

// Solo mantener el modal de confirmación de eliminación (pero vacío)
const deleteModalUserElem = document.getElementById('confirmDelete_ModalUser');
const cancelDeleteBtnUser = document.getElementById('cancelDelete_BtnUser');
const closeDeleteModalUserBtn = document.getElementById('closeDeleteModalUser');

if (cancelDeleteBtnUser) {
  cancelDeleteBtnUser.addEventListener('click', () => {
    if (deleteModalUserElem) deleteModalUserElem.close();
  });
}
if (closeDeleteModalUserBtn) {
  closeDeleteModalUserBtn.addEventListener('click', () => {
    if (deleteModalUserElem) deleteModalUserElem.close();
  });
}