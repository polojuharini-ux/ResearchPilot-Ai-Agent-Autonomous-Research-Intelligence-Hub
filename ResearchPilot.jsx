import { useState, useEffect, useRef } from "react";

const PAPERS = [
  {
    id: 1,
    title: "Attention Is All You Need",
    authors: "Vaswani et al.",
    year: 2017,
    journal: "NeurIPS",
    tags: ["Transformers", "NLP", "Deep Learning"],
    citations: 98421,
    abstract: "We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    saved: true,
    relevance: 98,
  },
  {
    id: 2,
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: "Devlin et al.",
    year: 2019,
    journal: "NAACL",
    tags: ["BERT", "NLP", "Pre-training"],
    citations: 72310,
    abstract: "We introduce BERT, which stands for Bidirectional Encoder Representations from Transformers, designed to pre-train deep bidirectional representations.",
    saved: false,
    relevance: 94,
  },
  {
    id: 3,
    title: "Scaling Laws for Neural Language Models",
    authors: "Kaplan et al.",
    year: 2020,
    journal: "arXiv",
    tags: ["Scaling", "LLM", "Empirical Study"],
    citations: 5821,
    abstract: "We study empirical scaling laws for language model performance on the cross-entropy loss, finding smooth power laws with model size, dataset size, and compute.",
    saved: true,
    relevance: 89,
  },
  {
    id: 4,
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    authors: "Lewis et al.",
    year: 2021,
    journal: "NeurIPS",
    tags: ["RAG", "Retrieval", "Generation"],
    citations: 11203,
    abstract: "We explore a general-purpose fine-tuning recipe for RAG — models which combine pre-trained parametric and non-parametric memory for language generation.",
    saved: false,
    relevance: 92,
  },
  {
    id: 5,
    title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
    authors: "Wei et al.",
    year: 2022,
    journal: "NeurIPS",
    tags: ["CoT", "Reasoning", "Prompting"],
    citations: 9847,
    abstract: "We explore how generating a chain of thought — a series of intermediate reasoning steps — significantly improves the ability of LLMs to perform complex reasoning.",
    saved: false,
    relevance: 87,
  },
];

const INSIGHTS = [
  { label: "Papers Analyzed", value: "2,847", delta: "+124 this week" },
  { label: "Topics Mapped", value: "63", delta: "+8 new clusters" },
  { label: "Avg Relevance", value: "91.2%", delta: "+3.1% vs last month" },
  { label: "Hours Saved", value: "184h", delta: "est. researcher time" },
];

const CHAT_INIT = [
  {
    role: "ai",
    text: "Hello, researcher. I've analyzed your library and identified 5 emerging themes in your saved papers. What would you like to explore today?",
  },
];

const TAGS_ALL = ["All", "NLP", "LLM", "Transformers", "RAG", "Reasoning", "Scaling", "BERT", "Deep Learning"];

function Spinner() {
  return (
    <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #f59e0b55", borderTop: "2px solid #f59e0b", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 8 }} />
  );
}

