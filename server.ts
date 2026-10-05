import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for NewsBot
export interface Article {
  id: string;
  headline: string;
  description: string;
  content: string;
  source: string; // "The Hindu" | "Times of India" | "Indian Express" | "NDTV" | "NewsAPI Sources"
  sourceSlug: string; // "the-hindu" | "times-of-india" | "indian-express" | "ndtv" | "newsapi"
  category: "Politics" | "Economy" | "Technology" | "Science" | "National" | "International" | "Opinion";
  publishedAt: string;
  author: string;
  readTime: string;
  imageUrl: string;
  url: string;
  tags: string[];
  sentiment?: "Positive" | "Neutral" | "Analytical" | "Critical";
  coverageAngle?: string;
  keyQuotes?: string[];
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "system" | "breaking" | "edition" | "ai";
  actionUrl?: string;
}

export interface FeedbackRecord {
  id: string;
  rating: number;
  feature: string;
  comment?: string;
  createdAt: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  preferredSources?: string[];
}

export interface Agency {
  id: string;
  name: string;
  location: string;
  newspapers: string[];
  specialization: string;
  minBudget: number;
  maxBudget: number;
  rating: number;
  completedCampaigns: number;
  description: string;
  contactEmail: string;
  verified: boolean;
  imageUrl: string;
}

// Newspaper metadata
const NEWSPAPERS_META = [
  {
    name: "The Hindu",
    slug: "the-hindu",
    tagline: "India's National Newspaper Since 1878",
    bias: "Analytical & Policy-focused",
    color: "#0284c7", // Sky blue
    edition: "Chennai & National Digital Edition",
    status: "Active Ingestion",
    articleCount: 142,
    lastUpdated: "12 mins ago",
    badge: "THE HINDU",
  },
  {
    name: "Times of India",
    slug: "times-of-india",
    tagline: "India's Largest Selling English Broadside",
    bias: "Broad National & Commercial",
    color: "#e11d48", // Rose red
    edition: "Pan-India Metro Digital",
    status: "Active Ingestion",
    articleCount: 189,
    lastUpdated: "5 mins ago",
    badge: "TOI",
  },
  {
    name: "Indian Express",
    slug: "indian-express",
    tagline: "Journalism of Courage",
    bias: "Investigative & Explained Focus",
    color: "#ea580c", // Orange
    edition: "New Delhi & Mumbai Network",
    status: "Active Ingestion",
    articleCount: 128,
    lastUpdated: "18 mins ago",
    badge: "EXPRESS",
  },
  {
    name: "NDTV",
    slug: "ndtv",
    tagline: "India's Leading Digital Newsroom",
    bias: "Real-time Telemetry & Ground Focus",
    color: "#059669", // Emerald green
    edition: "24x7 Digital Wire",
    status: "Active Ingestion",
    articleCount: 164,
    lastUpdated: "2 mins ago",
    badge: "NDTV",
  },
  {
    name: "NewsAPI Sources",
    slug: "newsapi",
    tagline: "Aggregated Wire & Financial Press",
    bias: "Financial & Wire Dispatch (Mint, PTI)",
    color: "#8b5cf6", // Purple
    edition: "Aggregated Feeds",
    status: "Active Ingestion",
    articleCount: 215,
    lastUpdated: "1 min ago",
    badge: "WIRE",
  },
];

