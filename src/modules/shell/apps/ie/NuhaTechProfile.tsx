"use client";
import { useMemo } from "react";

/**
 * Faithful github.com/nuhatech profile clone, dark theme, used as IE6
 * fallback whenever GitHub refuses iframing (X-Frame-Options: DENY).
 */
export function NuhaTechProfile() {
  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
        background: "#ffffff",
        color: "#1f2328",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        fontSize: 14,
      }}
    >
      <TopNav />
      <TabBar />
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "296px 1fr",
          gap: 24,
          padding: "24px 32px 64px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <LeftColumn />
        <RightColumn />
      </main>
      <SiteFooter />
    </div>
  );
}

function TopNav() {
  return (
    <header
      style={{
        height: 64,
        background: "#ffffff",
        borderBottom: "1px solid #d0d7de",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 16px",
      }}
    >
      <span style={{ color: "#1f2328", fontSize: 22 }}>☰</span>
      <span style={{ fontSize: 26, color: "#1f2328" }}>
        <Octocat />
      </span>
      <span style={{ color: "#1f2328", fontSize: 14, fontWeight: 400 }}>
        nuhatech
      </span>
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#ffffff",
          border: "1px solid #d0d7de",
          borderRadius: 6,
          padding: "5px 10px",
          width: 280,
          color: "#59636e",
          fontSize: 13,
        }}
      >
        <span style={{ fontSize: 13 }}>🔍</span>
        <span>Type</span>
        <kbd
          style={{
            background: "#161b22",
            border: "1px solid #d0d7de",
            padding: "0 6px",
            borderRadius: 3,
            fontSize: 11,
            color: "#1f2328",
          }}
        >
          /
        </kbd>
        <span>to search</span>
      </div>
      <NavIconBtn>✨</NavIconBtn>
      <NavIconBtn>＋</NavIconBtn>
      <NavIconBtn>⊙</NavIconBtn>
      <NavIconBtn>⇄</NavIconBtn>
      <NavIconBtn>📥</NavIconBtn>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "#f6f8fa",
          border: "1px solid #d0d7de",
        }}
      />
    </header>
  );
}

function NavIconBtn({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={{
        background: "transparent",
        border: "none",
        color: "#59636e",
        cursor: "default",
        fontSize: 16,
        padding: 6,
      }}
    >
      {children}
    </button>
  );
}

