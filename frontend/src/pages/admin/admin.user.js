const API_BASE_URL = 'http://localhost:3000';

let userToDeleteId = null;
let userToEditId = null;

document.addEventListener('DOMContentLoaded', function() {
    inicializarGestionUsuarios();
});

function inicializarGestionUsuarios() {
    cargarUsuarios();
    
    const newUserForm = document.getElementById('newUserForm');
    if (newUserForm) {
        newUserForm.addEventListener('submit', manejarCrearUsuario);
    }
    
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', manejarEditarUsuario);
    }
    
    configurarModales();
    
    const confirmDeleteBtnUser = document.getElementById('confirmDelete_BtnUser');
    if (confirmDeleteBtnUser) {
        confirmDeleteBtnUser.addEventListener('click', eliminarUsuarioConfirmado);
    }
}

function configurarModales() {
    const openUserModalBtn = document.getElementById('openUserModal');
    const closeUserModal = document.getElementById('closeUserModal');
    const cancelUserModal = document.getElementById('cancelUserModal');
    const newUserModal = document.getElementById('newUserModal');

    if (openUserModalBtn && newUserModal) {
        openUserModalBtn.addEventListener('click', () => {
            newUserModal.showModal();
            newUserModal.style.display = "flex";
        });
    }

    if (closeUserModal && newUserModal) {
        closeUserModal.addEventListener('click', () => cerrarModal(newUserModal));
    }

    if (cancelUserModal && newUserModal) {
        cancelUserModal.addEventListener('click', () => cerrarModal(newUserModal));
    }

    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEditModal = document.getElementById('cancelEditModal');
    const editUserModal = document.getElementById('editUserModal');

    if (closeEditModal && editUserModal) {
        closeEditModal.addEventListener('click', () => cerrarModal(editUserModal));
    }

    if (cancelEditModal && editUserModal) {
        cancelEditModal.addEventListener('click', () => cerrarModal(editUserModal));
    }

    if (newUserModal) {
        newUserModal.addEventListener('click', (e) => manejarClicFueraModal(e, newUserModal));
    }
    if (editUserModal) {
        editUserModal.addEventListener('click', (e) => manejarClicFueraModal(e, editUserModal));
    }
}

function manejarClicFueraModal(e, modal) {
    const rect = modal.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        cerrarModal(modal);
    }
}

function cerrarModal(modal) {
    if (modal) {
        modal.close();
        modal.style.display = "none";
    }
}

// ========== CREAR USUARIO ==========
async function manejarCrearUsuario(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;
    const userPassword = document.getElementById('userPassword').value;
    const userPhoneNumber = document.getElementById('userPhoneNumber').value;
    const userRoleId = document.getElementById('userRoleId').value;
    const userStatusId = document.getElementById('userStatusId').value;
    
    if (!userName.trim()) {
        mostrarError('El nombre es obligatorio');
        return;
    }
    
    if (!userEmail.trim()) {
        mostrarError('El email es obligatorio');
        return;
    }
    
    if (!userPassword.trim()) {
        mostrarError('La contraseña es obligatoria');
        return;
    }
    
    try {
        // OBTENER EL AVATAR SELECCIONADO DEL admin.js
        const avatarPreview = document.getElementById('avatarPreview');
        let avatarBase64 = null;
        
        if (avatarPreview && avatarPreview.querySelector('img')) {
            avatarBase64 = avatarPreview.querySelector('img').src;
            console.log('Avatar encontrado:', avatarBase64.substring(0, 100)); // Debug
        }
        
        const userData = {
            userName: userName.trim(),
            userEmail: userEmail.trim(),
            userPassword: userPassword,
            userRoleId: parseInt(userRoleId),
            userStatusId: parseInt(userStatusId),
            userAvatarUrl: avatarBase64  // ← ENVIAR EL AVATAR A LA API
        };
        
        if (userPhoneNumber.trim()) {
            userData.userPhoneNumber = userPhoneNumber.trim();
        }
        
        console.log('Enviando usuario con avatar:', userData.userAvatarUrl ? 'Sí' : 'No'); // Debug
        
        await crearUsuario(userData);
        mostrarExito('Usuario creado correctamente');
        
        // Limpiar el formulario y avatar
        document.getElementById('newUserForm').reset();
        if (avatarPreview) avatarPreview.innerHTML = '';
        
        cerrarModal(document.getElementById('newUserModal'));
        await cargarUsuarios();
        
    } catch (error) {
        mostrarError('Error al crear el usuario: ' + error.message);
    }
}

