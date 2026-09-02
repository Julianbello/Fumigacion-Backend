require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const fumigacionRoutes = require("./routes/fumigacion.routes");
const { getPool } = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/fumigaciones", fumigacionRoutes);

app.get("/health", async (req, res) => {
  try {
    await getPool();
    res.json({ status: "ok", db: "conectado" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "sin conexión", detalle: err.message });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend fumigación escuchando en puerto ${PORT}`);
  getPool().catch(() => {
    console.error("El servidor sigue arriba, pero no logró conectar a Azure SQL. Revisa tu archivo .env");
  });
});

module.exports = app;
