import json
import os
import tempfile
import boto3
from pyresparser import ResumeParser
import nltk
import base64

# Download NLTK data to /tmp since Lambda's filesystem is read-only
nltk.data.path.append("/tmp")
for package in ['stopwords', 'punkt', 'words']:
    try:
        nltk.download(package, download_dir="/tmp", quiet=True)
    except Exception as e:
        print(f"Error downloading {package}: {e}")

def lambda_handler(event, context):
    try:
        # Get the file content from the request
        file_content = base64.b64decode(event['body'])
        file_name = event.get('fileName', 'resume.pdf')
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_name)[1], dir='/tmp') as temp_file:
            temp_file.write(file_content)
            temp_path = temp_file.name
        
        # Extract skills using pyresparser
        parser = ResumeParser(temp_path)
        data = parser.get_extracted_data()
        skills = data.get('skills', [])
        
        # Clean up temp file
        os.unlink(temp_path)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # For CORS
            },
            'body': json.dumps({
                'skills': skills
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e)
            })
        } 