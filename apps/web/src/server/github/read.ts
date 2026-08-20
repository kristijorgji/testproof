import type { Octokit } from 'octokit';

export interface LedgerFile {
    content: string;
    sha: string;
}

export async function readLedger(
    octokit: Octokit,
    input: { owner: string; repo: string; path: string; ref: string },
): Promise<LedgerFile> {
    const { data } = await octokit.rest.repos.getContent({
        owner: input.owner,
        repo: input.repo,
        path: input.path,
        ref: input.ref,
    });
    if (Array.isArray(data) || data.type !== 'file' || !('content' in data) || !data.content) {
        throw new Error(`Expected a file at ${input.path}`);
    }
    return {
        content: Buffer.from(data.content, 'base64').toString('utf8'),
        sha: data.sha,
    };
}
