import time
import os
from PyPDF2 import PdfReader
import fitz  # PyMuPDF
import re
from PIL import Image
import google.generativeai as genai
import json # For pretty printing the final list
import googleapiclient.discovery # For YouTube API integration

# --- Replace this with your actual API keys ---
# Important: In a real application, use environment variables or a secure method
# DO NOT HARDCODE YOUR API KEYS directly in the script.
# Example using environment variable:
# import os
# GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
# YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")
# GEMINI_API_KEY = "AIzaSyCKGMJmX-EZF_zCdUHPMzCxbYLnxjwo4YQ" # Replace with your actual Gemini key
# YOUTUBE_API_KEY = "AIzaSyCExMEEyxR1-XsZD7gskeaJoWUapVxYHno" # Replace with your actual YouTube API key

if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
    print("Error: Please replace 'YOUR_GEMINI_API_KEY' with your actual Google AI API key.")
    exit()

if YOUTUBE_API_KEY == "YOUR_YOUTUBE_API_KEY":
    print("Error: Please replace 'YOUR_YOUTUBE_API_KEY' with your actual YouTube API key.")
    exit()

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# --- Gemini model configuration ---
# Updated system instruction to remove YouTube links request
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=(
        "You are an expert at analyzing study material and syllabus.\n"
        "Given a piece of study content and a syllabus context:\n"
        "1. Generate a suitable subtopic name for this content (a short, descriptive title).\n"
        "2. Generate a concise summary of the study content provided.\n"
        "3. Identify the single most relevant unit number (an integer from 1 to 5) from the syllabus context for this specific content.\n"
        "Respond ONLY in the following strict format, with each field on a new line:\n"
        "SubtopicName: <short descriptive title>\n"
        "Summary: <your concise summary here>\n"
        "Unit: <unit number 1-5>"
    )
)

def extract_text_from_pdfs(directory):
    """
    Extracts text from all PDF files in the given directory using multiple extraction methods
    to ensure comprehensive capture of all text content.

    Args:
        directory (str): Path to the directory containing PDF files.

    Returns:
        list: A list of strings where each string contains text extracted from a PDF. 
              Each PDF's text is chunked into meaningful sections based on content.
    """
    all_extracted_chunks = []

    # Loop through all files in the directory
    for filename in os.listdir(directory):
        if filename.endswith(".pdf"):
            file_path = os.path.join(directory, filename)
            try:
                # First extraction method: PyMuPDF (more thorough extraction)
                print(f"Extracting text from {filename} using PyMuPDF...")
                doc = fitz.open(file_path)
                full_text = ""
                
                # Extract text from each page
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    page_text = page.get_text("text")  # Get plain text
                    full_text += page_text + "\n\n"  # Add double newline between pages
                
                # Fall back to PyPDF2 if PyMuPDF extraction yields too little content
                if len(full_text.strip()) < 100:  # Arbitrary threshold
                    print(f"PyMuPDF extracted limited content, trying PyPDF2 for {filename}...")
                    reader = PdfReader(file_path)
                    backup_text = ""
                    for page in reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            backup_text += page_text + "\n\n"
                    
                    if len(backup_text.strip()) > len(full_text.strip()):
                        full_text = backup_text
                
                # Clean up the extracted text
                full_text = full_text.strip()
                
                # Process the text into meaningful chunks
                if full_text:
                    chunks = chunk_text(full_text, filename)
                    all_extracted_chunks.extend(chunks)
                    print(f"Successfully extracted and chunked {len(chunks)} sections from {filename}")
                else:
                    print(f"Warning: No text content extracted from {filename}")
                
            except Exception as e:
                print(f"Failed to process {filename}: {str(e)}")
                print(f"Exception Type: {type(e).__name__}")

    print(f"Total chunks extracted from all PDFs: {len(all_extracted_chunks)}")
    return all_extracted_chunks