function PaperCard({ paper, onSelect, selected }) {
  const [saved, setSaved] = useState(paper.saved);
  return (
    <div
      onClick={() => onSelect(paper)}
      style={{
        background: selected ? "rgba(245,158,11,0.07)" : "rgba(255,255,255,0.025)",
        border: selected ? "1px solid rgba(245,158,11,0.45)" : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: "18px 20px",
        cursor: "pointer",
        transition: "all 0.22s",
        marginBottom: 12,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: `${paper.relevance}%`, height: 2, background: `linear-gradient(90deg, #f59e0b, #ef4444)`, borderRadius: 2 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 700, color: "#f1f0ee", lineHeight: 1.4, marginBottom: 5 }}>{paper.title}</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>{paper.authors} · {paper.year} · <span style={{ color: "#f59e0b88" }}>{paper.journal}</span></div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {paper.tags.map(t => (
              <span key={t} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, padding: "2px 9px", textTransform: "uppercase" }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <button
            onClick={e => { e.stopPropagation(); setSaved(s => !s); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: saved ? "#f59e0b" : "#4b5563", transition: "color 0.2s", padding: 2 }}
          >{saved ? "★" : "☆"}</button>
          <div style={{ fontSize: 10, color: "#6b7280", textAlign: "right" }}>
            <span style={{ display: "block", color: "#d1d5db", fontWeight: 700, fontSize: 13 }}>{paper.relevance}%</span>
            <span>relevance</span>
          </div>
          <div style={{ fontSize: 10, color: "#6b7280" }}>{(paper.citations / 1000).toFixed(1)}k cited</div>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ paper, onClose }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  async function generateSummary() {
    setLoading(true);
    setSummary(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are ResearchPilot, an expert AI research assistant. Provide concise, insightful academic summaries. Use precise language. Structure with: KEY CONTRIBUTION, METHODOLOGY, IMPACT. Keep it under 120 words total. Use plain text, no markdown symbols.",
          messages: [{ role: "user", content: `Summarize this paper for a researcher:\n\nTitle: ${paper.title}\nAuthors: ${paper.authors}\nAbstract: ${paper.abstract}` }],
        }),
      });
      const data = await res.json();
      setSummary(data.content?.[0]?.text || "Unable to generate summary.");
    } catch {
      setSummary("Error generating summary. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#f59e0b", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Selected Paper</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: "#f1f0ee", margin: 0, lineHeight: 1.3, maxWidth: 360 }}>{paper.title}</h2>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12 }}>✕ Close</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        {[["Authors", paper.authors], ["Year", paper.year], ["Journal", paper.journal], ["Citations", `${(paper.citations/1000).toFixed(1)}k`]].map(([k,v]) => (
          <div key={k} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
            <div style={{ fontSize: 13, color: "#d1d5db", fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Abstract</div>
        <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.7, margin: 0 }}>{paper.abstract}</p>
      </div>

      <button
        onClick={generateSummary}
        disabled={loading}
        style={{
          background: loading ? "rgba(245,158,11,0.1)" : "linear-gradient(135deg, #f59e0b, #d97706)",
          border: "none", borderRadius: 10, padding: "12px 20px", color: loading ? "#f59e0b" : "#0f0e0c",
          fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          letterSpacing: "0.04em", marginBottom: 16, transition: "all 0.2s",
        }}
      >
        {loading && <Spinner />}
        {loading ? "Analyzing Paper..." : "✦ Generate AI Summary"}
      </button>

      {summary && (
        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "16px 18px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "#f59e0b", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>✦ AI Research Summary</div>
          <p style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>{summary}</p>
        </div>
      )}
    </div>
  );
}

function ChatPanel() {
  const [messages, setMessages] = useState(CHAT_INIT);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", text: q }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const apiMsgs = newMessages.map(m => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text,
      }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are ResearchPilot, an expert AI research assistant embedded in an academic research intelligence platform. Help researchers discover insights, understand papers, identify research gaps, suggest related work, and improve their research process. Be concise, precise, and insightful. Speak like a knowledgeable academic collaborator.",
          messages: apiMsgs,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "I couldn't generate a response.";
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Connection error. Please try again." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#f59e0b", textTransform: "uppercase", fontWeight: 700, marginBottom: 14 }}>✦ Research Intelligence Chat</div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 4, marginBottom: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
              background: m.role === "ai" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.08)",
              color: m.role === "ai" ? "#0f0e0c" : "#9ca3af", border: m.role === "user" ? "1px solid rgba(255,255,255,0.1)" : "none",
            }}>{m.role === "ai" ? "✦" : "R"}</div>
            <div style={{
              maxWidth: "78%", padding: "10px 14px", borderRadius: m.role === "ai" ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
              background: m.role === "ai" ? "rgba(245,158,11,0.07)" : "rgba(255,255,255,0.05)",
              border: m.role === "ai" ? "1px solid rgba(245,158,11,0.15)" : "1px solid rgba(255,255,255,0.07)",
              fontSize: 13, color: "#d1d5db", lineHeight: 1.65,
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#0f0e0c" }}>✦</div>
            <div style={{ padding: "12px 16px", borderRadius: "4px 14px 14px 14px", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)", display: "flex", alignItems: "center" }}>
              <Spinner /><span style={{ fontSize: 12, color: "#9ca3af" }}>Analyzing...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about research gaps, methodologies, trends..."
          style={{
            flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 10, padding: "11px 15px", color: "#d1d5db", fontSize: 13,
            outline: "none", fontFamily: "inherit",
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            background: input.trim() && !loading ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.05)",
            border: "none", borderRadius: 10, padding: "0 18px",
            color: input.trim() && !loading ? "#0f0e0c" : "#4b5563",
            fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
          }}
        >→</button>
      </div>
    </div>
  );
}

