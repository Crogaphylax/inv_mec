const inventoryTable = document.getElementById("inventory-table");
const productForm = document.getElementById("product-form");
const nameInput = document.getElementById("name");
const quantityInput = document.getElementById("quantity");
const characteristicsInput = document.getElementById("characteristics");
const editIndexInput = document.getElementById("edit-index");

let logs = [];
let currentUser = null; // Usuario autenticado

const users = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "user", password: "user123", role: "user" }
];

// Función para autenticar usuario y establecer rol
function authenticateUser() {
    const username = prompt("Ingresa tu nombre de usuario:");
    const password = prompt("Ingresa tu contraseña:");
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        alert("Credenciales incorrectas.");
        return null;
    }

    alert(`Bienvenido, ${user.role === "admin" ? "Administrador" : "Usuario Regular"}`);
    return user;
}

// Función de login
function login() {
    currentUser = authenticateUser();
    if (currentUser) {
        loadInventory();
        updateUI();
    }
}

// Función de logout
function logout() {
    currentUser = null;
    alert("Has cerrado sesión.");
    updateUI();
}

// Actualiza la interfaz según el rol y el estado del formulario
function updateUI() {
    const addButton = document.getElementById("add-product-button");
    const deleteButtons = document.querySelectorAll(".delete-button");
    const logButton = document.getElementById("download-logs-button");
    const saveButton = document.querySelector("#product-form button[type='submit']");

    // Si no hay usuario autenticado
    if (!currentUser) {
        addButton.style.display = "none";
        logButton.style.display = "none";
        deleteButtons.forEach(btn => (btn.style.display = "none"));
        saveButton.style.display = "none";
        return;
    }

    // Actualizar según el rol del usuario
    if (currentUser.role === "admin") {
        addButton.style.display = "block"; // Administradores pueden añadir productos
        logButton.style.display = "block"; // Administradores pueden descargar logs
        deleteButtons.forEach(btn => (btn.style.display = "block")); // Administradores pueden eliminar productos
        saveButton.style.display = "block"; // Administradores pueden guardar productos
    } else if (currentUser.role === "user") {
        addButton.style.display = "none"; // Usuarios regulares no pueden añadir productos
        logButton.style.display = "none"; // Usuarios regulares no pueden descargar logs
        deleteButtons.forEach(btn => (btn.style.display = "none")); // Usuarios regulares no pueden eliminar productos

        // Mostrar el botón Guardar solo si se está editando un producto
        if (editIndexInput.value !== "") {
            saveButton.style.display = "block"; // Usuarios pueden guardar ediciones
        } else {
            saveButton.style.display = "none"; // Ocultar si no hay edición activa
        }
    }
}


// Carga y muestra el inventario
function loadInventory() {
    const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
    inventoryTable.innerHTML = inventory.map((product, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.characteristics}</td>
            <td>
                <button onclick="editProduct(${index})">Editar</button>
                ${
                    currentUser?.role === "admin"
                        ? `<button class="delete-button" onclick="removeProduct(${index})">Eliminar</button>`
                        : ""
                }
            </td>
        </tr>
    `).join("");
}

// Guarda el inventario y lo recarga
function saveInventory(inventory) {
    localStorage.setItem("inventory", JSON.stringify(inventory));
    loadInventory();
}

// Función para añadir o editar productos
productForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!currentUser) {
        alert("Por favor, inicia sesión para realizar esta acción.");
        return;
    }

    const name = nameInput.value.trim();
    const quantity = parseInt(quantityInput.value.trim(), 10);
    const characteristics = characteristicsInput.value.trim();

    if (!name) {
        alert("El nombre no puede estar vacío.");
        return;
    }
    if (isNaN(quantity) || quantity <= 0) {
        alert("La cantidad debe ser un número positivo.");
        return;
    }

    const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
    const editIndex = editIndexInput.value;

    if (editIndex) {
        logs.push(`[${getTimestamp()}] ${currentUser.username} actualizó un producto: ${name}`);
        inventory[editIndex] = { name, quantity, characteristics };
        editIndexInput.value = "";
    } else if (currentUser.role === "admin") {
        logs.push(`[${getTimestamp()}] ${currentUser.username} añadió un producto: ${name}`);
        inventory.push({ name, quantity, characteristics });
    } else {
        alert("Solo los administradores pueden añadir productos.");
        return;
    }

    saveInventory(inventory);

    nameInput.value = "";
    quantityInput.value = "";
    characteristicsInput.value = "";
});

// Edita un producto (Disponible para todos los usuarios)
function editProduct(index) {
    if (!currentUser) {
        alert("Por favor, inicia sesión para realizar esta acción.");
        return;
    }

    const inventory = JSON.parse(localStorage.getItem("inventory"));
    const product = inventory[index];

    nameInput.value = product.name;
    quantityInput.value = product.quantity;
    characteristicsInput.value = product.characteristics;
    editIndexInput.value = index; // Marcar el índice del producto en edición

    alert(`Editando producto: ${product.name}`);
    updateUI(); // Actualizar la UI para mostrar el botón "Guardar"
}


// Función para añadir o editar productos (ajustado para roles)
productForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!currentUser) {
        alert("Por favor, inicia sesión para realizar esta acción.");
        return;
    }

    const name = nameInput.value.trim();
    const quantity = parseInt(quantityInput.value.trim(), 10);
    const characteristics = characteristicsInput.value.trim();
    const editIndex = editIndexInput.value;

    if (!name) {
        alert("El nombre no puede estar vacío.");
        return;
    }
    if (isNaN(quantity) || quantity <= 0) {
        alert("La cantidad debe ser un número positivo.");
        return;
    }

    const inventory = JSON.parse(localStorage.getItem("inventory")) || [];

    if (editIndex !== "") {
        // Editar un producto existente (todos los usuarios pueden hacerlo)
        logs.push(`[${getTimestamp()}] ${currentUser.username} actualizó un producto: ${name}`);
        inventory[editIndex] = { name, quantity, characteristics };
        editIndexInput.value = ""; // Limpiar el índice después de guardar
    } else if (currentUser.role === "admin") {
        // Agregar un nuevo producto (solo admins)
        logs.push(`[${getTimestamp()}] ${currentUser.username} añadió un producto: ${name}`);
        inventory.push({ name, quantity, characteristics });
    } else {
        alert("Solo los administradores pueden añadir productos.");
        return;
    }

    saveInventory(inventory);

    // Limpiar formulario
    nameInput.value = "";
    quantityInput.value = "";
    characteristicsInput.value = "";
});

// Elimina un producto (Solo Admin)
function removeProduct(index) {
    if (!currentUser || currentUser.role !== "admin") {
        alert("Solo los administradores pueden eliminar productos.");
        return;
    }

    const reason = prompt("¿Por qué deseas eliminar este producto?");
    if (reason) {
        const inventory = JSON.parse(localStorage.getItem("inventory"));
        const removedProduct = inventory.splice(index, 1)[0];
        logs.push(`[${getTimestamp()}] ${currentUser.username} eliminó un producto: ${removedProduct.name}. Razón: ${reason}`);
        saveInventory(inventory);
    }
}

// Descarga los logs (Solo Admin)
function downloadLogs() {
    if (!currentUser || currentUser.role !== "admin") {
        alert("Solo los administradores pueden descargar los logs.");
        return;
    }

    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_logs.txt";
    a.click();
    URL.revokeObjectURL(url);
}

// Devuelve el timestamp actual
function getTimestamp() {
    const now = new Date();
    return now.toISOString().replace("T", " ").split(".")[0];
}

loadInventory();
