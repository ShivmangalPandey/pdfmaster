// backend/server.ts
import express from "express";
import compression from "compression";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import fs from "fs-extra";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument, degrees, rgb } from "pdf-lib";
import { createRequire } from "module";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import { exec } from "child_process";
import { promisify } from "util";
import archiver from "archiver";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
var require2 = createRequire(import.meta.url);
var pdfParse = require2("pdf-parse");
dotenv.config();
var ROOT_DIR = process.cwd();
var BACKEND_DIR = path.join(ROOT_DIR, "backend");
var FRONTEND_DIR = path.join(ROOT_DIR, "frontend");
var UPLOADS_DIR = path.join(BACKEND_DIR, "uploads");
var OUTPUT_DIR = path.join(BACKEND_DIR, "output");
var BLOGS_FILE = path.join(BACKEND_DIR, "blogs.json");
var FRONTEND_DIST = path.join(FRONTEND_DIR, "dist");
var MONGODB_URI = process.env.MONGODB_URI;
var JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev";
var ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
var execAsync = promisify(exec);
var asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
var db = null;
var mongoClient = null;
var initDirs = () => {
  fs.ensureDirSync(UPLOADS_DIR);
  fs.ensureDirSync(OUTPUT_DIR);
  console.log(`\u{1F4C2} Directories initialized:`);
  console.log(`   - Uploads: ${UPLOADS_DIR}`);
  console.log(`   - Output: ${OUTPUT_DIR}`);
};
initDirs();
if (!fs.existsSync(BLOGS_FILE)) {
  const starterBlogs = [
    {
      id: uuidv4(),
      title: "How to Merge PDF Online Free",
      slug: "how-to-merge-pdf-online-free",
      excerpt: "Learn how to combine multiple PDF files into one professional document for free using PDFMaster.",
      content: "### The Power of Document Merging\n\nIn today's digital workflow, merging PDF files is more than just a convenience; it's a necessity. Whether you're a student compiling research papers or a business professional assembling a comprehensive report, the ability to join documents seamlessly is crucial.\n\n#### Why Merge PDF Files?\n\nCombining documents helps in maintaining a logical flow of information. Instead of sending five separate attachments in an email, you can send one polished document. This not only looks professional but also ensures that the recipient doesn't miss any critical part of your submission.\n\n### Step-by-Step Guide to Merging with PDFMaster\n\n1. **Upload Your Files**: Click the 'Select Files' button or drag and drop your PDFs into the [Merge PDF Tool](/merge-pdf) area.\n2. **Arrange Order**: Once uploaded, you can drag the file cards to reorder them exactly how you want them to appear in the final document.\n3. **Process**: Click the 'Merge' button. Our server-side engine will accurately stitch the pages together, maintaining all fonts and images.\n4. **Download**: Hit the download button to get your new, unified PDF.\n\n#### Security and Quality\n\nAt PDFMaster, we prioritize your security. All files are processed over SSL encrypted channels and are automatically deleted from our servers after an hour. Moreover, our merging process is 'lossless', meaning the quality of your images and text will be identical to the original files.\n\nIf your final file is too large for email, you can always use our [Compress PDF Tool](/compress-pdf) to reduce its size without losing clarity.",
      featuredImage: "https://picsum.photos/seed/merge/800/600",
      publishedAt: (/* @__PURE__ */ new Date()).toISOString(),
      author: "PDFMaster Team",
      category: "Tutorial",
      tags: ["tutorial", "productivity", "merge"],
      readingTime: "5 min read",
      seo: {
        title: "How to Merge PDF Online Free \u2013 Absolute Guide | PDFMaster",
        description: "Combine multiple PDF files into one professional document for free with our step-by-step guide on PDF merging.",
        keywords: ["merge pdf", "combine pdf", "pdf tools"]
      }
    },
    {
      id: uuidv4(),
      title: "Compress PDF Without Losing Quality",
      slug: "compress-pdf-without-losing-quality",
      excerpt: "Discover the best techniques to reduce your PDF file size while maintaining professional visual quality.",
      content: "### The Dilemma of Large PDF Files\n\nHigh-quality PDFs often come with a downside: massive file sizes. These large files are hard to email, slow to load on mobile devices, and can be rejected by document submission portals. Compression is the answer, but the challenge is doing it without making the text blurry or the images pixelated.\n\n#### How PDF Compression Works\n\nCompression works by optimizing the internal structure of the PDF. This includes removing redundant metadata and using smarter algorithms to represent images. While 'lossy' compression removes data, our 'ebook' and 'screen' profiles are balanced to prioritize the human eye's perception of quality.\n\n### Tips for Better Compression\n\n- **Choose the Right Level**: If you're printing, use 'Low' compression. For email, 'Medium' is the sweet spot.\n- **Start with Clean Files**: Avoid compressing a file that has already been compressed multiple times, as this can degrade quality exponentially.\n- **Use [Compress PDF Tool](/compress-pdf)**: Our Ghostscript-powered backend ensures that your documents are optimized according to industry standards.\n\n#### Why Size Matters for SEO\n\nIf you host PDFs on your website, their file size directly impacts your SEO. Search engines prefer fast-loading resources. A compressed PDF contributes to a better Core Web Vitals score for your site, helping you rank higher in search results. If you have many separate PDF pages, try the [Merge PDF tool](/merge-pdf) first before compressing the final document.",
      featuredImage: "https://picsum.photos/seed/compress/800/600",
      publishedAt: (/* @__PURE__ */ new Date()).toISOString(),
      author: "PDFMaster Team",
      category: "Optimization",
      tags: ["optimization", "seo", "compress"],
      readingTime: "6 min read",
      seo: {
        title: "Reduce PDF Size Online without Quality Loss | PDFMaster",
        description: "Learn how to shrink PDF documents for email and web while keeping them sharp and professional.",
        keywords: ["compress pdf", "reduce pdf size", "optimize pdf"]
      }
    },
    {
      id: uuidv4(),
      title: "Convert JPG to PDF on Mobile",
      slug: "convert-jpg-to-pdf-on-mobile",
      excerpt: "Transform your photos into professional PDF documents directly from your smartphone with these easy steps.",
      content: "### Desktop Power in Your Pocket\n\nThe need to convert an image to a PDF often arises when you're away from your computer. You might have just photographed a receipt, a signed contract, or a whiteboard from a meeting. Converting these to PDF makes them easier to read and more professional to share.\n\n#### The Mobile Advantage\n\nPDFMaster is built with a 'mobile-first' responsive design. This means you don't need to download a bulky app from the Play Store or App Store. Simply navigate to our site in Safari or Chrome, upload your photos, and download the PDF. It works flawlessly on both iOS and Android.\n\n### Use Cases for Image to PDF\n\n- **Student Portfolios**: Combine your hand-drawn art or handwritten notes into a single digital file.\n- **Business Expenses**: Snap photos of receipts and merge them into one PDF for accounting.\n- **Job Applications**: Convert your physical ID photos into a PDF for secure uploading to job portals.\n\n#### Efficiency Tips\n\nWhen converting multiple images, try to ensure them are all in the same orientation. Our tool will automatically size the PDF pages based on the images, giving you a clean and consistent document every time.",
      featuredImage: "https://picsum.photos/seed/mobile/800/600",
      publishedAt: (/* @__PURE__ */ new Date()).toISOString(),
      author: "PDFMaster Team",
      category: "Convert",
      tags: ["mobile", "tutorial", "convert"],
      readingTime: "4 min read",
      seo: {
        title: "How to Convert JPG to PDF on Android and iPhone | PDFMaster",
        description: "Turn your photos into high-quality PDF documents instantly using your mobile browser.",
        keywords: ["jpg to pdf mobile", "image to pdf", "convert photos"]
      }
    },
    {
      id: uuidv4(),
      title: "Best Free PDF Tools for Students",
      slug: "best-free-pdf-tools-for-students",
      excerpt: "A comprehensive guide to the essential PDF utilities every student needs to master their digital workflow.",
      content: "### Surviving the Digital Classroom\n\nToday's education is almost entirely digital. From reading lists to assignment submissions, the PDF is the universal currency of the academic world. Knowing how to manipulate these files effectively can save hours of frustration during finals week.\n\n#### Must-Have Tools for Academics\n\n1. **Merge PDF**: Essential for combining separate research chapters into one thesis document.\n2. **Edit & Annotate**: Great for adding notes to professor's slide decks without having to print them.\n3. **Compress PDF**: Crucial when the university's portal has a strict 5MB limit on submissions.\n\n### Why Free Tools are Better\n\nExpensive subscriptions are a burden on student budgets. Platforms like PDFMaster offer the same core functionality as premium software without the recurring fees. By using browser-based tools, students can work on lab computers, library tablets, or their own laptops without worrying about licensing.\n\n#### Academic Integrity and Security\n\nWhen handling your research, security is paramount. Ensure you use tools that don't 'own' your data. At PDFMaster, you retain full rights to your documents, and our automated deletion policy ensures your work stays yours.",
      featuredImage: "https://picsum.photos/seed/students/800/600",
      publishedAt: (/* @__PURE__ */ new Date()).toISOString(),
      author: "PDFMaster Team",
      category: "Resources",
      tags: ["education", "resources", "students"],
      readingTime: "7 min read",
      seo: {
        title: "Essential Free PDF Tools for College and School | PDFMaster",
        description: "Maximize your student productivity with our list of the best free PDF utilities for studying and assignments.",
        keywords: ["student tools", "free pdf tools", "study hacks"]
      }
    },
    {
      id: uuidv4(),
      title: "How to Reduce PDF Size for Email",
      slug: "how-to-reduce-pdf-size-for-email",
      excerpt: "Struggling with email bounce-backs due to large attachments? Learn the best ways to shrink your PDFs.",
      content: "### The 'Attachment Too Large' Error\n\nWe've all seen it: the frustrating notification that your email couldn't be sent because the attachment exceeded the 25MB limit. Most professional emails have even stricter limits. Reducing your PDF size is the only way forward.\n\n#### Effective Shrinking Techniques\n\nOur 'Medium' compression profile is specifically designed for email. It targets the parts of the PDF that the eye doesn't easily notice\u2014like high-resolution metadata and non-embedded font character maps\u2014to shave off megabytes without hurting the document's appearance.\n\n### Alternatives to Attachment\n\nIf your file is still too large after compression (say, a 500-page manual), consider these strategies:\n\n- **Merge relevant parts only**: Use our split tool (coming soon) or simply re-generate the PDF with only the critical pages.\n- **Cloud Links**: Upload to a drive and share the link, though attaching is usually preferred for permanent records.\n\n#### The PDFMaster Difference\n\nUnlike many free compressors that leave a giant watermark on your document, PDFMaster kept your work clean and professional. Your recipients will see the quality of your work, not the tool you used to shrink it.",
      featuredImage: "https://picsum.photos/seed/email/800/600",
      publishedAt: (/* @__PURE__ */ new Date()).toISOString(),
      author: "PDFMaster Team",
      category: "Productivity",
      tags: ["email", "optimization", "productivity"],
      readingTime: "5 min read",
      seo: {
        title: "Fastest Way to Shrink PDF Path for Email Attachments | PDFMaster",
        description: "Don't let large PDFs block your emails. Use our compressor to fit your documents under email limits.",
        keywords: ["reduce pdf size email", "shrink pdf", "attachment issues"]
      }
    }
  ];
  fs.writeJsonSync(BLOGS_FILE, starterBlogs);
}
var connectDB = async (retries = 3) => {
  if (db) return db;
  if (!MONGODB_URI) {
    console.warn("\u26A0\uFE0F [DB] MONGODB_URI not provided. Operating in Local File Mode.");
    return null;
  }
  while (retries > 0) {
    try {
      if (!mongoClient) {
        console.log(`\u{1F50C} [DB] Connecting to MongoDB... (Attempts left: ${retries})`);
        const isSrv = MONGODB_URI.startsWith("mongodb+srv://");
        mongoClient = new MongoClient(MONGODB_URI, {
          serverSelectionTimeoutMS: 8e3,
          connectTimeoutMS: 1e4,
          socketTimeoutMS: 45e3,
          // TLS/SSL Hardening and Fallbacks
          tls: true,
          // Explicitly enable TLS
          tlsAllowInvalidCertificates: true,
          // directConnection: !isSrv, // Only use if not SRV
          retryWrites: true,
          w: "majority",
          // Force IPv4 as IPv6 can sometimes cause handshake issues in sandboxed environments
          family: 4
        });
        await mongoClient.connect();
        console.log("\u2705 [DB] MongoDB Connected Successfully");
      }
      db = mongoClient.db();
      return db;
    } catch (err) {
      const errorStr = String(err);
      const isSslAlert80 = errorStr.includes("alert internal error") || errorStr.includes("SSL alert number 80");
      if (isSslAlert80 || err.code === "ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR") {
        console.error("\u274C [DB] SSL Handshake Rejected (Alert 80).");
        console.error("\u{1F449} This is usually caused by the MongoDB Atlas IP Access List.");
        console.error("\u{1F6E0}\uFE0F  Solution: Go to MongoDB Atlas > Network Access and 'Allow Access From Anywhere' (0.0.0.0/0) for this project.");
        retries = 0;
      } else {
        console.error(`\u274C [DB] MongoDB Connection Error:`, err);
        retries -= 1;
      }
      if (retries === 0) {
        console.warn("\u26A0\uFE0F [DB] MongoDB connection unavailable. Falling back to Local File Mode.");
        return null;
      }
      await new Promise((res) => setTimeout(res, 2e3));
    }
  }
  return null;
};
var getBlogs = async () => {
  const database = await connectDB();
  if (database) {
    try {
      return await database.collection("blogs").find({}).toArray();
    } catch (err) {
      console.error("Failed to fetch from MongoDB, using local fallback");
    }
  }
  return fs.readJson(BLOGS_FILE);
};
var saveBlogs = async (blogData) => {
  const database = await connectDB();
  if (database) {
    try {
      if (Array.isArray(blogData)) {
        return;
      }
      return await database.collection("blogs").insertOne(blogData);
    } catch (err) {
      console.error("Failed to save to MongoDB, using local fallback");
    }
  }
  let blogs = await fs.readJson(BLOGS_FILE);
  if (Array.isArray(blogData)) {
    blogs = blogData;
  } else {
    blogs.push(blogData);
  }
  return fs.writeJson(BLOGS_FILE, blogs);
};
async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(compression());
  const PORT = 3e3;
  app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 100,
    // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests from this IP, please try again after 15 minutes." }
  });
  app.use("/api/", limiter);
  app.use(cors());
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ limit: "100mb", extended: true }));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = uuidv4();
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    // 100MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png"];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${ext} is not supported. Please upload PDF or image files.`));
      }
    }
  });
  app.use("/api", (req, res, next) => {
    console.log(`\u{1F50D} [API-IN] ${req.method} ${req.path}`);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      console.log(`\u{1F4E1} [${(/* @__PURE__ */ new Date()).toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "PDFMaster API is running" });
  });
  app.post("/api/upload", asyncHandler(async (req, res) => {
    console.log("\u{1F4E5} Received upload request to /api/upload");
    upload.array("files")(req, res, (err) => {
      if (err) {
        console.error("\u{1F525} Multer upload error:", err);
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      try {
        const files = req.files;
        console.log(`\u{1F4E6} Multer processed ${files?.length || 0} files`);
        if (!files || files.length === 0) {
          console.warn("\u26A0\uFE0F No files received in /api/upload");
          return res.status(400).json({ error: "No files uploaded. Check if the 'files' field name is correct." });
        }
        const fileInfos = files.map((file) => ({
          id: path.parse(file.filename).name,
          originalName: file.originalname,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype
        }));
        console.log("\u2705 Returning file infos to client");
        res.json({ files: fileInfos });
      } catch (error) {
        console.error("\u{1F525} Error in /api/upload handler logic:", error);
        res.status(500).json({ error: "Internal server error during upload metadata generation" });
      }
    });
  }));
  app.get("/api/blogs", async (req, res) => {
    try {
      const blogs = await getBlogs();
      res.json(blogs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blogs" });
    }
  });
  app.get("/api/blogs/:slug", async (req, res) => {
    try {
      const blogs = await getBlogs();
      const blog = blogs.find((b) => b.slug === req.params.slug);
      if (!blog) return res.status(404).json({ error: "Blog not found" });
      res.json(blog);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog" });
    }
  });
  const authenticateAdmin = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.admin = decoded;
      next();
    });
  };
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
        return res.json({ token, user: { username: ADMIN_USERNAME } });
      }
      res.status(401).json({ error: "Invalid credentials" });
    } catch (err) {
      res.status(500).json({ error: "Login error" });
    }
  });
  app.post("/api/admin/blogs", authenticateAdmin, async (req, res) => {
    try {
      const blogs = await getBlogs();
      const newBlog = {
        ...req.body,
        id: uuidv4(),
        publishedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const database = await connectDB();
      if (database) {
        await database.collection("blogs").insertOne(newBlog);
      } else {
        blogs.push(newBlog);
        await saveBlogs(blogs);
      }
      res.status(201).json(newBlog);
    } catch (error) {
      console.error("Failed to create blog:", error);
      res.status(500).json({ error: "Failed to create blog" });
    }
  });
  app.put("/api/admin/blogs/:id", authenticateAdmin, async (req, res) => {
    try {
      const database = await connectDB();
      if (database) {
        await database.collection("blogs").updateOne({ id: req.params.id }, { $set: req.body });
        const updated = await database.collection("blogs").findOne({ id: req.params.id });
        return res.json(updated);
      }
      let blogs = await getBlogs();
      const index = blogs.findIndex((b) => b.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: "Blog not found" });
      blogs[index] = { ...blogs[index], ...req.body };
      await saveBlogs(blogs);
      res.json(blogs[index]);
    } catch (error) {
      res.status(500).json({ error: "Failed to update blog" });
    }
  });
  app.delete("/api/admin/blogs/:id", authenticateAdmin, async (req, res) => {
    try {
      const database = await connectDB();
      if (database) {
        await database.collection("blogs").deleteOne({ id: req.params.id });
        return res.json({ success: true });
      }
      let blogs = await getBlogs();
      blogs = blogs.filter((b) => b.id !== req.params.id);
      await saveBlogs(blogs);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete blog" });
    }
  });
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send("User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n\n# Google Search Console Verification Placeholder\n# Google-Site-Verification: your-google-verification-code");
  });
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const blogs = await getBlogs();
      const baseUrl = process.env.APP_URL || "https://pdfmaster.io";
      const toolUrls = [
        "/merge-pdf",
        "/compress-pdf",
        "/pdf-to-jpg",
        "/jpg-to-pdf",
        "/edit-pdf",
        "/pdf-to-word",
        "/watermark-pdf",
        "/rotate-pdf",
        "/page-numbers-pdf"
      ];
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
      xml += `  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>
`;
      xml += `  <url><loc>${baseUrl}/blog</loc><priority>0.8</priority></url>
`;
      toolUrls.forEach((url) => {
        xml += `  <url><loc>${baseUrl}${url}</loc><priority>0.9</priority></url>
`;
      });
      blogs.forEach((blog) => {
        xml += `  <url><loc>${baseUrl}/blog/${blog.slug}</loc><lastmod>${blog.publishedAt.split("T")[0]}</lastmod><priority>0.7</priority></url>
`;
      });
      xml += `</urlset>`;
      res.type("application/xml");
      res.send(xml);
    } catch (error) {
      res.status(500).send("Error generating sitemap");
    }
  });
  const findUploadedFile = async (id) => {
    const files = await fs.readdir(UPLOADS_DIR);
    const filename = files.find((f) => f.startsWith(id));
    return filename ? path.join(UPLOADS_DIR, filename) : null;
  };
  app.post("/api/tools/jpg-to-pdf", asyncHandler(async (req, res) => {
    const { fileIds } = req.body;
    if (!fileIds || fileIds.length === 0) return res.status(400).json({ error: "Images required" });
    const pdfDoc = await PDFDocument.create();
    const files = await fs.readdir(UPLOADS_DIR);
    for (const id of fileIds) {
      const filename = files.find((f) => f.startsWith(id));
      if (!filename) continue;
      const imgPath = path.join(UPLOADS_DIR, filename);
      const imgBytes = await fs.readFile(imgPath);
      const ext = path.extname(filename).toLowerCase();
      let image;
      if (ext === ".jpg" || ext === ".jpeg") {
        image = await pdfDoc.embedJpg(imgBytes);
      } else if (ext === ".png") {
        image = await pdfDoc.embedPng(imgBytes);
      } else {
        continue;
      }
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height
      });
    }
    const pdfBytes = await pdfDoc.save();
    const outputId = uuidv4();
    const outputFilename = `images_to_${outputId}.pdf`;
    await fs.writeFile(path.join(OUTPUT_DIR, outputFilename), pdfBytes);
    cleanupUploads(fileIds);
    res.json({
      success: true,
      downloadUrl: `/api/download/${outputFilename}`,
      filename: "converted_images.pdf"
    });
  }));
  app.post("/api/tools/watermark", asyncHandler(async (req, res) => {
    try {
      const { fileIds, text } = req.body;
      if (!fileIds || fileIds.length === 0) return res.status(400).json({ error: "File required" });
      const filePath = await findUploadedFile(fileIds[0]);
      if (!filePath) return res.status(404).json({ error: "File not found" });
      console.log(`\u{1F4A7} [TOOL] Watermark: "${text}" for ${filePath}`);
      const pdfBytes = await fs.readFile(filePath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        page.drawText(text || "WATERMARK", {
          x: 50,
          y: page.getHeight() / 2,
          size: 50,
          opacity: 0.3,
          rotate: degrees(45)
        });
      }
      const pdfBytesOut = await pdfDoc.save();
      const outputFilename = `watermarked_${uuidv4()}.pdf`;
      await fs.writeFile(path.join(OUTPUT_DIR, outputFilename), pdfBytesOut);
      cleanupUploads(fileIds);
      res.json({ success: true, downloadUrl: `/api/download/${outputFilename}` });
    } catch (error) {
      console.error("\u{1F525} [TOOL] Watermark error:", error);
      res.status(500).json({ error: error.message || "Failed to add watermark" });
    }
  }));
  app.post("/api/tools/page-numbers", asyncHandler(async (req, res) => {
    try {
      const { fileIds } = req.body;
      if (!fileIds || fileIds.length === 0) return res.status(400).json({ error: "File required" });
      const filePath = await findUploadedFile(fileIds[0]);
      if (!filePath) return res.status(404).json({ error: "File not found" });
      console.log(`\u{1F522} [TOOL] Page Numbers: Processing ${filePath}`);
      const pdfBytes = await fs.readFile(filePath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      for (let i = 0; i < pages.length; i++) {
        const { width } = pages[i].getSize();
        pages[i].drawText(String(i + 1), {
          x: width / 2,
          y: 20,
          size: 12
        });
      }
      const pdfBytesOut = await pdfDoc.save();
      const outputFilename = `numbered_${uuidv4()}.pdf`;
      await fs.writeFile(path.join(OUTPUT_DIR, outputFilename), pdfBytesOut);
      cleanupUploads(fileIds);
      res.json({ success: true, downloadUrl: `/api/download/${outputFilename}` });
    } catch (error) {
      console.error("\u{1F525} [TOOL] Page Numbers error:", error);
      res.status(500).json({ error: error.message || "Failed to add page numbers" });
    }
  }));
  const cleanupUploads = async (fileIds) => {
    try {
      const files = await fs.readdir(UPLOADS_DIR);
      for (const id of fileIds) {
        const filename = files.find((f) => f.startsWith(id));
        if (filename) {
          await fs.remove(path.join(UPLOADS_DIR, filename));
          console.log(`\u{1F9F9} [CLEANUP] Deleted upload: ${filename}`);
        }
      }
    } catch (err) {
      console.warn("\u26A0\uFE0F [CLEANUP] Uploads deletion failed:", err);
    }
  };
  app.post("/api/tools/merge", asyncHandler(async (req, res) => {
    try {
      const { fileIds } = req.body;
      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return res.status(400).json({ error: "At least one file is required for processing" });
      }
      console.log(`\u{1F4D1} [TOOL] Merge: Processing ${fileIds.length} files`);
      const mergedPdf = await PDFDocument.create();
      let filesProcessed = 0;
      for (const id of fileIds) {
        const filePath = await findUploadedFile(id);
        if (!filePath) {
          console.warn(`\u26A0\uFE0F [TOOL] Merge: File ${id} not found, skipping`);
          continue;
        }
        const pdfBytes = await fs.readFile(filePath);
        if (filePath.toLowerCase().endsWith(".pdf")) {
          const pdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
          filesProcessed++;
        }
      }
      if (filesProcessed === 0) {
        throw new Error("No valid PDF documents found to process.");
      }
      const mergedPdfBytes = await mergedPdf.save();
      const outputFilename = `merged_${uuidv4()}.pdf`;
      const outputPath = path.join(OUTPUT_DIR, outputFilename);
      await fs.writeFile(outputPath, mergedPdfBytes);
      cleanupUploads(fileIds);
      console.log(`\u2705 [TOOL] Merge complete: ${outputFilename}`);
      res.json({
        success: true,
        message: filesProcessed > 1 ? "Files merged successfully." : "Document processed successfully.",
        downloadUrl: `/api/download/${outputFilename}`,
        filename: filesProcessed > 1 ? "merged_document.pdf" : "processed_document.pdf"
      });
    } catch (error) {
      console.error("\u{1F525} [TOOL] Merge error:", error);
      res.status(500).json({ error: error.message || "Failed to merge PDF files" });
    }
  }));
  app.post("/api/tools/rotate", asyncHandler(async (req, res) => {
    try {
      const { fileIds } = req.body;
      if (!fileIds || fileIds.length === 0) return res.status(400).json({ error: "File required" });
      const filePath = await findUploadedFile(fileIds[0]);
      if (!filePath) return res.status(404).json({ error: "File not found" });
      console.log(`\u{1F504} [TOOL] Rotate: Processing ${filePath}`);
      const pdfBytes = await fs.readFile(filePath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        page.setRotation(degrees((page.getRotation().angle + 90) % 360));
      }
      const pdfBytesOut = await pdfDoc.save();
      const outputFilename = `rotated_${uuidv4()}.pdf`;
      await fs.writeFile(path.join(OUTPUT_DIR, outputFilename), pdfBytesOut);
      cleanupUploads(fileIds);
      res.json({ success: true, downloadUrl: `/api/download/${outputFilename}` });
    } catch (error) {
      console.error("\u{1F525} [TOOL] Rotate error:", error);
      res.status(500).json({ error: error.message || "Failed to rotate PDF" });
    }
  }));
  app.post("/api/tools/compress", asyncHandler(async (req, res) => {
    try {
      const { fileIds, level } = req.body;
      if (!fileIds || fileIds.length === 0) return res.status(400).json({ error: "File required" });
      const sourcePath = await findUploadedFile(fileIds[0]);
      if (!sourcePath) return res.status(404).json({ error: "File not found" });
      if (!sourcePath.toLowerCase().endsWith(".pdf")) {
        return res.status(400).json({ error: "Compression only supported for PDF files" });
      }
      console.log(`\u{1F4C9} [TOOL] Compress: Level ${level} for ${sourcePath}`);
      const originalSize = (await fs.stat(sourcePath)).size;
      const outputFilename = `compressed_${uuidv4()}.pdf`;
      const outputPath = path.join(OUTPUT_DIR, outputFilename);
      const gsProfiles = {
        high: "/screen",
        medium: "/ebook",
        low: "/printer"
      };
      const profile = gsProfiles[level] || "/ebook";
      try {
        console.log(`\u{1F3D7}\uFE0F [TOOL] Compress: Attempting Ghostscript conversion...`);
        const command = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${profile} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${sourcePath}"`;
        await execAsync(command);
        console.log(`\u2705 [TOOL] Compress: Ghostscript successful`);
      } catch (gsErr) {
        console.warn(`\u26A0\uFE0F [TOOL] Compress: Ghostscript failed or not found. Falling back to pdf-lib pass-through.`);
        console.warn(`   Error logic: ${gsErr.message}`);
        const pdfBytes = await fs.readFile(sourcePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const savedBytes = await pdfDoc.save();
        await fs.writeFile(outputPath, savedBytes);
      }
      const compressedSize = (await fs.stat(outputPath)).size;
      const reduction = originalSize > 0 ? (originalSize - compressedSize) / originalSize * 100 : 0;
      const displayReduction = reduction < 0 ? "0.00" : reduction.toFixed(2);
      cleanupUploads(fileIds);
      res.json({
        success: true,
        message: reduction > 0 ? "PDF compressed successfully." : "Optimization complete. (Input was already small or Ghostscript is unavailable)",
        originalSize,
        compressedSize,
        reductionPercentage: displayReduction,
        downloadUrl: `/api/download/${outputFilename}`
      });
    } catch (error) {
      console.error("\u{1F525} [TOOL] Compress error:", error);
      res.status(500).json({ error: error.message || "Failed to compress PDF" });
    }
  }));
  app.post("/api/tools/pdf-to-word", asyncHandler(async (req, res) => {
    const { fileIds } = req.body;
    if (!fileIds || fileIds.length === 0) return res.status(400).json({ error: "File required" });
    const sourcePath = await findUploadedFile(fileIds[0]);
    if (!sourcePath) return res.status(404).json({ error: "File not found" });
    console.log(`\u{1F4DD} Extracting text from PDF: ${sourcePath}`);
    const dataBuffer = await fs.readFile(sourcePath);
    try {
      const data = await pdfParse(dataBuffer);
      console.log(`\u{1F4C4} Creating Word document from extracted text (${data.text.length} chars)`);
      const lines = data.text.split("\n");
      const paragraphs = lines.filter((line) => line.trim() !== "").map((line) => new Paragraph({
        children: [new TextRun(line)]
      }));
      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });
      const buffer = await Packer.toBuffer(doc);
      const outputFilename = `converted_${uuidv4()}.docx`;
      await fs.writeFile(path.join(OUTPUT_DIR, outputFilename), buffer);
      console.log(`\u2705 PDF to Word complete: ${outputFilename}`);
      cleanupUploads(fileIds);
      res.json({
        success: true,
        message: "PDF converted to Word successfully. Note: This is an architectural text-based extraction; layout might differ from original.",
        downloadUrl: `/api/download/${outputFilename}`,
        filename: "converted_document.docx"
      });
    } catch (parseErr) {
      console.error("\u{1F525} PDF Parse error:", parseErr);
      res.status(422).json({ error: `Failed to parse PDF content: ${parseErr.message}` });
    }
  }));
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  };
  app.post("/api/tools/edit", asyncHandler(async (req, res) => {
    console.log("\u270F\uFE0F Received high-precision edit request");
    const { fileIds, annotations, text } = req.body;
    if (!fileIds || fileIds.length === 0) {
      console.warn("\u26A0\uFE0F No fileIds in edit request");
      return res.status(400).json({ error: "File required" });
    }
    const filePath = await findUploadedFile(fileIds[0]);
    if (!filePath) {
      console.error(`\u274C File not found for edit: ${fileIds[0]}`);
      return res.status(404).json({ error: "File not found" });
    }
    console.log(`\u{1F4C4} Reading PDF for edit: ${filePath}`);
    const pdfBytes = await fs.readFile(filePath);
    let pdfDoc;
    try {
      console.log("\u{1F3D7}\uFE0F Loading PDF into pdf-lib...");
      pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    } catch (loadErr) {
      console.error("\u{1F525} PDF Load crash:", loadErr);
      return res.status(422).json({
        error: `Could not load PDF: ${loadErr.message}. The file might be corrupted or protected.`,
        success: false
      });
    }
    const pages = pdfDoc.getPages();
    console.log(`\u{1F4D1} PDF has ${pages.length} pages`);
    if (annotations && Array.isArray(annotations) && annotations.length > 0) {
      console.log(`\u270D\uFE0F Adding ${annotations.length} interactive annotations`);
      for (const ann of annotations) {
        if (ann.pageIndex < 0 || ann.pageIndex >= pages.length) continue;
        const page = pages[ann.pageIndex];
        const { width, height } = page.getSize();
        const xPos = ann.x / 100 * width;
        const yPos = height - ann.y / 100 * height;
        const color = hexToRgb(ann.color || "#000000");
        console.log(`\u{1F4CD} Placing "${ann.text}" at ${xPos.toFixed(1)}, ${yPos.toFixed(1)} on page ${ann.pageIndex + 1}`);
        page.drawText(ann.text, {
          x: xPos,
          y: yPos,
          size: ann.fontSize || 14,
          color: rgb(color.r, color.g, color.b),
          opacity: 1
        });
      }
    } else if (text && text.trim() !== "") {
      console.log(`\u270D\uFE0F Adding fallback text annotation: "${text}"`);
      for (const page of pages) {
        page.drawText(text, {
          x: 20,
          y: page.getHeight() - 40,
          size: 14,
          opacity: 0.8
        });
      }
    } else {
      console.log("\u2139\uFE0F No annotations or text provided for edit, skipping");
    }
    console.log("\u{1F4BE} Saving modified PDF...");
    const pdfBytesOut = await pdfDoc.save();
    const outputFilename = `edited_${uuidv4()}.pdf`;
    await fs.writeFile(path.join(OUTPUT_DIR, outputFilename), pdfBytesOut);
    console.log(`\u2705 Edit complete: ${outputFilename}`);
    cleanupUploads(fileIds);
    res.json({
      success: true,
      message: "Processing complete",
      downloadUrl: `/api/download/${outputFilename}`
    });
  }));
  app.post("/api/tools/pdf-to-jpg", asyncHandler(async (req, res) => {
    const { fileIds } = req.body;
    if (!fileIds || fileIds.length === 0) return res.status(400).json({ error: "File required" });
    const sourcePath = await findUploadedFile(fileIds[0]);
    if (!sourcePath) return res.status(404).json({ error: "File not found" });
    const workDir = path.join(OUTPUT_DIR, `work_${uuidv4()}`);
    await fs.ensureDir(workDir);
    console.log(`\u{1F5BC}\uFE0F Converting ${sourcePath} to JPG images...`);
    const gsCommand = `gs -sDEVICE=jpeg -r200 -dJPEGQ=85 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${path.join(workDir, "page_%d.jpg")}" "${sourcePath}"`;
    await execAsync(gsCommand);
    const generatedFiles = await fs.readdir(workDir);
    if (generatedFiles.length === 0) {
      throw new Error("No images were generated from the PDF.");
    }
    let finalFilename = "";
    if (generatedFiles.length === 1) {
      finalFilename = `converted_${uuidv4()}.jpg`;
      await fs.move(path.join(workDir, generatedFiles[0]), path.join(OUTPUT_DIR, finalFilename));
    } else {
      finalFilename = `images_${uuidv4()}.zip`;
      const outputPath = path.join(OUTPUT_DIR, finalFilename);
      const output = fs.createWriteStream(outputPath);
      const archive = archiver("zip", { zlib: { level: 9 } });
      const zipPromise = new Promise((resolve, reject) => {
        output.on("close", () => resolve());
        archive.on("error", (err) => reject(err));
      });
      archive.pipe(output);
      for (const file of generatedFiles) {
        archive.file(path.join(workDir, file), { name: file });
      }
      await archive.finalize();
      await zipPromise;
    }
    await fs.remove(workDir);
    res.json({
      success: true,
      message: generatedFiles.length > 1 ? "PDF pages converted to ZIP." : "PDF page converted to JPG.",
      downloadUrl: `/api/download/${finalFilename}`,
      filename: generatedFiles.length > 1 ? "converted_pages.zip" : "converted_page.jpg"
    });
  }));
  app.get("/api/download/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(OUTPUT_DIR, filename);
    console.log(`\u{1F4E5} Download requested: ${filename}`);
    console.log(`\u{1F50D} Looking for file at: ${filePath}`);
    if (fs.existsSync(filePath)) {
      console.log(`\u2705 File found, starting download`);
      res.download(filePath);
    } else {
      console.error(`\u274C File NOT found at: ${filePath}`);
      res.status(404).json({ error: "File not found" });
    }
  });
  app.use("/api", (req, res) => {
    console.warn(`\u{1F6AB} API 404 Fallthrough: ${req.method} ${req.url}`);
    res.status(404).json({
      success: false,
      error: `API endpoint not found: ${req.method} ${req.url}`,
      path: req.path,
      info: "If this is a valid endpoint, please check the server-side route definitions."
    });
  });
  app.use("/api", (err, req, res, next) => {
    console.error("\u{1F525} API ERROR HANDLER:", err);
    if (res.headersSent) return next(err);
    res.setHeader("Content-Type", "application/json");
    res.status(err.status || 500).json({
      success: false,
      error: err.message || "An internal server error occurred",
      details: process.env.NODE_ENV !== "production" ? err.stack : void 0
    });
  });
  setInterval(async () => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1e3;
    const cleanup = async (dir) => {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.stat(filePath);
        if (now - stats.mtimeMs > oneHour) {
          await fs.remove(filePath);
          console.log(`Cleaned up: ${file}`);
        }
      }
    };
    try {
      await cleanup(UPLOADS_DIR);
      await cleanup(OUTPUT_DIR);
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  }, 10 * 60 * 1e3);
  if (process.env.NODE_ENV !== "production") {
    console.log("\u{1F6E0}\uFE0F Initializing Vite Development Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: FRONTEND_DIR
    });
    console.log("\u2705 Vite Middleware initialized for frontend root:", FRONTEND_DIR);
    app.use(vite.middlewares);
  } else {
    console.log(`\u{1F680} Serving production build from: ${FRONTEND_DIST}`);
    app.use(express.static(FRONTEND_DIST));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(FRONTEND_DIST, "index.html"));
    });
  }
  app.use((err, req, res, next) => {
    console.error("\u{1F525} ABSOLUTE_FINAL_ERROR_HANDLER:", err);
    if (res.headersSent) {
      return next(err);
    }
    const isApi = req.url?.startsWith("/api") || req.path?.startsWith("/api");
    if (isApi) {
      res.setHeader("Content-Type", "application/json");
      return res.status(err.status || 500).json({
        success: false,
        error: err.message || "A fatal API error occurred",
        stack: process.env.NODE_ENV !== "production" ? err.stack : void 0
      });
    }
    res.status(500).send("A critical internal server error occurred.");
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} PDFMaster Server is fully operational!`);
    console.log(`\u{1F4E1} Listening on: http://0.0.0.0:${PORT}`);
    console.log(`\u{1F6E0}\uFE0F Mode: ${process.env.NODE_ENV || "development"}`);
  });
}
startServer().catch((err) => {
  console.error("\u{1F525} CRITICAL SERVER STARTUP ERROR:", err);
  process.exit(1);
});
