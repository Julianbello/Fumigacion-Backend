require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const fumigacionRoutes = require("./routes/fumigacion.routes");
const { conectarDB } = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

conectarDB();

app.use("/api/auth", authRoutes);
app.use("/api/fumigaciones", fumigacionRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", db: "MongoDB conectado" });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Servidor local escuchando en el puerto ${PORT}`);
  });
}

module.exports = app;
