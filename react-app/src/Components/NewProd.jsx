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

  // ✅ Updated state variables to match contract parameters
  const [externalPO, setExternalPO] = useState(""); 
  const [internalPO, setinternalPO] = useState(""); 
  const [productName, setProductName] = useState(""); 
  const [companyName, setcompanyName] = useState(""); 
  const [fileHash, setFileHash] = useState(""); 

  // ✅ Connect to Blockchain
  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        if (!window.ethereum) {
          alert("Please install MetaMask!");
          return;
        }
  
        const web3Instance = new Web3(window.ethereum);
        
        // ✅ First check chain ID
        const chainId = await web3Instance.eth.getChainId();
        console.log("Detected Chain ID:", chainId);
        if (Number(chainId) !== 1337) {
            console.error(`Chain ID Mismatch! Expected: 1337, But Detected: ${chainId}`);
            alert(`Please connect to the correct network (Expected: 1337, Detected: ${chainId})`);
            return;
        }
        
        await window.ethereum.request({ method: "eth_requestAccounts" });
  
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length === 0) {
          alert("No accounts found. Please connect MetaMask.");
          return;
        }
  
        // ✅ Get network ID for contract lookup
        const networkId = await web3Instance.eth.net.getId();
        console.log("Detected Network ID:", networkId);
  
        const deployedNetwork = ProductRegistryABI.networks[networkId];
        if (!deployedNetwork) {
          alert("Smart contract not deployed to detected network.");
          return;
        }
  
        console.log("Smart Contract Address:", deployedNetwork.address);
  
        const contractInstance = new web3Instance.eth.Contract(
          ProductRegistryABI.abi,
          deployedNetwork.address
        );
  
        setWeb3(web3Instance);
        setContract(contractInstance);
        setAccount(accounts[0]);
        console.log("MetaMask Connected: ", accounts[0]);
  
      } catch (error) {
        console.error("Error loading blockchain data:", error);
      }
    };
  
    if (!contract) {
      loadBlockchainData();
    }
  }, [contract]);
  
  // ✅ Handle File Upload (Not stored on blockchain, only name)
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileHash("sample_file_hash"); // Replace with actual hash if needed
    }
  };

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return;

    try {
      await contract.methods.createProduct(
        externalPO,  // External Purchase Order
        internalPO,   // Internal Purchase Order (ID)
        productName, // Product Name
        companyName, // Company Name
        fileHash     // File Hash (Dummy value for now)
      ).send({ 
        from: account,
        gas: 500000 
      });

      alert("Product stored on blockchain!");
    } catch (error) {
      console.error("Error:", error);
      alert(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <h1>ENTER PRODUCT DETAILS</h1>
      <form onSubmit={handleSubmit}>
        {/* ✅ Updated fields to match contract parameters */}
        <label>External PO</label>
        <input 
          type="text" 
          value={externalPO} 
          onChange={(e) => setExternalPO(e.target.value)} 
          required 
        />

        <label>Internal PO (Product ID)</label>
        <input 
          type="text" 
          value={internalPO}
          onChange={(e) => setinternalPO(e.target.value)} 
          required 
        />

        <label>Product Name</label>
        <input 
          type="text" 
          value={productName} 
          onChange={(e) => setProductName(e.target.value)} 
          required 
        />

        <label>Company Name (Creator Name)</label>
        <input 
          type="text" 
          value={companyName} 
          onChange={(e) => setcompanyName(e.target.value)} 
          required 
        />

        {/* Optional file upload (not stored in contract) */}
        <div className="uploading">
          <label>Upload CAD Design</label>
          <input type="file" onChange={handleFileChange} style={{ display: "none" }} id="fileInput" />
          <label htmlFor="fileInput" className="upload-button">
            <Upload />
          </label>
          {fileName && <p>Selected file: {fileName}</p>}
        </div>

        <div className="check-box">
          <label>Assign Units for Product</label>
          {LIST_DATA.map((item) => (
            <div key={item.id} className="checkbox-container">
              <input type="checkbox" id={item.id} name={item.name} value={item.name} />
              <label htmlFor={item.id}>{item.name}</label>
            </div>
          ))}
        </div>

        <button type="submit">Create Product</button>
      </form>
    </div>
  );
}

export default NewProd;
