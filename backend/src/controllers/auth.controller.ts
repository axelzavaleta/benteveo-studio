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
      userRoleId: 1,
      userStatusId: 1
    });
  
    await userRepository.save(user);

    if (!secretKey) {
      return res.status(500).json({ error: "SECRET KEY NOT FOUND" })
    }

    const userWithRelations = await userRepository.findOne({
      where: { userId: user.userId },
      relations: ['userRole', 'userStatus']
    });

    if (!userWithRelations) {
      return res.status(500).json({ error: "ERROR LOADING USER" });
    }

    const token = jwt.sign(
      { 
        userId: user.userId, 
        userName: user.userName, 
        userEmail: user.userEmail, 
        userRole: userWithRelations.userRole?.userRoleName,
        userStatus: userWithRelations.userStatus?.userStatusName
      }, 
      secretKey, 
      { expiresIn: "1h" }
    );

    const { 
      userPassword: _, 
      userCreatedAt, 
      userUpdatedAt, 
      userLastLogin, 
      ...publicUserData 
    } = user;

    res.status(201).json({ publicUserData, token });
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

    if (!secretKey) {
      return res.status(500).json({ error: "SECRET KEY NOT FOUND" })
    }

    const userWithRelations = await userRepository.findOne({
      where: { userId: registeredUser.userId },
      relations: ["userRole", "userStatus"]
    });

    if (!userWithRelations) {
      return res.status(500).json({ error: "ERROR LOADING USER" })
    }

    if (userWithRelations.userStatus?.userStatusName !== "activo") {
      return res.status(403).json({ error: "USER INACTIVE" });
    }

    const token = jwt.sign(
      { 
        userId: registeredUser.userId, 
        userName: registeredUser.userName, 
        userEmail: registeredUser.userEmail, 
        userRole: userWithRelations.userRole?.userRoleName,
        userStatus: userWithRelations.userStatus?.userStatusName
      }, 
      secretKey, 
      { expiresIn: "1h" }
    );

    const { userPassword: _, ...publicUserData } = registeredUser;

    res.status(200).json({ publicUserData, token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
}