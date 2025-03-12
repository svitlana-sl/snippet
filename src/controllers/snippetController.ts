import { Request, Response } from "express";
import Snippet from "../models/Snippet";
import { Types } from "mongoose";
import { Buffer } from "buffer";

function encodeCode(code: string): string {
  return Buffer.from(code).toString("base64");
}

function decodeCode(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf-8");
}

// create snippet (POST /api/snippets)
export const createSnippet = async (req: Request, res: Response) => {
  try {
    const { title, code, language, tags, expiresIn } = req.body;
    if (!title || !code || !language) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const encodedCode = encodeCode(code);
    let expiresAt;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 1000);
    }
    const snippet = await Snippet.create({
      title,
      code: encodedCode,
      language,
      tags,
      expiresAt,
    });
    return res.status(201).json(snippet);
  } catch (error) {
    console.error("createSnippet error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// get all snippets (GET /api/snippets)
export const getAllSnippets = async (req: Request, res: Response) => {
  try {
    const {
      language,
      tags,
      page = 1,
      limit = 10,
      sort,
      order = "asc",
    } = req.query;
    const filter: any = {};

    if (language) {
      filter.language = { $regex: new RegExp(language as string, "i") };
    }
    if (tags) {
      const tagsArray = (tags as string).split(",").map((tag) => tag.trim());
      filter.tags = { $all: tagsArray.map((tag) => new RegExp(tag, "i")) };
    }
    // expired snippets set off
    filter.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ];
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    let sortObj: any = {};
    if (sort) {
      sortObj[sort as string] = order === "desc" ? -1 : 1;
    }
    const snippets = await Snippet.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .exec();
    const decodedSnippets = snippets.map((snippet) => ({
      ...snippet.toObject(),
      code: decodeCode(snippet.code),
    }));
    return res.json(decodedSnippets);
  } catch (error) {
    console.error("getAllSnippets error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// get snippet by ID (GET /api/snippets/:id)
export const getSnippetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const snippet = await Snippet.findById(id);
    if (!snippet) {
      return res.status(404).json({ error: "Snippet not found" });
    }
    if (snippet.expiresAt && snippet.expiresAt.getTime() < Date.now()) {
      return res.status(404).json({ error: "Snippet has expired" });
    }
    const decodedSnippet = {
      ...snippet.toObject(),
      code: decodeCode(snippet.code),
    };
    return res.json(decodedSnippet);
  } catch (error) {
    console.error("getSnippetById error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// updated snippet (PUT /api/snippets/:id)
export const updateSnippet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const { title, code, language, tags, expiresIn } = req.body;
    let encodedCode;
    if (code) {
      encodedCode = encodeCode(code);
    }
    let expiresAt;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 1000);
    }
    const updateData: any = {};
    if (title) updateData.title = title;
    if (encodedCode) updateData.code = encodedCode;
    if (language) updateData.language = language;
    if (tags) updateData.tags = tags;
    if (expiresAt) updateData.expiresAt = expiresAt;
    const snippet = await Snippet.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!snippet) {
      return res.status(404).json({ error: "Snippet not found" });
    }
    return res.json(snippet);
  } catch (error) {
    console.error("updateSnippet error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// delete snippet (DELETE /api/snippets/:id)
export const deleteSnippet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const snippet = await Snippet.findByIdAndDelete(id);
    if (!snippet) {
      return res.status(404).json({ error: "Snippet not found" });
    }
    return res.json({ message: "Snippet deleted successfully" });
  } catch (error) {
    console.error("deleteSnippet error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
