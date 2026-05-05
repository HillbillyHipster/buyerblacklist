import { useState, useEffect } from "react";

const SUPABASE_URL = "https://khdfxefaiztdhvfarkvp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZGZ4ZWZhaXp0ZGh2ZmFya3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTE0NTAsImV4cCI6MjA5MzU2NzQ1MH0.JxDjCUhbNxBfQm6KobZ7dkDeJ2assUNj8-zSeJrYKwY";
const ADSENSE_PUB = "ca-pub-2061049202248782";

const db = {
  async get(table, params = "") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}&order=created_at.desc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" }
    });
    return res.json();
  },
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async update(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async uploadImage(file) {
    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/evidence/${filename}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": file.type },
      body: file
    });
    if (res.ok) return `${SUPABASE_URL}/storage/v1/object/public/evidence/${filename}`;
    return null;
  }
};

const SEED_REPORTS = [
  { buyer_username: "bargainhunter99", title: "Filed false INAD after 30 days", category: "False INAD Claim", description: "Bought a vintage camera, used it for a month, then opened an Item Not As Described case claiming it was broken. eBay sided with them despite my proof of delivery and condition photos. Lost $340 and the item.", severity: "high", upvotes: 47, author: "VintageCameraGuy", verified: true, images: [] },
  { buyer_username: "deals4me_only", title: "Feedback extortion – demanded $50 refund or negative feedback", category: "Feedback Extortion", description: "After delivery, messaged me saying the item wasn't exactly what they expected and threatened negative feedback unless I refunded $50. Classic extortion play.", severity: "high", upvotes: 89, author: "TexasSeller", verified: true, images: [] },
  { buyer_username: "quickflip2024", title: "Non-payment on 3 separate auctions", category: "Non-Payment", description: "Won three of my auctions over two weeks. Never paid on any of them. Had to open unpaid item cases on all three. Wasted 3 weeks of my time.", severity: "medium", upvotes: 31, author: "CollectiblesShop", verified: false, images: [] },
  { buyer_username: "mr_returns_alot", title: "Returned empty box – kept the item", category: "Return Fraud", description: "Bought electronics, returned a box filled with rocks. eBay refunded them fully despite my photos showing the fraud. $280 loss with zero recourse.", severity: "high", upvotes: 156, author: "ElectronicsReseller", verified: true, images: [] },
  { buyer_username: "always_lowball", title: "Opened chargeback after 45 days", category: "Chargeback Abuse", description: "Paid normally, item delivered and confirmed. 45 days later filed a credit card chargeback claiming unauthorized purchase. Lost $120 plus fees.", severity: "high", upvotes: 63, author: "SportsMemorabilia", verified: true, images: [] },
  { buyer_username: "freebie_freddie", title: "Claimed item never arrived – tracking shows delivered", category: "False INAD Claim", description: "USPS tracking confirmed delivery with a photo of my package at their door. They still opened an INR case. eBay refunded them anyway. $78 gone.", severity: "high", upvotes: 44, author: "FlipKingOhio", verified: true, images: [] },
  { buyer_username: "switcharoo_steve", title: "Returned a broken item – sent back a different one", category: "Item Switching", description: "Sold a working Nintendo 64 in great condition. They returned a cracked, yellowed unit that wasn't mine. Different serial number. eBay still ruled in their favor.", severity: "high", upvotes: 201, author: "RetroGameReseller", verified: true, images: [] },
  { buyer_username: "lowball_larry77", title: "Won auction then demanded lower price or would leave negative", category: "Feedback Extortion", description: "Won a $90 auction, then messaged asking me to accept $45 or they'd tank my feedback. I declined. Got a negative review saying item was broken — it wasn't.", severity: "medium", upvotes: 38, author: "GarageFlipQueen", verified: false, images: [] },
  { buyer_username: "phantom_bidder_x", title: "Serial non-payer – 5 unpaid items in one month", category: "Non-Payment", description: "This account bid on and won 5 of my listings over 4 weeks. Never paid a single one. eBay's unpaid item process is a joke — takes 4 days each time and does nothing.", severity: "high", upvotes: 77, author: "BooksellerMike", verified: true, images: [] },
  { buyer_username: "refund_queen_xo", title: "Abuses returns every single purchase", category: "Return Fraud", description: "Bought three separate items from me over two months. Returned all three claiming INAD. Items were exactly as described. She has a clear pattern — check her feedback.", severity: "high", upvotes: 92, author: "VintageClothingCo", verified: true, images: [] },
  { buyer_username: "deal_or_dispute", title: "Threatened dispute if I didn't combine shipping after auction closed", category: "Feedback Extortion", description: "Won two separate auctions, then demanded I combine shipping retroactively or he'd file disputes on both. Auctions clearly stated no combined shipping.", severity: "medium", upvotes: 25, author: "CoinCollector1982", verified: false, images: [] },
  { buyer_username: "chargebackchris99", title: "Second chargeback from this buyer in 6 months", category: "Chargeback Abuse", description: "This is the second time he's bought from different sellers and filed chargebacks. He knows exactly what he's doing. First one was $200, this one hit me for $165.", severity: "high", upvotes: 110, author: "AudioEquipmentSeller", verified: true, images: [] },
  { buyer_username: "nitpick_ninja", title: "Left negative feedback over a typo in the listing", category: "Feedback Extortion", description: "Item was exactly as shown in photos. Left 1-star feedback because the description said like new and they felt it should have said excellent. Never contacted me first.", severity: "low", upvotes: 18, author: "KitchenGadgetGal", verified: false, images: [] },
  { buyer_username: "inr_ivan", title: "Filed INR claim while package was still in transit", category: "False INAD Claim", description: "Opened an Item Not Received case on day 3 of a stated 5-7 day shipping window. eBay let it proceed. Package arrived day 6. They kept the refund AND the item.", severity: "high", upvotes: 84, author: "HandmadeJewelryShop", verified: true, images: [] },
  { buyer_username: "bait_and_switch_bob", title: "Swapped brand name item for knockoff, returned knockoff", category: "Item Switching", description: "Sold an authentic Coach wallet. They returned a cheap fake. eBay's authentication team wasn't involved because it was under their threshold. Lost $210.", severity: "high", upvotes: 133, author: "LuxuryReseller_ATL", verified: true, images: [] },
  { buyer_username: "ghost_winner_2023", title: "Shill bidder – drives up price then never pays", category: "Non-Payment", description: "Strong suspicion this is a coordinated shill account. Bids aggressively on auctions, drives prices up, then never pays. Seen the same pattern reported in multiple seller groups.", severity: "medium", upvotes: 56, author: "AntiqueMapDealer", verified: false, images: [] },
  { buyer_username: "photo_thief_pat", title: "Filed INAD using photos of a damaged item they bought elsewhere", category: "False INAD Claim", description: "Submitted return photos showing a cracked screen. The serial number in their photo didn't match what I shipped. They had a damaged unit from somewhere else and tried to swap.", severity: "high", upvotes: 167, author: "PhoneParts_Pro", verified: true, images: [] },
  { buyer_username: "midnight_bidder_88", title: "Won 4 auctions, paid for 1, disputed the rest", category: "Chargeback Abuse", description: "Paid for the cheapest item, then filed chargebacks on the other three claiming his account was hacked. PayPal froze my funds for 90 days. Total exposure: $430.", severity: "high", upvotes: 95, author: "ToolsAndHardwareSam", verified: true, images: [] },
];

