import { Schema, model, Types } from "mongoose";

export interface ITicket {
  _id: Types.ObjectId;
  event: Types.ObjectId;
  date: Date;
  description: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
}

const ticketSchema = new Schema<ITicket>({
  _id: { type: Schema.Types.ObjectId, required: true },
  event: { type: Schema.Types.ObjectId, required: true, ref: "Event" },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  totalQuantity: { type: Number, required: true },
  availableQuantity: { type: Number, required: true },
});

const Ticket = model<ITicket>("Ticket", ticketSchema);
export default Ticket;
