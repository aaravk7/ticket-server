import { Router, Request, Response } from "express";
import { FilterQuery } from "mongoose";
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
  (req: Request, res: Response) => {
    const { ticketId } = req.params;
    const filter: FilterQuery<IOrder> = {
      ticket: ticketId,
    };

    Order.find(filter, (err: Error, orders: IOrder[]) => {
      if (err) {
        res.status(500).json(err);
      } else {
        res.render("orders", { orders });
      }
    });
  }
);

export default router;
