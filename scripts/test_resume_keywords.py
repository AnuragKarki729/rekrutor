from pyresparser import ResumeParser

data = ResumeParser(r"C:\Users\User\Desktop\Job Applications\Anurag Karki Resume.pdf").get_extracted_data()
print(data)