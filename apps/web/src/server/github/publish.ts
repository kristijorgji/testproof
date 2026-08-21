import type { Octokit } from 'octokit';
import { RequestError } from 'octokit';

export class PublishConflictError extends Error {
    readonly current: string;
    readonly currentSha: string;

    constructor(current: string, currentSha: string) {
        super('GitHub rejected the commit because the blob SHA is stale');
        this.name = 'PublishConflictError';
        this.current = current;
        this.currentSha = currentSha;
    }
}

export async function publishCommit(
    octokit: Octokit,
    input: {
        owner: string;
        repo: string;
        path: string;
        branch: string;
        message: string;
        baseBlobSha: string;
        yaml: string;
    },
): Promise<{ sha: string }> {
    try {
        const { data } = await octokit.rest.repos.createOrUpdateFileContents({
            owner: input.owner,
            repo: input.repo,
            path: input.path,
            branch: input.branch,
            message: input.message,
            content: Buffer.from(input.yaml).toString('base64'),
            sha: input.baseBlobSha,
        });
        return { sha: data.content?.sha ?? input.baseBlobSha };
    } catch (error) {
        if (error instanceof RequestError && error.status === 409) {
            const latest = await octokit.rest.repos.getContent({
                owner: input.owner,
                repo: input.repo,
                path: input.path,
                ref: input.branch,
            });
            if (!Array.isArray(latest.data) && latest.data.type === 'file' && latest.data.content) {
                throw new PublishConflictError(
                    Buffer.from(latest.data.content, 'base64').toString('utf8'),
                    latest.data.sha,
                );
            }
        }
        throw error;
    }
}

export async function publishPullRequest(
    octokit: Octokit,
    input: {
        owner: string;
        repo: string;
        path: string;
        baseBranch: string;
        headBranch: string;
        message: string;
        yaml: string;
        baseBlobSha: string;
    },
): Promise<{ number: number; url: string }> {
    const { data: ref } = await octokit.rest.git.getRef({
        owner: input.owner,
        repo: input.repo,
        ref: `heads/${input.baseBranch}`,
    });
    await octokit.rest.git.createRef({
        owner: input.owner,
        repo: input.repo,
        ref: `refs/heads/${input.headBranch}`,
        sha: ref.object.sha,
    });
    await publishCommit(octokit, {
        owner: input.owner,
        repo: input.repo,
        path: input.path,
        branch: input.headBranch,
        message: input.message,
        baseBlobSha: input.baseBlobSha,
        yaml: input.yaml,
    });
    const pr = await octokit.rest.pulls.create({
        owner: input.owner,
        repo: input.repo,
        title: input.message,
        head: input.headBranch,
        base: input.baseBranch,
    });
    return { number: pr.data.number, url: pr.data.html_url };
}
