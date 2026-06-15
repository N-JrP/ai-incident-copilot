import os

SAMPLE_DATA_PATH = "app/sample_data"
UPLOADS_PATH = "app/uploads"


def read_text_files_from_folder(folder_path):
    documents = []

    if not os.path.exists(folder_path):
        return documents

    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)

        if filename.endswith((".txt", ".log", ".md")):
            with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
                content = file.read()

                documents.append({
                    "source": filename,
                    "content": content
                })

    return documents


def load_documents():
    sample_docs = read_text_files_from_folder(SAMPLE_DATA_PATH)
    uploaded_docs = read_text_files_from_folder(UPLOADS_PATH)

    return sample_docs + uploaded_docs


def build_context(documents):
    context = ""

    for doc in documents:
        context += f"\n\n--- FILE: {doc['source']} ---\n"
        context += doc["content"]

    return context


def retrieve_documents(question):
    documents = load_documents()

    retrieval_results = []

    important_terms = [
        word.lower()
        for word in question.replace("?", "").split()
        if len(word) > 4
    ]

    seen_sources = set()

    for doc in documents:
        if doc["source"] in seen_sources:
            continue
        content_lower = doc["content"].lower()
        source_lower = doc["source"].lower()

        match_count = 0

        for term in important_terms:
            if term in content_lower or term in source_lower:
                match_count += 1

        if match_count > 0:
            score = round(match_count / len(important_terms), 2)
 
            seen_sources.add(doc["source"])

            retrieval_results.append({
                "source": doc["source"],
                "score": score,
                "preview": doc["content"][:300]
            })

    retrieval_results = sorted(
        retrieval_results,
        key=lambda item: item["score"],
        reverse=True
    )

    return retrieval_results[:3]


def load_sample_context():
    documents = load_documents()
    return build_context(documents)