// scripts/validar-sql.js
// Verifica, de forma basica, que un archivo .sql no tenga sentencias
// obviamente rotas antes de dejarlo avanzar en el pipeline.
const fs = require("fs");

const archivo = process.argv[2];
if (!archivo) {
  console.error("Uso: node validar-sql.js <archivo.sql>");
  process.exit(1);
}

const contenido = fs.readFileSync(archivo, "utf8");

const abiertos = (contenido.match(/\(/g) || []).length;
const cerrados = (contenido.match(/\)/g) || []).length;

if (abiertos !== cerrados) {
  console.error(`Error: parentesis desbalanceados en ${archivo}`);
  process.exit(1);
}

console.log(`OK: ${archivo} paso la validacion basica de sintaxis`);
