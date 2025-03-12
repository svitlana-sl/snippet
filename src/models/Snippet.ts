import { Schema, model, Document } from "mongoose";

export interface IVersion {
  code: string;
  updatedAt: Date;
}

export interface ISnippet extends Document {
  title: string;
  code: string;
  language: string;
  tags: string[];
  expiresAt?: Date;
  versions?: IVersion[];
  createdAt: Date;
  updatedAt: Date;
}

const snippetSchema = new Schema<ISnippet>(
  {
    title: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    tags: [{ type: String }],
    expiresAt: { type: Date },
    versions: [
      {
        code: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default model<ISnippet>("Snippet", snippetSchema);