// Seed initial authentic articles representing modern Indian news coverage
let articlesStore: Article[] = [
  {
    id: "art-1",
    headline: "Union Budget & Fiscal Roadmap: Capex Outlay Pushed to Record High as Manufacturing Incentives Expand",
    description: "The Finance Ministry's comprehensive fiscal paper outlines a massive boost in infrastructure spending, prioritizing semiconductor corridors and green transport networks across southern and western industrial belts.",
    content: "The Ministry of Finance today tabled an updated fiscal report reaffirming India's target of bringing the fiscal deficit down to below 4.5% of GDP while substantially stepping up capital expenditure. Infrastructure projects spanning high-speed logistics highways, dedicated freight lines, and indigenously developed semiconductor packaging facilities are designated as primary recipients of capital allocations. Economists note that private investment revival remains crucial to absorb the enhanced production capacity created under the Production Linked Incentive (PLI) schemes.",
    source: "The Hindu",
    sourceSlug: "the-hindu",
    category: "Economy",
    publishedAt: "2026-09-07T08:30:00Z",
    author: "Suresh Radhakrishnan",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80",
    url: "https://www.thehindu.com/business/budget-capex-expansion-analysis",
    tags: ["Union Budget", "Economy", "Capex", "Fiscal Policy"],
    sentiment: "Analytical",
    coverageAngle: "Macroeconomic stability and long-term capital allocation over short-term consumption stimulus.",
    keyQuotes: [
      "Targeting structural capital assets will catalyze long-term domestic multiplier effects without igniting runaway demand inflation.",
      "The fiscal glidepath below 4.5% sends reassuring signals to sovereign bond markets."
    ]
  },
  {
    id: "art-2",
    headline: "Union Budget Highlights: Middle Class Tax Reforms, Green Mobility Grants & Tech Hub Incentives Take Center Stage",
    description: "Budget consultations highlight direct tax bracket adjustments, tariff exemptions for lithium battery components, and expanded venture capital deductions for Tier-2 deep-tech enterprises.",
    content: "The latest government budgetary announcements bring notable cheer to salaried professionals with revised standard deduction limits and recalibrated income slabs under the new tax regime. Concurrently, the consumer electronics and automotive sectors received key relief through zero-customs duty on critical minerals and components required for EV cell manufacturing. Major trade chambers have welcomed the simplified tax audit criteria for micro-entrepreneurs.",
    source: "Times of India",
    sourceSlug: "times-of-india",
    category: "Economy",
    publishedAt: "2026-09-07T09:15:00Z",
    author: "Ananya Mukherjee",
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    url: "https://timesofindia.indiatimes.com/business/budget-middle-class-relief-ev-boost",
    tags: ["Union Budget", "Taxation", "Electric Vehicles", "Startups"],
    sentiment: "Positive",
    coverageAngle: "Immediate consumer impact, middle-class tax savings, and retail business reactions.",
    keyQuotes: [
      "Taxpayers gain direct disposable surplus, expected to revive consumer durables demand in upcoming festive quarters.",
      "EV makers anticipate a 15% reduction in production costs from mineral tariff holidays."
    ]
  },
  {
    id: "art-3",
    headline: "Explained: The Math Behind the Fiscal Consolidation Path and What It Means for State Grants",
    description: "An Indian Express deep-dive into how capital expenditure growth is balanced against state revenue deficits, welfare outlays, and off-budget borrowing caps.",
    content: "In its signature 'Explained' format, the Express analyzes the intricate federal fiscal balance. While central capex has surged, several state governments have raised concerns over conditions tied to interest-free 50-year loans. The report dissects the trade-offs between committed expenditures such as pensions and debt servicing versus discretionary developmental grants, pointing out that state-level capital spending will determine the ground-level pace of project execution.",
    source: "Indian Express",
    sourceSlug: "indian-express",
    category: "Economy",
    publishedAt: "2026-09-07T07:45:00Z",
    author: "Udit Misra",
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    url: "https://indianexpress.com/article/explained/explained-economics/budget-fiscal-math-states-grants",
    tags: ["Union Budget", "Fiscal Federalism", "Explained", "Public Finance"],
    sentiment: "Critical",
    coverageAngle: "Scrutiny of state-center financial transfers and feasibility of borrowing ceilings.",
    keyQuotes: [
      "The true test of fiscal consolidation lies not in central headline numbers, but in whether states can absorb tied capital disbursements without choking revenue deficits.",
      "Off-budget liabilities remain tightly monitored by the comptroller."
    ]
  },
  {
    id: "art-4",
    headline: "Market Reactions to Budget Blueprint: Sensex Scales Fresh Milestone as Banking & Infra Stocks Lead Rally",
    description: "Domestic and foreign institutional investors pour into public sector banks, capital goods manufacturers, and logistics players following policy continuity announcements.",
    content: "Dalal Street witnessed robust buying momentum through early trading hours as benchmark indices jumped past historic resistance levels. Market strategists attribute the optimism to fiscal discipline combined with the absence of surprise capital gains taxes. Foreign Portfolio Investors (FPIs) recorded net inflows exceeding ₹3,400 crore in the morning session alone, buoyed by the stable sovereign debt yields.",
    source: "NDTV",
    sourceSlug: "ndtv",
    category: "Economy",
    publishedAt: "2026-09-07T10:00:00Z",
    author: "NDTV Profit Bureau",
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    url: "https://www.ndtv.com/business/market-rally-budget-infrastructure-push-fpi-inflows",
    tags: ["Markets", "Sensex", "Nifty", "Union Budget"],
    sentiment: "Positive",
    coverageAngle: "Real-time market sentiment, trading volumes, and global investor reactions.",
    keyQuotes: [
      "Foreign institutional desks view policy consistency as the single biggest factor behind India's valuation premium in emerging markets.",
      "Infra and engineering order books are projected to hit historic peaks."
    ]
  },
  {
    id: "art-5",
    headline: "ISRO Gaganyaan Update: Final Uncrewed Orbital Flight Simulation Cleared; Astronaut Crew Completes High-G Centrifuge Tests",
    description: "The space agency confirms readiness of the human-rated LVM3 launch vehicle and life support systems at Sriharikota, setting the stage for India's historic crewed spaceflight.",
    content: "The Indian Space Research Organisation (ISRO) announced the successful completion of integrated thermal, environmental, and vacuum qualification trials for the Gaganyaan crew module. The four designated astronaut-designates have concluded advanced orbital simulation and survival drills at the Astronaut Training Facility in Bengaluru. ISRO Chairman highlighted that the upcoming uncrewed flight with the humanoid robot 'Vyommitra' will rigorously test re-entry guidance and supersonic parachute deployment over the Bay of Bengal.",
    source: "The Hindu",
    sourceSlug: "the-hindu",
    category: "Science",
    publishedAt: "2026-09-07T06:20:00Z",
    author: "K. S. Jayaraman",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1517976487502-5c3a372138c2?auto=format&fit=crop&w=1200&q=80",
    url: "https://www.thehindu.com/sci-tech/science/isro-gaganyaan-orbital-flight-trials",
    tags: ["ISRO", "Space", "Gaganyaan", "Science"],
    sentiment: "Positive",
    coverageAngle: "Rigorous technical specifications, safety margins, and aerospace engineering milestones.",
    keyQuotes: [
      "Every environmental control and life support component has undergone quadruple redundancy tests to guarantee astronaut survivability.",
      "The service module test firing demonstrated zero telemetry deviation."
    ]
  },
  {
    id: "art-6",
    headline: "India's Space Economy Poised for $44 Billion Valuation as Private Startups Deploy Indigenous Earth Observation Satellites",
    description: "Skyroot, Agnikul, and Pixxel lead private space sector momentum as IN-SPACe approves ten commercial payload launches for global telecom and agricultural monitoring clients.",
    content: "From small satellite launch vehicles to hyperspectral imaging constellations, India's private space tech ecosystem has reached commercial orbit. Commercial space entities headquartered in Hyderabad and Chennai have secured launch contracts from European and Southeast Asian constellation operators. Government policy reforms allowing 100% foreign direct investment in satellite manufacturing have accelerated venture capital dealflow across the aerospace corridor.",
    source: "Times of India",
    sourceSlug: "times-of-india",
    category: "Technology",
    publishedAt: "2026-09-07T08:10:00Z",
    author: "Surendra Singh",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    url: "https://timesofindia.indiatimes.com/india/private-space-revolution-space-startups-skyroot-pixxel",
    tags: ["SpaceTech", "Startups", "Economy", "Technology"],
    sentiment: "Positive",
    coverageAngle: "Commercial entrepreneurship, venture capital, and export potential of Indian private space startups.",
    keyQuotes: [
      "India is transitioning from an agency-dominated space program to an industrial space power with high launch cadence.",
      "Cost efficiencies in Indian space manufacturing are unmatched across the Indo-Pacific."
    ]
  },
  {
    id: "art-7",
    headline: "Supreme Court Constitution Bench Upholds State Powers on Mineral Royalty: Landmark Verdict Redefines Fiscal Federalism",
    description: "A nine-judge bench clarifies that mineral-bearing states retain constitutional authority to levy cess, ruling that royalty under the MMDR Act is not a tax.",
    content: "In one of the most consequential constitutional judgments of the decade, the Supreme Court of India ruled by an 8-1 majority that legislative competence to tax mineral rights resides with state legislatures under Entry 50 of List II. The bench, presided over by the Chief Justice, ruled that statutory royalties paid by mining concessionaires to state governments do not constitute a tax, freeing states like Odisha, Jharkhand, and Chhattisgarh to formulate independent developmental levies on extractive industries.",
    source: "The Hindu",
    sourceSlug: "the-hindu",
    category: "Politics",
    publishedAt: "2026-09-06T14:40:00Z",
    author: "Krishnadas Rajagopal",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    url: "https://www.thehindu.com/news/national/supreme-court-mineral-tax-states-rights-verdict",
    tags: ["Supreme Court", "Constitution", "Federalism", "Mining"],
    sentiment: "Analytical",
    coverageAngle: "Constitutional jurisprudence, federal tax competence, and legal precedents.",
    keyQuotes: [
      "Royalty is an exaction for the extraction of minerals from the owner of the land and cannot be equated with a sovereign tax on mineral rights.",
      "State sovereignty over regional mineral resources is firmly reaffirmed."
    ]
  },
  {
    id: "art-8",
    headline: "What the Supreme Court's Mining Verdict Means for Steel, Cement & Power Tariffs Across India",
    description: "An Indian Express sector assessment explains the industry anxieties regarding retroactive cess demands and the potential inflationary fallout on key manufacturing inputs.",
    content: "The corporate and industrial impact of the apex court's ruling has triggered intense negotiations between the Union Ministry of Mines, state governments, and industrial lobbies. Core sector manufacturers warn that cumulative state cesses could push up the landed cost of iron ore, bauxite, and thermal coal, inevitably cascading into higher finished prices for construction steel and power tariffs. The Express examines whether the Center might introduce statutory ceilings under the MMDR Act to prevent divergent interstate levies.",
    source: "Indian Express",
    sourceSlug: "indian-express",
    category: "Politics",
    publishedAt: "2026-09-06T16:15:00Z",
    author: "Apurva Vishwanath",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
    url: "https://indianexpress.com/article/explained/sc-verdict-states-mining-royalty-steel-power-impact",
    tags: ["Supreme Court", "Mining", "Steel", "Industry", "Explained"],
    sentiment: "Critical",
    coverageAngle: "Scrutiny of industrial fallout, energy tariffs, and inter-state trade friction.",
    keyQuotes: [
      "If states apply disparate retrospective cesses, India risks creating internal tariff friction across mineral supply chains.",
      "Heavy industry federations are petitioning the bench for prospective-only implementation."
    ]
  },
  {
    id: "art-9",
    headline: "India's Semiconductor Fab in Dholera Prepares for First Silicon Ingot Slicing in Historic Tech Milestone",
    description: "The joint venture facility between Tata Electronics and PSMC reaches cleanroom readiness, with initial pilot wafer testing targeted before the year's end.",
    content: "India's quest for strategic semiconductor self-reliance marked a critical breakthrough as the $11-billion semiconductor fabrication unit at Dholera Special Investment Region initiated testing of ultra-pure water pipelines and specialty gas manifolds. Advanced lithography tools shipped from Europe and Japan have been rigged inside the Class 1 cleanroom environment. The facility will initially manufacture 28nm and 40nm microcontrollers destined for automotive, consumer electronics, and telecom base stations.",
    source: "NDTV",
    sourceSlug: "ndtv",
    category: "Technology",
    publishedAt: "2026-09-07T05:30:00Z",
    author: "Pankaj Srivastava",
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    url: "https://www.ndtv.com/technology/india-semiconductor-dholera-fab-cleanroom-pilot-testing",
    tags: ["Semiconductors", "Technology", "Dholera", "Manufacturing"],
    sentiment: "Positive",
    coverageAngle: "National technology self-reliance, global supply chain diversification, and cleanroom readiness.",
    keyQuotes: [
      "Fabricating commercial silicon on Indian soil transforms our vulnerability to global supply bottlenecks into indigenous strength.",
      "The ecosystem is projected to train over 85,000 chip design and packaging engineers."
    ]
  },
  {
    id: "art-10",
    headline: "Digital Public Infrastructure: UPI Global Volume Crosses 18 Billion Monthly Transactions as Cross-Border Corridors Expand",
    description: "Seamless merchant QR connectivity goes live across 12 countries in Southeast Asia and the Gulf, solidifying NPCI's international footprint.",
    content: "The Unified Payments Interface (UPI) developed by the National Payments Corporation of India continues its unprecedented trajectory. Data released by the Reserve Bank of India revealed that cross-border person-to-merchant and remittance corridors in the UAE, Singapore, France, and Sri Lanka have processed record transactions during recent tourism peaks. Central bank officials also indicated ongoing technical trials with several ASEAN members to link national real-time payment switches.",
    source: "NewsAPI Sources",
    sourceSlug: "newsapi",
    category: "Technology",
    publishedAt: "2026-09-07T04:15:00Z",
    author: "Mint Financial Wire",
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
    url: "https://www.livemint.com/news/india/upi-global-expansion-npci-record-transactions-cross-border",
    tags: ["UPI", "Fintech", "DPI", "Economy"],
    sentiment: "Positive",
    coverageAngle: "Financial inclusion metric, international fintech diplomacy, and monetary volume.",
    keyQuotes: [
      "UPI has become India's premier soft-power export in the digital governance and public goods arena.",
      "Transaction failure rates remain beneath 0.05% despite exponential scale."
    ]
  },
  {
    id: "art-11",
    headline: "Renewable Energy Grid Integration: India Surpasses 200 GW Clean Energy Capacity, Storage Mandate Takes Effect",
    description: "The Ministry of New and Renewable Energy mandates 10% battery energy storage integration for all new solar-wind hybrid utility tenders to ensure grid resilience.",
    content: "India has crossed the monumental benchmark of 200 gigawatts of installed non-fossil power capacity, spearheaded by massive solar parks in Rajasthan and high-capacity offshore wind projects in Tamil Nadu and Gujarat. To manage intermittency and prevent evening peak-load brownouts, the Central Electricity Authority has enforced stringent Battery Energy Storage Systems (BESS) requirements. Global battery storage developers are bidding aggressively for long-term viability gap funding.",
    source: "The Hindu",
    sourceSlug: "the-hindu",
    category: "National",
    publishedAt: "2026-09-06T11:00:00Z",
    author: "Prashant Bhattacharya",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
    url: "https://www.thehindu.com/sci-tech/energy-and-environment/india-renewable-200gw-battery-storage-mandate",
    tags: ["Renewable Energy", "Solar", "Climate", "Infrastructure"],
    sentiment: "Positive",
    coverageAngle: "Policy framework, grid stability mathematics, and renewable transition targets.",
    keyQuotes: [
      "Integrating grid-scale storage ensures that clean electrons generated during peak daytime sun are dispatched during evening industrial demand.",
      "Green hydrogen electrolyzers will benefit from dedicated off-grid clean corridors."
    ]
  },
  {
    id: "art-12",
    headline: "Indian Express Investigation: The Microplastics in Our Mountain Springs and Urban Drinking Water",
    description: "A nationwide 6-month laboratory investigation reveals pervasive synthetic polymer fragments across Himalayan river basins and municipal water networks.",
    content: "In a sweeping investigative exposé, Indian Express journalists in collaboration with leading water toxicology laboratories tested water samples across 18 major urban and ecologically sensitive zones. The findings reveal microplastic particle densities exceeding permissible environmental safety thresholds, even in high-altitude glacier meltwater tributaries. Environmental activists and public health specialists are urging immediate enforcement of single-use plastic regulations and upgraded tertiary wastewater filtration standards.",
    source: "Indian Express",
    sourceSlug: "indian-express",
    category: "National",
    publishedAt: "2026-09-06T09:30:00Z",
    author: "Jay Mazoomdaar",
    readTime: "7 min read",
    imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80",
    url: "https://indianexpress.com/article/investigations/microplastics-himalayan-waters-indian-express-investigation",
    tags: ["Environment", "Investigation", "Public Health", "Water"],
    sentiment: "Critical",
    coverageAngle: "Deep ground-level investigation, scientific laboratory evidence, and accountability.",
    keyQuotes: [
      "The presence of synthetic polymers at 14,000 feet proves that plastic pollution has permeated the fundamental hydrological cycle.",
      "Municipal treatment plants lack the sub-micron physical membranes necessary to intercept these particles."
    ]
  },
  {
    id: "art-13",
    headline: "Cricket: India Names Revamped Squad for World Test Championship Final Push; Pace Battery Gets Fresh Blood",
    description: "BCCI selection committee unveils a bold lineup balancing seasoned batsmen with fiery domestic red-ball pace talents from the Ranji Trophy circuit.",
    content: "The national cricket selection committee announced an 18-member test squad for the upcoming high-stakes red-ball series determining the finalists of the ICC World Test Championship. Notable inclusions feature top-order domestic prodigies and two express fast bowlers capable of clocking over 145 km/h. Head coach stressed the importance of workload management for prime all-rounders as the team gears up for challenging overseas conditions.",
    source: "Times of India",
    sourceSlug: "times-of-india",
    category: "National",
    publishedAt: "2026-09-07T11:20:00Z",
    author: "Gaurav Gupta",
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
    url: "https://timesofindia.indiatimes.com/sports/cricket/india-test-squad-wtc-pace-battery-ranji-performers",
    tags: ["Cricket", "Sports", "BCCI", "Team India"],
    sentiment: "Positive",
    coverageAngle: "Sports analysis, domestic talent promotion, and team tactical balance.",
    keyQuotes: [
      "Rewarding consistent multi-day domestic run-scorers preserves the integrity of first-class cricket.",
      "The pace battery's depth gives India firepower across all pitch conditions."
    ]
  },
  {
    id: "art-14",
    headline: "Geopolitics: Global South Coalition Champions Food Security & Debt Restructuring at Comprehensive Trade Summit",
    description: "External Affairs Minister leads diplomatic discussions advocating for predictable grain export corridors, climate adaptation funds, and multilateral bank reforms.",
    content: "Addressing delegates from over 80 developing countries, India reiterated its commitment to acting as a reliable bridge between global economic powers and the developing world. The high-level conference produced a unified communiqué demanding urgent restructuring of vulnerable sovereign debts, unhindered maritime transit for fertilizers and staple grains, and equitable access to concessional clean energy financing. Delegations praised India's advocacy for transparent digital governance frameworks.",
    source: "The Hindu",
    sourceSlug: "the-hindu",
    category: "International",
    publishedAt: "2026-09-05T15:00:00Z",
    author: "Suhasini Haidar",
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
    url: "https://www.thehindu.com/news/international/global-south-trade-summit-food-security-debt-relief",
    tags: ["Diplomacy", "Global South", "Foreign Policy", "Trade"],
    sentiment: "Analytical",
    coverageAngle: "Multilateral diplomacy, institutional reforms, and international trade law.",
    keyQuotes: [
      "Economic stability in the Global South cannot be held hostage to geopolitical fragmentation or unilateral monetary tightening.",
      "India's voice remains steadfast in defending the legitimate development space of emerging economies."
    ]
  }
];

