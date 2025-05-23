import {Contract, Signer} from 'ethers';
import {ethers, deployments, getNamedAccounts, getUnnamedAccounts, network} from 'hardhat';
import {EnsoWallet, EnsoWalletFactory, Events, PayableEvents} from '../../typechain';

export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

export async function setupUsers<T extends {[contractName: string]: Contract}>(
  addresses: string[],
  contracts: T
): Promise<({address: string} & T)[]> {
  const users: ({address: string} & T)[] = [];
  for (const address of addresses) {
    users.push(await setupUser(address, contracts));
  }
  return users;
}

export async function setupUser<T extends {[contractName: string]: Contract}>(
  address: string,
  contracts: T
): Promise<{address: string} & T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = {address};
  for (const key of Object.keys(contracts)) {
    user[key] = contracts[key].connect(await ethers.getSigner(address));
  }

  return user as {address: string} & T;
}

export async function setupUserWithEnsoWallet<
  T extends {[contractName: string]: Contract; EnsoWallet: EnsoWallet; EnsoWalletFactory: EnsoWalletFactory}
>(address: string, contracts: T): Promise<{address: string} & T> {
  const user = await setupUser(address, contracts);
  const EnsoWalletAddress = await user['EnsoWalletFactory'].getAddress();
  user['EnsoWallet'] = contracts.EnsoWallet.attach(EnsoWalletAddress).connect(await ethers.getSigner(address));
  return user;
}

export async function setupUsersWithEnsoWallets<
  T extends {[contractName: string]: Contract; EnsoWallet: EnsoWallet; EnsoWalletFactory: EnsoWalletFactory}
>(addresses: string[], contracts: T): Promise<({address: string} & T)[]> {
  const users: ({address: string} & T)[] = [];
  for (const address of addresses) {
    users.push(await setupUserWithEnsoWallet(address, contracts));
  }
  return users;
}

export const setup = deployments.createFixture(async () => {
  const {deployer} = await getNamedAccounts();

  await deployments.deploy('Events', {
    from: deployer,
    args: [],
    autoMine: true,
  });

  await deployments.deploy('PayableEvents', {
    from: deployer,
    args: [],
    autoMine: true,
  });

  const factoryDeployer = await ethers.getContract('FactoryDeployer')
  const factoryAddress = await factoryDeployer.factory()

  const contracts = {
    core: {
      EnsoWalletFactory: <EnsoWalletFactory>await ethers.getContractAt('EnsoWalletFactory', factoryAddress),
      EnsoWallet: <EnsoWallet>await ethers.getContract('EnsoWallet'),
    },
    testing: {
      Events: <Events>await ethers.getContract('Events'),
      PayableEvents: <PayableEvents>await ethers.getContract('PayableEvents'),
    },
  };

  const [user, secondUserWithEnsoWallet, ...users] = await setupUsersWithEnsoWallets(
    await getUnnamedAccounts(),
    contracts.core
  );

  const deployerUser = await setupUserWithEnsoWallet(deployer, contracts.core);
  await deployerUser.EnsoWalletFactory.deploy(ZERO_BYTES32, [], []);

  await secondUserWithEnsoWallet.EnsoWalletFactory.deploy(ZERO_BYTES32, [], []);

  return {
    contracts,
    users,
    userWithEnsoWallet: deployerUser,
    userWithoutEnsoWallet: user,
  };
});

export async function impersonateAccount(address: string): Promise<Signer> {
  await network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [address],
  });

  const signer = await ethers.getSigner(address);

  return signer;
}
