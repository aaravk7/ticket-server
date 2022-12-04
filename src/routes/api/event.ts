import { Router, Request, Response } from "express";
import { FilterQuery } from "mongoose";
import Event, { IEvent } from "../../model/Event";
import { param } from "express-validator";

import { isLoggedIn } from "../../middleware/middleware";

const router = Router();

// All events route
router.get("/", isLoggedIn, async (req: Request, res: Response) => {
  const filter: FilterQuery<IEvent> = {
    published: true,
    endDate: { $gte: new Date(new Date().setHours(24, 0, 0, 0)) },
  };

  try {
    const events = await Event.find<IEvent>(filter).select("-description");
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Event details Route
router.get(
  "/:slug",
  isLoggedIn,
  param(["slug"]).isSlug(),
  async (req: Request, res: Response) => {
    const { slug } = req.params;

    try {
      const event = await Event.findOne<IEvent>({ slug });
      res.status(200).json({ event });
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

export default router;
