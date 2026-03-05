import { useState, useEffect, useCallback } from "react";

const INITIAL_DATA = [
  { id: 1, date: "2026-01-05", debut: "17:30", fin: "19:30", paye: true },
  { id: 2, date: "2026-01-06", debut: "17:30", fin: "19:30", paye: true },
  { id: 3, date: "2026-01-07", debut: "17:30", fin: "19:30", paye: true },
  { id: 4, date: "2026-01-12", debut: "17:30", fin: "19:30", paye: true },
  { id: 5, date: "2026-01-13", debut: "17:30", fin: "19:30", paye: true },
  { id: 6, date: "2026-01-14", debut: "17:30", fin: "19:30", paye: true },
  { id: 7, date: "2026-01-15", debut: "17:30", fin: "19:30", paye: true },
  { id: 8, date: "2026-01-17", debut: "19:00", fin: "23:00", paye: true },
  { id: 9, date: "2026-01-19", debut: "17:30", fin: "19:30", paye: true },
  { id: 10, date: "2026-01-20", debut: "17:30", fin: "19:30", paye: true },
  { id: 11, date: "2026-01-21", debut: "17:30", fin: "23:50", paye: true },
  { id: 12, date: "2026-01-22", debut: "17:30", fin: "19:30", paye: true },
  { id: 13, date: "2026-01-26", debut: "17:30", fin: "19:30", paye: true },
  { id: 14, date: "2026-01-27", debut: "17:30", fin: "19:30", paye: true },
  { id: 15, date: "2026-01-28", debut: "17:30", fin: "19:30", paye: true },
  { id: 16, date: "2026-01-29", debut: "17:30", fin: "18:30", paye: true },
  { id: 17, date: "2026-02-02", debut: "17:30", fin: "19:30", paye: true },
  { id: 18, date: "2026-02-03", debut: "17:30", fin: "19:30", paye: true },
  { id: 19, date: "2026-02-04", debut: "17:30", fin: "19:30", paye: true },
  { id: 20, date: "2026-02-09", debut: "17:30", fin: "19:30", paye: false },
  { id: 21, date: "2026-02-10", debut: "17:30", fin: "19:30", paye: false },
  { id: 22, date: "2026-02-11", debut: "17:30", fin: "21:00", paye: false },
  { id: 23, date: "2026-02-16", debut: "17:30", fin: "19:30", paye: false },
  { id: 24, date: "2026-02-17", debut: "17:30", fin: "19:30", paye: false },
  { id: 25, date: "2026-02-18", debut: "17:30", fin: "19:30", paye: false },
  { id: 26, date: "2026-02-23", debut: "17:30", fin: "19:30", paye: false },
  { id: 27, date: "2026-02-24", debut: "17:30", fin: "19:30", paye: false },
  { id: 28, date: "2026-02-25", debut: "17:30", fin: "19:30", paye: false },
  { id: 29, date: "2026-03-03", debut: "17:30", fin: "19:30", paye: false },
  { id: 30, date: "2026-03-04", debut: "17:30", fin: "19:30", paye: false },
];

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function calcDuree(debut, fin) {
  let diff = toMinutes(fin) - toMinutes(debut);
  if (diff < 0) diff += 24 * 60;
  return diff;
}

