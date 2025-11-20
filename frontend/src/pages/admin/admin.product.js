const API_BASE_URL2 = 'http://localhost:3000/product';

const tablaBody = document.getElementById('tablaBody');
const productForm = document.getElementById('newProductForm');
const editProductForm = document.getElementById('editProductForm');
const productModal2 = document.getElementById('newProductModal');
const editProductModal = document.getElementById('editProductModal');
const searchInput = document.querySelector('input[placeholder="Buscar juegos..."]');
const openProductModalBtn = document.querySelector('#openProductModal');

let imagenPrincipalBase64 = null;
let imagenCatalogoBase64 = null;
let editImagenPrincipalBase64 = null;
let editImagenCatalogoBase64 = null;

let productos = [];
let productoEditando = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    configurarEventosProductos();
});

function configurarEventosProductos() {
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filtrarProductos(e.target.value);
        });
    }

    if (openProductModalBtn) {
        openProductModalBtn.addEventListener('click', abrirModalNuevoProducto);
    }

    configurarPreviewImagenes();

    if (productForm) {
        productForm.addEventListener('submit', manejarEnvioFormularioNuevo);
    }
    
    if (editProductForm) {
        editProductForm.addEventListener('submit', manejarEnvioFormularioEdicion);
    }

    configurarCierreModales();
}

async function cargarOpcionesDisponibles() {
    try {
        const opciones = {
            tags: [
                { id: 1, name: 'Educativo' },
                { id: 2, name: 'Puzzle' },
                { id: 3, name: 'Misterio' },
                { id: 4, name: 'Aventura' },
                { id: 5, name: 'Estrategia' }
            ],
            languages: [
                { id: 1, name: 'Español' },
                { id: 2, name: 'Inglés' }
            ],
            platforms: [
                { id: 1, name: 'PC' },
                { id: 2, name: 'PlayStation 5' },
                { id: 3, name: 'Nintendo Switch' },
                { id: 4, name: 'Xbox One' },
                { id: 5, name: 'Mobile' }
            ]
        };
        return opciones;
    } catch (error) {
        return { tags: [], languages: [], platforms: [] };
    }
}

function configurarCierreModales() {
    const closeEditProductModal = document.getElementById('closeEditProductModal');
    const cancelEditProductModal = document.getElementById('cancelEditProductModal');

    if (closeEditProductModal) {
        closeEditProductModal.addEventListener('click', () => cerrarModalEdicion());
    }
    if (cancelEditProductModal) {
        cancelEditProductModal.addEventListener('click', () => cerrarModalEdicion());
    }

    if (editProductModal) {
        editProductModal.addEventListener('click', (e) => {
            const rect = editProductModal.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
                cerrarModalEdicion();
            }
        });
    }
}

function configurarPreviewImagenes() {
    const filePrincipal = document.getElementById('file_principal');
    const previewPrincipal = document.getElementById('preview_principal');
    const fileCatalogo = document.getElementById('file_catalogo');
    const previewCatalogo = document.getElementById('preview_catalogo');

    if (filePrincipal && previewPrincipal) {
        filePrincipal.addEventListener('change', (e) => {
            manejarPreviewImagen(e, previewPrincipal, 'principal');
        });
    }

    if (fileCatalogo && previewCatalogo) {
        fileCatalogo.addEventListener('change', (e) => {
            manejarPreviewImagen(e, previewCatalogo, 'catalogo');
        });
    }

    const editFilePrincipal = document.getElementById('edit_file_principal');
    const editPreviewPrincipal = document.getElementById('edit_preview_principal');
    const editFileCatalogo = document.getElementById('edit_file_catalogo');
    const editPreviewCatalogo = document.getElementById('edit_preview_catalogo');

    if (editFilePrincipal && editPreviewPrincipal) {
        editFilePrincipal.addEventListener('change', (e) => {
            manejarPreviewImagen(e, editPreviewPrincipal, 'edit_principal');
        });
    }

    if (editFileCatalogo && editPreviewCatalogo) {
        editFileCatalogo.addEventListener('change', (e) => {
            manejarPreviewImagen(e, editPreviewCatalogo, 'edit_catalogo');
        });
    }
}

