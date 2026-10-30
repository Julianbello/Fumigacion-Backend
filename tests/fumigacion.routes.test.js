jest.mock("../src/services/fumigacion.service", () => ({
  registrarFumigacion: jest.fn(),
}));
jest.mock("../src/models/Fumigacion", () => ({
  find: jest.fn(),
}));
jest.mock("../src/models/Producto", () => ({
  find: jest.fn(),
}));

const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { registrarFumigacion } = require("../src/services/fumigacion.service");
const Fumigacion = require("../src/models/Fumigacion");
const Producto = require("../src/models/Producto");
const fumigacionRoutes = require("../src/routes/fumigacion.routes");

const app = express();
app.use(express.json());
app.use("/api/fumigaciones", fumigacionRoutes);

const auth = () => ({
  Authorization: `Bearer ${jwt.sign({ id: "u1", username: "julian", role: "OPERARIO" }, process.env.JWT_SECRET)}`,
});

beforeEach(() => {
  process.env.JWT_SECRET = "secreto-de-prueba";
  jest.clearAllMocks();
});

describe("POST /api/fumigaciones", () => {
  const cuerpo = { productoId: "p1", litrosAplicados: 2, categoria: "trips" };

  test("responde 401 sin token", async () => {
    const res = await request(app).post("/api/fumigaciones").send(cuerpo);
    expect(res.status).toBe(401);
  });

  test("responde 400 si faltan campos obligatorios", async () => {
    const res = await request(app).post("/api/fumigaciones").set(auth()).send({ productoId: "p1" });
    expect(res.status).toBe(400);
    expect(registrarFumigacion).not.toHaveBeenCalled();
  });

  test("registra la fumigación usando el usuario del token como responsable", async () => {
    registrarFumigacion.mockResolvedValue({ id: "f1", stockRestante: 8 });
    const res = await request(app).post("/api/fumigaciones").set(auth()).send(cuerpo);

    expect(res.status).toBe(201);
    expect(registrarFumigacion).toHaveBeenCalledWith({ ...cuerpo, responsable: "julian" });
  });

  test("responde 400 con el mensaje del servicio si falla", async () => {
    registrarFumigacion.mockRejectedValue(new Error("Stock insuficiente para completar la fumigación"));
    const res = await request(app).post("/api/fumigaciones").set(auth()).send(cuerpo);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Stock insuficiente/);
  });
});

describe("GET /api/fumigaciones", () => {
  test("devuelve el historial ordenado", async () => {
    const lista = [{ _id: "f1" }];
    const sort = jest.fn().mockResolvedValue(lista);
    Fumigacion.find.mockReturnValue({ populate: jest.fn().mockReturnValue({ sort }) });

    const res = await request(app).get("/api/fumigaciones").set(auth());

    expect(res.status).toBe(200);
    expect(res.body).toEqual(lista);
    expect(sort).toHaveBeenCalledWith({ fecha: 1 });
  });

  test("responde 500 si la base falla", async () => {
    Fumigacion.find.mockImplementation(() => {
      throw new Error("caida");
    });
    const res = await request(app).get("/api/fumigaciones").set(auth());
    expect(res.status).toBe(500);
  });
});

describe("GET /api/fumigaciones/inventario", () => {
  test("devuelve los productos", async () => {
    Producto.find.mockResolvedValue([{ nombre: "Fungicida X" }]);
    const res = await request(app).get("/api/fumigaciones/inventario").set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ nombre: "Fungicida X" }]);
  });

  test("responde 500 si la base falla", async () => {
    Producto.find.mockRejectedValue(new Error("caida"));
    const res = await request(app).get("/api/fumigaciones/inventario").set(auth());
    expect(res.status).toBe(500);
  });

  test("responde 401 sin token", async () => {
    const res = await request(app).get("/api/fumigaciones/inventario");
    expect(res.status).toBe(401);
  });
});