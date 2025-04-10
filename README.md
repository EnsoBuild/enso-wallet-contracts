# Enso Wallet Contracts

## Docs

[Developer docs](https://docs.enso.finance)

## Contracts

Shortcuts contracts allow users to cheaply and deterministically deploy wallets capable of running Enso Shortcuts. By using a beacon proxy pattern, user wallets can be automatically upgraded to the most recent version of the Enso Wallet contract.

![contracts](https://user-images.githubusercontent.com/19808076/210630354-5e468522-ca3c-4367-91ed-c4a7e203233e.png)

```ml
├─ EnsoWallet - "Wallet implementation that supports Enso shortcuts"
├─ EnsoWalletFactory - "Factory for deploying Enso wallets"
├─ EnsoBeacon - "Provides the current Enso wallet implementation to wallet proxies"
├─ access
│  ├─ AccessController - "Gives a contract the ability to allow/restrict access to certain roles"
│  ├─ ACL - "Used to check if a caller has been given a role and can call functions restricted by role"
│  ├─ Ownable - "Contract to enable 2-step transfer of ownership"
│  ├─ Roles - "Roles used by contracts"
│  ├─ Timelock - "Time restrict functions with a delay"
├─ deployer
│  ├─ FactoryDeployer - "Contract for deploying and initializing the factory"
├─ libraries
│  ├─ BeaconClones - "Library for cheaply deploying a proxy with a hardcoded beacon that provides the most recent implementation"
│  ├─ StorageAPI - "Library for getting and setting state using bytes32 slots"
├─ proxy
│  ├─ BeaconProxyTemplate - "Contract for generating the bytecode used by the BeaconClones library"
│  ├─ UpgradeableProxy - "Simple proxy with implementation set in state. All upgrades are handled by a UUPS implementation"
├─ wallet
│  ├─ ERC1271 - "Support ERC1271 off-chain signing. Imported by EnsoWallet"
│  ├─ MinimalWallet - "Set of functions for withdrawing tokens and revoking allowances. Imported by EnsoWallet"
```

# Install
Before installation you need to have a `.env` file with following variables:
```
ETHERSCAN_KEY=
```

To install all dependencies run:
```bash
yarn
```

# Tests
To run tests:
```bash
yarn test
```

Test can use deployments as a fixture. Check the function `setup` in the `test/utils/index.ts` directory.

# Deployment
This repo uses [hardhat-deploy](https://github.com/wighawag/hardhat-deploy) to create deploy scripts in the `deploy` directory. 

Example of a deployment script:
```typescript
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;

  const {deterministic, deploy} = deployments;

  const {deploy: deployEnsoWalletFactory} = await deterministic('EnsoWalletFactory', {
    from: deployer,
    args: [EnsoBeaconAddress],
    log: true,
    autoMine: true,
    skipIfAlreadyDeployed: true,
  });

  await deployEnsoWalletFactory();
};
export default func;

func.tags = ['EnsoWalletFactory'];
```

Deployments summary for each network are in the `deployments` directory.

## Test deployment scripts
To check if deployment scripts are valid run:
```bash
yarn void:deploy
```

To check how deployment scripts will behave on live network run:
```bash
yarn fork:deploy <network name>[hardhat|localhost|mainnet]
```

## Deploy 
```bash
yarn deploy <network name>[hardhat|localhost|mainnet]
```

## Verify contracts 
To verify all contracts on Etherscan run:
```bash
yarn verify
```
