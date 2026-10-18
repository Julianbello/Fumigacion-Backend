require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const fumigacionRoutes = require("./routes/fumigacion.routes");
const { conectarDB } = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

conectarDB().catch((err) => {
  console.error("No se pudo conectar a la base de datos:", err.message);
});

app.use("/api/auth", authRoutes);
app.use("/api/fumigaciones", fumigacionRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", db: "MongoDB conectado" });
});

// Solo escucha cuando se ejecuta con "node src/server.js" / "npm start"
// (App Service y local). En Vercel se importa como módulo y no entra aquí.
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
}

module.exports = app;