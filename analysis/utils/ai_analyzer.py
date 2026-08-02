from google import genai
from django.conf import settings


client = genai.Client(api_key=settings.GEMINI_API_KEY)

import json


def analyze_resume_with_ai(resume_text):

    prompt = f"""
You are an expert ATS Resume Reviewer.

Analyze the following resume and return ONLY valid JSON.

Resume:
{resume_text}

Return ONLY this JSON object.
Do not write markdown.
Do not use ```json.
Do not add explanations.

{{
    "summary": "string",
    "strengths": [
        "string"
    ],
    "weaknesses": [
        "string"
    ],
    "suggestions": [
        "string"
    ],
    "ats_score": 0
    ats_score must be an integer between 0 and 100.
    Score the resume realistically based on ATS compatibility, technical depth, projects, experience, formatting, and keyword optimization.

    Give at least 4 strengths, 4 weaknesses and 4 suggestions.
}}
"""

    response = client.models.generate_content(
    model="models/gemini-3.5-flash",
    contents=prompt,
    )

    text = response.text.strip()

    print(text)

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()

    return json.loads(text)