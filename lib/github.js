import { Octokit } from '@octokit/rest'

// Initialize GitHub API client
export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

// Test GitHub API connection
export async function testGitHubConnection() {
  try {
    const { data } = await octokit.rest.repos.get({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
    })
    
    console.log('✅ GitHub API Connected Successfully!')
    console.log(`Repository: ${data.full_name}`)
    console.log(`Description: ${data.description}`)
    console.log(`Stars: ${data.stargazers_count}`)
    
    return { success: true, data }
  } catch (error) {
    console.error('❌ GitHub API Connection Failed:', error.message)
    return { success: false, error: error.message }
  }
}

// Get repository information
export async function getRepoInfo() {
  try {
    const { data } = await octokit.rest.repos.get({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
    })
    return data
  } catch (error) {
    console.error('Error fetching repo info:', error)
    throw error
  }
}

// Get recent commits
export async function getRecentCommits(limit = 10) {
  try {
    const { data } = await octokit.rest.repos.listCommits({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      per_page: limit,
    })
    return data
  } catch (error) {
    console.error('Error fetching commits:', error)
    throw error
  }
}