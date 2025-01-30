import docx2txt
from pdfminer.high_level import extract_text
import os
from typing import Optional, Dict
import spacy
import re
from pyresparser import ResumeParser
import nltk
import sys

# Download required NLTK data
nltk.download('stopwords', quiet=True)
nltk.download('punkt', quiet=True)
nltk.download('words', quiet=True)

def extract_text_from_file(file_path: str) -> Optional[str]:
    """
    Extract text from different file formats (PDF, DOCX, DOC)
    
    Args:
        file_path (str): Path to the resume file
        
    Returns:
        str: Extracted text from the file
        None: If file format is not supported or extraction fails
    """
    try:
        # Check if file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Get file extension
        file_extension = os.path.splitext(file_path)[1].lower()
        
        # Extract text based on file type
        if file_extension == '.pdf':
            return extract_text(file_path)
            
        elif file_extension == '.docx':
            return docx2txt.process(file_path)
            
        elif file_extension == '.doc':
            # For .doc files, you might want to use antiword or other libraries
            raise NotImplementedError("DOC format is not supported yet. Please convert to DOCX or PDF.")
            
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
            
    except Exception as e:
        print(f"Error extracting text from file: {e}")
        return None

def extract_resume_info(file_path: str) -> Dict:
    """Extract skills from resume"""
    try:
        parser = ResumeParser(file_path)
        data = parser.get_extracted_data()
        return {'skills': data.get('skills', [])}
    except Exception as e:
        print(f"Error parsing resume: {e}")
        return {'skills': []}

def display_resume_info(info: Dict):
    """Display the extracted information in a formatted way"""
    print("\n=== Resume Information ===")
    
    print("\nSkills:")
    if info.get('skills'):
        for skill in info['skills']:
            print(f"• {skill}")
    else:
        print("No skills found")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Error: Please provide a file path")
        sys.exit(1)
    
    file_path = sys.argv[1]
    resume_info = extract_resume_info(file_path)
    print(resume_info['skills'])  # Only print the skills array
