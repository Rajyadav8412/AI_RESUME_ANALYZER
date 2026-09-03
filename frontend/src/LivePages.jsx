import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileText, Lightbulb, Plus, UploadCloud, WandSparkles, XCircle } from "lucide-react";
import api from "./services/api";
import { ScoreRing } from "./components/ui/ScoreRing";

const roles = [
  "Python Developer", "Frontend Developer", "Backend Developer",
  "Full Stack Developer", "Data Analyst", "Data Scientist",
  "Machine Learning Engineer", "Software Engineer", "DevOps Engineer",
  "Cybersecurity Analyst", "UI/UX Designer", "Product Manager", "Other / General",
];

function PageTitle({ eyebrow, title, children }) {
  return <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm text-cyan">{eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight">{title}</h1></div>{children}</div>;
}

function Insight({ title, items = [], kind }) {
  const Icon = kind === "good" ? CheckCircle2 : kind === "bad" ? XCircle : Lightbulb;
  const color = kind === "good" ? "text-emerald-400" : kind === "bad" ? "text-rose-400" : "text-amber-300";
  return <div className="card"><h3 className="mb-4 flex items-center gap-2 font-medium"><Icon size={18} className={color}/>{title}</h3>{items.length ? <ul className="space-y-3">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-5 text-slate-400"><span className={color}>•</span>{item}</li>)}</ul> : <p className="text-sm text-slate-500">No detailed feedback is available for this older analysis.</p>}</div>;
}

function normalise(data) {
  const ai = data?.ai_analysis || {};
  const fallback = data?.analysis || {};
  return {
    score: Number.isFinite(ai.ats_score) ? ai.ats_score : (fallback.overall_score ?? 0),
    role: data?.target_role || ai.target_role || "General role",
    summary: ai.summary || "Your analysis is ready.",
    roleMatch: ai.role_match || "This score reflects your resume's current fit for the selected role.",
    strengths: ai.strengths?.length ? ai.strengths : (fallback.strengths || []),
    weaknesses: ai.weaknesses?.length ? ai.weaknesses : (fallback.weaknesses || []),
    suggestions: ai.suggestions?.length ? ai.suggestions : (fallback.suggestions || []),
    skills: data?.skills || data?.resume_data?.skills || [],
    keywords: ai.missing_keywords || [],
    breakdown: ai.score_breakdown || {},
  };
}

function labelFor(score) {
  if (score >= 80) return "Strong match";
  if (score >= 65) return "Promising foundation";
  if (score >= 45) return "Needs targeted improvements";
  return "Needs substantial improvement";
}

async function latestAnalysis() {
  const history = await api.get("/analysis/history/");
  if (!history.data.length) return null;
  const detail = await api.get(`/analysis/history/${history.data[0].id}/`);
  localStorage.setItem("latest_analysis", JSON.stringify(detail.data));
  return detail.data;
}

export function LiveDashboard() {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => { latestAnalysis().then(setLatest).catch(() => setLatest(null)).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="card text-slate-400">Loading your latest analysis...</div>;
  if (!latest) return <><PageTitle eyebrow={`Welcome back, ${user.username || "there"}`} title="Your resume, at a glance"><Link className="btn-primary" to="/upload"><Plus size={17}/>Upload new resume</Link></PageTitle><div className="card text-center"><FileText className="mx-auto text-cyan" size={32}/><h2 className="mt-4 text-xl font-semibold">No resume analysis yet</h2><p className="mt-2 text-sm text-slate-400">Upload a PDF and select a target role for personalized feedback.</p><Link to="/upload" className="btn-primary mt-5">Upload your resume</Link></div></>;
  const item = normalise(latest);
  const breakdown = Object.entries(item.breakdown);
  return <><PageTitle eyebrow={`Welcome back, ${user.username || "there"}`} title="Your resume, at a glance"><Link className="btn-primary" to="/upload"><Plus size={17}/>Upload new resume</Link></PageTitle><section className="mb-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><div className="card"><p className="text-sm text-slate-400">Latest ATS score · {item.role}</p><div className="mt-3 flex flex-wrap items-center gap-7"><ScoreRing score={item.score}/><div><h2 className="text-2xl font-semibold">{labelFor(item.score)}</h2><p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">{item.roleMatch}</p><Link to="/analysis" className="mt-4 inline-flex items-center gap-1 text-sm text-cyan">View full analysis <ArrowRight size={15}/></Link></div></div></div><div className="card"><p className="text-sm text-slate-400">Score breakdown</p><div className="mt-6 space-y-4">{breakdown.length ? breakdown.map(([name, value]) => <div key={name}><div className="mb-2 flex justify-between text-sm"><span className="capitalize">{name.replaceAll("_", " ")}</span><span className="text-cyan">{value}%</span></div><div className="h-2 rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-cyan to-blue" style={{width:`${value}%`}}/></div></div>) : <p className="text-sm text-slate-500">Detailed scoring becomes available for new role-specific analyses.</p>}</div></div></section><section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"><Insight title="Top strengths" items={item.strengths} kind="good"/><Insight title="Needs attention" items={item.weaknesses} kind="bad"/><Insight title="Next best steps" items={item.suggestions} kind="idea"/></section><section className="card"><h2 className="font-semibold">Detected skills</h2><div className="mt-4 flex flex-wrap gap-2">{item.skills.length ? item.skills.map(skill => <span key={skill} className="rounded-lg border border-cyan/15 bg-cyan/5 px-3 py-2 text-sm text-cyan">{skill}</span>) : <p className="text-sm text-slate-500">No skills detected.</p>}</div></section></>;
}

export function LiveUpload() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [role, setRole] = useState("Python Developer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const chooseFile = (event) => {
    const selected = event.target.files?.[0];

    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setFile(null);
      setError("Please select a PDF resume.");
      return;
    }

    setFile(selected);
    setError("");
  };

  const upload = async () => {
    if (!file) {
      setError("Please choose your PDF resume first.");
      return;
    }

    setLoading(true);
    setProgress(5);
    setError("");

    let progressInterval;

    try {
      const body = new FormData();
      body.append("resume", file);

      // Simulated progress while the backend processes the resume.
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return 95;

          if (prev < 25) return prev + 3;
          if (prev < 50) return prev + 2;
          if (prev < 75) return prev + 1;
          if (prev < 90) return prev + 0.5;

          return prev + 0.2;
        });
      }, 800);

      // Step 1: Upload resume
      await api.post("/resumes/upload/", body, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Step 2: Analyze resume
      const result = await api.post(
        "/analysis/extract-text/",
        {
          target_role: role,
        }
      );

      // Backend finished successfully
      clearInterval(progressInterval);
      setProgress(100);

      localStorage.setItem(
        "latest_analysis",
        JSON.stringify(result.data)
      );

      // Let the user see the completed 100% state briefly.
      await new Promise((resolve) => setTimeout(resolve, 700));

      navigate("/analysis");

    } catch (err) {
      clearInterval(progressInterval);

      const data = err.response?.data;

      setError(
        data?.error ||
        Object.values(data || {}).flat().join(" ") ||
        "Upload failed. Please try again."
      );

      setProgress(0);

    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="Role-specific resume analysis"
        title="Upload your resume"
      />

      <div className="mx-auto max-w-3xl">

        {/* Role selection */}
        <div className="card mb-5">
          <label htmlFor="target-role" className="label">
            Which role are you applying for?
          </label>

          <select
            id="target-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            disabled={loading}
            className="input"
          >
            {roles.map((roleName) => (
              <option key={roleName}>{roleName}</option>
            ))}
          </select>

          <p className="mt-2 text-xs text-slate-500">
            The AI will assess your resume against the selected role’s
            skills, keywords and projects.
          </p>
        </div>

        {/* Upload card */}
        <div className="card border-dashed border-cyan/30 py-14 text-center">

          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cyan/10 text-cyan">
            <UploadCloud size={29} />
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            {file?.name || "Drop your resume here"}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            PDF only, up to 10 MB
          </p>

          {/* Choose PDF */}
          <label
            className={`btn-primary mt-6 ${
              loading ? "pointer-events-none opacity-50" : "cursor-pointer"
            }`}
          >
            Choose PDF

            <input
              type="file"
              className="hidden"
              accept=".pdf,application/pdf"
              onChange={chooseFile}
              disabled={loading}
            />
          </label>

          {/* Analyze button */}
          {file && (
            <button
              type="button"
              onClick={upload}
              disabled={loading}
              className="btn-primary ml-3 mt-6"
            >
              {loading ? "Processing..." : "Upload and analyze"}

              {loading ? (
                <span className="ml-1 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <WandSparkles size={17} />
              )}
            </button>
          )}

          {/* Processing UI */}
          {loading && (
            <div className="mx-auto mt-8 max-w-xl text-left">

              <div className="mb-3 flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-white">
                    Analyzing your resume
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {progress < 20 &&
                      "Uploading your resume..."}

                    {progress >= 20 &&
                      progress < 40 &&
                      "Reading your resume content..."}

                    {progress >= 40 &&
                      progress < 60 &&
                      "Extracting skills and experience..."}

                    {progress >= 60 &&
                      progress < 80 &&
                      "Evaluating your profile with AI..."}

                    {progress >= 80 &&
                      progress < 95 &&
                      "Generating personalized recommendations..."}

                    {progress >= 95 &&
                      "Finalizing your analysis..."}
                  </p>
                </div>

                <span className="text-sm font-semibold text-cyan-300">
                  {Math.round(progress)}%
                </span>

              </div>

              {/* Progress bar */}
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              {/* Processing indicator */}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

                <span>
                  This may take a moment while AI reviews your resume.
                </span>
              </div>

            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mx-auto mt-5 max-w-md rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </p>
          )}

        </div>
      </div>
    </>
  );
}

