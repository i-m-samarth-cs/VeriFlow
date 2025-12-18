import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlayCircle, Download, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [runningWorkflow, setRunningWorkflow] = useState(null);

  useEffect(() => {
    loadWorkflows();
    loadRuns();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await axios.get(`${API}/workflows`);
      setWorkflows(response.data);
    } catch (error) {
      console.error("Failed to load workflows:", error);
    }
  };

  const loadRuns = async () => {
    try {
      const response = await axios.get(`${API}/workflow/runs`);
      setRuns(response.data);
    } catch (error) {
      console.error("Failed to load runs:", error);
    }
  };

  const runWorkflow = async (workflowId) => {
    setLoading(true);
    setRunningWorkflow(workflowId);
    try {
      const response = await axios.post(`${API}/workflow/run`, {
        workflow_id: workflowId,
        input_data: { timestamp: new Date().toISOString() }
      });
      setRuns([response.data, ...runs]);
      setSelectedWorkflow(response.data);
    } catch (error) {
      console.error("Failed to run workflow:", error);
    } finally {
      setLoading(false);
      setRunningWorkflow(null);
    }
  };

  const downloadReport = async (runId) => {
    try {
      // Get evidence bundle
      const evidenceResponse = await axios.get(`${API}/workflow/${runId}/evidence`);
      const evidence = evidenceResponse.data;
      
      // Create comprehensive report
      const report = {
        report_generated: new Date().toISOString(),
        workflow_execution: selectedWorkflow,
        evidence_bundle: evidence,
        summary: {
          workflow_name: selectedWorkflow.workflow_name,
          execution_id: runId,
          trust_score: selectedWorkflow.overall_trust_score,
          status: selectedWorkflow.status,
          total_steps: selectedWorkflow.steps.length,
          total_latency_ms: evidence.total_latency_ms,
          validators: evidence.validators,
          attestation_hash: evidence.attestation_hash
        }
      };
      
      // Download as JSON
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `veriflow-report-${runId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download report:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-serif text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Workflow Builder
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            Define, execute, and validate AI workflows with cryptographic proof
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Workflows List */}
          <div className="lg:col-span-1">
            <div className="border border-gray-800 bg-black">
              <div className="border-b border-gray-800 p-4">
                <h2 className="text-xl font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Workflows
                </h2>
                <p className="text-xs text-gray-500 mt-1 font-mono">{workflows.length} total</p>
              </div>
              <div className="divide-y divide-gray-800">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="p-4 hover:bg-gray-900 cursor-pointer transition-colors"
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-1">{workflow.name}</h3>
                        <p className="text-xs text-gray-500 mb-2 font-mono">
                          {workflow.steps.length} steps
                        </p>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {workflow.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        runWorkflow(workflow.id);
                      }}
                      disabled={loading && runningWorkflow === workflow.id}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-600 transition-colors font-mono text-sm"
                    >
                      <PlayCircle className="w-4 h-4" />
                      {loading && runningWorkflow === workflow.id ? "Running..." : "Execute"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workflow Details / Run Results */}
          <div className="lg:col-span-2">
            {selectedWorkflow ? (
              <div className="border border-gray-800 bg-black">
                <div className="border-b border-gray-800 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {selectedWorkflow.workflow_name || selectedWorkflow.name}
                      </h2>
                      {selectedWorkflow.description && (
                        <p className="text-gray-400 text-sm">{selectedWorkflow.description}</p>
                      )}
                    </div>
                    {selectedWorkflow.id && selectedWorkflow.overall_trust_score !== undefined && (
                      <button
                        onClick={() => downloadReport(selectedWorkflow.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors font-mono text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download Report
                      </button>
                    )}
                  </div>
                  {selectedWorkflow.overall_trust_score !== undefined && (
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-mono">Trust Score:</span>
                        <span className="text-2xl font-bold font-mono">
                          {(selectedWorkflow.overall_trust_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-mono">Status:</span>
                        <span className={cn(
                          "px-2 py-1 text-xs font-mono uppercase",
                          selectedWorkflow.status === "completed" ? "bg-green-900/30 text-green-400" :
                          selectedWorkflow.status === "running" ? "bg-yellow-900/30 text-yellow-400" :
                          "bg-gray-800 text-gray-400"
                        )}>
                          {selectedWorkflow.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Steps */}
                <div className="p-6">
                  <h3 className="text-lg font-serif mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {selectedWorkflow.steps ? "Execution Steps" : "Workflow Steps"}
                  </h3>
                  <div className="space-y-4">
                    {selectedWorkflow.steps.map((step, index) => (
                      <div key={step.step_id || index} className="border border-gray-800 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-white">
                              {index + 1}. {step.step_name || step.name}
                            </h4>
                            {step.description && (
                              <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                            )}
                          </div>
                          {step.status && (
                            <span className={cn(
                              "px-2 py-1 text-xs font-mono uppercase",
                              step.status === "completed" ? "bg-green-900/30 text-green-400" :
                              step.status === "running" ? "bg-yellow-900/30 text-yellow-400" :
                              step.status === "failed" ? "bg-red-900/30 text-red-400" :
                              "bg-gray-800 text-gray-400"
                            )}>
                              {step.status}
                            </span>
                          )}
                        </div>

                        {/* Validation Results */}
                        {step.validation && (
                          <div className="mt-3 p-3 bg-gray-900 border border-gray-800">
                            <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                              <div>
                                <span className="text-gray-500">PoI Consensus:</span>
                                <span className={cn(
                                  "ml-2 font-bold",
                                  step.validation.poi_consensus ? "text-green-400" : "text-red-400"
                                )}>
                                  {step.validation.poi_consensus ? "✓ PASS" : "✗ FAIL"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">PoUW Score:</span>
                                <span className="ml-2 font-bold text-white">
                                  {(step.validation.pouw_score * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Embedding Δ:</span>
                                <span className="ml-2 text-white">
                                  {step.validation.embedding_distance?.toFixed(3) || "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Evidence Hash:</span>
                                <span className="ml-2 text-white">
                                  {step.evidence_hash || "N/A"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 font-mono">
                              Validators: {step.validation.validator_nodes?.join(", ") || "N/A"}
                            </div>
                          </div>
                        )}

                        {/* Inferences */}
                        {step.inferences && step.inferences.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs text-gray-500 font-mono mb-2">
                              {step.inferences.length} redundant inferences (PoI)
                            </div>
                            <div className="space-y-2">
                              {step.inferences.map((inf, i) => (
                                <div key={i} className="p-2 bg-gray-900 border border-gray-800 text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-mono text-gray-500">{inf.node_id}</span>
                                    <span className="font-mono text-gray-500">{inf.latency_ms}ms</span>
                                  </div>
                                  <p className="text-gray-400 font-mono">{inf.response}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-800 bg-black p-12 text-center">
                <p className="text-gray-500 font-mono">Select a workflow to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Runs */}
        {runs.length > 0 && (
          <div className="mt-8 border border-gray-800 bg-black">
            <div className="border-b border-gray-800 p-4">
              <h2 className="text-xl font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
                Recent Executions
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-800">
                  <tr className="text-left text-xs font-mono text-gray-500 uppercase">
                    <th className="p-4">Workflow</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Trust Score</th>
                    <th className="p-4">Steps</th>
                    <th className="p-4">Started</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {runs.slice(0, 10).map((run) => (
                    <tr key={run.id} className="hover:bg-gray-900">
                      <td className="p-4">
                        <div className="font-medium text-white">{run.workflow_name}</div>
                        <div className="text-xs text-gray-500 font-mono">{run.id}</div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-1 text-xs font-mono uppercase",
                          run.status === "completed" ? "bg-green-900/30 text-green-400" :
                          run.status === "running" ? "bg-yellow-900/30 text-yellow-400" :
                          "bg-gray-800 text-gray-400"
                        )}>
                          {run.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono font-bold">
                          {run.overall_trust_score ? `${(run.overall_trust_score * 100).toFixed(1)}%` : "N/A"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-400 font-mono">{run.steps.length}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-400 font-mono text-xs">
                          {new Date(run.started_at).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedWorkflow(run)}
                            className="text-sm text-white hover:text-gray-300 font-mono"
                          >
                            View
                          </button>
                          <button
                            onClick={() => downloadReport(run.id)}
                            className="text-sm text-gray-400 hover:text-white font-mono flex items-center gap-1"
                            title="Download Report"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
