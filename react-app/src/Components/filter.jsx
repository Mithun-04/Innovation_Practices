import React, { useState, useEffect } from 'react';

const ProductTrackingFilter = () => {
  // States for filters and data
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sample data - in a real application, this would come from an API
  const sampleProducts = [
    { id: 1, name: "Industrial Sensor X200", company: "TechCorp", status: "Completed", stage: 4, lastUpdated: "2025-03-15" },
    { id: 2, name: "Smart Tracker Pro", company: "TechCorp", status: "In Progress", stage: 2, lastUpdated: "2025-03-20" },
    { id: 3, name: "Location Beacon Mini", company: "InnoSystems", status: "Completed", stage: 4, lastUpdated: "2025-03-10" },
    { id: 4, name: "Asset Tag RFID-400", company: "InnoSystems", status: "In Progress", stage: 3, lastUpdated: "2025-03-22" },
    { id: 5, name: "Container Monitor", company: "LogiTrack", status: "Completed", stage: 4, lastUpdated: "2025-03-18" },
    { id: 6, name: "Fleet Tracker GPS", company: "LogiTrack", status: "In Progress", stage: 1, lastUpdated: "2025-03-21" },
  ];

  // Unique companies for dropdown
  const companies = [...new Set(sampleProducts.map(product => product.company))];

  // Simulate API call
  useEffect(() => {
    setTimeout(() => {
      setFilteredProducts(sampleProducts);
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter products based on search term, company, and completion status
  useEffect(() => {
    let results = sampleProducts;
    
    if (searchTerm) {
      results = results.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCompany) {
      results = results.filter(product => product.company === selectedCompany);
    }
    
    if (showCompletedOnly) {
      results = results.filter(product => product.status === "Completed");
    }
    
    setFilteredProducts(results);
  }, [searchTerm, selectedCompany, showCompletedOnly]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCompany('');
    setShowCompletedOnly(false);
  };

  // Inline CSS styles
  const styles = {
    container: {
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '24px'
    },
    header: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '24px'
    },
    filterSection: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px'
    },
    filterGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    searchContainer: {
      position: 'relative',
      gridColumn: 'span 2'
    },
    searchInput: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #d1d5db',
      outline: 'none',
      fontSize: '14px'
    },
    searchIcon: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af'
    },
    selectInput: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #d1d5db',
      outline: 'none',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    checkbox: {
      marginRight: '8px'
    },
    checkboxLabel: {
      fontSize: '14px',
      color: '#4b5563'
    },
    resetButton: {
      marginLeft: 'auto',
      padding: '4px 8px',
      fontSize: '12px',
      color: '#4b5563',
      background: 'none',
      border: 'none',
      cursor: 'pointer'
    },
    resetButtonHover: {
      color: '#3b82f6'
    },
    tableContainer: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px'
    },
    tableHead: {
      backgroundColor: '#f3f4f6'
    },
    tableHeader: {
      padding: '12px 16px',
      textAlign: 'left',
      fontWeight: '500',
      color: '#6b7280',
      textTransform: 'uppercase',
      fontSize: '12px',
      letterSpacing: '0.05em'
    },
    tableRow: {
      borderBottom: '1px solid #e5e7eb'
    },
    tableRowHover: {
      backgroundColor: '#f9fafb'
    },
    tableCell: {
      padding: '12px 16px',
      color: '#4b5563'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'inline-block'
    },
    completedBadge: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    inProgressBadge: {
      backgroundColor: '#fef9c3',
      color: '#854d0e'
    },
    progressContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    progressBar: {
      width: '100%',
      backgroundColor: '#e5e7eb',
      height: '8px',
      borderRadius: '9999px'
    },
    progressFill: {
      backgroundColor: '#3b82f6',
      height: '8px',
      borderRadius: '9999px'
    },
    progressText: {
      marginLeft: '8px',
      fontSize: '12px',
      color: '#9ca3af'
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '160px'
    },
    spinner: {
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      border: '2px solid transparent',
      borderTopColor: '#3b82f6',
      borderRightColor: '#3b82f6',
      animation: 'spin 1s linear infinite'
    },
    emptyContainer: {
      textAlign: 'center',
      padding: '40px 0'
    },
    emptyIcon: {
      margin: '0 auto',
      height: '48px',
      width: '48px',
      color: '#9ca3af'
    },
    emptyTitle: {
      marginTop: '8px',
      fontSize: '16px',
      fontWeight: '500',
      color: '#111827'
    },
    emptyText: {
      marginTop: '4px',
      fontSize: '14px',
      color: '#6b7280'
    },
    emptyButton: {
      marginTop: '24px',
      padding: '8px 16px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    }
  };

  // Create a style for spinning animation
  const spinKeyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      {/* Add the keyframes animation to the document */}
      <style>{spinKeyframes}</style>
      
      <div style={styles.container}>
        <h2 style={styles.header}>Product Tracking Dashboard</h2>
        
        {/* Search and Filter Section */}
        <div style={styles.filterSection}>
          <div style={styles.filterGrid}>
            {/* Search Input */}
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search products..."
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg 
                style={styles.searchIcon} 
                width="20" 
                height="20" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Company Dropdown */}
            <div>
              <select
                style={styles.selectInput}
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                <option value="">All Companies</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
            
            {/* Completed Toggle */}
            <div style={styles.checkboxContainer}>
              <input
                id="completed-only"
                type="checkbox"
                style={styles.checkbox}
                checked={showCompletedOnly}
                onChange={(e) => setShowCompletedOnly(e.target.checked)}
              />
              <label htmlFor="completed-only" style={styles.checkboxLabel}>
                Completed Only
              </label>
              
              <button
                onClick={resetFilters}
                style={styles.resetButton}
                onMouseOver={(e) => e.target.style.color = '#3b82f6'}
                onMouseOut={(e) => e.target.style.color = '#4b5563'}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        <div style={styles.tableContainer}>
          {isLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.tableHeader}>Product</th>
                  <th style={styles.tableHeader}>Company</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Stage</th>
                  <th style={styles.tableHeader}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr 
                    key={product.id} 
                    style={styles.tableRow}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={styles.tableCell}>{product.name}</td>
                    <td style={styles.tableCell}>{product.company}</td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(product.status === 'Completed' ? styles.completedBadge : styles.inProgressBadge)
                      }}>
                        {product.status}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.progressContainer}>
                        <div style={styles.progressBar}>
                          <div 
                            style={{
                              ...styles.progressFill,
                              width: `${(product.stage / 4) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span style={styles.progressText}>Stage {product.stage}/4</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>{product.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={styles.emptyContainer}>
              <svg 
                style={styles.emptyIcon} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 style={styles.emptyTitle}>No products found</h3>
              <p style={styles.emptyText}>Try adjusting your search or filter criteria.</p>
              <button
                onClick={resetFilters}
                style={styles.emptyButton}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductTrackingFilter;