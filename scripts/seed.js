require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("../src/models/Usuario");

async function main() {
  const [username, password, role = "ADMIN"] = process.argv.slice(2);

  if (!username || !password) {
    console.log("Uso: node scripts/reset-usuario.js USUARIO CLAVE [ADMIN|OPERARIO]");
    process.exit(1);
  }
  if (!["ADMIN", "OPERARIO"].includes(role)) {
    console.log("El rol debe ser ADMIN u OPERARIO");
    process.exit(1);
  }
  if (!process.env.MONGO_URI) {
    console.log("Falta la variable MONGO_URI");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  const passwordHash = await bcrypt.hash(password, 10);

  await Usuario.findOneAndUpdate(
    { username },
    { username, passwordHash, role },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Listo: usuario "${username}" (${role}) creado o actualizado.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});