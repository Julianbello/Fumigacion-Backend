const mongoose = require("mongoose");

const conectarDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb+srv://julianbellotiven_db_user:5ZfgLlQsdeYTAbxY@cluster0.ltmtv9n.mongodb.net/fumigaciones_db?retryWrites=true&w=majority";
    await mongoose.connect(uri);
    console.log("🌱 MongoDB conectado correctamente");
  } catch (error) {
    console.error("❌ Error de conexión a MongoDB:", error.message);
  }
};

module.exports = { conectarDB };
