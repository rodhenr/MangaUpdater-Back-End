import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

const handleRefreshToken = (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(406).json({ message: "Refresh Token expired" });
    } else {
      const { userEmail } = decoded;
      const accessToken = jwt.sign({ userEmail }, process.env.SECRET, {
        expiresIn: "10m",
      });

      const refreshToken = jwt.sign({ userEmail }, process.env.REFRESH_SECRET, {
        expiresIn: "15m",
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

module.exports = { handleRefreshToken };