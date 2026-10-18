const mongoose = require("mongoose");

let cached = global.mongoose || { conn: null, promise: null };

const conectarDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("Falta la variable de entorno MONGO_URI");
    }
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB conectado (caché)");
  } catch (e) {
    cached.promise = null;
    console.error("Error de conexión:", e.message);
    throw e;
  }

  global.mongoose = cached;
  return cached.conn;
};

module.exports = { conectarDB };