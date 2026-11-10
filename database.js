
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Caminho da base de dados
const dbPath = process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, "..", "database.sqlite");

// Criar a pasta, caso ainda não exista
fs.mkdirSync(path.dirname(dbPath), {
    recursive: true
});

// Abrir a base de dados
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

db.pragma("foreign_keys = ON");

// Criar tabela de alunos
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        apelido TEXT NOT NULL,
        idade INTEGER NOT NULL,
        classe TEXT NOT NULL,
        numero_pauta TEXT,
        email TEXT,
        password TEXT,
        email_verified INTEGER NOT NULL DEFAULT 0,
        status TEXT DEFAULT 'ativo',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Verificar colunas existentes
const columns = db.prepare(
    "PRAGMA table_info(users)"
).all();

const columnNames = columns.map(column => column.name);

// Adicionar email, se necessário
if (!columnNames.includes("email")) {
    db.exec("ALTER TABLE users ADD COLUMN email TEXT");
}

// Adicionar senha, se necessário
if (!columnNames.includes("password")) {
    db.exec("ALTER TABLE users ADD COLUMN password TEXT");
}

// Adicionar verificação de email, se necessário
if (!columnNames.includes("email_verified")) {
    db.exec(`
        ALTER TABLE users
        ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0
    `);
}

// Índice único para emails
db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
    ON users(email)
    WHERE email IS NOT NULL
`);

// Tabela de códigos de confirmação
db.exec(`
    CREATE TABLE IF NOT EXISTS verification_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        code_hash TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE CASCADE
    )
`);
// Adicionar coluna de permissões
const updatedColumns = db.prepare(
    "PRAGMA table_info(users)"
).all();

const hasRole = updatedColumns.some(
    column => column.name === "role"
);

if (!hasRole) {
    db.exec(`
        ALTER TABLE users
        ADD COLUMN role TEXT NOT NULL DEFAULT 'aluno'
    `);
}
console.log("Base de dados preparada com sucesso!");

module.exports = db;