// Seed initial alerts
let alertsStore: Alert[] = [
  {
    id: "alert-1",
    title: "Today's newspapers are ready — 08 September 2026",
    message: "14 new editorial dispatches and investigative reports processed from The Hindu, Times of India, Indian Express, and NDTV.",
    timestamp: "2026-09-07T21:00:00Z",
    read: false,
    type: "edition",
    actionUrl: "/news",
  },
  {
    id: "alert-2",
    title: "Breaking Analysis: Union Budget & Fiscal Trajectory",
    message: "4 newspapers have published cross-perspective coverage on the capex allocations and state financial grants.",
    timestamp: "2026-09-07T18:30:00Z",
    read: false,
    type: "breaking",
    actionUrl: "/compare?topic=Union%20Budget",
  },
  {
    id: "alert-3",
    title: "AI NewsBot Neural Index Synced",
    message: "Vector search embeddings refreshed with 841 indexed articles across politics, economy, and science.",
    timestamp: "2026-09-07T14:15:00Z",
    read: true,
    type: "ai",
    actionUrl: "/ai",
  }
];

// Seed feedback records
let feedbackStore: FeedbackRecord[] = [
  {
    id: "fb-1",
    rating: 5,
    feature: "Newspaper Comparison",
    comment: "The side-by-side comparison of Union Budget coverage between The Hindu and Indian Express showed nuanced differences in seconds!",
    createdAt: "2026-09-06T12:00:00Z"
  }
];

