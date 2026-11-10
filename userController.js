
const db = require("../config/database");

// Classes permitidas
const classes = [
    "7.ª Classe",
    "8.ª Classe",
    "9.ª Classe",
    "10.ª Classe",
    "11.ª Classe",
    "12.ª Classe"
];

// 1. REGISTAR ALUNO

/* 1. REGISTAR ALUNO */


const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 1. REGISTAR ALUNO
async function registerUser(req, res) {
    try {
        const {
            nome,
            apelido,
            idade,
            classe,
            email,
            password,
            confirmPassword
        } = req.body;

        // 1. Verificar campos obrigatórios
        if (
            !nome || !apelido || !idade ||
            !classe || !email || !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "Preencha todos os campos."
            });
        }

        // 2. Normalizar dados
        const nomeLimpo = String(nome).trim();
        const apelidoLimpo = String(apelido).trim();
        const emailNormalizado = String(email).trim().toLowerCase();
        const idadeNumero = Number(idade);

       // 3. Validar nome e apelido
const nomeValido = /^[\p{L}][\p{L}\s'-]{1,49}$/u;

if (!nomeValido.test(nomeLimpo)) {
    return res.status(400).json({
        success: false,
        message: "Introduza um nome válido."
    });
}

if (!nomeValido.test(apelidoLimpo)) {
    return res.status(400).json({
        success: false,
        message: "Introduza um apelido válido."
    });
}

// 4. Validar idade
if (
    !Number.isInteger(idadeNumero) ||
    idadeNumero < 10 ||
    idadeNumero > 25
) {
    return res.status(400).json({
        success: false,
        message: "Idade inválida."
    });
}

// 5. Validar classe
if (!classes.includes(classe)) {
    return res.status(400).json({
        success: false,
        message: "Classe inválida."
    });
}

// 6. Validar email
const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailValido.test(emailNormalizado)) {
    return res.status(400).json({
        success: false,
        message: "Introduza um email válido."
    });
}

// 7. Validar força da senha
const senhaForte =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

if (
    typeof password !== "string" ||
    Buffer.byteLength(password, "utf8") > 72 ||
    !senhaForte.test(password)
) {
    return res.status(400).json({
        success: false,
        message: "A senha deve ter pelo menos 10 caracteres, uma maiúscula, uma minúscula, um número e um símbolo."
    });
}

// 8. Confirmar senha
if (password !== confirmPassword) {
    return res.status(400).json({
        success: false,
        message: "As senhas não coincidem."
    });
}
        // 7. Verificar email repetido
        const emailExistente = db.prepare(
            "SELECT id FROM users WHERE email = ?"
        ).get(emailNormalizado);

        if (emailExistente) {
            return res.status(409).json({
                success: false,
                message: "Este email já está associado a uma conta."
            });
        }

        // 8. Proteger a senha
        const passwordHash = await bcrypt.hash(password, 12);

        // 9. Guardar aluno na base de dados
        const resultado = db.prepare(`
            INSERT INTO users (
    nome,
    apelido,
    idade,
    classe,
    email,
    password,
    email_verified,
    status,
    role
)
VALUES (?, ?, ?, ?, ?, ?, 0, 'ativo', 'aluno')
        `).run(
            nomeLimpo,
            apelidoLimpo,
            idadeNumero,
            classe,
            emailNormalizado,
            passwordHash
        );

        // 10. Procurar os dados do novo aluno
        const novoAluno = db.prepare(`
            SELECT
                id,
                nome,
                apelido,
                idade,
                classe,
                email
            FROM users
            WHERE id = ?
        `).get(resultado.lastInsertRowid);

        // 11. Mostrar dados no terminal
        console.log("\n========== NOVO ALUNO REGISTADO ==========");
        console.log("ID:", novoAluno.id);
        console.log("Nome:", novoAluno.nome);
        console.log("Apelido:", novoAluno.apelido);
        console.log("Idade:", novoAluno.idade);
        console.log("Classe:", novoAluno.classe);
        console.log("Email:", novoAluno.email);
        console.log("==========================================\n");

        // 12. Enviar dados ao frontend
        return res.status(201).json({
            success: true,
            message: "Conta criada com sucesso!",
            student: novoAluno
        });

    } catch (error) {
        console.error("Erro ao registar aluno:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno ao registar aluno."
        });
    }
}


// 2. LISTAR TODOS OS ALUNOS
function getUsers(req, res) {
    try {
        const users = db.prepare(`
    SELECT
        id,
        nome,
        apelido,
        idade,
        classe,
        email,
        email_verified,
        status,
        created_at
    FROM users
    ORDER BY id DESC
`).all();
        res.json({
            success: true,
            total: users.length,
            users
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Erro ao consultar alunos."
        });
    }
}

