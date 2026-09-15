// ===== Buscando elementos no HTML =====
const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expensesElement = document.getElementById("expenses");
const transactionList = document.getElementById("transactionList");
const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");
const filterPeriod = document.getElementById("filterPeriod");

const transactionForm = document.getElementById("transactionForm");
const submitTransactionButton = document.getElementById("submitTransactionButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const typeInput = document.getElementById("type");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");

// ==== Controle de Edição ====
let editingTransactionId = null;

// ==== Dados do Plano B, que só será usado se não houver nada salvo o localStorage ainda.
const defaultTransactions = [
    {
        id: 1,
        description: "Salário",
        category: "Trabalho",
        type: "income",
        amount: 3000,
        date: "2026-08-13"
    },

    {
        id: 2,
        description: "Academia",
        category: "Saúde",
        type: "expense",
        amount: 80,
        date: "2026-08-12"
    },

    {
        id: 3,
        description: "Internet",
        category: "Casa",
        type: "expense",
        amount: 75,
        date: "2026-08-10"
    },

    {
        id: 4,
        description: "Freelance",
        category: "Trabalho",
        type: "income",
        amount: 800,
        date: "2026-08-08"
    }
];

// Array que a aplicação usa — começa vazio, é preenchido por loadTransactions()
let transactions = [];

//Criar o carregamento LocalStorade e pergunta se existe algo salvo...
function loadTransactions() {

    const storedTransactions = localStorage.getItem(
        "financehub_transactions"
    );

    if (storedTransactions) {

        transactions = JSON.parse(storedTransactions);
    
    } else {
        
        transactions = [...defaultTransactions];
    }
}

// === Criando uma função de calculos ===
function calculateBalance() {
    let balance = 0;
    transactions.forEach(transaction=> {

        if (transaction.type === "income") {
            balance += transaction.amount;
        }

        if (transaction.type === "expense") {
            balance -= transaction.amount;
        }
    })

    return balance;

}

function calculateIncome() {
    let income = 0;

    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            income += transaction.amount;
        }
    });

    return income;
} 

function calculateExpenses() {
    let expenses = 0
    transactions.forEach(transaction => {

        if (transaction.type === "expense") {
            expenses += transaction.amount;
        }
    });

    return expenses;
}

// === Formatação de R$000 para R$ 0,00
function formatCurrency (value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}
function formatDate(date) {
    return new Date(date + "T00:00:00").toLocaleDateString("pt-Br");
}


// === Exibição na Tela ===
function updateDashboard() {
    balanceElement.textContent = formatCurrency(calculateBalance());
    incomeElement.textContent = formatCurrency(calculateIncome());
    expensesElement.textContent = formatCurrency(calculateExpenses());
}

// ===== Filtrar transações =====

function getFilteredTransactions() {

    const selectedType = filterType.value;
    const selectedCategory = filterCategory.value;
    const selectedPeriod = filterPeriod.value;

    return transactions.filter(transaction => {

        const matchesType =
            selectedType === "all" ||
            transaction.type === selectedType;

        const matchesCategory =
            selectedCategory === "all" ||
            transaction.category === selectedCategory;

        let matchesPeriod = true
    
        const transactionDate = new Date(transaction.date + "T00:00:00");
        const today = new Date();

        if (selectedPeriod === "month") {
            matchesPeriod = transactionDate.getMonth() === today.getMonth() && transactionDate.getFullYear() === today.getFullYear();
        }
        
        if (selectedPeriod === "30days") {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);

            matchesPeriod = transactionDate >= thirtyDaysAgo && transactionDate <= today;
        }

        return matchesType && matchesCategory && matchesPeriod;
    });
}

// ===== Renderizar transações =====

function renderTransactions() {

    transactionList.innerHTML = "";

    const filteredTransactions = getFilteredTransactions();

    // Verifica se não existem transações
    if (filteredTransactions.length === 0) {

        const emptyMessage = document.createElement("div");

        emptyMessage.classList.add("empty-state");

        emptyMessage.innerHTML = `
            <i class="fa-solid fa-receipt"></i>
            <h3>Nenhuma transação encontrada</h3>
            <p>Adicione sua primeira receita ou despesa para começar.</p>
        `;

        transactionList.appendChild(emptyMessage);

        return;
    }

    filteredTransactions.forEach(transaction => {

        const signal = transaction.type === "income" ? "+" : "-";

        const transactionElement = document.createElement("article");

        transactionElement.classList.add("transaction");

        transactionElement.innerHTML = `
            <div>
                <strong>${transaction.description}</strong>
                <span>${transaction.category}</span>
            </div>

            <div class="transaction-actions">

                <strong>
                    ${signal} ${formatCurrency(transaction.amount)}
                </strong>

                <div class="transaction-buttons">

                    <button class="edit-button" data-id="${transaction.id}">Editar</button>

                    <button class="delete-button" data-id="${transaction.id}">Excluir</button>
                </div>

            </div>
        `;

        transactionList.appendChild(transactionElement);
    });
}

