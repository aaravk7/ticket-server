import { IUser } from "../../src/model/User";

declare global {
  namespace Express {
    export interface Request {
      user?: IUser;
    }
  }
}
