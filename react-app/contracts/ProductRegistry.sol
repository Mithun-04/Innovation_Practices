// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductRegistry {
    struct Product {
        string externalPO;
        string internalPO;
        string productName;
        string companyName;
        string fileHash;
        string[] units; // Dynamic array of units
        mapping(string => string) unitStatus; // Status of each unit
        mapping(string => uint256) timestamps; // Timestamp for each unit
        bool isCompleted;
    }

    mapping(string => Product) private products;
    string[] private productKeys;

    event ProductCreated(
        string indexed internalPO,
        string externalPO,
        string productName,
        string companyName,
        string fileHash,
        string[] units,
        uint256 timestamp
    );
    event UnitUpdated(
        string indexed internalPO,
        string unit,
        string status,
        uint256 timestamp
    );

    function createProduct(
        string memory _externalPO,
        string memory _internalPO,
        string memory _productName,
        string memory _companyName,
        string memory _fileHash,
        string[] memory _units
    ) public {
        require(bytes(_internalPO).length > 0, "Internal PO cannot be empty");
        require(bytes(products[_internalPO].internalPO).length == 0, "Product already exists");
        require(_units.length > 0, "At least one unit must be provided");

        Product storage newProduct = products[_internalPO];
        newProduct.externalPO = _externalPO;
        newProduct.internalPO = _internalPO;
        newProduct.productName = _productName;
        newProduct.companyName = _companyName;
        newProduct.fileHash = _fileHash;
        newProduct.isCompleted = false;

        // Store units
        for (uint i = 0; i < _units.length; i++) {
            require(bytes(_units[i]).length > 0, "Unit name cannot be empty");
            newProduct.units.push(_units[i]);
            newProduct.unitStatus[_units[i]] = "to-do";
            newProduct.timestamps[_units[i]] = block.timestamp;
        }

        productKeys.push(_internalPO);

        emit ProductCreated(
            _internalPO,
            _externalPO,
            _productName,
            _companyName,
            _fileHash,
            _units,
            block.timestamp
        );
    }
    
    // Getter for units
    function getProductUnits(string memory _internalPO) public view returns (string[] memory) {
        require(bytes(products[_internalPO].internalPO).length > 0, "Product does not exist");
        return products[_internalPO].units;
    }
    
    // Getter for product details
    function getProductDetails(string memory _internalPO) public view returns (
        string memory externalPO,
        string memory productName,
        string memory companyName,
        string memory fileHash,
        bool isCompleted,
        uint unitsCount
    ) {
        require(bytes(products[_internalPO].internalPO).length > 0, "Product does not exist");
        Product storage product = products[_internalPO];
        
        return (
            product.externalPO,
            product.productName,
            product.companyName,
            product.fileHash,
            product.isCompleted,
            product.units.length
        );
    }
    
    // Getter for unit status
    function getUnitStatus(string memory _internalPO, string memory _unit) public view returns (string memory) {
        require(bytes(products[_internalPO].internalPO).length > 0, "Product does not exist");
        require(bytes(products[_internalPO].unitStatus[_unit]).length > 0, "Unit does not exist");
        return products[_internalPO].unitStatus[_unit];
    }
    
    // New getter for unit timestamp
    function getUnitTimestamp(string memory _internalPO, string memory _unit) public view returns (uint256) {
        require(bytes(products[_internalPO].internalPO).length > 0, "Product does not exist");
        uint256 timestamp = products[_internalPO].timestamps[_unit];
        require(timestamp != 0, "Unit does not exist or timestamp not set");
        return timestamp;
    }
}