import { Schema, model, Types } from "mongoose";

export enum OrderStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export interface IOrder {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  event: Types.ObjectId;
  ticket: Types.ObjectId;
  totalPrice: number;
  status: OrderStatus;
}

const orderSchema = new Schema<IOrder>({
  _id: { type: Schema.Types.ObjectId, required: true },
  owner: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  event: { type: Schema.Types.ObjectId, required: true, ref: "Event" },
  ticket: { type: Schema.Types.ObjectId, required: true, ref: "Ticket" },
  totalPrice: { type: Number, required: true },
  status: { type: String, required: true, enum: OrderStatus },
});

const Order = model<IOrder>("Order", orderSchema);
export default Order;