function comprimirImagen(file, maxWidth = 800, calidad = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const base64 = canvas.toDataURL('image/jpeg', calidad);
                resolve(base64);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function manejarPreviewImagen(event, previewElement, tipo) {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        mostrarNotificacion('Formato de imagen no válido. Usa JPG, PNG o GIF.', 'error');
        event.target.value = '';
        return;
    }

    previewElement.innerHTML = `
        <div class="text-center text-gray-400">
            <p>Comprimiendo imagen...</p>
        </div>
    `;

    comprimirImagen(file)
        .then(base64String => {
            switch(tipo) {
                case 'principal':
                    imagenPrincipalBase64 = base64String;
                    break;
                case 'catalogo':
                    imagenCatalogoBase64 = base64String;
                    break;
                case 'edit_principal':
                    editImagenPrincipalBase64 = base64String;
                    break;
                case 'edit_catalogo':
                    editImagenCatalogoBase64 = base64String;
                    break;
            }

            previewElement.innerHTML = `
                <div class="text-center">
                    <img src="${base64String}" alt="Preview" 
                         class="w-32 h-32 object-cover rounded-lg border border-gray-600 mx-auto">
                    <p class="text-xs text-green-400 mt-2">✓ Imagen comprimida y cargada</p>
                    <p class="text-xs text-gray-400">Tamaño: ${Math.round(base64String.length / 1024)} KB</p>
                </div>
            `;
        })
        .catch(error => {
            mostrarNotificacion('Error al procesar la imagen', 'error');
            event.target.value = '';
            previewElement.innerHTML = '';
        });
}

async function cargarProductos() {
    try {
        const response = await fetch(API_BASE_URL2);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        productos = await response.json();
        renderizarProductos(productos);
        actualizarContadorProductos();
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarNotificacion('Error al cargar los productos', 'error');
    }
}

function renderizarProductos(productosArray) {
    if (!tablaBody) return;

    tablaBody.innerHTML = '';

    if (productosArray.length === 0) {
        tablaBody.innerHTML = `
            <tr>
                <td colspan="7" class="row text-center text-gray-400 py-8">
                    No se encontraron productos
                </td>
            </tr>
        `;
        return;
    }

    productosArray.forEach(producto => {
        const row = document.createElement('tr');
        row.className = "hover:bg-dark-black/50";
        row.dataset.productId = producto.productId;

        row.innerHTML = `
            <td class="row">
                <img src="${producto.productCoverImageUrl || '/src/assets/game.avif'}" 
                     alt="${producto.productName}"
                     class="w-10 h-10 rounded-lg object-cover">
            </td>
            <td class="row font-medium">${producto.productName}</td>
            <td class="row">${producto.productType || 'digital'}</td>
            <td class="row font-semibold">$${Number(producto.productPrice).toLocaleString()}</td>
            <td class="row">${producto.productSize} MB</td>
            <td class="row">
                <span class="${producto.productIsActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'} text-xs font-medium px-2 py-1 rounded-full">
                    ${producto.productIsActive ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td class="row">
                <div class="flex space-x-2">
                    <button class="bg-cyan-400 actions hover:bg-cyan-400/50 p-2 rounded editar-btn" 
                            onclick="editarProducto(${producto.productId})">
                        <img src="/src/assets/edit.svg" alt="editar" class="w-4">
                    </button>
                    <button class="bg-red-400 actions hover:bg-red-400/50 p-2 rounded eliminar-btn"
                            onclick="confirmarEliminarProducto(${producto.productId})">
                        <img src="/src/assets/trash.svg" alt="eliminar" class="invert w-4">
                    </button>
                </div>
            </td>
        `;
        tablaBody.appendChild(row);
    });
}

function filtrarProductos(termino) {
    const productosFiltrados = productos.filter(producto =>
        producto.productName.toLowerCase().includes(termino.toLowerCase()) ||
        producto.productDeveloper.toLowerCase().includes(termino.toLowerCase())
    );
    renderizarProductos(productosFiltrados);
}

function abrirModalNuevoProducto() {
    productoEditando = null;
    if (productForm) productForm.reset();
    limpiarPreviews();
    resetearImagenesBase64();
    
    if (productModal2) {
        productModal2.showModal();
    }
}

