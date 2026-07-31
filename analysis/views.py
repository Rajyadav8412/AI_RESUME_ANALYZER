from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from resumes.models import Resume
from .utils.parser import extract_text_from_pdf
from .utils.extractor import extract_resume_information
from .utils.analyzer import analyze_resume


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
        resume_data = extract_resume_information(extracted_text)
        analysis_result = analyze_resume(resume_data)

        return Response({
        **resume_data,
        "analysis": analysis_result,
        "text": extracted_text
        })

