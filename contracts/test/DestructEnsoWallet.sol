// SPDX-License-Identifier: GPL-3.0-only

pragma solidity ^0.8.16;

import "../access/AccessController.sol";
import "./ApprovableMinimalWallet.sol";

contract Destroyer {
    function kill() public returns (bytes[] memory data) {
        selfdestruct(payable(msg.sender));
        return data;
    }
}

contract DestructEnsoWallet is AccessController, ApprovableMinimalWallet {
    using StorageAPI for bytes32;

    // Using same slot generation technique as eip-1967 -- https://eips.ethereum.org/EIPS/eip-1967
    bytes32 internal constant SALT = bytes32(uint256(keccak256("enso.wallet.salt")) - 1);

    event DelegateCallReturn(bool success, bytes ret);

    error AlreadyInit();

    constructor() {
        // Set salt to 0xff so that the implementation cannot be initialized
        SALT.setBytes32(bytes32(type(uint256).max)); 
    }

    function initialize(
        address owner,
        bytes32 salt,
        bytes32 shortcutId,
        bytes32[] calldata commands,
        bytes[] calldata state
    ) external payable {
        if (SALT.getBytes32() != bytes32(0)) revert AlreadyInit();
        SALT.setBytes32(salt);
        _setPermission(OWNER_ROLE, owner, true);
        _setPermission(EXECUTOR_ROLE, owner, true);
        if (commands.length != 0) {
            executeShortcut(shortcutId, commands, state);
        }
    }

    function executeShortcut(
        bytes32 shortcutId,
        bytes32[] calldata commands,
        bytes[] calldata state
    ) public isPermitted(EXECUTOR_ROLE) returns (bytes[] memory data) {
        (shortcutId);
        Destroyer destroyer = new Destroyer();
        (bool success, bytes memory ret) = address(destroyer).delegatecall(
            abi.encodeWithSelector(destroyer.kill.selector, commands, state)
        );
        emit DelegateCallReturn(success, ret);
        return data;
    }
}