// ===== Eventos dos filtros =====
filterType.addEventListener("change", function() {
    renderTransactions();
});

filterCategory.addEventListener("change", function() {
    renderTransactions();
});

// === Função de exclusão ===
function deleteTransaction(id) {

    const transaction = transactions.find(
        transaction => transaction.id === id
    );

    if (!transaction) {
        return;
    }

    const confirmed = confirm(`Deseja excluir a transação "${transaction.description}"?`);

    if (!confirmed) {
        return;
    }
    
    transactions = transactions.filter(

        transaction => transaction.id !== id
    );

    saveTransactions();
    updateDashboard();
    renderTransactions();
}

// ===== Edição de transação =====

function editTransaction(id) {

    const transaction = transactions.find(
        transaction => transaction.id === id
    );

    if (!transaction) {
        return;
    }

    editingTransactionId = id;

    submitTransactionButton.textContent = "Salvar alteração";
    cancelEditButton.style.display = "inline-block";

    descriptionInput.value = transaction.description;
    categoryInput.value = transaction.category;
    typeInput.value = transaction.type;
    amountInput.value = transaction.amount;
    dateInput.value = transaction.date;
}

// === Cancelar edição

function cancelEdit() {
    editingTransactionId = null;
    transactionForm.reset();
    submitTransactionButton.textContent = "Adcionar transação";
    cancelEditButton.style.display = "none";
}

cancelEditButton.addEventListener("click", function() {
    cancelEdit();
});

// === Eventos das transações === 
transactionList.addEventListener("click", function(event) {

    if (event.target.classList.contains("delete-button")) {
        const id = Number(event.target.dataset.id);
        deleteTransaction(id);
    }

    if(event.target.classList.contains("edit-button")) {
        const id= Number(event.target.dataset.id);
        editTransaction(id);
    }
});


//Função para salvar no LocalStorage
function saveTransactions () {
    localStorage.setItem(
        "financehub_transactions",
        JSON.stringify(transactions)
        
    );
}

// ==== Validadção do Formulário ====

function validateTransaction() {

    const description = descriptionInput.value.trim();
    const category = categoryInput.value;
    const type = typeInput.value;
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    if (description === "") {
        alert("Digite uma descrição para a transação.")
        return false;
    }

    if (category === "") {
        alert("Selecione uma categoria.");
        return false;
    }

    if (type !== "income" && type !== "expense") {
        alert("Selecione o tipo da transação.");
        return false;
    }

    if (amount <= 0 ||Number.isNaN(amount)) {
        alert("Digite um valor maior que zero.");
        return false;
    }

    if (date =="") {
        alert("Selecione uma data.");
        return false;
    }

    return true;
}

// === Envio do formulário ===
transactionForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if (!validateTransaction()) {
        return;
    }

    const transactionData = {
        description: descriptionInput.value.trim(),
        category: categoryInput.value,
        type: typeInput.value,
        amount: Number(amountInput.value),
        date: dateInput.value
    };

    // ===== Modo edição =====

    if (editingTransactionId !== null) {

        const transactionIndex = transactions.findIndex(
            transaction => transaction.id === editingTransactionId
        );

        if (transactionIndex !== -1) {

            transactions[transactionIndex] = {
                id: editingTransactionId,
                ...transactionData
            };
        }

        editingTransactionId = null;

        submitTransactionButton.textContent = "Adicionar transação";
        cancelEditButton.style.display = "none";


    } else {

        // ===== Modo nova transação =====

        const newTransaction = {
            id: Date.now(),
            ...transactionData
        };

        transactions.push(newTransaction);
    }

    saveTransactions();
    updateDashboard();
    renderTransactions();

    transactionForm.reset();
});






cancelEditButton.style.display = "none";
loadTransactions();
updateDashboard();
renderTransactions();

