import { CurrencySymbol } from '@signumjs/util';
import browser from 'webextension-polyfill';

import { browserInfo } from 'lib/browser-info';

import { AssetMetadata } from './types';

export const TEZOS_METADATA: AssetMetadata = {
  decimals: 6,
  symbol: 'TEZ',
  name: 'Tezos',
  thumbnailUri: browser.runtime.getURL('misc/token-logos/tez.svg')
};

export const SIGNA_METADATA: AssetMetadata = {
  decimals: 8,
  symbol: browserInfo.name === 'Safari' ? 'SIGNA' : CurrencySymbol,
  name: 'Signa',
  thumbnailUri: browser.runtime.getURL('misc/token-logos/signa.svg')
};

export const SIGNA_TESTNET_METADATA: AssetMetadata = {
  decimals: 8,
  symbol: browserInfo.name === 'Safari' ? 'TSIGNA' : `T${CurrencySymbol}`,
  name: 'TSigna',
  thumbnailUri: browser.runtime.getURL('misc/token-logos/signa.svg')
};

export const SMART_CONTRACT_PUBLIC_KEY = '0000000000000000000000000000000000000000000000000000000000000000';

export const SIGNA_TOKEN_ID = '0';
export const TRT_TOKEN_ID = '12402415494995249540';
export const FEATURED_TOKEN_IDS = [TRT_TOKEN_ID];
