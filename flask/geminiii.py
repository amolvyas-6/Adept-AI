import time
import os
from PyPDF2 import PdfReader
import fitz  # PyMuPDF
import re
from PIL import Image
import google.generativeai as genai
import json
import googleapiclient.discovery

# --- Replace this with your actual API keys ---
GEMINI_API_KEY = "AIzaSyCKGMJmX-EZF_zCdUHPMzCxbYLnxjwo4YQ" # Replace with your actual Gemini key
YOUTUBE_API_KEY = "AIzaSyCKGMJmX-EZF_zCdUHPMzCxbYLnxjwo4YQ" # Replace with your actual YouTube API key

if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
    exit()

if YOUTUBE_API_KEY == "YOUR_YOUTUBE_API_KEY":
    exit()

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# --- Gemini model configuration ---
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
    all_extracted_chunks = []
    for filename in os.listdir(directory):
        if filename.endswith(".pdf"):
            file_path = os.path.join(directory, filename)
            try:
                doc = fitz.open(file_path)
                full_text = ""
                
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    page_text = page.get_text("text")
                    full_text += page_text + "\n\n"
                
                if len(full_text.strip()) < 100:
                    reader = PdfReader(file_path)
                    backup_text = ""
                    for page in reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            backup_text += page_text + "\n\n"
                    
                    if len(backup_text.strip()) > len(full_text.strip()):
                        full_text = backup_text
                
                full_text = full_text.strip()
                
                if full_text:
                    chunks = chunk_text(full_text, filename)
                    all_extracted_chunks.extend(chunks)
            except Exception:
                pass
    return all_extracted_chunks


def chunk_text(text, filename):
    section_pattern = r'(?:\n|\r\n){2,}(?:[A-Z][A-Z\s]+:|(?:\d+\.){1,3}\s+[A-Z]|[A-Z][a-zA-Z\s]+\s*\n)'
    sections = re.split(section_pattern, text)
    
    chunks = []
    if len(sections) > 1 and any(len(s.strip()) > 200 for s in sections):
        for section in sections:
            clean_section = section.strip()
            if len(clean_section) > 100:
                chunks.append(clean_section)
    else:
        paragraphs = re.split(r'(?:\n|\r\n){2,}', text)
        current_chunk = ""
        
        for paragraph in paragraphs:
            clean_para = paragraph.strip()
            if len(clean_para) < 30:
                continue
                
            if len(current_chunk) + len(clean_para) > 1500:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = clean_para
            else:
                if current_chunk:
                    current_chunk += "\n\n" + clean_para
                else:
                    current_chunk = clean_para
        
        if current_chunk:
            chunks.append(current_chunk.strip())
    
    if len(chunks) < 2:
        chunks = []
        for i in range(0, len(text), 1000):
            chunk = text[i:i+1000].strip()
            if chunk:
                chunks.append(chunk)
    
    for i in range(min(len(chunks), 3)):
        chunks[i] = f"[From PDF: {filename}] " + chunks[i]
    
    return chunks

def search_youtube_videos(query, max_results=3):
    try:
        youtube = googleapiclient.discovery.build(
            "youtube", "v3", developerKey=YOUTUBE_API_KEY
        )
        
        search_response = youtube.search().list(
            q=query,
            part="id",
            maxResults=max_results,
            type="video"
        ).execute()
        
        video_urls = []
        for search_result in search_response.get("items", []):
            if search_result["id"]["kind"] == "youtube#video":
                video_id = search_result["id"]["videoId"]
                video_url = f"https://www.youtube.com/watch?v={video_id}"
                video_urls.append(video_url)
                
        return video_urls
    except Exception:
        return []

def extract_syllabus_from_image(image_path):
    try:
        image = Image.open(image_path)
        prompt = "Extract the syllabus content from this image. Return the syllabus exactly as text, including unit divisions if present."
        response = model.generate_content([prompt, image])
        if response.text:
            return response.text.strip()
        else:
            return ""
    except Exception:
        return ""

def analyze_study_material(info_string, syllabus_string):
    if not syllabus_string:
        return None, None, None
        
    max_content_length = 8000
    if len(info_string) > max_content_length:
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
        response = model.generate_content(prompt)
        output = response.text.strip()

        subtopic_name, summary, unit_str = "", "", None

        subtopic_match = re.search(r"^SubtopicName:\s*(.*)", output, re.IGNORECASE | re.MULTILINE)
        summary_match = re.search(r"^Summary:\s*(.*)", output, re.IGNORECASE | re.MULTILINE)
        unit_match = re.search(r"^Unit:\s*(\d)", output, re.IGNORECASE | re.MULTILINE)

        if subtopic_match:
            subtopic_name = subtopic_match.group(1).strip()
        
        if summary_match:
            summary = summary_match.group(1).strip()
        
        if unit_match:
            unit_str = unit_match.group(1)
        else:
            return None, None, None

        if not subtopic_name or not summary or not unit_str:
            return None, None, None

        return subtopic_name, summary, unit_str

    except Exception:
        return None, None, None

if __name__ == "__main__":
    syllabus_image_path = "syllabus.jpg"
    SUBTOPIC_LIMIT_PER_UNIT = 5
    
    info_list = extract_text_from_pdfs(directory='.')
    
    if not info_list:
        info_list = [
            "Biological hazards, also known as biohazards, refer to biological substances that pose a threat to the health of living organisms, primarily that of humans.",
            "Biosafety cabinets (BSCs) like Class I, Class II, and Class III, are primary containment devices.",
        ]

    final_nested_list = [[], [], [], [], []]
    
    syllabus_string = extract_syllabus_from_image(syllabus_image_path)

    if not syllabus_string:
        exit()
    
    processed_count = 0
    skipped_count = 0
    skipped_due_to_limit_count = 0
    api_call_delay_seconds = 3

    for i, info_string in enumerate(info_list):
        time.sleep(api_call_delay_seconds)

        subtopic_name, summary, unit_str = analyze_study_material(info_string, syllabus_string)

        if subtopic_name and summary and unit_str:
            try:
                unit_num = int(unit_str)
                if 1 <= unit_num <= 5:
                    unit_index = unit_num - 1

                    if len(final_nested_list[unit_index]) < SUBTOPIC_LIMIT_PER_UNIT:
                        youtube_query = f"{subtopic_name} {summary[:50]}"
                        youtube_links = search_youtube_videos(youtube_query, max_results=2)
                        
                        # Updated part: Put complete strings inside lists instead of splitting them
                        subtopic_name_list = [subtopic_name]
                        summary_list = [summary]
                        
                        subtopic_entry = [subtopic_name_list, summary_list, youtube_links]
                        final_nested_list[unit_index].append(subtopic_entry)
                        processed_count += 1
                    else:
                        skipped_due_to_limit_count += 1
                        skipped_count += 1
                else:
                    skipped_count += 1
            except ValueError:
                skipped_count += 1
            except Exception:
                skipped_count += 1
        else:
            skipped_count += 1

    # Save the output to a JSON file
    try:
        with open('study_materials_output.json', 'w') as outfile:
            json.dump(final_nested_list, outfile, indent=2)
    except Exception:
        pass