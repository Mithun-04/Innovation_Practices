import React, { useState, useEffect } from "react";
import Web3 from "web3";
import ProductRegistryABI from "../../build/contracts/ProductRegistry.json";
import "./View.css";

function Viewprod() {
  const [internalPONumber, setInternalPONumber] = useState("");
  const [product, setProduct] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");

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

        const contract = new web3.eth.Contract(ProductRegistryABI.abi, deployedNetwork.address);
        setContract(contract);
        setAccount(accounts[0]);
        console.log("Connected to Blockchain:", contract);
      } catch (error) {
        console.error("Error loading blockchain data:", error);
      }
    };

    loadBlockchainData();
  }, []);

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
      // Fetch product details
      const productDetails = await contract.methods.getProductDetails(internalPONumber).call();
      console.log("Product Details Retrieved:", productDetails);

      // Fetch units
      const units = await contract.methods.getProductUnits(internalPONumber).call();
      console.log("Units Retrieved:", units);

      // Fetch timestamps for each unit
      const timestamps = await Promise.all(
        units.map(async (unit) => {
          const timestamp = await contract.methods.getUnitTimestamp(internalPONumber, unit).call();
          return timestamp;
        })
      );
      console.log("Timestamps Retrieved:", timestamps);

      // Set product state as an object
      setProduct({
        externalPO: productDetails[0],
        internalPO: internalPONumber,
        productName: productDetails[1],
        companyName: productDetails[2],
        fileHash: productDetails[3],
        isCompleted: productDetails[4],
        units: units,
        timestamps: timestamps
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
          <div>
            <strong>Units and Timestamps:</strong>
            <ul>
              {product.units.map((unit, index) => (
                <li key={index}>
                  {unit} - Timestamp: {new Date(Number(product.timestamps[index]) * 1000).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Viewprod;