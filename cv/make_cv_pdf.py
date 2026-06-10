"""Build the served CV PDF (public/Tonderai_Matanga_CV.pdf).

Source of truth: cv/Tonderai_Matanga_CV.md - keep this script in sync with it.
Run from the repo root: python3 cv/make_cv_pdf.py (requires: pip install reportlab)
"""

from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    HRFlowable,
)

OUT = str(Path(__file__).resolve().parent.parent / "public" / "Tonderai_Matanga_CV.pdf")

INK = HexColor("#1a1a2b")
MUTED = HexColor("#555a6e")
ACCENT = HexColor("#5b3fd4")  # restrained violet, echoes site theme
RULE = HexColor("#d7d9e0")

styles = {
    "name": ParagraphStyle(
        "name", fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=INK
    ),
    "role": ParagraphStyle(
        "role", fontName="Helvetica", fontSize=12.5, leading=16, textColor=ACCENT, spaceBefore=2
    ),
    "contact": ParagraphStyle(
        "contact", fontName="Helvetica", fontSize=9, leading=13, textColor=MUTED, spaceBefore=6
    ),
    "h2": ParagraphStyle(
        "h2",
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=INK,
        spaceBefore=12,
        spaceAfter=2,
    ),
    "body": ParagraphStyle(
        "body", fontName="Helvetica", fontSize=9.5, leading=13.5, textColor=INK
    ),
    "jobtitle": ParagraphStyle(
        "jobtitle",
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=INK,
        spaceBefore=8,
    ),
    "bullet": ParagraphStyle(
        "bullet",
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=INK,
        leftIndent=10,
        bulletIndent=0,
        spaceBefore=2,
    ),
}


def rule():
    return HRFlowable(width="100%", thickness=0.7, color=RULE, spaceBefore=2, spaceAfter=6)


def bullets(items):
    return [Paragraph(t, styles["bullet"], bulletText="•") for t in items]


doc = SimpleDocTemplate(
    OUT,
    pagesize=A4,
    leftMargin=18 * mm,
    rightMargin=18 * mm,
    topMargin=16 * mm,
    bottomMargin=14 * mm,
    title="Tonderai Matanga - Senior Front-End Developer CV",
    author="Tonderai Matanga",
)

s = []
s.append(Paragraph("Tonderai Matanga", styles["name"]))
s.append(Paragraph("Senior Front-End Developer", styles["role"]))
s.append(
    Paragraph(
        "Cape Town, South Africa &nbsp;|&nbsp; +27 (0)81 432 1220 &nbsp;|&nbsp; hello@iamtonde.co.za<br/>"
        'Portfolio: <a href="https://iamtonde.co.za" color="#5b3fd4">iamtonde.co.za</a> &nbsp;|&nbsp; '
        'LinkedIn: <a href="https://linkedin.com/in/tonderai-matanga" color="#5b3fd4">linkedin.com/in/tonderai-matanga</a> &nbsp;|&nbsp; '
        'GitHub: <a href="https://github.com/dev-tonde" color="#5b3fd4">github.com/dev-tonde</a>',
        styles["contact"],
    )
)
s.append(Spacer(1, 6))

s.append(Paragraph("SUMMARY", styles["h2"]))
s.append(rule())
s.append(
    Paragraph(
        "Senior Front-End Developer with 8+ years of experience building accessible, high-performance "
        "web experiences. Deep expertise in React, TypeScript, and Next.js (SSR/SSG), with a strong CMS "
        "theming background across WordPress (custom themes, hooks/filters, Gutenberg, ACF) and "
        "Drupal 8/9/10 (Twig). Proven record delivering WCAG 2.1-accessible, cross-browser UIs, improving "
        "Core Web Vitals through Lighthouse-driven optimisation (40%+ faster load times), integrating REST "
        "and GraphQL APIs, and shipping reusable component systems through Git-based CI/CD with automated testing.",
        styles["body"],
    )
)

s.append(Paragraph("CORE SKILLS", styles["h2"]))
s.append(rule())
s += bullets(
    [
        "<b>Front-End:</b> React, Next.js, TypeScript, JavaScript (ES6+), HTML5, CSS3/SASS, Tailwind CSS, "
        "Bootstrap; working knowledge of Vue, Svelte, jQuery",
        "<b>CMS &amp; Theming:</b> WordPress (custom themes, hooks/filters, Gutenberg/blocks, ACF), "
        "Drupal 8/9/10 (Twig theming, theme layer), PHP",
        "<b>API Integration:</b> REST APIs, GraphQL, AJAX, JSON, Postman",
        "<b>Accessibility &amp; Performance:</b> WCAG 2.1, responsive design, cross-browser compatibility, "
        "Lighthouse, Core Web Vitals optimisation",
        "<b>Testing:</b> Jest, React Testing Library, Cypress, Playwright",
        "<b>Tooling &amp; Delivery:</b> Git (GitHub/GitLab), CI/CD (GitHub Actions, CircleCI, Vercel; exposure "
        "to Jenkins-style pipelines), Storybook, Chrome DevTools",
    ]
)

