const mongoose = require("mongoose");

let cached = global.mongoose || { conn: null, promise: null };

const conectarDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGO_URI || "mongodb+srv://julianbellotiven_db_user:5ZfgLlQsdeYTAbxY@cluster0.ltmtv9n.mongodb.net/fumigaciones_db?retryWrites=true&w=majority";
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000
    }).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    console.log("🌱 MongoDB conectado (caché)");
  } catch (e) {
    cached.promise = null;
    console.error("❌ Error de conexión:", e.message);
    throw e;
  }

  global.mongoose = cached;
  return cached.conn;
};

module.exports = { conectarDB };
