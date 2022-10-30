import { getInput, setOutput, setFailed, info, warning } from '@actions/core';

import { INPUT, OUTPUT } from 'constants/io';
import { GITHUB_EVENT } from 'constants/env';
import { FALSE } from 'constants/boolean';
import getCommitEmails from 'helpers/getCommitEmails';
import filterInvalidEmails from 'helpers/filterInvalidEmails';

async function checkEmail(): Promise<void> {
  const authorEmailDomainInput = getInput(INPUT.AUTHOR_EMAIL_DOMAIN, { required: true });
  const committerEmailDomainInput = getInput(INPUT.COMMITTER_EMAIL_DOMAIN, { required: true });
  info(`Author's email domain: ${authorEmailDomainInput}`);
  info(`Committer's email domain: ${committerEmailDomainInput}`);

  const commitEmails = await getCommitEmails(GITHUB_EVENT);

  if (!commitEmails) {
    return warning('Could not found emails');
  }
  info(`Emails to check, author emails: ${commitEmails[0]}`);
  info(`Emails to check, committer emails: ${commitEmails[1]}`);

  const invalidAuthorEmails = filterInvalidEmails(authorEmailDomainInput, commitEmails[0]);
  const invalidCommitterEmails = filterInvalidEmails(committerEmailDomainInput, commitEmails[1]);

  handleSetOutput(
    [invalidAuthorEmails, invalidCommitterEmails],
    [authorEmailDomainInput, committerEmailDomainInput]
  );
}

function handleSetOutput(invalidEmails: string[][], emailDomainInput: string[]): void {
  const isValid = invalidEmails[0].length === 0 && invalidEmails[1].length === 0;

  setOutput(OUTPUT.IS_VALID, isValid);

  if (isValid) {
    return info('Emails are valid');
  }

  const errorOnFail = getInput(INPUT.ERROR_ON_FAIL);
  const errorMessage = `Invalid emails found. Invalid author emails: ${invalidEmails[0]}, it should be end with ${emailDomainInput[0]}. Invalid committer emails: ${invalidEmails[1]}, it should be end with ${emailDomainInput[1]}`;

  if (errorOnFail === FALSE) {
    warning(errorMessage);
  } else {
    throw Error(errorMessage);
  }
}

checkEmail().catch((error) => {
  setFailed(error.message);
});

export default checkEmail;
