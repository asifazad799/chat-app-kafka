import { Schema, Types } from "mongoose";

export const MessageSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
  sender: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  batchId: { type: String, required: true },
  content: { type: String },
  roomId: { type: String, required: true },
});

export class Message {
  _id: Types.ObjectId;
  content: string;
  sender: string;
  timestamp: Date;
  batchId: string;
  roomId: string;
}

export type MessageDocument = Message & Document;
