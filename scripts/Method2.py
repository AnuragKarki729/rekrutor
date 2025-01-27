from pyresparser import ResumeParser
import spacy
import json
import re
import fitz  # PyMuPDF for extracting text from PDFs

# Replace the file path with the path to your resume
resume_path = "C:/Users/ROG ZEPHYRUS/Desktop/pyreparsertest/Uploaded_Resumes/Howard john4.pdf"

# Function to extract name from the resume text (capitalized or under personal details)
def extract_name_from_text(text):
    name_pattern_capitalized = r"^[A-Z\s]+$"  # Matches fully capitalized names
    name_pattern_personal = r"(?<=Name\s)([A-Za-z\s]+)"  # Matches name after "Name" keyword under personal details

    # Try to match the first pattern (name in all caps at the top)
    match_capitalized = re.match(name_pattern_capitalized, text.splitlines()[0].strip())
    if match_capitalized:
        return match_capitalized.group(0)

    # If no match, try to find the name under the "Personal details" section
    match_personal_details = re.search(name_pattern_personal, text)
    if match_personal_details:
        return match_personal_details.group(1)

    return None

# Function to extract text from a PDF file
def extract_text_from_pdf(pdf_path):
    document = fitz.open(pdf_path)
    text = ""
    for page_num in range(len(document)):
        page = document.load_page(page_num)
        text += page.get_text()  # Extract text from the page
    return text

# Extract data from the resume
data = ResumeParser(resume_path).get_extracted_data()

if data:
    # Extract text from the resume PDF
    resume_text = extract_text_from_pdf(resume_path)

    # Extract the name from the resume text
    extracted_name = extract_name_from_text(resume_text)

    # If the name was found, add it to the extracted data
    if extracted_name:
        data["Name"] = extracted_name

    # Display the extracted data (pretty-print the JSON)
    formatted_data = json.dumps(data, indent=4)
    print(formatted_data)

    # Save the output to a text file
    output_path = "C:/Users/ROG ZEPHYRUS/Desktop/pyreparsertest/Parsed_Resume_Output.txt"
    with open(output_path, "w", encoding="utf-8") as output_file:
        output_file.write(formatted_data)

    print(f"Parsed data has been saved to: {output_path}")
else:
    print("No data extracted. Please check the resume file.")


#pip install spacy==2.3.5
#pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-2.3.1/en_core_web_sm-2.3.1.tar.gz
#pip install pyresparser
#python 3.8 is a must

## This method works 80 percent with most of the format it actually parse the cv 