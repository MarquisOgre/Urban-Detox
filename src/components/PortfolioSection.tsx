import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, ExternalLink, Building } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { defaultPortfolioProjects } from "@/lib/portfolioData";

type Project = { title: string; description: string; url: string; image_url: string };

const PortfolioSection = () => {
  const [idx, setIdx] = useState(0);

  const { data: projects = [] } = useQuery({
    queryKey: ["settings", "portfolio"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "portfolio")
        .maybeSingle();
      const dbProjects = (data?.setting_value as any)?.projects as Project[] | undefined;
      // Use DB projects if they exist and have content, otherwise use defaults
      if (dbProjects && dbProjects.length > 0 && dbProjects[0].title) return dbProjects;
      return defaultPortfolioProjects;
    },
  });

  if (!projects.length) return null;

  const prev = () => setIdx((i) => (i - 1 + projects.length) % projects.length);
  const next = () => setIdx((i) => (i + 1) % projects.length);

  // Show 3 cards at a time on desktop, 1 on mobile
  const visibleProjects = [];
  for (let i = 0; i < Math.min(3, projects.length); i++) {
    visibleProjects.push(projects[(idx + i) % projects.length]);
  }

  return (
    <section className="py-16 bg-secondary/30" id="portfolio">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Our <span className="text-gradient-nature">Portfolio</span>
          </h2>
          <p className="mt-2 text-muted-foreground">Projects we're proud of</p>
        </div>

        <div className="relative">
          {/* Desktop: 3 cards, Mobile: 1 card */}
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {visibleProjects.map((proj, i) => (
              <ProjectCard key={`${proj.title}-${i}`} project={proj} />
            ))}
          </div>
          <div className="md:hidden">
            <ProjectCard project={projects[idx]} />
          </div>

          {projects.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button size="icon" variant="outline" onClick={prev} className="rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-1.5">
                {projects.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`h-2 w-2 rounded-full transition-all ${i === idx ? "bg-primary w-6" : "bg-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <Button size="icon" variant="outline" onClick={next} className="rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const ProjectCard = ({ project }: { project: Project }) => (
  <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
    <div className="aspect-video overflow-hidden bg-muted">
      {project.image_url ? (
        <img
          src={project.image_url}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Building className="h-10 w-10 text-muted-foreground/40" />
        </div>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-display text-lg font-semibold text-foreground">{project.title || "Untitled"}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{project.description}</p>
      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View Project <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  </div>
);

export default PortfolioSection;
