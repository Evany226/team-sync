import express from "express";

import {
  getAllUnreadMessages,
  getUnreadMessages,
  updateLastViewed,
} from "../controllers/unreadMsgController";

import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const unreadMsgRouter = express.Router();

unreadMsgRouter.get(
  "/:conversationId",
  ClerkExpressRequireAuth({}),
  getUnreadMessages
);
unreadMsgRouter.get("/", getAllUnreadMessages);
unreadMsgRouter.put(
  "/updateLastViewed",
  ClerkExpressRequireAuth({}),
  updateLastViewed
);

export default unreadMsgRouter;