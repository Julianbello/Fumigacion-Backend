const express = require("express");
const { verificarToken, requiereRol } = require("../middleware/auth.middleware");
const { listarTipos, crearTipo, crearProducto } = require("../services/producto.service");
const router = express.Router();

function responderError(res, err) {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  return res.status(500).json({ error: "Error de servidor" });
}

router.get("/tipos", verificarToken, async (req, res) => {
  try {
    res.json(await listarTipos());
  } catch (err) {
    responderError(res, err);
  }
});

router.post("/tipos", verificarToken, requiereRol("ADMIN", "OPERARIO"), async (req, res) => {
  try {
    const tipo = await crearTipo((req.body || {}).nombre);
    res.status(201).json(tipo);
  } catch (err) {
    responderError(res, err);
  }
});

router.post("/", verificarToken, requiereRol("ADMIN", "OPERARIO"), async (req, res) => {
  try {
    const producto = await crearProducto(req.body || {});
    res.status(201).json(producto);
  } catch (err) {
    responderError(res, err);
  }
});

module.exports = router;