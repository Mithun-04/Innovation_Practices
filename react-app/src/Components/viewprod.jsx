import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import ProductRegistryABI from "../../build/contracts/ProductRegistry.json";
import "./viewprod.css";

function Viewprod() {
  const [internalPONumber, setInternalPONumber] = useState("");
  const [product, setProduct] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [networkInfo, setNetworkInfo] = useState(null);
  const navigate = useNavigate();

  // Connect to Blockchain with additional diagnostics
  const connectToBlockchain = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask!");
      }

      const web3 = new Web3(window.ethereum);
      
      // Get network info first for diagnostics
      const chainId = await web3.eth.getChainId();
      const networkId = await web3.eth.net.getId();
      // Manual network type determination
      let networkType = "unknown";
      
      // Common network IDs
      if (chainId === 1) networkType = "mainnet";
      else if (chainId === 3) networkType = "ropsten";
      else if (chainId === 4) networkType = "rinkeby";
      else if (chainId === 5) networkType = "goerli";
      else if (chainId === 42) networkType = "kovan";
      else if (chainId === 1337 || chainId === 5777) networkType = "local";
      else if (chainId === 56) networkType = "binance";
      else if (chainId === 137) networkType = "polygon";
      
      const networkDiagnostics = {
        chainId,
        networkId,
        networkType
      };
      
      setNetworkInfo(networkDiagnostics);
      console.log("Network diagnostics:", networkDiagnostics);
      
      // Request accounts with better error handling
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (accountError) {
        console.error("Account access error:", accountError);
        throw new Error(`MetaMask account access denied: ${accountError.message}`);
      }

      const accounts = await web3.eth.getAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.");
      }
      
      // Check if contract deployment exists for this network
      const deployedNetwork = ProductRegistryABI.networks[networkId];
      
      if (!deployedNetwork) {
        throw new Error(`Smart contract not deployed to network ${networkId}. Available networks: ${Object.keys(ProductRegistryABI.networks).join(', ')}`);
      }
      
      console.log("Contract address:", deployedNetwork.address);
      
      // Create contract instance with try/catch for better diagnostics
      try {
        const contractInstance = new web3.eth.Contract(
          ProductRegistryABI.abi,
          deployedNetwork.address
        );
        
        // Verify the contract is accessible with a simple call
        // Use a more basic call method to check connectivity
        try {
          await contractInstance.methods.getAllProductKeys().call();
        } catch (methodError) {
          console.warn("Could not verify contract with getAllProductKeys, contract may still be valid:", methodError);
          // We won't throw here, as the contract might still be valid but this method might have restrictions
        }
        
        setContract(contractInstance);
        setAccount(accounts[0]);
        return contractInstance;
      } catch (contractError) {
        console.error("Contract initialization error:", contractError);
        throw new Error(`Failed to initialize contract: ${contractError.message}`);
      }
    } catch (error) {
      console.error("Error connecting to blockchain:", error);
      setError(error.message || "Failed to connect to blockchain");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Connect on component mount
  useEffect(() => {
    connectToBlockchain();
    
    // Add event listener for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        connectToBlockchain();
      });
      
      window.ethereum.on('chainChanged', () => {
        // Reload the page on chain change as recommended by MetaMask
        window.location.reload();
      });
    }
    
    return () => {
      // Clean up listeners when component unmounts
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', connectToBlockchain);
        window.ethereum.removeListener('chainChanged', () => {
          window.location.reload();
        });
      }
    };
  }, []);

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      // Convert BigInt to Number for date processing
      const timestampNum = Number(timestamp);
      const date = new Date(timestampNum * 1000);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${timestamp.toString()} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid timestamp";
    }
  };

  // Fetch Product Details with improved error handling
  const fetchProductDetails = async () => {
    setError("");
    
    if (!internalPONumber) {
      setError("Please enter an Internal PO Number!");
      return;
    }

    setIsLoading(true);
    
    try {
      // Make sure we have a web3 connection
      if (!window.ethereum) {
        throw new Error("MetaMask not installed. Please install MetaMask to continue.");
      }
      
      // Try to use existing contract or reconnect if needed
      let contractToUse = contract;
      if (!contractToUse) {
        console.log("No contract instance, attempting to reconnect...");
        contractToUse = await connectToBlockchain();
        if (!contractToUse) {
          throw new Error("Failed to connect to contract. Please check your network connection and MetaMask settings.");
        }
      }

      console.log("Fetching product:", internalPONumber);
      
      // Add additional check for correct internalPONumber format
      if (!/^[a-zA-Z0-9-_]+$/.test(internalPONumber)) {
        throw new Error("Invalid PO number format. Please use only letters, numbers, hyphens and underscores.");
      }
      
      try {
        // Set larger gas estimate and timeout for the transaction
        const options = {
          from: account,
          gas: 3000000, // Increase gas limit
          gasPrice: undefined // Let MetaMask determine the appropriate price
        };
        
        console.log("Calling getProductDetails with options:", options);
        
        // Try getProductDetails with more specific error handling and timeout
        const productDetails = await Promise.race([
          contractToUse.methods.getProductDetails(internalPONumber).call(options),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Request timed out after 30 seconds")), 30000)
          )
        ]);
        
        console.log("Product details retrieved:", productDetails);
        
        // If we got empty data from the contract, it might mean the product doesn't exist
        if (!productDetails || !productDetails[0]) {
          throw new Error(`Product with Internal PO ${internalPONumber} not found or returned empty data.`);
        }
        
        // Get units with separate try/catch
        try {
          console.log("Fetching units for product:", internalPONumber);
          
          const units = await contractToUse.methods
            .getProductUnits(internalPONumber)
            .call(options);
          
          console.log("Units retrieved:", units);
          
          // Check if units array is valid
          if (!Array.isArray(units)) {
            throw new Error("Invalid unit data returned from contract");
          }
          
          // Process each unit with individual error handling
          const unitPromises = units.map(async (unit) => {
            try {
              console.log(`Fetching status for unit ${unit}`);
              
              const status = await contractToUse.methods
                .getUnitStatus(internalPONumber, unit)
                .call(options);
              
              console.log(`Fetching timestamp for unit ${unit}`);
              
              const timestamp = await contractToUse.methods
                .getUnitTimestamp(internalPONumber, unit)
                .call(options);
                
              return { 
                unit, 
                status, 
                timestamp: formatTimestamp(timestamp) 
              };
            } catch (unitError) {
              console.error(`Error getting data for unit ${unit}:`, unitError);
              return {
                unit,
                status: "error",
                timestamp: "N/A",
                error: unitError.message
              };
            }
          });
          
          // Use allSettled to ensure all promises complete, even if some fail
          const unitResults = await Promise.allSettled(unitPromises);
          const unitStatuses = unitResults.map(result => 
            result.status === 'fulfilled' ? result.value : {
              unit: "unknown",
              status: "error",
              timestamp: "N/A",
              error: result.reason ? result.reason.message : "Unknown error"
            }
          );

          setProduct({
            externalPO: productDetails[0],
            internalPO: internalPONumber,
            productName: productDetails[1],
            companyName: productDetails[2],
            fileHash: productDetails[3],
            isCompleted: productDetails[4],
            units: unitStatuses,
          });
        } catch (unitsError) {
          console.error("Error fetching units:", unitsError);
          
          // Still display product info even if units failed
          setProduct({
            externalPO: productDetails[0],
            internalPO: internalPONumber,
            productName: productDetails[1],
            companyName: productDetails[2],
            fileHash: productDetails[3],
            isCompleted: productDetails[4],
            units: [{unit: "Error", status: "Failed to load units", timestamp: "N/A", error: unitsError.message}],
          });
          
          // Show error but don't prevent showing the product
          setError(`Warning: Product found but failed to fetch units: ${unitsError.message}`);
        }
      } catch (productError) {
        console.error("Error fetching product details:", productError);
        
        // More detailed error parsing
        const errorMsg = productError.message || "";
        
        // Check specific error conditions
        if (errorMsg.includes("revert") && errorMsg.includes("does not exist")) {
          throw new Error(`Product with Internal PO ${internalPONumber} does not exist.`);
        } else if (errorMsg.includes("timeout")) {
          throw new Error("Request timed out. The blockchain network may be congested. Please try again later.");
        } else if (errorMsg.includes("out of gas")) {
          throw new Error("Transaction ran out of gas. This may be due to network congestion or contract complexity.");
        } else if (errorMsg.includes("Internal JSON-RPC error")) {
          // Parse the internal JSON-RPC error if possible
          const match = errorMsg.match(/Internal JSON-RPC error\.\s*{([^}]+)}/);
          if (match) {
            throw new Error(`Blockchain error: ${match[1]}`);
          } else {
            throw new Error(`Blockchain connection error. Please check your network and wallet connection.`);
          }
        } else {
          throw new Error(`Failed to fetch product details: ${productError.message}`);
        }
      }
    } catch (error) {
      console.error("Error in fetchProductDetails:", error);
      setError(error.message || "Unknown error retrieving product");
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="view-container">
      <h1>Retrieve Product Details</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      
      <div className="retrieve-section">
        <label>Enter Internal PO Number</label>
        <input
          type="text"
          value={internalPONumber}
          onChange={(e) => setInternalPONumber(e.target.value)}
        />
        <button 
          onClick={fetchProductDetails} 
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "View"}
        </button>
        
        {!contract && (
          <button 
            onClick={connectToBlockchain} 
            disabled={isLoading}
          >
            Reconnect to Blockchain
          </button>
        )}
      </div>

      {product && (
        <div className="product-details">
          <h2>Product Details:</h2>
          <p><strong>External PO:</strong> {product.externalPO}</p>
          <p><strong>Internal PO:</strong> {product.internalPO}</p>
          <p><strong>Product Name:</strong> {product.productName}</p>
          <p><strong>Company Name:</strong> {product.companyName}</p>
          <p><strong>File Hash:</strong> {product.fileHash}</p>

          <div className="unit-status-section">
            <h3>Units and Timestamp:</h3>
            <ul>
              {product.units.map((unitObj, index) => (
                <li key={index}>
                  <strong>{unitObj.unit}</strong> {unitObj.status} timestamp: {unitObj.timestamp}
                  {unitObj.error && <span className="unit-error"> (Error: {unitObj.error})</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Status Update Button */}
          <button
            className="status-update-button"
            onClick={() => navigate(`/status-update/${product.internalPO}`)}
          >
            Status Update
          </button>
        </div>
      )}
    </div>
  );
}

export default Viewprod;