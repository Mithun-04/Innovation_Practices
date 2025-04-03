import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { Upload } from "lucide-react";
import ProductRegistryABI from "../../build/contracts/ProductRegistry.json"; 
import "./NewProd.css";

const LIST_DATA = [
  { id: 1, name: "Laser Cutting" },
  { id: 2, name: "Milling" },
  { id: 3, name: "Bending" },
  { id: 4, name: "Drilling" }
];

function NewProd() {
  const [fileName, setFileName] = useState("");
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  
  const [externalPO, setExternalPO] = useState(""); 
  const [internalPO, setInternalPO] = useState(""); 
  const [productName, setProductName] = useState(""); 
  const [companyName, setCompanyName] = useState(""); 
  const [fileHash, setFileHash] = useState(""); 
  const [selectedUnits, setSelectedUnits] = useState([]); 
  const [transactionHash, setTransactionHash] = useState("");

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        if (!window.ethereum) {
          alert("Please install MetaMask!");
          return;
        }

        const web3Instance = new Web3(window.ethereum);
        
        const chainId = await web3Instance.eth.getChainId();
        console.log("Detected Chain ID:", chainId);
        if (Number(chainId) !== 1337) {
          alert(`Please connect to the correct network (Expected: 1337, Detected: ${chainId})`);
          return;
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });

        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length === 0) {
          alert("No accounts found. Please connect MetaMask.");
          return;
        }

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = ProductRegistryABI.networks[networkId];

        if (!deployedNetwork) {
          alert("Smart contract not deployed to detected network.");
          return;
        }

        const contractInstance = new web3Instance.eth.Contract(
          ProductRegistryABI.abi,
          deployedNetwork.address
        );

        setWeb3(web3Instance);
        setContract(contractInstance);
        setAccount(accounts[0]);

      } catch (error) {
        console.error("Error loading blockchain data:", error);
      }
    };

    if (!contract) {
      loadBlockchainData();
    }
  }, [contract]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileHash("sample_file_hash");
    }
  };

  const handleUnitChange = (event) => {
    const { value, checked } = event.target;
    console.log(`Checkbox change: ${value} is now ${checked ? 'checked' : 'unchecked'}`);
    
    setSelectedUnits((prevUnits) => {
      const newUnits = checked 
        ? [...prevUnits, value] 
        : prevUnits.filter((unit) => unit !== value);
      
      console.log("Updated selectedUnits:", newUnits);
      return newUnits;
    });
  };

  const verifyProduct = async () => {
    if (!contract || !internalPO) return;
    
    try {
      const result = await contract.methods.getProductUnits(internalPO).call();
      console.log("Product units from blockchain:", result);
      alert(`Units stored on blockchain: ${result.join(', ')}`);
    } catch (error) {
      console.error("Error verifying product:", error);
      alert("Error verifying product. See console for details.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      alert("Contract not initialized");
      return;
    }

    console.log("🔹 Selected Units Before Submission:", selectedUnits);

    if (selectedUnits.length === 0) {
      alert("Please select at least one unit.");
      return;
    }

    try {
      const unitsArray = Array.from(selectedUnits).map(unit => String(unit));
      console.log("🔹 Units Array for Submission:", unitsArray);

      console.log("🔹 Transaction parameters:", {
        externalPO,
        internalPO,
        productName,
        companyName,
        fileHash,
        units: unitsArray,
      });

      const transaction = await contract.methods.createProduct(
        externalPO,
        internalPO,
        productName,
        companyName,
        fileHash,
        unitsArray
      ).send({ 
        from: account,
        gas: 1000000 
      });

      console.log("🔹 Transaction success:", transaction);
      console.log("🔹 Event logs:", transaction.events.ProductCreated.returnValues);
      setTransactionHash(transaction.transactionHash);
      alert(`Product stored on blockchain! Transaction hash: ${transaction.transactionHash}`);
    } catch (error) {
      console.error("🔴 Error during transaction:", error);
      alert(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <h1>ENTER PRODUCT DETAILS</h1>
      <form onSubmit={handleSubmit}>
        <label>External PO</label>
        <input type="text" value={externalPO} onChange={(e) => setExternalPO(e.target.value)} required />

        <label>Internal PO (Product ID)</label>
        <input type="text" value={internalPO} onChange={(e) => setInternalPO(e.target.value)} required />

        <label>Product Name</label>
        <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required />

        <label>Company Name</label>
        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />

        <div className="uploading">
          <label>Upload CAD Design</label>
          <input type="file" onChange={handleFileChange} style={{ display: "none" }} id="fileInput" />
          <label htmlFor="fileInput" className="upload-button"><Upload /></label>
          {fileName && <p>Selected file: {fileName}</p>}
        </div>

        <div className="check-box">
          <label>Assign Units for Product</label>
          {LIST_DATA.map((item) => (
            <div key={item.id} className="checkbox-container">
              <input 
                type="checkbox" 
                id={`unit-${item.id}`} 
                name={item.name} 
                value={item.name} 
                checked={selectedUnits.includes(item.name)}
                onChange={handleUnitChange} 
              />
              <label htmlFor={`unit-${item.id}`}>{item.name}</label>
            </div>
          ))}
        </div>

        <button type="submit">Create Product</button>
      </form>
      
      {transactionHash && (
        <div className="transaction-details">
          <h3>Transaction Successful</h3>
          <p>Transaction Hash: {transactionHash}</p>
          <button onClick={verifyProduct}>Verify Units on Blockchain</button>
        </div>
      )}
      
      
    </div>
  );
}

export default NewProd;