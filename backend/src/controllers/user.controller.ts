import express from "express"
import { AppDataSource } from "../config/database";
import { User } from "../entities/user.entity";
import * as bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(User);

export const getAllUsers = async (req: express.Request, res: express.Response) => {
  try {
    const users = await userRepository.find();
    
    if (users.length === 0) return res.status(200).json({ error: "THERE ARE NO USERS" })
    
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
  
    await userRepository.save(user)

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "ERROR CREATING USER" })
  }
}

export const updateUser = async(req: express.Request, res: express.Response) => {
  const { userId } = req.params;
  const { userPassword } = req.body;

  if (userPassword.length <= 4) {
    return res.status(400).json({ error: "PASSWORD MUST BE LONGER THAN 4 CHARACTERS" })
  }

  try {
    const hashedUserPsw = await bcrypt.hash(userPassword, 10);

    req.body.userPassword = hashedUserPsw;
    
    const updatedUser = await userRepository.update({ userId: Number(userId) }, req.body);

    if (updatedUser.affected === 0) return res.status(404).json({ error: "USER NOT FOUND" });



    const user = await userRepository.findOneBy({ userId: Number(userId) });

    res.status(200).json(user);
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