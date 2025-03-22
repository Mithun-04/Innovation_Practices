// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductRegistry {
    struct Product {
        string externalPO;
        string internalPO;
        string productName;
        string companyName;
        string fileHash;
        string[] units; // List of units
        mapping(string => string) unitStatus; // Status of each unit
        mapping(string => uint256) timestamps; // Timestamp for each unit
        bool isCompleted; // Tracks if the product is completed
    }

    mapping(string => Product) private products; // Store products by internal PO
    string[] private productKeys; // Track all product keys

    // Events
    event ProductCreated(
        string indexed internalPO,
        string externalPO,
        string productName,
        string companyName,
        string fileHash,
        string[] units,
        uint256 timestamp
    );

    event UnitStatusUpdated(
        string indexed internalPO,
        string unit,
        string newStatus,
        uint256 timestamp
    );

    // Create a new product
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

        // Initialize units with "to-do" status
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

    // Retrieve units of a product
    function getProductUnits(string memory _internalPO) public view returns (string[] memory) {
        require(bytes(products[_internalPO].internalPO).length > 0, "Product does not exist");
        return products[_internalPO].units;
    }

    // Retrieve details of a product
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

    // Get the status of a specific unit
    function getUnitStatus(string memory _internalPO, string memory _unit) public view returns (string memory) {
        require(bytes(products[_internalPO].internalPO).length > 0, "Product does not exist");
        require(bytes(products[_internalPO].unitStatus[_unit]).length > 0, "Unit does not exist");
        return products[_internalPO].unitStatus[_unit];
    }

    // Get the timestamp of a specific unit
    function getUnitTimestamp(string memory _internalPO, string memory _unit) public view returns (uint256) {
        require(bytes(products[_internalPO].internalPO).length > 0, "Product does not exist");
        uint256 timestamp = products[_internalPO].timestamps[_unit];
        require(timestamp != 0, "Unit does not exist or timestamp not set");
        return timestamp;
    }

    // Update the status of a unit
    function updateUnitStatus(string memory _internalPO, string memory _unit, string memory _newStatus) public {
        require(bytes(products[_internalPO].internalPO).length > 0, "Product does not exist");
        require(bytes(products[_internalPO].unitStatus[_unit]).length > 0, "Unit does not exist");

        products[_internalPO].unitStatus[_unit] = _newStatus;
        products[_internalPO].timestamps[_unit] = block.timestamp;

        emit UnitStatusUpdated(_internalPO, _unit, _newStatus, block.timestamp);
    }

    // Check if all units are done and update product completion status
    function checkProductCompletion(string memory _internalPO) public returns (bool) {
        require(bytes(products[_internalPO].internalPO).length > 0, "Product does not exist");
        
        Product storage product = products[_internalPO];
        bool allDone = true;
        
        for (uint i = 0; i < product.units.length; i++) {
            string memory unit = product.units[i];
            if (keccak256(bytes(product.unitStatus[unit])) != keccak256(bytes("done"))) {
                allDone = false;
                break;
            }
        }
        
        product.isCompleted = allDone;
        return allDone;
    }

    // Get all product keys (useful for listing all products)
    function getAllProductKeys() public view returns (string[] memory) {
        return productKeys;
    }
}