def chunk_text(text, filename):
    """
    Breaks a long text into meaningful chunks for better processing.
    
    Args:
        text (str): The full text extracted from a PDF
        filename (str): The PDF filename for reference
        
    Returns:
        list: A list of text chunks
    """
    # First attempt: Split by section headers (common in academic/educational PDFs)
    # Look for patterns like "Chapter X", "Section X", headers with numbers, etc.
    section_pattern = r'(?:\n|\r\n){2,}(?:[A-Z][A-Z\s]+:|(?:\d+\.){1,3}\s+[A-Z]|[A-Z][a-zA-Z\s]+\s*\n)'
    sections = re.split(section_pattern, text)
    
    # If we have reasonable sections, clean them up
    chunks = []
    if len(sections) > 1 and any(len(s.strip()) > 200 for s in sections):  # At least some substantial sections
        for section in sections:
            clean_section = section.strip()
            if len(clean_section) > 100:  # Only keep sections with meaningful content
                chunks.append(clean_section)
    else:
        # Fallback: Split by paragraphs with minimum length
        paragraphs = re.split(r'(?:\n|\r\n){2,}', text)
        current_chunk = ""
        
        for paragraph in paragraphs:
            clean_para = paragraph.strip()
            if len(clean_para) < 30:  # Skip very short paragraphs (likely headers or page numbers)
                continue
                
            # If adding this paragraph would make the chunk too long, start a new chunk
            if len(current_chunk) + len(clean_para) > 1500:  # Max chunk size
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = clean_para
            else:
                if current_chunk:
                    current_chunk += "\n\n" + clean_para
                else:
                    current_chunk = clean_para
        
        # Add the last chunk if not empty
        if current_chunk:
            chunks.append(current_chunk.strip())
    
    # If we still have too few or no chunks, use a simple length-based approach
    if len(chunks) < 2:
        chunks = []
        for i in range(0, len(text), 1000):
            chunk = text[i:i+1000].strip()
            if chunk:  # Only add non-empty chunks
                chunks.append(chunk)
    
    # Add source information to first few chunks
    for i in range(min(len(chunks), 3)):
        chunks[i] = f"[From PDF: {filename}] " + chunks[i]
    
    return chunks

# --- YouTube API setup ---
def search_youtube_videos(query, max_results=3):
    """
    Search YouTube for videos related to the given query.
    
    Args:
        query (str): The search query.
        max_results (int): Maximum number of results to return.
        
    Returns:
        list: List of YouTube video URLs.
    """
    try:
        youtube = googleapiclient.discovery.build(
            "youtube", "v3", developerKey=YOUTUBE_API_KEY
        )
        
        # Call the search.list method to retrieve results
        search_response = youtube.search().list(
            q=query,
            part="id",
            maxResults=max_results,
            type="video"
        ).execute()
        
        # Extract video URLs from the response
        video_urls = []
        for search_result in search_response.get("items", []):
            if search_result["id"]["kind"] == "youtube#video":
                video_id = search_result["id"]["videoId"]
                video_url = f"https://www.youtube.com/watch?v={video_id}"
                video_urls.append(video_url)
                
        return video_urls
    except Exception as e:
        print(f"Error in YouTube API search: {str(e)}")
        return []

# --- Extract syllabus text from image ---
def extract_syllabus_from_image(image_path):
    """Extracts text content from an image file containing the syllabus."""
    try:
        print(f"Attempting to open image: {image_path}")
        image = Image.open(image_path)
        prompt = "Extract the syllabus content from this image. Return the syllabus exactly as text, including unit divisions if present."
        print("Sending image to Gemini for syllabus extraction...")
        response = model.generate_content([prompt, image])
        # Add robust check for response content
        if response.text:
             syllabus_text = response.text.strip()
             print("\nSuccessfully Extracted Syllabus Text.")
             # print("--- Syllabus Start ---") # Optional: print syllabus for debug
             # print(syllabus_text)
             # print("--- Syllabus End ---")
             return syllabus_text
        else:
             print("Warning: Syllabus extraction resulted in empty text.")
             return ""
    except FileNotFoundError:
        print(f"Error: Syllabus image file not found at '{image_path}'")
        return ""
    except Exception as e:
        # Catching potential API errors or image processing errors
        print(f"Error during syllabus extraction from image: {str(e)}")
        # Log the exception type for more specific debugging if needed
        print(f"Exception Type: {type(e).__name__}")
        return ""

