import { useState, useMemo, useRef } from "react";

const T = {
  bg: "#0A0E1A",
  slate900: "#0F172A",
  slate800: "#1E293B",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate300: "#CBD5E1",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  slate50: "#F8FAFC",
  sky: "#38BDF8",
  green: "#4ADE80",
  red: "#F87171",
  mono: "'DM Mono', monospace",
  sans: "'DM Sans', 'Helvetica Neue', sans-serif",
};

const alpha = (hex, a) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const CARDS = [
  {
    name: "Gateway",
    fee: 0,
    color: "#6B7280",
    accent: "#9CA3AF",
    rates: { united: 2, dining: 1, hotels: 1, gas: 1, streaming: 1, other: 1 },
    freeBags: 0,
    lounge: false,
    geTsa: false,
    perks: [],
  },
  {
    name: "Explorer",
    fee: 95,
    color: "#1D4ED8",
    accent: "#60A5FA",
    rates: { united: 2, dining: 2, hotels: 2, gas: 1, streaming: 1, other: 1 },
    freeBags: 1,
    lounge: false,
    geTsa: true,
    perks: ["Priority boarding", "$100 GE/TSA credit", "500 PQP"],
  },
  {
    name: "Quest",
    fee: 250,
    color: "#7C3AED",
    accent: "#A78BFA",
    rates: { united: 3, dining: 3, hotels: 2, gas: 1, streaming: 1, other: 1 },
    freeBags: 2,
    lounge: false,
    geTsa: true,
    perks: ["Priority boarding", "$100 GE/TSA credit", "Award savings 2x/yr", "3,000 PQP"],
  },
  {
    name: "Club Infinite",
    fee: 525,
    color: T.slate900,
    accent: T.sky,
    rates: { united: 4, dining: 2, hotels: 2, gas: 1, streaming: 1, other: 1 },
    freeBags: 2,
    lounge: true,
    geTsa: true,
    perks: ["United Club access", "Priority boarding", "$100 GE/TSA credit", "Award savings 2x/yr", "4,000 PQP"],
  },
];

const CATEGORIES = [
  { key: "united", label: "United Flights", icon: "✈", placeholder: "2000", annual: true },
  { key: "dining", label: "Dining", icon: "🍽", placeholder: "400" },
  { key: "hotels", label: "Hotels", icon: "🏨", placeholder: "100" },
  { key: "gas", label: "Gas & Transit", icon: "⛽", placeholder: "150" },
  { key: "streaming", label: "Streaming", icon: "📺", placeholder: "30" },
  { key: "other", label: "Everything Else", icon: "🛒", placeholder: "800" },
];

const BAG_COST = {
  domestic: { first: 45, second: 55 },
  international: { first: 75, second: 100 },
};
const LOUNGE_VALUE = 59;
const MILE_VALUE = 0.014;

const COMPARISON_ROWS = [
  { section: "Fees & Bonus" },
  { label: "Annual Fee", vals: ["$0", "$95", "$250", "$525"] },
  { label: "Welcome Bonus", vals: ["~20K mi", "~60K mi", "~80K mi", "~100K mi"] },
  { section: "Earning Rates (miles per $)" },
  { label: "United Purchases", vals: ["2x", "2x", "3x", "4x"], highlight: [false, false, false, true] },
  { label: "Dining", vals: ["1x", "2x", "3x", "2x"], highlight: [false, false, true, false] },
  { label: "Hotel", vals: ["1x", "2x", "2x", "2x"] },
  { label: "Gas & Transit", vals: ["1x", "1x", "1x", "1x"] },
  { label: "Streaming", vals: ["1x", "1x", "1x", "1x"] },
  { label: "Everything Else", vals: ["1x", "1x", "1x", "1x"] },
  { section: "Travel Benefits" },
  { label: "Free Checked Bags", vals: ["—", "1st bag", "1st & 2nd", "1st & 2nd"], highlight: [false, false, true, true] },
  { label: "Priority Boarding", vals: ["—", "✓", "✓", "✓"], check: true },
  { label: "United Club Access", vals: ["—", "—", "—", "✓"], check: true, highlight: [false, false, false, true] },
  { label: "TSA Pre / Global Entry", vals: ["—", "$100 credit", "$100 credit", "$100 credit"] },
  { label: "Award Flight Savings", vals: ["—", "—", "2x/yr", "2x/yr"] },
  { section: "Elite Status" },
  { label: "PQP Boost", vals: ["—", "500", "3,000", "4,000"], highlight: [false, false, true, true] },
  { section: "Other Perks" },
  { label: "Trip Delay Insurance", vals: ["—", "✓", "✓", "✓"], check: true },
  { label: "Baggage Delay Insurance", vals: ["—", "✓", "✓", "✓"], check: true },
  { label: "Primary Rental Car Insurance", vals: ["—", "—", "✓", "✓"], check: true },
  { label: "Trip Cancellation Insurance", vals: ["—", "—", "✓", "✓"], check: true },
  { label: "Expanded Award Availability", vals: ["—", "—", "—", "✓"], check: true, highlight: [false, false, false, true] },
];

