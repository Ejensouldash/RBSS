// utils/fileExtractor.ts

// Make sure TypeScript knows about the global libraries from the CDN
declare global {
    interface Window {
        XLSX: any;
        mammoth: any;
        pdfjsLib: any;
    }
}

const withTimeout = <T>(promise: Promise<T>, ms: number, timeoutError: Error): Promise<T> => {
    const timeout = new Promise<T>((_, reject) => {
        setTimeout(() => {
            reject(timeoutError);
        }, ms);
    });
    return Promise.race([promise, timeout]);
};


// Function to read plain text files
const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target?.result as string);
        };
        reader.onerror = (error) => {
            reject(new Error("Failed to read text file."));
        };
        reader.readAsText(file);
    });
};

// Function to read Excel files with a plain text fallback
const readExcelFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Primary attempt: Use XLSX library if available
        if (typeof window.XLSX !== 'undefined') {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                    const workbook = window.XLSX.read(data, { type: 'array' });
                    let content = '';
                    workbook.SheetNames.forEach((sheetName: string) => {
                        const worksheet = workbook.Sheets[sheetName];
                        content += `--- START OF SHEET: ${sheetName} ---\n`;
                        content += window.XLSX.utils.sheet_to_csv(worksheet);
                        content += `\n--- END OF SHEET: ${sheetName} ---\n\n`;
                    });
                     if (!content.trim()) {
                         throw new Error("XLSX parsed empty content.");
                    }
                    resolve(content);
                } catch (e) {
                    // If XLSX parsing fails for any reason, fall back to plain text.
                    console.warn("XLSX parsing failed, falling back to plain text reader.", e);
                    readTextFile(file).then(resolve).catch(reject);
                }
            };
            reader.onerror = (error) => {
                 // If reading as ArrayBuffer fails, also fall back to plain text.
                console.warn("Reading Excel as ArrayBuffer failed, falling back to plain text reader.", error);
                readTextFile(file).then(resolve).catch(reject);
            };
            reader.readAsArrayBuffer(file);
        } else {
            // Fallback: If XLSX library is not loaded at all, read as plain text.
            console.warn("XLSX library not loaded. Falling back to reading file as plain text.");
            readTextFile(file).then(resolve).catch(reject);
        }
    });
};

// Function to read Word files
const readDocxFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (typeof window.mammoth === 'undefined') {
            return reject(new Error("Word library (Mammoth.js) is not loaded."));
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            window.mammoth.extractRawText({ arrayBuffer: event.target?.result })
                .then((result: { value: string }) => {
                    resolve(result.value);
                })
                .catch((error: any) => {
                    reject(new Error("Failed to extract text from Word file."));
                });
        };
        reader.onerror = (error) => {
            reject(new Error("Failed to read Word file."));
        };
        reader.readAsArrayBuffer(file);
    });
};

// Function to read PDF files
const readPdfFile = async (file: File): Promise<string> => {
    // Dynamically import the pdf.js library module
    const pdfjsLib = await (window as any).pdfjsLib;

    if (!pdfjsLib) {
        // Fallback for older browsers or different loading mechanisms
        // Attempt to dynamically load it if it's not present. This is a failsafe.
        try {
            await new Promise<void>((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';
                script.type = 'module';
                script.onload = () => resolve();
                script.onerror = reject;
                document.head.appendChild(script);
            });
             (window as any).pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');

        } catch (e) {
             throw new Error("Could not load PDF library.");
        }
    }
    
    (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = async (event) => {
            try {
                const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
                const pdf = await (window as any).pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + '\n\n';
                }
                
                if (!fullText.trim()) {
                     return reject(new Error("Teks dalam dokumen ini tidak dapat dibaca sepenuhnya. Sila pastikan BQ dalam format PDF teks atau Excel."));
                }
                resolve(fullText);

            } catch (error) {
                console.error(error);
                reject(new Error("Failed to parse PDF file. It might be a scanned document."));
            }
        };
        reader.onerror = () => {
            reject(new Error("Failed to read PDF file."));
        };
        reader.readAsArrayBuffer(file);
    });
};


// Main extractor function
export const extractTextFromFile = (file: File): Promise<string> => {
    const timeoutError = new Error("Gagal membaca fail dalam masa 20 saat. Fail ini mungkin diimbas (gambar) atau terlalu kompleks. Sila gunakan fail BQ berasaskan teks (digital) seperti PDF asal atau Excel.");

    let extractionPromise: Promise<string>;
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
        case 'txt':
        case 'csv':
            extractionPromise = readTextFile(file);
            break;
        case 'xlsx':
        case 'xls':
            extractionPromise = readExcelFile(file);
            break;
        case 'docx':
            extractionPromise = readDocxFile(file);
            break;
        case 'pdf':
            extractionPromise = readPdfFile(file);
            break;
        default:
            // Fallback for unknown types, attempt to read as text
            console.warn(`Unsupported file type: .${extension}. Attempting to read as plain text.`);
            extractionPromise = readTextFile(file);
    }
    
    return withTimeout(extractionPromise, 20000, timeoutError);
};