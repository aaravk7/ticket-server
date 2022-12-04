import { Router, Request, Response } from "express";
import { FilterQuery, Types } from "mongoose";
import Event from "../../model/Event";
import { check, validationResult } from "express-validator";

import { isAdmin, isLoggedIn } from "../../middleware/middleware";
import { UserRole } from "../../model/User";
import Ticket from "../../model/Ticket";
import Order, { IOrder, OrderStatus } from "../../model/Order";

const router = Router();

router.get(
  "/orders/:orderId",
  isLoggedIn,
  check("orderId", "Invalid Order Id")
    .isString()
    .isLength({ min: 24, max: 24 }),
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    try {
      const order = await Order.findById(orderId);
      if (order.owner !== req.user._id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      return res.json({ order });
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

const addOrderValidation = [
  check("ticketId", "Invalid ticket Id")
    .isString()
    .isLength({ min: 24, max: 24 }),
  check("totalPrice", "Invalid total price").isNumeric(),
];
router.post(
  "/tickets/:ticketId/order",
  isLoggedIn,
  ...addOrderValidation,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ticketId } = req.params;
    const { totalPrice } = req.body;

    try {
      const foundTicket = await Ticket.findById(ticketId);
      if (!foundTicket)
        return res.status(400).json({ error: "Ticket does not exist" });

      if (foundTicket.date < new Date(new Date().setHours(24, 0, 0, 0)))
        return res.status(400).json({
          error:
            "Can't book reservation for an event that has already happened",
        });

      const foundEvent = await Event.findById(foundTicket.event);
      if (!foundEvent)
        return res.status(400).json({ error: "Event does not exist" });

      const totalTickets = totalPrice / foundTicket.price;
      if (totalTickets > foundTicket.availableQuantity)
        return res.status(400).json({
          error: "Required ticket quantity greater than available quantity",
        });

      const newOrder: IOrder = {
        _id: new Types.ObjectId(),
        event: foundEvent._id,
        owner: req.user._id,
        ticket: foundTicket._id,
        totalPrice,
        status: OrderStatus.CONFIRMED,
      };

      const addedOrder = await Order.create(newOrder);
      await Ticket.findByIdAndUpdate(foundTicket._id, {
        $set: {
          availableQuantity: foundTicket.availableQuantity - totalTickets,
        },
      });

      res.json({ order: addedOrder });
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

export default router;
