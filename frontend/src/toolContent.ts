export interface ToolContent {
  title: string;
  metaDescription: string;
  h1: string;
  h2: string;
  content: string;
  faqs: { question: string; answer: string }[];
}

export const TOOL_SEO_CONTENT: Record<string, ToolContent> = {
  'merge': {
    title: 'Merge PDF Online Free – Combine PDF Files | PDFMaster',
    metaDescription: 'Easily merge PDF files online for free. Combine multiple PDF documents into one in seconds with our secure PDF merger tool.',
    h1: 'Merge PDF Files Online',
    h2: 'How to Combine Multiple PDFs Perfectly',
    content: 'Merging PDF files is a vital task for anyone handling digital documents. Whether you are a student combining lecture notes or a professional assembling business reports, our Merge PDF tool makes it effortless. Simply upload your documents, rearrange them in the desired order, and download your unified file. Our platform ensures that text, images, and formatting remain intact during the merger process.',
    faqs: [
      { question: 'Is it safe to merge PDFs online?', answer: 'Yes, PDFMaster uses SSL encryption to protect your data. All uploaded files are automatically deleted from our servers shortly after processing.' },
      { question: 'Is there a limit on how many files I can merge?', answer: 'You can merge up to 20 files at once for free. Larger batches are processed quickly and efficiently.' },
      { question: 'Will my formatting be preserved?', answer: 'Absolutely. Our merger tool maintains the exact formatting, fonts, and images of your original documents.' }
    ]
  },
  'compress': {
    title: 'Compress PDF Online – Reduce File Size | PDFMaster',
    metaDescription: 'Reduce PDF file size online without losing quality. Our PDF compressor helps you optimize documents for email and faster web sharing.',
    h1: 'Compress PDF Documents Online',
    h2: 'Optimize Your Files for Fast Sharing',
    content: 'Bulky PDF files can be a headache when trying to email them or upload them to web portals. Our Compress PDF tool uses advanced algorithms to significantly reduce file size while maintaining high visual quality. You can choose from different compression levels (Low, Medium, High) depending on your needs. For most users, Medium compression offers the perfect balance between quality and size reduction.',
    faqs: [
      { question: 'How much can I reduce my PDF size?', answer: 'Depending on the content, you can often see size reductions of 40% to 80% without noticeable quality loss.' },
      { question: 'Does compressing a PDF reduce image quality?', answer: 'It can, especially at "High" compression levels. However, our "Medium" setting is optimized to keep images looking sharp while saving space.' },
      { question: 'Can I compress scanned PDFs?', answer: 'Yes, our tool works perfectly with both generated and scanned PDF documents.' }
    ]
  },
  'pdf-to-jpg': {
    title: 'PDF to JPG Converter Online Free | PDFMaster',
    metaDescription: 'Convert PDF pages to high-quality JPG images online. Extract images from your PDF files for free in seconds.',
    h1: 'Convert PDF to JPG Images',
    h2: 'Quickly Extract Pages as Visual Content',
    content: 'Need to use a PDF page as an image in a presentation or social media post? Our PDF to JPG tool is the solution. It converts each page of your document into a crisp, separate image file. If your PDF has multiple pages, we bundle them into a convenient ZIP folder for easy download. This tool is perfect for extracting individual charts, infographics, or photos from broader PDF reports.',
    faqs: [
      { question: 'What image format is used?', answer: 'We export files as high-quality JPEGs, which are universally compatible with all systems and apps.' },
      { question: 'Can I convert a single page?', answer: 'Yes, even if your document has dozens of pages, you can easily select or extract the ones you need.' },
      { question: 'Is the conversion accurate?', answer: 'Yes, our rendering engine ensures that every element of your PDF page is captured perfectly in the resulting image.' }
    ]
  },
  'jpg-to-pdf': {
    title: 'JPG to PDF Converter Online Free | PDFMaster',
    metaDescription: 'Convert JPG, PNG, and other images to PDF online for free. Create high-quality PDF documents from your photos instantly.',
    h1: 'Convert JPG Images to PDF',
    h2: 'Turn Photos into Professional Documents',
    content: 'Converting your images into a single PDF document is great for sharing portfolios, submitting receipts, or archiving scanned photos. Our JPG to PDF tool supports JPEG, PNG, and BMP formats. You can upload multiple images at once, and they will be converted into a multi-page PDF. It\'s a clean, organized, and professional way to present your visual data.',
    faqs: [
      { question: 'Can I combine multiple images into one PDF?', answer: 'Yes! Simply upload all the images you want, and they will be arranged into a single multi-page PDF file.' },
      { question: 'Does it support PNG files too?', answer: 'Yes, we support JPG, JPEG, PNG, BMP, and TIFF formats.' },
      { question: 'What is the maximum file size for images?', answer: 'You can upload images up to 50MB each for conversion.' }
    ]
  },
  'edit': {
    title: 'Edit PDF Online – Add Text, Watermark | PDFMaster',
    metaDescription: 'Edit PDF files online for free. Use our interactive editor to add text, annotations, and manage your PDF pages with ease.',
    h1: 'Online PDF Editor & Annotator',
    h2: 'Full Control Over Your PDF Content',
    content: 'Missing a typo in your finished PDF? Need to add a note to a colleague? Our Edit PDF tool provides an interactive environment where you can place text anywhere on your document. Use the sidebar to navigate between pages and the toolbar to customize your font size and color. It\'s the perfect lightweight solution for quick modifications without needing expensive software like Adobe Acrobat.',
    faqs: [
      { question: 'Can I edit existing text in the PDF?', answer: 'Current Web PDF technology primarily allows adding new content over existing pages (annotations). Full text modification of existing characters is coming in a future update.' },
      { question: 'Can I move my annotations after placing them?', answer: 'Yes! While in "Select & Edit" mode, you can simply drag your text boxes to reposition them on any page.' },
      { question: 'Does it work on mobile?', answer: 'Yes, our editor is fully responsive, though for precise positioning, we recommend a tablet or desktop.' }
    ]
  },
  'pdf-to-word': {
    title: 'PDF to Word Converter Online – Editable DOCX | PDFMaster',
    metaDescription: 'Convert PDF to editable Word (DOCX) documents for free. Extract text from PDFs accurately with our online converter.',
    h1: 'Convert PDF to Editable Word',
    h2: 'Extract Text for Full Content Control',
    content: 'If you have a PDF that needs significant text overhauls, converting it to a Word document is the best path. Our PDF to Word tool extracts the text content and creates a standard DOCX file that you can open in Microsoft Word, Google Docs, or LibreOffice. While complex layouts might require minor adjustments after conversion, the primary text data is preserved with high precision.',
    faqs: [
      { question: 'Is the Word document editable?', answer: 'Yes, the resulting DOCX file is fully editable just like any Word document you would create from scratch.' },
      { question: 'Does it use OCR?', answer: 'We currently use high-precision text layer extraction. For purely scanned/image-based PDFs, a dedicated OCR tool is required.' },
      { question: 'Are my document formats preserved?', answer: 'Most standard text layouts are preserved. Highly graphical layouts may experience minor shifts during conversion.' }
    ]
  }
};