window.editarProducto = async function(productId) {
    try {
        const response = await fetch(`${API_BASE_URL2}/${productId}`);
        
        if (!response.ok) {
            throw new Error('Producto no encontrado');
        }
        
        productoEditando = await response.json();
        llenarFormularioEdicionConPlaceholders(productoEditando);
        
        if (editProductModal) {
            editProductModal.showModal();
        }
    } catch (error) {
        console.error('Error cargando producto para editar:', error);
        mostrarNotificacion('Error al cargar el producto', 'error');
    }
}

function llenarFormularioEdicionConPlaceholders(producto) {
    if (!editProductForm) return;

    // Limpiar todos los campos y establecer placeholders
    editProductForm.edit_producto_nombre.value = '';
    editProductForm.edit_producto_nombre.placeholder = producto.productName || 'Nombre del producto';
    
    editProductForm.edit_producto_resumen.value = '';
    editProductForm.edit_producto_resumen.placeholder = producto.productShortDesc || 'Descripción corta';
    
    editProductForm.edit_producto_descripcion.value = '';
    editProductForm.edit_producto_descripcion.placeholder = producto.productLongDesc || 'Descripción larga';
    
    editProductForm.edit_producto_tipo.value = '';
    editProductForm.edit_producto_formato.value = '';
    editProductForm.edit_producto_formato.placeholder = producto.productFormat || 'Formato del producto';
    
    editProductForm.edit_producto_tamano_gb.value = '';
    editProductForm.edit_producto_tamano_gb.placeholder = (producto.productSize) || 'Tamaño en MB';
    
    editProductForm.edit_producto_url_descarga.value = '';
    editProductForm.edit_producto_url_descarga.placeholder = producto.productDownloadUrl || 'URL de descarga';
    
    editProductForm.edit_producto_desarrollador.value = '';
    editProductForm.edit_producto_desarrollador.placeholder = producto.productDeveloper || 'Desarrollador';
    
    editProductForm.edit_producto_descuento.value = '';
    editProductForm.edit_producto_descuento.placeholder = producto.productDiscount || 'Descuento %';
    
    editProductForm.edit_producto_precio.value = '';
    editProductForm.edit_producto_precio.placeholder = producto.productPrice || 'Precio';
    
    editProductForm.edit_producto_activo.checked = false;
    
    editProductForm.edit_producto_fecha_lanzamiento.value = '';

    const editTagSelect = editProductForm.querySelector('select[name="edit_tagIds"]');
    const editPlatformSelect = editProductForm.querySelector('select[name="edit_platformIds"]');
    const editLanguageSelect = editProductForm.querySelector('select[name="edit_languageIds"]');

    if (editTagSelect) Array.from(editTagSelect.options).forEach(opt => opt.selected = false);
    if (editPlatformSelect) Array.from(editPlatformSelect.options).forEach(opt => opt.selected = false);
    if (editLanguageSelect) Array.from(editLanguageSelect.options).forEach(opt => opt.selected = false);

    if (editTagSelect && producto.tags) {
        producto.tags.forEach(tag => {
            const option = editTagSelect.querySelector(`option[value="${tag.tagId}"]`);
            if (option) option.selected = true;
        });
    }

    // Preseleccionar plataformas
    if (editPlatformSelect && producto.platforms) {
        producto.platforms.forEach(platform => {
            const option = editPlatformSelect.querySelector(`option[value="${platform.platformId}"]`);
            if (option) option.selected = true;
        });
    }

    // Preseleccionar idiomas
    if (editLanguageSelect && producto.languages) {
        producto.languages.forEach(language => {
            const option = editLanguageSelect.querySelector(`option[value="${language.languageId}"]`);
            if (option) option.selected = true;
        });
    }

    const editPreviewPrincipal = document.getElementById('edit_preview_principal');
    const editPreviewCatalogo = document.getElementById('edit_preview_catalogo');
    
    if (editPreviewPrincipal) {
        if (producto.productCoverImageUrl) {
            editPreviewPrincipal.innerHTML = `
                <div class="text-center">
                    <img src="${producto.productCoverImageUrl}" alt="Imagen principal actual" 
                         class="w-32 h-32 object-cover rounded-lg border border-gray-600 mx-auto">
                    <p class="text-xs text-gray-400 mt-2">Imagen principal actual</p>
                </div>
            `;
        } else {
            editPreviewPrincipal.innerHTML = `
                <div class="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 mx-auto">
                    Sin imagen
                </div>
            `;
        }
    }
    
    if (editPreviewCatalogo) {
        if (producto.productCatalogImageUrl) {
            editPreviewCatalogo.innerHTML = `
                <div class="text-center">
                    <img src="${producto.productCatalogImageUrl}" alt="Imagen catálogo actual" 
                         class="w-32 h-32 object-cover rounded-lg border border-gray-600 mx-auto">
                    <p class="text-xs text-gray-400 mt-2">Imagen catálogo actual</p>
                </div>
            `;
        } else {
            editPreviewCatalogo.innerHTML = `
                <div class="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 mx-auto">
                    Sin imagen
                </div>
            `;
        }
    }

    if (producto.productIsActive) {
        editProductForm.edit_producto_activo.checked = true;
    }

    editImagenPrincipalBase64 = null;
    editImagenCatalogoBase64 = null;
}

