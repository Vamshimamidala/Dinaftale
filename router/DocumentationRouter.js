const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Note = require('../modal/DocumentationModal');

const router = express.Router();

const notesDirectory = path.join(__dirname, '../notes');
if (!fs.existsSync(notesDirectory)) {
  fs.mkdirSync(notesDirectory, { recursive: true });
}

router.post('/create', async (req, res) => {
  try {
    const { content } = req.body;

    // Save the note to the database
    const newNote = new Note({ content });
    await newNote.save();

    // Generate the PDF
    const doc = new PDFDocument();
    const filePath = path.join(notesDirectory, `${newNote._id}.pdf`);
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);
    doc.fontSize(12).text(content);
    doc.end();

    writeStream.on('finish', () => {
      res.status(201).json({
        message: 'Note created and PDF saved successfully',
        note: newNote,
        //notes is the save the pdf files
        pdfUrl: `/notes/${newNote._id}.pdf`, // Relative URL for accessing the PDF
      });
    });
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create note',
      error: error.message,
    });
  }
});

// Route to serve saved PDFs
router.get('/notes/:id.pdf', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(notesDirectory, `${id}.pdf`);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${id}.pdf`); // Use 'attachment' instead of 'inline' for download
    return res.sendFile(filePath);
  }

  res.status(404).json({ message: 'PDF not found' });
});

module.exports = router;
