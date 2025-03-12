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
export const createSnippet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, code, language, tags, expiresIn } = req.body;
    if (!title || !code || !language) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    // Ensure that the code is encoded in base64 to avoid issues with double quotes etc.
    const encodedCode = encodeCode(code);
    console.log("Encoded code:", encodedCode);

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

    res.status(201).json(snippet);
    return;
  } catch (error) {
    console.error("createSnippet error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// get all snippets (GET /api/snippets)
export const getAllSnippets = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    res.json(decodedSnippets);
    return;
  } catch (error) {
    console.error("getAllSnippets error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// get snippet by ID (GET /api/snippets/:id)
export const getSnippetById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const snippet = await Snippet.findById(id);
    if (!snippet) {
      res.status(404).json({ error: "Snippet not found" });
      return;
    }
    if (snippet.expiresAt && snippet.expiresAt.getTime() < Date.now()) {
      res.status(404).json({ error: "Snippet has expired" });
      return;
    }
    const decodedSnippet = {
      ...snippet.toObject(),
      code: decodeCode(snippet.code),
    };
    res.json(decodedSnippet);
    return;
  } catch (error) {
    console.error("getSnippetById error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// updated snippet (PUT /api/snippets/:id)
export const updateSnippet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
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
      res.status(404).json({ error: "Snippet not found" });
      return;
    }
    res.json(snippet);
    return;
  } catch (error) {
    console.error("updateSnippet error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// delete snippet (DELETE /api/snippets/:id)
export const deleteSnippet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }
    const snippet = await Snippet.findByIdAndDelete(id);
    if (!snippet) {
      res.status(404).json({ error: "Snippet not found" });
      return;
    }
    res.json({ message: "Snippet deleted successfully" });
    return;
  } catch (error) {
    console.error("deleteSnippet error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
