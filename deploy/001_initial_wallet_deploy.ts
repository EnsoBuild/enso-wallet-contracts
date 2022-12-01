import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;

  const {deterministic} = deployments;

  const {deployer} = await getNamedAccounts();

  const {deploy: deployMinimalWallet, address: MinimalWalletAddress} = await deterministic('MinimalWallet', {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    skipIfAlreadyDeployed: true,
  });

  await deployMinimalWallet();

  const {deploy: deployEnsoWallet, address: EnsoWalletAddress} = await deterministic('EnsoWallet', {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
    skipIfAlreadyDeployed: true,
  });

  await deployEnsoWallet();

  const {deploy: deployEnsoBeacon, address: EnsoBeaconAddress} = await deterministic('EnsoBeacon', {
    from: deployer,
    args: [EnsoWalletAddress, MinimalWalletAddress],
    log: true,
    autoMine: true,
    skipIfAlreadyDeployed: true,
  });

  await deployEnsoBeacon();

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
func.tags = ['EnsoWallet'];
