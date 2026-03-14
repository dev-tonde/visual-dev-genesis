import { ArrowUpRight, Github } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PROJECT_CASE_STUDIES, type ProjectCaseStudy } from '@/config/projectCaseStudies';

interface ProjectCaseStudiesProps {
  verifiedRepoNames: Set<string> | null;
}

interface CaseStudyListProps {
  title: string;
  items: readonly string[];
}

const CaseStudyList = ({ title, items }: CaseStudyListProps) => (
  <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
      {title}
    </p>
    <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground/80">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const CaseStudyCard = ({
  caseStudy,
  isVerifiedRepo,
}: {
  caseStudy: ProjectCaseStudy;
  isVerifiedRepo: boolean;
}) => (
  <Card className="glass-vibrant border-0 shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Case study</Badge>
        <Badge variant="secondary">{caseStudy.category}</Badge>
        {isVerifiedRepo && <Badge variant="outline">Live GitHub repo</Badge>}
        {caseStudy.liveUrl && <Badge variant="outline">Live product</Badge>}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <CardTitle className="text-2xl">{caseStudy.projectName}</CardTitle>
            <CardDescription className="mt-3 max-w-3xl text-sm leading-6 text-foreground/80">
              {caseStudy.overview}
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            {caseStudy.stack.map((technology) => (
              <Badge key={technology} variant="outline" className="bg-background/50">
                {technology}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Button variant="outline" asChild>
            <a href={caseStudy.repoUrl} target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4 mr-2" />
              Repo
            </a>
          </Button>
          {caseStudy.liveUrl && (
            <Button asChild className="gradient-primary">
              <a href={caseStudy.liveUrl} target="_blank" rel="noopener noreferrer">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Live
              </a>
            </Button>
          )}
        </div>
      </div>
    </CardHeader>

    <CardContent className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Problem
        </p>
        <p className="mt-3 text-sm leading-6 text-foreground/80">{caseStudy.problem}</p>
      </div>

      <CaseStudyList title="Constraints" items={caseStudy.constraints} />
      <CaseStudyList title="Technical decisions" items={caseStudy.architectureDecisions} />
      <CaseStudyList title="Implementation highlights" items={caseStudy.implementationHighlights} />

      <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 lg:col-span-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Outcomes and impact
        </p>
        <ul className="mt-3 space-y-3 text-sm leading-6 text-foreground/80">
          {caseStudy.outcomes.map((outcome) => (
            <li
              key={outcome.text}
              className="flex flex-col gap-2 rounded-xl border border-border/50 bg-background/50 p-4"
            >
              {outcome.type === 'metric_placeholder' && (
                <Badge variant="outline" className="w-fit">
                  Add verified metric
                </Badge>
              )}
              <span>{outcome.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
);

const ProjectCaseStudies = ({ verifiedRepoNames }: ProjectCaseStudiesProps) => (
  <div className="space-y-6">
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Curated case studies</Badge>
        <Badge variant="secondary">Metrics only when verified</Badge>
      </div>
      <div>
        <h3 className="text-3xl md:text-4xl font-bold">Selected case studies</h3>
        <p className="mt-3 text-muted-foreground">
          These are the projects worth reading beyond the card view. The write-ups below are curated
          on purpose; the live repository feed underneath stays synced with GitHub.
        </p>
      </div>
    </div>

    <div className="space-y-6">
      {PROJECT_CASE_STUDIES.map((caseStudy) => (
        <CaseStudyCard
          key={caseStudy.slug}
          caseStudy={caseStudy}
          isVerifiedRepo={verifiedRepoNames?.has(caseStudy.repoName.toLowerCase()) ?? false}
        />
      ))}
    </div>
  </div>
);

export default ProjectCaseStudies;
