import { useMemo, useState } from "react";
import API from "./services/api";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [retrievedDocs, setRetrievedDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [evaluationData, setEvaluationData] = useState(null);
  const [evaluationLoading, setEvaluationLoading] = useState(false);

  const analyzeIncident = async () => {
    if (!question?.trim()) return;
    setLoading(true);
    setResponse("");

    try {
      const result = await API.post(
        "/incident-intelligence",
        { question }
      );

      setResponse(result.data.report);
      setRetrievedDocs(
        result.data.retrieved_documents || []
      );
    } catch {
      setResponse(
        "Error: Backend or Ollama is not running.\n\nCheck FastAPI server, Ollama service, and model availability."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (selectedFile) => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploadStatus("Uploading...");
      await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus(`${selectedFile.name} uploaded successfully`);
    } catch {
      setUploadStatus("Upload failed");
    }
  };

  const clearSession = () => {
    setQuestion("");
    setResponse("");
    setUploadStatus("");
  };

  const runEvaluation = async () => {
    setEvaluationLoading(true);

    try {
      const result = await API.get("/evaluate");
      setEvaluationData(result.data);
    } catch {
      setEvaluationData({
        status: "error",
        results: [],
      });
    } finally {
      setEvaluationLoading(false);
    }
  };

  const exportReport = () => {
    if (!response) return;
    const markdownReport = `
    # AI Root Cause Report

    ## Root Cause
    ${parsedReport.rootCause}

    ## Confidence
    ${parsedReport.confidence}

    ## Evidence
    ${parsedReport.evidence.map((item) => `- ${item}`).join("\n")}

    ## Fix Steps
    ${parsedReport.fixSteps.map((item) => `- ${item}`).join("\n")}

    ## Prevention
    ${parsedReport.prevention.map((item) => `- ${item}`).join("\n")}
    `;

    const blob = new Blob([markdownReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "incident_rca_report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parsedReport = useMemo(() => {
  return {
    rootCause: response?.root_cause || "",
    confidence: response?.confidence || "",
    evidence: response?.evidence || [],
    fixSteps: response?.fix_steps || [],
    prevention: response?.prevention || [],
  };
}, [response]);

  return (
    <main className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">AI</div>
          <div>
            <h3>Incident Copilot</h3>
            <span>AI Ops Console</span>
          </div>
        </div>

        <nav>
          <a className="active">Dashboard</a>
          <a>Knowledge Base</a>
          <a>Reports</a>
        </nav>

        <div className="side-card">
          <span>Runtime</span>
          <strong>Local GenAI</strong>
          <p>Private incident analysis</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">AI Operations Platform</span>
            <h1>Production Incident Intelligence</h1>
            <p>RAG-powered root cause analysis for logs, runbooks, and outages.</p>
          </div>

          <div className="system-status">
            <span className="pulse" />
            System Operational
          </div>
        </header>

        <section className="main-grid">
          <section className="panel input-panel">
            <div className="panel-header">
              <div>
                <h2>Incident Input</h2>
                <p>Ask the copilot to investigate a production failure.</p>
              </div>
              <span className="tag">Live RCA</span>
            </div>

            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Describe the incident..."
            />

            <div className="action-buttons">
              <button onClick={analyzeIncident} disabled={loading}>
                {loading ? "Analyzing Incident..." : "Run Root Cause Analysis"}
              </button>

              <button className="clear-btn" onClick={clearSession}>
                Clear
              </button>
            </div>

            <div className="upload-box">
              <strong>Upload Logs / Runbooks</strong>

              <label className="custom-upload">
                <input
                  type="file"
                  accept=".txt,.log,.md"
                  hidden
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />

                <span>
                  {uploadStatus ? uploadStatus : "Click to upload .txt, .log, or .md file"}
                </span>
              </label>
            </div>
          </section>

          <section className="panel report-panel">
            <div className="panel-header">
              <div>
                <h2>AI Root Cause Report</h2>
                <p>Generated technical diagnosis and remediation plan.</p>
              </div>

              {response && (
                <button className="export-btn" onClick={exportReport}>
                  Export
                </button>
              )}
            </div>

            <div className="report-box">
              {loading ? (
                <div className="empty-state">
                  <div className="loader" />
                  <strong>Investigating incident...</strong>
                  <span>Correlating logs and runbook context.</span>
                </div>
              ) : response ? (
                <div className="report-cards">
                  <div className="report-card-item root">
                    <span>Root Cause</span>
                    <p>{parsedReport.rootCause}</p>
                  </div>

                  <div className="report-card-item confidence">
                    <span>Confidence</span>
                    <strong>{parsedReport.confidence}</strong>
                  </div>

                  <div className="report-card-item">
                    <span>Evidence</span>
                    <ul>
                      {parsedReport.evidence.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="report-card-item">
                    <span>Fix Steps</span>
                    <ul>
                      {parsedReport.fixSteps.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="report-card-item prevention">
                    <span>Prevention</span>
                    <ul>
                      {parsedReport.prevention.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="report-card-item">
                    <span>Retrieved Documents</span>

                    {retrievedDocs.length === 0 ? (
                      <p>No retrieval data</p>
                    ) : (
                      retrievedDocs.map((doc, index) => (
                        <div
                          key={index}
                          style={{
                            marginTop: "12px",
                            padding: "12px",
                            border: "1px solid #2a2f3a",
                            borderRadius: "8px",
                          }}
                        >
                          <h4 className="retrieved-doc-title">
                            {doc.source}
                          </h4>

                          <p
                            style={{
                              marginTop: "6px",
                              fontSize: "14px",
                              opacity: 0.8,
                            }}
                          >
                            Relevance Score: {doc.score}
                          </p>

                          <p
                            style={{
                              marginTop: "8px",
                              fontSize: "14px",
                              lineHeight: "1.5",
                            }}
                          >
                            {doc.preview}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                </div>
              ) : (
                <div className="empty-state">
                  <strong>No RCA generated yet</strong>
                  <span>Run analysis to produce a recruiter-ready incident report.</span>
                </div>
              )}
            </div>
          </section>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Evaluation Dashboard</h2>
              <p>
                Measure AI RCA quality against predefined
                incident test cases.
              </p>
            </div>

            <button
              onClick={runEvaluation}
              disabled={evaluationLoading}
            >
              {evaluationLoading
                ? "Running Evaluation..."
                : "Run Evaluation"}
            </button>
          </div>

          {evaluationData?.results?.length > 0 && (
            <div className="report-cards">
              {evaluationData.results.map((item, index) => (
                <div
                  className="report-card-item"
                  key={index}
                >
                  <span>{item.question}</span>

                  <p>
                    Score: {item.evaluation.score}
                  </p>

                  <p>
                    Matched Keywords:{" "}
                    {item.evaluation.matched_keywords.join(
                      ", "
                    )}
                  </p>

                  <div
                    style={{
                      marginTop: "12px",
                      fontWeight: "600",
                      color:
                        item.evaluation.score >= 0.7
                          ? "#86efac"
                          : "#fca5a5",
                    }}
                  >
                    {item.evaluation.score >= 0.7
                      ? "PASS"
                      : "FAIL"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;