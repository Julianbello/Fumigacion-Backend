jest.mock("../src/services/producto.service", () => ({
  listarTipos: jest.fn(),
  crearTipo: jest.fn(),
  crearProducto: jest.fn(),
}));

const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const servicio = require("../src/services/producto.service");
const productoRoutes = require("../src/routes/producto.routes");

const app = express();
app.use(express.json());
app.use("/api/productos", productoRoutes);

const tokenDe = (role) => jwt.sign({ id: "u1", username: "julian", role }, process.env.JWT_SECRET);

beforeEach(() => {
  process.env.JWT_SECRET = "secreto-de-prueba";
  jest.clearAllMocks();
});

describe("GET /api/productos/tipos", () => {
  test("responde 401 sin token", async () => {
    const res = await request(app).get("/api/productos/tipos");
    expect(res.status).toBe(401);
  });

  test("devuelve la lista de tipos", async () => {
    servicio.listarTipos.mockResolvedValue(["polvoso", "trips"]);
    const res = await request(app).get("/api/productos/tipos").set("Authorization", `Bearer ${tokenDe("OPERARIO")}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(["polvoso", "trips"]);
  });

  test("responde 500 genérico si el servicio falla", async () => {
    servicio.listarTipos.mockRejectedValue(new Error("detalle interno"));
    const res = await request(app).get("/api/productos/tipos").set("Authorization", `Bearer ${tokenDe("ADMIN")}`);
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("detalle interno");
  });
});

describe("POST /api/productos/tipos", () => {
  test("responde 401 sin token", async () => {
    const res = await request(app).post("/api/productos/tipos").send({ nombre: "nuevo" });
    expect(res.status).toBe(401);
  });

  test("crea el tipo y responde 201", async () => {
    servicio.crearTipo.mockResolvedValue({ nombre: "nuevo" });
    const res = await request(app)
      .post("/api/productos/tipos")
      .set("Authorization", `Bearer ${tokenDe("OPERARIO")}`)
      .send({ nombre: "Nuevo" });
    expect(res.status).toBe(201);
    expect(servicio.crearTipo).toHaveBeenCalledWith("Nuevo");
  });

  test("traduce el error del servicio a su código HTTP", async () => {
    const error = Object.assign(new Error("Ese tipo de producto ya existe"), { status: 409 });
    servicio.crearTipo.mockRejectedValue(error);
    const res = await request(app)
      .post("/api/productos/tipos")
      .set("Authorization", `Bearer ${tokenDe("ADMIN")}`)
      .send({ nombre: "polvoso" });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Ese tipo de producto ya existe");
  });

  test("no revienta si no llega cuerpo", async () => {
    const error = Object.assign(new Error("nombre inválido"), { status: 400 });
    servicio.crearTipo.mockRejectedValue(error);
    const res = await request(app).post("/api/productos/tipos").set("Authorization", `Bearer ${tokenDe("ADMIN")}`);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/productos", () => {
  const cuerpo = { nombre: "Fungicida Z", categoria: "polvoso", dosisMlPorLitro: 4, stockLitros: 10 };

  test("responde 401 sin token", async () => {
    const res = await request(app).post("/api/productos").send(cuerpo);
    expect(res.status).toBe(401);
  });

  test("responde 403 con un rol desconocido", async () => {
    const res = await request(app)
      .post("/api/productos")
      .set("Authorization", `Bearer ${tokenDe("VISITANTE")}`)
      .send(cuerpo);
    expect(res.status).toBe(403);
    expect(servicio.crearProducto).not.toHaveBeenCalled();
  });

  test.each(["ADMIN", "OPERARIO"])("crea el producto con rol %s", async (role) => {
    servicio.crearProducto.mockResolvedValue({ _id: "p1", ...cuerpo });
    const res = await request(app)
      .post("/api/productos")
      .set("Authorization", `Bearer ${tokenDe(role)}`)
      .send(cuerpo);
    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe("Fungicida Z");
    expect(servicio.crearProducto).toHaveBeenCalledWith(cuerpo);
  });

  test("responde 400 con el mensaje de validación del servicio", async () => {
    const error = Object.assign(new Error("La dosis debe ser un número mayor que 0"), { status: 400 });
    servicio.crearProducto.mockRejectedValue(error);
    const res = await request(app)
      .post("/api/productos")
      .set("Authorization", `Bearer ${tokenDe("ADMIN")}`)
      .send({ ...cuerpo, dosisMlPorLitro: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/dosis/);
  });
});