function resetearImagenesBase64() {
    imagenPrincipalBase64 = null;
    imagenCatalogoBase64 = null;
    editImagenPrincipalBase64 = null;
    editImagenCatalogoBase64 = null;
}

function limpiarPreviews() {
    const previewPrincipal = document.getElementById('preview_principal');
    const previewCatalogo = document.getElementById('preview_catalogo');
    const editPreviewPrincipal = document.getElementById('edit_preview_principal');
    const editPreviewCatalogo = document.getElementById('edit_preview_catalogo');
    
    if (previewPrincipal) previewPrincipal.innerHTML = '';
    if (previewCatalogo) previewCatalogo.innerHTML = '';
    if (editPreviewPrincipal) editPreviewPrincipal.innerHTML = '';
    if (editPreviewCatalogo) editPreviewCatalogo.innerHTML = '';
}

async function manejarEnvioFormularioNuevo(e) {
    e.preventDefault();
    
    const formData = new FormData(productForm);
    const productoData = prepararDatosProducto(formData, 'nuevo');
    
    try {
        await crearProducto(productoData);
        cerrarModalProducto();
        await cargarProductos();
    } catch (error) {
        console.error('Error creando producto:', error);
        mostrarNotificacion('Error al crear el producto: ' + error.message, 'error');
    }
}

async function manejarEnvioFormularioEdicion(e) {
    e.preventDefault();
    
    const formData = new FormData(editProductForm);
    const productoData = prepararDatosProductoEdicion(formData);
    
    if (Object.keys(productoData).length === 0) {
        mostrarNotificacion('No se detectaron cambios. Modifica al menos un campo para actualizar el producto.', 'error');
        return;
    }
    
    try {
        await actualizarProducto(productoEditando.productId, productoData);
        cerrarModalEdicion();
        await cargarProductos();
    } catch (error) {
        console.error('Error actualizando producto:', error);
        mostrarNotificacion('Error al actualizar el producto: ' + error.message, 'error');
    }
}

function prepararDatosProducto(formData, tipo) {
    const prefix = tipo === 'edicion' ? 'edit_' : '';
    
    const productoData = {
        productName: formData.get(`${prefix}producto_nombre`),
        productShortDesc: formData.get(`${prefix}producto_resumen`),
        productLongDesc: formData.get(`${prefix}producto_descripcion`),
        productType: formData.get(`${prefix}producto_tipo`) || 'digital',
        productFormat: formData.get(`${prefix}producto_formato`),
        productSize: formData.get(`${prefix}producto_tamano_gb`),
        productDownloadUrl: formData.get(`${prefix}producto_url_descarga`),
        productDeveloper: formData.get(`${prefix}producto_desarrollador`),
        productCoverImageUrl: tipo === 'edicion' ? (editImagenPrincipalBase64 || productoEditando?.productCoverImageUrl) : (imagenPrincipalBase64 || '/src/assets/incognita-portada-hor.jpeg'),
        productCatalogImageUrl: tipo === 'edicion' ? (editImagenCatalogoBase64 || productoEditando?.productCatalogImageUrl) : (imagenCatalogoBase64 || '/src/assets/incognita-logo-grande.png'),
        productDiscount: parseFloat(formData.get(`${prefix}producto_descuento`)) || 0,
        productPrice: parseInt(formData.get(`${prefix}producto_precio`)),
        productIsActive: formData.get(`${prefix}producto_activo`) === 'on',
        productReleasedDate: formData.get(`${prefix}producto_fecha_lanzamiento`) || null
    };

    // AGREGAR LAS RELACIONES TANTO PARA CREACIÓN COMO EDICIÓN
    const tagIds = obtenerValoresSelect(formData, `${prefix}tagIds`);
    const platformIds = obtenerValoresSelect(formData, `${prefix}platformIds`);
    const languageIds = obtenerValoresSelect(formData, `${prefix}languageIds`);
    
    // Solo enviar los arrays si tienen elementos
    if (tagIds.length > 0) productoData.tagIds = tagIds;
    if (platformIds.length > 0) productoData.platformIds = platformIds;
    if (languageIds.length > 0) productoData.languageIds = languageIds;

    // Validar campos requeridos
    const camposRequeridos = [
        'productName', 'productShortDesc', 'productLongDesc', 
        'productSize', 'productDeveloper', 'productCoverImageUrl', 
        'productCatalogImageUrl', 'productPrice', 'productIsActive'
    ];

    const camposFaltantes = camposRequeridos.filter(campo => !productoData[campo]);
    
    if (camposFaltantes.length > 0) {
        console.error('Campos requeridos faltantes:', camposFaltantes);
        throw new Error(`Faltan campos requeridos: ${camposFaltantes.join(', ')}`);
    }

    return productoData;
}