const CATEGORIES = ["All", "False INAD Claim", "Feedback Extortion", "Non-Payment", "Return Fraud", "Chargeback Abuse", "Item Switching", "Other"];
const SEVERITIES = { high: { label: "High Risk", color: "#ff3b3b" }, medium: { label: "Medium Risk", color: "#ff8c00" }, low: { label: "Low Risk", color: "#f0c040" } };

const getSession = () => { try { const s = localStorage.getItem("bbl_session"); return s ? JSON.parse(s) : null; } catch { return null; } };
const saveSession = (data) => localStorage.setItem("bbl_session", JSON.stringify(data));
const getVoterId = () => { let id = localStorage.getItem("voter_id"); if (!id) { id = Math.random().toString(36).slice(2); localStorage.setItem("voter_id", id); } return id; };

const AdBanner = ({ slot = "horizontal" }) => (
  <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 4, padding: "12px", textAlign: "center", margin: "16px 0" }}>
    <div style={{ fontSize: 9, color: "#333", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Advertisement</div>
    <ins className="adsbygoogle"
      style={{ display: "block", minHeight: slot === "horizontal" ? 90 : 250 }}
      data-ad-client={ADSENSE_PUB}
      data-ad-slot={slot === "horizontal" ? "1234567890" : "0987654321"}
      data-ad-format={slot === "horizontal" ? "horizontal" : "rectangle"}
      data-full-width-responsive="true" />
  </div>
);

export default function App() {
  const [view, setView] = useState("feed");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [upvoted, setUpvoted] = useState({});
  const [newReport, setNewReport] = useState({ buyerUsername: "", title: "", category: "False INAD Claim", description: "", severity: "high" });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(getSession());
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("register");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(!!localStorage.getItem("bbl_disclaimer"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { loadReports(); }, []);

  useEffect(() => {
    if (!document.querySelector(`script[src*="adsbygoogle"]`)) {
      const s = document.createElement("script");
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB}`;
      s.async = true; s.crossOrigin = "anonymous";
      document.head.appendChild(s);
    }
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await db.get("reports");
      if (Array.isArray(data) && data.length === 0) {
        for (const r of SEED_REPORTS) await db.insert("reports", r);
        const seeded = await db.get("reports");
        setReports(Array.isArray(seeded) ? seeded : []);
      } else {
        setReports(Array.isArray(data) ? data : []);
      }
    } catch (e) { setError("Could not connect to database."); }
    setLoading(false);
  };

  const loadComments = async (reportId) => {
    const data = await db.get("comments", `report_id=eq.${reportId}`);
    setComments(Array.isArray(data) ? data : []);
  };

  const handleUpvote = async (report) => {
    if (upvoted[report.id]) return;
    const voterId = getVoterId();
    await db.insert("upvotes", { report_id: report.id, voter_id: voterId });
    const newCount = (report.upvotes || 0) + 1;
    await db.update("reports", report.id, { upvotes: newCount });
    setUpvoted(prev => ({ ...prev, [report.id]: true }));
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, upvotes: newCount } : r));
    if (selectedReport?.id === report.id) setSelectedReport(prev => ({ ...prev, upvotes: newCount }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImages(prev => [...prev, { name: file.name, url: ev.target.result, file }]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx) => setUploadedImages(prev => prev.filter((_, i) => i !== idx));

  const handleAuth = async () => {
    setAuthError("");
    if (!authForm.username.trim() || !authForm.password.trim()) { setAuthError("All fields required."); return; }
    if (authForm.username.length < 3) { setAuthError("Username must be at least 3 characters."); return; }
    if (authForm.password.length < 6) { setAuthError("Password must be at least 6 characters."); return; }
    if (authMode === "register") {
      const existing = await db.get("users", `username=eq.${encodeURIComponent(authForm.username)}&select=id`);
      if (Array.isArray(existing) && existing.length > 0) { setAuthError("Username already taken."); return; }
      const result = await db.insert("users", { username: authForm.username, password_hash: btoa(authForm.password) });
      if (result?.error) { setAuthError("Registration failed. Try again."); return; }
      const newSession = { username: authForm.username, id: result[0]?.id };
      saveSession(newSession); setSession(newSession); setShowAuth(false); setAuthForm({ username: "", password: "" });
    } else {
      const users = await db.get("users", `username=eq.${encodeURIComponent(authForm.username)}`);
      if (!Array.isArray(users) || users.length === 0) { setAuthError("Username not found."); return; }
      if (users[0].password_hash !== btoa(authForm.password)) { setAuthError("Incorrect password."); return; }
      const newSession = { username: users[0].username, id: users[0].id };
      saveSession(newSession); setSession(newSession); setShowAuth(false); setAuthForm({ username: "", password: "" });
    }
  };

  const handleLogout = () => { localStorage.removeItem("bbl_session"); setSession(null); };

  const handleSubmitReport = async () => {
    if (!newReport.buyerUsername || !newReport.title || !newReport.description) return;
    if (!session) { setShowAuth(true); return; }
    setSubmitting(true);
    let imageUrls = [];
    if (uploadedImages.length > 0) {
      setUploadingImages(true);
      for (const img of uploadedImages) { const url = await db.uploadImage(img.file); if (url) imageUrls.push(url); }
      setUploadingImages(false);
    }
    await db.insert("reports", {
      buyer_username: newReport.buyerUsername, title: newReport.title, category: newReport.category,
      description: newReport.description, severity: newReport.severity, upvotes: 0,
      author: session.username, verified: false, images: imageUrls
    });
    await loadReports();
    setSubmitSuccess(true);
    setNewReport({ buyerUsername: "", title: "", category: "False INAD Claim", description: "", severity: "high" });
    setUploadedImages([]);
    setSubmitting(false);
    setTimeout(() => { setSubmitSuccess(false); setView("feed"); }, 2000);
  };

  const handleAddComment = async (reportId) => {
    if (!commentText.trim()) return;
    if (!session) { setShowAuth(true); return; }
    await db.insert("comments", { report_id: reportId, text: commentText, author: session.username });
    setCommentText(""); loadComments(reportId);
  };

  const openDetail = (report) => { setSelectedReport(report); loadComments(report.id); setView("detail"); window.scrollTo(0, 0); };
  const norm = (r) => ({ ...r, buyerUsername: r.buyer_username || r.buyerUsername, date: r.created_at ? r.created_at.split("T")[0] : r.date });

  const filteredReports = reports.map(norm).filter(r => {
    const matchSearch = searchQuery === "" || r.buyerUsername?.toLowerCase().includes(searchQuery.toLowerCase()) || r.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch && (filterCategory === "All" || r.category === filterCategory);
  });

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: "#c0392b", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #1e1e1e" }}>{title}</h2>
      <div style={{ fontSize: 14, color: "#888", lineHeight: 1.9 }}>{children}</div>
    </div>
  );

  const navTo = (v) => { setView(v); setMobileMenuOpen(false); window.scrollTo(0, 0); };

  if (!disclaimerAccepted) return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#0d0d0d", minHeight: "100vh", color: "#e8e0d0", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:wght@300;400;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ maxWidth: 580, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900 }}><span style={{ color: "#c0392b" }}>⚑</span> BuyerBlacklist</div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: "2px", textTransform: "uppercase", marginTop: 4 }}>Before You Enter</div>
        </div>
        <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 4, padding: 20, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, marginBottom: 14, color: "#e8e0d0" }}>Terms of Use & Disclaimer</h2>
          <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, maxHeight: 280, overflowY: "auto", paddingRight: 8 }}>
            <p style={{ marginBottom: 12 }}><strong style={{ color: "#aaa" }}>User-Generated Content Platform.</strong> BuyerBlacklist.com is an interactive computer service that provides a platform for users to publish their own firsthand experiences and opinions.</p>
            <p style={{ marginBottom: 12 }}><strong style={{ color: "#aaa" }}>Section 230 Protection.</strong> This platform operates under the protections of 47 U.S.C. § 230 of the Communications Decency Act. BuyerBlacklist.com is not the publisher or speaker of any user-submitted content.</p>
            <p style={{ marginBottom: 12 }}><strong style={{ color: "#aaa" }}>No Endorsement.</strong> BuyerBlacklist.com does not verify, endorse, or warrant the accuracy of any content posted by users.</p>
            <p style={{ marginBottom: 12 }}><strong style={{ color: "#aaa" }}>Your Responsibility.</strong> By posting content, you affirm it is your honest, firsthand account. You are solely responsible for content you publish.</p>
            <p style={{ marginBottom: 12 }}><strong style={{ color: "#aaa" }}>No Legal Advice.</strong> Nothing on this platform constitutes legal advice.</p>
            <p><strong style={{ color: "#aaa" }}>Content Removal.</strong> Submit removal requests to legal@badbuyerblacklist.com.</p>
          </div>
        </div>
        <button onClick={() => { localStorage.setItem("bbl_disclaimer", "1"); setDisclaimerAccepted(true); }}
          style={{ width: "100%", background: "#c0392b", color: "white", border: "none", padding: "16px", fontFamily: "'Source Serif 4', serif", fontSize: 15, borderRadius: 3, cursor: "pointer" }}>
          I Understand & Agree — Enter Site
        </button>
        <div style={{ fontSize: 11, color: "#333", textAlign: "center", marginTop: 10 }}>By entering you agree to our Terms of Use, Privacy Policy, and Disclaimer</div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#0d0d0d", minHeight: "100vh", color: "#e8e0d0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:wght@300;400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #1a1a1a; } ::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
        .card { background: #161616; border: 1px solid #2a2a2a; border-radius: 4px; transition: border-color 0.2s; }
        .card:hover { border-color: #c0392b; }
        .btn-primary { background: #c0392b; color: white; border: none; padding: 10px 20px; cursor: pointer; font-family: 'Source Serif 4', serif; font-size: 14px; border-radius: 3px; transition: background 0.2s; }
        .btn-primary:hover { background: #e74c3c; } .btn-primary:disabled { background: #555; cursor: not-allowed; }
        .btn-ghost { background: transparent; color: #888; border: 1px solid #333; padding: 8px 16px; cursor: pointer; font-family: 'Source Serif 4', serif; font-size: 13px; border-radius: 3px; transition: all 0.2s; }
        .btn-ghost:hover { color: #e8e0d0; border-color: #666; }
        input, textarea, select { background: #1e1e1e; border: 1px solid #333; color: #e8e0d0; padding: 10px 14px; font-family: 'Source Serif 4', serif; font-size: 14px; border-radius: 3px; width: 100%; outline: none; transition: border-color 0.2s; }
        input:focus, textarea:focus, select:focus { border-color: #c0392b; }
        select option { background: #1e1e1e; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; white-space: nowrap; }
        .nav-item { cursor: pointer; padding: 8px 10px; color: #888; font-family: 'Source Serif 4', serif; font-size: 13px; border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; }
        .nav-item:hover { color: #e8e0d0; } .nav-item.active { color: #e8e0d0; border-bottom-color: #c0392b; }
        .upvote-btn { background: transparent; border: 1px solid #333; color: #888; padding: 6px 10px; cursor: pointer; border-radius: 3px; font-size: 12px; transition: all 0.2s; display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
        .upvote-btn:hover, .upvote-btn.active { border-color: #c0392b; color: #c0392b; }
        .username-tag { font-family: 'Courier New', monospace; background: #1e1e1e; border: 1px solid #333; padding: 2px 7px; border-radius: 3px; font-size: 12px; color: #e0c080; word-break: break-all; }
        .verified-badge { display: inline-flex; align-items: center; gap: 4px; color: #4caf50; font-size: 10px; }
        .spinner { display: inline-block; width: 32px; height: 32px; border: 2px solid #333; border-top-color: #c0392b; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .modal { background: #161616; border: 1px solid #333; border-radius: 6px; padding: 24px; width: 100%; max-width: 420px; max-height: 90vh; overflow-y: auto; }
        .legal-content p { margin-bottom: 14px; }
        .legal-content strong { color: #ccc; }
        .mobile-menu { display: none; }
        .sidebar-ad { display: block; }
        @media (max-width: 640px) {
          .sidebar-ad { display: none !important; }
          .desktop-nav { display: none !important; }
          .mobile-menu { display: flex !important; }
          .main-layout { flex-direction: column !important; }
        }
        @media (min-width: 641px) {
          .mobile-nav-drawer { display: none !important; }
        }
      `}</style>

      {/* Auth Modal */}
      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, marginBottom: 6 }}>
              {authMode === "register" ? "Create Account" : "Sign In"}
            </h2>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 20, lineHeight: 1.6 }}>
              {authMode === "register" ? "Use a pseudonym — never your real name or eBay username." : "Welcome back."}
            </p>
            {authMode === "register" && (
              <div style={{ background: "#1a1a0a", border: "1px solid #333", borderRadius: 3, padding: "10px 14px", marginBottom: 16, fontSize: 11, color: "#888", lineHeight: 1.7 }}>
                ⚠️ <strong style={{ color: "#aaa" }}>Privacy:</strong> Your username appears on posts. Use a pseudonym.
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 5 }}>Username</label>
                <input placeholder="e.g. SellerFromTexas" value={authForm.username} onChange={e => setAuthForm(p => ({ ...p, username: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 5 }}>Password</label>
                <input type="password" placeholder="Min 6 characters" value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleAuth()} />
              </div>
              {authError && <div style={{ fontSize: 12, color: "#c0392b" }}>{authError}</div>}
              <button className="btn-primary" onClick={handleAuth} style={{ padding: "12px", fontSize: 14 }}>
                {authMode === "register" ? "Create Account" : "Sign In"}
              </button>
              <div style={{ textAlign: "center", fontSize: 12, color: "#555" }}>
                {authMode === "register" ? "Already have an account? " : "Don't have an account? "}
                <span style={{ color: "#c0392b", cursor: "pointer" }} onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setAuthError(""); }}>
                  {authMode === "register" ? "Sign in" : "Register"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: "1px solid #2a2a2a", padding: "0 16px", position: "sticky", top: 0, background: "#0d0d0d", zIndex: 100 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 52 }}>
          {/* Logo */}
          <div style={{ cursor: "pointer", paddingTop: 10, paddingBottom: 10 }} onClick={() => navTo("feed")}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: "#e8e0d0", lineHeight: 1.2 }}>
              <span style={{ color: "#c0392b" }}>⚑</span> BuyerBlacklist
            </div>
            <div style={{ fontSize: 8, color: "#444", letterSpacing: "2px", textTransform: "uppercase" }}>The eBay Seller's Record</div>
          </div>

          {/* Desktop Nav */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <span className={`nav-item ${view === "feed" ? "active" : ""}`} onClick={() => navTo("feed")}>Feed</span>
            <span className={`nav-item ${view === "search" ? "active" : ""}`} onClick={() => navTo("search")}>Search</span>
            <span className={`nav-item ${view === "shame" ? "active" : ""}`} onClick={() => navTo("shame")} style={{ color: view === "shame" ? "#e8e0d0" : "#c0392b" }}>💩 Hall of Shame</span>
            <span className={`nav-item ${view === "report" ? "active" : ""}`} onClick={() => navTo("report")}>+ Report</span>
            {session ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8, paddingLeft: 12, borderLeft: "1px solid #222" }}>
                <span style={{ fontSize: 11, color: "#666" }}>👤 {session.username}</span>
                <button className="btn-ghost" onClick={handleLogout} style={{ padding: "4px 10px", fontSize: 11 }}>Sign Out</button>
              </div>
            ) : (
              <button className="btn-ghost" onClick={() => { setShowAuth(true); setAuthMode("register"); }} style={{ marginLeft: 8, fontSize: 12, padding: "5px 12px" }}>Join / Sign In</button>
            )}
          </div>

          {/* Mobile Nav Buttons */}
          <div className="mobile-menu" style={{ alignItems: "center", gap: 8 }}>
            <button className="btn-primary" onClick={() => navTo("report")} style={{ padding: "6px 12px", fontSize: 12 }}>+ Report</button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: "transparent", border: "1px solid #333", color: "#888", padding: "6px 10px", borderRadius: 3, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer" style={{ borderTop: "1px solid #1e1e1e", padding: "12px 0" }}>
            {[["Feed", "feed"], ["Search", "search"], ["💩 Hall of Shame", "shame"]].map(([label, v]) => (
              <div key={v} onClick={() => navTo(v)}
                style={{ padding: "12px 16px", fontSize: 14, color: view === v ? "#e8e0d0" : "#888", borderLeft: view === v ? "2px solid #c0392b" : "2px solid transparent", cursor: "pointer" }}>
                {label}
              </div>
            ))}
            <div style={{ borderTop: "1px solid #1e1e1e", marginTop: 8, paddingTop: 8, padding: "8px 16px" }}>
              {session ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#666" }}>👤 {session.username}</span>
                  <button className="btn-ghost" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ padding: "4px 10px", fontSize: 11 }}>Sign Out</button>
                </div>
              ) : (
                <button className="btn-ghost" onClick={() => { setShowAuth(true); setAuthMode("register"); setMobileMenuOpen(false); }} style={{ width: "100%", fontSize: 13 }}>Join / Sign In</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Top Ad Banner */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "8px 16px 0" }}>
        <AdBanner slot="horizontal" />
      </div>

      {/* Main Layout */}
      <div className="main-layout" style={{ maxWidth: 960, margin: "0 auto", padding: "12px 16px 32px", display: "flex", gap: 20 }}>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* FEED + SEARCH */}
          {(view === "feed" || view === "search") && (
            <>
              <div style={{ marginBottom: 16, position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#555" }}>🔍</span>
                <input placeholder="Search by eBay username..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setView("search"); }} style={{ paddingLeft: 36, fontSize: 14 }} />
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 16, marginBottom: 16, padding: "10px 0", borderBottom: "1px solid #1e1e1e" }}>
                {[["Total Reports", reports.length], ["High Risk", reports.filter(r => r.severity === "high").length], ["Verified", reports.filter(r => r.verified).length]].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#c0392b" }}>{val}</div>
                    <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Category filters — scrollable on mobile */}
              <div style={{ display: "flex", gap: 5, marginBottom: 16, overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setFilterCategory(cat)}
                    style={{ background: filterCategory === cat ? "#c0392b" : "transparent", color: filterCategory === cat ? "white" : "#555", border: `1px solid ${filterCategory === cat ? "#c0392b" : "#222"}`, padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {cat}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <div className="spinner" style={{ margin: "0 auto 16px" }} />
                  <div style={{ fontSize: 13, color: "#555" }}>Loading reports...</div>
                </div>
              ) : error ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#c0392b" }}>{error}</div>
              ) : filteredReports.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#555" }}>No reports found</div>
                  <div style={{ fontSize: 13, marginTop: 8, color: "#444" }}>This username has no reports — looks clean</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {filteredReports.map((r, idx) => (
                    <>
                      <div key={r.id} className="card" style={{ padding: "14px" }}>
                        {/* Top row: username + upvote */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
                            <span className="username-tag">{r.buyerUsername}</span>
                            {r.verified && <span className="verified-badge">✓ Verified</span>}
                          </div>
                          <button className={`upvote-btn ${upvoted[r.id] ? "active" : ""}`} onClick={() => handleUpvote(reports.find(rep => rep.id === r.id) || r)}>
                            ▲ <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700 }}>{r.upvotes}</span>
                          </button>
                        </div>
                        {/* Badges */}
                        <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                          <span className="badge" style={{ background: `${SEVERITIES[r.severity]?.color}22`, color: SEVERITIES[r.severity]?.color, border: `1px solid ${SEVERITIES[r.severity]?.color}44` }}>{SEVERITIES[r.severity]?.label}</span>
                          <span className="badge" style={{ background: "#1e1e1e", color: "#555", border: "1px solid #2a2a2a" }}>{r.category}</span>
                        </div>
                        {/* Title */}
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, marginBottom: 6, cursor: "pointer", lineHeight: 1.3 }}
                          onClick={() => openDetail(reports.find(rep => rep.id === r.id) || r)}>
                          {r.title}
                        </div>
                        {/* Description */}
                        <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 8 }}>
                          {r.description?.length > 120 ? r.description.slice(0, 120) + "..." : r.description}
                        </div>
                        {/* Meta */}
                        <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#444", flexWrap: "wrap" }}>
                          <span>by {r.author}</span>
                          <span>{r.date}</span>
                          <span style={{ cursor: "pointer", color: "#555" }} onClick={() => openDetail(reports.find(rep => rep.id === r.id) || r)}>💬 comments</span>
                          {r.images?.length > 0 && <span>📎 {r.images.length} photo{r.images.length > 1 ? "s" : ""}</span>}
                        </div>
                      </div>
                      {idx === 4 && <AdBanner slot="horizontal" />}
                    </>
                  ))}
                </div>
              )}
            </>
          )}

          {/* DETAIL VIEW */}
          {view === "detail" && selectedReport && (() => {
            const r = norm(selectedReport);
            return (
              <div>
                <button className="btn-ghost" onClick={() => setView("feed")} style={{ marginBottom: 16, fontSize: 13 }}>← Back</button>
                <div className="card" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                    <span className="username-tag" style={{ fontSize: 13 }}>{r.buyerUsername}</span>
                    <span className="badge" style={{ background: `${SEVERITIES[r.severity]?.color}22`, color: SEVERITIES[r.severity]?.color, border: `1px solid ${SEVERITIES[r.severity]?.color}44` }}>{SEVERITIES[r.severity]?.label}</span>
                    <span className="badge" style={{ background: "#1e1e1e", color: "#555", border: "1px solid #2a2a2a" }}>{r.category}</span>
                    {r.verified && <span className="verified-badge">✓ Verified</span>}
                  </div>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, marginBottom: 12, lineHeight: 1.3 }}>{r.title}</h1>
                  <p style={{ fontSize: 14, color: "#999", lineHeight: 1.9, marginBottom: 16 }}>{r.description}</p>
                  {r.images?.length > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                      {r.images.map((url, i) => <a key={i} href={url} target="_blank" rel="noreferrer"><img src={url} alt={`Evidence ${i + 1}`} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 4, border: "1px solid #333" }} /></a>)}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 12, alignItems: "center", paddingTop: 12, borderTop: "1px solid #1e1e1e", flexWrap: "wrap" }}>
                    <button className={`upvote-btn ${upvoted[r.id] ? "active" : ""}`} onClick={() => handleUpvote(selectedReport)} style={{ padding: "8px 16px" }}>
                      ▲ Corroborate · {r.upvotes}
                    </button>
                    <span style={{ fontSize: 11, color: "#444" }}>Posted by {r.author} · {r.date}</span>
                  </div>
                </div>
                <AdBanner slot="horizontal" />
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, marginBottom: 12, color: "#666" }}>Community Responses — {comments.length}</h3>
                  {comments.map(c => (
                    <div key={c.id} className="card" style={{ padding: "12px 14px", marginBottom: 8 }}>
                      <div style={{ fontSize: 13, color: "#999", lineHeight: 1.7 }}>{c.text}</div>
                      <div style={{ fontSize: 11, color: "#444", marginTop: 6 }}>by {c.author} · {c.created_at?.split("T")[0]}</div>
                    </div>
                  ))}
                  {session ? (
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      <input placeholder="Share your experience..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddComment(r.id)} />
                      <button className="btn-primary" onClick={() => handleAddComment(r.id)} style={{ whiteSpace: "nowrap" }}>Post</button>
                    </div>
                  ) : (
                    <div style={{ marginTop: 12, textAlign: "center", padding: "14px", background: "#111", border: "1px solid #222", borderRadius: 3, fontSize: 13, color: "#555" }}>
                      <span style={{ color: "#c0392b", cursor: "pointer" }} onClick={() => setShowAuth(true)}>Sign in</span> to add a comment
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* REPORT VIEW */}
          {view === "report" && (
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, marginBottom: 6 }}>File a Report</h1>
              <p style={{ color: "#555", fontSize: 13, marginBottom: 20, lineHeight: 1.7 }}>Share your experience. Be factual — false reports may expose you to legal liability.</p>
              {!session && (
                <div style={{ background: "#1a100a", border: "1px solid #3a1a0a", padding: "12px 14px", borderRadius: 3, marginBottom: 16, fontSize: 13, color: "#888" }}>
                  <span style={{ color: "#c0392b", cursor: "pointer" }} onClick={() => setShowAuth(true)}>Sign in or create an account</span> to file a report.
                </div>
              )}
              {submitSuccess && <div style={{ background: "#0d2e0d", border: "1px solid #2d6a2d", padding: "12px", borderRadius: 3, marginBottom: 16, color: "#4caf50", fontSize: 13 }}>✓ Report published. Redirecting...</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 5 }}>Bad Buyer Username *</label>
                  <input placeholder="e.g. bargainhunter99" value={newReport.buyerUsername} onChange={e => setNewReport(p => ({ ...p, buyerUsername: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 5 }}>Report Title *</label>
                  <input placeholder="Brief summary of what happened" value={newReport.title} onChange={e => setNewReport(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 5 }}>Category</label>
                  <select value={newReport.category} onChange={e => setNewReport(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 5 }}>Risk Level</label>
                  <select value={newReport.severity} onChange={e => setNewReport(p => ({ ...p, severity: e.target.value }))}>
                    <option value="high">High Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="low">Low Risk</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 5 }}>Your Account *</label>
                  <textarea placeholder="Describe exactly what happened. Include dates, amounts, and eBay's response. Be factual." value={newReport.description} onChange={e => setNewReport(p => ({ ...p, description: e.target.value }))} rows={5} style={{ resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 5 }}>Screenshots / Evidence (optional)</label>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: "2px dashed #222", borderRadius: 4, padding: "16px", cursor: "pointer", color: "#555", fontSize: 13 }}>
                    <span style={{ fontSize: 20 }}>📎</span>
                    <span>Upload screenshots or photos<br /><span style={{ fontSize: 11, color: "#444" }}>PNG, JPG, GIF up to 10MB</span></span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: "none" }} />
                  </label>
                  {uploadedImages.length > 0 && (
                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      {uploadedImages.map((img, i) => (
                        <div key={i} style={{ position: "relative", width: 64, height: 64 }}>
                          <img src={img.url} alt={img.name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 3, border: "1px solid #333" }} />
                          <button onClick={() => removeImage(i)} style={{ position: "absolute", top: -5, right: -5, background: "#c0392b", border: "none", color: "white", borderRadius: "50%", width: 18, height: 18, cursor: "pointer", fontSize: 10 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", padding: "10px 12px", borderRadius: 3, fontSize: 11, color: "#444", lineHeight: 1.8 }}>
                  By submitting you confirm this is your honest, firsthand account. See our <span style={{ color: "#666", cursor: "pointer", textDecoration: "underline" }} onClick={() => setView("disclaimer")}>full disclaimer</span>.
                </div>
                <button className="btn-primary" onClick={handleSubmitReport} disabled={submitting || !session} style={{ padding: "13px", fontSize: 14 }}>
                  {submitting ? (uploadingImages ? "Uploading images..." : "Publishing...") : "Publish Report"}
                </button>
              </div>
            </div>
          )}

          {/* HALL OF SHAME */}
          {view === "shame" && (() => {
            const byBuyer = {};
            reports.forEach(r => {
              const key = r.buyer_username || r.buyerUsername;
              if (!byBuyer[key]) byBuyer[key] = { username: key, reportCount: 0, totalUpvotes: 0, categories: new Set(), highCount: 0 };
              byBuyer[key].reportCount++; byBuyer[key].totalUpvotes += r.upvotes || 0;
              byBuyer[key].categories.add(r.category);
              if (r.severity === "high") byBuyer[key].highCount++;
            });
            const ranked = Object.values(byBuyer).sort((a, b) => (b.reportCount * 10 + b.totalUpvotes) - (a.reportCount * 10 + a.totalUpvotes));
            const Poop = ({ size = 40 }) => <span style={{ fontSize: size }}>💩</span>;
            return (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, marginBottom: 4 }}>💩 Hall of Shame</h1>
                  <p style={{ color: "#555", fontSize: 13 }}>Most reported & corroborated bad buyers.</p>
                </div>
                {/* Podium */}
                <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "flex-end" }}>
                  {[ranked[1], ranked[0], ranked[2]].map((buyer, i) => {
                    if (!buyer) return null;
                    const heights = ["120px", "155px", "105px"]; const pos = [2, 1, 3];
                    return (
                      <div key={buyer.username} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ marginBottom: 6 }}>
                          <Poop size={i === 1 ? 36 : 26} />
                          <div style={{ fontFamily: "'Courier New', monospace", fontSize: i === 1 ? 11 : 10, color: "#e0c080", background: "#1e1e1e", border: "1px solid #333", padding: "2px 6px", borderRadius: 3, display: "inline-block", marginTop: 3, wordBreak: "break-all" }}>{buyer.username}</div>
                          <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{buyer.reportCount}r · {buyer.totalUpvotes}v</div>
                        </div>
                        <div style={{ height: heights[i], background: i === 1 ? "#3a0a0a" : "#1e1212", border: `1px solid ${i === 1 ? "#c0392b" : "#2a1a1a"}`, borderRadius: "4px 4px 0 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: i === 1 ? 22 : 17, fontWeight: 900, color: i === 1 ? "#c0392b" : "#662222" }}>#{pos[i]}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {ranked.map((buyer, idx) => (
                    <div key={buyer.username} className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                      onClick={() => { setSearchQuery(buyer.username); setView("search"); }}>
                      <div style={{ width: 24, textAlign: "center", fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 900, color: idx < 3 ? "#c0392b" : "#333", flexShrink: 0 }}>
                        {idx < 3 ? <Poop size={18} /> : `#${idx + 1}`}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="username-tag">{buyer.username}</span>
                        <div style={{ fontSize: 11, color: "#444", marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ color: "#c0392b" }}>⚑ {buyer.reportCount} reports</span>
                          <span>▲ {buyer.totalUpvotes} votes</span>
                          {buyer.highCount > 0 && <span style={{ color: "#ff4444" }}>🔴 {buyer.highCount} high-risk</span>}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: "#333", flexShrink: 0 }}>→</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* DISCLAIMER PAGE */}
          {view === "disclaimer" && (
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Disclaimer & Legal Notice</h1>
              <div style={{ fontSize: 11, color: "#444", marginBottom: 24 }}>Last updated: May 2026</div>
              <div className="legal-content">
                <Section title="User-Generated Content Platform">
                  <p>BuyerBlacklist.com is an interactive computer service and public forum. All content published on this platform is authored exclusively by third-party users. BuyerBlacklist.com does not create, author, or initiate any of the content posted by its users.</p>
                </Section>
                <Section title="Section 230 — Communications Decency Act">
                  <p>This platform operates under the protections afforded by <strong>47 U.S.C. § 230 of the Communications Decency Act</strong>, which provides that: "No provider or user of an interactive computer service shall be treated as the publisher or speaker of any information provided by another information content provider."</p>
                  <p>This protection has been consistently upheld in federal courts, including <strong>Zeran v. America Online, Inc., 129 F.3d 327 (4th Cir. 1997)</strong>.</p>
                </Section>
                <Section title="No Endorsement or Verification">
                  <p>BuyerBlacklist.com does not verify, endorse, guarantee, or warrant the accuracy of any user-submitted content. The appearance of a username on this platform does not constitute a finding of fact or legal determination.</p>
                </Section>
                <Section title="User Responsibility">
                  <p>By posting content, users represent that the content is their honest, firsthand account and they accept full legal responsibility for what they publish. Users who post false content may be subject to civil liability.</p>
                </Section>
                <Section title="Content Removal Requests">
                  <p>Submit written removal requests to <strong>legal@badbuyerblacklist.com</strong> with the URL, your identity, explanation of why it's false, and supporting documentation.</p>
                </Section>
                <Section title="Limitation of Liability">
                  <p>To the maximum extent permitted by law, BuyerBlacklist.com and its operators shall not be liable for any damages arising from your use of this platform.</p>
                </Section>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY PAGE */}
          {view === "privacy" && (
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Privacy Policy</h1>
              <div style={{ fontSize: 11, color: "#444", marginBottom: 24 }}>Last updated: May 2026</div>
              <div className="legal-content">
                <Section title="Information We Collect">
                  <p><strong>Account information:</strong> Username and hashed password. Use a pseudonym.</p>
                  <p><strong>Content you post:</strong> Reports, comments, and images stored with your username.</p>
                  <p><strong>Technical data:</strong> Standard server logs for security purposes.</p>
                  <p><strong>Cookies:</strong> Minimal cookies for session management and Google AdSense advertising.</p>
                </Section>
                <Section title="How We Use Your Information">
                  <p>To operate the platform, associate posts with usernames, prevent abuse, and improve the service. We do not sell your personal information.</p>
                </Section>
                <Section title="Advertising — Google AdSense">
                  <p>This site uses Google AdSense (<strong>Publisher ID: {ADSENSE_PUB}</strong>). Google uses cookies to serve personalized ads. Opt out at <strong>www.aboutads.info</strong>.</p>
                </Section>
                <Section title="Data Retention">
                  <p>Content retained indefinitely unless deletion is requested at <strong>privacy@badbuyerblacklist.com</strong>.</p>
                </Section>
                <Section title="Contact">
                  <p>Privacy: <strong>privacy@badbuyerblacklist.com</strong><br />Legal: <strong>legal@badbuyerblacklist.com</strong></p>
                </Section>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Ad — desktop only */}
        <div className="sidebar-ad" style={{ width: 180, flexShrink: 0, paddingTop: 4 }}>
          <div style={{ background: "#0f0f0f", border: "1px dashed #222", borderRadius: 4, padding: 12, textAlign: "center", minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 9, color: "#2a2a2a", textTransform: "uppercase", letterSpacing: "1px" }}>Advertisement</div>
            <ins className="adsbygoogle"
              style={{ display: "block", width: 160, height: 600 }}
              data-ad-client={ADSENSE_PUB}
              data-ad-slot="1122334455"
              data-ad-format="vertical" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #111", padding: "16px", textAlign: "center" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 8, flexWrap: "wrap" }}>
            {[["Privacy Policy", "privacy"], ["Disclaimer", "disclaimer"], ["Terms of Use", "disclaimer"]].map(([label, target]) => (
              <span key={label} style={{ fontSize: 11, color: "#444", cursor: "pointer", textDecoration: "underline" }} onClick={() => navTo(target)}>{label}</span>
            ))}
            <a href="mailto:legal@badbuyerblacklist.com" style={{ fontSize: 11, color: "#444" }}>legal@badbuyerblacklist.com</a>
          </div>
          <div style={{ fontSize: 10, color: "#2a2a2a", letterSpacing: "1px", lineHeight: 1.8 }}>
            BUYERBLACKLIST.COM · ALL CONTENT IS USER-GENERATED<br />
            47 U.S.C. § 230 · © {new Date().getFullYear()} BADBUYERBLACKLIST.COM
          </div>
        </div>
      </div>
    </div>
  );
}
