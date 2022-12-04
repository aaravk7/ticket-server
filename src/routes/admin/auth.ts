import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { check, validationResult } from "express-validator";
import jwt, { VerifyErrors } from "jsonwebtoken";

import User, { IUser, UserRole } from "../../model/User";
import { isLoggedIn } from "../../middleware/middleware";

const router: Router = Router();

router.get("/login", (req: Request, res: Response) => {
  const token = req.cookies.access_token;
  if (token) {
    jwt.verify(
      token,
      process.env.JWT_SECRET,
      (err: VerifyErrors, decoded: { userId: string }) => {
        if (!err && decoded.userId) {
          User.findById(decoded.userId).then((foundUser) => {
            if (foundUser.role !== UserRole.ADMIN) {
              return res.clearCookie("access_token").render("login");
            } else {
              return res.redirect("/");
            }
          });
        }
      }
    );
  } else {
    res.render("login");
  }
});

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req: Request, res: Response) => {
    const token = req.cookies.access_token;

    if (token) {
      jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err: VerifyErrors, decoded: { userId: string }) => {
          if (!err && decoded.userId)
            return res
              .cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
              })
              .redirect("/");
        }
      );
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user: IUser = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({
          errors: [
            {
              msg: "Invalid Credentials",
            },
          ],
        });
      }

      if (user.role !== UserRole.ADMIN) {
        return res.status(403).json({
          errors: [
            {
              msg: "Unauthorized",
            },
          ],
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          errors: [
            {
              msg: "Invalid Credentials",
            },
          ],
        });
      }

      jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION },
        (err, jwtToken) => {
          if (err) throw err;
          return res
            .cookie("access_token", jwtToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
            })
            .redirect("/");
        }
      );
    } catch (err) {
      res.status(500).json({ error: "Server Error" });
    }
  }
);

router.get("/logout", isLoggedIn, (req: Request, res: Response) => {
  return res.clearCookie("access_token").redirect("/login");
});

export default router;
