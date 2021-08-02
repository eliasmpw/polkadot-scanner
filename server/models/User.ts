import { Schema, model } from "mongoose";

interface User {
  username: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const UserSchema = new Schema<User>(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "regular",
      enum: ["regular", "admin"],
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = model<User>("User", UserSchema);

export default UserModel;
