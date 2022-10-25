import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import "dotenv/config";

// Verifica a autenticidade do JWT
const verifyToken = (req: Request | any, res: Response, next: NextFunction) => {
  if (!process.env.REFRESH_SECRET || !process.env.SECRET)
    return res.status(500).send("Erro no servidor.");

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send("Nenhum token encontrado.");

  if (!authHeader.startsWith("Bearer "))
    return res.status(401).send("Nenhum token encontrado.");

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.SECRET, (err: any, decoded: any) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Falha ao autenticar o token.", err });

    req.userEmail = decoded.userEmail;
    next();
  });
};

export default verifyToken;
