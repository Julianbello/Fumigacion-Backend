require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("../src/models/Usuario");
const Producto = require("../src/models/Producto");

async function sembrarDatos() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado a MongoDB Atlas...");

    // Limpiar colecciones anteriores
    await Usuario.deleteMany({});
    await Producto.deleteMany({});

    // Hashear contraseñas iniciales
    const passAdmin = await bcrypt.hash("admin123", 10);
    const passOperario = await bcrypt.hash("operario123", 10);

    // Crear usuarios de prueba
    await Usuario.insertMany([
      { username: "admin", passwordHash: passAdmin, role: "ADMIN" },
      { username: "operario", passwordHash: passOperario, role: "OPERARIO" }
    ]);
    console.log("✅ Usuarios iniciales creados (admin / operario)");

    // Crear productos de prueba
    await Producto.insertMany([
      { nombre: "Fungicida X", categoria: "polvoso", dosisMlPorLitro: 3, stockLitros: 20 },
      { nombre: "Acaricida Y", categoria: "trips", dosisMlPorLitro: 5, stockLitros: 15 }
    ]);
    console.log("✅ Productos de prueba creados");

    console.log("🚀 ¡Sembrado de datos completado exitosamente!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error al sembrar datos:", err.message);
    process.exit(1);
  }
}

sembrarDatos();
