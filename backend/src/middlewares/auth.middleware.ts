import express from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

const secretKey = process.env.SECRET_KEY;

export const authMiddleware = (
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ error: "NO TOKEN PROVIDED" })
  }
  
  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(500).json({ error: "TOKEN NOT FOUND" });
  }

  if (!secretKey) {
    return res.status(500).json({ error: "SECRET KEY NOT FOUND" })
  }

  try {
    const decodedToken = jwt.verify(token, secretKey);
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      console.log({ error: error.message });
      return res.status(401).json({ error: "INVALID OR EXPIRED TOKEN" });
    }
  }
}