import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  MiniMap,
  useNodesState,
  useEdgesState
} from "reactflow";
import "reactflow/dist/style.css";
import { createFlow, getFlows, updateFlow } from "./api/flowApi";

const initialNodes = [
  { id: "1", position: { x: 200, y: 50 }, data: { label: "Cold Email" }, type: "default" },
  { id: "2", position: { x: 200, y: 150 }, data: { label: "Wait/Delay" }, type: "default" },
  { id: "3", position: { x: 200, y: 250 }, data: { label: "Lead Source" }, type: "default" }
];

const initialEdges = [];

function App() {

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(4);
  const [flowId, setFlowId] = useState(null);
  const [isFlowRunning, setIsFlowRunning] = useState(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const saveCurrentFlow = async () => {
    const flowData = { name: "User Flow", nodes, edges };
  
    try {
      if (flowId) {
        await updateFlow(flowId, flowData);
        console.log("Flow updated successfully");
      } else {
        const createdFlow = await createFlow(flowData);
        setFlowId(createdFlow._id);
        console.log("Flow created successfully");
      }
    } catch (error) {
      console.error("Failed to save flow", error);
    }
  };
  
 
  // 🔹 Add a new node
  const addNode = (type) => {
    const newNode = {
      id: `${nodeId}`,
      position: { x: 300, y: nodes.length * 100 + 50 }, // Dynamic positioning
      data: type === "Wait/Delay" ? { label: type, delay: "5" } : { label: type },
      type: "default"
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeId(nodeId + 1);
  };

  // 🔹 Remove a node
  const removeNode = (id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
  };

  const fetchFlow = async () => {
    try {
      const data = await getFlows();
      if (data.length > 0) {
        const savedFlow = data[0];
        setNodes(savedFlow.nodes);
        setEdges(savedFlow.edges);
        setNodeId(savedFlow.nodes.length + 1);
        setFlowId(savedFlow._id);
        console.log("Loaded saved flow: ", savedFlow);
      }
    } catch (error) {
      console.error("Failed to load flow: ", error);
    }
  };

  const executeFlow = async (startNodeId) => {
    let currentNodeId = startNodeId;
  
    while (currentNodeId) {
      const currentNode = nodes.find(n => n.id === currentNodeId);
      if (!currentNode) break;
  
      const { label, delay } = currentNode.data;
  
      if (label === "Cold Email") {
        const emailPayload = {
          email: "recipient@example.com",
          subject: "Scheduled Email",
          body: "This is a test email from the flowchart",
          time: new Date()
        };
        console.log("Sending email immediately...");
        await fetch("http://localhost:5000/api/flows/schedule-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        });
      }
  
      if (label === "Wait/Delay") {
        const ms = (parseInt(delay || "1", 10)) * 60 * 1000;
        console.log(`Waiting ${ms / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, ms));
      }
  
      const nextEdge = edges.find(e => e.source === currentNodeId);
      currentNodeId = nextEdge?.target || null;
    }
  };
  
  const startFlowExecution = async () => {
    const startNode = nodes.find(n => {
      const hasIncoming = edges.some(e => e.target === n.id);
      return !hasIncoming;
    });
  
    if (!startNode) {
      console.warn("No starting node found");
      return;
    }
  
    setIsFlowRunning(true);
    await executeFlow(startNode.id);
    setIsFlowRunning(false);
  };
  

  const stopFlowExecution = () => {
    console.log("Flow execution stopped.");
    setIsFlowRunning(false);
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {/* Buttons for adding nodes */}
      {/* UI Controls */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 100, display: "flex", flexDirection: "column", gap: "5px" }}>
        <button onClick={() => addNode("Cold Email")}>➕ Add Cold Email</button>
        <button onClick={() => addNode("Wait/Delay")}>➕ Add Wait/Delay</button>
        <button onClick={() => addNode("Lead Source")}>➕ Add Lead Source</button>
        <hr />
        <button onClick={saveCurrentFlow}>💾 Save Flow</button>
        <button onClick={fetchFlow}>📂 Load Flow</button>
        <button onClick={startFlowExecution} disabled={isFlowRunning}>▶️ Start Flow</button>
        <button onClick={stopFlowExecution} disabled={!isFlowRunning}>⏹ Stop Flow</button>
      </div>

      {/* React Flowchart */}
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          data: {
            label: (
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                {node.data.label}
                {node.data.delay !== undefined && (
                  <input
                    type="number"
                    value={node.data.delay}
                    onChange={(e) => {
                      const value = Math.max(1, Math.min(1440, Number(e.target.value) || 0));
                      setNodes((nds) => 
                        nds.map((n) =>
                          n.id === node.id ? {...n, data: { ...n.data, delay: value } } : n
                        )
                      );
                    }}
                    onBlur={() => saveCurrentFlow()}
                    style={{
                      width: "40px",
                      padding: "2px",
                      border: "1px solid gray",
                      borderRadius: "4px",
                      textAlign: "center",
                      fontSize: "12px"
                    }}
                  />
                )}

                <button onClick={() => removeNode(node.id)} style={{ background: "none", border: "none", color: "red", fontSize: "16px", marginLeft: "10px", cursor: "pointer" }}>
                  ❌
                </button>
              </div>
            )
          }
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default App;
