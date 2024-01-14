import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';

import { Address } from '@signumjs/core';
import { generateMasterKeys } from '@signumjs/crypto';
import { useForm } from 'react-hook-form';

import Alert from 'app/atoms/Alert';
import FormCheckbox from 'app/atoms/FormCheckbox';
import FormField from 'app/atoms/FormField';
import FormSubmitButton from 'app/atoms/FormSubmitButton';
import { ReactComponent as NostrIcon } from 'app/icons/nostr-logo.svg';
import { t } from 'lib/i18n/react';
import { useTempleClient } from 'lib/temple/front';
import { withErrorHumanDelay } from 'lib/ui/humanDelay';

interface ByRecoveryPhraseFormData {
  recoveryPhrase: string;
  withNostr: boolean;
}

export const ByRecoveryPhraseForm: FC = () => {
  const { importMnemonicAccount } = useTempleClient();
  const { register, watch, handleSubmit, errors, formState } = useForm<ByRecoveryPhraseFormData>();
  const [error, setError] = useState<ReactNode>(null);
  const [address, setAddress] = useState('');
  const recoveryPhrase = watch('recoveryPhrase');

  useEffect(() => {
    if (!recoveryPhrase) {
      setAddress('');
      return;
    }

    try {
      const { publicKey } = generateMasterKeys(recoveryPhrase);
      setAddress(Address.fromPublicKey(publicKey).getReedSolomonAddress(false));
    } catch (e: any) {
      console.warn('');
    }
  }, [recoveryPhrase]);

  const onSubmit = useCallback(
    async ({ recoveryPhrase, withNostr }: ByRecoveryPhraseFormData) => {
      if (formState.isSubmitting) return;

      setError(null);
      try {
        await importMnemonicAccount(recoveryPhrase, undefined, withNostr);
      } catch (err: any) {
        console.error(err);
        await withErrorHumanDelay(err, () => {
          setError(err.message);
        });
      }
    },
    [formState.isSubmitting, setError, importMnemonicAccount]
  );

  return (
    <form className="w-full max-w-sm mx-auto my-8" onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert type="error" title={t('error')} autoFocus description={error} className="mb-6" />}
      <p className="text-sm text-gray-500 text-justify my-2">{t('importAccountRecoveryPhraseDescription')}</p>

      <FormField
        secret
        textarea
        rows={4}
        name="recoveryPhrase"
        ref={register({
          required: t('required')
        })}
        errorCaption={errors.recoveryPhrase?.message}
        label={t('mnemonicInputLabel')}
        labelDescription={t('mnemonicInputDescription')}
        labelWarning={t('mnemonicInputWarning')}
        id="importfundacc-mnemonic"
        placeholder={t('mnemonicInputPlaceholder')}
        spellCheck={false}
        className="resize-none"
      />
      <>
        <span className="text-base font-semibold text-gray-700">{t('address')}:</span>
        <span className="text-base font-semibold text-gray-700">&nbsp;{address}</span>
      </>

      <>
        {/*<div className="flex flex-row items-center mt-4 w-full">*/}
        {/*  <FormCheckbox containerClassName="w-full" name="withNostr" ref={register()} label={t('nostrAccountImport')} />*/}
        {/*  <NostrIcon className="ml-2 h-10 w-auto" />*/}
        {/*</div>*/}
        {/*<div className="text-xs text-gray-500 text-justify">{t('nostrAccountImportDescription')}</div>*/}
      </>
      <FormSubmitButton loading={formState.isSubmitting} className="my-4">
        {t('importAccount')}
      </FormSubmitButton>
    </form>
  );
};
