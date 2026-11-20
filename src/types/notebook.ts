export type CoverTheme = 'slate' | 'amber' | 'emerald' | 'indigo' | 'burgundy' | 'espresso' | 'sky';

export type PaperStyle = 'blank' | 'ruled' | 'grid' | 'dots';

export interface NoteHistoryEntry {
  id: string;
  timestamp: string;
  title: string;
  wordCount: number;
  contentHtml: string;
}

export interface NotePage {
  id: string;
  notebookId: string;
  title: string;
  contentHtml: string;
  contentMarkdown: string;
  tags: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  history?: NoteHistoryEntry[];
}

export interface Notebook {
  id: string;
  title: string;
  description: string;
  coverTheme: CoverTheme;
  paperStyle: PaperStyle;
  category: string;
  tags: string[];
  isArchived?: boolean;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  contentHtml: string;
  contentMarkdown: string;
}

export const COVER_THEMES: Record<CoverTheme, {
  name: string;
  spineColor: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  accentBg: string;
}> = {
  slate: {
    name: 'Graphite Slate',
    spineColor: 'bg-slate-800',
    bgGradient: 'from-slate-900 to-slate-800',
    borderColor: 'border-slate-700',
    textColor: 'text-slate-100',
    accentBg: 'bg-slate-700',
  },
  amber: {
    name: 'Cognac Amber',
    spineColor: 'bg-amber-800',
    bgGradient: 'from-amber-900 to-amber-950',
    borderColor: 'border-amber-800',
    textColor: 'text-amber-100',
    accentBg: 'bg-amber-800/80',
  },
  emerald: {
    name: 'Forest Sage',
    spineColor: 'bg-emerald-900',
    bgGradient: 'from-emerald-950 to-emerald-900',
    borderColor: 'border-emerald-800',
    textColor: 'text-emerald-100',
    accentBg: 'bg-emerald-800/80',
  },
  indigo: {
    name: 'Midnight Navy',
    spineColor: 'bg-indigo-950',
    bgGradient: 'from-indigo-950 to-slate-900',
    borderColor: 'border-indigo-800',
    textColor: 'text-indigo-100',
    accentBg: 'bg-indigo-900/80',
  },
  burgundy: {
    name: 'Heritage Burgundy',
    spineColor: 'bg-rose-950',
    bgGradient: 'from-rose-950 to-rose-900',
    borderColor: 'border-rose-900',
    textColor: 'text-rose-100',
    accentBg: 'bg-rose-900/80',
  },
  espresso: {
    name: 'Espresso Leather',
    spineColor: 'bg-stone-900',
    bgGradient: 'from-stone-950 to-stone-900',
    borderColor: 'border-stone-800',
    textColor: 'text-stone-100',
    accentBg: 'bg-stone-800',
  },
  sky: {
    name: 'Alpine Cyan',
    spineColor: 'bg-sky-950',
    bgGradient: 'from-sky-950 to-slate-900',
    borderColor: 'border-sky-800',
    textColor: 'text-sky-100',
    accentBg: 'bg-sky-900/80',
  },
};

