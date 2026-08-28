<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Foothold — Structured Alumni Mentorship & Referral Platform</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          colors: {
            brand: {
              50: '#f0f7ff',
              100: '#e0effe',
              200: '#bae0fd',
              300: '#7cc5fb',
              400: '#36a5f7',
              500: '#0c87eb',
              600: '#026bc9',
              700: '#0355a3',
              800: '#074885',
              900: '#0c3d6e',
              950: '#082749',
            },
            forest: {
              50: '#f2f9f5',
              500: '#10b981',
              600: '#059669',
              700: '#047857',
            },
            amber: {
              500: '#f59e0b',
              600: '#d97706',
            }
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #0b0f19;
      color: #f1f5f9;
      font-feature-settings: "cv02", "cv03", "cv04", "cv11";
    }
    .glass-card {
      background: rgba(17, 24, 39, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .glass-card-hover:hover {
      background: rgba(30, 41, 59, 0.75);
      border-color: rgba(56, 189, 248, 0.3);
      box-shadow: 0 10px 30px -10px rgba(12, 135, 235, 0.2);
    }
    .glow-effect {
      position: relative;
    }
    .glow-effect::before {
      content: '';
      position: absolute;
      top: -10%;
      left: 15%;
      width: 70%;
      height: 70%;
      background: radial-gradient(circle, rgba(12, 135, 235, 0.15) 0%, rgba(0,0,0,0) 70%);
      z-index: -1;
      pointer-events: none;
    }
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #0f172a;
    }
    ::-webkit-scrollbar-thumb {
      background: #334155;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #475569;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white">

  <!-- Top Navigation -->
  <header class="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-3 cursor-pointer" onclick="switchTab('landing')">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <i data-lucide="compass" class="w-5 h-5 text-white"></i>
        </div>
        <div>
          <span class="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
            Foothold
            <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">Interactive Prototype</span>
          </span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        <button onclick="switchTab('landing')" id="nav-landing" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-brand-600 text-white shadow-sm">
          Overview & Story
        </button>
        <button onclick="switchTab('directory')" id="nav-directory" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5">
          <i data-lucide="users" class="w-3.5 h-3.5"></i>
          Alumni Directory (Epic A)
        </button>
        <button onclick="switchTab('student')" id="nav-student" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5">
          <i data-lucide="send" class="w-3.5 h-3.5"></i>
          Student Dashboard (Epic E)
          <span class="w-2 h-2 rounded-full bg-brand-400"></span>
        </button>
        <button onclick="switchTab('alum')" id="nav-alum" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5">
          <i data-lucide="inbox" class="w-3.5 h-3.5"></i>
          Alumni Portal (Epic F)
          <span class="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">2 pending</span>
        </button>
        <button onclick="switchTab('admin')" id="nav-admin" class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5">
          <i data-lucide="line-chart" class="w-3.5 h-3.5"></i>
          Admin Console (Epic H)
        </button>
      </nav>

      <!-- University / User Status Badge -->
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Pilot Active · Stanford University</span>
        </div>
        <button onclick="openAskModal('Sarah Chen', 'Senior Product Manager', 'Google', 'Stanford BS CS 2020', ['chat', 'resume', 'referral'])" class="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-md shadow-brand-600/30 flex items-center gap-1.5">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Try Ask Builder</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <!-- ========================================================================= -->
    <!-- VIEW 1: LANDING & STRATEGY OVERVIEW -->
    <!-- ========================================================================= -->
    <div id="view-landing" class="space-y-16">
      
      <!-- Hero Section -->
      <section class="text-center max-w-4xl mx-auto pt-6 pb-4 glow-effect">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-6">
          <i data-lucide="shield-check" class="w-3.5 h-3.5 text-brand-400"></i>
          <span>Fixing the broken bridge between ambitious students and willing alumni</span>
        </div>
        <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Never face a blank box.<br />
          <span class="bg-gradient-to-r from-brand-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">Turn warm alumni goodwill into real referrals.</span>
        </h1>
        <p class="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Foothold replaces intimidating cold outreach and static career spreadsheets with structured, bounded asks that cost alumni minutes, not hours.
        </p>

        <!-- CTA Action row -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button onclick="switchTab('directory')" class="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-500/30 flex items-center gap-2">
            <i data-lucide="search" class="w-4 h-4"></i>
            Explore Alumni Directory
          </button>
          <button onclick="switchTab('alum')" class="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center gap-2">
            <i data-lucide="user-check" class="w-4 h-4 text-emerald-400"></i>
            Experience Alumni View (2 min/ask)
          </button>
        </div>

        <!-- 3 Core Wedge Metrics Banner -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 text-left">
          <div class="glass-card p-5 rounded-2xl">
            <div class="flex items-center gap-3 text-brand-400 mb-2">
              <i data-lucide="message-square-dashed" class="w-5 h-5"></i>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 1 · The Ask</span>
            </div>
            <div class="text-2xl font-bold text-white">0 Blank Boxes</div>
            <p class="text-xs text-slate-400 mt-1">Role-tailored, auto-filled templates sized specifically for 15-min chats, resume reads, or referrals.</p>
          </div>

          <div class="glass-card p-5 rounded-2xl">
            <div class="flex items-center gap-3 text-emerald-400 mb-2">
              <i data-lucide="clock-3" class="w-5 h-5"></i>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 2 · Alumni Control</span>
            </div>
            <div class="text-2xl font-bold text-white">&lt; 2 Mins to Answer</div>
            <p class="text-xs text-slate-400 mt-1">Monthly caps, 1-click pause, and 1-click referrals right from the notification inbox.</p>
          </div>

          <div class="glass-card p-5 rounded-2xl">
            <div class="flex items-center gap-3 text-cyan-400 mb-2">
              <i data-lucide="git-merge" class="w-5 h-5"></i>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 3 · Conversion</span>
            </div>
            <div class="text-2xl font-bold text-white">Stranger &rarr; Referral</div>
            <p class="text-xs text-slate-400 mt-1">Structured follow-up prompts ensure successful chats don't go cold and naturally graduate into internal referrals.</p>
          </div>
        </div>
      </section>

      <!-- The 3 Failures & Foothold Solutions (PRD Section 1) -->
      <section class="border-t border-slate-800/80 pt-12">
        <div class="text-center max-w-2xl mx-auto mb-10">
          <h2 class="text-2xl sm:text-3xl font-bold text-white">Why Traditional Alumni Outreach Fails</h2>
          <p class="text-slate-400 text-sm mt-2">The missing infrastructure that hurts first-generation & unconnected students most.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="glass-card p-6 rounded-2xl border-l-4 border-l-rose-500/80">
            <div class="flex items-center justify-between mb-4">
              <span class="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 text-xs font-mono font-medium">Problem 01</span>
              <i data-lucide="file-x" class="w-5 h-5 text-rose-400"></i>
            </div>
            <h3 class="font-bold text-white text-base">No template for the ask</h3>
            <p class="text-slate-400 text-xs mt-2 leading-relaxed">
              Students don't know what a reasonable message looks like. They either send nothing or write novel-length, vague "pick your brain" emails that alumni ignore.
            </p>
            <div class="mt-4 pt-3 border-t border-slate-800/80 text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <i data-lucide="check-circle-2" class="w-4 h-4"></i>
              <span>Foothold fix: Structured 3-tier ask builder</span>
            </div>
          </div>

          <div class="glass-card p-6 rounded-2xl border-l-4 border-l-amber-500/80">
            <div class="flex items-center justify-between mb-4">
              <span class="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-mono font-medium">Problem 02</span>
              <i data-lucide="table" class="w-5 h-5 text-amber-400"></i>
            </div>
            <h3 class="font-bold text-white text-base">Static spreadsheets, zero signal</h3>
            <p class="text-slate-400 text-xs mt-2 leading-relaxed">
              Career centers hand out stale spreadsheets. Students have zero indication of who is currently active, overloaded, or actually open to helping.
            </p>
            <div class="mt-4 pt-3 border-t border-slate-800/80 text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <i data-lucide="check-circle-2" class="w-4 h-4"></i>
              <span>Foothold fix: Live opt-in badges + monthly caps</span>
            </div>
          </div>

          <div class="glass-card p-6 rounded-2xl border-l-4 border-l-indigo-500/80">
            <div class="flex items-center justify-between mb-4">
              <span class="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-mono font-medium">Problem 03</span>
              <i data-lucide="thermometer-snowflake" class="w-5 h-5 text-indigo-400"></i>
            </div>
            <h3 class="font-bold text-white text-base">No structure after reply</h3>
            <p class="text-slate-400 text-xs mt-2 leading-relaxed">
              Even after a great call, students feel awkward transitioning from "thank you" to asking for a job referral or continuing multi-week mentorship.
            </p>
            <div class="mt-4 pt-3 border-t border-slate-800/80 text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <i data-lucide="check-circle-2" class="w-4 h-4"></i>
              <span>Foothold fix: Automated referral nudges</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Live Interactive Walkthrough Simulator -->
      <section class="border-t border-slate-800/80 pt-12">
        <div class="glass-card rounded-3xl p-6 sm:p-10 border border-slate-700/60 bg-gradient-to-b from-slate-900/90 to-slate-950/90">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <span class="text-xs font-mono text-brand-400 font-semibold tracking-wider uppercase">Interactive PRD Workflow</span>
              <h2 class="text-2xl sm:text-3xl font-bold text-white mt-1">End-to-End Referral Conversion Journey</h2>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="switchTab('directory')" class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                <span>Try as Student</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>

          <!-- Step By Step Flow Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-all">
              <div class="w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 font-mono text-xs font-bold flex items-center justify-center mb-3">1</div>
              <h4 class="text-sm font-bold text-white">Targeted Match</h4>
              <p class="text-xs text-slate-400 mt-1">Student filters verified alumni by company (e.g. Google), role (PM), and opt-in status.</p>
              <div class="mt-3 text-[11px] font-mono text-brand-300 bg-brand-500/10 px-2 py-1 rounded">Epic A: Directory</div>
            </div>

            <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-all">
              <div class="w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 font-mono text-xs font-bold flex items-center justify-center mb-3">2</div>
              <h4 class="text-sm font-bold text-white">Structured Ask</h4>
              <p class="text-xs text-slate-400 mt-1">Template auto-fills with student's background & questions. Live tone/length meter prevents spam.</p>
              <div class="mt-3 text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-1 rounded">Epic B: Ask Builder</div>
            </div>

            <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-all">
              <div class="w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 font-mono text-xs font-bold flex items-center justify-center mb-3">3</div>
              <h4 class="text-sm font-bold text-white">2-Min Alum Decision</h4>
              <p class="text-xs text-slate-400 mt-1">Alum reviews concise card, accepts 15-min chat or one-click refers without leaving email/inbox.</p>
              <div class="mt-3 text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded">Epic F: Alumni Inbox</div>
            </div>

            <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/50 transition-all">
              <div class="w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 font-mono text-xs font-bold flex items-center justify-center mb-3">4</div>
              <h4 class="text-sm font-bold text-white">1-Click Referral</h4>
              <p class="text-xs text-slate-400 mt-1">Post-chat nudge prompts referral request. Alum submits referral directly to internal portal.</p>
              <div class="mt-3 text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">Epic C: Referral Flow</div>
            </div>

          </div>
        </div>
      </section>

    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 2: ALUMNI DIRECTORY & MATCHING (EPIC A) -->
    <!-- ========================================================================= -->
    <div id="view-directory" class="hidden space-y-6">
      
      <!-- Directory Header & Controls -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-white flex items-center gap-2.5">
            <span>Verified Alumni Directory</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Stanford University</span>
          </h2>
          <p class="text-slate-400 text-xs mt-1">All alumni have opted in with specific availability caps. Requesters are rate-limited to 5 asks/month.</p>
        </div>

        <!-- Search Bar -->
        <div class="flex items-center gap-2">
          <div class="relative w-full md:w-72">
            <i data-lucide="search" class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input type="text" id="dirSearch" oninput="filterAlumni()" placeholder="Search company, role, major..." class="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500">
          </div>
        </div>
      </div>

      <!-- Filter Pills -->
      <div class="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800 text-xs">
        <span class="text-slate-400 text-xs font-semibold mr-1">Filter Opt-ins:</span>
        <button onclick="toggleOptinFilter('all')" id="filter-all" class="px-3 py-1.5 rounded-lg bg-brand-600 text-white font-medium">All Available (6)</button>
        <button onclick="toggleOptinFilter('chat')" id="filter-chat" class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800">☕ 15-min Chat</button>
        <button onclick="toggleOptinFilter('res