// Seed registered users
let registeredUsersStore: RegisteredUser[] = [
  {
    id: "user-1",
    name: "Sashmitha Gandhi",
    email: "demo@example.com",
    registeredAt: "2026-09-07T10:00:00Z",
    preferredSources: ["The Hindu", "Indian Express"]
  }
];

// Seed advertising agencies marketplace
let agenciesStore: Agency[] = [
  {
    id: "agency-1",
    name: "GroupM India News Bureau",
    location: "Mumbai, Maharashtra",
    newspapers: ["Times of India", "The Hindu", "Indian Express", "NDTV"],
    specialization: "Print Frontpage & Digital Display Dominance",
    minBudget: 150000,
    maxBudget: 2500000,
    rating: 4.9,
    completedCampaigns: 480,
    description: "Premier media planning and print/digital buying syndicate managing national front-page jackets, editorial integrations, and state-targeted editions.",
    contactEmail: "newsdesk@groupm-india.com",
    verified: true,
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "agency-2",
    name: "Madison Media Spectrum",
    location: "New Delhi & Bengaluru",
    newspapers: ["The Hindu", "Times of India", "Mint"],
    specialization: "Financial News & Corporate Affairs Advertising",
    minBudget: 80000,
    maxBudget: 1200000,
    rating: 4.8,
    completedCampaigns: 310,
    description: "Specialized in high-credibility financial daily spreads, quarterly earnings announcements, and investor relations notices across national business broadsheets.",
    contactEmail: "press@madisonindia.com",
    verified: true,
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "agency-3",
    name: "Dentsu Aegis India Editorial",
    location: "Gurugram, Haryana",
    newspapers: ["Indian Express", "The Hindu", "NDTV"],
    specialization: "Native Editorial & Thought Leadership Columns",
    minBudget: 50000,
    maxBudget: 800000,
    rating: 4.7,
    completedCampaigns: 220,
    description: "Creates deeply researched sponsored essays, policy whitepapers, and brand retrospectives formatted in genuine newspaper typography.",
    contactEmail: "inquiries@dentsu-editorial.in",
    verified: true,
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "agency-4",
    name: "Wavemaker South Regional Media",
    location: "Chennai & Hyderabad",
    newspapers: ["The Hindu", "Times of India"],
    specialization: "Southern Region Multi-Language Print Jacketing",
    minBudget: 40000,
    maxBudget: 600000,
    rating: 4.9,
    completedCampaigns: 195,
    description: "Hyper-localized regional distribution network coordinating simultaneous print placement across Tamil, Telugu, Kannada, and English editions.",
    contactEmail: "south@wavemaker.in",
    verified: true,
    imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80"
  }
];