function formatDollars(n) {
  return n < 0 ? `-$${Math.abs(Math.round(n)).toLocaleString()}` : `$${Math.round(n).toLocaleString()}`;
}

const sBox = {
  background: alpha(T.slate900, 0.6),
  border: `1px solid ${alpha(T.slate400, 0.1)}`,
  borderRadius: "14px",
  padding: "20px",
  marginBottom: "16px",
};
const sLabel = {
  fontSize: "11px",
  fontFamily: T.mono,
  letterSpacing: "2px",
  textTransform: "uppercase",
  color: T.slate500,
  marginBottom: "16px",
};
const sInput = {
  width: "100%",
  boxSizing: "border-box",
  padding: "8px 10px 8px 24px",
  background: alpha(T.slate900, 0.8),
  border: `1px solid ${alpha(T.slate400, 0.12)}`,
  borderRadius: "7px",
  color: T.slate200,
  fontSize: "15px",
  fontFamily: T.mono,
  fontWeight: 500,
  outline: "none",
};

export default function UnitedCardCalculator() {
  const nextId = useRef(5);
  const [spending, setSpending] = useState({
    united: 2000, dining: 400, hotels: 100, gas: 150, streaming: 30, other: 800,
  });
  const [flights, setFlights] = useState([
    { id: 1, label: "Flight 1", bags: 1, lounge: false, international: false },
    { id: 2, label: "Flight 2", bags: 1, lounge: false, international: false },
    { id: 3, label: "Flight 3", bags: 0, lounge: true, international: true },
    { id: 4, label: "Flight 4", bags: 1, lounge: false, international: false },
  ]);

  const addFlight = () => {
    const id = nextId.current++;
    setFlights([...flights, { id, label: `Flight ${flights.length + 1}`, bags: 1, lounge: false, international: false }]);
  };
  const removeFlight = (id) => setFlights(flights.filter((f) => f.id !== id));
  const updateFlight = (id, field, val) =>
    setFlights(flights.map((f) => (f.id === id ? { ...f, [field]: val } : f)));

  const results = useMemo(() => {
    const annualSpending = {};
    const annualKeys = CATEGORIES.filter((c) => c.annual).map((c) => c.key);
    for (const key of Object.keys(spending)) {
      annualSpending[key] = (spending[key] || 0) * (annualKeys.includes(key) ? 1 : 12);
    }
    const totalLoungeVisits = flights.reduce((sum, f) => sum + (f.lounge ? 2 : 0), 0);

    return CARDS.map((card) => {
      let totalMiles = 0;
      for (const [cat, amount] of Object.entries(annualSpending)) {
        totalMiles += amount * (card.rates[cat] || 1);
      }
      const milesValue = totalMiles * MILE_VALUE;

      let bagSavings = 0;
      for (const flight of flights) {
        const coveredBags = Math.min(flight.bags, card.freeBags);
        const fees = flight.international ? BAG_COST.international : BAG_COST.domestic;
        if (coveredBags >= 1) bagSavings += fees.first * 2;
        if (coveredBags >= 2) bagSavings += fees.second * 2;
      }

      let loungeSavings = 0;
      if (card.lounge) {
        loungeSavings = totalLoungeVisits * LOUNGE_VALUE;
      }

      const geTsaCredit = card.geTsa ? 20 : 0;
      const totalValue = milesValue + bagSavings + loungeSavings + geTsaCredit - card.fee;
      return { ...card, totalMiles, milesValue, bagSavings, loungeSavings, totalValue };
    }).sort((a, b) => b.totalValue - a.totalValue);
  }, [spending, flights]);

  const best = results[0];

  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      fontFamily: T.sans, color: T.slate200,
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${T.slate900} 0%, ${T.slate800} 50%, ${T.slate900} 100%)`,
        borderBottom: `1px solid ${alpha(T.sky, 0.15)}`,
        padding: "28px 24px 24px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${alpha(T.sky, 0.08)} 0%, transparent 60%)`,
        }} />
        <div style={{ position: "relative" }}>
          <div style={{
            fontSize: "11px", fontFamily: T.mono,
            letterSpacing: "3px", textTransform: "uppercase", color: T.sky, marginBottom: "8px",
          }}>United Airlines</div>
          <h1 style={{
            fontSize: "26px", fontWeight: 700, margin: 0,
            background: `linear-gradient(135deg, ${T.slate100}, ${T.slate400})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Credit Card Calculator</h1>
          <p style={{ fontSize: "13px", color: T.slate500, marginTop: "6px" }}>
            Enter your spending &amp; flight details to find your best card
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "540px", margin: "0 auto", padding: "20px 16px 40px" }}>

        {/* Annual Spending */}
        <div style={sBox}>
          <div style={sLabel}>Annual Spending</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
            {CATEGORIES.filter((c) => c.annual).map((cat) => (
              <div key={cat.key} style={{
                background: alpha(T.slate800, 0.5), borderRadius: "10px",
                padding: "12px", border: `1px solid ${alpha(T.slate400, 0.07)}`,
              }}>
                <label style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontSize: "12px", color: T.slate400, marginBottom: "8px", fontWeight: 500,
                }}>
                  <span>{cat.icon}</span>{cat.label}
                  <span style={{
                    fontSize: "9px", color: T.slate600, fontFamily: T.mono,
                    marginLeft: "auto",
                  }}>/yr</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
                    color: T.slate600, fontSize: "14px", fontWeight: 600,
                  }}>$</span>
                  <input
                    type="number"
                    value={spending[cat.key] || ""}
                    placeholder={cat.placeholder}
                    onChange={(e) => setSpending({ ...spending, [cat.key]: Number(e.target.value) || 0 })}
                    style={sInput}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Spending */}
        <div style={sBox}>
          <div style={sLabel}>Monthly Spending</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {CATEGORIES.filter((c) => !c.annual).map((cat) => (
              <div key={cat.key} style={{
                background: alpha(T.slate800, 0.5), borderRadius: "10px",
                padding: "12px", border: `1px solid ${alpha(T.slate400, 0.07)}`,
              }}>
                <label style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontSize: "12px", color: T.slate400, marginBottom: "8px", fontWeight: 500,
                }}>
                  <span>{cat.icon}</span>{cat.label}
                  <span style={{
                    fontSize: "9px", color: T.slate600, fontFamily: T.mono,
                    marginLeft: "auto",
                  }}>/mo</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
                    color: T.slate600, fontSize: "14px", fontWeight: 600,
                  }}>$</span>
                  <input
                    type="number"
                    value={spending[cat.key] || ""}
                    placeholder={cat.placeholder}
                    onChange={(e) => setSpending({ ...spending, [cat.key]: Number(e.target.value) || 0 })}
                    style={sInput}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flights Section */}
        <div style={sBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ ...sLabel, marginBottom: 0 }}>Your Flights (Roundtrips)</div>
            <button onClick={addFlight} style={{
              padding: "5px 12px", borderRadius: "7px", fontSize: "12px", fontWeight: 600,
              background: alpha(T.sky, 0.1), border: `1px solid ${alpha(T.sky, 0.25)}`,
              color: T.sky, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>+ Add Flight</button>
          </div>

          {flights.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px", color: T.slate600, fontSize: "13px" }}>
              No flights added. Click "+ Add Flight" above.
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {flights.map((flight, i) => (
              <div key={flight.id} style={{
                background: alpha(T.slate800, 0.5), borderRadius: "10px",
                padding: "12px 14px", border: `1px solid ${alpha(T.slate400, 0.07)}`,
              }}>
                {/* Flight label + remove */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <input
                    type="text"
                    value={flight.label}
                    onChange={(e) => updateFlight(flight.id, "label", e.target.value)}
                    style={{
                      background: "transparent", border: "none", outline: "none",
                      color: T.slate200, fontSize: "14px", fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif", padding: 0, width: "180px",
                    }}
                    placeholder={`Flight ${i + 1}`}
                  />
                  <button onClick={() => removeFlight(flight.id)} style={{
                    background: "none", border: "none", color: T.slate600,
                    cursor: "pointer", fontSize: "16px", padding: "2px 6px", borderRadius: "4px",
                  }} title="Remove flight">✕</button>
                </div>

                {/* Bags + Lounge */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  {/* Bags selector */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: T.slate500, fontFamily: T.mono }}>Bags</span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {[0, 1, 2].map((n) => (
                        <button
                          key={n}
                          onClick={() => updateFlight(flight.id, "bags", n)}
                          style={{
                            width: "32px", height: "28px", borderRadius: "6px",
                            fontSize: "13px", fontFamily: T.mono, fontWeight: 600,
                            cursor: "pointer",
                            background: flight.bags === n ? alpha(T.sky, 0.15) : alpha(T.slate900, 0.6),
                            border: flight.bags === n ? `1px solid ${alpha(T.sky, 0.4)}` : `1px solid ${alpha(T.slate400, 0.1)}`,
                            color: flight.bags === n ? T.sky : T.slate500,
                          }}
                        >{n}</button>
                      ))}
                    </div>
                  </div>

                  {/* International toggle */}
                  <div
                    onClick={() => updateFlight(flight.id, "international", !flight.international)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                  >
                    <div style={{
                      width: "36px", height: "20px", borderRadius: "10px",
                      background: flight.international ? alpha(T.sky, 0.35) : alpha(T.slate800, 0.8),
                      border: flight.international ? `1px solid ${alpha(T.sky, 0.5)}` : `1px solid ${alpha(T.slate400, 0.15)}`,
                      position: "relative", transition: "all 0.2s",
                    }}>
                      <div style={{
                        width: "14px", height: "14px", borderRadius: "50%",
                        background: flight.international ? T.sky : T.slate600,
                        position: "absolute", top: "2px",
                        left: flight.international ? "19px" : "2px",
                        transition: "all 0.2s",
                      }} />
                    </div>
                    <span style={{ fontSize: "11px", color: flight.international ? T.sky : T.slate500, fontFamily: T.mono }}>
                      Int'l
                    </span>
                  </div>

                  {/* Lounge toggle */}
                  <div
                    onClick={() => updateFlight(flight.id, "lounge", !flight.lounge)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "auto" }}
                  >
                    <div style={{
                      width: "36px", height: "20px", borderRadius: "10px",
                      background: flight.lounge ? alpha(T.sky, 0.35) : alpha(T.slate800, 0.8),
                      border: flight.lounge ? `1px solid ${alpha(T.sky, 0.5)}` : `1px solid ${alpha(T.slate400, 0.15)}`,
                      position: "relative", transition: "all 0.2s",
                    }}>
                      <div style={{
                        width: "14px", height: "14px", borderRadius: "50%",
                        background: flight.lounge ? T.sky : T.slate600,
                        position: "absolute", top: "2px",
                        left: flight.lounge ? "19px" : "2px",
                        transition: "all 0.2s",
                      }} />
                    </div>
                    <span style={{ fontSize: "11px", color: flight.lounge ? T.sky : T.slate500, fontFamily: T.mono }}>
                      Lounge
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Flight summary */}
          {flights.length > 0 && (
            <div style={{
              marginTop: "12px", padding: "10px 14px",
              background: alpha(T.slate900, 0.4), borderRadius: "8px",
              display: "flex", gap: "16px", fontSize: "11px",
              fontFamily: T.mono, color: T.slate500,
            }}>
              <span>{flights.length} flight{flights.length !== 1 ? "s" : ""}</span>
              <span>{flights.reduce((s, f) => s + f.bags, 0)} total bags</span>
              <span>{flights.filter((f) => f.lounge).length} w/ lounge</span>
            </div>
          )}
        </div>

        {/* Winner Banner */}
        <div style={{
          background: `linear-gradient(135deg, ${best.color}CC, ${best.color}99)`,
          borderRadius: "14px", padding: "20px", marginBottom: "16px",
          border: `1px solid ${best.accent}33`, position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: "120px",
            background: `radial-gradient(circle at 100% 50%, ${best.accent}15, transparent 70%)`,
          }} />
          <div style={{ position: "relative" }}>
            <div style={{
              fontSize: "10px", fontFamily: T.mono,
              letterSpacing: "2.5px", textTransform: "uppercase", color: best.accent, marginBottom: "6px",
            }}>Best for you</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: T.slate50, marginBottom: "4px" }}>
              United {best.name}
            </div>
            <div style={{ fontSize: "14px", color: alpha(T.slate100, 0.7) }}>
              Net value: <strong style={{ color: best.totalValue >= 0 ? T.green : T.red }}>
                {formatDollars(best.totalValue)}
              </strong>/year
            </div>
          </div>
        </div>

        {/* All Cards Ranked */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {results.map((card, i) => (
            <div key={card.name} style={{
              background: i === 0 ? alpha(T.slate900, 0.8) : alpha(T.slate900, 0.4),
              border: i === 0 ? `1px solid ${card.accent}30` : `1px solid ${alpha(T.slate400, 0.07)}`,
              borderRadius: "12px", padding: "16px",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      fontFamily: T.mono, fontSize: "11px", color: T.slate600,
                      background: alpha(T.slate800, 0.8), padding: "2px 7px", borderRadius: "4px",
                    }}>#{i + 1}</span>
                    <span style={{ fontSize: "16px", fontWeight: 600, color: T.slate100 }}>
                      United {card.name}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: T.slate500, marginTop: "3px" }}>
                    {card.fee === 0 ? "No annual fee" : `$${card.fee}/yr fee`}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontSize: "20px", fontWeight: 700, fontFamily: T.mono,
                    color: card.totalValue >= 0 ? T.green : T.red,
                  }}>{formatDollars(card.totalValue)}</div>
                  <div style={{ fontSize: "10px", color: T.slate500 }}>net value/yr</div>
                </div>
              </div>

              {/* Breakdown */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px",
                fontSize: "11px", fontFamily: T.mono,
              }}>
                {[
                  { label: "Miles", val: card.totalMiles.toLocaleString(), sub: `≈${formatDollars(card.milesValue)}` },
                  { label: "Bags", val: formatDollars(card.bagSavings) },
                  { label: "Lounge", val: formatDollars(card.loungeSavings) },
                  { label: "Fee", val: card.fee === 0 ? "$0" : `-$${card.fee}`, negative: card.fee > 0 },
                ].map((item) => (
                  <div key={item.label} style={{
                    background: alpha(T.slate800, 0.5), borderRadius: "6px",
                    padding: "8px", textAlign: "center",
                  }}>
                    <div style={{ color: T.slate500, marginBottom: "3px" }}>{item.label}</div>
                    <div style={{ color: item.negative ? T.red : T.slate200, fontWeight: 500 }}>{item.val}</div>
                    {item.sub && <div style={{ color: T.slate600, fontSize: "10px" }}>{item.sub}</div>}
                  </div>
                ))}
              </div>

              {card.perks.length > 0 && (
                <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {card.perks.map((perk) => (
                    <span key={perk} style={{
                      fontSize: "10px", color: T.slate400,
                      background: alpha(T.slate800, 0.6), padding: "3px 8px",
                      borderRadius: "20px", border: `1px solid ${alpha(T.slate400, 0.08)}`,
                    }}>{perk}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div style={{
          ...sBox,
          marginTop: "24px",
          padding: "0",
          overflow: "hidden",
        }}>
          <div style={{
            ...sLabel,
            padding: "20px 20px 0",
            marginBottom: "12px",
          }}>Full Card Comparison</div>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
              fontFamily: "'DM Sans', sans-serif",
              minWidth: "480px",
            }}>
              <thead>
                <tr>
                  <th style={{
                    textAlign: "left", padding: "10px 14px", color: T.slate500,
                    fontSize: "10px", fontFamily: T.mono,
                    letterSpacing: "1px", textTransform: "uppercase",
                    borderBottom: `1px solid ${alpha(T.slate400, 0.08)}`,
                    background: alpha(T.slate900, 0.4),
                  }}></th>
                  {["Gateway", "Explorer", "Quest", "Club Infinite"].map((name) => {
                    const card = CARDS.find((c) => c.name === name);
                    return (
                      <th key={name} style={{
                        textAlign: "center", padding: "10px 8px", color: card.accent,
                        fontSize: "11px", fontWeight: 700,
                        borderBottom: `1px solid ${alpha(T.slate400, 0.08)}`,
                        background: alpha(T.slate900, 0.4),
                      }}>{name}</th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, ri) => {
                  if (row.section) {
                    return (
                      <tr key={ri}>
                        <td colSpan={5} style={{
                          padding: "14px 14px 6px",
                          fontSize: "10px",
                          fontFamily: T.mono,
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                          color: T.sky,
                          borderBottom: `1px solid ${alpha(T.sky, 0.1)}`,
                          background: alpha(T.sky, 0.03),
                        }}>{row.section}</td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={ri} style={{
                      background: ri % 2 === 0 ? "transparent" : alpha(T.slate900, 0.2),
                    }}>
                      <td style={{
                        padding: "9px 14px",
                        color: T.slate400,
                        fontSize: "11.5px",
                        fontWeight: 500,
                        borderBottom: `1px solid ${alpha(T.slate400, 0.04)}`,
                        whiteSpace: "nowrap",
                      }}>{row.label}</td>
                      {row.vals.map((val, vi) => {
                        const isHighlight = row.highlight && row.highlight[vi];
                        const isDash = val === "—";
                        const isCheck = val === "✓";
                        return (
                          <td key={vi} style={{
                            padding: "9px 8px",
                            textAlign: "center",
                            fontSize: "11.5px",
                            fontFamily: isCheck || isDash ? "inherit" : T.mono,
                            fontWeight: isHighlight ? 700 : 500,
                            color: isDash ? T.slate700 : isHighlight ? T.sky : isCheck ? T.green : T.slate300,
                            borderBottom: `1px solid ${alpha(T.slate400, 0.04)}`,
                          }}>{val}</td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footnote */}
        <div style={{
          marginTop: "16px", padding: "14px",
          background: alpha(T.slate800, 0.3), borderRadius: "10px",
          border: `1px solid ${alpha(T.slate400, 0.06)}`,
        }}>
          <p style={{ fontSize: "11px", color: T.slate600, margin: 0, lineHeight: 1.6 }}>
            Mile value estimated at 1.4¢ each. Domestic bag fees: $45/$55 (1st/2nd per direction). International: $75/$100.
            Lounge value: $59/visit (2 visits per roundtrip). Fee shown separately in breakdown.
            Welcome bonuses not included — check Chase for current offers. Benefits subject to change.
          </p>
        </div>
      </div>
    </div>
  );
}
