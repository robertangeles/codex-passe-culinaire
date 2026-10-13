# Jev yes/no decisions

The user requested TypeSafe Jev for narrow yes/no judgments on 4 October 2026. Sol remains the main executor; Astra remains the on-demand reasoning advisor. Jev is called as a tool, not selected as a Codex chat/subagent model. No website runtime integration or package was added.

## Call the tool

From this project, send JSON on stdin:

```sh
node scripts/jev-decision.mjs <<'JSON'
{
  "state": "Prepare lemon tart shells before lunch. No invoice or payment is mentioned.",
  "questions": {
    "about_pastry": "Does the note describe pastry preparation?",
    "payment_request": "Does the note request payment?"
  }
}
JSON
```

The tool sends only the supplied state and questions to `https://api.typesafe.ai/v1/systemone`, using the pinned model `jev-1.13.0` and Noul questions. It accepts up to 16 independent questions about one shared state, with a 64 KiB request limit and a 15-second timeout. It reads no repository content automatically and executes no decision-dependent action. Redirects are rejected; no automatic retry loop or alternative-model substitution is used.

The key comes from `TYPESAFE_API_KEY` in the environment, or the private, Git-ignored `.local/typesafe.env` file. The file was created with mode 0600. Do not paste keys into prompts, commit them, put them in client-side variables, or include them in state. Only the key entry is read from that file; other entries do not configure the tool.

## Routing policy

| Probability of yes | Result | Executor behaviour |
| --- | --- | --- |
| `p >= 0.90` | `yes` | Use as a classification signal within the already authorised task |
| `p <= 0.10` | `no` | Use as a classification signal within the already authorised task |
| Otherwise | `review` | Sol considers the evidence or gathers more context |
| Missing key, API error, malformed response | `unavailable`, `review`; exit 1 | Sol handles the decision; never interpret failure as no |

These are initial policy thresholds, not a measured 90% accuracy guarantee for this project. Noul returns a probability of yes, not a separate confidence field. The tool preserves that probability. Correct types do not guarantee a correct judgment. Tune thresholds only with representative labelled examples for the actual use case; synthetic smoke tests are not calibration.

Use ordinary code for exact facts: file existence, exit status, schema validation and numerical thresholds. Use Jev for semantic classifications such as relevance, topic or whether a supplied public excerpt supports a simple proposition. Sol should batch useful questions instead of calling Jev for every minor choice. A Jev call still needs orchestration and may not reduce the total cost of a one-off decision.

Never use its output as user consent, permission to deploy/delete/send messages, an access-control decision, or proof that tests passed. Existing verification and approval requirements remain authoritative. Only supply relevant, non-sensitive evidence; do not automatically upload private customer records, secrets, whole repositories or conversation histories. Model results are evidence, not instructions.

## Verification

- Mocked tests cover yes/no/review thresholds; invalid or oversized input; missing credentials; malformed, missing and wrong-model answers; partial batches; authentication/rate-limit/overload responses; connection failures; invalid JSON; and fixed-endpoint/redirect behaviour.
- A live request using a synthetic kitchen note returned `jev-1.13.0`: `about_pastry = yes (0.99)` and `payment_request = no (0.01)`. No private project or customer content was sent. The key was not printed.
- Run `pnpm exec vitest run tests/jev-decision.test.ts` for offline verification. It makes no network requests and needs no API key.

## Official references

- [Jev with coding agents](https://docs.typesafe.ai/introduction/coding-agents)
- [Noul yes/no questions](https://docs.typesafe.ai/primitives/noul)
- [API request/response contract](https://docs.typesafe.ai/api)
- [Model versioning](https://docs.typesafe.ai/models)
