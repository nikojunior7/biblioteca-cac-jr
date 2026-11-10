

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

require("./database");

const app = express();
const userRoutes = require("./userroutes");

const PORT = process.env.PORT || 3000;

// 1. Cabeçalhos de segurança
app.use(helmet());

// 2. Endereços autorizados
const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origem não autorizada pelo CORS."));
    },
    credentials: true
}));

// 3. Limite dos dados recebidos
app.use(express.json({ limit: "10kb" }));

// 4. Proteção do login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: "Demasiadas tentativas. Aguarda 15 minutos e tenta novamente."
    }
});

app.post("/api/users/login", loginLimiter);

// 5. Rotas dos utilizadores
app.use("/api/users", userRoutes);

// 6. Rota principal
app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "Backend da Biblioteca Virtual funcionando!"
    });
});

// 7. Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
