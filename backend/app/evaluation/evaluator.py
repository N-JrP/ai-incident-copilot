from app.evaluation.test_cases import TEST_CASES


def evaluate_response(response_text: str, expected_keywords: list):
    matched = []

    for keyword in expected_keywords:
        if keyword.lower() in response_text.lower():
            matched.append(keyword)

    score = len(matched) / len(expected_keywords)

    return {
        "score": round(score, 2),
        "matched_keywords": matched,
        "total_keywords": len(expected_keywords)
    }


def run_evaluations(generate_function):
    results = []

    for test in TEST_CASES:
        response = generate_function(test["question"])

        evaluation = evaluate_response(
            str(response),
            test["expected_keywords"]
        )

        results.append({
            "question": test["question"],
            "response": response,
            "evaluation": evaluation
        })

    return results