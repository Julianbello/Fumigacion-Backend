const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/test", (req, res) => res.json({ msg: "RUTA REGISTRADA CORRECTAMENTE" }));
app.post(/.*register$/, (req, res) => res.json({ msg: "REGISTRO OK", body: req.body }));

module.exports = app;