export function LiveAnalysis() {
  const item = useMemo(() => normalise(JSON.parse(localStorage.getItem("latest_analysis") || "{}")), []);
  return <><PageTitle eyebrow={`Analysis for ${item.role}`} title="Resume analysis"><Link to="/upload" className="btn-secondary"><UploadCloud size={16}/>Analyze another</Link></PageTitle><div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><aside className="space-y-5"><div className="card text-center"><ScoreRing score={item.score} size={168}/><h2 className="mt-3 text-xl font-semibold">{labelFor(item.score)}</h2><p className="mt-2 text-sm text-slate-400">{item.roleMatch}</p></div><div className="card"><p className="text-sm text-slate-400">Role-specific summary</p><p className="mt-3 text-sm leading-6 text-slate-300">{item.summary}</p></div>{item.keywords.length > 0 && <div className="card"><p className="text-sm text-slate-400">Missing keywords to consider</p><div className="mt-3 flex flex-wrap gap-2">{item.keywords.map(keyword => <span key={keyword} className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2.5 py-1.5 text-xs text-amber-200">{keyword}</span>)}</div></div>}</aside><div className="space-y-5"><Insight title="Your strengths" items={item.strengths} kind="good"/><Insight title="Opportunities to improve" items={item.weaknesses} kind="bad"/><Insight title="AI recommendations" items={item.suggestions} kind="idea"/></div></div></>;
}

export function LiveProfile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user.username || "User";
  const initials = name.split(" ").map(word => word[0]).join("").slice(0, 2).toUpperCase();
  return <><PageTitle eyebrow="Account" title="Your profile"/><div className="grid max-w-4xl gap-5 md:grid-cols-[.65fr_1.35fr]"><div className="card text-center"><div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-cyan/30 to-blue/30 text-2xl font-bold text-cyan">{initials}</div><h2 className="mt-4 font-semibold">{name}</h2><p className="mt-1 text-sm text-slate-500">ResumeIQ member</p></div><div className="card"><h2 className="mb-5 font-semibold">Personal information</h2><label className="block"><span className="label">Username</span><input className="input" value={name} readOnly/></label><label className="mt-4 block"><span className="label">Email address</span><input className="input" value={user.email || "No email available"} readOnly/></label><p className="mt-5 text-sm text-slate-500">Profile editing will be available after the profile-update API is added.</p></div></div></>;
}
