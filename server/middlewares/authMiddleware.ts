import express from "express";
import bcrypt from "bcryptjs";
import auth from "basic-auth";
import UserModel from "../models/User";

const authMiddleware = async () => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<unknown> => {
    const authentication = auth(req);

    const unauthorized = () => {
      const challengeString = 'Basic realm="Polkadot Scanner"';

      res.set("WWW-Authenticate", challengeString);

      return res.status(401).send("Invalid username/password");
    };

    if (!authentication) return unauthorized();

    const username = authentication.name;
    const password = authentication.pass;

    const user = await UserModel.findOne({ username }).exec();
    if (!user) return unauthorized();

    const isValidLogin = await bcrypt.compare(password, user.password);

    if (isValidLogin) {
      req.user = {
        username: user.username,
        role: user.role,
      };
      return next();
    }

    return unauthorized();
  };
};

export default authMiddleware;