function obtenerValoresSelect(formData, fieldName) {
    const values = formData.getAll(fieldName);
    return values.filter(val => val !== '').map(val => parseInt(val));
}

function prepararDatosProductoEdicion(formData) {
    const productoData = {};
    
    // Solo agregar campos que tengan valores (no vacíos)
    const nombre = formData.get('edit_producto_nombre');
    if (nombre && nombre.trim() !== '') {
        productoData.productName = nombre.trim();
    }
    
    const resumen = formData.get('edit_producto_resumen');
    if (resumen && resumen.trim() !== '') {
        productoData.productShortDesc = resumen.trim();
    }
    
    const descripcion = formData.get('edit_producto_descripcion');
    if (descripcion && descripcion.trim() !== '') {
        productoData.productLongDesc = descripcion.trim();
    }
    
    const tipo = formData.get('edit_producto_tipo');
    if (tipo && tipo.trim() !== '') {
        productoData.productType = tipo;
    }
    
    const formato = formData.get('edit_producto_formato');
    if (formato && formato.trim() !== '') {
        productoData.productFormat = formato.trim();
    }
    
    const tamano = formData.get('edit_producto_tamano_gb');
    if (tamano && tamano.trim() !== '') {
        productoData.productSize = parseFloat(tamano);
    }
    
    const urlDescarga = formData.get('edit_producto_url_descarga');
    if (urlDescarga && urlDescarga.trim() !== '') {
        productoData.productDownloadUrl = urlDescarga.trim();
    }
    
    const desarrollador = formData.get('edit_producto_desarrollador');
    if (desarrollador && desarrollador.trim() !== '') {
        productoData.productDeveloper = desarrollador.trim();
    }
    
    const descuento = formData.get('edit_producto_descuento');
    if (descuento && descuento.trim() !== '') {
        productoData.productDiscount = parseFloat(descuento);
    }
    
    const precio = formData.get('edit_producto_precio');
    if (precio && precio.trim() !== '') {
        productoData.productPrice = parseInt(precio);
    }
    
    // Checkbox siempre se envía si está marcado
    if (formData.get('edit_producto_activo') === 'on') {
        productoData.productIsActive = true;
    } else {
        productoData.productIsActive = false;
    }
    
    const fechaLanzamiento = formData.get('edit_producto_fecha_lanzamiento');
    if (fechaLanzamiento && fechaLanzamiento.trim() !== '') {
        productoData.productReleasedDate = fechaLanzamiento;
    }
    
    // AGREGAR RELACIONES SI SE SELECCIONARON
    const tagIds = obtenerValoresSelect(formData, 'edit_tagIds');
    const platformIds = obtenerValoresSelect(formData, 'edit_platformIds');
    const languageIds = obtenerValoresSelect(formData, 'edit_languageIds');
    
    // Enviar los arrays incluso si están vacíos (para limpiar relaciones)
    productoData.tagIds = tagIds;
    productoData.platformIds = platformIds;
    productoData.languageIds = languageIds;
    
    // AGREGAR IMÁGENES BASE64 SI SE CARGARON NUEVAS, SINO MANTENER LAS ACTUALES
    if (editImagenPrincipalBase64) {
        productoData.productCoverImageUrl = editImagenPrincipalBase64;
    }
    
    if (editImagenCatalogoBase64) {
        productoData.productCatalogImageUrl = editImagenCatalogoBase64;
    }

    return productoData;
}

