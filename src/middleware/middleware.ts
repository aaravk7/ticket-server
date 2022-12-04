import { Request, Response, NextFunction } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { CallbackError } from "mongoose";
import User, { IUser, UserRole } from "../model/User";

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;

  if (!token) {
    if (!req.originalUrl.includes("api")) return res.redirect("/login");
    return res.status(401).json({ error: "No token, authorization denied" });
  }
  // Verify token
  try {
    jwt.verify(
      token,
      process.env.JWT_SECRET,
      (err: VerifyErrors, decoded: { userId: string }) => {
        if (err && req.originalUrl.includes("api"))
          return res
            .status(403)
            .clearCookie("access_token")
            .json({ error: err });
        else if (err) {
          return res.status(403).clearCookie("access_token").redirect("/login");
        } else {
          User.findById(
            decoded.userId,
            (error: CallbackError, foundUser: IUser) => {
              if (error) throw error;
              if (!foundUser)
                return res
                  .status(403)
                  .clearCookie("access_token")
                  .redirect("/login");
              req.user = foundUser;
              next();
            }
          );
        }
      }
    );
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role !== UserRole.ADMIN)
    res.status(403).json({ error: "Forbidden" });

  next();
};
