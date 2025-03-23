import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import ProductRegistryABI from "../../build/contracts/ProductRegistry.json";
import "./View.css";

function Viewprod() {
  const [internalPONumber, setInternalPONumber] = useState("");
  const [product, setProduct] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const navigate = useNavigate();

  // Connect to Blockchain and Load Contract
  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        if (!window.ethereum) {
          alert("Please install MetaMask!");
          return;
        }

        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = ProductRegistryABI.networks[networkId];

        if (!deployedNetwork) {
          alert("Smart contract not deployed to detected network.");
          return;
        }

        const contractInstance = new web3.eth.Contract(
          ProductRegistryABI.abi,
          deployedNetwork.address
        );

        setContract(contractInstance);
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error loading blockchain data:", error);
      }
    };

    loadBlockchainData();
  }, []);

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

  // Fetch Product Details
  const fetchProductDetails = async () => {
    if (!contract) {
      alert("Contract is not connected!");
      return;
    }
    if (!internalPONumber) {
      alert("Please enter an Internal PO Number!");
      return;
    }

    try {
      const productDetails = await contract.methods
        .getProductDetails(internalPONumber)
        .call();

      const units = await contract.methods
        .getProductUnits(internalPONumber)
        .call();

      const unitStatuses = await Promise.all(
        units.map(async (unit) => {
          const status = await contract.methods
            .getUnitStatus(internalPONumber, unit)
            .call();
          
          // Get timestamp for each unit
          const timestamp = await contract.methods
            .getUnitTimestamp(internalPONumber, unit)
            .call();
            
          return { 
            unit, 
            status, 
            timestamp: formatTimestamp(timestamp) 
          };
        })
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
    } catch (error) {
      alert("Error retrieving product. Check console for details.");
      console.error("Error fetching product details:", error);
    }
  };

  return (
    <div className="view-container">
      <h1>Retrieve Product Details</h1>
      <div className="retrieve-section">
        <label>Enter Internal PO Number</label>
        <input
          type="text"
          value={internalPONumber}
          onChange={(e) => setInternalPONumber(e.target.value)}
        />
        <button onClick={fetchProductDetails}>View</button>
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