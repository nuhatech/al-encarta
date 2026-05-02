"use client";
// Tier 1
import alKhawarizmi from "@/src/modules/catalog/data/tier1/al-khawarizmi.json";
import ibnAlHaytham from "@/src/modules/catalog/data/tier1/ibn-al-haytham.json";
import ibnAlNafis from "@/src/modules/catalog/data/tier1/ibn-al-nafis.json";
import ibnBattuta from "@/src/modules/catalog/data/tier1/ibn-battuta.json";
import ibnKhaldoun from "@/src/modules/catalog/data/tier1/ibn-khaldoun.json";
import fatimaAlFihri from "@/src/modules/catalog/data/tier1/fatima-al-fihri.json";
// Tier 2
import alBiruni from "@/src/modules/catalog/data/tier2/al-biruni.json";
import alKindi from "@/src/modules/catalog/data/tier2/al-kindi.json";
import omarKhayyam from "@/src/modules/catalog/data/tier2/omar-khayyam.json";
import jabirIbnHayyan from "@/src/modules/catalog/data/tier2/jabir-ibn-hayyan.json";
import alZahrawi from "@/src/modules/catalog/data/tier2/al-zahrawi.json";
import banuMusa from "@/src/modules/catalog/data/tier2/banu-musa.json";
import alJazari from "@/src/modules/catalog/data/tier2/al-jazari.json";
import alJahiz from "@/src/modules/catalog/data/tier2/al-jahiz.json";
import alTusi from "@/src/modules/catalog/data/tier2/al-tusi.json";
import alBattani from "@/src/modules/catalog/data/tier2/al-battani.json";
import thabitIbnQurra from "@/src/modules/catalog/data/tier2/thabit-ibn-qurra.json";
import alIdrisi from "@/src/modules/catalog/data/tier2/al-idrisi.json";
import ahmadIbnMajid from "@/src/modules/catalog/data/tier2/ahmad-ibn-majid.json";
import piriReis from "@/src/modules/catalog/data/tier2/piri-reis.json";
import saladin from "@/src/modules/catalog/data/tier2/saladin.json";
import tariqIbnZiyad from "@/src/modules/catalog/data/tier2/tariq-ibn-ziyad.json";
import mehmedIi from "@/src/modules/catalog/data/tier2/mehmed-ii.json";
import solimanLeMagnifique from "@/src/modules/catalog/data/tier2/soliman-le-magnifique.json";
import mansaMusa from "@/src/modules/catalog/data/tier2/mansa-musa.json";
import harounAlRachid from "@/src/modules/catalog/data/tier2/haroun-al-rachid.json";
import alMamun from "@/src/modules/catalog/data/tier2/al-mamun.json";
import nasirBinMurshid from "@/src/modules/catalog/data/tier2/nasir-bin-murshid.json";

type ArticleData = typeof alKhawarizmi & {
  sections?: ReadonlyArray<{ title: string; body: string }>;
  quote?: { text: string; attribution: string };
  timeline?: ReadonlyArray<{ year: string; label: string }>;
  sidebar?: ReadonlyArray<{ label: string; value: string }>;
};

const SLUG_TO_DATA: Record<string, ArticleData | undefined> = {
  "al-khawarizmi": alKhawarizmi as ArticleData,
  "ibn-al-haytham": ibnAlHaytham as ArticleData,
  "ibn-al-nafis": ibnAlNafis as ArticleData,
  "ibn-battuta": ibnBattuta as ArticleData,
  "ibn-khaldoun": ibnKhaldoun as ArticleData,
  "fatima-al-fihri": fatimaAlFihri as ArticleData,
  "al-biruni": alBiruni as ArticleData,
  "al-kindi": alKindi as ArticleData,
  "omar-khayyam": omarKhayyam as ArticleData,
  "jabir-ibn-hayyan": jabirIbnHayyan as ArticleData,
  "al-zahrawi": alZahrawi as ArticleData,
  "banu-musa": banuMusa as ArticleData,
  "al-jazari": alJazari as ArticleData,
  "al-jahiz": alJahiz as ArticleData,
  "al-tusi": alTusi as ArticleData,
  "al-battani": alBattani as ArticleData,
  "thabit-ibn-qurra": thabitIbnQurra as ArticleData,
  "al-idrisi": alIdrisi as ArticleData,
  "ahmad-ibn-majid": ahmadIbnMajid as ArticleData,
  "piri-reis": piriReis as ArticleData,
  saladin: saladin as ArticleData,
  "tariq-ibn-ziyad": tariqIbnZiyad as ArticleData,
  "mehmed-ii": mehmedIi as ArticleData,
  "soliman-le-magnifique": solimanLeMagnifique as ArticleData,
  "mansa-musa": mansaMusa as ArticleData,
  "haroun-al-rachid": harounAlRachid as ArticleData,
  "al-mamun": alMamun as ArticleData,
  "nasir-bin-murshid": nasirBinMurshid as ArticleData,
};

