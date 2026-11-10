const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    updateUserStatus,
    deleteUser
} = require("../controllers/userController");

const {
    authenticateToken,
    requireAdmin,
    requireSelfOrAdmin
} = require("../middleware/auth");
// Rotas públicas
router.post("/register", registerUser);
router.post("/login", loginUser);

// Rotas exclusivas do administrador
router.get("/", authenticateToken, requireAdmin, getUsers);

router.patch(
    "/:id/status",
    authenticateToken,
    requireAdmin,
    updateUserStatus
);

router.delete(
    "/:id",
    authenticateToken,
    requireAdmin,
    deleteUser
);

// Consultar e editar dados: apenas administrador nesta primeira versão
router.get(
    "/:id",
    authenticateToken,
    requireSelfOrAdmin,
    getUserById
);
router.put(
    "/:id",
    authenticateToken,
    requireAdmin,
    updateUser
);

module.exports = router;