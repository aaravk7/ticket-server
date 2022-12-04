import { Router, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { Types } from "mongoose";
import { UploadedFile } from "express-fileupload";

import { isAdmin, isLoggedIn } from "../../middleware/middleware";
import Event, { IEvent } from "../../model/Event";
import path from "path";
import { cwd } from "process";

const router: Router = Router();

router.get("/", isLoggedIn, isAdmin, (req: Request, res: Response) => {
  Event.find({}, (err: Error, events: IEvent[]) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.render("events", { events });
    }
  });
});

const validateUpdateStatusReq = [
  param(["_id"]).isLength({ max: 24, min: 24 }).withMessage("Invalid _id"),
];

router.post(
  "/:_id/changeStatus",
  isLoggedIn,
  isAdmin,
  ...validateUpdateStatusReq,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { _id } = req.params;

    const foundEvent = await Event.findOne({ _id });
    if (!foundEvent)
      return res
        .status(405)
        .json({ error: "Event with this _id does not exist" });

    const updatedEvent = await Event.findByIdAndUpdate(
      _id,
      {
        $set: { published: !foundEvent.published },
      },
      { returnDocument: "after" }
    );

    if (!updatedEvent) return res.status(500).json({ error: "INTERNAL_ERROR" });
    return res.redirect("/");
  }
);

router.get("/add", (req: Request, res: Response) => {
  res.render("add-event");
});

const validateAddEventBody = [
  body(["name"])
    .isString()
    .withMessage("Name must be of type string.")
    .isLength({ min: 5 })
    .withMessage("Name must be of min length 5."),
  body(["slug"])
    .isSlug()
    .withMessage("Slug must be of type slug.")
    .isLength({ min: 5 })
    .withMessage("Slug must be of min length 5."),
  body(["description"])
    .isString()
    .withMessage("Description must be of type string")
    .isLength({ min: 10 })
    .withMessage("Description must be of min length 10."),
  body("startDate")
    .isISO8601()
    .toDate()
    .withMessage("startDate must be of type Date"),
  body("endDate")
    .isISO8601()
    .toDate()
    .withMessage("endDate must be of type Date"),
];

// New event route
router.post(
  "/add",
  isLoggedIn,
  isAdmin,
  ...validateAddEventBody,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (Object.keys(req.files).length !== 1)
      return res
        .status(400)
        .json({ error: "Please attach a single poster image" });
    const poster = req.files.poster as UploadedFile;
    if (poster.mimetype !== "image/jpeg" && poster.mimetype !== "image/png")
      return res
        .status(400)
        .json({ error: "Poster can only be a jpeg or png image" });

    console.log({ poster });
    const posterName = path.join(
      cwd(),
      "dist/public/posters",
      Date.now().toString() + "." + poster.name.replace(" ", "").at(-1)
    );
    try {
      await poster.mv(posterName);
      const { slug, name, description, startDate, endDate } = req.body;

      const foundEvent = await Event.findOne({ slug });
      if (foundEvent)
        return res
          .status(405)
          .json({ error: "Event with this slug already exists" });

      const newEvent: IEvent = {
        _id: new Types.ObjectId(),
        name,
        slug,
        description,
        poster: posterName.split("public")[1],
        startDate,
        endDate,
        published: false,
      };

      await Event.create(newEvent);
      return res.redirect("/events");
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

export default router;
