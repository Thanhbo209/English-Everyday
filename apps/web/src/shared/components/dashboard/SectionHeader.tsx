import type { FC, ReactNode } from "react";
import { Link } from "react-router-dom";

interface SectionHeaderProps {
  title: string;
  description?: string;
  category?: string;
  action?: ReactNode;
  breadcrumbs?: Array<{ label: string; to?: string }>;
}

export const SectionHeader: FC<SectionHeaderProps> = ({
  title,
  description,
  category,
  action,
  breadcrumbs,
}) => {
  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {category && <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{category}</p>}
          <h2 className="text-2xl font-black text-foreground tracking-tight leading-none">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2 font-medium">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <div key={idx} className="flex items-center gap-1.5">
                {crumb.to && !isLast ? (
                  <Link to={crumb.to} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-foreground font-semibold" : ""}>{crumb.label}</span>
                )}
                {!isLast && <span className="text-border">/</span>}
              </div>
            );
          })}
        </nav>
      )}
    </div>
  );
};
