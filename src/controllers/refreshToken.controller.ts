import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import "dotenv/config";

const secret = process.env.SECRET ?? "secret";
const refreshSecret = process.env.REFRESH_SECRET ?? "secret";

const refreshToken = (req: Request, res: Response) => {
  if (!process.env.REFRESH_SECRET || !process.env.SECRET)
    return res.status(500).send("Erro no servidor.");

  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });

  jwt.verify(refreshToken, secret, (err: any, decoded: any) => {
    if (err) {
      return res.status(406).json({ message: "Refresh Token expired" });
    } else {
      const { userEmail } = decoded;
      const accessToken = jwt.sign({ userEmail }, secret, {
        expiresIn: 10 * 60,
      });

      const refreshToken = jwt.sign({ userEmail }, refreshSecret, {
        expiresIn: 15 * 60,
      });

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.json({ accessToken });
    }
  });
};

export { refreshToken };
