import fs from "fs";
import PDF from "../models/PDF.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No PDF uploaded",
      });
    }

    const data = new Uint8Array(
      fs.readFileSync(req.file.path)
    );

    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;

    let extractedText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(
        (item) => item.str
      );
      extractedText += strings.join(" ") + "\n";
    }

    const pdfDoc = await PDF.create({
      user: req.user.id,
      filename: req.file.originalname,
      extractedText,
    });

    res.status(201).json({
      message: "PDF uploaded & saved",
      pdfId: pdfDoc._id,
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    res.status(500).json({
      message: "PDF processing failed",
    });
  }
};



export const getUserPDFs = async (req, res) => {
  try {
    const pdfs = await PDF.find({ user: req.user.id })
      .select("_id filename createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ pdfs });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch PDFs",
    });
  }
};

export const getPDFById = async (req, res) => {
  try {
    const pdf = await PDF.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!pdf) {
      return res.status(404).json({
        message: "PDF not found",
      });
    }

    res.status(200).json({ pdf });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch PDF",
    });
  }
};

export const deletePDF = async (req, res) => {
  try {
    const pdf = await PDF.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!pdf) {
      return res.status(404).json({
        message: "PDF not found",
      });
    }

    res.status(200).json({
      message: "PDF deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete PDF",
    });
  }
};
