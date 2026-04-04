import fs from "fs";
import PDF from "../models/PDF.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { YoutubeTranscript } from "youtube-transcript/dist/youtube-transcript.esm.js";

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

export const uploadYoutube = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        message: "No URL provided",
      });
    }

    // 1. Extract video ID
    let videoId = url;
    try {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get("v") || urlObj.pathname.split("/").pop() || url;
    } catch (e) {}

    // 2. Fetch the actual video title from YouTube's page
    let videoTitle = videoId;
    try {
      const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      const html = await pageRes.text();
      // Try og:title meta tag first (most reliable)
      const ogMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/);
      if (ogMatch && ogMatch[1]) {
        videoTitle = ogMatch[1];
      } else {
        // Fallback to <title> tag
        const titleMatch = html.match(/<title>([^<]+)<\/title>/);
        if (titleMatch && titleMatch[1]) {
          videoTitle = titleMatch[1].replace(/ - YouTube$/, "").trim();
        }
      }
    } catch (e) {
      console.warn("Could not fetch video title, using video ID:", e.message);
    }

    // 3. Fetch transcript
    const transcript = await YoutubeTranscript.fetchTranscript(url);

    if (!transcript || transcript.length === 0) {
      return res.status(400).json({
        message: "No closed captions found for this video.",
      });
    }

    // 4. Build rich extracted text with proper structure
    const transcriptLines = transcript.map((t) => t.text.trim()).filter(Boolean);
    const extractedText = [
      `Video Title: ${videoTitle}`,
      `Source: ${url}`,
      `---`,
      `Transcript:`,
      ``,
      ...transcriptLines,
    ].join("\n");

    const pdfDoc = await PDF.create({
      user: req.user.id,
      filename: videoTitle,
      extractedText,
    });

    res.status(201).json({
      message: "YouTube video processed",
      pdfId: pdfDoc._id,
    });
  } catch (error) {
    console.error("YouTube upload error:", error);
    res.status(500).json({
      message: "Failed to process YouTube video. Check if subtitles/captions are available.",
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
