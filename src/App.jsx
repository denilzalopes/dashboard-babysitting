import { useState, useEffect } from "react";

const TAUX_HORAIRE_DEFAULT = 14;

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

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
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
function calcMontant(debut, fin, taux) {
  return (calcDuree(debut, fin) / 60) * taux;
}
function formatEur(val) {
  return val.toFixed(2).replace(".", ",") + " €";
}
function getNextId(entries) {
  return entries.length === 0 ? 1 : Math.max(...entries.map((e) => e.id)) + 1;
}

const STORAGE_KEY = "babysitting-joseph-bahr-v2";

export default function App() {
  const [entries, setEntries] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s).entries : INITIAL_DATA; } catch { return INITIAL_DATA; }
  });
  const [taux, setTaux] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s).taux : TAUX_HORAIRE_DEFAULT; } catch { return TAUX_HORAIRE_DEFAULT; }
  });
  const [showForm, setShowForm] = useState(false);
  const [showTaux, setShowTaux] = useState(false);
  const [tauxEdit, setTauxEdit] = useState(taux);
  const [form, setForm] = useState({ date: "", debut: "17:30", fin: "19:30", paye: false });
  const [editId, setEditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState("all");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries, taux }));
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 1500);
      return () => clearTimeout(t);
    } catch {}
  }, [entries, taux]);

  const totalMin = entries.reduce((acc, e) => acc + calcDuree(e.debut, e.fin), 0);
  const payesMin = entries.filter((e) => e.paye).reduce((acc, e) => acc + calcDuree(e.debut, e.fin), 0);
  const nonPayesMin = totalMin - payesMin;
  const nbPayes = entries.filter((e) => e.paye).length;
  const nbNonPayes = entries.length - nbPayes;
  const montantTotal = entries.reduce((acc, e) => acc + calcMontant(e.debut, e.fin, taux), 0);
  const montantPaye = entries.filter((e) => e.paye).reduce((acc, e) => acc + calcMontant(e.debut, e.fin, taux), 0);
  const montantDu = montantTotal - montantPaye;
  const pctPaye = entries.length > 0 ? Math.round((nbPayes / entries.length) * 100) : 0;

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
  function handleSaveTaux() {
    const val = parseFloat(tauxEdit);
    if (!isNaN(val) && val > 0) setTaux(val);
    setShowTaux(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:3px;}
        .btn{cursor:pointer;border:none;transition:all 0.18s;}
        .btn:active{transform:scale(0.97);}
        .tag-paye{background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3);}
        .tag-nonpaye{background:rgba(239,68,68,0.12);color:#f87171;border:1px solid rgba(239,68,68,0.25);}
        .input-field{background:#0f172a;border:1.5px solid #334155;color:#e2e8f0;border-radius:8px;padding:10px 12px;font-family:inherit;font-size:15px;outline:none;transition:border 0.15s;width:100%;}
        .input-field:focus{border-color:#6366f1;}
        .saved-badge{animation:fadeInOut 1.5s ease;}
        @keyframes fadeInOut{0%{opacity:0}20%{opacity:1}80%{opacity:1}100%{opacity:0}}
        .filter-btn{cursor:pointer;border:1.5px solid transparent;border-radius:20px;padding:6px 14px;font-size:13px;font-weight:500;transition:all 0.15s;white-space:nowrap;}
        .filter-active{background:#6366f1;color:white;border-color:#6366f1;}
        .filter-inactive{background:transparent;color:#94a3b8;border-color:#334155;}
        .card-row{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-bottom:1px solid rgba(30,41,59,0.8);transition:background 0.15s;}
        .card-row:hover{background:rgba(99,102,241,0.06);}
        .card-row:last-child{border-bottom:none;}
        .taux-btn{cursor:pointer;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);color:#a5b4fc;border-radius:8px;padding:4px 10px;font-size:12px;font-weight:600;transition:all 0.15s;}
        .taux-btn:hover{background:rgba(99,102,241,0.25);}
      `}</style>

      {/* Header */}
      <div style={{ background: "rgba(99,102,241,0.08)", borderBottom: "1px solid rgba(99,102,241,0.2)", padding: "16px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#6366f1", fontWeight: 600, marginBottom: 2, textTransform: "uppercase" }}>Suivi babysitting</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>Joseph Bahr</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Taux :</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc", fontFamily: "'DM Mono',monospace" }}>{taux}€/h</span>
              <button className="taux-btn" onClick={() => { setTauxEdit(taux); setShowTaux(true); }}>✏️ Modifier</button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {saved && <span className="saved-badge" style={{ fontSize: 11, color: "#4ade80" }}>✓ Sauvegardé</span>}
            <button className="btn" onClick={() => { setShowForm(true); setEditId(null); }} style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white",
              borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 600,
              boxShadow: "0 4px 15px rgba(99,102,241,0.35)", whiteSpace: "nowrap"
            }}>+ Ajouter</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px" }}>

        {/* Séances + Total heures */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          {[
            { label: "Séances totales", value: entries.length, sub: formatDuree(totalMin), icon: "📅", accent: "#6366f1" },
            { label: "Total heures", value: formatDuree(totalMin), sub: formatEur(montantTotal), icon: "⏱", accent: "#8b5cf6" },
          ].map((card) => (
            <div key={card.label} style={{ background: "rgba(30,41,59,0.8)", border: `1px solid ${card.accent}33`, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{card.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: card.accent, fontFamily: "'DM Mono',monospace" }}>{card.value}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Montant dû en grand */}
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: "#f87171", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>💸 Montant dû (non payé)</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#f87171", fontFamily: "'DM Mono',monospace" }}>{formatEur(montantDu)}</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#f87171", opacity: 0.7, fontFamily: "'DM Mono',monospace" }}>{formatDuree(nonPayesMin)}</div>
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{nbNonPayes} séance{nbNonPayes > 1 ? "s" : ""} en attente</div>
        </div>

        {/* Déjà payé + Total */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "#4ade80", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>✅ Déjà payé</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#4ade80", fontFamily: "'DM Mono',monospace" }}>{formatEur(montantPaye)}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#4ade80", opacity: 0.7, fontFamily: "'DM Mono',monospace", marginTop: 2 }}>{formatDuree(payesMin)}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{nbPayes} séance{nbPayes > 1 ? "s" : ""}</div>
          </div>
          <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, color: "#a5b4fc", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>📊 Total général</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#a5b4fc", fontFamily: "'DM Mono',monospace" }}>{formatEur(montantTotal)}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#a5b4fc", opacity: 0.7, fontFamily: "'DM Mono',monospace", marginTop: 2 }}>{formatDuree(totalMin)}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{entries.length} séances</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid #1e3a5f", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>Paiements reçus</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#4ade80" }}>{nbPayes}/{entries.length} ({pctPaye}%)</span>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${pctPaye}%`, height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#4ade80,#22c55e)", transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Filtres */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
          {[["all", "Toutes"], ["paye", "Payées ✅"], ["nonpaye", "En attente ⏳"]].map(([val, label]) => (
            <button key={val} className={`filter-btn ${filter === val ? "filter-active" : "filter-inactive"}`}
              onClick={() => setFilter(val)}>{label}</button>
          ))}
        </div>

        {/* Liste */}
        <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid #1e293b", borderRadius: 14, overflow: "hidden" }}>
          {filtered.length === 0 && (
            <div style={{ padding: 32, textAlign: "center", color: "#475569", fontSize: 14 }}>Aucune séance trouvée.</div>
          )}
          {filtered.map((entry) => {
            const dur = calcDuree(entry.debut, entry.fin);
            const montant = calcMontant(entry.debut, entry.fin, taux);
            return (
              <div key={entry.id} className="card-row">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1", fontFamily: "'DM Mono',monospace" }}>
                    {formatDate(entry.date)}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: entry.paye ? "#4ade80" : "#f87171", fontFamily: "'DM Mono',monospace" }}>
                      {formatEur(montant)}
                    </span>
                    <button className="btn" onClick={() => handleEdit(entry)}
                      style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 13 }}>✏️</button>
                    <button className="btn" onClick={() => setDeleteConfirm(entry.id)}
                      style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 13 }}>🗑</button>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#64748b", fontFamily: "'DM Mono',monospace" }}>
                    {entry.debut} → {entry.fin} · {formatDuree(dur)}
                  </span>
                  <button className={`btn ${entry.paye ? "tag-paye" : "tag-nonpaye"}`}
                    onClick={() => handleToggle(entry.id)}
                    style={{ borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", background: "none" }}>
                    {entry.paye ? "✓ Payé" : "⏳ En attente"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#334155" }}>
          {filtered.length} séance{filtered.length > 1 ? "s" : ""} · {formatDuree(filtered.reduce((acc, e) => acc + calcDuree(e.debut, e.fin), 0))} · {formatEur(filtered.reduce((acc, e) => acc + calcMontant(e.debut, e.fin, taux), 0))}
        </div>
      </div>

      {/* Modal taux horaire */}
      {showTaux && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}
          onClick={(e) => e.target === e.currentTarget && setShowTaux(false)}>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", width: "100%", maxWidth: 600 }}>
            <div style={{ width: 40, height: 4, background: "#334155", borderRadius: 99, margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, color: "#f1f5f9" }}>💶 Taux horaire</h3>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="number" className="input-field" value={tauxEdit} min="1" step="0.5"
                onChange={(e) => setTauxEdit(e.target.value)}
                style={{ fontSize: 20, fontWeight: 700, textAlign: "center" }} />
              <span style={{ fontSize: 20, color: "#94a3b8", fontWeight: 600 }}>€/h</span>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="btn" onClick={() => setShowTaux(false)}
                style={{ flex: 1, background: "#0f172a", color: "#64748b", border: "1px solid #334155", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 600 }}>Annuler</button>
              <button className="btn" onClick={handleSaveTaux}
                style={{ flex: 2, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 600 }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout/édition */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}
          onClick={(e) => e.target === e.currentTarget && handleCancel()}>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", width: "100%", maxWidth: 600, boxShadow: "0 -10px 40px rgba(0,0,0,0.5)" }}>
            <div style={{ width: 40, height: 4, background: "#334155", borderRadius: 99, margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 18, color: "#f1f5f9" }}>
              {editId !== null ? "✏️ Modifier la séance" : "➕ Nouvelle séance"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>DATE</label>
                <input type="date" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>DÉBUT</label>
                  <input type="time" className="input-field" value={form.debut} onChange={(e) => setForm({ ...form, debut: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 6 }}>FIN</label>
                  <input type="time" className="input-field" value={form.fin} onChange={(e) => setForm({ ...form, fin: e.target.value })} />
                </div>
              </div>
              {form.debut && form.fin && (
                <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, padding: "10px", display: "flex", justifyContent: "space-around" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>Durée</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#a5b4fc", fontFamily: "'DM Mono',monospace" }}>{formatDuree(calcDuree(form.debut, form.fin))}</div>
                  </div>
                  <div style={{ width: 1, background: "#334155" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>Montant</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#4ade80", fontFamily: "'DM Mono',monospace" }}>{formatEur(calcMontant(form.debut, form.fin, taux))}</div>
                  </div>
                </div>
              )}
              <button className="btn" onClick={() => setForm({ ...form, paye: !form.paye })}
                style={{
                  borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 600,
                  background: form.paye ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
                  color: form.paye ? "#4ade80" : "#f87171",
                  border: `1.5px solid ${form.paye ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.25)"}`,
                }}>
                {form.paye ? "✓ Payé" : "⏳ Non payé — appuie pour changer"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="btn" onClick={handleCancel}
                style={{ flex: 1, background: "#0f172a", color: "#64748b", border: "1px solid #334155", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 600 }}>Annuler</button>
              <button className="btn" onClick={handleSubmit}
                style={{ flex: 2, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 600 }}>
                {editId !== null ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {deleteConfirm !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", width: "100%", maxWidth: 600, textAlign: "center" }}>
            <div style={{ width: 40, height: 4, background: "#334155", borderRadius: 99, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Supprimer cette séance ?</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Cette action est irréversible.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, background: "#0f172a", color: "#94a3b8", border: "1px solid #334155", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 600 }}>Annuler</button>
              <button className="btn" onClick={() => handleDelete(deleteConfirm)}
                style={{ flex: 1, background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 600 }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}