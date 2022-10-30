import { info } from '@actions/core';
import { WebhookPayload } from '@actions/github/lib/interfaces';

import { TCommit } from 'types/common';
import { fetchCommitsInPullRequest } from './octokit';

async function getCommitEmails(githubEvent: WebhookPayload): Promise<string[][] | undefined> {
  if (githubEvent.pull_request) {
    const { number } = githubEvent.pull_request;

    info(`Checking pull request with id: ${number}`);
    const data = await fetchCommitsInPullRequest(number);

    const authors = data.map((data) => data.commit.author?.email) as string[];
    const committers = data.map((data) => data.commit.committer?.email) as string[];

    return [authors, committers];
  }

  if (githubEvent.commits) {
    info('Checking commits');

    const authors = githubEvent.commits.map((commit: TCommit) => commit.author.email) as string[];
    const committers = githubEvent.commits.map(
      (commit: TCommit) => commit.committer.email
    ) as string[];

    return [authors, committers];
    // return githubEvent.commits.map((commit: TCommit) => commit.author.email);
  }

  throw Error('This action should be used in `pull_request` or `push` event');
}

export default getCommitEmails;
