import { Network } from 'lib/messaging';

// get from getConstants of the nodes
export const NetworkName = {
  Mainnet: 'Tura',
  Testnet: 'Tura-TESTNET'
};

export const NETWORKS: Network[] = [
  // {
  //   id: 'ture-mainnet',
  //   networkName: NetworkName.Testnet,
  //   name: 'mainnet',
  //   description: 'For those hackers who run a local test net node on standard port 6876',
  //   type: 'test',
  //   rpcBaseURL: 'http://mainnet.tura.world:6876',
  //   color: '#CD9000',
  //   disabled: false
  // },
  {
    id: 'ture-testnet',
    networkName: NetworkName.Mainnet,
    name: 'testnet',
    description: 'For those hackers who run a local test net node on standard port 6876',
    type: 'main',
    rpcBaseURL: 'http://testnet.tura.world:6876',
    color: '#CD9000',
    disabled: false
  }
];
