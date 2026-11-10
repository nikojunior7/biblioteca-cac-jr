
const jwt = require("jsonwebtoken");
const db = require("../config/database");

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Acesso não autorizado. Faça login."
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            success: false,
            message: "Configuração de autenticação indisponível."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Confirmar a conta diretamente na base de dados
        const user = db.prepare(`
            SELECT id, role, status
            FROM users
            WHERE id = ?
        `).get(decoded.id);

        if (!user || user.status !== "ativo") {
            return res.status(401).json({
                success: false,
                message: "Conta inexistente ou bloqueada."
            });
        }

        req.user = {
            id: user.id,
            role: user.role
        };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Sessão inválida ou expirada."
        });
    }
}

function requireAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Apenas o administrador pode realizar esta operação."
        });
    }

    next();
}

function requireSelfOrAdmin(req, res, next) {
    const requestedId = Number(req.params.id);
    const authenticatedId = Number(req.user.id);

    if (
        authenticatedId !== requestedId &&
        req.user.role !== "admin"
    ) {
        return res.status(403).json({
            success: false,
            message: "Não tens autorização para consultar este perfil."
        });
    }

    next();
}

module.exports = {
    authenticateToken,
    requireAdmin,
    requireSelfOrAdmin
};
