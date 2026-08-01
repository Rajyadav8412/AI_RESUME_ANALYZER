from google import genai
from django.conf import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)



def analyze_resume_with_ai(resume_text):

    prompt = f"""
You are an expert ATS Resume Reviewer.

Analyze this resume.

Resume:
{resume_text}

Give the response in this exact format:

Summary:
Strengths:
Weaknesses:
Suggestions:
ATS Score:
"""

    response = client.models.generate_content(
    model="models/gemini-3.5-flash",
    contents=prompt,
    )

    return response.text