// ========== EDITAR USUARIO ==========
async function manejarEditarUsuario(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const userName = document.getElementById('editUserName').value;
    const userEmail = document.getElementById('editUserEmail').value;
    const userPassword = document.getElementById('editUserPassword').value;
    const userPhoneNumber = document.getElementById('editUserPhoneNumber').value;
    const userRoleId = document.getElementById('editUserRoleId').value;
    const userStatusId = document.getElementById('editUserStatusId').value;
    
    const userData = {};
    
    if (userName.trim()) userData.userName = userName.trim();
    if (userEmail.trim()) userData.userEmail = userEmail.trim();
    if (userPassword.trim()) userData.userPassword = userPassword;
    if (userPhoneNumber.trim()) userData.userPhoneNumber = userPhoneNumber.trim();
    if (userRoleId) userData.userRoleId = parseInt(userRoleId);
    if (userStatusId) userData.userStatusId = parseInt(userStatusId);
    
    // OBTENER AVATAR DE EDICIÓN SI EXISTE
    const editAvatarPreview = document.getElementById('editAvatarPreview');
    if (editAvatarPreview && editAvatarPreview.querySelector('img')) {
        userData.userAvatarUrl = editAvatarPreview.querySelector('img').src;
        console.log('Avatar de edición encontrado'); // Debug
    }
    
    if (Object.keys(userData).length === 0) {
        mostrarError('No se detectaron cambios. Modifica al menos un campo para actualizar el usuario.');
        return;
    }
    
    try {
        await actualizarUsuario(userToEditId, userData);
        mostrarExito('✅ Usuario actualizado correctamente');
        
        limpiarModalEdicion();
        
        cerrarModal(document.getElementById('editUserModal'));
        await cargarUsuarios();
        
    } catch (error) {
        mostrarError('Error al actualizar el usuario: ' + error.message);
    }
}

function limpiarModalEdicion() {
    document.getElementById('editUserName').value = '';
    document.getElementById('editUserName').placeholder = '';
    
    document.getElementById('editUserEmail').value = '';
    document.getElementById('editUserEmail').placeholder = '';
    
    document.getElementById('editUserPassword').value = '';
    document.getElementById('editUserPassword').placeholder = 'Nueva contraseña (opcional)';
    
    document.getElementById('editUserPhoneNumber').value = '';
    document.getElementById('editUserPhoneNumber').placeholder = '';
    
    document.getElementById('editUserRoleId').value = '';
    document.getElementById('editUserStatusId').value = '';
    
    const editAvatarPreview = document.getElementById('editAvatarPreview');
    if (editAvatarPreview) {
        editAvatarPreview.innerHTML = '';
    }
}

// ========== FUNCIONES BACKEND ==========
async function crearUsuario(userData) {
    const response = await fetch(`${API_BASE_URL}/user/admin-create`, {  // ← Nuevo endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear usuario');
    }
    
    return await response.json();
}

window.editarUsuario = async function(userId) {
    userToEditId = userId;
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/${userId}`);
        
        if (!response.ok) {
            throw new Error('Usuario no encontrado');
        }
        
        const usuario = await response.json();
        
        document.getElementById('editUserName').value = '';
        document.getElementById('editUserName').placeholder = usuario.userName || 'Nombre actual';
        
        document.getElementById('editUserEmail').value = '';
        document.getElementById('editUserEmail').placeholder = usuario.userEmail || 'Email actual';
        
        document.getElementById('editUserPassword').value = '';
        document.getElementById('editUserPassword').placeholder = 'Nueva contraseña (opcional)';
        
        document.getElementById('editUserPhoneNumber').value = '';
        document.getElementById('editUserPhoneNumber').placeholder = usuario.userPhoneNumber || 'Teléfono actual';

        document.getElementById('editUserRoleId').value = '';
        document.getElementById('editUserStatusId').value = '';
        
        // MOSTRAR AVATAR ACTUAL EN EL MODAL DE EDICIÓN
        const editAvatarPreview = document.getElementById('editAvatarPreview');
        if (editAvatarPreview) {
            if (usuario.userAvatarUrl) {
                editAvatarPreview.innerHTML = `
                    <img src="${usuario.userAvatarUrl}" class="w-24 h-24 rounded-full object-cover border border-gray-600">
                    <p class="text-xs text-gray-400 mt-2">Avatar actual</p>
                `;
            } else {
                editAvatarPreview.innerHTML = `
                    <div class="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
                        Sin avatar
                    </div>
                `;
            }
        }
        
        const editUserModal = document.getElementById('editUserModal');
        if (editUserModal) {
            editUserModal.showModal();
            editUserModal.style.display = "flex";
        }
        
    } catch (error) {
        mostrarError('Error al cargar datos del usuario');
    }
}

async function actualizarUsuario(userId, userData) {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar usuario');
    }
    
    return await response.json();
}

// ========== CARGAR Y MOSTRAR USUARIOS ==========
async function cargarUsuarios() {
    try {
        const response = await fetch(`${API_BASE_URL}/user`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const usuarios = await response.json();
        
        const usuariosOrdenados = ordenarUsuariosPorId(usuarios);
        
        actualizarTablaUsuarios(usuariosOrdenados);
        actualizarContadorUsuarios(usuariosOrdenados.length);
        
    } catch (error) {
        mostrarError('Error al cargar los usuarios');
    }
}

function ordenarUsuariosPorId(usuarios) {
    return usuarios.sort((a, b) => a.userId - b.userId);
}

function actualizarTablaUsuarios(usuarios) {
    const tablaUsuariosBody = document.getElementById('tablaUsuariosBody');
    if (!tablaUsuariosBody) {
        return;
    }
    
    tablaUsuariosBody.innerHTML = '';
    
    if (!usuarios || usuarios.length === 0) {
        tablaUsuariosBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-4 text-center text-gray-400">
                    No hay usuarios registrados
                </td>
            </tr>
        `;
        return;
    }
    
    usuarios.forEach(usuario => {
        const fila = crearFilaUsuario(usuario);
        tablaUsuariosBody.appendChild(fila);
    });
}

