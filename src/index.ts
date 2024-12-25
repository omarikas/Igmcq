import express, { Request, Response } from 'express';
import axios from 'axios';
import { getDocument } from 'pdfjs-dist';
import extract from './extract';

const app = express();
app.use(express.json());  // This will parse the JSON body

// Endpoint to convert PDF from URL to Word
app.post('/convert', async (req: Request, res: Response): Promise<void> => {
   
    console.log(req)
    try {
        // Get the URL from the request body
        const { fileUrl } = req.body;

        if (!fileUrl) {
            res.status(400).send('No URL provided');
            return;
        }

        // Download PDF from the URL using axios
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const pdfBytes = new Uint8Array(response.data as ArrayBuffer);


        // Process the PDF file using pdf.js
        const pdfDoc = await getDocument(pdfBytes).promise;
        const numPages = pdfDoc.numPages;

        // Extract text from each page
        const extractedText: string[] = [];
        for (let i = 1; i <= numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => (item as any).str).join(' ');
            extractedText.push(pageText);
        }
        console.log(extractedText)
        // Process the extracted text
        const sections = extractedText.map((pageText, index) => ({
            pageText
        }));

        let answers: string[] = [];
        let i = 0;
        sections.forEach((section: { pageText: string }) => {
            i++;
            if (i !== 1) {
                const arr: string[] = extract(section.pageText) || [""]; // Use the extract function as before
                answers.push(...arr);
            }
        });

        // Send the answers in the response
        res.send(answers);

    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).send('An error occurred while processing the file');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

