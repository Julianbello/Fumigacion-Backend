const express = require("express");
const cors = require("cors");
const { conectarDB } = require("../src/config/db");
const authRoutes = require("../src/routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

conectarDB();

// Montar en ambas rutas para compatibilidad total con Vercel
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", db: "Conectado" });
});

module.exports = app;
