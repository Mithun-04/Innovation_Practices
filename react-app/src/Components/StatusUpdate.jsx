import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import ProductRegistryABI from "../../build/contracts/ProductRegistry.json";
import "./StatusUpdate.css";

function StatusUpdate() {
  const { internalPO } = useParams();
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [units, setUnits] = useState([]);
  const [unitData, setUnitData] = useState({}); // Store both status and timestamp
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to format timestamp - Fixed to handle BigInt
  const formatTimestamp = (timestamp) => {
    // Convert BigInt to Number for date processing
    const timestampNum = Number(timestamp);
    const date = new Date(timestampNum * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${timestamp.toString()} ${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        setIsLoading(true);
        
        if (!window.ethereum) {
          throw new Error("Please install MetaMask!");
        }

        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = ProductRegistryABI.networks[networkId];

        console.log("Connected to network ID:", networkId);
        
        if (!deployedNetwork) {
          throw new Error("Smart contract not deployed to detected network.");
        }
        
        console.log("Contract address:", deployedNetwork.address);

        const contractInstance = new web3.eth.Contract(
          ProductRegistryABI.abi,
          deployedNetwork.address
        );

        setContract(contractInstance);
        setAccount(accounts[0]);

        // Get list of units
        const unitList = await contractInstance.methods
          .getProductUnits(internalPO)
          .call();

        setUnits(unitList);

        // Get current status and timestamp for each unit
        const unitsData = {};
        for (const unit of unitList) {
          try {
            const status = await contractInstance.methods
              .getUnitStatus(internalPO, unit)
              .call();
              
            const timestamp = await contractInstance.methods
              .getUnitTimestamp(internalPO, unit)
              .call();
              
            unitsData[unit] = { 
              status, 
              timestamp: formatTimestamp(timestamp)
            };
          } catch (err) {
            console.error(`Error getting data for unit ${unit}:`, err);
            unitsData[unit] = { status: "unknown", timestamp: "unknown" };
          }
        }
        
        setUnitData(unitsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading blockchain data:", error);
        setError(error.message || "Failed to load blockchain data");
        setIsLoading(false);
      }
    };

    loadBlockchainData();
  }, [internalPO]);

  const checkUnitStatus = async (unit) => {
    try {
      if (!contract) return false;
      
      const status = await contract.methods
        .getUnitStatus(internalPO, unit)
        .call();
      
      console.log(`Current status of ${unit}: ${status}`);
      return true;
    } catch (error) {
      console.error(`Error checking unit ${unit}:`, error);
      return false;
    }
  };

  const updateStatus = async (unit, newStatus) => {
    if (!contract) {
      alert("Contract not loaded yet.");
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if unit exists
      if (!(await checkUnitStatus(unit))) {
        alert(`Error: Cannot find unit "${unit}"`);
        setIsLoading(false);
        return;
      }
      
      // Send transaction with fixed gas limit to avoid BigInt error
      await contract.methods
        .updateUnitStatus(internalPO, unit, newStatus)
        .send({ 
          from: account,
          gas: 200000 // Use a fixed gas limit instead of estimation
        });
      
      // Get updated timestamp
      const timestamp = await contract.methods
        .getUnitTimestamp(internalPO, unit)
        .call();
      
      // Update the UI with new status and timestamp
      setUnitData(prevData => ({
        ...prevData,
        [unit]: {
          status: newStatus,
          timestamp: formatTimestamp(timestamp)
        }
      }));
      
      alert(`Unit "${unit}" updated to "${newStatus}" successfully!`);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      
      // Extract useful error message
      let errorMessage = error.message;
      if (error.message.includes("execution reverted")) {
        const match = error.message.match(/execution reverted: (.+?)"/);
        if (match && match[1]) {
          errorMessage = match[1];
        }
      }
      
      alert(`Error updating status: ${errorMessage}`);
      console.error("Full error:", error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "to-do": return "status-todo";
      case "on-progress": return "status-progress";
      case "done": return "status-done";
      default: return "";
    }
  };

  if (error) {
    return (
      <div className="status-update-container error">
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="status-update-container">
      <h1>Update Unit Status - {internalPO}</h1>
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <p className="account-info">Connected Account: {account}</p>
          {units.length === 0 ? (
            <p>No units found for this product.</p>
          ) : (
            <ul className="unit-list">
              {units.map((unit, index) => (
                <li key={index} className="unit-item">
                  <div className="unit-info">
                    <span className="unit-name">{unit}</span>
                    <span className={`unit-status ${getStatusClass(unitData[unit]?.status)}`}>
                      {unitData[unit]?.status || "unknown"}
                    </span>
                    <span className="unit-timestamp">
                      timestamp: {unitData[unit]?.timestamp || "unknown"}
                    </span>
                  </div>
                  <div className="unit-actions">
                    <button 
                      onClick={() => updateStatus(unit, "to-do")}
                      className="button-todo"
                      disabled={unitData[unit]?.status === "to-do"}
                    >
                      To Do
                    </button>
                    <button 
                      onClick={() => updateStatus(unit, "on-progress")}
                      className="button-progress"
                      disabled={unitData[unit]?.status === "on-progress"}
                    >
                      On Progress
                    </button>
                    <button 
                      onClick={() => updateStatus(unit, "done")}
                      className="button-done"
                      disabled={unitData[unit]?.status === "done"}
                    >
                      Done
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default StatusUpdate;