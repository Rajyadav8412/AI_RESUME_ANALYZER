from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from resumes.models import Resume
from .utils.parser import extract_text_from_pdf
from .utils.extractor import extract_resume_information
from .utils.analyzer import analyze_resume
from django.conf import settings
from .utils.ai_analyzer import analyze_resume_with_ai
from .models import ResumeAnalysis
from django.shortcuts import get_object_or_404



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

        try:
            ai_analysis = analyze_resume_with_ai(extracted_text)
        except Exception as e:
            print("Gemini Error:", e)

            ai_analysis = {
                "summary": "AI analysis is currently unavailable.",
                "strengths": [],
                "weaknesses": [],
                "suggestions": [],
                "ats_score": None,
                "error": str(e)
            }

        ResumeAnalysis.objects.create(
            user=request.user,
            resume=resume,
            extracted_text=extracted_text,
            resume_data=resume_data,
            analysis=analysis_result,
            ai_analysis=ai_analysis,
        )

        return Response({
        **resume_data,
        "analysis": analysis_result,
        "ai_analysis": ai_analysis,
        "text": extracted_text
        })

class AnalysisHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        analyses = ResumeAnalysis.objects.filter(user=request.user)

        data = []

        for analysis in analyses:
            data.append({
                "id": analysis.id,
                "created_at": analysis.created_at,
                "ats_score": analysis.ai_analysis.get("ats_score"),
            })

        return Response(data)

class AnalysisDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, analysis_id):

        analysis = get_object_or_404(
            ResumeAnalysis,
            id=analysis_id,
            user=request.user
        )

        return Response({
            "id": analysis.id,
            "created_at": analysis.created_at,
            "resume_data": analysis.resume_data,
            "analysis": analysis.analysis,
            "ai_analysis": analysis.ai_analysis,
            "extracted_text": analysis.extracted_text,
        })