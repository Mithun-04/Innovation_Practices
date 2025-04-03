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

  // Style constants using your requested color theme
  const styles = {
    container: {
      width: '100%', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '32px', 
      backgroundColor: '#f8fdfb', 
      borderRadius: '12px', 
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid #C4FFE0'
    },
    heading: {
      fontSize: '30px', 
      fontWeight: '700', 
      color: '#2E5947', 
      marginBottom: '32px',
      borderBottom: '3px solid #92DFC5',
      paddingBottom: '12px'
    },
    filterContainer: {
      marginBottom: '32px', 
      display: 'flex', 
      gap: '18px',
      alignItems: 'center'
    },
    searchInput: {
      flex: 1, 
      padding: '12px 16px', 
      borderRadius: '8px', 
      border: '2px solid #7EBEA3',
      fontSize: '16px',
      fontWeight: '500'
    },
    selectInput: {
      padding: '12px 16px', 
      borderRadius: '8px', 
      border: '2px solid #7EBEA3',
      backgroundColor: '#fff',
      fontSize: '16px',
      fontWeight: '500',
      color: '#2E5947'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
      fontWeight: '500',
      color: '#2E5947'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      accentColor: '#7EBEA3'
    },
    resetButton: {
      padding: '12px 20px', 
      borderRadius: '8px', 
      border: 'none', 
      backgroundColor: '#7EBEA3', 
      color: 'white',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    tableContainer: {
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
      border: '1px solid #C4FFE0'
    },
    tableHeader: {
      backgroundColor: '#92DFC5'
    },
    tableHeaderCell: {
      padding: '16px', 
      textAlign: 'left',
      fontSize: '18px',
      fontWeight: '600',
      color: '#2E5947'
    },
    tableRow: {
      borderBottom: '1px solid #C4FFE0',
      transition: 'background-color 0.2s'
    },
    tableRowHover: {
      backgroundColor: '#f0faf7'
    },
    tableCell: {
      padding: '16px',
      fontSize: '16px',
      fontWeight: '500'
    },
    statusBadgeCompleted: {
      padding: '6px 12px', 
      borderRadius: '9999px', 
      backgroundColor: '#dcfce7', 
      color: '#166534',
      fontSize: '14px',
      fontWeight: '600'
    },
    statusBadgeInProgress: {
      padding: '6px 12px', 
      borderRadius: '9999px', 
      backgroundColor: '#fef9c3', 
      color: '#854d0e',
      fontSize: '14px',
      fontWeight: '600'
    },
    stageText: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#2E5947'
    },
    loadingText: {
      fontSize: '18px',
      fontWeight: '500',
      color: '#2E5947',
      textAlign: 'center',
      padding: '40px 0'
    },
    noProductsText: {
      fontSize: '18px',
      fontWeight: '500',
      color: '#2E5947',
      textAlign: 'center',
      padding: '40px 0'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Product Tracking Dashboard</h2>

      {/* Search and Filter Section */}
      <div style={styles.filterContainer}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          style={styles.selectInput}
        >
          <option value="">All Companies</option>
          {[...new Set(allProducts.map(p => p.company))].map(company => (
            <option key={company} value={company}>{company}</option>
          ))}
        </select>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showCompletedOnly}
            onChange={(e) => setShowCompletedOnly(e.target.checked)}
            style={styles.checkbox}
          />
          Completed Only
        </label>
        <button 
          onClick={resetFilters} 
          style={styles.resetButton}
        >
          Reset
        </button>
      </div>

      {/* Product Table */}
      {isLoading ? (
        <p style={styles.loadingText}>Loading products...</p>
      ) : filteredProducts.length > 0 ? (
        <div style={styles.tableContainer}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Product</th>
                <th style={styles.tableHeaderCell}>Company</th>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Stage</th>
                <th style={styles.tableHeaderCell}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{product.name}</td>
                  <td style={styles.tableCell}>{product.company}</td>
                  <td style={styles.tableCell}>
                    <span style={product.status === 'Completed' ? styles.statusBadgeCompleted : styles.statusBadgeInProgress}>
                      {product.status}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.stageText}>Stage {product.stage}/4</span>
                  </td>
                  <td style={styles.tableCell}>{product.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={styles.noProductsText}>No products found</p>
      )}
    </div>
  );
};

export default ProductTrackingFilter;