async function crearProducto(productoData) {
    try {
        
        if (productoData.productCoverImageUrl && productoData.productCoverImageUrl.length > 1000000) {
            console.warn('Imagen principal muy grande:', productoData.productCoverImageUrl.length, 'caracteres');
        }
        if (productoData.productCatalogImageUrl && productoData.productCatalogImageUrl.length > 1000000) {
            console.warn('Imagen catálogo muy grande:', productoData.productCatalogImageUrl.length, 'caracteres');
        }

        const response = await fetch(API_BASE_URL2, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productoData)
        });

        const responseText = await response.text();

        if (!response.ok) {
            let errorMessage = 'Error creando producto';
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || errorMessage;
            } catch {
                errorMessage = responseText || `Error ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const result = JSON.parse(responseText);
        mostrarNotificacion('✅ Producto creado exitosamente', 'success');
        return result;

    } catch (error) {
        console.error('Error completo en crearProducto:', error);
        throw error;
    }
}

function resetearFormularioEdicion() {
    if (editProductForm) {
        editProductForm.reset();
        const selects = editProductForm.querySelectorAll('select[multiple]');
        selects.forEach(select => {
            Array.from(select.options).forEach(option => {
                option.selected = false;
            });
        });
    }
}

async function actualizarProducto(productId, productoData) {
    const response = await fetch(`${API_BASE_URL2}/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productoData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error actualizando producto');
    }

    mostrarNotificacion('✅ Producto actualizado exitosamente', 'success');
    return await response.json();
}

window.confirmarEliminarProducto = function(productId) {
    const producto = productos.find(p => p.productId === productId);
    
    if (!producto) return;

    const deleteModal = document.getElementById('confirmDelete_Modal');
    const confirmDeleteBtn = document.getElementById('confirmDelete_Btn');
    
    if (deleteModal && confirmDeleteBtn) {
        const manejarEliminacion = () => {
            eliminarProducto(productId);
            deleteModal.close();
            confirmDeleteBtn.removeEventListener('click', manejarEliminacion);
        };
        
        confirmDeleteBtn.addEventListener('click', manejarEliminacion);
        deleteModal.showModal();
    }
}

async function eliminarProducto(productId) {
    try {
        const response = await fetch(`${API_BASE_URL2}/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error eliminando producto');
        }

        mostrarNotificacion('✅ Producto eliminado exitosamente', 'success');
        await cargarProductos();
    } catch (error) {
        console.error('Error eliminando producto:', error);
        mostrarNotificacion('Error al eliminar el producto', 'error');
    }
}

function cerrarModalProducto() {
    if (productModal2) {
        productModal2.close();
    }
    productoEditando = null;
    if (productForm) productForm.reset();
    limpiarPreviews();
    resetearImagenesBase64();
}

function cerrarModalEdicion() {
    if (editProductModal) {
        editProductModal.close();
    }
    productoEditando = null;
    resetearFormularioEdicion();
    limpiarPreviews();
    resetearImagenesBase64();
}

function actualizarContadorProductos() {
    const contador = document.querySelector('#welcome .grid.grid-cols-3 .text-3xl.font-bold');
    if (contador) {
        const productosActivos = productos.filter(p => p.productIsActive).length;
        contador.textContent = productosActivos;
    }
}

function mostrarNotificacion(mensaje, tipo = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const bgColors = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500"
    };

    const toast = document.createElement("div");

    toast.className =
        `min-w-[220px] px-4 py-3 rounded-lg text-white shadow-lg 
         font-medium flex items-center gap-2 opacity-0 translate-x-5
         transition-all duration-300 ${bgColors[tipo]}`;

    toast.innerHTML = `
        <span>${mensaje}</span>
    `;

    container.appendChild(toast);

    // Animación de entrada
    requestAnimationFrame(() => {
        toast.classList.remove("opacity-0", "translate-x-5");
        toast.classList.add("opacity-100", "translate-x-0");
    });

    // Animación de salida
    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-x-5");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}