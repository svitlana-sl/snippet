import { Router } from "express";
import {
  createSnippet,
  getAllSnippets,
  getSnippetById,
  updateSnippet,
  deleteSnippet,
} from "../controllers/snippetController";

const router = Router();

router.post("/", createSnippet);
router.get("/", getAllSnippets);
router.get("/:id", getSnippetById);
router.put("/:id", updateSnippet);
router.delete("/:id", deleteSnippet);

export default router;
