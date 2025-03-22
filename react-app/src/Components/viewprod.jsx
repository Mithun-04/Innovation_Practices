import React, { useState, useEffect } from "react";
import Web3 from "web3";
import ProductRegistryABI from "../../build/contracts/ProductRegistry.json";
import "./View.css";

function Viewprod() {
  const [internalPONumber, setInternalPONumber] = useState("");
  const [retrievedProduct, setRetrievedProduct] = useState(null);
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
      const product = await contract.methods.getProduct(internalPONumber).call();
      console.log("Product Retrieved:", product);
      
      // If no product found, show alert
      if (!product[0]) {
        alert("Product not found!");
        return;
      }

      setRetrievedProduct(product);
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

      {retrievedProduct && (
        <div className="product-details">
          <h2>Product Details:</h2>
          <p><strong>External PO:</strong> {retrievedProduct[0]}</p>
          <p><strong>Internal PO:</strong> {retrievedProduct[1]}</p>
          <p><strong>Product Name:</strong> {retrievedProduct[2]}</p>
          <p><strong>Company Name:</strong> {retrievedProduct[3]}</p>
          <p><strong>File Hash:</strong> {retrievedProduct[4]}</p>
        </div>
      )}
    </div>
  );
}

export default Viewprod;