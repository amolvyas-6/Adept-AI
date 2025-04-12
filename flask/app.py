from flask import Flask, jsonify
import os

app = Flask(__name__)
CWD = os.getcwd()
target_path = os.path.join(CWD, "..", "backend", "src", "constants", "rawData")
final_path = os.path.abspath(target_path)
print(CWD)

@app.route("/")
def helloWorld():
    return jsonify({"Res": 200})

@app.route("/deleteToken")
def deleteToken():
    import os
    try:
        if os.path.exists("token.json"):
            os.remove("token.json")
        return jsonify({"statusCode": 200, 'body': "Successfully deleted token"})
    except Exception as err:
        print(err)
        return jsonify({"statusCode":404, "body": "Error in deleting token"})

@app.route("/getNotes")
def getNotesFromClassroom():
    import os.path
    import os
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    from googleapiclient.discovery import build
    import io
    from googleapiclient.http import MediaIoBaseDownload

    SCOPES = [  
            'https://www.googleapis.com/auth/classroom.courses.readonly',
            'https://www.googleapis.com/auth/classroom.announcements.readonly',
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
            'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly'
    ]

    def init():
        try:
            creds = None
            if os.path.exists("token.json"):
                creds = Credentials.from_authorized_user_file("token.json", SCOPES)
            # If there are no (valid) credentials available, let the user log in.
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    flow = InstalledAppFlow.from_client_secrets_file(
                            "credentials.json", SCOPES
                    )
                    creds = flow.run_local_server(port=8080, open_browser=True)
                    print(flow.authorization_url()[0])
                # Save the credentials for the next run
                with open("token.json", "w") as token:
                    token.write(creds.to_json())  
            print("OAUTH DONE")
            return creds
        except Exception as err:
            return err

    def downloadFile(drive_service, fileName, fileId):

        print("NOTES doenload begin")
        request = drive_service.files().get_media(fileId=fileId)
        print("../")
        fh = io.FileIO(os.path.join(final_path,fileName), 'wb')
        downloader = MediaIoBaseDownload(fh, request)

        done = False
        while done is False:
                status, done = downloader.next_chunk()
                print(f"  🔽 Downloaded {int(status.progress() * 100)}%")
        print("NOTES doenload done")

    def isPresent(fileName):
        for file in os.listdir(final_path):
            if file == fileName:
                return True
        return False

    def main():
        """Shows basic usage of the Classroom API.
        Prints the names of the first 10 courses the user has access to.
        """
        try:
            creds = init()
            service = build("classroom", "v1", credentials=creds)
            drive_service = build("drive", "v3", credentials=creds)

            # Call the Classroom API
            results = service.courses().list().execute()
            courses = results.get("courses", [])

            print("GOt the Courses")
            if not courses:
                print("No courses found.")
                return
            print("Courses:")
            for course in courses:
                    course_id = course["id"]
                    print(course["name"])
                    announcements = service.courses().announcements().list(courseId=course_id).execute()
                    items = announcements.get('announcements', [])
                    print("Got the anncouncements")
                    for item in items:
                        for material in item.get("materials", []):
                            if "driveFile" in material:
                                    
                                    print("Got the files")
                                    fileInfo = material["driveFile"]["driveFile"]
                                    fileId = fileInfo["id"]
                                    fileName = fileInfo["title"]

                                    if not isPresent(fileName):
                                        downloadFile(drive_service, fileName, fileId)
                                        print("File Downloaded")
                                    else:
                                        print(f'{fileName} skipped as it is already installed!')
        except HttpError as error:
            print(f"An error occurred: {error}")
            return error
    try:
        main()
        return jsonify({"statusCode": 200, 'body': "Successfully installed notes"})
    except Exception as err:
        print(err)
        return jsonify({"statusCode":404, "body": "Error in installing notes"})

@app.route("/getRoadmap")
def getRoadmap():
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
    GEMINI_API_KEY = "AIzaSyCKGMJmX-EZF_zCdUHPMzCxbYLnxjwo4YQ" # Replace with your actual Gemini key
    YOUTUBE_API_KEY = "AIzaSyCExMEEyxR1-XsZD7gskeaJoWUapVxYHno" # Replace with your actual YouTube API key

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

    from gemini import main, extract_text_from_pdfs, chunk_text, search_youtube_videos, extract_syllabus_from_image, analyze_study_material

    try:
        main()
        return jsonify({"statusCode":200, "body": "Successfully Extracted"})
    except:
        return jsonify({"statusCode": 404, "body":"Error in getting roadmap"})