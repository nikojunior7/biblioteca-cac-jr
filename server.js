
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

require("./database");

const app = express();
const userRoutes = require("./userroutes");

const PORT = process.env.PORT || 3000;

// 1. Segurança
app.use(helmet());

// 2. Endereços autorizados
const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "https://bibliojr-niko.vibehost.space",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origem não autorizada pelo CORS."));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 3. Dados recebidos
app.use(express.json({ limit: "10kb" }));

// 4. Limite de tentativas de login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: "Demasiadas tentativas. Aguarda 15 minutos."
    }
});

// 5. Rota de teste
app.get("/", (req, res) => {
    res.send("Backend da Biblioteca Virtual funcionando!");
});

app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "Backend da Biblioteca Virtual funcionando!"
    });
});

// 6. Rotas dos utilizadores
// O loginLimiter deve ser aplicado na rota POST /login
app.use("/api/users", userRoutes);

// 7. Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
});
