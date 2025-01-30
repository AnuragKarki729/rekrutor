import os
from pathlib import Path
from docx import Document  # Changed from import docx
import PyPDF2
import win32com.client  # for doc files
from typing import Union
import sys

def extract_from_pdf(file_path: Union[str, Path]) -> str:
    """Extract text from a PDF file."""
    try:
        with open(file_path, 'rb') as file:
            # Create PDF reader object
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            # Extract text from each page
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
    except Exception as e:
        return f"Error extracting PDF text: {str(e)}"

def extract_from_docx(file_path: Union[str, Path]) -> str:
    """Extract text from a DOCX file."""
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        return f"Error extracting DOCX text: {str(e)}"

def extract_from_doc(file_path: Union[str, Path]) -> str:
    """Extract text from a DOC file."""
    try:
        word = win32com.client.Dispatch("Word.Application")
        word.visible = False
        doc = word.Documents.Open(str(Path(file_path).absolute()))
        text = doc.Content.Text
        doc.Close()
        word.Quit()
        return text.strip()
    except Exception as e:
        return f"Error extracting DOC text: {str(e)}"

def extract_text(file_path: Union[str, Path]) -> str:
    """
    Extract text from PDF, DOC, or DOCX file.
    Returns the extracted text as a string.
    """
    file_path = Path(file_path)
    
    if not file_path.exists():
        return "Error: File does not exist"
    
    file_extension = file_path.suffix.lower()
    
    if file_extension == '.pdf':
        return extract_from_pdf(file_path)
    elif file_extension == '.docx':
        return extract_from_docx(file_path)
    elif file_extension == '.doc':
        return extract_from_doc(file_path)
    else:
        return "Error: Unsupported file format"

# Example usage
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Error: Please provide a file path")
        sys.exit(1)
    
    file_path = sys.argv[1]
    extracted_text = extract_text(file_path)
    print(extracted_text)
