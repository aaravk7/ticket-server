import { Schema, model, Types } from "mongoose";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface IUser {
  _id: Types.ObjectId;
  mobile: number;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

const userSchema = new Schema<IUser>({
  _id: { type: Schema.Types.ObjectId, required: true },
  mobile: { type: Number, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: UserRole, default: UserRole.USER },
});

const User = model<IUser>("User", userSchema);
export default User;
