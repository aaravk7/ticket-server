import { Router, Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { check } from "express-validator";

import { isLoggedIn } from "../../middleware/middleware";
import Ticket, { ITicket } from "../../model/Ticket";

const router = Router();

router.get(
  "/",
  isLoggedIn,
  check("eventId", "Invalid Event Id")
    .isString()
    .isLength({ min: 24, max: 24 }),
  (req: Request, res: Response) => {
    const { eventId } = req.params;

    let filter: FilterQuery<ITicket> = {
      event: eventId,
      date: { $gt: new Date(new Date().setHours(24, 0, 0, 0)) },
    };

    Ticket.find(filter, (err: Error, tickets: ITicket[]) => {
      if (err) {
        res.status(500).json(err);
      } else {
        res.status(200).json({ tickets });
      }
    });
  }
);

export default router;