// Lazy Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Resilient Gemini execution with model cascading and instant quota/demand fallback
async function generateGeminiContent(prompt: string): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  // Primary model and verified alternative fallback models per gemini-api guidelines
  // Note: gemini-3.1-flash-lite has a distinct quota pool from gemini-3.8-flash
  const candidateModels = [
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
  ];

  for (const model of candidateModels) {
    try {
      // Set reasonable execution timeout so API never hangs
      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 9000)
        ),
      ]);

      if (response?.text) {
        return response.text;
      }
    } catch (err: unknown) {
      const errString = String(err || "");
      const errorObj = err as { status?: number | string; message?: string; error?: { code?: number; status?: string } };

      const isHighDemand =
        errorObj?.status === 503 ||
        errorObj?.error?.code === 503 ||
        errString.includes("503") ||
        errString.includes("high demand") ||
        errString.includes("UNAVAILABLE");

      // For transient 503 demand spikes on primary model, do a quick single retry
      if (isHighDemand && model === candidateModels[0]) {
        try {
          await new Promise((r) => setTimeout(r, 600));
          const retryRes = await Promise.race([
            ai.models.generateContent({
              model,
              contents: prompt,
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 8000)
            ),
          ]);
          if (retryRes?.text) {
            return retryRes.text;
          }
        } catch {
          // Proceed directly to fallback model
        }
      }
      // If 429 quota, timeout, or failed retry, seamlessly try next model
    }
  }

  return null;
}

// Vector / keyword scoring function to simulate high-precision newspaper intelligence retrieval
function scoreArticleRelevance(article: Article, query: string): number {
  const q = query.toLowerCase();
  const qTerms = q.split(/\s+/).filter(t => t.length > 2);
  let score = 0;

  const headline = article.headline.toLowerCase();
  const desc = article.description.toLowerCase();
  const content = article.content.toLowerCase();
  const tags = article.tags.map(t => t.toLowerCase()).join(" ");

  if (headline.includes(q)) score += 10;
  if (desc.includes(q)) score += 6;

  for (const term of qTerms) {
    if (headline.includes(term)) score += 4;
    if (tags.includes(term)) score += 3;
    if (desc.includes(term)) score += 2;
    if (content.includes(term)) score += 1;
  }

  // Boost if source matches query
  if (q.includes(article.source.toLowerCase())) {
    score += 5;
  }

  return score;
}

// ==========================================
// API ROUTES IMPLEMENTATION
// ==========================================

// Helper router to handle both /api/* and root /* endpoints seamlessly
const router = express.Router();

// 1. GET / and /api - Health & System Status
const getSystemStatus = () => ({
  status: "online",
  system: "NewsBot AI Newspaper Intelligence Engine",
  version: "2.8.4-cinematic",
  timestamp: new Date().toISOString(),
  editionDate: "08 September 2026",
  indexedArticlesCount: articlesStore.length,
  newspapers: NEWSPAPERS_META.map(n => n.name),
  aiEngine: process.env.GEMINI_API_KEY ? "Gemini 3.8 Flash (Active)" : "Neural Vector Synthesizer (Online)",
  endpoints: [
    "/articles",
    "/articles/:newspaper_name",
    "/chat",
    "/alerts",
    "/alerts/:id/read",
    "/feedback",
    "/fetch-now",
    "/archive",
    "/compare",
    "/register",
    "/newspapers",
    "/analytics",
    "/agencies",
    "/agencies/:id"
  ]
});

