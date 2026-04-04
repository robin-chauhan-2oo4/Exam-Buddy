import express from "express";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  uploadPDF,
  getUserPDFs,
  getPDFById,
  deletePDF,
  uploadYoutube,
} from "../controllers/pdf.controller.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("pdf"),
  uploadPDF
);

router.post(
  "/youtube",
  authMiddleware,
  uploadYoutube
);

router.get("/", authMiddleware, getUserPDFs);
router.get("/:id", authMiddleware, getPDFById);
router.delete("/:id", authMiddleware, deletePDF);


export default router;
