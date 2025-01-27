import re
import spacy
import fitz  # PyMuPDF for extracting text from PDFs
import json

# Load spaCy model (make sure you have spacy installed and the en_core_web_sm model downloaded)
nlp = spacy.load('en_core_web_sm')

# Function to extract text from a PDF
def extract_text_from_pdf(pdf_path):
    document = fitz.open(pdf_path)
    text = ""
    for page_num in range(len(document)):
        page = document.load_page(page_num)
        text += page.get_text()
    return text

# Function to clean extracted text
def clean_text(text):
    # Remove bullet points like \uf0b7 and any extra spaces or newlines
    cleaned_text = re.sub(r'[\uf0b7\n]+', ' ', text)  # Replace bullet points and newlines with a space
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text)  # Replace multiple spaces with a single space
    return cleaned_text.strip()  # Remove any leading or trailing spaces

# Function to extract skills from the "Skills" section
def extract_skills(text):
    skills_section_pattern = re.compile(r"(Skills)(.*?)(Experience|Work History|Education|$)", re.DOTALL)
    match = skills_section_pattern.search(text)
    
    if match:
        skills_text = match.group(2).strip()  # Extract the part after the "Skills" header

        # Match skills (assuming they are separated by bullet points or commas)
        skills = re.findall(r"[\w/]+(?: [\w/]+)*", skills_text)

        # Clean up the skills list by removing duplicates and unnecessary words
        cleaned_skills = [skill.strip() for skill in skills if len(skill.strip()) > 1]

        return sorted(set(cleaned_skills))
    
    return []

# Function to extract experience from the "Experience" section
def extract_experience(text):
    experience_section_pattern = re.compile(r"(Experience|Work History)(.*?)(Education|$)", re.DOTALL)
    match = experience_section_pattern.search(text)
    
    if match:
        experience_text = match.group(2).strip()  # Extract the part after the "Experience" header

        # Split experience by bullet points or newlines
        experience = re.split(r"•|", experience_text)

        # Clean up the experience list
        cleaned_experience = [clean_text(exp) for exp in experience if len(exp.strip()) > 1]

        return cleaned_experience
    
    return []

# Function to extract education from the "Education" section
def extract_education(text):
    """
    Simple education section extractor for testing
    """
    print("\n=== EDUCATION SECTION TESTING ===")
    print("Looking for education section...\n")
    
    lines = text.split('\n')
    is_edu_section = True
    education_text = []
    
    # Education section markers
    edu_markers = ["education", "academic background", "qualification", "academic"]
    # Section endings
    section_endings = ["experience", "skills", "projects", "achievements", "work"]
    
    for line in lines:
        line = line.strip()
        print(f"Processing line: '{line}'")
        if not line:
            continue
            
        # Check if education section starts
        if any(marker in line.lower() for marker in edu_markers):
            print(f"Found education marker: '{line}'")
            is_edu_section = True
            education_text.append(line)
            continue
            
        # If we're in education section, collect all text
        if is_edu_section:
            # Check if we've hit the next section
            if any(ending in line.lower() for ending in section_endings):
                print(f"\nEducation section ended at: '{line}'")
                is_edu_section = False
                break
                
            education_text.append(line)
            print(f"Found line: '{line}'")
    
    print("\n=== END OF EDUCATION SECTION ===\n")
    return education_text

# Function to extract name, phone number, and email using spaCy and regex
def extract_personal_info(text):
    # Run the text through spaCy
    doc = nlp(text)

    # Extract name (using spaCy's NER for PERSON entities)
    name = ""
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text.strip()
            break  # Assuming the first "PERSON" entity is the name

    # Extract phone number using regex (basic phone number pattern)
    phone_pattern = r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
    phone_matches = re.findall(phone_pattern, text)

    # Extract email address using regex
    email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,}"
    email_matches = re.findall(email_pattern, text)

    # Return the extracted personal information
    return {
        "Name": name,
        "Phone": phone_matches if phone_matches else None,
        "Email": email_matches if email_matches else None
    }

# Main function to parse the resume
def parse_resume(file_path):
    resume_text = extract_text_from_pdf(file_path)
    cleaned_text = clean_text(resume_text)
    
    # Update the parsed_data dictionary to include education
    parsed_data = {
        "Personal Info": extract_personal_info(cleaned_text),
        "Skills": extract_skills(cleaned_text),
        "Experience": extract_experience(cleaned_text),
        "Education": extract_education(cleaned_text)  # Add education extraction
    }
    return parsed_data

# Function to test keywords in the resume
def test_keywords_in_resume(file_path, keywords):
    resume_text = extract_text_from_pdf(file_path)

    # Extract skills, experience, and education
    skills = extract_skills(resume_text)
    education = extract_education(resume_text)

    # Extract personal information (name, phone, email)
    personal_info = extract_personal_info(resume_text)

    # Test keywords in the resume text
    keyword_matches = []
    for keyword in keywords:
        match = re.search(r"\\b{}\\b".format(keyword), resume_text, re.IGNORECASE)
        if match:
            context = match.group(0)
            keyword_matches.append({"keyword": keyword, "found": True, "context": context})
        else:
            keyword_matches.append({"keyword": keyword, "found": False, "context": None})

    return {
        "personal_info": personal_info,
        "skills": skills,
        "education": education,
        "keyword_matches": keyword_matches
    }

if __name__ == "__main__":
    # Prompt for resume path
    print("\n=== Resume Keyword Testing ===")
    resume_path = input("\nEnter the path to your resume PDF: ").strip('"').strip("'")
    
    # Default keywords for testing - you can modify these
    keywords = ["python", "java", "communication", "leadership", "project management"]
    
    print("\nTesting resume against keywords:", ", ".join(keywords))
    print("\nAnalyzing...\n")
    
    try:
        results = test_keywords_in_resume(resume_path, keywords)
        
        print("\n=== FULL RESULTS ===")
        print("\nPersonal Information:")
        for key, value in results["personal_info"].items():
            print(f"{key}: {value}")
        
        print("\nRaw Education Section Content:")
        if results.get("education"):
            for line in results["education"]:
                print(f"-> {line}")
        else:
            print("No education information found")
        
        print("\nSkills Found:")
        print(", ".join(results["skills"]))
        
        print("\nKeyword Matches:")
        for match in results["keyword_matches"]:
            status = "✓" if match["found"] else "✗"
            print(f"\n{status} {match['keyword']}:")
            if match["found"] and match["context"]:
                print(f"   Context: {match['context']}")
                
    except FileNotFoundError:
        print(f"Error: Could not find file at {resume_path}")
        print("Please make sure the file path is correct and try again.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        print("Please make sure you're using a valid PDF file.")

#this method only work in strict format cuz it doesnt use machine learning to parse 
#i formated the example plain.pdf cv in this following order
#name title, skill, experience, education and the regex find those title keyword to extract everything under each section
#we can fix our regex based on any changes
