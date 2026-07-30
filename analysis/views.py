from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from resumes.models import Resume
from .utils.parser import extract_text_from_pdf
from .utils.extractor import (
    extract_name,
    extract_email,
    extract_phone,
    extract_skills,
)


class ExtractResumeTextView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        resume = Resume.objects.filter(user=request.user).last()

        if not resume:
            return Response(
                {"error": "No resume uploaded."},
                status=404
            )

        extracted_text = extract_text_from_pdf(resume.resume.path)
        skills = extract_skills(extracted_text)
        name = extract_name(extracted_text)
        email = extract_email(extracted_text)
        phone = extract_phone(extracted_text)

        return Response({
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "text": extracted_text
        })