s.append(Paragraph("EXPERIENCE", styles["h2"]))
s.append(rule())

s.append(
    Paragraph(
        "Senior Front-End Developer &nbsp;|&nbsp; Retail Capital (TymeBank) &nbsp;|&nbsp; Jul 2021 – Present",
        styles["jobtitle"],
    )
)
s += bullets(
    [
        "Build and maintain customer-facing web apps with React, Next.js, and TypeScript, using SSR/SSG, "
        "dynamic routing, and SEO-driven delivery.",
        "Improved performance and Core Web Vitals by 40%+ (load times) through code-splitting, lazy loading, "
        "bundle analysis, and Lighthouse-driven optimisation.",
        "Shipped reusable component libraries (Tailwind CSS/Storybook) with designers and backend engineers "
        "to standardise UI across products.",
        "Integrate UI with REST and GraphQL services, implementing robust data-fetching and error-handling "
        "patterns for complex workflows.",
        "Deliver accessible, responsive UI to WCAG 2.1 with cross-browser testing and strong debugging practices.",
        "Set up and maintain automated tests (Jest/React Testing Library/Cypress) and GitHub Actions CI "
        "pipelines, reducing QA cycles and improving release confidence.",
    ]
)

s.append(
    Paragraph(
        "Front-End Developer &nbsp;|&nbsp; Bet.co.za &nbsp;|&nbsp; Sep 2019 – Jun 2021",
        styles["jobtitle"],
    )
)
s += bullets(
    [
        "Revamped key betting platform surfaces with React and TypeScript, improving engagement and reducing "
        "feature delivery time through reusable components.",
        "Developed and maintained the custom WordPress theme for the platform blog (central.bet.co.za): PHP "
        "templates, hooks/filters, custom post types/taxonomies, and a performance-focused front end.",
        "Optimised blog templates for SEO and page speed (caching, asset optimisation, image/script loading "
        "strategies) with responsive, mobile-first layouts.",
        "Integrated front-end components with internal Bet-Tech services via REST APIs and AJAX; implemented "
        "analytics instrumentation and A/B testing support.",
        "Built JavaScript-driven UI features and interactive widgets (jQuery/AJAX where appropriate), ensuring "
        "cross-browser compatibility under high traffic.",
    ]
)

s.append(
    Paragraph(
        "Front-End Developer Intern &nbsp;|&nbsp; Webaholics Digital Agency &nbsp;|&nbsp; Sep 2017 – Aug 2019",
        styles["jobtitle"],
    )
)
s += bullets(
    [
        "Delivered pixel-perfect, responsive marketing sites and landing pages for clients across industries "
        "under tight sprint timelines.",
        "Built and customised WordPress themes/plugins with clean PHP templating and reusable UI components "
        "(JavaScript, CSS/SASS, Bootstrap).",
        "Contributed to Drupal 8/9 site builds: Twig templating, theme preprocessing, and front-end component "
        "integration.",
        "Improved CMS content presentation (menus, blocks/regions, Views output styling) while maintaining "
        "accessibility and cross-browser quality.",
        "Worked in Git-based workflows with designers and stakeholders, translating wireframes into functional, "
        "performant interfaces.",
    ]
)

s.append(Paragraph("SELECTED HIGHLIGHTS", styles["h2"]))
s.append(rule())
s += bullets(
    [
        "<b>Performance:</b> 40%+ faster load times on customer-facing apps through Lighthouse/Core Web Vitals "
        "optimisation at Retail Capital.",
        "<b>CMS delivery:</b> custom WordPress theme for central.bet.co.za — custom templates, hooks/filters, "
        "SEO, and performance.",
        "<b>Platform migration:</b> Retail Capital portal into the TymeBank ecosystem with API integration and "
        "UI standardisation.",
        "<b>Quality culture:</b> introduced automated testing and CI practices that improved release reliability "
        "and reduced QA cycles.",
    ]
)

s.append(Paragraph("EDUCATION &amp; CERTIFICATIONS", styles["h2"]))
s.append(rule())
s += bullets(
    [
        "BComm Honours in Business Administration (Logistics &amp; Retail Management) — Midlands State "
        "University, Zimbabwe",
        "Meta Front-End Developer Certificate",
        "Google UX Design Professional Certificate",
        "Scrum Master Certification",
        "Additional coursework: React, Next.js, TypeScript, Accessibility, Performance, CI/CD (LinkedIn Learning)",
    ]
)

doc.build(s)
print("CV PDF written:", OUT)
