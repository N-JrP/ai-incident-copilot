import { useState } from "react";
import { analyzeIncident } from "../services/api";

function IncidentIntelligence() {
  const [question, setQuestion] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!question) return;

    setLoading(true);

    try {
      const result = await analyzeIncident(question);
      setData(result);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Incident Intelligence</h1>

      <textarea
        rows="4"
        placeholder="Describe production incident..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "16px",
        }}
      />

      <button
        onClick={handleAnalyze}
        style={{
          marginTop: "16px",
          padding: "12px 20px",
          cursor: "pointer",
        }}
      >
        Analyze Incident
      </button>

      {loading && <p>Running AI incident analysis...</p>}

      {data && (
        <div style={{ marginTop: "32px" }}>
          <h2>Root Cause</h2>
          <p>{data.report.root_cause}</p>

          <h2>Confidence</h2>
          <p>{data.report.confidence}</p>

          <h2>Evidence</h2>
          <ul>
            {data.report.evidence.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2>Fix Steps</h2>
          <ul>
            {data.report.fix_steps.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2>Prevention</h2>
          <ul>
            {data.report.prevention.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2>Retrieved Documents</h2>

          {data.retrieved_documents.map((doc, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #333",
                padding: "16px",
                marginTop: "12px",
                borderRadius: "8px",
              }}
            >
              <h3>{doc.source}</h3>
              <p>Score: {doc.score}</p>
              <p>{doc.preview}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IncidentIntelligence;