interface ArticleViewProps {
  slug: string;
  onTalk: () => void;
}

export function ArticleView({ slug, onTalk }: ArticleViewProps) {
  const data = SLUG_TO_DATA[slug];
  if (!data) {
    return (
      <div style={{ padding: 18, fontFamily: "Tahoma, sans-serif", fontSize: 12 }}>
        <p>L&apos;article pour cette personnalité n&apos;est pas encore installé sur ce CD.</p>
      </div>
    );
  }

  const shortName = data.displayName.split(" ").slice(-1)[0] ?? data.displayName;

  return (
    <article
      style={{
        background: "#fff",
        height: "100%",
        overflowY: "auto",
        padding: 24,
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: 13,
        lineHeight: 1.55,
        color: "#111",
      }}
    >
      <ArticleHeader data={data} />
      <Lead summary={data.biography.summary} />
      <BodyWithSidebar data={data} />
      {data.quote && <PullQuote quote={data.quote} />}
      {data.timeline && data.timeline.length > 0 && <Timeline events={data.timeline} />}
      <KeyAchievements achievements={data.biography.keyAchievements} />
      <RelatedTopics topics={data.topics} />
      <TalkCTA shortName={shortName} onTalk={onTalk} />
    </article>
  );
}

function ArticleHeader({ data }: { data: ArticleData }) {
  return (
    <header style={{ borderBottom: "2px solid #000080", paddingBottom: 8, marginBottom: 14 }}>
      <h1
        style={{
          margin: 0,
          fontFamily: "Georgia, serif",
          fontSize: 28,
          color: "#000080",
          fontWeight: 700,
          lineHeight: 1.15,
        }}
      >
        {data.displayName}
      </h1>
      <p style={{ margin: "4px 0 0", color: "#555", fontStyle: "italic", fontSize: 12 }}>
        {data.era.century}ème siècle — {data.era.region}
        {data.biography.birthYear !== undefined && data.biography.deathYear !== undefined
          ? ` · ${data.biography.birthYear} – ${data.biography.deathYear}`
          : null}
      </p>
    </header>
  );
}

function Lead({ summary }: { summary: string }) {
  return (
    <p style={{ margin: 0, marginBottom: 16, textAlign: "justify" }}>
      <span
        style={{
          float: "left",
          fontFamily: "Georgia, serif",
          fontSize: 48,
          lineHeight: "40px",
          padding: "4px 6px 0 0",
          color: "#000080",
          fontWeight: 700,
        }}
      >
        {summary.slice(0, 1)}
      </span>
      {summary.slice(1)}
    </p>
  );
}

function BodyWithSidebar({ data }: { data: ArticleData }) {
  const hasSections = data.sections && data.sections.length > 0;
  const hasSidebar = data.sidebar && data.sidebar.length > 0;
  if (!hasSections && !hasSidebar) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: hasSidebar ? "minmax(0, 1fr) 240px" : "1fr",
        gap: 20,
        marginBottom: 18,
        alignItems: "start",
      }}
    >
      {hasSections && <Sections sections={data.sections!} />}
      {hasSidebar && <SidebarFactBox facts={data.sidebar!} />}
    </div>
  );
}

function Sections({
  sections,
}: {
  sections: ReadonlyArray<{ title: string; body: string }>;
}) {
  return (
    <div style={{ minWidth: 0 }}>
      {sections.map((s, i) => (
        <section key={i} style={{ marginBottom: 14 }}>
          <h2
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 16,
              color: "#000080",
              borderBottom: "1px solid #ccc",
              paddingBottom: 4,
              marginTop: 0,
              marginBottom: 8,
            }}
          >
            {s.title}
          </h2>
          <p style={{ margin: 0, textAlign: "justify" }}>{s.body}</p>
        </section>
      ))}
    </div>
  );
}

