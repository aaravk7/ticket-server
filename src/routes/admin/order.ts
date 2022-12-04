import { Router, Request, Response } from "express";
import { FilterQuery, Types } from "mongoose";
import { check } from "express-validator";

import { isAdmin, isLoggedIn } from "../../middleware/middleware";
import Order, { IOrder } from "../../model/Order";

const router = Router({ mergeParams: true });

router.get(
  "/",
  isLoggedIn,
  isAdmin,
  check("ticketId", "Invalid Ticket Id")
    .isString()
    .isLength({ min: 24, max: 24 }),
  async (req: Request, res: Response) => {
    const { ticketId } = req.params;

    try {
      const orders = await Order.aggregate([
        { $match: { ticket: new Types.ObjectId(ticketId) } },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            totalPrice: 1,
            status: 1,
            user: {
              fullName: 1,
            },
          },
        },
      ]);
      console.log(orders);
      res.render("orders", { orders });
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

export default router;