function crearFilaUsuario(usuario) {
    const fila = document.createElement('tr');
    fila.className = 'hover:bg-dark-black/50';
    
    const estadoClase = usuario.userStatusId === 1 ? 
        'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500';
    const estadoTexto = usuario.userStatusId === 1 ? 'Activo' : 'Inactivo';
    
    const rolTexto = usuario.userRoleId === 2 ? 'Administrador' : 'Usuario';
    
    fila.innerHTML = `
        <td class="row">
            ${usuario.userAvatarUrl ? 
                `<img src="${usuario.userAvatarUrl}" class="w-10 h-10 rounded-full object-cover">` : 
                `<div class="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-xs text-gray-400">${usuario.userName.charAt(0).toUpperCase()}</div>`
            }
        </td>
        <td class="row font-medium">${usuario.userName}</td>
        <td class="row">${usuario.userEmail}</td>
        <td class="row">${rolTexto}</td>
        <td class="row">${usuario.userPhoneNumber || '-'}</td>
        <td class="row">
            <span class="${estadoClase} text-xs font-medium px-2 py-1 rounded-full">
                ${estadoTexto}
            </span>
        </td>
        <td class="row">
            <div class="flex space-x-2">
                <button class="bg-cyan-400 actions hover:bg-cyan-400/50 p-2 rounded" onclick="editarUsuario(${usuario.userId})">
                    <img src="/src/assets/edit.svg" alt="editar" class="w-4">
                </button>
                <button class="bg-red-400 actions hover:bg-red-400/50 p-2 rounded" onclick="solicitarEliminarUsuario(${usuario.userId})">
                    <img src="/src/assets/trash.svg" alt="eliminar" class="invert w-4">
                </button>
            </div>
        </td>
    `;
    
    return fila;
}

// ========== FUNCIONES GLOBALES ==========
window.editarUsuario = async function(userId) {
    userToEditId = userId;
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/${userId}`);
        
        if (!response.ok) {
            throw new Error('Usuario no encontrado');
        }
        
        const usuario = await response.json();
        
        document.getElementById('editUserName').value = '';
        document.getElementById('editUserName').placeholder = usuario.userName || 'Nombre actual';
        
        document.getElementById('editUserEmail').value = '';
        document.getElementById('editUserEmail').placeholder = usuario.userEmail || 'Email actual';
        
        document.getElementById('editUserPassword').value = '';
        document.getElementById('editUserPassword').placeholder = 'Nueva contraseña (opcional)';
        
        document.getElementById('editUserPhoneNumber').value = '';
        document.getElementById('editUserPhoneNumber').placeholder = usuario.userPhoneNumber || 'Teléfono actual';

        document.getElementById('editUserRoleId').value = '';
        document.getElementById('editUserStatusId').value = '';
        
        const editUserModal = document.getElementById('editUserModal');
        if (editUserModal) {
            editUserModal.showModal();
            editUserModal.style.display = "flex";
        }
        
    } catch (error) {
        mostrarError('Error al cargar datos del usuario');
    }
}

window.solicitarEliminarUsuario = function(userId) {
    userToDeleteId = userId;
    const deleteModalUser = document.getElementById('confirmDelete_ModalUser');
    if (deleteModalUser) {
        deleteModalUser.showModal();
    }
}

async function eliminarUsuarioConfirmado() {
    if (!userToDeleteId) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/user/${userToDeleteId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar usuario');
        }
        
        document.getElementById('confirmDelete_ModalUser').close();
        await cargarUsuarios();
        mostrarExito('✅ Usuario eliminado correctamente');
        
    } catch (error) {
        mostrarError('Error al eliminar usuario');
    }
}

function actualizarContadorUsuarios(cantidad) {
    const contadores = document.querySelectorAll('.text-3xl.font-bold');
    contadores.forEach(contador => {
        if (contador.textContent === '-' && contador.parentElement.querySelector('.text-gray-400')?.textContent.includes('Usuarios')) {
            contador.textContent = cantidad;
        }
    });
}

function mostrarExito(mensaje) {
    alert(mensaje);
}

function mostrarError(mensaje) {
    alert(mensaje);
}