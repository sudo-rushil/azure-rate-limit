# Rate-limit bug with Azure Foundry

## Expected v. Actual Behavior

**Expected**: I should be able to use models through Azure Foundry without rate limits/rate limit errors.
**Actual**: I get a `Rate limit approaching, waiting 10 seconds { runId: 'blah' }` error.

## How to Reproduce

1. Clone this repo [(link here)]().
2. Insert Azure Foundry keys:
```bash
$ cat .env.example 
AZURE_API_KEY=
AZURE_ENDPOINT=
```
3. Run `pnpx tsx test/rate-limit.ts`.
4. Alternatively, run `pnpm run dev`, go to the Mastra Playground, and prompt. 
5. Check the output for the offending `Rate limit approaching` error.

## Possible Fix

I wrote some logging code to show the actual headers being sent/received from Azure (with my endpoint/key redacted). An example log is available in `/test/rate-limit-log.txt`. Note that Azure sets
```
  x-ratelimit-limit-tokens: -1
  x-ratelimit-remaining-tokens: -1
  x-ratelimit-reset-tokens: 0
```

In Mastra, in `packages/core/src/llm/model/model.loop.ts:266,272`, there is the following snippet, which determines when this `Rate limit approaching` error is sent.
```typescript
            if (
              props?.response?.headers?.['x-ratelimit-remaining-tokens'] &&
              parseInt(props?.response?.headers?.['x-ratelimit-remaining-tokens'], 10) < 2000
            ) {
              this.logger.warn('Rate limit approaching, waiting 10 seconds', { runId });
              await delay(10 * 1000);
            }

```
This code seems to assume that this header will always be set to a nonnegative value, which clearly isn't true. I propose we cahnge the conditional to
```typescript
            if (props?.response?.headers?.['x-ratelimit-remaining-tokens'])
              const ratelimitRemainingTokens = parseInt(props?.response?.headers?.['x-ratelimit-remaining-tokens'], 10);
              if (ratelimitRemainingTokens >= 0 && ratelimitRemainingTokens < 2000) {
                this.logger.warn('Rate limit approaching, waiting 10 seconds', { runId });
                await delay(10 * 1000);
              }
            }
```
or something equivalent.

Description of the expected vs actual behavior
Exact steps to reproduce (install, build, run commands)
Which command or action triggers the error
Your environment (Node version, package manager, OS)

## Environment

On Node v25, with `pnpm`, running on MacOS Sequoia.
```bash
$ node --version   
v25.2.1

$ pnpm --version                                                            
10.22.0

$ sw_vers         
ProductName:		macOS
ProductVersion:		15.6
BuildVersion:		24G84
```
