from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from resumes.models import Resume
from .utils.parser import extract_text_from_pdf
from .utils.extractor import extract_resume_information


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
        print(extracted_text)
        resume_data = extract_resume_information(extracted_text)

        return Response({
        **resume_data,
        "text": extracted_text
        })

