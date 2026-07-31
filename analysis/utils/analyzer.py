def analyze_resume(data):

    score = 100

    strengths = []
    weaknesses = []
    suggestions = []

    if len(data["skills"]) < 5:
        score -= 10
        weaknesses.append("Few technical skills listed.")
        suggestions.append("Add more relevant technical skills.")

    else:
        strengths.append("Good technical skill set.")

    if len(data["projects"]) == 0:
        score -= 15
        weaknesses.append("No projects found.")
        suggestions.append("Include academic or personal projects.")

    else:
        strengths.append("Projects section is present.")

    if len(data["certifications"]) == 0:
        score -= 5
        weaknesses.append("No certifications found.")
        suggestions.append("Add relevant certifications.")

    else:
        strengths.append("Relevant certifications available.")

    return {
        "overall_score": score,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions
    }