import re

SKILLS_DB = [
    "Python",
    "Java",
    "C",
    "C++",
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "React",
    "Node.js",
    "Django",
    "Flask",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Git",
    "GitHub",
    "VS Code",
    "Docker",
    "AWS",
    "Linux",
    "REST API",
    "Machine Learning",
    "Data Structures",
    "Algorithms"
]

def extract_education(text):
    education = []

    degree_pattern = r"(Bachelor of Technology\s*\(B\.Tech\)|B\.Tech)"
    college_pattern = r"University of [A-Za-z\s]+"
    cgpa_pattern = r"CGPA[:\s]*([0-9]+\.[0-9]+)"
    duration_pattern = r"(20\d{2}\s*[-–]\s*20\d{2})"

    degree = re.search(degree_pattern, text, re.IGNORECASE)
    college = re.search(college_pattern, text)
    cgpa = re.search(cgpa_pattern, text, re.IGNORECASE)
    duration = re.search(duration_pattern, text)

    if degree or college:
        education.append({
            "degree": degree.group().strip() if degree else None,
            "college": college.group().strip() if college else None,
            "cgpa": cgpa.group(1) if cgpa else None,
            "duration": duration.group().strip() if duration else None,
        })

    return education

def extract_certifications(text):
    certifications = []

    lines = text.split("\n")

    capture = False

    for line in lines:

        line = line.lstrip("•-* ").strip()

        if "CERTIFICATION" in line.upper():
            capture = True
            continue

        if capture:

            if (
                line == ""
                or "PROJECT" in line.upper()
                or "EXPERIENCE" in line.upper()
                or "ACHIEVEMENT" in line.upper()
            ):
                break

            certifications.append(line)

    return certifications

def extract_projects(text):
    projects = []

    lines = text.split("\n")

    capture = False
    current_project = None
    title_found = False

    for line in lines:

        line = line.strip()
        line = line.lstrip("•-* ").strip()

        if line.strip().upper() == "PROJECTS":
            capture = True
            continue

        if not capture:
            continue

        # Stop when next section starts
        if (
            "CERTIFICATION" in line.upper()
            or "EXPERIENCE" in line.upper()
            or "EDUCATION" in line.upper()
            or "SKILLS" in line.upper()
        ):
            break

        if line == "":
            continue

        # First non-empty line after PROJECTS is the title
        if not title_found:
            current_project = {
                "title": line,
                "description": []
            }
            title_found = True
            continue

        # Remaining lines are descriptions
        current_project["description"].append(line)

    if current_project:
        projects.append(current_project)

    return projects

def extract_skills(text):
    text_lower = text.lower()

    found_skills = []

    for skill in SKILLS_DB:
        if skill.lower() in text_lower:
            found_skills.append(skill)

    return sorted(list(set(found_skills)))


def extract_email(text):
    pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    match = re.search(pattern, text)

    if match:
        return match.group()

    return None


def extract_phone(text):
    pattern = r"(\+91[\s-]?)?[6-9]\d{9}"
    match = re.search(pattern, text)

    if match:
        return match.group()

    return None


def extract_name(text):
    lines = text.split("\n")

    for line in lines:
        line = line.strip()

        if len(line) > 2 and line.isupper():
            return line.title()

    return None

def extract_resume_information(text):
    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "education": extract_education(text),
        "certifications": extract_certifications(text),
        "projects": extract_projects(text),
    }