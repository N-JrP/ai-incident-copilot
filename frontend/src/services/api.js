import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export default API;

export const analyzeIncident = async (question) => {
  const response = await API.post(
    "/incident-intelligence",
    { question }
  );

  return response.data;
};

export const retrieveDocuments = async (question) => {
  const response = await API.post(
    "/retrieve",
    { question }
  );

  return response.data;
};

export const getEvaluationResults = async () => {
  const response = await API.get(
    "/evaluate"
  );

  return response.data;
};