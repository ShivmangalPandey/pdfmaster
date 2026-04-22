# PDFMaster - Production-Ready PDF Utility Platform

A powerful, full-stack PDF utility platform that allows users to merge, split, compress, and edit PDF files.

## 🚀 Features (Verified)
- **Merge PDF**: Combine multiple PDFs into one.
- **Compress PDF**: Reduce file size with adjustable quality levels.
- **JPG to PDF**: Convert images to a single PDF document.
- **PDF to Word**: Extract text content into an editable DOCX file.
- **Edit PDF**: Add text annotations, watermarks, rotate pages, and add page numbers.
- **Admin Dashboard**: manage blogs and platform content.

## 🛠 Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Motion.
- **Backend**: Node.js (Express), pdf-lib, pdf-parse, docx, Ghostscript.
- **Database**: MongoDB (with local JSON fallback).
- **Auth**: JWT-based admin authentication.

## 📦 Project Structure
- `/frontend`: React application code and assets.
- `/backend`: Express server and file processing logic.
- `/package.json`: Main project configuration and scripts.

## ⚙️ Environment Variables
Create a `.env` file in the root:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=mongodb+srv://... (Optional)
PORT=3000
```

## 🏃‍♂️ Running Locally
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Development Server**:
   ```bash
   npm run dev
   ```
3. **Build for Production**:
   ```bash
   npm run build
   ```
4. **Start Production Server**:
   ```bash
   npm start
   ```

## ☁️ Deployment Instructions

### Frontend (Vercel)
1. Push the code to GitHub.
2. Connect your repository to Vercel.
3. Vercel will auto-detect the Vite build settings.
4. Add environment variables in Vercel settings.

### Backend (Render / Cloud Run)
1. Deploy the project as a Web Service.
2. Ensure Ghostscript is installed in the environment (use a custom Dockerfile or Render's native support).
3. Set the `start` command to `npm start`.
4. Configure health check at `/api/health`.

## 📜 License
MIT License.
