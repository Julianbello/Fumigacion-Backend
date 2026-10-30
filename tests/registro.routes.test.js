jest.mock("../src/models/Usuario", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

const express = require("express");
const request = require("supertest");
const Usuario = require("../src/models/Usuario");
const authRoutes = require("../src/routes/auth.routes");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Usuario.findOne.mockResolvedValue(null);
    Usuario.create.mockResolvedValue({});
  });

  test("crea el usuario con rol OPERARIO y guarda la clave encriptada", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "julian_01", password: "ClaveSegura1" });

    expect(res.status).toBe(201);
    const datos = Usuario.create.mock.calls[0][0];
    expect(datos.username).toBe("julian_01");
    expect(datos.role).toBe("OPERARIO");
    expect(datos.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(datos.passwordHash).not.toContain("ClaveSegura1");
  });

  test("ignora un rol enviado por el cliente (no se puede crear un ADMIN)", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ username: "intruso", password: "ClaveSegura1", role: "ADMIN" });

    expect(Usuario.create.mock.calls[0][0].role).toBe("OPERARIO");
  });

  test("responde 400 si faltan datos", async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "solo" });
    expect(res.status).toBe(400);
    expect(Usuario.create).not.toHaveBeenCalled();
  });

  test("responde 400 si el usuario tiene caracteres no permitidos", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "mal usuario!", password: "ClaveSegura1" });
    expect(res.status).toBe(400);
  });

  test("responde 400 si la contraseña es demasiado corta", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "julian", password: "corta" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/contraseña/);
  });

  test("responde 400 si el usuario no es texto (intento de inyección)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: { $ne: null }, password: "ClaveSegura1" });
    expect(res.status).toBe(400);
    expect(Usuario.findOne).not.toHaveBeenCalled();
  });

  test("responde 409 si el usuario ya existe", async () => {
    Usuario.findOne.mockResolvedValue({ username: "julian" });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "julian", password: "ClaveSegura1" });
    expect(res.status).toBe(409);
    expect(Usuario.create).not.toHaveBeenCalled();
  });

  test("responde 409 si la base reporta un duplicado simultáneo", async () => {
    Usuario.create.mockRejectedValue({ code: 11000 });
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "julian", password: "ClaveSegura1" });
    expect(res.status).toBe(409);
  });

  test("responde 500 sin filtrar detalles si la base falla", async () => {
    Usuario.findOne.mockRejectedValue(new Error("fallo interno con datos sensibles"));
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "julian", password: "ClaveSegura1" });
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("sensibles");
  });
});

describe("POST /api/auth/login", () => {
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "secreto-de-prueba";
  });

  test("responde 400 si el usuario no es texto (intento de inyección)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: { $ne: null }, password: "x" });
    expect(res.status).toBe(400);
    expect(Usuario.findOne).not.toHaveBeenCalled();
  });

  test("con credenciales correctas devuelve token y rol", async () => {
    Usuario.findOne.mockResolvedValue({
      _id: "u1",
      username: "julian",
      role: "OPERARIO",
      passwordHash: bcrypt.hashSync("ClaveSegura1", 4),
    });
    const res = await request(app).post("/api/auth/login").send({ username: "julian", password: "ClaveSegura1" });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe("OPERARIO");
    expect(jwt.verify(res.body.token, "secreto-de-prueba")).toMatchObject({ username: "julian", role: "OPERARIO" });
  });

  test("responde 401 si la contraseña es incorrecta", async () => {
    Usuario.findOne.mockResolvedValue({
      username: "julian",
      role: "OPERARIO",
      passwordHash: bcrypt.hashSync("ClaveSegura1", 4),
    });
    const res = await request(app).post("/api/auth/login").send({ username: "julian", password: "otra-clave" });
    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
  });

  test("responde 401 si el usuario no existe", async () => {
    Usuario.findOne.mockResolvedValue(null);
    const res = await request(app).post("/api/auth/login").send({ username: "nadie", password: "ClaveSegura1" });
    expect(res.status).toBe(401);
  });

  test("responde 500 si la base falla", async () => {
    Usuario.findOne.mockRejectedValue(new Error("caida"));
    const res = await request(app).post("/api/auth/login").send({ username: "julian", password: "ClaveSegura1" });
    expect(res.status).toBe(500);
  });
});