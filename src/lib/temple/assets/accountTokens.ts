import BigNumber from 'bignumber.js';

import * as Repo from 'lib/temple/repo';

import { PREDEFINED_MAINNET_TOKENS } from './predefinedTokens';

export async function setTokenStatus(network: string, account: string, tokenId: string, status: Repo.ITokenStatus) {
  const type = Repo.ITokenType.Fungible;
  const repoKey = Repo.toAccountTokenKey(network, account, tokenId);
  const existing = await Repo.accountTokens.get(repoKey);

  return Repo.accountTokens.put(
    {
      ...(existing ?? {
        type,
        network,
        account,
        tokenId,
        addedAt: Date.now()
      }),
      status
    },
    repoKey
  );
}

export async function removeToken(network: string, account: string, tokenId: string) {
  const repoKey = Repo.toAccountTokenKey(network, account, tokenId);
  return Repo.accountTokens.delete(repoKey);
}

export async function fetchDisplayedFungibleTokens(chainId: string, account: string) {
  return Repo.accountTokens
    .where({ type: Repo.ITokenType.Fungible, chainId, account })
    .filter(isTokenDisplayed)
    .reverse()
    .sortBy('addedAt');
  // .then(items => items.sort(compareAccountTokensByUSDBalance));
}

export async function fetchFungibleTokens(network: string, account: string) {
  return Repo.accountTokens
    .where({ type: Repo.ITokenType.Fungible, network, account })
    .reverse()
    .sortBy('addedAt')
    .then(tokens => tokens);
}

export async function fetchCollectibleTokens(chainId: string, account: string, isDisplayed: boolean) {
  return Repo.accountTokens
    .where({ type: Repo.ITokenType.Collectible, chainId, account })
    .filter(accountToken => (isDisplayed ? isTokenDisplayed(accountToken) : true))
    .reverse()
    .sortBy('addedAt');
}

export async function fetchAllKnownFungibleTokenSlugs(chainId: string) {
  const allAccountTokens = await Repo.accountTokens.where({ type: Repo.ITokenType.Fungible, chainId }).toArray();

  return Array.from(new Set(allAccountTokens.map(t => t.tokenId)));
}

export async function fetchAllKnownCollectibleTokenSlugs(chainId: string) {
  const allAccountTokens = await Repo.accountTokens.where({ type: Repo.ITokenType.Collectible, chainId }).toArray();

  return Array.from(new Set(allAccountTokens.map(t => t.tokenId)));
}

export function isTokenDisplayed(t: Repo.IAccountToken) {
  return (
    t.status === Repo.ITokenStatus.Enabled ||
    (t.status === Repo.ITokenStatus.Idle && new BigNumber(t.latestBalance!).isGreaterThan(0))
  );
}

export function compareAccountTokensByUSDBalance(a: Repo.IAccountToken, b: Repo.IAccountToken): number {
  if (!a.latestUSDBalance) return 1;
  if (!b.latestUSDBalance) return -1;

  const aUSDBal = new BigNumber(a.latestUSDBalance);
  const bUSDBal = new BigNumber(b.latestUSDBalance);

  const aPredefIndex = PREDEFINED_MAINNET_TOKENS.findIndex(slug => slug === a.tokenId);
  const bPredefIndex = PREDEFINED_MAINNET_TOKENS.findIndex(slug => slug === b.tokenId);

  if (aUSDBal.isEqualTo(bUSDBal)) return aPredefIndex > bPredefIndex ? 1 : -1;

  return aUSDBal.isLessThan(bUSDBal) ? 1 : -1;
}
