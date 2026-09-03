import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import api from "./services/api";
import { LiveAnalysis, LiveDashboard, LiveProfile, LiveUpload } from "./LivePages";

import { AppShell } from './components/AppShell'; import { AuthLayout } from './components/AuthLayout'; import { Button } from './components/ui/Button'; import { ScoreRing } from './components/ui/ScoreRing'
import { ArrowRight, CheckCircle2, ChevronRight, FileText, Lightbulb, Plus, UploadCloud, WandSparkles, XCircle, BarChart3, Search, Calendar, ArrowUpRight, LockKeyhole, Bell, UserRound, GitCompare } from 'lucide-react'
const tags = ['Python','Django','React','SQL','REST APIs','Git']; const analysis={score:86,summary:'A focused Computer Science student with solid foundations in Python, web development, and problem-solving. Your profile is strongest when it highlights measurable project outcomes.',strengths:['Clear education progression','Relevant technical skills','Concise, readable structure'],weaknesses:['Projects lack impact metrics','Missing GitHub / portfolio links','Few action-oriented verbs'],suggestions:['Add measurable outcomes to your AI Resume Analyzer project.','Include direct links to your GitHub and LinkedIn.','Tailor your professional summary to the target role.']}
function PageTitle({eyebrow,title,children}){return <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm text-cyan">{eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight">{title}</h1></div>{children}</div>}
function Insight({title,items,kind}) { const Icon=kind==='good'?CheckCircle2:kind==='bad'?XCircle:Lightbulb; const color=kind==='good'?'text-emerald-400':kind==='bad'?'text-rose-400':'text-amber-300'; return <div className="card"><h3 className="mb-4 flex items-center gap-2 font-medium"><Icon size={18} className={color}/>{title}</h3><ul className="space-y-3">{items.map(x=><li key={x} className="flex gap-2 text-sm leading-5 text-slate-400"><span className={color}>•</span>{x}</li>)}</ul></div>}
function Dashboard(){return <><PageTitle eyebrow="Welcome back, Raj" title="Your resume, at a glance"><Link className="btn-primary" to="/upload"><Plus size={17}/>Upload new resume</Link></PageTitle><section className="mb-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><div className="card relative overflow-hidden"><div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan/15 blur-3xl"/><p className="text-sm text-slate-400">Latest ATS score</p><div className="mt-3 flex flex-wrap items-center gap-7"><ScoreRing score={analysis.score}/><div><h2 className="text-2xl font-semibold">Great foundation!</h2><p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">Your resume is above average. A few targeted improvements can make it much more competitive.</p><Link to="/analysis" className="mt-4 inline-flex items-center gap-1 text-sm text-cyan">View full analysis <ArrowRight size={15}/></Link></div></div></div><div className="card"><div className="flex items-center justify-between"><p className="text-sm text-slate-400">Resume health</p><BarChart3 className="text-cyan" size={19}/></div><div className="mt-6 space-y-4">{[['Content quality',88],['ATS compatibility',86],['Skills alignment',80]].map(([n,v])=><div key={n}><div className="mb-2 flex justify-between text-sm"><span>{n}</span><span className="text-cyan">{v}%</span></div><div className="h-2 rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-cyan to-blue" style={{width:`${v}%`}}/></div></div>)}</div></div></section><section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"><Insight title="Top strengths" items={analysis.strengths} kind="good"/><Insight title="Needs attention" items={analysis.weaknesses} kind="bad"/><Insight title="Next best steps" items={analysis.suggestions} kind="idea"/></section><section className="card"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Key skills</h2><p className="mt-1 text-sm text-slate-400">Detected from your latest resume</p></div><Link to="/history" className="btn-secondary text-xs">View history <ChevronRight size={15}/></Link></div><div className="flex flex-wrap gap-2">{tags.map(t=><span key={t} className="rounded-lg border border-cyan/15 bg-cyan/5 px-3 py-2 text-sm text-cyan">{t}</span>)}</div></section></>}
function Upload() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setSelectedFile(null);
      setError("Please select a PDF resume.");
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please choose your PDF resume first.");
      return;
    }

    setUploading(true);
    setProgress(5);
    setError("");

    let progressInterval;

    try {
      const formData = new FormData();

      formData.append("resume", selectedFile);

      // Smooth simulated progress while backend processes the resume
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

      // Step 1: Upload resume to Django
      await api.post("/resumes/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Step 2: Extract resume and generate AI analysis
      const analysisResponse = await api.get(
        "/analysis/extract-text/"
      );

      // Backend completed successfully
      clearInterval(progressInterval);
      setProgress(100);

      // Save response temporarily
      localStorage.setItem(
        "latest_analysis",
        JSON.stringify(analysisResponse.data)
      );

      // Small delay so user can actually see 100%
      setTimeout(() => {
        navigate("/analysis");
      }, 500);

    } catch (err) {
      clearInterval(progressInterval);

      const backendError = err.response?.data;

      if (backendError?.error) {
        setError(backendError.error);
      } else if (backendError) {
        setError(Object.values(backendError).flat().join(" "));
      } else {
        setError(
          "Upload failed. Ensure Django is running and you are logged in."
        );
      }

      setProgress(0);

    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <PageTitle eyebrow="Resume analysis" title="Upload your resume" />

      <div className="mx-auto max-w-3xl">
        <div className="card border-dashed border-cyan/30 py-14 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cyan/10 text-cyan">
            <UploadCloud size={29} />
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            {selectedFile ? selectedFile.name : "Drop your resume here"}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            PDF only, up to 10 MB
          </p>

          <label className="btn-primary mt-6 cursor-pointer">
            Choose PDF
            <input
              type="file"
              className="hidden"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
            />
          </label>

          {selectedFile && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary ml-3 mt-6"
            >
              {uploading ? "Processing..." : "Upload and analyze"}
              {uploading ? (
                <span className="ml-1 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <WandSparkles size={17} />
              )}
            </button>
          )}

          {uploading && (
            <div className="mx-auto mt-8 max-w-xl text-left">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    Analyzing your resume
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {progress < 20 && "Uploading your resume..."}
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

              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                This may take a moment while AI reviews your resume.
              </div>
            </div>
          )}

          {error && (
            <p className="mx-auto mt-5 max-w-md rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </p>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            ["1", "Upload", "Select your current resume"],
            ["2", "Analyze", "AI extracts key details"],
            ["3", "Improve", "Apply focused feedback"],
          ].map(([number, title, description]) => (
            <div key={number} className="card p-4">
              <span className="text-cyan">0{number}</span>
              <h3 className="mt-2 font-medium">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
function Analysis(){return <><PageTitle eyebrow="Latest analysis" title="Software Engineer Resume"><Link to="/upload" className="btn-secondary"><UploadCloud size={16}/>Analyze another</Link></PageTitle><div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><aside className="space-y-5"><div className="card text-center"><ScoreRing score={86} size={168}/><h2 className="mt-3 text-xl font-semibold">Strong candidate</h2><p className="mt-2 text-sm text-slate-400">Better than 72% of analyzed resumes</p></div><div className="card"><p className="text-sm text-slate-400">Resume summary</p><p className="mt-3 text-sm leading-6 text-slate-300">{analysis.summary}</p></div></aside><div className="space-y-5"><Insight title="Your strengths" items={analysis.strengths} kind="good"/><Insight title="Opportunities to improve" items={analysis.weaknesses} kind="bad"/><Insight title="AI recommendations" items={analysis.suggestions} kind="idea"/></div></div></>}
function History() {
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingId, setOpeningId] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await api.get("/analysis/history/");
        setAnalyses(response.data);
      } catch (err) {
        setError("Could not load your analysis history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const openAnalysis = async (analysisId) => {
    setOpeningId(analysisId);
    setError("");

    try {
      const response = await api.get(`/analysis/history/${analysisId}/`);

      // We will use this in the Analysis page.
      localStorage.setItem(
        "latest_analysis",
        JSON.stringify(response.data)
      );

      navigate("/analysis");
    } catch (err) {
      setError("Could not open this analysis.");
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <>
      <PageTitle eyebrow="Your workspace" title="Analysis history">
        <Link to="/upload" className="btn-primary">
          <Plus size={16} />
          New analysis
        </Link>
      </PageTitle>

      {loading && (
        <div className="card text-center text-slate-400">
          Loading your analysis history...
        </div>
      )}

      {error && (
        <div className="card border-rose-500/30 text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && analyses.length === 0 && (
        <div className="card text-center">
          <FileText className="mx-auto text-cyan" size={30} />
          <h2 className="mt-4 text-lg font-semibold">No analyses yet</h2>
          <p className="mt-2 text-sm text-slate-400">
            Upload your first resume to see its analysis here.
          </p>
          <Link to="/upload" className="btn-primary mt-5">
            Upload resume
          </Link>
        </div>
      )}

      {!loading && analyses.length > 0 && (
        <div className="card overflow-hidden p-0">
          {analyses.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openAnalysis(item.id)}
              className="flex w-full items-center gap-4 border-b border-white/5 p-5 text-left transition hover:bg-white/[.03]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue/10 text-blue">
                <FileText size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium">Resume analysis #{item.id}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(item.created_at).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-sm text-slate-500">ATS score</p>
                <p className="font-semibold text-cyan">
                  {item.ats_score ?? "—"}/100
                </p>
              </div>

              {openingId === item.id ? (
                <span className="text-sm text-cyan">Opening...</span>
              ) : (
                <ChevronRight className="text-slate-600" size={18} />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
function Compare() {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadComparison = async () => {
      try {
        const response = await api.get("/analysis/compare/");
        setComparison(response.data);
      } catch (err) {
        const message = err.response?.data?.error;

        setError(
          message ||
            "Could not compare resumes. Upload and analyze at least two resumes first."
        );
      } finally {
        setLoading(false);
      }
    };

    loadComparison();
  }, []);

  return (
    <>
      <PageTitle
        eyebrow="Make a smarter choice"
        title="Compare resumes"
      />

      {loading && (
        <div className="card text-center text-slate-400">
          Comparing your latest resumes...
        </div>
      )}

      {error && (
        <div className="card text-center">
          <GitCompare className="mx-auto text-cyan" size={30} />
          <h2 className="mt-4 text-lg font-semibold">
            Comparison unavailable
          </h2>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <Link to="/upload" className="btn-primary mt-5">
            Upload another resume
          </Link>
        </div>
      )}

      {comparison && (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="card">
              <p className="text-sm text-slate-400">Previous resume</p>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Previous analysis
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Your earlier saved resume
                  </p>
                </div>

                <ScoreRing score={comparison.old_score ?? 0} size={100} />
              </div>
            </div>

            <div className="card border-cyan/25">
              <p className="text-sm text-cyan">Latest resume</p>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Latest analysis
                  </h2>

                  <p className="mt-1 flex items-center gap-1 text-sm text-emerald-400">
                    <ArrowUpRight size={15} />
                    {comparison.score_improvement >= 0 ? "+" : ""}
                    {comparison.score_improvement} points
                  </p>
                </div>

                <ScoreRing score={comparison.new_score ?? 0} size={100} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="card">
              <h2 className="font-semibold">Skills added</h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {comparison.skills_added.length > 0 ? (
                  comparison.skills_added.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300"
                    >
                      + {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No new skills were detected.
                  </p>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold">Skills removed</h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {comparison.skills_removed.length > 0 ? (
                  comparison.skills_removed.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-300"
                    >
                      − {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No skills were removed.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card mt-5">
            <h2 className="font-semibold">Comparison insight</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {comparison.summary}
            </p>
          </div>
        </>
      )}
    </>
  );
}
function Profile() {
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const displayName = currentUser.username || "User";
  const email = currentUser.email || "No email available";

  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <PageTitle eyebrow="Account" title="Your profile" />

      <div className="grid max-w-4xl gap-5 md:grid-cols-[.65fr_1.35fr]">
        <div className="card text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-cyan/30 to-blue/30 text-2xl font-bold text-cyan">
            {initials}
          </div>

          <h2 className="mt-4 font-semibold">{displayName}</h2>

          <p className="mt-1 text-sm text-slate-500">
            ResumeIQ member
          </p>

          <Button variant="secondary" className="mt-5">
            Change photo
          </Button>
        </div>

        <div className="card">
          <h2 className="mb-5 font-semibold">Personal information</h2>

          <div className="space-y-4">
            <label className="block">
              <span className="label">Username</span>
              <input
                className="input"
                value={displayName}
                readOnly
              />
            </label>

            <label className="block">
              <span className="label">Email address</span>
              <input
                className="input"
                value={email}
                readOnly
              />
            </label>

            <label className="block">
              <span className="label">Headline</span>
              <input
                className="input"
                value="Aspiring Python Developer"
                readOnly
              />
            </label>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Profile editing will be enabled after we add Django’s profile-update API.
          </p>
        </div>
      </div>
    </>
  );
}
function Settings(){return <><PageTitle eyebrow="Account preferences" title="Settings"/><div className="max-w-3xl space-y-5"><div className="card"><div className="flex items-start gap-3"><Bell className="mt-1 text-cyan" size={19}/><div className="flex-1"><h2 className="font-medium">Analysis notifications</h2><p className="mt-1 text-sm text-slate-400">Receive a message when your resume analysis is ready.</p></div><input type="checkbox" defaultChecked className="mt-1 h-4 w-4 accent-cyan"/></div></div><div className="card"><div className="flex items-start gap-3"><LockKeyhole className="mt-1 text-cyan" size={19}/><div><h2 className="font-medium">Password & security</h2><p className="mt-1 text-sm text-slate-400">Keep your account secure with a strong password.</p><Button variant="secondary" className="mt-4">Change password</Button></div></div></div><div className="card border-rose-500/20"><h2 className="font-medium text-rose-300">Danger zone</h2><p className="mt-1 text-sm text-slate-400">Permanently delete your account and all saved analyses.</p><Button variant="secondary" className="mt-4 text-rose-300">Delete account</Button></div></div></>}
function FormCard({title,fields}){return <form className="card"><h2 className="mb-5 font-semibold">{title}</h2><div className="space-y-4">{fields.map(([l,v])=><label key={l} className="block"><span className="label">{l}</span><input className="input" defaultValue={v}/></label>)}</div><Button className="mt-6">Save changes</Button></form>}
function Login({ register = false }) {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (register) {
        await api.post("/accounts/register/", {
          // Django username cannot contain spaces.
          username: fullName.trim().toLowerCase().replace(/\s+/g, "_"),
          email: email,
          password: password,
        });

        navigate("/login");
        return;
      }

      const response = await api.post("/accounts/login/", {
        email: email,
        password: password,
      });

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/");
    } catch (err) {
      const backendError = err.response?.data;

      if (typeof backendError === "string") {
        setError(backendError);
      } else if (backendError?.detail) {
        setError(backendError.detail);
      } else if (backendError) {
        setError(Object.values(backendError).flat().join(" "));
      } else {
        setError("Unable to connect to the server. Check that Django is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={register ? "Create your account" : "Welcome back"}
      subtitle={
        register
          ? "Start building a stronger resume today."
          : "Sign in to continue improving your career story."
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {register && (
          <label>
            <span className="label">Full name</span>
            <input
              className="input"
              placeholder="Raj Yadav"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>
        )}

        <label>
          <span className="label">Email address</span>
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          <span className="label">Password</span>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {!register && (
          <div className="text-right">
            <a href="#" className="text-sm text-cyan">
              Forgot password?
            </a>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        <Button className="w-full" disabled={loading}>
          {loading
            ? "Please wait..."
            : register
              ? "Create account"
              : "Sign in"}
          <ArrowRight size={16} />
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-400">
        {register ? "Already have an account?" : "New to ResumeIQ?"}{" "}
        <Link
          to={register ? "/login" : "/register"}
          className="text-cyan"
        >
          {register ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </AuthLayout>
  );
}
function Protected({children}){return <AppShell>{children}</AppShell>}
export default function App(){return <Routes><Route path="/login" element={<Login/>}/><Route path="/register" element={<Login register/>}/><Route path="/" element={<Protected><LiveDashboard/></Protected>}/><Route path="/upload" element={<Protected><LiveUpload/></Protected>}/><Route path="/analysis" element={<Protected><LiveAnalysis/></Protected>}/><Route path="/history" element={<Protected><History/></Protected>}/><Route path="/compare" element={<Protected><Compare/></Protected>}/><Route path="/profile" element={<Protected><LiveProfile/></Protected>}/><Route path="/settings" element={<Protected><Settings/></Protected>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
