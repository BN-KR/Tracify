# CrewAI dashboard reproduction inventory

This inventory was captured from the user-provided authenticated browser session on 2026-09-06. It is a route and behavior inventory only; no passwords, session cookies, or private credentials are stored here.

## Primary navigation

| Surface | Observed route | Initial state |
| --- | --- | --- |
| Automations | `/crewai_plus/dashboard` | Empty-state dashboard titled “Automations Live”; deploy-from-code CTA |
| Crew Studio | `/studio/v2` | Welcome/build surface with automation prompt, Flows selector, example templates, and project area |
| Agents Repository | `/crewai_plus/agents` | Empty state with usage-info button, New Agent action, CrewAI Agent and A2A Agent creation links |
| Tools & Integrations | `/crewai_plus/unified_tools` | Connections view with search, filters, sorting, expandable Applications list, and Add Connection |
| Skills Repository | `/crewai_plus/skills` | Searchable empty state showing 0 skills and CLI publishing guidance |
| Traces | `/crewai_plus/trace_batches` | Searchable trace-batch table with status and deployment-type filters; empty state |
| LLM Connections | `/crewai_plus/llm_connections` | Searchable empty state with Refresh and Add Connection |
| Environment Variables | `/crewai_plus/environment_variables` | Not yet inspected |
| Usage | `/crewai_plus/392111/usage` | Not yet inspected |
| Billing | `/crewai_plus/settings/billing` | Not yet inspected |
| Settings | `/crewai_plus/settings` | Not yet inspected |
| Resources | Navigation disclosure | Child routes not yet revealed |

## Initial Automations state

- Page heading: `Automations Live`
- Supporting text: `Manage and monitor your active crew automations from this dashboard.`
- Empty state: `Get started with Crews.`
- Primary action: `Deploy from Code`
- Supporting actions: CrewAI documentation, open-source crew library, and Crew Studio

## Crew Studio initial state

- Page heading: `Studio`
- Supporting text: `Build automations for your use case.`
- Welcome prompt: `Welcome, Kristoffer! What would you like to build today?`
- Main input placeholder: `Describe your automation`
- Mode selector: `Flows`
- Visible starter templates: customer support summarization, GitHub issue triage, sales-meeting preparation, vendor-invoice reconciliation, weekly product updates, and document-to-data extraction
- Lower section: `Your projects will appear here`

## Agents Repository initial state

- Page heading: `Agents Repository`
- Supporting text: `Create and configure CrewAI agents or connect external A2A agents`
- Actions: `View usage information`, `New Agent`
- Empty state: `No agents yet`
- Creation choices: `CrewAI Agent` at `/crewai_plus/agents/new` and `A2A Agent` at `/crewai_plus/agents/new?type=a2a`

## Tools & Integrations initial state

- Page heading: `Tools & Integrations`
- Supporting text: `Manage apps, internal tools, and integrations for your CrewAI agents`
- Tabs: `Connections`, `Internal Tools`, `Integrations`
- Connections controls: search, `Browse Agent Apps`, `Add Connection`, protocol/status/provider/creator/sharing filters, and application-name sorting
- Table grouping: expandable `Applications` group with columns for visibility, type, status, creator, and actions
- Observed application rows: Databricks and Snowflake, both showing MCP type

## Skills Repository initial state

- Page heading: `Skills Repository`
- Supporting text: `Browse, manage, and reuse agent skills within your organization.`
- Controls: query field `q`
- Empty state: `Viewing 0 skills`, `No skills yet`
- Guidance: reusable instructions can be published from the CrewAI CLI with `crewai skill push`

## Traces initial state

- Page heading: `Traces`
- Supporting text: `Monitor and analyze your execution traces`
- Controls: search field; status filter with All, Running, Completed, Failed, Timeout, and Cancelled; deployment-type filter with All, Deployed Crews, and Local Executions
- Empty state: `No trace batches`; `Get started by running some crew executions.`

## LLM Connections initial state

- Page heading: `LLM Connections`
- Supporting text: `Manage your language model API connections`
- Actions: `Refresh`, `Add Connection`
- Control: search field
- Empty state: `No LLM connections`; `Add your first LLM connection to start using AI models.`

## Reproduction notes

- The dashboard is a client-rendered authenticated application; a static HTML save will not reproduce its interactions.
- The replacement should use independently implemented components and data contracts rather than copying private session data or credentials.
- Each route needs a separate inspection pass for layout, loading states, empty states, controls, tables, modals, and navigation behavior.
