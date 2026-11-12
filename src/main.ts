import * as core from '@actions/core'
import * as github from '@actions/github'

import {permitted} from './permitted'

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github_token')
    const octokit = github.getOctokit(githubToken)
    const username: Readonly<string> = // User to check, defaulting to the run's actor
      core.getInput('username')
      || github.context.actor
    const requiredPermission = core.getInput('permission', {required: true}) // Permission level passed in through args

    const allowed = await permitted(
      octokit,
      github.context,
      requiredPermission,
      username
    )
    if (allowed) {
      core.info(`✔️ ${username} is permitted`)
      core.setOutput('permitted', 'true')
    } else {
      core.setFailed(
        `🚨 Insufficient Permissions! ${username} does not have ${requiredPermission} permissions`
      )
      core.setOutput('permitted', 'false')
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error)
  }
}

run()