// 3. CONSULTAR UM ALUNO
function getUserById(req, res) {
    try {
        const user = db.prepare(`
    SELECT
        id,
        nome,
        apelido,
        idade,
        classe,
        email,
        status,
        created_at
    FROM users
    WHERE id = ?
`).get(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Aluno não encontrado."
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Erro ao consultar aluno."
        });
    }
}

// 4. EDITAR ALUNO
function updateUser(req, res) {
    try {
        const {
            nome,
            apelido,
            idade,
            classe,
            numero_pauta
        } = req.body;

        if (!nome || !apelido || !idade || !classe || !numero_pauta) {
            return res.status(400).json({
                success: false,
                message: "Preencha todos os campos."
            });
        }

        const idadeNumero = Number(idade);

        if (!Number.isInteger(idadeNumero) || idadeNumero < 10 || idadeNumero > 25 ||
            !classes.includes(classe)) {
            return res.status(400).json({
                success: false,
                message: "Dados do aluno inválidos."
            });
        }

        const user = db.prepare(
            "SELECT id FROM users WHERE id = ?"
        ).get(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Aluno não encontrado."
            });
        }

        const duplicado = db.prepare(`
            SELECT id FROM users
            WHERE numero_pauta = ? AND id != ?
        `).get(String(numero_pauta).trim(), req.params.id);

        if (duplicado) {
            return res.status(409).json({
                success: false,
                message: "Número de pauta já utilizado."
            });
        }

        db.prepare(`
            UPDATE users
            SET nome = ?,
                apelido = ?,
                idade = ?,
                classe = ?,
                numero_pauta = ?
            WHERE id = ?
        `).run(
            nome.trim(),
            apelido.trim(),
            idadeNumero,
            classe,
            String(numero_pauta).trim(),
            req.params.id
        );

        res.json({
            success: true,
            message: "Dados do aluno atualizados."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Erro ao atualizar aluno."
        });
    }
}

// 5. BLOQUEAR OU DESBLOQUEAR ALUNO
function updateUserStatus(req, res) {
    try {
        const { status } = req.body;

        if (!["ativo", "bloqueado"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Estado inválido."
            });
        }

        const resultado = db.prepare(`
            UPDATE users SET status = ? WHERE id = ?
        `).run(status, req.params.id);

        if (resultado.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Aluno não encontrado."
            });
        }

        res.json({
            success: true,
            message: "Estado do aluno atualizado."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Erro ao alterar estado do aluno."
        });
    }
}

// 6. ELIMINAR ALUNO
function deleteUser(req, res) {
    try {
        const resultado = db.prepare(
            "DELETE FROM users WHERE id = ?"
        ).run(req.params.id);

        if (resultado.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Aluno não encontrado."
            });
        }

        res.json({
            success: true,
            message: "Aluno eliminado com sucesso."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Erro ao eliminar aluno."
        });
    }
}


// 2. ENTRAR NA CONTA
async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Introduza o email e a senha."
            });
        }

        const emailNormalizado = email.trim().toLowerCase();

        const aluno = db.prepare(`
            SELECT
                id, nome, apelido, idade,
                classe, email, password,
                status, role
            FROM users
            WHERE email = ?
        `).get(emailNormalizado);

        if (!aluno) {
            return res.status(401).json({
                success: false,
                message: "Email ou senha incorretos."
            });
        }

        if (aluno.status !== "ativo") {
            return res.status(403).json({
                success: false,
                message: "Esta conta está bloqueada."
            });
        }

        const senhaCorreta = await bcrypt.compare(
            password,
            aluno.password
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                success: false,
                message: "Email ou senha incorretos."
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET não configurada.");
        }

        const token = jwt.sign(
            {
                id: aluno.id,
                role: aluno.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        const student = {
            id: aluno.id,
            nome: aluno.nome,
            apelido: aluno.apelido,
            idade: aluno.idade,
            classe: aluno.classe,
            email: aluno.email,
            role: aluno.role
        };

        console.log("Login realizado:", student.email);

        return res.json({
            success: true,
            message: "Login realizado com sucesso!",
            token,
            student
        });

    } catch (error) {
        console.error("Erro no login:", error);

        return res.status(500).json({
            success: false,
            message: "Erro interno ao entrar na conta."
        });
    }
}


module.exports = {
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    updateUserStatus,
    deleteUser
};
