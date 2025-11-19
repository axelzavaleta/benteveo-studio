import express from "express"
import { AppDataSource } from "../config/database";
import { User } from "../entities/user.entity";
import * as bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(User);

export const getAllUsers = async (req: express.Request, res: express.Response) => {
  try {
    const users = await userRepository.find();
    
    if (users.length === 0) return res.status(404).json({ error: "USERS NOT FOUND" })
    
    res.status(200).json(users);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    }
  }

}

export const getUserById = async (req: express.Request, res: express.Response) => {
  const { userId } = req.params;

  try {
    const user = await userRepository.findOneBy({ userId: Number(userId) });
  
    if (!user) return res.status(404).json({ error: "USER NOT FOUND" })

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })    
    }
  }
}

export const createUser = async (req: express.Request, res: express.Response) => {
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
  
    await userRepository.save(user)

    const { userPassword: _, ...publicUserData } = user;

    res.status(201).json(publicUserData);
  } catch (error) {
    res.status(500).json({ error: "ERROR CREATING USER" })
  }
}

export const updateUser = async(req: express.Request, res: express.Response) => {
  const { userId } = req.params;
  const { userPassword, userEmail } = req.body;
  
  try {
    const currentUser = await userRepository.findOneBy({ userId: Number(userId) });

    if (!currentUser) return res.status(404).json({ error: "USER NOT FOUND" });

    if (userPassword && userPassword.length <= 4) {
      return res.status(400).json({ error: "PASSWORD MUST BE LONGER THAN 4 CHARACTERS" })
    }

    if (userEmail) {
      const existingUser = await userRepository.findOne({ where: { userEmail } });

      if (existingUser) return res.status(409).json({ error: "EMAIL ALREADY IN USE BY ANOTHER USER" });

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(userEmail)) {
        return res.status(400).json({ error: "INVALID EMAIL FORMAT" })
      }
    }

    if (userPassword) {
      const hashedUserPsw = await bcrypt.hash(userPassword, 10);
  
      req.body.userPassword = hashedUserPsw;
    }

    await userRepository.update({ userId: Number(userId) }, req.body);

    const updatedUser = await userRepository.findOneBy({ userId: Number(userId) });

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })    
    }
  }
}

export const removeUser = async (req: express.Request, res: express.Response) => {
  const { userId } = req.params;

  try {
    const userToRemove = await userRepository.findOneBy({ userId: Number(userId) });
    
    if (!userToRemove) return res.status(404).json({ error: "USER NOT FOUND" });
  
    await userRepository.remove(userToRemove);

    res.status(200).json(userToRemove);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })    
    }
  }
}

export const createUserByAdmin = async (req: express.Request, res: express.Response) => {
  const { userName, userEmail, userPassword, userPhoneNumber, userAvatarUrl, userRoleId, userStatusId } = req.body;

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
      userRoleId: userRoleId || 1,
      userStatusId: userStatusId || 1,
      userIsVerified: true,  // ← VERIFICACIÓN AUTOMÁTICA
      userVerificationToken: null  // ← SIN TOKEN DE VERIFICACIÓN
    });
  
    await userRepository.save(user);

    const { userPassword: _, ...publicUserData } = user;

    res.status(201).json({
      message: "Usuario creado exitosamente por administrador",
      user: publicUserData
    });
  } catch (error) {
    res.status(500).json({ error: "ERROR CREATING USER" })
  }
}