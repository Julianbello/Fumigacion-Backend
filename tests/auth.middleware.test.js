const jwt = require("jsonwebtoken");
const { verificarToken, requiereRol } = require("../src/middleware/auth.middleware");

const SECRET = "secreto-de-prueba";

function crearRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("verificarToken", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = SECRET;
  });

  test("responde 401 si no viene el header Authorization", () => {
    const req = { headers: {} };
    const res = crearRes();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token requerido" });
    expect(next).not.toHaveBeenCalled();
  });

  test("responde 401 si el token es inválido", () => {
    const req = { headers: { authorization: "Bearer token-falso" } };
    const res = crearRes();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido o expirado" });
    expect(next).not.toHaveBeenCalled();
  });

  test("responde 401 si el token fue firmado con otro secreto", () => {
    const token = jwt.sign({ id: 1, role: "ADMIN" }, "otro-secreto");
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = crearRes();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("responde 401 si el token está expirado", () => {
    const token = jwt.sign({ id: 1, role: "ADMIN" }, SECRET, { expiresIn: -10 });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = crearRes();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("con un token válido guarda el usuario en req y llama a next", () => {
    const token = jwt.sign({ id: 7, role: "OPERARIO" }, SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = crearRes();
    const next = jest.fn();

    verificarToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.usuario).toMatchObject({ id: 7, role: "OPERARIO" });
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("requiereRol", () => {
  test("permite el paso si el rol está en la lista", () => {
    const req = { usuario: { role: "ADMIN" } };
    const res = crearRes();
    const next = jest.fn();

    requiereRol("ADMIN", "SUPERVISOR")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("responde 403 si el rol no está permitido", () => {
    const req = { usuario: { role: "OPERARIO" } };
    const res = crearRes();
    const next = jest.fn();

    requiereRol("ADMIN")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "No autorizado para este recurso" });
    expect(next).not.toHaveBeenCalled();
  });
});