# --- Function to analyze each info string ---
def analyze_study_material(info_string, syllabus_string):
    """
    Analyzes a piece of study content against the syllabus using the Gemini model.

    Args:
        info_string (str): The text content to analyze.
        syllabus_string (str): The full syllabus text for context.

    Returns:
        tuple: (subtopic_name, summary, unit_str) or (None, None, None) on failure.
               subtopic_name is a short title for the content.
               summary is a text summary of the content.
               unit_str is the unit number as a string (e.g., "3").
    """
    # Ensure syllabus context is provided
    if not syllabus_string:
        print("Error: Cannot analyze content without syllabus context.")
        return None, None, None
        
    # Truncate very long content to avoid token limitations
    max_content_length = 8000  # Adjust based on model token limits
    if len(info_string) > max_content_length:
        print(f"Content too long ({len(info_string)} chars), truncating to {max_content_length} chars")
        info_string = info_string[:max_content_length] + "... [content truncated]"

    prompt = f"""
Syllabus Context:
\"\"\"{syllabus_string}\"\"\"

Study Content to Analyze:
\"\"\"{info_string}\"\"\"

Analyze the study content based on the syllabus context. Provide:
1. A short, descriptive subtopic name (3-5 words) for this content.
2. A concise summary of the study content.
3. The most relevant unit number (1-5).
Respond ONLY in the specified format:
SubtopicName: <subtopic_name>
Summary: <summary>
Unit: <unit_number>
"""
    try:
        print(f"\n--- Analyzing Content Snippet --- \n'{info_string[:100]}...'") # Print start of snippet
        print("---------------------------------")
        print("Sending analysis request to Gemini...")
        response = model.generate_content(prompt)
        output = response.text.strip()
        print(f"Gemini Response:\n{output}\n---------------------------------") # For debugging

        subtopic_name, summary, unit_str = "", "", None

        # Use regex for more reliable parsing, ignoring case and handling whitespace
        subtopic_match = re.search(r"^SubtopicName:\s*(.*)", output, re.IGNORECASE | re.MULTILINE)
        summary_match = re.search(r"^Summary:\s*(.*)", output, re.IGNORECASE | re.MULTILINE)
        unit_match = re.search(r"^Unit:\s*(\d)", output, re.IGNORECASE | re.MULTILINE)

        if subtopic_match:
            subtopic_name = subtopic_match.group(1).strip()
        else:
            print("Warning: Could not parse 'SubtopicName:' field from response.")

        if summary_match:
            summary = summary_match.group(1).strip()
        else:
            print("Warning: Could not parse 'Summary:' field from response.")

        if unit_match:
            unit_str = unit_match.group(1) # Will be a string like "1", "2", etc.
        else:
            print("Warning: Could not parse 'Unit:' field from response.")
            # Cannot proceed reliably without a unit
            return None, None, None

        # Basic validation
        if not subtopic_name:
            print("Warning: Subtopic name is empty.")
        if not summary:
            print("Warning: Summary is empty.")
        if not unit_str:
             print("Error: Unit number could not be determined. Cannot assign content.")
             return None, None, None # Essential field missing

        print(f"Parsed - SubtopicName: {'Yes' if subtopic_name else 'No'}, Summary: {'Yes' if summary else 'No'}, Unit: {unit_str if unit_str else 'No'}")
        return subtopic_name, summary, unit_str

    except Exception as e:
        # Log the specific error and the content being processed
        print(f"----- Error during Gemini analysis -----")
        print(f"Content Snippet: '{info_string[:100]}...'")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Details: {str(e)}")
        # Example: Check for common API errors like RateLimitError (often 429)
        if "429" in str(e): # Simple check, might need refinement based on actual error messages
             print("API rate limit likely hit. Consider adding delays or requesting quota increase.")
        print("--------------------------------------")
        return None, None, None

