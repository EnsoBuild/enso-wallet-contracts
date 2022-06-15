import {defineConfig} from '@dethcrypto/eth-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  contracts: {
    mainnet: {
      stETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      dai: '0x6b175474e89094c44da98b954eedeac495271d0f',
      euler: {
        euler: '0x27182842E098f60e3D576794A5bFFb0777E025d3',
        markets: '0x3520d5a913427E6F0D6A83E07ccD4A4da316e4d3',
        liquidation: '0xf43ce1d09050BAfd6980dD43Cde2aB9F18C85b34',
        exec: '0x59828FdF7ee634AaaD3f58B19fDBa3b03E2D9d80',
        swap: '0x7123C8cBBD76c5C7fCC9f7150f23179bec0bA341',
      },
    },
  },
  etherscanKeys: {
    mainnet: process.env.ETHERSCAN_KEY,
  },
  rpc: {
    mainnet: process.env.ETH_NODE_URI_MAINNET,
  },
});