function formatDuree(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function getNextId(entries) {
  return entries.length === 0 ? 1 : Math.max(...entries.map((e) => e.id)) + 1;
}

const STORAGE_KEY = "babysitting-joseph-bahr-v1";

export default function App() {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_DATA;
    } catch {
      return INITIAL_DATA;
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", debut: "17:30", fin: "19:30", paye: false });
  const [editId, setEditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState("all");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 1500);
      return () => clearTimeout(t);
    } catch {}
  }, [entries]);

  const stats = useCallback(() => {
    const total = entries.length;
    const totalMin = entries.reduce((acc, e) => acc + calcDuree(e.debut, e.fin), 0);
    const payesMin = entries.filter((e) => e.paye).reduce((acc, e) => acc + calcDuree(e.debut, e.fin), 0);
    const nonPayesMin = totalMin - payesMin;
    const nbPayes = entries.filter((e) => e.paye).length;
    const nbNonPayes = total - nbPayes;
    return { total, totalMin, payesMin, nonPayesMin, nbPayes, nbNonPayes };
  }, [entries]);

  const s = stats();

  const filtered = entries
    .filter((e) => filter === "all" ? true : filter === "paye" ? e.paye : !e.paye)
    .sort((a, b) => a.date.localeCompare(b.date));

  function handleToggle(id) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, paye: !e.paye } : e));
  }

  function handleDelete(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeleteConfirm(null);
  }

  function handleEdit(entry) {
    setForm({ date: entry.date, debut: entry.debut, fin: entry.fin, paye: entry.paye });
    setEditId(entry.id);
    setShowForm(true);
  }

  function handleSubmit() {
    if (!form.date || !form.debut || !form.fin) return;
    if (editId !== null) {
      setEntries((prev) => prev.map((e) => e.id === editId ? { ...e, ...form } : e));
      setEditId(null);
    } else {
      setEntries((prev) => [...prev, { ...form, id: getNextId(prev) }]);
    }
    setForm({ date: "", debut: "17:30", fin: "19:30", paye: false });
    setShowForm(false);
  }

  function handleCancel() {
    setShowForm(false);
    setEditId(null);
    setForm({ date: "", debut: "17:30", fin: "19:30", paye: false });
  }

  const pctPaye = s.total > 0 ? Math.round((s.nbPayes / s.total) * 100) : 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
      padding: "0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1e293b; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .row-hover { transition: background 0.15s; }
        .row-hover:hover { background: rgba(99,102,241,0.08) !important; }
        .btn { cursor: pointer; border: none; transition: all 0.18s; }
        .btn:hover { transform: translateY(-1px); }
        .btn:active { transform: translateY(0); }
        .tag-paye { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
        .tag-nonpaye { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
        .tag-paye:hover { background: rgba(34,197,94,0.28); }
        .tag-nonpaye:hover { background: rgba(239,68,68,0.25); }
        .input-field { background: #1e293b; border: 1.5px solid #334155; color: #e2e8f0; border-radius: 8px; padding: 8px 12px; font-family: inherit; font-size: 14px; outline: none; transition: border 0.15s; }
        .input-field:focus { border-color: #6366f1; }
        .saved-badge { animation: fadeInOut 1.5s ease; }
        @keyframes fadeInOut { 0%{opacity:0;transform:translateY(-4px)} 20%{opacity:1;transform:translateY(0)} 80%{opacity:1} 100%{opacity:0} }
        .filter-btn { cursor: pointer; border: 1.5px solid transparent; border-radius: 20px; padding: 5px 14px; font-size: 13px; font-weight: 500; transition: all 0.15s; }
        .filter-active { background: #6366f1; color: white; border-color: #6366f1; }
        .filter-inactive { background: transparent; color: #94a3b8; border-color: #334155; }
        .filter-inactive:hover { border-color: #6366f1; color: #a5b4fc; }
      `}</style>

      {/* Header */}
      <div style={{ background: "rgba(99,102,241,0.08)", borderBottom: "1px solid rgba(99,102,241,0.2)", padding: "20px 24px 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#6366f1", fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>Suivi babysitting</div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2 }}>Joseph Bähr</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {saved && <span className="saved-badge" style={{ fontSize: 12, color: "#4ade80", display: "flex", alignItems: "center", gap: 4 }}>✓ Sauvegardé</span>}
              <button className="btn" onClick={() => { setShowForm(true); setEditId(null); }} style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white", borderRadius: 10, padding: "10px 18px",
                fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                boxShadow: "0 4px 15px rgba(99,102,241,0.35)"
              }}>+ Ajouter</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>

        {/* Stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Séances totales", value: s.total, icon: "📅", accent: "#6366f1" },
            { label: "Total heures", value: formatDuree(s.totalMin), icon: "⏱", accent: "#8b5cf6" },
            { label: "Heures payées", value: formatDuree(s.payesMin), icon: "✅", accent: "#22c55e" },
            { label: "Heures dues", value: formatDuree(s.nonPayesMin), icon: "⏳", accent: "#ef4444" },
          ].map((card) => (
            <div key={card.label} style={{
              background: "rgba(30,41,59,0.8)", border: `1px solid ${card.accent}33`,
              borderRadius: 12, padding: "14px 16px",
              boxShadow: `0 0 20px ${card.accent}11`
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{card.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: card.accent, fontFamily: "'DM Mono', monospace" }}>{card.value}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 500 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar paiements */}
        <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid #1e3a5f", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Paiements reçus</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>{s.nbPayes} / {s.total} séances ({pctPaye}%)</span>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{
              width: `${pctPaye}%`, height: "100%", borderRadius: 99,
              background: "linear-gradient(90deg, #4ade80, #22c55e)",
              transition: "width 0.5s ease", boxShadow: "0 0 8px rgba(74,222,128,0.5)"
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 11, color: "#4ade80" }}>{s.nbPayes} payé{s.nbPayes > 1 ? "s" : ""}</span>
            <span style={{ fontSize: 11, color: "#f87171" }}>{s.nbNonPayes} en attente</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#64748b", marginRight: 4 }}>Afficher :</span>
          {[["all", "Toutes"], ["paye", "Payées ✅"], ["nonpaye", "En attente ⏳"]].map(([val, label]) => (
            <button key={val} className={`filter-btn ${filter === val ? "filter-active" : "filter-inactive"}`}
              onClick={() => setFilter(val)}>{label}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid #1e293b", borderRadius: 14, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 110px 80px",
            background: "#0f172a", padding: "10px 14px",
            fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: 1, textTransform: "uppercase",
            borderBottom: "1px solid #1e293b"
          }}>
            <div>Date</div><div style={{textAlign:"center"}}>Début</div><div style={{textAlign:"center"}}>Fin</div>
            <div style={{textAlign:"center"}}>Durée</div><div style={{textAlign:"center"}}>Paiement</div><div style={{textAlign:"center"}}>Actions</div>
          </div>

          {/* Rows */}
          {filtered.length === 0 && (
            <div style={{ padding: "32px", textAlign: "center", color: "#475569", fontSize: 14 }}>
              Aucune séance trouvée.
            </div>
          )}
          {filtered.map((entry, idx) => {
            const dur = calcDuree(entry.debut, entry.fin);
            const isEven = idx % 2 === 0;
            return (
              <div key={entry.id} className="row-hover" style={{
                display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 110px 80px",
                padding: "10px 14px", alignItems: "center",
                background: isEven ? "transparent" : "rgba(30,41,59,0.3)",
                borderBottom: "1px solid rgba(30,41,59,0.6)",
              }}>
                <div style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#cbd5e1" }}>
                  {formatDate(entry.date)}
                </div>
                <div style={{ textAlign: "center", fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#94a3b8" }}>{entry.debut}</div>
                <div style={{ textAlign: "center", fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#94a3b8" }}>{entry.fin}</div>
                <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono', monospace", color: "#a5b4fc" }}>
                  {formatDuree(dur)}
                </div>
                <div style={{ textAlign: "center" }}>
                  <button className={`btn ${entry.paye ? "tag-paye" : "tag-nonpaye"}`}
                    onClick={() => handleToggle(entry.id)}
                    style={{ borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: "none" }}>
                    {entry.paye ? "✓ Payé" : "⏳ En attente"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  <button className="btn" onClick={() => handleEdit(entry)}
                    style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 12 }}>✏️</button>
                  <button className="btn" onClick={() => setDeleteConfirm(entry.id)}
                    style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 12 }}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#334155" }}>
          {filtered.length} séance{filtered.length > 1 ? "s" : ""} • Total : {formatDuree(filtered.reduce((acc, e) => acc + calcDuree(e.debut, e.fin), 0))}
        </div>
      </div>

      {/* Modal ajout/édition */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16
        }} onClick={(e) => e.target === e.currentTarget && handleCancel()}>
          <div style={{
            background: "#1e293b", border: "1px solid #334155", borderRadius: 16,
            padding: "28px 24px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#f1f5f9" }}>
              {editId !== null ? "✏️ Modifier la séance" : "➕ Nouvelle séance"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>DATE</label>
                <input type="date" className="input-field" style={{ width: "100%" }}
                  value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>DÉBUT</label>
                  <input type="time" className="input-field" style={{ width: "100%" }}
                    value={form.debut} onChange={(e) => setForm({ ...form, debut: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>FIN</label>
                  <input type="time" className="input-field" style={{ width: "100%" }}
                    value={form.fin} onChange={(e) => setForm({ ...form, fin: e.target.value })} />
                </div>
              </div>
              {form.debut && form.fin && (
                <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>Durée calculée : </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#a5b4fc", fontFamily: "'DM Mono', monospace" }}>
                    {formatDuree(calcDuree(form.debut, form.fin))}
                  </span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button className="btn" onClick={() => setForm({ ...form, paye: !form.paye })}
                  style={{
                    flex: 1, borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 600,
                    background: form.paye ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
                    color: form.paye ? "#4ade80" : "#f87171",
                    border: `1.5px solid ${form.paye ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
                  }}>
                  {form.paye ? "✓ Payé" : "⏳ Non payé"}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button className="btn" onClick={handleCancel}
                style={{ flex: 1, background: "#0f172a", color: "#64748b", border: "1px solid #334155", borderRadius: 9, padding: "11px", fontSize: 14, fontWeight: 600 }}>
                Annuler
              </button>
              <button className="btn" onClick={handleSubmit}
                style={{ flex: 2, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", borderRadius: 9, padding: "11px", fontSize: 14, fontWeight: 600, boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }}>
                {editId !== null ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteConfirm !== null && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16
        }}>
          <div style={{
            background: "#1e293b", border: "1px solid #334155", borderRadius: 16,
            padding: "24px", width: "100%", maxWidth: 320, textAlign: "center"
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🗑️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Supprimer cette séance ?</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Cette action est irréversible.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, background: "#0f172a", color: "#94a3b8", border: "1px solid #334155", borderRadius: 9, padding: "10px", fontSize: 14, fontWeight: 600 }}>
                Annuler
              </button>
              <button className="btn" onClick={() => handleDelete(deleteConfirm)}
                style={{ flex: 1, background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 9, padding: "10px", fontSize: 14, fontWeight: 600 }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
