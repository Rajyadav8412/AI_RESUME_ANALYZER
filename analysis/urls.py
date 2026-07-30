from django.urls import path
from .views import ExtractResumeTextView

urlpatterns = [
    path(
        "extract-text/",
        ExtractResumeTextView.as_view(),
        name="extract-text",
    ),
]