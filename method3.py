import sys
import PyPDF2
import re
from pathlib import Path
import json

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text()
    except Exception as e:
        print(f"Error reading PDF: {e}", file=sys.stderr)
        return ""
    return text

def extract_email(text):
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    return match.group(0) if match else ""

def extract_phone(text):
    phone_pattern = r'(\+\d{1,3}[-.]?)?\s*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    match = re.search(phone_pattern, text)
    return match.group(0) if match else ""

def extract_education(text):
    education = []
    # Common education keywords
    edu_keywords = r'(Bachelor|Master|PhD|B\.|M\.|Ph\.D|BSc|MSc|MBA|Associate)'
    # Find paragraphs containing education keywords
    paragraphs = text.split('\n\n')
    for para in paragraphs:
        if re.search(edu_keywords, para, re.IGNORECASE):
            # Clean up the text
            cleaned = ' '.join(para.split())
            education.append(cleaned)
    return education

def extract_skills(text):
    skills = []
    # Look for skills section
    skills_pattern = r'(?i)(skills|technical skills|expertise).*?(?=\n\n|\Z)'
    skills_match = re.search(skills_pattern, text, re.DOTALL)
    
    if skills_match:
        skills_text = skills_match.group(0)
        # Split by common delimiters and clean up
        skill_items = re.split(r'[,•|\n]', skills_text)
        skills = [skill.strip() for skill in skill_items if skill.strip() and len(skill.strip()) > 2]
        # Remove the "Skills" header and any empty strings
        skills = [s for s in skills if not re.match(r'(?i)^(skills|technical skills|expertise)$', s)]
    
    return skills

def main():
    if len(sys.argv) != 2:
        print("Usage: python method3.py <path_to_resume>", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]
    
    if not Path(file_path).exists():
        print(f"File not found: {file_path}", file=sys.stderr)
        sys.exit(1)

    # Extract text from PDF
    text = extract_text_from_pdf(file_path)
    
    if not text:
        print("No text could be extracted from the file", file=sys.stderr)
        sys.exit(1)

    # Extract information
    result = {
        "personal_info": {
            "email": extract_email(text),
            "phone": extract_phone(text)
        },
        "education": extract_education(text),
        "skills": extract_skills(text)
    }

    # Print as JSON (will be parsed by Node.js)
    print(json.dumps(result))

if __name__ == "__main__":
    main() 