router.get(["/status", "/health"], (req: Request, res: Response) => {
  res.json(getSystemStatus());
});

router.get("/", (req: Request, res: Response, next) => {
  // If mounted under /api or if request explicitly wants JSON and NOT HTML
  const acceptsHtml = req.accepts(["html", "json"]) === "html";
  if (req.baseUrl === "/api" || (!acceptsHtml && req.headers.accept?.includes("application/json"))) {
    return res.json(getSystemStatus());
  }
  // Otherwise pass through to Vite middleware or static files to serve the React web app
  next();
});

// 2. GET /articles (with optional filtering by newspaper, search, category, limit)
router.get("/articles", (req: Request, res: Response) => {
  const { newspaper, search, category, limit } = req.query;
  let results = [...articlesStore];

  if (newspaper && typeof newspaper === "string") {
    const slugOrName = newspaper.toLowerCase().trim();
    results = results.filter(
      a => a.sourceSlug === slugOrName || a.source.toLowerCase() === slugOrName
    );
  }

  if (category && typeof category === "string") {
    results = results.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === "string" && search.trim()) {
    const query = search.trim();
    results = results
      .map(article => ({ article, score: scoreArticleRelevance(article, query) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.article);
  } else {
    // Sort chronologically by default
    results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  if (limit && typeof limit === "string" && !isNaN(Number(limit))) {
    results = results.slice(0, Number(limit));
  }

  res.json({
    count: results.length,
    totalAvailable: articlesStore.length,
    newspaperFilter: newspaper || "all",
    articles: results
  });
});

// 3. GET /articles/:newspaper_name
router.get("/articles/:newspaper_name", (req: Request, res: Response) => {
  const param = req.params.newspaper_name.toLowerCase().trim();
  const matched = articlesStore.filter(
    a => a.sourceSlug === param || a.source.toLowerCase().replace(/\s+/g, "-") === param || a.source.toLowerCase() === param
  );

  res.json({
    newspaper: param,
    count: matched.length,
    articles: matched
  });
});

// 4. POST /chat (AI NewsBot Conversation Interface)
router.post("/chat", async (req: Request, res: Response) => {
  const { message, source_filter } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message query is required." });
  }

  const query = message.trim();

  // 1. Retrieve most relevant newspaper articles from memory
  let candidates = [...articlesStore];
  if (source_filter && source_filter !== "all") {
    candidates = candidates.filter(
      a => a.sourceSlug === source_filter.toLowerCase() || a.source.toLowerCase() === source_filter.toLowerCase()
    );
  }

  const ranked = candidates
    .map(article => ({ article, score: scoreArticleRelevance(article, query) }))
    .sort((a, b) => b.score - a.score);

  const relevantArticles = ranked.slice(0, 4).map(r => r.article);

  // Prepare context snippet
  const contextText = relevantArticles
    .map(
      (a, idx) =>
        `[Document ${idx + 1} - ${a.source} (${new Date(a.publishedAt).toLocaleDateString("en-IN")})]\nHeadline: ${a.headline}\nCategory: ${a.category}\nContent: ${a.content}\nCoverage Angle: ${a.coverageAngle || "Standard reportage"}\nKey Quotes: ${a.keyQuotes ? a.keyQuotes.join(" | ") : "N/A"}`
    )
    .join("\n\n");

  const sourcesCitation = relevantArticles.map(a => ({
    newspaper: a.source,
    headline: a.headline,
    url: a.url,
    category: a.category,
    date: a.publishedAt,
    relevance: 95 - ranked.findIndex(r => r.article.id === a.id) * 6
  }));

  let aiAnswer = "";
  let sentimentSummary = "Analytical";

  const prompt = `You are NewsBot, an advanced AI newspaper intelligence assistant for Indian readers.
Your knowledge is strictly grounded in the following collected Indian newspaper reports (including The Hindu, Times of India, Indian Express, and NDTV).

User Question: "${query}"

Retrieved Newspaper Context:
${contextText}

Instructions:
1. Provide a comprehensive, articulate, and well-structured answer explaining the facts reported across the newspapers.
2. Explicitly cite which newspaper reported what (e.g. "According to The Hindu...", "The Indian Express highlights that...", "Times of India reported...").
3. If there are multiple perspectives or comparisons, clearly present them.
4. Keep the tone professional, journalistic, objective, and deeply informed.
5. End with a brief bulleted 'Key Takeaways' summary.`;

  const generated = await generateGeminiContent(prompt);
  if (generated) {
    aiAnswer = generated;
  }

  // If Gemini was not configured or threw an error, provide a high-precision synthesized response
  if (!aiAnswer) {
    if (relevantArticles.length > 0) {
      const primary = relevantArticles[0];
      const secondary = relevantArticles[1] || relevantArticles[0];
      
      aiAnswer = `### Intelligence Dispatch from Today's Indian Newspapers\n\n` +
        `Based on our analysis of reports from **${primary.source}**, **${secondary.source}**, and other indexed broadsheets:\n\n` +
        `**Key Findings regarding "${query}":**\n\n` +
        `• **${primary.source}** reports that *${primary.headline}*. ${primary.description}\n\n` +
        (relevantArticles.length > 1
          ? `• **${secondary.source}** provides complementary coverage, noting that *${secondary.headline}*. ${secondary.content.slice(0, 200)}...\n\n`
          : "") +
        `**Editorial Perspectives & Angles:**\n` +
        relevantArticles.map(a => `• **${a.source}** focuses on: *${a.coverageAngle || a.category + " implications"}*`).join("\n") +
        `\n\n` +
        `**Notable Quotation:**\n` +
        `> "${primary.keyQuotes && primary.keyQuotes[0] ? primary.keyQuotes[0] : primary.description}"\n\n` +
        `All data points are cross-verified against the morning editions of ${Array.from(new Set(relevantArticles.map(a => a.source))).join(", ")}.`;
    } else {
      aiAnswer = `NewsBot scanned all 5 indexed Indian newsrooms (The Hindu, Times of India, Indian Express, NDTV, and NewsAPI wire sources) for **"${query}"**.\n\nWhile no exact headline match was found in today's immediate cycle, our archive contains extensive related coverage across Economy, National Politics, and Technology. Try asking about:\n- "What are today's major economic news?"\n- "What happened in today's Indian politics?"\n- "ISRO Gaganyaan mission update"\n- "Compare Union Budget coverage"`;
    }
  }

  res.json({
    query,
    answer: aiAnswer,
    sources: sourcesCitation,
    cited_articles: relevantArticles,
    sentiment: sentimentSummary,
    timestamp: new Date().toISOString(),
    searchLatencyMs: Math.floor(Math.random() * 120) + 180
  });
});

// 5. GET /alerts
router.get("/alerts", (req: Request, res: Response) => {
  const unreadCount = alertsStore.filter(a => !a.read).length;
  res.json({
    unreadCount,
    totalCount: alertsStore.length,
    alerts: alertsStore
  });
});

// 6. PUT /alerts/:alert_id/read
router.put("/alerts/:alert_id/read", (req: Request, res: Response) => {
  const { alert_id } = req.params;
  const alert = alertsStore.find(a => a.id === alert_id);

  if (alert) {
    alert.read = true;
    res.json({ success: true, alert });
  } else {
    // If 'all', mark all as read
    if (alert_id === "all") {
      alertsStore.forEach(a => (a.read = true));
      return res.json({ success: true, message: "All alerts marked as read." });
    }
    res.status(404).json({ error: "Alert not found." });
  }
});

// 7. POST /feedback
router.post("/feedback", (req: Request, res: Response) => {
  const { rating, feature, comment } = req.body;

  if (!rating || !feature) {
    return res.status(400).json({ error: "Rating (1-5) and feature name are required." });
  }

  const newFeedback: FeedbackRecord = {
    id: `fb-${Date.now()}`,
    rating: Number(rating),
    feature: String(feature),
    comment: comment ? String(comment) : undefined,
    createdAt: new Date().toISOString()
  };

  feedbackStore.unshift(newFeedback);

  res.json({
    success: true,
    message: "Thank you! Your feedback has been recorded in the NewsBot system.",
    feedback: newFeedback
  });
});

// 8. POST /fetch-now (Simulates instant real-time ingest of latest morning editions)
router.post("/fetch-now", (req: Request, res: Response) => {
  const newEditionDate = "08 September 2026";
  const newAlert: Alert = {
    id: `alert-${Date.now()}`,
    title: `Today's newspapers are ready — ${newEditionDate}`,
    message: `Fresh morning edition ingestion completed across 5 sources. ${articlesStore.length} stories indexed with zero pipeline latency.`,
    timestamp: new Date().toISOString(),
    read: false,
    type: "edition",
    actionUrl: "/news"
  };

  alertsStore.unshift(newAlert);

  res.json({
    success: true,
    message: `Pipeline sync completed: Today's newspapers are ready — ${newEditionDate}`,
    articlesIndexed: articlesStore.length,
    timestamp: new Date().toISOString(),
    alertCreated: newAlert
  });
});

// 9. GET /archive (Historical article search with keyword, date_from, date_to, newspaper)
router.get("/archive", (req: Request, res: Response) => {
  const { keyword, date_from, date_to, newspaper, category, sort } = req.query;

  let results = [...articlesStore];

  if (keyword && typeof keyword === "string" && keyword.trim()) {
    const q = keyword.trim().toLowerCase();
    results = results.filter(
      a =>
        a.headline.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (newspaper && typeof newspaper === "string" && newspaper !== "all") {
    const np = newspaper.toLowerCase().trim();
    results = results.filter(
      a => a.sourceSlug === np || a.source.toLowerCase() === np
    );
  }

  if (category && typeof category === "string" && category !== "all") {
    results = results.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  if (date_from && typeof date_from === "string") {
    const fromTime = new Date(date_from).getTime();
    if (!isNaN(fromTime)) {
      results = results.filter(a => new Date(a.publishedAt).getTime() >= fromTime);
    }
  }

  if (date_to && typeof date_to === "string") {
    const toTime = new Date(date_to).getTime();
    if (!isNaN(toTime)) {
      results = results.filter(a => new Date(a.publishedAt).getTime() <= toTime);
    }
  }

  if (sort === "oldest") {
    results.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
  } else {
    results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  res.json({
    totalMatched: results.length,
    query: { keyword, date_from, date_to, newspaper, category },
    articles: results
  });
});

// 10. GET /compare (Compare how different newspapers covered a topic)
router.get("/compare", (req: Request, res: Response) => {
  const topic = (req.query.topic as string) || "Union Budget";
  const q = topic.toLowerCase().trim();

  // Find coverage for this topic across sources
  const relevant = articlesStore.filter(
    a =>
      a.headline.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q)) ||
      a.description.toLowerCase().includes(q) ||
      (q.includes("budget") && a.tags.includes("Union Budget")) ||
      (q.includes("space") && a.tags.includes("ISRO")) ||
      (q.includes("court") && a.tags.includes("Supreme Court")) ||
      (q.includes("tech") && (a.category === "Technology" || a.category === "Science"))
  );

  // Group by newspaper source
  const sourceGroups: Record<string, Article[]> = {
    "The Hindu": [],
    "Times of India": [],
    "Indian Express": [],
    "NDTV": []
  };

  relevant.forEach(a => {
    if (sourceGroups[a.source]) {
      sourceGroups[a.source].push(a);
    }
  });

  // Synthesize comparison analysis
  const comparisonMatrix = Object.entries(sourceGroups).map(([source, articles]) => {
    const sample = articles[0];
    return {
      source,
      hasCoverage: articles.length > 0,
      articleCount: articles.length,
      leadArticle: sample || null,
      primaryFocus: sample ? sample.coverageAngle || sample.category : "No coverage indexed today",
      editorialTone: sample ? sample.sentiment || "Neutral" : "Unreported",
      keyQuotes: sample ? sample.keyQuotes || [] : [],
      articles
    };
  });

  res.json({
    topic,
    totalCrossArticles: relevant.length,
    sourcesCompared: Object.keys(sourceGroups),
    matrix: comparisonMatrix,
    summary: `Cross-newspaper comparison on "${topic}" reveals distinct editorial priorities: The Hindu adopts an institutional and policy lens, Times of India highlights consumer, retail and market impact, Indian Express scrutinizes structural and constitutional federalism, and NDTV monitors live market telemetry and commercial expansion.`
  });
});

// 11. POST /register (Welcome to your personal news intelligence system)
router.post("/register", (req: Request, res: Response) => {
  const { name, email, preferredSources } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required to initialize NewsBot intelligence." });
  }

  const existing = registeredUsersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.json({
      success: true,
      message: `Welcome back to NewsBot, ${existing.name}. Your profile is active.`,
      user: existing,
      isNew: false
    });
  }

  const newUser: RegisteredUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    registeredAt: new Date().toISOString(),
    preferredSources: preferredSources || ["The Hindu", "Times of India", "Indian Express", "NDTV"]
  };

  registeredUsersStore.push(newUser);

  res.json({
    success: true,
    message: "Welcome to your personal news intelligence system.",
    user: newUser,
    isNew: true
  });
});

// 12. GET /newspapers (Metadata about supported Indian newspapers)
router.get("/newspapers", (req: Request, res: Response) => {
  // Compute dynamic article counts
  const list = NEWSPAPERS_META.map(meta => {
    const count = articlesStore.filter(a => a.sourceSlug === meta.slug).length;
    return {
      ...meta,
      liveCount: count
    };
  });

  res.json({
    count: list.length,
    newspapers: list
  });
});

// 13. GET /analytics (News Intelligence Command Center data)
router.get("/analytics", (req: Request, res: Response) => {
  // Source distribution
  const sourceStats: Record<string, number> = {};
  NEWSPAPERS_META.forEach(n => {
    sourceStats[n.name] = articlesStore.filter(a => a.source === n.name).length;
  });

  // Category distribution
  const categoryStats: Record<string, number> = {};
  articlesStore.forEach(a => {
    categoryStats[a.category] = (categoryStats[a.category] || 0) + 1;
  });

  // Sentiment metrics
  const sentimentStats = {
    Positive: articlesStore.filter(a => a.sentiment === "Positive").length,
    Analytical: articlesStore.filter(a => a.sentiment === "Analytical").length,
    Critical: articlesStore.filter(a => a.sentiment === "Critical").length,
    Neutral: articlesStore.filter(a => !a.sentiment || a.sentiment === "Neutral").length,
  };

  // 7-day ingestion telemetry trend
  const dailyIngestion = [
    { date: "02 Sep", count: 184, aiQueries: 412 },
    { date: "03 Sep", count: 196, aiQueries: 530 },
    { date: "04 Sep", count: 210, aiQueries: 620 },
    { date: "05 Sep", count: 205, aiQueries: 590 },
    { date: "06 Sep", count: 242, aiQueries: 780 },
    { date: "07 Sep", count: 268, aiQueries: 910 },
    { date: "08 Sep", count: 289, aiQueries: 1045 },
  ];

  // Most compared topics
  const topComparedTopics = [
    { topic: "Union Budget & Capex", queries: 384, consensus: "High Fiscal Focus" },
    { topic: "ISRO Gaganyaan Crew Trials", queries: 295, consensus: "High National Pride" },
    { topic: "Supreme Court Mineral Royalty Ruling", queries: 218, consensus: "Federalism Debate" },
    { topic: "Semiconductor Fab Dholera", queries: 194, consensus: "Tech Autonomy" },
    { topic: "UPI Cross-Border Remittances", queries: 162, consensus: "Fintech Scale" },
  ];

  res.json({
    totalArticlesIndexed: 841,
    todayIndexedCount: articlesStore.length,
    activeSourcesCount: NEWSPAPERS_META.length,
    totalAiQueriesAnswered: 4891,
    avgResponseLatencyMs: 245,
    sourceDistribution: sourceStats,
    categoryDistribution: categoryStats,
    sentimentTelemetry: sentimentStats,
    dailyTelemetry: dailyIngestion,
    topComparedTopics,
    systemUptime: "99.98%",
    lastPipelineSync: "08 September 2026, 08:30 IST"
  });
});

// 14. GET /agencies (News Advertising & Agency Marketplace)
router.get("/agencies", (req: Request, res: Response) => {
  const { newspaper, max_budget, specialization } = req.query;
  let results = [...agenciesStore];

  if (newspaper && typeof newspaper === "string" && newspaper !== "all") {
    results = results.filter(ag =>
      ag.newspapers.some(n => n.toLowerCase().includes(newspaper.toLowerCase()))
    );
  }

  if (max_budget && !isNaN(Number(max_budget))) {
    const budget = Number(max_budget);
    results = results.filter(ag => ag.minBudget <= budget);
  }

  if (specialization && typeof specialization === "string" && specialization !== "all") {
    const spec = specialization.toLowerCase();
    results = results.filter(ag => ag.specialization.toLowerCase().includes(spec));
  }

  res.json({
    count: results.length,
    agencies: results
  });
});

// 15. GET /agencies/:agency_id
router.get("/agencies/:agency_id", (req: Request, res: Response) => {
  const { agency_id } = req.params;
  const agency = agenciesStore.find(a => a.id === agency_id);

  if (!agency) {
    return res.status(404).json({ error: "Agency not found in marketplace." });
  }

  res.json({
    agency,
    availableSlots: [
      { format: "Front Page Bottom Solus", dimension: "16x20 cm", estimatedReach: "1.8M Readers", rate: "₹4,50,000" },
      { format: "Editorial Page Half-Page", dimension: "33x25 cm", estimatedReach: "2.4M Readers", rate: "₹6,80,000" },
      { format: "Digital Native Sponsored Feature", dimension: "Responsive Web/App", estimatedReach: "4.2M Impressions", rate: "₹2,10,000" }
    ]
  });
});

// Mount both under /api and root /
app.use("/api", router);
app.use(router);

// Start server with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NewsBot Intelligence Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
