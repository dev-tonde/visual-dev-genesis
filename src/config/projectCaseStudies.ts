import { PROFILE } from '@/config/profile';

export type CaseStudyOutcomeType = 'proof' | 'metric_placeholder';

export interface CaseStudyOutcome {
  type: CaseStudyOutcomeType;
  text: string;
}

export interface ProjectCaseStudy {
  slug: string;
  repoName: string;
  projectName: string;
  category: string;
  overview: string;
  problem: string;
  constraints: readonly string[];
  architectureDecisions: readonly string[];
  implementationHighlights: readonly string[];
  outcomes: readonly CaseStudyOutcome[];
  stack: readonly string[];
  repoUrl: string;
  liveUrl?: string;
}

export const PROJECT_CASE_STUDIES: readonly ProjectCaseStudy[] = [
  {
    slug: 'visual-dev-genesis',
    repoName: 'visual-dev-genesis',
    projectName: 'Visual Dev Genesis',
    category: 'Portfolio platform',
    overview:
      'A developer portfolio rebuilt as a proof-first product surface, combining curated case studies, live GitHub data, accessible navigation, and a working contact pipeline.',
    problem:
      'Most portfolio sites show screenshots and slogans but very little engineering judgment. The goal here was to turn the portfolio itself into a credible product artifact without letting it collapse into gimmicks or fake proof.',
    constraints: [
      'The public path had to stay fast, readable, and recruiter-friendly even with multiple supporting surfaces in the same codebase.',
      'Live GitHub data, case studies, demos, and contact flows all needed to stay honest when external services were unavailable.',
      'Polish work had to improve accessibility, interaction quality, and trust without turning the site into an overbuilt playground.',
    ],
    architectureDecisions: [
      'Separated curated proof from live data, so case studies stay intentional while the repo feed remains tied to GitHub.',
      'Moved shared profile, navigation, theme, and sanitization logic into central config and utility layers instead of duplicating behavior per page.',
      'Scaled back brittle performance and PWA tricks in favor of one predictable service-worker path and cleaner runtime behavior.',
    ],
    implementationHighlights: [
      'Case studies, demos, and live repositories now communicate different kinds of evidence instead of overlapping.',
      'The contact flow, admin inbox, theme boot path, section navigation, and command palette were all hardened through end-to-end fixes.',
      'Demos and 404 states were reframed as polished front-end proof points rather than leftover novelty pages.',
    ],
    outcomes: [
      {
        type: 'proof',
        text: 'The public repository and live site now present the portfolio as a maintained product, not a static personal page.',
      },
      // TODO (internal): add verified metrics when available, e.g. recruiter reply rate,
      // Lighthouse/accessibility benchmarks after final launch review.
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Supabase'],
    repoUrl: PROFILE.portfolioRepoUrl,
    liveUrl: 'https://iamtonde.co.za',
  },
  {
    slug: 'hosted-payment-page',
    repoName: 'hosted-payment-page',
    projectName: 'Hosted Payment Page',
    category: 'Payments UX',
    overview:
      'Hosted crypto payment experience designed to turn quotes into a branded checkout flow with clear expiry and confirmation states.',
    problem:
      'A checkout flow for crypto payments has to present the right asset, instructions, and timeout state without asking users to interpret raw payment details or recover from ambiguous states.',
    constraints: [
      'Multi-asset support introduces precision, network, and expiry edge cases.',
      'Payment-state mistakes are costly, so the UI has to stay explicit and calm under time pressure.',
      'The scope needed to stay narrow: hosted checkout, not a full wallet platform.',
    ],
    architectureDecisions: [
      'Built on Next.js and TypeScript to keep routing, typed state, and deployment straightforward.',
      'Modelled the flow around quotes, payment options, and expiry instead of loose form state.',
      'Made QR generation and countdown handling first-class parts of the payment journey.',
    ],
    implementationHighlights: [
      'Quote creation and update flow.',
      'Cryptocurrency selection with a guided payment state.',
      'QR code generation, deadline handling, and expired-payment fallback.',
    ],
    outcomes: [
      {
        type: 'proof',
        text: 'Working prototype demonstrates a full quote-to-payment instruction flow for crypto checkout.',
      },
      // TODO (internal): add verified metrics when available, e.g. quote-to-payment
      // conversion rate or checkout completion time.
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'QR payments'],
    repoUrl: 'https://github.com/dev-tonde/hosted-payment-page',
  },
  {
    slug: 'waumbe-community-connect',
    repoName: 'waumbe-community-connect',
    projectName: 'Waumbe Community Connect',
    category: 'Community platform',
    overview:
      'Public-facing platform for Waumbe Youth Development, focused on credibility, clarity, and accessible engagement paths.',
    problem:
      'Mission-driven organisations need a digital presence that explains the work clearly and gives supporters a low-friction path to learn more, volunteer, or contribute.',
    constraints: [
      'Small-team environments need maintainable delivery rather than platform sprawl.',
      'Trust and clarity matter more than novelty.',
      'The public site has to stay easy to evolve as programmes and content change.',
    ],
    architectureDecisions: [
      'Kept the stack lightweight around React, Vite, TypeScript, and a simple Vercel deployment path.',
      'Used a component-driven front end so the public site can evolve without a large rewrite.',
      'Optimised for readability and maintainability instead of unnecessary product surface.',
    ],
    implementationHighlights: [
      'Production deployment on a public domain.',
      'Modern front-end stack suited to a lean delivery model.',
      'Community-brand presentation shaped around trust and clear navigation.',
    ],
    outcomes: [
      {
        type: 'proof',
        text: 'Live deployment and public repository show this moved beyond static mockups.',
      },
      // TODO (internal): add verified metrics when available, e.g. enquiry/volunteer
      // conversion numbers or page-speed targets.
    ],
    stack: ['React', 'Vite', 'TypeScript', 'Vercel'],
    repoUrl: 'https://github.com/dev-tonde/waumbe-community-connect',
    liveUrl: 'https://waumbe.org.za',
  },
] as const;
