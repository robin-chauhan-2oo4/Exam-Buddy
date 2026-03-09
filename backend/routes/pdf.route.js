import express from "express";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  uploadPDF,
  getUserPDFs,
  getPDFById,
  deletePDF,
} from "../controllers/pdf.controller.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("pdf"),
  uploadPDF
);

router.get("/", authMiddleware, getUserPDFs);
router.get("/:id", authMiddleware, getPDFById);
router.delete("/:id", authMiddleware, deletePDF);


export default router;
