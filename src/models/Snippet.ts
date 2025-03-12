import { Schema, model, Document } from "mongoose";

export interface ISnippet extends Document {
  title: string;
  code: string; //saved in base64
  language: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date; // date when snippet expires
}

const snippetSchema = new Schema<ISnippet>(
  {
    title: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    tags: [{ type: String }],
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default model<ISnippet>("Snippet", snippetSchema);