export const INITIAL_NOTEBOOKS: Notebook[] = [
  {
    id: 'nb-systems-arch',
    title: 'Systems Architecture & Topology',
    description: 'High-availability infrastructure blueprints, distributed consensus protocols, and API boundaries.',
    coverTheme: 'indigo',
    paperStyle: 'grid',
    category: 'Engineering',
    tags: ['Architecture', 'Infrastructure', 'Distributed Systems'],
    isFavorite: true,
    createdAt: '2026-09-12T09:00:00.000Z',
    updatedAt: '2026-10-18T16:45:00.000Z',
  },
  {
    id: 'nb-product-discovery',
    title: 'Product Discovery & Heuristics',
    description: 'Field interview transcripts, user journey friction audits, and feature prioritization matrices.',
    coverTheme: 'amber',
    paperStyle: 'ruled',
    category: 'Product Design',
    tags: ['Discovery', 'UX Research', 'Roadmap'],
    isFavorite: true,
    createdAt: '2026-09-20T11:30:00.000Z',
    updatedAt: '2026-10-19T10:15:00.000Z',
  },
  {
    id: 'nb-engineering-journal',
    title: 'Technical Fieldbook & Profiling',
    description: 'Daily benchmark observations, memory leak investigations, and kernel latency logs.',
    coverTheme: 'espresso',
    paperStyle: 'dots',
    category: 'Engineering',
    tags: ['Performance', 'Telemetry', 'Logs'],
    isFavorite: false,
    createdAt: '2026-10-01T08:15:00.000Z',
    updatedAt: '2026-10-19T07:30:00.000Z',
  },
  {
    id: 'nb-research-digest',
    title: 'Research Digest & Reading Compendium',
    description: 'Critical annotations of computer science papers, typography principles, and cognitive ergonomics.',
    coverTheme: 'emerald',
    paperStyle: 'blank',
    category: 'Research',
    tags: ['Publications', 'Reading', 'Cognitive Ergonomics'],
    isFavorite: false,
    createdAt: '2026-08-15T14:00:00.000Z',
    updatedAt: '2026-10-15T19:20:00.000Z',
  },
];

