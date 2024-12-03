const inventoryTable = document.getElementById("inventory-table");
const productForm = document.getElementById("product-form");
const nameInput = document.getElementById("name");
const quantityInput = document.getElementById("quantity");
const characteristicsInput = document.getElementById("characteristics");
const editIndexInput = document.getElementById("edit-index");

let logs = []; // Arreglo para los logs

const securityCode = "789456123"; // Required security code

function authenticate() {
    const code = prompt("Ingresa el código de seguridad:");
    if (code !== securityCode) {
        alert("Código incorrecto. Acción denegada.");
        return false;
    }

    const studentCode = prompt("Ingresa tu código de estudiante:");
    if (!/^\d{9}$/.test(studentCode)) {
        alert("Código de estudiante invalido. Acción denegada.");
        return false;
    }

    return studentCode;
}

function getTimestamp() {
    const now = new Date();
    return now.toISOString().replace("T", " ").split(".")[0]; // Formato: YYYY-MM-DD HH:mm:ss
}

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
                <button onclick="removeProduct(${index})">Eliminar</button>
            </td>
        </tr>
    `).join("");
}

function saveInventory(inventory) {
    localStorage.setItem("inventory", JSON.stringify(inventory));
    loadInventory();
}

productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const studentCode = authenticate();
    if (!studentCode) return;

    const name = nameInput.value.trim();
    const quantity = parseInt(quantityInput.value.trim(), 10);
    const characteristics = characteristicsInput.value.trim();

    const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
    const editIndex = editIndexInput.value;

    if (editIndex) {
        logs.push(`[${getTimestamp()}] Se actualizó un producto: ${name} | Cantidad: ${quantity} | Características: ${characteristics} | Código de estudiante: ${studentCode}`);
        inventory[editIndex] = { name, quantity, characteristics };
        editIndexInput.value = "";
    } else {
        logs.push(`[${getTimestamp()}] Se añadió un producto: ${name} | Cantidad: ${quantity} | Características: ${characteristics} | Código de estudiante: ${studentCode}`);
        inventory.push({ name, quantity, characteristics });
    }

    saveInventory(inventory);

    nameInput.value = "";
    quantityInput.value = "";
    characteristicsInput.value = "";
});

function editProduct(index) {
    const studentCode = authenticate();
    if (!studentCode) return;

    const inventory = JSON.parse(localStorage.getItem("inventory"));
    const product = inventory[index];
    nameInput.value = product.name;
    quantityInput.value = product.quantity;
    characteristicsInput.value = product.characteristics;
    editIndexInput.value = index;
}

function removeProduct(index) {
    const studentCode = authenticate();
    if (!studentCode) return;

    const reason = prompt("¿Porque debes eliminar este producto?:");
    if (reason) {
        const inventory = JSON.parse(localStorage.getItem("inventory"));
        const removedProduct = inventory.splice(index, 1)[0];
        logs.push(`[${getTimestamp()}] Se eliminó un producto: ${removedProduct.name} | Razón: ${reason} | Código de estudiante: ${studentCode}`);
        saveInventory(inventory);
        alert(`El articulo fue removido porque: "${reason}"`);
    }
}

function downloadLogs() {
    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_logs.txt";
    a.click();
    URL.revokeObjectURL(url);
}

loadInventory();