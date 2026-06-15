TEST_CASES = [
    {
        "question": "Why is the Kubernetes pod crashing?",
        "expected_keywords": [
            "CrashLoopBackOff",
            "memory",
            "OOMKilled"
        ]
    },
    {
        "question": "Why did the payment API fail?",
        "expected_keywords": [
            "timeout",
            "connection",
            "payment"
        ]
    },
    {
        "question": "Why is database connectivity failing?",
        "expected_keywords": [
            "database",
            "connection pool",
            "timeout"
        ]
    }
]