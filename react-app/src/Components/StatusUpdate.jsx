import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    // Convert BigInt to Number for date processing
    const timestampNum = Number(timestamp);
    const date = new Date(timestampNum * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${timestamp.toString()} ${hours}:${minutes}:${seconds}`;
  };

  // Connect to blockchain - separated for reusability
  const connectToBlockchain = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
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
      
      return contractInstance;
    } catch (error) {
      console.error("Error connecting to blockchain:", error);
      setError(error.message || "Failed to connect to blockchain");
      return null;
    }
  };

  // Load unit data
  const loadUnitData = async (contractInstance) => {
    try {
      const contractToUse = contractInstance || contract;
      
      if (!contractToUse) {
        throw new Error("No contract instance available");
      }
      
      // Get list of units
      const unitList = await contractToUse.methods
        .getProductUnits(internalPO)
        .call();

      setUnits(unitList);

      // Get current status and timestamp for each unit
      const unitsData = {};
      for (const unit of unitList) {
        try {
          const status = await contractToUse.methods
            .getUnitStatus(internalPO, unit)
            .call();
            
          const timestamp = await contractToUse.methods
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
    } catch (error) {
      console.error("Error loading unit data:", error);
      throw error;
    }
  };

  // Initialize blockchain connection and load data
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        const contractInstance = await connectToBlockchain();
        
        if (contractInstance) {
          await loadUnitData(contractInstance);
        }
      } catch (error) {
        setError(error.message || "Failed to load product data");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
    
    // Add event listeners for account and network changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        setAccount(accounts[0]);
        await initialize();
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
    
    return () => {
      // Clean up listeners when component unmounts
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', initialize);
        window.ethereum.removeListener('chainChanged', () => {
          window.location.reload();
        });
      }
    };
  }, [internalPO]);

  const checkUnitStatus = async (unit) => {
    try {
      // Try to use existing contract or reconnect if needed
      let contractToUse = contract;
      if (!contractToUse) {
        contractToUse = await connectToBlockchain();
        if (!contractToUse) {
          throw new Error("Failed to connect to contract");
        }
      }
      
      const status = await contractToUse.methods
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
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to use existing contract or reconnect if needed
      let contractToUse = contract;
      if (!contractToUse) {
        contractToUse = await connectToBlockchain();
        if (!contractToUse) {
          throw new Error("Failed to connect to contract");
        }
      }
      
      // Check if unit exists
      if (!(await checkUnitStatus(unit))) {
        throw new Error(`Cannot find unit "${unit}"`);
      }
      
      // Send transaction with fixed gas limit to avoid BigInt error
      await contractToUse.methods
        .updateUnitStatus(internalPO, unit, newStatus)
        .send({ 
          from: account,
          gas: 200000 // Use a fixed gas limit instead of estimation
        });
      
      // Get updated timestamp
      const timestamp = await contractToUse.methods
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
      
      // Check if all units are done and update product completion status if needed
      if (newStatus === "done") {
        await contractToUse.methods
          .checkProductCompletion(internalPO)
          .send({ 
            from: account,
            gas: 200000
          });
      }
      
      alert(`Unit "${unit}" updated to "${newStatus}" successfully!`);
    } catch (error) {
      // Extract useful error message
      let errorMessage = error.message;
      if (error.message.includes("execution reverted")) {
        const match = error.message.match(/execution reverted: (.+?)"/);
        if (match && match[1]) {
          errorMessage = match[1];
        }
      }
      
      setError(`Error updating status: ${errorMessage}`);
      console.error("Full error:", error);
    } finally {
      setIsLoading(false);
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

  const handleRetry = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const contractInstance = await connectToBlockchain();
      if (contractInstance) {
        await loadUnitData(contractInstance);
      }
    } catch (error) {
      setError(error.message || "Failed to load product data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="status-update-container">
      <h1>Update Unit Status of {internalPO}</h1>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleRetry}>Try Again</button>
        </div>
      )}
      
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="connection-info">
            
            {!contract && (
              <button 
                onClick={connectToBlockchain}
                className="reconnect-button"
              >
                Reconnect to Blockchain
              </button>
            )}
            
          </div>
          
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
                      disabled={isLoading || 
                               unitData[unit]?.status === "to-do" || 
                               unitData[unit]?.status === "on-progress" || 
                               unitData[unit]?.status === "done"}
                    >
                      To Do
                    </button>
                    <button 
                      onClick={() => updateStatus(unit, "on-progress")}
                      className="button-progress"
                      disabled={isLoading || 
                               unitData[unit]?.status === "on-progress" || 
                               unitData[unit]?.status === "done"}
                    >
                      On Progress
                    </button>
                    <button 
                      onClick={() => updateStatus(unit, "done")}
                      className="button-done"
                      disabled={isLoading || 
                               unitData[unit]?.status === "done"}
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