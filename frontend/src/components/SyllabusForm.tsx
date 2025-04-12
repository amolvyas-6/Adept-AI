import React, { useRef, useState, ChangeEvent, MouseEventHandler } from "react"; // Import React and hooks
import { sendImg } from "../lib/api"; // Your API function
import { useMutation } from "@tanstack/react-query"; // Import useMutation
import './syllabusForm.css'

// Define an interface for potential API error structure if known
interface ApiError {
    message?: string;
    // Add other potential error fields if applicable
}

const SyllabusForm = () => {
    // --- Refs and State ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Store the selected file directly for cleaner state management
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // --- Mutation ---
    const {
        // Renamed mutate function for clarity as it sends an image
        mutate: uploadImageMutate,
        isPending: isUploading, // Use a more general 'isUploading' state name
        isError: hasUploadError, // Use a more descriptive name
        error: uploadError // Use a more descriptive name
    } = useMutation<unknown, ApiError, FormData>({ // Add types for better safety
        mutationFn: sendImg,
        onSuccess: () => {
            // Keep the original onSuccess behavior
            window.location.reload();
        },
        // onError: (err) => { // Optional: Add specific error handling if needed
        //  console.error("Upload failed:", err);
        // }
    });

    // --- Event Handlers ---
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // Only accept JPEG files based on the label? Add validation if needed.
        // Example validation:
        // if (file && file.type !== 'image/jpeg') {
        //     alert('Please select a JPG file.');
        //     setSelectedFile(null);
        //     if(fileInputRef.current) fileInputRef.current.value = ''; // Clear input
        //     return;
        // }
        setSelectedFile(file || null); // Set to null if no file is selected/valid
    };

    const handleUploadClick: MouseEventHandler<HTMLButtonElement> = () => {
        if (selectedFile) {
            const formDataToUpload = new FormData(); // Create FormData here
            formDataToUpload.append("file", selectedFile);
            uploadImageMutate(formDataToUpload);
        } else {
            // Optional: Add user feedback if no file is selected
            console.log("No file selected to upload.");
        }
    };

    // --- Derived State for Rendering ---
    const isFileSelected = !!selectedFile;
    const buttonIsDisabled = !isFileSelected || isUploading; // Disable if no file or upload is pending

    const showError = hasUploadError;
    const errorMessage = uploadError?.message || "An error occurred during upload.";

    // --- Render Logic (Native HTML Only) ---
    // Basic styles are applied inline for demonstration.
    // For real applications, prefer CSS classes and stylesheets.
    return (
        <> {/* React Fragment */}
            <div >
                {/* Conditional Rendering for Errors */}
                {showError && (
                    <div className="error"> {/* Approximates color='red.400' and mb={3} */}
                        {errorMessage}
                    </div>
                )}

                {/* Form Content - Using div for layout */}
                <div className="content"> {/* Approximates Stack spacing={4} */}
                    {/* Input Group */}
                     {/* Approximates FormControl */}
                        <label htmlFor='imgInput' > {/* Approximates FormLabel */}
                            Select jpg file
                        </label>
                        <input
                            id='imgInput' // For label association
                            type='file'
                            accept="image/jpeg, image/jpg" // Specify accepted file types
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            
                            // value prop is not controlled for type='file'
                        />

                    {/* Upload Button */}
                    <button
                    className="upload-btn"
                        type="button" // Explicitly type as button
                        disabled={buttonIsDisabled}
                        onClick={handleUploadClick}// Approximates my={2}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Syllabus'} {/* Show loading state */}
                    </button>
                </div>
            </div>
        </>
    );
};

export default SyllabusForm;