export const INITIAL_PAGES: NotePage[] = [
  {
    id: 'page-sys-01',
    notebookId: 'nb-systems-arch',
    title: '01. Distributed Event Bus & Partition Strategy',
    order: 0,
    tags: ['Architecture', 'Kafka', 'Fault-Tolerance'],
    isPinned: true,
    isFavorite: true,
    createdAt: '2026-09-12T09:15:00.000Z',
    updatedAt: '2026-10-18T16:45:00.000Z',
    contentHtml: `<h1>Distributed Event Bus & Partition Strategy</h1>
<p>This document formalizes our partitioning scheme across broker clusters, ensuring ordered message delivery for financial transactions while preserving throughput above 45,000 ops/second.</p>

<div class="note-callout-info">
  <strong>Guiding Principle:</strong> Partition keys must remain deterministic based on composite <code>tenant_id:account_uuid</code> to prevent out-of-order ledger reconciliation.
</div>

<h2>Core Objectives</h2>
<ul>
  <li>Zero data loss during broker leader election (maximum failover window $\le 180\text{ms}$).</li>
  <li>Strict partition ordering per tenant stream.</li>
  <li>Idempotent consumers with deduplication windows spanning 72 hours.</li>
</ul>

<h2>Verification Checklist</h2>
<div class="task-item"><input type="checkbox" checked /> <span>Confirm replica lag monitoring threshold alerts at 250ms.</span></div>
<div class="task-item"><input type="checkbox" checked /> <span>Audit SASL/SCRAM authentication rotation mechanism.</span></div>
<div class="task-item"><input type="checkbox" /> <span>Conduct chaos failure drill on availability zone C.</span></div>

<h2>Throughput Benchmark Metrics</h2>
<table>
  <thead>
    <tr>
      <th>Partition Count</th>
      <th>Batch Size</th>
      <th>P99 Latency</th>
      <th>Throughput</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>16 Partitions</td>
      <td>64 KB</td>
      <td>14.2 ms</td>
      <td>38,400 msg/sec</td>
    </tr>
    <tr>
      <td>32 Partitions</td>
      <td>128 KB</td>
      <td>8.6 ms</td>
      <td>52,100 msg/sec</td>
    </tr>
    <tr>
      <td>64 Partitions</td>
      <td>256 KB</td>
      <td>11.4 ms</td>
      <td>61,800 msg/sec</td>
    </tr>
  </tbody>
</table>

<blockquote>The real cost of distributed architecture is not network bandwidth, but the cognitive overhead of asynchronous failure recovery.</blockquote>

<pre><code>// Idempotent producer config snippet
const kafkaConfig = {
  clientId: 'ledger-producer-01',
  brokers: ['broker-a.internal:9092', 'broker-b.internal:9092'],
  idempotent: true,
  maxInFlightRequests: 1,
  retry: { retries: 5, initialRetryTime: 300 }
};</code></pre>`,
    contentMarkdown: `# Distributed Event Bus & Partition Strategy

This document formalizes our partitioning scheme across broker clusters, ensuring ordered message delivery for financial transactions while preserving throughput above 45,000 ops/second.

> **Guiding Principle:** Partition keys must remain deterministic based on composite \`tenant_id:account_uuid\` to prevent out-of-order ledger reconciliation.

## Core Objectives
* Zero data loss during broker leader election (maximum failover window $\\le 180\\text{ms}$).
* Strict partition ordering per tenant stream.
* Idempotent consumers with deduplication windows spanning 72 hours.

## Verification Checklist
- [x] Confirm replica lag monitoring threshold alerts at 250ms.
- [x] Audit SASL/SCRAM authentication rotation mechanism.
- [ ] Conduct chaos failure drill on availability zone C.

## Throughput Benchmark Metrics
| Partition Count | Batch Size | P99 Latency | Throughput |
| --- | --- | --- | --- |
| 16 Partitions | 64 KB | 14.2 ms | 38,400 msg/sec |
| 32 Partitions | 128 KB | 8.6 ms | 52,100 msg/sec |
| 64 Partitions | 256 KB | 11.4 ms | 61,800 msg/sec |

> The real cost of distributed architecture is not network bandwidth, but the cognitive overhead of asynchronous failure recovery.

\`\`\`typescript
// Idempotent producer config snippet
const kafkaConfig = {
  clientId: 'ledger-producer-01',
  brokers: ['broker-a.internal:9092', 'broker-b.internal:9092'],
  idempotent: true,
  maxInFlightRequests: 1,
  retry: { retries: 5, initialRetryTime: 300 }
};
\`\`\``,
  },
  {
    id: 'page-sys-02',
    notebookId: 'nb-systems-arch',
    title: '02. API Gateway & Microservice Routing Protocol',
    order: 1,
    tags: ['Gateway', 'Routing', 'TLS'],
    isPinned: false,
    isFavorite: false,
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-10-14T11:20:00.000Z',
    contentHtml: `<h1>API Gateway & Microservice Routing Protocol</h1>
<p>Routing policy definitions and perimeter token validation specs for ingress gateways.</p>

<h2>Authentication Boundary</h2>
<p>Edge routers terminate public TLS 1.3 connections, inspect JWT bearer tokens, and inject cryptographically signed downstream headers:</p>

<ul>
  <li><code>X-Internal-Principal-ID</code>: Normalized subject identifier.</li>
  <li><code>X-Internal-Tenant-Tier</code>: Rate-limiting bucket allocation.</li>
  <li><code>X-Trace-Context</code>: W3C compliant distributed trace parent.</li>
</ul>

<div class="note-callout-warning">
  <strong>Security Requirement:</strong> Ingress microservices must reject any incoming request that lacks internal HMAC signature headers from the gateway.
</div>`,
    contentMarkdown: `# API Gateway & Microservice Routing Protocol

Routing policy definitions and perimeter token validation specs for ingress gateways.

## Authentication Boundary
Edge routers terminate public TLS 1.3 connections, inspect JWT bearer tokens, and inject cryptographically signed downstream headers:

* \`X-Internal-Principal-ID\`: Normalized subject identifier.
* \`X-Internal-Tenant-Tier\`: Rate-limiting bucket allocation.
* \`X-Trace-Context\`: W3C compliant distributed trace parent.

> **Security Requirement:** Ingress microservices must reject any incoming request that lacks internal HMAC signature headers from the gateway.`,
  },
  {
    id: 'page-prod-01',
    notebookId: 'nb-product-discovery',
    title: 'Customer Interview Synthesis - Q3 Research',
    order: 0,
    tags: ['UX Research', 'Interviews', 'Synthesis'],
    isPinned: true,
    isFavorite: true,
    createdAt: '2026-09-22T14:30:00.000Z',
    updatedAt: '2026-10-19T10:15:00.000Z',
    contentHtml: `<h1>Customer Interview Synthesis - Q3 Research</h1>
<p>Summary of 14 in-depth interviews conducted with staff software engineers and engineering managers between September 15 and October 5.</p>

<h2>Key Friction Points Identified</h2>
<ol>
  <li><strong>Context Fragmentation:</strong> Engineers toggle between 5 distinct documentation tools to locate API contracts.</li>
  <li><strong>Catalog Organization:</strong> Traditional hierarchical folders fail when notes span multiple cross-functional projects.</li>
  <li><strong>Export Rigidity:</strong> Inability to export clean, printable executive summaries without markup garbage.</li>
</ol>

<div class="note-callout-tip">
  <strong>Key Opportunity:</strong> Provide unified notebook cataloging with tactile theme accents, unboxed metadata, and instant print-ready styling.
</div>

<h2>Representative Quotes</h2>
<blockquote>"I just need my notes organized like real physical fieldbooks—each with its own purpose, searchable instantly, and without the clunky bloat of modern wikis."</blockquote>`,
    contentMarkdown: `# Customer Interview Synthesis - Q3 Research

Summary of 14 in-depth interviews conducted with staff software engineers and engineering managers between September 15 and October 5.

## Key Friction Points Identified
1. **Context Fragmentation:** Engineers toggle between 5 distinct documentation tools to locate API contracts.
2. **Catalog Organization:** Traditional hierarchical folders fail when notes span multiple cross-functional projects.
3. **Export Rigidity:** Inability to export clean, printable executive summaries without markup garbage.

> **Key Opportunity:** Provide unified notebook cataloging with tactile theme accents, unboxed metadata, and instant print-ready styling.

## Representative Quotes
> "I just need my notes organized like real physical fieldbooks—each with its own purpose, searchable instantly, and without the clunky bloat of modern wikis."`,
  },
  {
    id: 'page-eng-01',
    notebookId: 'nb-engineering-journal',
    title: 'Daily Field Log - October 19, 2026',
    order: 0,
    tags: ['Daily Log', 'Profiling', 'Benchmarks'],
    isPinned: false,
    isFavorite: false,
    createdAt: '2026-10-19T07:30:00.000Z',
    updatedAt: '2026-10-19T07:30:00.000Z',
    contentHtml: `<h1>Daily Field Log - October 19, 2026</h1>
<p>Morning standup and performance profiling notes for the catalog indexing engine.</p>

<h2>Today's Deliverables</h2>
<div class="task-item"><input type="checkbox" checked /> <span>Verify zero layout shift on notebook grid rendering.</span></div>
<div class="task-item"><input type="checkbox" checked /> <span>Enforce tabular numerals on all word counts and timestamp displays.</span></div>
<div class="task-item"><input type="checkbox" /> <span>Benchmark JSON serialization for 500+ notebook pages.</span></div>

<h2>Observation Notes</h2>
<p>Profiled memory footprint during rapid note switching. Retained memory stays stable at $\approx 18\text{MB}$ across 200 consecutive edits with zero leaks detected.</p>`,
    contentMarkdown: `# Daily Field Log - October 19, 2026

Morning standup and performance profiling notes for the catalog indexing engine.

## Today's Deliverables
- [x] Verify zero layout shift on notebook grid rendering.
- [x] Enforce tabular numerals on all word counts and timestamp displays.
- [ ] Benchmark JSON serialization for 500+ notebook pages.

## Observation Notes
Profiled memory footprint during rapid note switching. Retained memory stays stable at $\\approx 18\\text{MB}$ across 200 consecutive edits with zero leaks detected.`,
  },
  {
    id: 'page-res-01',
    notebookId: 'nb-research-digest',
    title: 'The Design of Everyday Things - Notes & Reflections',
    order: 0,
    tags: ['Cognitive Ergonomics', 'Affordances', 'Industrial Design'],
    isPinned: false,
    isFavorite: true,
    createdAt: '2026-08-16T11:00:00.000Z',
    updatedAt: '2026-10-15T19:20:00.000Z',
    contentHtml: `<h1>The Design of Everyday Things - Notes & Reflections</h1>
<p>Fundamental takeaways on conceptual models, natural mappings, and affordance design.</p>

<h2>The Seven Stages of Action</h2>
<ul>
  <li>Forming the goal</li>
  <li>Forming the intention</li>
  <li>Specifying the action</li>
  <li>Executing the action</li>
  <li>Perceiving the state of the world</li>
  <li>Interpreting the state of the world</li>
  <li>Evaluating the outcome</li>
</ul>

<blockquote>"A good conceptual model allows us to predict the effects of our actions without trial and error."</blockquote>`,
    contentMarkdown: `# The Design of Everyday Things - Notes & Reflections

Fundamental takeaways on conceptual models, natural mappings, and affordance design.

## The Seven Stages of Action
* Forming the goal
* Forming the intention
* Specifying the action
* Executing the action
* Perceiving the state of the world
* Interpreting the state of the world
* Evaluating the outcome

> "A good conceptual model allows us to predict the effects of our actions without trial and error."`,
  },
];

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'template-meeting',
    title: 'Executive Meeting Notes',
    description: 'Structured agenda, attendees list, key discussion points, and assigned action items.',
    category: 'Productivity',
    tags: ['Meeting', 'Agenda', 'Decisions'],
    contentHtml: `<h1>Executive Meeting: [Topic / Project Name]</h1>
<p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · <strong>Moderator:</strong> [Lead Name] · <strong>Attendees:</strong> [Participant List]</p>

<h2>1. Meeting Agenda</h2>
<ul>
  <li>Objective & Context (5 min)</li>
  <li>Key Trade-offs Review (20 min)</li>
  <li>Resource Allocation & Timeline (15 min)</li>
  <li>Action Item Sign-off (5 min)</li>
</ul>

<h2>2. Key Discussion & Decisions</h2>
<p>Summarize critical arguments, decisions reached, and rationales here.</p>

<div class="note-callout-info">
  <strong>Key Decision:</strong> Agreed upon architecture proposal B to maintain latency below 20ms SLA.
</div>

<h2>3. Action Items</h2>
<div class="task-item"><input type="checkbox" /> <span>[Assignee] Finalize system schema draft by Thursday.</span></div>
<div class="task-item"><input type="checkbox" /> <span>[Assignee] Circulate benchmarking report to engineering leads.</span></div>`,
    contentMarkdown: `# Executive Meeting: [Topic / Project Name]

**Date:** ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · **Moderator:** [Lead Name] · **Attendees:** [Participant List]

## 1. Meeting Agenda
* Objective & Context (5 min)
* Key Trade-offs Review (20 min)
* Resource Allocation & Timeline (15 min)
* Action Item Sign-off (5 min)

## 2. Key Discussion & Decisions
Summarize critical arguments, decisions reached, and rationales here.

> **Key Decision:** Agreed upon architecture proposal B to maintain latency below 20ms SLA.

## 3. Action Items
- [ ] [Assignee] Finalize system schema draft by Thursday.
- [ ] [Assignee] Circulate benchmarking report to engineering leads.`,
  },
  {
    id: 'template-spec',
    title: 'Technical Design Specification',
    description: 'Engineering RFC covering problem statement, system design, data models, and rollback criteria.',
    category: 'Engineering',
    tags: ['RFC', 'Specification', 'Engineering'],
    contentHtml: `<h1>RFC: [Feature or System Name]</h1>
<p><strong>Status:</strong> Draft · <strong>Author:</strong> [Your Name] · <strong>Target Release:</strong> Q4 2026</p>

<h2>1. Summary & Problem Statement</h2>
<p>Provide a concise 2-3 paragraph overview of the technical challenge and why the existing architecture is insufficient.</p>

<h2>2. Proposed Architecture</h2>
<p>Describe components, data flow, failure boundaries, and security considerations.</p>

<pre><code>// Interface specification
export interface ServiceResponse<T> {
  data: T;
  latencyMs: number;
  status: 'nominal' | 'degraded';
}</code></pre>

<h2>3. Rollback & Migration Strategy</h2>
<ul>
  <li>Zero-downtime database column expansion.</li>
  <li>Feature flag canary roll-out: 1% &rarr; 5% &rarr; 25% &rarr; 100%.</li>
</ul>`,
    contentMarkdown: `# RFC: [Feature or System Name]

**Status:** Draft · **Author:** [Your Name] · **Target Release:** Q4 2026

## 1. Summary & Problem Statement
Provide a concise 2-3 paragraph overview of the technical challenge and why the existing architecture is insufficient.

## 2. Proposed Architecture
Describe components, data flow, failure boundaries, and security considerations.

\`\`\`typescript
// Interface specification
export interface ServiceResponse<T> {
  data: T;
  latencyMs: number;
  status: 'nominal' | 'degraded';
}
\`\`\`

## 3. Rollback & Migration Strategy
* Zero-downtime database column expansion.
* Feature flag canary roll-out: 1% -> 5% -> 25% -> 100%.`,
  },
  {
    id: 'template-journal',
    title: 'Daily Reflection & Focus Journal',
    description: 'Mindful daily log tracking top priorities, daily wins, learning notes, and evening reflection.',
    category: 'Personal',
    tags: ['Journal', 'Focus', 'Daily Log'],
    contentHtml: `<h1>Daily Focus: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h1>

<h2>Top 3 Non-Negotiable Priorities</h2>
<div class="task-item"><input type="checkbox" /> <span>Priority 1: Deep work on core feature implementation</span></div>
<div class="task-item"><input type="checkbox" /> <span>Priority 2: Architecture review with the team</span></div>
<div class="task-item"><input type="checkbox" /> <span>Priority 3: 30 minutes of technical reading</span></div>

<h2>Key Learning of the Day</h2>
<p>Record an insight, mental model, or interesting finding discovered today.</p>

<h2>Evening Reflection</h2>
<p>What worked well today? What can be streamlined tomorrow?</p>`,
    contentMarkdown: `# Daily Focus: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

## Top 3 Non-Negotiable Priorities
- [ ] Priority 1: Deep work on core feature implementation
- [ ] Priority 2: Architecture review with the team
- [ ] Priority 3: 30 minutes of technical reading

## Key Learning of the Day
Record an insight, mental model, or interesting finding discovered today.

## Evening Reflection
What worked well today? What can be streamlined tomorrow?`,
  },
  {
    id: 'template-cornell',
    title: 'Cornell Study & Research Notes',
    description: 'Systematic note-taking layout dividing cues, detailed lecture notes, and summary.',
    category: 'Research',
    tags: ['Cornell', 'Study', 'Research'],
    contentHtml: `<h1>Cornell Notes: [Subject / Topic Name]</h1>
<p><strong>Source / Citation:</strong> [Book / Lecture / Paper] · <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>

<table>
  <thead>
    <tr>
      <th style="width: 35%;">Key Cues & Questions</th>
      <th style="width: 65%;">Detailed Notes & Evidence</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>What is the primary thesis?</td>
      <td>State core theoretical claims and backing methodology.</td>
    </tr>
    <tr>
      <td>Key vocabulary & variables</td>
      <td>Define essential terminology with examples.</td>
    </tr>
  </tbody>
</table>

<h2>Summary (Bottom Synthesis)</h2>
<p>Condense the entire session into 2-3 succinct takeaways in your own words.</p>`,
    contentMarkdown: `# Cornell Notes: [Subject / Topic Name]

**Source / Citation:** [Book / Lecture / Paper] · **Date:** ${new Date().toLocaleDateString()}

| Key Cues & Questions | Detailed Notes & Evidence |
| --- | --- |
| What is the primary thesis? | State core theoretical claims and backing methodology. |
| Key vocabulary & variables | Define essential terminology with examples. |

## Summary (Bottom Synthesis)
Condense the entire session into 2-3 succinct takeaways in your own words.`,
  },
];
