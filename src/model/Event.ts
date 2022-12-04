import { Schema, model, Types } from "mongoose";

export interface IEvent {
  _id: Types.ObjectId;
  slug: string;
  name: string;
  description: string;
  poster: string;
  startDate: Date;
  endDate: Date;
  published: boolean;
}

const eventSchema = new Schema<IEvent>({
  _id: { type: Schema.Types.ObjectId, required: true },
  slug: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  poster: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  published: { type: Boolean, required: true },
});

const Event = model<IEvent>("Event", eventSchema);
export default Event;
