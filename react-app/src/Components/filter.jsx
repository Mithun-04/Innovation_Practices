import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ProductRegistryABI from "../../build/contracts/ProductRegistry.json"; 

const ProductTrackingFilter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('internalPO'); // Default search by Internal PO
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(''); // Unit filtering
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');

  // Predefined unit types based on requirements
  const unitTypes = ["laser Cutting", "milling", "bending", "drilling"];

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
        const internalPO = productKeys[i];
        const productData = await contractInstance.methods.getProductDetails(internalPO).call();
        
        // Get units for this product
        const units = await contractInstance.methods.getProductUnits(internalPO).call();
        
        products.push({
          internalPO: internalPO,
          externalPO: productData[0], // externalPO is at index 0 as per your contract
          name: productData[1], // productName is at index 1
          company: productData[2], // companyName is at index 2
          fileHash: productData[3],
          status: productData[4] ? 'Completed' : 'In Progress', // isCompleted is at index 4
          units: units, // Store all units for filtering
          lastUpdated: new Date().toISOString().split('T')[0]
        });
      }

      setAllProducts(products);
      setFilteredProducts(products);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Apply filters
  useEffect(() => {
    let results = allProducts;

    if (searchTerm) {
      results = results.filter(product => {
        if (searchType === 'internalPO') {
          return product.internalPO.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          return product.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
    }

    if (selectedCompany) {
      results = results.filter(product => product.company === selectedCompany);
    }

    if (selectedUnit) {
      // Filter products that include the selected unit
      results = results.filter(product => 
        product.units.some(unit => unit.toLowerCase() === selectedUnit.toLowerCase())
      );
    }

    if (showCompletedOnly) {
      results = results.filter(product => product.status === "Completed");
    }

    setFilteredProducts(results);
  }, [searchTerm, searchType, selectedCompany, selectedUnit, showCompletedOnly, allProducts]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCompany('');
    setSelectedUnit('');
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
      flexDirection: 'column',
      gap: '18px'
    },
    filterRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      gap: '12px'
    },
    searchInput: {
      flex: '0 0 30%', // Takes 30% of the space
      padding: '12px 16px', 
      borderRadius: '8px', 
      border: '2px solid #7EBEA3',
      fontSize: '16px',
      fontWeight: '500'
    },
    selectInput: {
      flex: '0 0 16%', // Each select takes 20% of the space
      padding: '12px 16px', 
      borderRadius: '8px', 
      border: '2px solid #7EBEA3',
      backgroundColor: '#fff',
      fontSize: '16px',
      fontWeight: '500',
      color: '#2E5947'
    },
    checkboxContainer: {
      flex: '0 0 15%', // Checkbox container takes 15% of the space
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
      fontWeight: '500',
      color: '#2E5947',
      whiteSpace: 'nowrap'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      accentColor: '#7EBEA3'
    },
    resetButtonContainer: {
      flex: '0 0 15%', // Reset button takes 15% of the space
      display: 'flex',
      justifyContent: 'flex-end'
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
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      width: '80%'
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
    },
    searchTypeContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      marginTop: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Product Tracking Dashboard</h2>

      {/* Search and Filter Section - All elements distributed across full width */}
      <div style={styles.filterContainer}>
        <div style={styles.filterRow}>
          {/* Search Input - Wider than other elements */}
          <input
            type="text"
            placeholder={searchType === 'internalPO' ? "Search by Internal PO..." : "Search by Product Name..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          
          {/* Company Filter - Equal width as Unit Filter */}
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
          
          {/* Unit Filter - Equal width as Company Filter */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            style={styles.selectInput}
          >
            <option value="">All Units</option>
            {unitTypes.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          
          {/* Completed Only Checkbox */}
          <div style={styles.checkboxContainer}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showCompletedOnly}
                onChange={(e) => setShowCompletedOnly(e.target.checked)}
                style={styles.checkbox}
              />
              Completed Only
            </label>
          </div>
          
          {/* Reset Button */}
          <div style={styles.resetButtonContainer}>
            <button 
              onClick={resetFilters} 
              style={styles.resetButton}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Search Type Options */}
        <div style={styles.searchTypeContainer}>
          <label style={styles.checkboxLabel}>
            <input
              type="radio"
              name="searchType"
              checked={searchType === 'internalPO'}
              onChange={() => setSearchType('internalPO')}
              style={styles.checkbox}
            />
            Search by Internal PO
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="radio"
              name="searchType"
              checked={searchType === 'productName'}
              onChange={() => setSearchType('productName')}
              style={styles.checkbox}
            />
            Search by Product Name
          </label>
        </div>
      </div>

      {/* Product Table - External PO removed */}
      {isLoading ? (
        <p style={styles.loadingText}>Loading products...</p>
      ) : filteredProducts.length > 0 ? (
        <div style={styles.tableContainer}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.tableHeaderCell}>Internal PO</th>
                <th style={styles.tableHeaderCell}>Product</th>
                <th style={styles.tableHeaderCell}>Company</th>
                <th style={styles.tableHeaderCell}>Status</th>
                <th style={styles.tableHeaderCell}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.internalPO} style={styles.tableRow}>
                  <td style={styles.tableCell}>{product.internalPO}</td>
                  <td style={styles.tableCell}>{product.name}</td>
                  <td style={styles.tableCell}>{product.company}</td>
                  <td style={styles.tableCell}>
                    <span style={product.status === 'Completed' ? styles.statusBadgeCompleted : styles.statusBadgeInProgress}>
                      {product.status}
                    </span>
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