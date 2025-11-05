import express from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/user.entity";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

const userRepository = AppDataSource.getRepository(User);
const secretKey = process.env.SECRET_KEY;

export const registerUser = async (req: express.Request, res: express.Response) => {
  const { userName, userEmail, userPassword, userPhoneNumber, userAvatarUrl } = req.body;

  if (!userName || !userEmail || !userPassword) {
    return res.status(400).json({ error: "REQUIRED FIELDS ARE INCOMPLETE" })
  }

  if (userPassword.length <= 4) {
    return res.status(400).json({ error: "PASSWORD MUST BE LONGER THAN 4 CHARACTERS" })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(userEmail)) {
    return res.status(400).json({ error: "INVALID EMAIL FORMAT" })
  }

  try {
    const existingUser = await userRepository.findOne({ where: { userEmail } });
    if (existingUser) return res.status(409).json({ error: "USER WITH EXISTING EMAIL ADDRESS" });

    const hashedUserPsw = await bcrypt.hash(userPassword, 10);

    const user = userRepository.create({
      userName,
      userEmail,
      userPassword: hashedUserPsw,
      userPhoneNumber,
      userAvatarUrl,
    });
  
    await userRepository.save(user);

    if (!secretKey) {
      return res.status(500).json({ error: "SECRET KEY NOT FOUND" })
    }

    const token = jwt.sign(
      { userId: user.userId, userName: user.userName, userEmail: user.userEmail }, 
      secretKey, 
      { expiresIn: "1h" }
    );

    const { userPassword: _, ...userPublicData } = user;

    res.status(201).json({ userPublicData, token });
  } catch (error) {
    res.status(500).json({ error: "ERROR CREATING USER" })
  }
}

export const userLogin = async (req: express.Request, res: express.Response) => {
  const { userEmail, userPassword } = req.body;
  
  if (!userEmail || !userPassword) {
    return res.status(400).json({ error: "REQUIRED FIELDS ARE INCOMPLETE" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(userEmail)) {
    return res.status(400).json({ error: "INVALID EMAIL FORMAT" })
  }

  try {
    const registeredUser = await userRepository.findOneBy({ userEmail });
    if (!registeredUser) return res.status(404).json({ error: "USER NOT FOUND" });

    const isValid = await bcrypt.compare(userPassword, registeredUser.userPassword);
    if (!isValid) {
      return res.status(400).json({ error: "INVALID PASSWORD" })
    }

    const { userPassword: _, ...publicUserData } = registeredUser;

    if (!secretKey) {
      return res.status(500).json({ error: "SECRET KEY NOT FOUND" })
    }

    const token = jwt.sign(
      { userId: registeredUser.userId, userName: registeredUser.userName, userEmail: registeredUser.userEmail }, 
      secretKey, 
      { expiresIn: "1h" }
    );

    res.status(200).json({ publicUserData, token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
}