export default function ResearchPilot() {
  const [activeTab, setActiveTab] = useState("library");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const filtered = PAPERS.filter(p => {
    const matchTag = activeTag === "All" || p.tags.includes(activeTag);
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.authors.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTag && matchSearch;
  });

  async function runSearch(q) {
    if (!q.trim()) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a research discovery AI. Given a search query, generate 3 concise paper recommendations in JSON array format only. Each object: {title, authors, year, journal, tags (array), relevance (number 70-99), teaser (1 sentence)}. Return ONLY valid JSON array, no other text.",
          messages: [{ role: "user", content: `Find papers about: ${q}` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      setSearchResults(JSON.parse(clean));
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0a09", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#d1d5db", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.2); border-radius: 4px; }
        input::placeholder { color: #4b5563; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #f59e0b, #b45309)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 17, color: "#f1f0ee", letterSpacing: "-0.01em" }}>ResearchPilot</div>
            <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.12em", textTransform: "uppercase" }}>Autonomous Research Intelligence</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {[["library", "Library"], ["discover", "Discover"], ["chat", "AI Assistant"]].map(([k, label]) => (
            <button key={k} onClick={() => setActiveTab(k)} style={{
              background: activeTab === k ? "rgba(245,158,11,0.1)" : "none",
              border: activeTab === k ? "1px solid rgba(245,158,11,0.25)" : "1px solid transparent",
              color: activeTab === k ? "#f59e0b" : "#6b7280",
              borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
          <span style={{ fontSize: 12, color: "#6b7280" }}>Agent Active</span>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{ background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 32px", display: "flex", gap: 0 }}>
        {INSIGHTS.map((ins, i) => (
          <div key={i} style={{ padding: "12px 28px 12px 0", marginRight: 28, borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#f1f0ee" }}>{ins.value}</span>
              <span style={{ fontSize: 10, color: "#10b981" }}>{ins.delta}</span>
            </div>
            <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{ins.label}</div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: 24, gap: 20 }}>

        {/* LEFT: Paper List / Discover */}
        <div style={{ width: selectedPaper || activeTab === "chat" ? 420 : "100%", maxWidth: activeTab === "chat" ? 0 : undefined, flexShrink: 0, display: activeTab === "chat" ? "none" : "flex", flexDirection: "column", overflow: "hidden", animation: "fadeIn 0.3s ease" }}>

          {activeTab === "library" && (
            <>
              <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search your library..."
                  style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 15px", color: "#d1d5db", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                />
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {TAGS_ALL.map(t => (
                  <button key={t} onClick={() => setActiveTag(t)} style={{
                    background: activeTag === t ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)",
                    border: activeTag === t ? "1px solid rgba(245,158,11,0.35)" : "1px solid rgba(255,255,255,0.07)",
                    color: activeTag === t ? "#f59e0b" : "#6b7280", borderRadius: 20, padding: "4px 13px",
                    fontSize: 11, cursor: "pointer", fontWeight: 500, transition: "all 0.18s",
                  }}>{t}</button>
                ))}
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                <div style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>{filtered.length} Papers · Sorted by Relevance</div>
                {filtered.map(p => <PaperCard key={p.id} paper={p} selected={selectedPaper?.id === p.id} onSelect={setSelectedPaper} />)}
              </div>
            </>
          )}

          {activeTab === "discover" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#f1f0ee", marginBottom: 4 }}>AI-Powered Discovery</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>Describe your research interest and let the agent find relevant papers.</div>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && runSearch(searchQuery)}
                  placeholder="e.g. sparse attention for long sequences..."
                  style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "11px 15px", color: "#d1d5db", fontSize: 13, outline: "none", fontFamily: "inherit" }}
                />
                <button onClick={() => runSearch(searchQuery)} disabled={searching} style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)", border: "none", borderRadius: 10,
                  padding: "0 20px", color: "#0f0e0c", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center",
                }}>{searching ? <Spinner /> : null}{searching ? "Finding..." : "Discover"}</button>
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {searchResults === null && !searching && (
                  <div style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div style={{ fontSize: 40, marginBottom: 14 }}>✦</div>
                    <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7 }}>Enter a research topic above and the<br />AI agent will surface relevant papers.</div>
                  </div>
                )}
                {searchResults?.map((p, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px", marginBottom: 12, animation: "fadeIn 0.3s ease" }}>
                    <div style={{ position: "absolute", width: `${p.relevance}%`, height: 2 }} />
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#f1f0ee", fontWeight: 700, marginBottom: 5 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>{p.authors} · {p.year} · <span style={{ color: "#f59e0b88" }}>{p.journal}</span></div>
                    <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 10 }}>{p.teaser}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {p.tags?.map(t => <span key={t} style={{ fontSize: 10, background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, padding: "2px 9px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* CENTER: Detail Panel */}
        {selectedPaper && activeTab !== "chat" && (
          <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, overflow: "hidden", display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease" }}>
            <DetailPanel paper={selectedPaper} onClose={() => setSelectedPaper(null)} />
          </div>
        )}

        {/* CHAT Full Panel */}
        {activeTab === "chat" && (
          <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, overflow: "hidden", display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease" }}>
            <ChatPanel />
          </div>
        )}

        {/* Empty state */}
        {!selectedPaper && activeTab === "library" && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14, color: "#374151" }}>
            <div style={{ fontSize: 56 }}>✦</div>
            <div style={{ fontSize: 15, color: "#4b5563", textAlign: "center", lineHeight: 1.7 }}>Select a paper to explore<br />AI-powered insights and summaries</div>
          </div>
        )}
      </div>
    </div>
  );
}