function Octocat() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="#1f2328"
      aria-hidden
      style={{ display: "block" }}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function TabBar() {
  const tabs = [
    { label: "Overview", count: null, active: true, icon: "📖" },
    { label: "Repositories", count: 4, icon: "🗄" },
    { label: "Projects", count: null, icon: "▦" },
    { label: "Packages", count: null, icon: "📦" },
    { label: "Stars", count: 1, icon: "★" },
  ];
  return (
    <nav
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #d0d7de",
        display: "flex",
        gap: 0,
        padding: "0 32px",
      }}
    >
      {tabs.map((t) => (
        <div
          key={t.label}
          style={{
            position: "relative",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#1f2328",
            fontSize: 14,
            fontWeight: t.active ? 600 : 400,
            borderBottom: t.active
              ? "2px solid #f78166"
              : "2px solid transparent",
            cursor: "default",
          }}
        >
          <span style={{ fontSize: 14, color: "#59636e" }}>{t.icon}</span>
          {t.label}
          {t.count !== null && (
            <span
              style={{
                background: "#f6f8fa",
                border: "1px solid #d0d7de",
                color: "#1f2328",
                borderRadius: 20,
                padding: "0 6px",
                fontSize: 11,
                lineHeight: "18px",
              }}
            >
              {t.count}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

function LeftColumn() {
  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          width: 260,
          height: 260,
          borderRadius: "50%",
          overflow: "hidden",
          border: "1px solid #d0d7de",
          background: "#fff",
          position: "relative",
          marginBottom: 8,
        }}
      >
        <NuhaIdenticon />
      </div>
      <div
        style={{
          fontFamily: "inherit",
          fontSize: 24,
          fontWeight: 600,
          lineHeight: 1.25,
          color: "#1f2328",
        }}
      >
        nuhatech
      </div>
      <button
        style={{
          width: "100%",
          marginTop: 12,
          background: "#f6f8fa",
          border: "1px solid #d0d7de",
          color: "#1f2328",
          padding: "5px 16px",
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Edit profile
      </button>
    </aside>
  );
}

/** Pink-on-white identicon, matching the placeholder GitHub gives orgs that
 *  haven't uploaded a logo yet (random hash → 5×5 mirrored grid). */
function NuhaIdenticon() {
  // Hardcoded grid that resembles the screenshot the user shared.
  const grid = [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
  ];
  const cell = 260 / 5;
  return (
    <svg
      width={260}
      height={260}
      viewBox={`0 0 ${260} ${260}`}
      style={{ display: "block" }}
    >
      <rect x="0" y="0" width="260" height="260" fill="#fff" />
      {grid.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill="#cc70b6"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

function RightColumn() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PopularRepositories />
      <ContributionGraph />
      <ContributionActivity />
    </div>
  );
}

interface Repo {
  readonly name: string;
  readonly description?: string;
  readonly language?: string;
  readonly languageColor?: string;
  readonly stars?: number;
}

const POPULAR_REPOS: ReadonlyArray<Repo> = [
  { name: "kutub-skill", stars: 2 },
  {
    name: "maktaba",
    description: "The library for building libraries",
    language: "Python",
    languageColor: "#3572A5",
  },
  {
    name: "hilal-globe",
    description:
      "Interactive 3D globe for lunar crescent (hilal) visibility prediction — compare multiple astronomical criteria (Odeh, Yallop, Shaukat), day/night terminator, and plan moon sighting for any date.",
    language: "Vue",
    languageColor: "#41b883",
  },
  {
    name: "al-encarta",
    description:
      "Encarta 2002 ressuscité avec IA — Windows XP simulé dans le navigateur, chat streamé avec 27 figures arabo-musulmanes. Édition DefendHack 2026.",
    language: "TypeScript",
    languageColor: "#3178c6",
  },
];

function PopularRepositories() {
  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#1f2328" }}>
          Popular repositories
        </h2>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{ color: "#0969da", fontSize: 12, textDecoration: "none" }}
        >
          Customize your pins
        </a>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {POPULAR_REPOS.map((r) => (
          <RepoCard key={r.name} repo={r} />
        ))}
      </div>
    </section>
  );
}

function RepoCard({ repo }: { repo: Repo }) {
  return (
    <div
      style={{
        border: "1px solid #d0d7de",
        borderRadius: 6,
        padding: 16,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{
            color: "#0969da",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {repo.name}
        </a>
        <span
          style={{
            border: "1px solid #d0d7de",
            borderRadius: 20,
            padding: "0 7px",
            fontSize: 11,
            color: "#59636e",
            lineHeight: "18px",
          }}
        >
          Public
        </span>
      </div>
      {repo.description && (
        <p
          style={{
            fontSize: 12,
            color: "#59636e",
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          {repo.description}
        </p>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 12,
          color: "#59636e",
          marginTop: "auto",
        }}
      >
        {repo.language && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: repo.languageColor ?? "#888",
              }}
            />
            {repo.language}
          </span>
        )}
        {typeof repo.stars === "number" && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            ☆ {repo.stars}
          </span>
        )}
      </div>
    </div>
  );
}

function ContributionGraph() {
  // 53 weeks × 7 days. We seed a deterministic sparse pattern matching the
  // screenshot (mostly empty, a handful of green cells in Mar/Apr).
  const cells = useMemo(() => buildSparseContributions(), []);

  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const days = ["Mon", "Wed", "Fri"];

  return (
    <section style={{ display: "flex", gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <h2
            style={{
              fontSize: 14,
              margin: 0,
              fontWeight: 400,
              color: "#1f2328",
            }}
          >
            14 contributions in the last year
          </h2>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{ color: "#59636e", fontSize: 12, textDecoration: "none" }}
          >
            Contribution settings ▾
          </a>
        </div>
        <div
          style={{
            border: "1px solid #d0d7de",
            borderRadius: 6,
            padding: 16,
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `28px repeat(${cells.length}, 12px)`,
                fontSize: 10,
                color: "#59636e",
                gap: 2,
              }}
            >
              <span />
              {months.map((m, i) => (
                <span
                  key={m}
                  style={{ gridColumn: `${2 + i * 4} / span 4` }}
                >
                  {m}
                </span>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `28px repeat(${cells.length}, 12px)`,
                gridTemplateRows: "repeat(7, 12px)",
                gap: 2,
                gridAutoFlow: "column",
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <span
                  key={`day-${d}`}
                  style={{
                    fontSize: 9,
                    color: "#59636e",
                    gridColumn: 1,
                    gridRow: d + 1,
                    visibility: d === 0 || d === 2 || d === 4 ? "visible" : "hidden",
                  }}
                >
                  {days[(d - 0) / 2] ?? ""}
                </span>
              ))}
              {cells.map((week, wi) =>
                week.map((level, di) => (
                  <span
                    key={`${wi}-${di}`}
                    style={{
                      gridColumn: wi + 2,
                      gridRow: di + 1,
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      background: levelColor(level),
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  />
                )),
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{ color: "#59636e", fontSize: 11, textDecoration: "none" }}
            >
              Learn how we count contributions
            </a>
            <div style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 11, color: "#59636e" }}>
              Less
              {[0, 1, 2, 3, 4].map((l) => (
                <span
                  key={l}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: levelColor(l),
                  }}
                />
              ))}
              More
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          fontSize: 13,
          marginTop: 26,
          minWidth: 60,
        }}
      >
        <button
          style={{
            background: "#ddf4ff",
            color: "#0969da",
            border: "none",
            padding: "4px 12px",
            borderRadius: 4,
            cursor: "default",
            textAlign: "left",
            fontWeight: 600,
          }}
        >
          2026
        </button>
        <button
          style={{
            background: "transparent",
            color: "#1f2328",
            border: "none",
            padding: "4px 12px",
            cursor: "default",
            textAlign: "left",
          }}
        >
          2025
        </button>
      </div>
    </section>
  );
}

function buildSparseContributions(): number[][] {
  // 53 columns × 7 rows. Mostly 0, with 14 random-ish active cells biased
  // toward the right (Mar/Apr).
  const weeks = 53;
  const grid: number[][] = [];
  for (let w = 0; w < weeks; w++) {
    grid.push([0, 0, 0, 0, 0, 0, 0]);
  }
  // Seed a few "contributions"
  const hits = [
    [22, 4, 1],
    [44, 0, 1],
    [45, 6, 1],
    [46, 2, 2],
    [47, 4, 1],
    [48, 0, 2],
    [49, 6, 1],
    [50, 2, 1],
    [51, 1, 1],
    [52, 5, 3],
    [40, 3, 1],
    [42, 2, 1],
    [43, 5, 1],
    [44, 4, 1],
  ] as const;
  for (const [w, d, lvl] of hits) {
    if (grid[w]) grid[w][d] = lvl;
  }
  return grid;
}

function levelColor(level: number): string {
  switch (level) {
    case 0:
      return "#ebedf0";
    case 1:
      return "#9be9a8";
    case 2:
      return "#40c463";
    case 3:
      return "#30a14e";
    case 4:
      return "#216e39";
    default:
      return "#ebedf0";
  }
}

function ContributionActivity() {
  return (
    <section>
      <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px", color: "#1f2328" }}>
        Contribution activity
      </h2>
      <div
        style={{
          borderLeft: "1px solid #d0d7de",
          paddingLeft: 16,
          marginLeft: 14,
          position: "relative",
        }}
      >
        <div style={{ marginBottom: 14, fontSize: 14, color: "#1f2328" }}>
          <strong>May</strong>{" "}
          <span style={{ color: "#59636e" }}>2026</span>
        </div>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #d0d7de",
            borderRadius: 6,
            padding: "10px 12px",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: -28,
              top: 12,
              width: 14,
              height: 14,
              background: "#f6f8fa",
              border: "2px solid #ffffff",
              borderRadius: "50%",
            }}
          />
          <span style={{ color: "#59636e" }}>🗄</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: "#1f2328", marginBottom: 4 }}>
              Created 1 repository
            </div>
            <div style={{ fontSize: 13, color: "#1f2328" }}>
              <span style={{ color: "#59636e", marginRight: 6 }}>📦</span>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{ color: "#0969da", textDecoration: "none" }}
              >
                nuhatech/al-encarta
              </a>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  marginLeft: 14,
                  color: "#59636e",
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#3178c6",
                  }}
                />
                TypeScript
              </span>
              <span style={{ color: "#59636e", fontSize: 12, marginLeft: 14 }}>
                Built by 🤖
              </span>
            </div>
          </div>
          <span style={{ color: "#59636e", fontSize: 12, whiteSpace: "nowrap" }}>
            May 2
          </span>
        </div>
      </div>

      <button
        style={{
          width: "100%",
          marginTop: 16,
          background: "#ffffff",
          border: "1px solid #d0d7de",
          color: "#0969da",
          padding: "10px 16px",
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          cursor: "default",
        }}
      >
        Show more activity
      </button>

      <p style={{ fontSize: 12, color: "#59636e", textAlign: "center", marginTop: 24 }}>
        Seeing something unexpected? Take a look at the{" "}
        <a href="#" style={{ color: "#0969da" }} onClick={(e) => e.preventDefault()}>
          GitHub profile guide
        </a>
        .
      </p>
    </section>
  );
}

function SiteFooter() {
  const links = [
    "Terms",
    "Privacy",
    "Security",
    "Status",
    "Community",
    "Docs",
    "Contact",
    "Manage cookies",
    "Do not share my personal information",
  ];
  return (
    <footer
      style={{
        borderTop: "1px solid #d0d7de",
        padding: "16px 32px",
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
        alignItems: "center",
        fontSize: 12,
        color: "#59636e",
        background: "#ffffff",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Octocat />
        <span>© 2026 GitHub, Inc.</span>
      </span>
      {links.map((l) => (
        <a
          key={l}
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{ color: "#0969da", textDecoration: "none" }}
        >
          {l}
        </a>
      ))}
    </footer>
  );
}
