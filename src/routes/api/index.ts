import { Router, Request, Response } from "express";
import events from "./event";
import order from "./order";
import ticket from "./ticket";
import auth from "./auth";

const router = Router();

router.use("/", auth);
router.use("/events", events);
router.use("/events/:eventId/tickets", ticket);
router.use("/", order);

export default router;
