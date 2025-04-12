import React, { useRef, useState, ChangeEvent, MouseEventHandler } from "react"; // React imports are still needed
import { sendLink, sendPDF } from "../lib/api";
import { useMutation } from "@tanstack/react-query";
import './pdfForm.css'

// Define an interface for potential API error structure if known
interface ApiError {
    message?: string;
    // Add other potential error fields if applicable
}

const PdfForm = () => {
    // --- Refs and State ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // --- Mutations ---
    const {
        mutate: uploadPDFMutate,
        isPending: isUploadingPDF,
        isError: isPDFError,
        error: pdfError
    } = useMutation<unknown, ApiError, FormData>({
        mutationFn: sendPDF
    });

    const {
        mutate: uploadLinkMutate,
        isPending: isUploadingLink,
        isError: isLinkError,
        error: linkError
    } = useMutation<unknown, ApiError, void>({
        mutationFn: sendLink
    });

    // --- Event Handlers ---
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setSelectedFile(file || null);
    };

    const handleUploadPDFClick: MouseEventHandler<HTMLButtonElement> = () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);
            uploadPDFMutate(formData);
        }
    };

    const handleUploadLinkClick: MouseEventHandler<HTMLButtonElement> = () => {
        uploadLinkMutate();
    };

    // --- Derived State for Rendering ---
    const isFileSelected = !!selectedFile;
    const isUploading = isUploadingPDF || isUploadingLink;

    const pdfButtonIsDisabled = !isFileSelected || isUploading;
    // const linkButtonIsDisabled = !isFileSelected || isUploading; // Based on original logic

    const showPdfError = isPDFError;
    const pdfErrorMessage = pdfError?.message || "An error occurred uploading the PDF.";

    const showLinkError = isLinkError;
    const linkErrorMessage = linkError?.message || "An error occurred with the link operation.";

    // --- Render Logic (Native HTML Only) ---
    // Basic styles are applied inline for demonstration.
    // For real applications, prefer CSS classes and stylesheets.
    return (
        <> {/* React Fragment is still needed to return a single root element */}
            <div>
                {/* Conditional Rendering for Errors */}
                {showPdfError && (
                    <div className="error"> {/* Approximates color='red.400' and mb={3} */}
                        {pdfErrorMessage}
                    </div>
                )}
                {showLinkError && (
                    <div className="error"> {/* Approximates color='red.400' and mb={3} */}
                        {linkErrorMessage}
                    </div>
                )}

                {/* Form Content - Using div for layout */}
                <div className="content"> {/* Approximates Stack spacing={4} */}
                    {/* Input Group */}
                        <label htmlFor='pdfInput'> {/* Approximates FormLabel */}
                            Select PDF
                        </label>
                    {/* Approximates FormControl */}
                        <input
                            id='pdfInput' // Link label and input
                            type='file'
                            accept=".pdf"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ /* Add basic input styling if needed */ }}
                        />

                    {/* Buttons */}
                    <button 
                        className="upload-btn"
                        type="button" // Good practice for buttons not submitting a form
                        disabled={pdfButtonIsDisabled}
                        onClick={handleUploadPDFClick} // Approximates my={2}
                    >
                        {isUploadingPDF ? 'Uploading...' : 'Upload PDF'} {/* Handle loading state */}
                    </button>
                    <button
                        className="gc-btn"
                        type="button"
                        onClick={handleUploadLinkClick}
 // Approximates my={2}
                    >
                        {isUploadingLink ? 'Processing...' : 'Use Google Classroom'} {/* Handle loading state */}
                    </button>
                </div>
            </div>
        </>
    );
};

export default PdfForm;