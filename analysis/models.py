from django.db import models
from django.conf import settings
from resumes.models import Resume


class ResumeAnalysis(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE
    )

    extracted_text = models.TextField()

    resume_data = models.JSONField()

    analysis = models.JSONField()

    ai_analysis = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.created_at}"