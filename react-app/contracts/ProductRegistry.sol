// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProductRegistry {
    struct Product {
        uint256 id;
        string externalPO;
        string internalPO;
        string productName;
        string companyName;
        string fileHash;
    }

    mapping(string => Product) private products;
    string[] private internalPOList;
    
    event ProductCreated(string internalPO, string productName);

    function createProduct(
        string memory _externalPO,
        string memory _internalPO,
        string memory _productName,
        string memory _companyName,
        string memory _fileHash
    ) public {
        require(bytes(products[_internalPO].internalPO).length == 0, "Product already exists");

        products[_internalPO] = Product(
            internalPOList.length + 1,
            _externalPO,
            _internalPO,
            _productName,
            _companyName,
            _fileHash
        );

        internalPOList.push(_internalPO);
        emit ProductCreated(_internalPO, _productName);
    }

    function getProduct(string memory _internalPO) public view returns (
        string memory, string memory, string memory, string memory, string memory
    ) {
        require(bytes(products[_internalPO].internalPO).length > 0, "Product not found");

        Product memory p = products[_internalPO];
        return (p.externalPO, p.internalPO, p.productName, p.companyName, p.fileHash);
    }
}