function SidebarFactBox({
  facts,
}: {
  facts: ReadonlyArray<{ label: string; value: string }>;
}) {
  return (
    <aside
      style={{
        border: "2px solid #000080",
        background: "linear-gradient(180deg, #f4f6ff 0%, #e6e9fa 100%)",
        padding: 12,
        fontFamily: "Tahoma, sans-serif",
        fontSize: 11,
        color: "#111",
        position: "sticky",
        top: 0,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: "#000080",
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          borderBottom: "1px solid #000080",
          paddingBottom: 4,
          marginBottom: 8,
        }}
      >
        Fiche signalétique
      </div>
      <dl style={{ margin: 0 }}>
        {facts.map((f, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <dt style={{ fontWeight: 700, color: "#000080" }}>{f.label}</dt>
            <dd style={{ margin: "2px 0 0", color: "#222" }}>{f.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function PullQuote({ quote }: { quote: { text: string; attribution: string } }) {
  return (
    <blockquote
      style={{
        margin: "20px 0",
        // Reserve a left gutter (60px) for the decorative quote mark so it
        // never overlaps the text.
        padding: "20px 22px 16px 60px",
        borderLeft: "6px double #000080",
        background: "#fafafa",
        fontFamily: "Georgia, serif",
        fontStyle: "italic",
        fontSize: 15,
        color: "#222",
        position: "relative",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 18,
          top: 4,
          fontSize: 48,
          fontFamily: "Georgia, serif",
          color: "#000080",
          lineHeight: 1,
          pointerEvents: "none",
        }}
      >
        “
      </span>
      <p style={{ margin: 0 }}>{quote.text}</p>
      <footer
        style={{
          marginTop: 8,
          fontStyle: "normal",
          fontSize: 11,
          color: "#666",
          textAlign: "right",
          fontFamily: "Tahoma, sans-serif",
        }}
      >
        — {quote.attribution}
      </footer>
    </blockquote>
  );
}

function Timeline({
  events,
}: {
  events: ReadonlyArray<{ year: string; label: string }>;
}) {
  return (
    <section style={{ margin: "20px 0" }}>
      <h2
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 16,
          color: "#000080",
          borderBottom: "1px solid #ccc",
          paddingBottom: 4,
          marginTop: 0,
          marginBottom: 12,
        }}
      >
        Chronologie
      </h2>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          borderLeft: "2px solid #000080",
        }}
      >
        {events.map((e, i) => (
          <li
            key={i}
            style={{
              position: "relative",
              padding: "4px 12px 4px 18px",
              fontSize: 12,
              fontFamily: "Tahoma, sans-serif",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                left: -7,
                top: 8,
                width: 12,
                height: 12,
                background: "#000080",
                border: "2px solid #fff",
                boxShadow: "0 0 0 2px #000080",
                borderRadius: 0,
              }}
            />
            <strong style={{ color: "#000080", display: "inline-block", minWidth: 90 }}>
              {e.year}
            </strong>
            {e.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

function KeyAchievements({ achievements }: { achievements: ReadonlyArray<string> }) {
  return (
    <section style={{ marginTop: 18 }}>
      <h2
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 16,
          color: "#000080",
          borderBottom: "1px solid #ccc",
          paddingBottom: 4,
          marginTop: 0,
          marginBottom: 8,
        }}
      >
        Réalisations clés
      </h2>
      <ul style={{ margin: 0, paddingLeft: 22 }}>
        {achievements.map((a, i) => (
          <li key={i} style={{ marginBottom: 4 }}>
            {a}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RelatedTopics({
  topics,
}: {
  topics: ReadonlyArray<{ slug: string; label: string }>;
}) {
  return (
    <section style={{ marginTop: 18 }}>
      <h2
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 16,
          color: "#000080",
          borderBottom: "1px solid #ccc",
          paddingBottom: 4,
          marginTop: 0,
          marginBottom: 8,
        }}
      >
        Sujets connexes
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {topics.map((t) => (
          <span
            key={t.slug}
            style={{
              border: "1px solid #888",
              padding: "2px 8px",
              fontSize: 11,
              background: "#f0f0f0",
              fontFamily: "Tahoma, sans-serif",
            }}
          >
            {t.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function TalkCTA({ shortName, onTalk }: { shortName: string; onTalk: () => void }) {
  return (
    <div style={{ marginTop: 22, borderTop: "1px dashed #888", paddingTop: 14 }}>
      <button onClick={onTalk} style={{ fontSize: 13, padding: "6px 16px", fontWeight: 700 }}>
        🎙 Parler à {shortName}
      </button>
      <small style={{ marginLeft: 10, color: "#666" }}>
        Consultation interactive multimédia (CD-ROM requis)
      </small>
    </div>
  );
}
