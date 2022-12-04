import { Router, Request, Response } from "express";
import { FilterQuery } from "mongoose";
import Event, { IEvent } from "../../model/Event";
import { param } from "express-validator";

import { isLoggedIn } from "../../middleware/middleware";

const router = Router();

// All events route
router.get("/", isLoggedIn, (req: Request, res: Response) => {
  const filter: FilterQuery<IEvent> = {
    published: true,
    endDate: { $lte: new Date() },
  };

  Event.find(filter, (err: Error, events: IEvent[]) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.status(200).json({ events });
    }
  });
});

// Event details Route
router.get(
  "/:_id",
  isLoggedIn,
  param(["_id"]).isLength({ max: 24, min: 24 }).withMessage("Invalid _id"),
  (req: Request, res: Response) => {
    const { _id } = req.params;

    Event.findOne({ _id }, (err: Error, event: IEvent) => {
      if (err) {
        res.status(500).json(err);
      } else {
        res.status(200).json({ event });
      }
    });
  }
);

export default router;
