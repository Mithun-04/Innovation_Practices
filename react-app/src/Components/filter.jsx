import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ProductRegistryABI from "../../build/contracts/ProductRegistry.json"; 

const ProductTrackingFilter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // ✅ Stores original data
  const [isLoading, setIsLoading] = useState(true);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');

  useEffect(() => {
    const initBlockchain = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          const networkId = await web3Instance.eth.net.getId();

          const deployedNetwork = ProductRegistryABI.networks[networkId];
          if (!deployedNetwork) {
            alert("Smart contract not deployed on the detected network.");
            return;
          }

          const contractInstance = new web3Instance.eth.Contract(
            ProductRegistryABI.abi,
            deployedNetwork.address
          );

          setWeb3(web3Instance);
          setContract(contractInstance);
          setAccount(accounts[0]);

          console.log('Connected Account:', accounts[0]);
          console.log('Smart Contract Address:', deployedNetwork.address);

          await fetchProducts(contractInstance);

        } catch (error) {
          console.error("Error connecting to MetaMask:", error);
        }
      } else {
        alert("Please install MetaMask.");
      }
    };

    initBlockchain();
  }, []);

  // Fetch all products from blockchain
  const fetchProducts = async (contractInstance) => {
    try {
      const productKeys = await contractInstance.methods.getAllProductKeys().call();
      let products = [];

      for (let i = 0; i < productKeys.length; i++) {
        const key = productKeys[i];
        const productData = await contractInstance.methods.getProductDetails(key).call();

        products.push({
          id: i + 1,
          name: productData[1],
          company: productData[2],
          status: productData[4] ? 'Completed' : 'In Progress',
          stage: productData[5], // Number of units
          lastUpdated: new Date().toISOString().split('T')[0]
        });
      }

      setAllProducts(products); // ✅ Store original data
      setFilteredProducts(products); // ✅ Initial display
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Apply filters
  useEffect(() => {
    let results = allProducts; // ✅ Always filter from original data

    if (searchTerm) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCompany) {
      results = results.filter(product => product.company === selectedCompany);
    }

    if (showCompletedOnly) {
      results = results.filter(product => product.status === "Completed");
    }

    setFilteredProducts(results);
  }, [searchTerm, selectedCompany, showCompletedOnly, allProducts]); // ✅ Depend on allProducts

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCompany('');
    setShowCompletedOnly(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '24px' }}>Product Tracking Dashboard</h2>

      {/* Search and Filter Section */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        />
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
        >
          <option value="">All Companies</option>
          {[...new Set(allProducts.map(p => p.company))].map(company => ( // ✅ Ensure all companies always appear
            <option key={company} value={company}>{company}</option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={showCompletedOnly}
            onChange={(e) => setShowCompletedOnly(e.target.checked)}
          />
          Completed Only
        </label>
        <button onClick={resetFilters} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #2563eb', backgroundColor: '#2563eb', color: 'white' }}>Reset</button>
      </div>

      {/* Product Table */}
      {isLoading ? (
        <p>Loading products...</p>
      ) : filteredProducts.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f3f4f6' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Company</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Stage</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>{product.name}</td>
                <td style={{ padding: '12px' }}>{product.company}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '9999px', backgroundColor: product.status === 'Completed' ? '#dcfce7' : '#fef9c3', color: product.status === 'Completed' ? '#166534' : '#854d0e' }}>
                    {product.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>Stage {product.stage}/4</td>
                <td style={{ padding: '12px' }}>{product.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No products found</p>
      )}
    </div>
  );
};

export default ProductTrackingFilter;
