import express from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/user.entity";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import "dotenv/config";

const userRepository = AppDataSource.getRepository(User);
const secretKey = process.env.SECRET_KEY;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (email: string, token: string) => {

  
  const verificationUrl = `${process.env.BACKEND_URL}/auth/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: `"Benteveo Studio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Confirmá tu cuenta · Benteveo Studio",
      html: `
      <div style="background-color:#040116; padding:40px 0; font-family:Arial, sans-serif;">
        <div style="max-width:600px; margin:auto; background:#080E28; border-radius:12px; overflow:hidden; padding:40px; color:white;">
          <h1 style="text-align:center; font-size:26px; margin-bottom:20px; color:#8EA6FF;">
            ¡Bienvenido a Benteveo Studio!
          </h1>

          <p style="font-size:16px; line-height:1.6;">
            Gracias por registrarte en nuestra plataforma. Para activar tu cuenta, solo tenés que verificar tu dirección de email haciendo clic en el botón de abajo.
          </p>

          <div style="text-align:center; margin:35px 0;">
            <a href="${verificationUrl}"
              style="background:#667EEA; padding:14px 35px; color:white; text-decoration:none; border-radius:8px; font-size:16px; display:inline-block;">
              Verificar mi cuenta
            </a>
          </div>

          <p style="font-size:14px; opacity:0.8; text-align:center;">
            Este enlace expirará en <strong>24 horas</strong>.
          </p>

          <p style="font-size:12px; opacity:0.6; margin-top:30px; text-align:center;">
            Si no creaste esta cuenta, simplemente ignorá este mensaje.
          </p>
        </div>
      </div>
      `,
    });
  } catch (error) {
    console.log("Error al enviar el email", error);
  }
};
  
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

    if (!secretKey) {
      return res.status(500).json({ error: "SECRET KEY NOT FOUND" });
    }

    const verificationToken = jwt.sign(
      { email: userEmail },
      secretKey,
      { expiresIn: "24h" }
    );

    const hashedUserPsw = await bcrypt.hash(userPassword, 10);

    const user = userRepository.create({
      userName,
      userEmail,
      userPassword: hashedUserPsw,
      userPhoneNumber,
      userAvatarUrl,
      userRoleId: 1,
      userStatusId: 1,
      userIsVerified: false,
      userVerificationToken: verificationToken
    });
  
    await userRepository.save(user);

    sendVerificationEmail(userEmail, verificationToken);

    res.status(201).json({ 
      message: "Registro exitoso. Verifica tu email para iniciar sesion", 
      email: userEmail 
    });
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

    if (!registeredUser?.userIsVerified) {
      return res.status(403).json({ error: "EMAIL NOT VERIFIED" })
    }

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

    registeredUser.userLastLogin = new Date();
    userRepository.save(registeredUser);
    const { 
      userPassword: _,
      userPhoneNumber,
      userStatusId,
      userRoleId,
      userCreatedAt, 
      userUpdatedAt, 
      userLastLogin,
      ...publicUserData 
    } = userWithRelations;

    res.status(200).json({ publicUserData, token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const verifyEmail = async (req: express.Request, res: express.Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "TOKEN NOT PROVIDED" });
  }

  if (!secretKey) {
    return res.status(500).json({ error: "SECRET KEY NOT FOUND" });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    const { email } = decoded;

    const user = await userRepository.findOne({
      where: {
        userEmail: email,
        userVerificationToken: token
      }
    });

    if (!user) {
      return res.status(404).json({ error: "INVALID TOKEN OR USER NOT FOUND" });
    }

    if (user?.userIsVerified) {
      return res.status(404).json({ error: "EMAIL ALREADY VERIFIED" });
      // res.redirect(`${process.env.FRONTEND_URL}/auth/verification-success.html`)
    }
    
    user.userIsVerified = true;
    user.userVerificationToken = null;
    await userRepository.save(user);

    res.redirect(`${process.env.FRONTEND_URL}/src/pages/auth/verification-success.html`)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error verificando email:", error.message);
      res.status(500).json({ error: "ERROR VERIFYING EMAIL" });
    }
  }
} 