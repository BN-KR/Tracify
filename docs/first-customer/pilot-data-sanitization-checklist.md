# Pilot data sanitization and retention checklist

Use one copy per customer. Complete intake before accepting evidence and complete deletion after the agreed review window.

## Pilot record

| Field | Value |
| --- | --- |
| Customer | [name] |
| Technical owner | [name and role] |
| Workflow | [one workflow] |
| Failure scenario | [one scenario] |
| Payment confirmed | [date and reference] |
| Evidence accepted | [date] |
| Delivery date | [date] |
| Review window ends | [date] |
| Deletion due | [date] |
| Deletion confirmed | [date and operator] |

## Written customer attestation

Ask the customer to confirm:

> The supplied files contain sanitized staging evidence only. They do not contain production PII, secrets, credentials, payment data, health data, regulated data, unredacted customer conversations, model-provider API keys, repositories, or executable customer code.

- Attested by: **[name]**
- Date: **[date]**

## Pre-acceptance checks

- [ ] One workflow and one failure scenario are named.
- [ ] Evidence consists of 10–25 sanitized staging traces or one staging reproduction.
- [ ] The customer has supplied expected behavior and the observed consequence.
- [ ] No production PII or unredacted customer conversation is included.
- [ ] No secrets, session tokens, API keys, credentials, or connection strings are included.
- [ ] No payment, health, regulated, or sensitive identity data is included.
- [ ] No arbitrary repository, dependency archive, binary, macro-enabled document, or executable code is included.
- [ ] No provider account access or model-provider key is requested or supplied.
- [ ] The review-window end date and deletion date are agreed in writing.
- [ ] The approved storage location and people with access are recorded.

If any check fails, do not continue. Quarantine the item from normal analysis, notify the customer, and request a sanitized replacement. Do not copy prohibited data into issue trackers, reports, chat, source control, or the CRM.

## Evidence inventory

Record every supplied item without copying sensitive content into this log.

| ID | Filename or trace range | Format | Size/count | Received | Sanitization confirmed by | Approved location | Delete by | Deleted |
| --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| D-01 | [name/range] | [json/csv/etc.] | [value] | [timestamp] | [name] | [location] | [date] | [timestamp] |

## Sanitization guidance for the customer

Replace direct identifiers with stable synthetic tokens when correlation is needed:

| Remove or replace | Safe replacement example |
| --- | --- |
| Name or username | `user_001` |
| Email | `user_001@example.invalid` |
| Phone number | `+1-555-0100` |
| Customer/account/order ID | `account_001`, `order_001` |
| Address or precise location | `region_north` |
| API key, token, cookie, authorization header | `[REDACTED_SECRET]` |
| Free-form customer conversation | Purpose-built synthetic staging conversation |
| Production URL containing IDs or tokens | Staging URL with synthetic identifiers |

Preserve only fields required to reproduce ordering, retrieval choice, tool response, model output, latency, cost, release, or failure state.

## Access and handling log

| Timestamp | Operator | Action | Evidence IDs | Purpose |
| --- | --- | --- | --- | --- |
| [time] | [name] | [received/opened/derived/deleted] | [IDs] | [reason] |

## Derived artifacts

The annotated trace and report must use synthetic identifiers and the minimum excerpts needed to support the finding.

- [ ] Screenshots have no customer names, account IDs, tokens, or unrelated conversations.
- [ ] Report excerpts are minimized and sanitized.
- [ ] Regression cases use synthetic inputs.
- [ ] Public case-study permission is separate, explicit, and recorded.

## Deletion procedure

1. Delete all supplied files and working copies from the approved location.
2. Delete exports, temporary copies, screenshots, and local caches containing customer evidence.
3. Retain only the sanitized final report and regression cases if the written agreement permits it.
4. Record the timestamp, operator, scope, and any permitted retained artifacts.
5. Send the customer a deletion confirmation.

Deletion notes: **[what was deleted, what was retained under agreement, and why]**
