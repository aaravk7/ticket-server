import { Router, Request, Response } from "express";
import { FilterQuery, Types } from "mongoose";
import Event from "../../model/Event";
import { check, validationResult } from "express-validator";

import { isAdmin, isLoggedIn } from "../../middleware/middleware";
import Ticket, { ITicket } from "../../model/Ticket";

const router = Router({ mergeParams: true });

router.get(
  "/",
  isLoggedIn,
  isAdmin,
  check("eventId", "Invalid Event Id")
    .isString()
    .isLength({ min: 24, max: 24 }),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { eventId } = req.params;

    let filter: FilterQuery<ITicket> = {
      event: eventId,
    };

    Ticket.find(filter, (err: Error, tickets: ITicket[]) => {
      if (err) {
        res.status(500).json(err);
      } else {
        res.render("tickets", { tickets, eventId });
      }
    });
  }
);

router.get(
  "/add",
  isLoggedIn,
  isAdmin,
  check("eventId", "Invalid Event Id")
    .isString()
    .isLength({ min: 24, max: 24 }),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId } = req.params;
    res.render("add-ticket", { eventId });
  }
);

const addTicketValidation = [
  check("eventId", "Invalid Event Id")
    .isString()
    .isLength({ min: 24, max: 24 }),
  check("date", "Please enter a valid date").isISO8601().toDate(),
  check("description", "Please enter a valid description")
    .isString()
    .isLength({ min: 10 }),
  check("price", "Please enter a valid price").isNumeric(),
  check("totalQuantity", "Please enter a valid totalQuantity").isNumeric(),
];

router.post(
  "/add",
  isLoggedIn,
  isAdmin,
  ...addTicketValidation,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId } = req.params;
    const { date, description, price, totalQuantity } = req.body;

    try {
      const foundEvent = await Event.findById(eventId);
      if (!foundEvent)
        return res.status(400).json({ error: "Event does not exist" });

      if (foundEvent.endDate < date)
        return res.status(400).json({
          error: "Can not create an event ticket after end-date of the event.",
        });

      const newTicket: ITicket = {
        _id: new Types.ObjectId(),
        event: foundEvent._id,
        date,
        description,
        price,
        totalQuantity: totalQuantity,
        availableQuantity: totalQuantity,
      };

      await Ticket.create(newTicket);
      res.redirect(`/events/${eventId}/tickets`);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

export default router;
