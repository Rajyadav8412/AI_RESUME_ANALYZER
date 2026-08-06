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

    def _analyze(self, request):

        target_role = request.data.get("target_role", "").strip()

        resume = Resume.objects.filter(user=request.user).last()

        if not resume:
            return Response(
                {"error": "No resume uploaded."},
                status=404
            )
        
        try:
            extracted_text = extract_text_from_pdf(resume.resume.path)

            if not extracted_text.strip():
                return Response(
                    {"error": "Could not extract text from the uploaded resume."},
                    status=400
                )

            resume_data = extract_resume_information(extracted_text)
            analysis_result = analyze_resume(resume_data)

        except Exception as e:
            return Response(
                {
                    "error": "Failed to process the uploaded resume.",
                    "details": str(e)
                },
                status=500
                )

        try:
            ai_analysis = analyze_resume_with_ai(extracted_text, target_role)
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
            target_role=target_role,
        )

        return Response({
        **resume_data,
        "analysis": analysis_result,
        "ai_analysis": ai_analysis,
        "target_role": target_role,
        
        })

    def post(self, request):
        return self._analyze(request)

    def get(self, request):
        return self._analyze(request)

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
                "target_role": analysis.target_role,
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
            "target_role": analysis.target_role,
        })

class CompareResumeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        analyses = ResumeAnalysis.objects.filter(
            user=request.user
        ).order_by("-created_at")

        if analyses.count() < 2:
            return Response(
                {"error": "At least two resume analyses are required."},
                status=400
            )

        latest = analyses[0]
        previous = analyses[1]

        latest_skills = set(latest.resume_data.get("skills", []))
        previous_skills = set(previous.resume_data.get("skills", []))
        

        return Response({
            "old_score": previous.ai_analysis.get("ats_score"),
            "new_score": latest.ai_analysis.get("ats_score"),
            "score_improvement":
                latest.ai_analysis.get("ats_score") -
                previous.ai_analysis.get("ats_score"),

            "skills_added": list(latest_skills - previous_skills),
            "skills_removed": list(previous_skills - latest_skills),

            "summary": "Resume comparison generated successfully."
        })
