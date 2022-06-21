// SPDX-License-Identifier: MIT

pragma solidity ^0.8.11;

import "./Portal.sol";
import {Clones} from "./Libraries/Clones.sol";

contract PortalFactory {
    using Clones for address;

    mapping(address => Portal) public user;
    address public immutable portalImplementation_;
    address public immutable ensoVM_;

    event Deployed(Portal instance);

    error AlreadyExists();

    constructor(address _vm, address _portal) {
        portalImplementation_ = _portal;
        ensoVM_ = _vm;
    }

    function deploy(bytes32[] calldata commands, bytes[] calldata state) public payable returns (Portal instance) {
        if (address(user[msg.sender]) != address(0)) {
            revert AlreadyExists();
        }

        instance = Portal(portalImplementation_.cloneDeterministic(msg.sender));
        instance.initialize{value: msg.value}(ensoVM_, msg.sender, commands, state);

        user[msg.sender] = instance;
        emit Deployed(instance);
    }

    function getAddress() public view returns (address) {
        return portalImplementation_.predictDeterministicAddress(msg.sender, address(this));
    }
}
