import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { Request, Router, Response } from "express";
import { check, validationResult } from "express-validator";
import jwt, { VerifyErrors } from "jsonwebtoken";

import User, { IUser, UserRole } from "../../model/User";
import { isLoggedIn } from "../../middleware/middleware";

const router: Router = Router();

// Get Signed In User Details
router.get("/", isLoggedIn, async (req: Request, res: Response) => {
  try {
    const user: IUser = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Login User
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
              .json({ message: "Logged in successfully" });
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
          res
            .cookie("access_token", jwtToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
            })
            .json({ message: "Logged in successfully" });
        }
      );
    } catch (err) {
      res.status(500).json({ error: "Server Error" });
    }
  }
);

const signUpRequestValidation = [
  check("email", "Please include a valid email").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
  check("mobile", "Please enter a mobile with 10 digits").isMobilePhone(
    "en-IN"
  ),
  check("fullName", "Please enter your full name with 6 or more characters")
    .contains(" ")
    .isLength({ min: 6 }),
];

router.post(
  "/sign-up",
  ...signUpRequestValidation,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName, mobile } = req.body;
    try {
      const user: IUser = await User.findOne({ email });

      if (user) {
        return res.status(400).json({
          errors: [
            {
              msg: "User with this email already exists",
            },
          ],
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      const newUser: IUser = {
        _id: new Types.ObjectId(),
        fullName,
        email,
        password: hashed,
        mobile,
        role: UserRole.ADMIN,
      };

      const addedUser = await User.create(newUser);

      jwt.sign(
        { userId: addedUser._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION },
        (err, token) => {
          if (err) throw err;
          res
            .cookie("access_token", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
            })
            .status(200)
            .json({ message: "Logged in successfully" });
        }
      );
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

router.get("/logout", isLoggedIn, (req: Request, res: Response) => {
  return res
    .clearCookie("access_token")
    .json({ message: "Successfully logged out" });
});

export default router;
