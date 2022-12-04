import { Router, Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { check } from "express-validator";

import { isLoggedIn } from "../../middleware/middleware";
import Ticket, { ITicket } from "../../model/Ticket";
import Event from "../../model/Event";

const router = Router({ mergeParams: true });

router.get(
  "/",
  isLoggedIn,
  check("eventSlug", "Invalid Event Slug").isSlug(),
  async (req: Request, res: Response) => {
    const { eventSlug } = req.params;

    const event = await Event.findOne({ slug: eventSlug });
    if (!event) {
      return res.status(400).json({ error: "Event does not exist" });
    }

    let filter: FilterQuery<ITicket> = {
      event: event._id,
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
