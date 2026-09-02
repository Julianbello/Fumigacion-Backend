const users = [
  { id: 1, username: "admin", password: "$2a$10$abcdefghijklmnopqrstuv", role: "ADMIN" },
  { id: 2, username: "operario", password: "$2a$10$abcdefghijklmnopqrstuv", role: "OPERARIO" }
];

const productos = [
  { id: 1, nombre: "Fungicida X", categoria: "polvoso", dosisMlPorLitro: 3, stockLitros: 20 },
  { id: 2, nombre: "Acaricida Y", categoria: "trips", dosisMlPorLitro: 5, stockLitros: 15 }
];

const fumigaciones = [];

module.exports = { users, productos, fumigaciones };
