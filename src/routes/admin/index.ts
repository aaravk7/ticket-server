import { Router, Request, Response } from "express";

import auth from "./auth";
import event from "./event";
import ticket from "./ticket";
import order from "./order";

const router = Router();

router.get("/", (req: Request, res: Response) => res.redirect("/events"));
router.use("/", auth);
router.use("/events", event);
router.use("/events/:eventId/tickets", ticket);
router.use("/events/:eventId/tickets/:ticketId/orders", order);

export default router;
