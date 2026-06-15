import os

SAMPLE_DATA_PATH = "app/sample_data"
UPLOADS_PATH = "app/uploads"


def read_text_files_from_folder(folder_path):
    full_context = ""

    if not os.path.exists(folder_path):
        return full_context

    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)

        if filename.endswith(".txt") or filename.endswith(".log") or filename.endswith(".md"):
            with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
                content = file.read()
                full_context += f"\n\n--- FILE: {filename} ---\n"
                full_context += content

    return full_context


def load_sample_context():
    sample_context = read_text_files_from_folder(SAMPLE_DATA_PATH)
    uploaded_context = read_text_files_from_folder(UPLOADS_PATH)

    return sample_context + uploaded_context