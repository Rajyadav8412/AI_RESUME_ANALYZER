import fitz  # PyMuPDF

def extract_text_from_pdf(file_obj):
    """
    Extract text from a PDF using PyMuPDF.
    Accepts a file-like object (bytes), not a path.
    """
    file_obj.seek(0)
    file_bytes = file_obj.read()
    document = fitz.open(stream=file_bytes, filetype="pdf")

    text = ""

    for page in document:
        text += page.get_text()

    document.close()

    return text