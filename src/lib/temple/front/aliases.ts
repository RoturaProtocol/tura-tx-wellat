import { useCallback } from 'react';

import { Address, Alias } from '@signumjs/core';
import { URIResolver } from '@signumjs/standards';

import { useSignum } from './ready';

interface AliasList {
  aliases: Alias[];
}

function tryGetAccountIdFromAliasContent(content: string): string | null {
  let detectedAccount = '';
  try {
    // SRC44 standard
    const json = JSON.parse(content);
    detectedAccount = json.ac || '';
  } catch (e: any) {
    // legacy standard
    const result = /^acct:(s|ts|burst)-(?<address>.*)@burst$/gm.exec(content);
    if (result && result.groups) {
      detectedAccount = 's-' + result.groups.address || '';
    }
  }

  try {
    return Address.create(detectedAccount).getNumericId();
  } catch (e: any) {
    return null;
  }
}

export function useSignumAliasResolver() {
  const signum = useSignum();

  const resolveAccountPkToAlias = useCallback(
    async pk => {
      try {
        const address = Address.fromPublicKey(pk);
        const accountId = address.getNumericId();
        const rs = address.getReedSolomonAddress(false);
        const { aliases } = await signum.service.query<AliasList>('getAliases', { account: accountId });
        const accountsAliases = aliases.filter(({ aliasURI }) => {
          try {
            // checking for SRC44 spec
            const json = JSON.parse(aliasURI);
            return json.ac === accountId;
          } catch (e) {
            return null;
          }
        });
        // Aliases are ordered by times - newest is last
        return accountsAliases.length ? accountsAliases[accountsAliases.length - 1].aliasName : null;
      } catch (e) {
        return null;
      }
    },
    [signum]
  );

  const resolveAliasToAccountId = useCallback(
    async aliasName => {
      try {
        if (aliasName.length < 2) {
          return null;
        }

        const resolver = new URIResolver(signum);
        return (await resolver.resolve(`https://${aliasName}/ac`)) as string;
      } catch (e) {
        return null;
      }
    },
    [signum]
  );

  const resolveAliasToAccount = useCallback(
    async aliasName => {
      try {
        const accountId = await resolveAliasToAccountId(aliasName);
        if (!accountId) return null;
        return await signum.account.getAccount({
          accountId: accountId,
          includeEstimatedCommitment: false,
          includeCommittedAmount: false
        });
      } catch (e) {
        return null;
      }
    },
    [resolveAliasToAccountId, signum]
  );

  return {
    resolveAccountPkToAlias,
    resolveAliasToAccount,
    resolveAliasToAccountId
  };
}