# --- Main Execution ---
def main():
    # --- Configuration ---
    # IMPORTANT: Make sure this image file exists in the same directory
    # or provide the full path.
    CWD = os.getcwd()
    syllabus_image_path = os.path.join(CWD, "..", "backend", "src", "constants", "rawData")
    syllabus_image_path = os.path.abspath(syllabus_image_path)
    pdf_path = syllabus_image_path
    syllabus_image_path = os.path.join(syllabus_image_path, "syllabus.jpg")
    SUBTOPIC_LIMIT_PER_UNIT = 5 # Define the maximum number of entries per unit

    # Extract text from PDFs in the current directory
    print("--- Step 0: Extracting text from PDF files ---")
    info_list = extract_text_from_pdfs(directory=pdf_path)
    
    if not info_list:
        print("Warning: No text extracted from PDFs. Using fallback example content.")
        # Fallback content if PDF extraction fails
        info_list = [
            "Biological hazards, also known as biohazards, refer to biological substances that pose a threat to the health of living organisms, primarily that of humans.",
            "Biosafety cabinets (BSCs) like Class I, Class II, and Class III, are primary containment devices.",
            # Add more fallback content as needed
        ]

    # --- Initialization ---
    # Create the primary nested list structure: 5 empty lists for 5 units
    # Index 0 corresponds to Unit 1, Index 1 to Unit 2, and so on.
    final_nested_list = [[], [], [], [], []]

    print(CWD, syllabus_image_path)

    # --- Syllabus Extraction ---
    print("--- Step 1: Extracting Syllabus from Image ---")
    syllabus_string = extract_syllabus_from_image(syllabus_image_path)

    if not syllabus_string:
        print("\nCritical Error: Syllabus extraction failed. Exiting script.")
        exit()
    else:
        print("Syllabus text extracted successfully.")

    # --- Processing ---
    print(f"\n--- Step 2: Analyzing Content Snippets (Max {SUBTOPIC_LIMIT_PER_UNIT} per Unit) ---")
    processed_count = 0
    skipped_count = 0
    skipped_due_to_limit_count = 0 # Initialize counter for limit skips
    api_call_delay_seconds = 3 # Increase if hitting rate limits

    for i, info_string in enumerate(info_list):
        print(f"\nProcessing Item {i+1}/{len(info_list)}...")
        # Add delay between API calls to respect potential rate limits
        time.sleep(api_call_delay_seconds)

        subtopic_name, summary, unit_str = analyze_study_material(info_string, syllabus_string)

        # Check if essential data was returned
        if subtopic_name and summary and unit_str:
            try:
                unit_num = int(unit_str) # Convert unit string to integer
                # Validate unit number is within the expected range (1 to 5)
                if 1 <= unit_num <= 5:
                    unit_index = unit_num - 1 # Convert to 0-based index for the list

                    # <<<--- START: Unit Limit Check --->>>
                    if len(final_nested_list[unit_index]) < SUBTOPIC_LIMIT_PER_UNIT:
                        # Search YouTube for relevant videos using the subtopic name and summary as query
                        youtube_query = f"{subtopic_name} {summary[:50]}"  # Use subtopic name and first part of summary
                        youtube_links = search_youtube_videos(youtube_query, max_results=2)
                        
                        # Create the subtopic entry in the new format: [subtopic_name, summary, [link1, link2,...]]
                        subtopic_entry = [subtopic_name, summary, youtube_links]

                        # Append this entry to the list corresponding to the identified unit
                        final_nested_list[unit_index].append(subtopic_entry)

                        print(f"Successfully processed and added entry to Unit {unit_num} ({len(final_nested_list[unit_index])}/{SUBTOPIC_LIMIT_PER_UNIT}).")
                        processed_count += 1
                    else:
                        # Unit is full, skip adding this item
                        print(f"Skipping item for Unit {unit_num} because it already has the maximum of {SUBTOPIC_LIMIT_PER_UNIT} entries.")
                        skipped_due_to_limit_count += 1 # Increment specific counter
                        skipped_count += 1 # Also increment general skipped counter
                    # <<<--- END: Unit Limit Check --->>>

                else:
                    print(f"Warning: Received invalid unit number '{unit_num}' (outside 1-5 range). Skipping this item.")
                    skipped_count += 1
            except ValueError:
                # Handle cases where the model returns a non-integer for the unit
                print(f"Warning: Could not convert unit '{unit_str}' to an integer. Skipping this item.")
                skipped_count += 1
            except Exception as e:
                 print(f"Error processing item after analysis (Unit: {unit_str}): {e}. Skipping.")
                 skipped_count += 1
        else:
            # Log if analysis failed to return necessary data
            print(f"Skipping item due to missing SubtopicName, Summary, or Unit from analysis.")
            skipped_count += 1

    # --- Output ---
    print("\n--- Step 3: Final Nested List Output ---")
    # Use json.dumps for a nicely formatted, readable printout of the complex list
    print(json.dumps(final_nested_list, indent=2))
    
    # Save the output to a JSON file for easy reference
    try:
        with open('study_materials_output.json', 'w') as outfile:
            json.dump(final_nested_list, outfile, indent=2)
        print("Results saved to study_materials_output.json")
    except Exception as e:
        print(f"Error saving results to file: {str(e)}")

    # --- Summary Report ---
    print("\n--- Processing Summary ---")
    print(f"Total items in input list: {len(info_list)}")
    print(f"Successfully processed and added: {processed_count}")
    print(f"Skipped (Total): {skipped_count}")
    print(f"  - Skipped due to unit limit ({SUBTOPIC_LIMIT_PER_UNIT}/unit): {skipped_due_to_limit_count}")
    print(f"  - Skipped due to errors/invalid data: {skipped_count - skipped_due_to_limit_count}")
    print("-" * 26)
    for i, unit_content in enumerate(final_nested_list):
        print(f"Unit {i+1} contains {len(unit_content)} entries.")
    print("--------------------------")

    result = {}

    for outer_index, group in enumerate(final_nested_list):
        result[outer_index] = {}
        for inner_index, item in enumerate(group):
            title, summary, links = item
            result[outer_index][inner_index] = {
                "title": title,
                "summary": summary,
                "links": {i: link for i, link in enumerate(links)}
            }

    print(result)

    with open(os.path.join(CWD, "..", "backend", "src", "constants", "processedData", "finalData.json"), "w") as f:
        json.dump(result, f, indent=4)
