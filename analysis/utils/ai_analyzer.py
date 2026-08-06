from google import genai
from django.conf import settings


client = genai.Client(api_key=settings.GEMINI_API_KEY)

import json

GEMINI_MODEL = "models/gemini-3.6-flash"

def analyze_resume_with_ai(resume_text, target_role=""):

    role = target_role or "the candidate's most relevant target role"

    prompt = f"""
You are an expert ATS Resume Reviewer.

Analyze this resume for the target role: {role}.
Evaluate the candidate against realistic expectations for that role. Be specific
about missing role-relevant skills, projects, experience, keywords and evidence.
Do not give generic advice. Do not invent experience, skills or achievements.

Resume:
{resume_text}

Return ONLY valid JSON, with no Markdown or explanation outside the JSON.
Use this exact schema:
{{
  "target_role": "{role}",
  "ats_score": 0,
  "summary": "A concise 2-3 sentence role-specific review.",
  "role_match": "A concise explanation of fit for the target role.",
  "strengths": ["At least four evidence-based strengths"],
  "weaknesses": ["At least four concrete gaps"],
  "suggestions": ["At least four prioritized improvements"],
  "missing_keywords": ["Important role-specific keyword not supported by the resume"],
  "score_breakdown": {{
    "skills_match": 0,
    "project_experience": 0,
    "ats_formatting": 0,
    "role_alignment": 0
  }}
}}

ats_score and each score_breakdown value must be an integer from 0 to 100.
"""
    try:
        response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        )
    except Exception as e:
        print("Gemini Error:", e)
        raise

    text = response.text.strip()

    

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()

    return json.loads(text)
