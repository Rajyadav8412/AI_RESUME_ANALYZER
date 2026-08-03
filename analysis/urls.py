from django.urls import path
from .views import (
    ExtractResumeTextView,
    AnalysisHistoryView,
    AnalysisDetailView,
)

urlpatterns = [
    path("extract-text/", ExtractResumeTextView.as_view()),
    path("history/", AnalysisHistoryView.as_view()),
    path("history/<int:analysis_id>/", AnalysisDetailView.as_view()),
]