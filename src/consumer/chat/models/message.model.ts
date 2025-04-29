import { Schema, Types } from "mongoose";

export const MessageSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() }, // optional: generate manually  content: { type: String, required: true },
  sender: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  batchId: { type: String, required: true },
  content: { type: String },
});

export class Message {
  _id: Types.ObjectId;
  content: string;
  sender: string;
  timestamp: Date;
  batchId: string;
}

export type MessageDocument = Message & Document;
