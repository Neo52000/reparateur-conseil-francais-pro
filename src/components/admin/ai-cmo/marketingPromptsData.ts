// Static index of AI-CMO Marketing Prompt Collection
// Source: https://github.com/AICMO/AiCMO-Marketing-Prompt-Collection

export interface MarketingPrompt {
  title: string;
  difficulty: 'Debutant' | 'Intermediaire' | 'Avance';
  timeEstimate: string;
  githubPath: string;
}

export interface PromptSubcategory {
  name: string;
  prompts: MarketingPrompt[];
}

export interface PromptCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: PromptSubcategory[];
}

const GITHUB_BASE = 'https://github.com/AICMO/AiCMO-Marketing-Prompt-Collection/blob/main';

export const marketingPromptsData: PromptCategory[] = [
  {
    id: 'cmo-leadership',
    name: 'CMO & Leadership',
    icon: 'crown',
    subcategories: [
      {
        name: 'Strategie & Planification',
        prompts: [
          { title: 'Annual Marketing Strategy Framework', difficulty: 'Avance', timeEstimate: '30 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Strategy-&-Planning/Annual-Marketing-Strategy-Framework.md` },
          { title: 'Quarterly Strategic Review', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Strategy-&-Planning/Quarterly-Strategic-Review.md` },
          { title: 'Market Expansion Strategy', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Strategy-&-Planning/Market-Expansion-Strategy.md` },
          { title: 'Competitive Landscape Analysis', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Strategy-&-Planning/Competitive-Landscape-Analysis.md` },
          { title: 'Budget Allocation Framework', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Strategy-&-Planning/Budget-Allocation-Framework.md` },
        ],
      },
      {
        name: 'Brand Stewardship',
        prompts: [
          { title: 'Brand Voice & Identity Guidelines', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Brand-Stewardship/Brand-Voice-Identity-Guidelines.md` },
          { title: 'Brand Health Assessment', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Brand-Stewardship/Brand-Health-Assessment.md` },
          { title: 'Brand Positioning Strategy', difficulty: 'Avance', timeEstimate: '30 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Brand-Stewardship/Brand-Positioning-Strategy.md` },
          { title: 'Crisis Communication Framework', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Brand-Stewardship/Crisis-Communication-Framework.md` },
        ],
      },
      {
        name: 'Reporting & ROI',
        prompts: [
          { title: 'Executive Marketing Report', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Reporting-&-ROI/Executive-Marketing-Report.md` },
          { title: 'Marketing ROI Calculator', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Reporting-&-ROI/Marketing-ROI-Calculator.md` },
          { title: 'Attribution Model Builder', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Reporting-&-ROI/Attribution-Model-Builder.md` },
        ],
      },
      {
        name: 'Team Building & Org Design',
        prompts: [
          { title: 'Marketing Team Structure', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Team-Building-&-Org-Design/Marketing-Team-Structure.md` },
          { title: 'Hiring & Talent Assessment', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Team-Building-&-Org-Design/Hiring-Talent-Assessment.md` },
          { title: 'Agency Management Framework', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/01_CMO-&-Leadership/Team-Building-&-Org-Design/Agency-Management-Framework.md` },
        ],
      },
    ],
  },
  {
    id: 'product-marketing',
    name: 'Product Marketing',
    icon: 'package',
    subcategories: [
      {
        name: 'Positionnement & Messaging',
        prompts: [
          { title: 'Value Proposition & Hero Narrative', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Positioning-&-Messaging/Value-Proposition-&-Hero-Narrative-Identification.md` },
          { title: 'Competitive Positioning Matrix', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Positioning-&-Messaging/Competitive-Positioning-Matrix.md` },
          { title: 'Feature-to-Benefit Translator', difficulty: 'Debutant', timeEstimate: '10 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Positioning-&-Messaging/Feature-to-Benefit-Translator.md` },
        ],
      },
      {
        name: 'Go-To-Market Strategy',
        prompts: [
          { title: 'GTM Launch Playbook', difficulty: 'Avance', timeEstimate: '30 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Go-To-Market-Strategy/GTM-Launch-Playbook.md` },
          { title: 'Market Segmentation Engine', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Go-To-Market-Strategy/Market-Segmentation-Engine.md` },
          { title: 'Customer Persona Builder', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Go-To-Market-Strategy/Customer-Persona-Builder.md` },
          { title: 'B2B Customer Segmentation to GTM Alignment', difficulty: 'Avance', timeEstimate: '30 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Go-To-Market-Strategy/AI-Powered-B2B-Customer-Segmentation-to-GTM-Motion-Alignment-&-Revenue-Segment-Intelligence-Engine.md` },
        ],
      },
      {
        name: 'Recherche Client & Marche',
        prompts: [
          { title: 'Customer Research Interview Script', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Customer-&-Market-Research/Customer-Research-Interview-Script.md` },
          { title: 'Win/Loss Analysis Framework', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Customer-&-Market-Research/Win-Loss-Analysis-Framework.md` },
          { title: 'Voice of Customer Analyzer', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Customer-&-Market-Research/Voice-of-Customer-Analyzer.md` },
        ],
      },
      {
        name: 'Sales Enablement',
        prompts: [
          { title: 'Sales Deck Generator', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Sales-Enablement/Sales-Deck-Generator.md` },
          { title: 'Battle Card Creator', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Sales-Enablement/Battle-Card-Creator.md` },
          { title: 'Objection Handling Library', difficulty: 'Debutant', timeEstimate: '10 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Sales-Enablement/Objection-Handling-Library.md` },
        ],
      },
      {
        name: 'Pricing & Testing',
        prompts: [
          { title: 'Pricing Strategy Framework', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Pricing-Testing/Pricing-Strategy-Framework.md` },
          { title: 'A/B Pricing Test Designer', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/02_Product-Marketing/Pricing-Testing/AB-Pricing-Test-Designer.md` },
        ],
      },
    ],
  },
  {
    id: 'content-creative',
    name: 'Contenu & Creatif',
    icon: 'pen-tool',
    subcategories: [
      {
        name: 'Blog & Articles',
        prompts: [
          { title: 'SEO Blog Post Generator', difficulty: 'Debutant', timeEstimate: '10 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Blog-&-Article-Writing/SEO-Blog-Post-Generator.md` },
          { title: 'Thought Leadership Article', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Blog-&-Article-Writing/Thought-Leadership-Article.md` },
          { title: 'Pillar Content Strategy', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Blog-&-Article-Writing/Pillar-Content-Strategy.md` },
          { title: 'Content Repurposing Engine', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Blog-&-Article-Writing/Content-Repurposing-Engine.md` },
        ],
      },
      {
        name: 'Social Media',
        prompts: [
          { title: 'Social Media Calendar Builder', difficulty: 'Debutant', timeEstimate: '10 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Social-Media-Content/Social-Media-Calendar-Builder.md` },
          { title: 'LinkedIn Thought Leadership', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Social-Media-Content/LinkedIn-Thought-Leadership.md` },
          { title: 'Platform-Specific Content Adapter', difficulty: 'Debutant', timeEstimate: '10 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Social-Media-Content/Platform-Specific-Content-Adapter.md` },
        ],
      },
      {
        name: 'Contenu Viral',
        prompts: [
          { title: 'Viral Hook Generator', difficulty: 'Intermediaire', timeEstimate: '10 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Viral-Content-Ideation-Creation-Transformation/Viral-Hook-Generator.md` },
          { title: 'Trend Hijacking Playbook', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Viral-Content-Ideation-Creation-Transformation/Trend-Hijacking-Playbook.md` },
          { title: 'Meme Marketing Framework', difficulty: 'Debutant', timeEstimate: '10 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Viral-Content-Ideation-Creation-Transformation/Meme-Marketing-Framework.md` },
        ],
      },
      {
        name: 'Copywriting & SEO',
        prompts: [
          { title: 'Ad & Website Copywriting', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Ad-&-Website-Copywriting/Ad-Website-Copywriting.md` },
          { title: 'Landing Page Copy Framework', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Ad-&-Website-Copywriting/Landing-Page-Copy-Framework.md` },
          { title: 'Email Subject Line Generator', difficulty: 'Debutant', timeEstimate: '5 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Ad-&-Website-Copywriting/Email-Subject-Line-Generator.md` },
        ],
      },
      {
        name: 'Video & Audio',
        prompts: [
          { title: 'Video Script Generator', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Video-&-Audio-Scripts/Video-Script-Generator.md` },
          { title: 'Podcast Episode Planner', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Podcast-Content-Production/Podcast-Episode-Planner.md` },
          { title: 'Video Marketing Strategy', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Video-Marketing/Video-Marketing-Strategy.md` },
        ],
      },
      {
        name: 'Case Studies & PR',
        prompts: [
          { title: 'Automated Case Study Generator', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Automated-Case-Study-Generation/Automated-Case-Study-Generator.md` },
          { title: 'Press Release Writer', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Press-Release-&-PR-Content/Press-Release-Writer.md` },
          { title: 'Customer Success Story Template', difficulty: 'Debutant', timeEstimate: '10 min', githubPath: `${GITHUB_BASE}/03_Content-&-Creative/Automated-Case-Study-Generation/Customer-Success-Story-Template.md` },
        ],
      },
    ],
  },
  {
    id: 'demand-lead-gen',
    name: 'Demand & Lead Generation',
    icon: 'target',
    subcategories: [
      {
        name: 'Email Marketing & Nurturing',
        prompts: [
          { title: 'Email Nurture Sequence Builder', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Email-Marketing-&-Nurturing/Email-Nurture-Sequence-Builder.md` },
          { title: 'Re-engagement Campaign', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Email-Marketing-&-Nurturing/Re-engagement-Campaign.md` },
          { title: 'Drip Campaign Optimizer', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Email-Marketing-&-Nurturing/Drip-Campaign-Optimizer.md` },
        ],
      },
      {
        name: 'Lead Generation',
        prompts: [
          { title: 'Lead Magnet Creator', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Lead-Generation-Campaigns/Lead-Magnet-Creator.md` },
          { title: 'Lead Scoring Model', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Lead-Generation-Campaigns/Lead-Scoring-Model.md` },
          { title: 'Webinar Funnel Builder', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Lead-Generation-Campaigns/Webinar-Funnel-Builder.md` },
        ],
      },
      {
        name: 'PPC & Paid Media',
        prompts: [
          { title: 'PPC Campaign Structure', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Paid-Advertising-&-PPC/PPC-Campaign-Structure.md` },
          { title: 'Ad Creative Variation Generator', difficulty: 'Debutant', timeEstimate: '10 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Paid-Advertising-&-PPC/Ad-Creative-Variation-Generator.md` },
          { title: 'ROAS Optimization Framework', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Paid-Advertising-&-PPC/ROAS-Optimization-Framework.md` },
        ],
      },
      {
        name: 'Growth Hacking',
        prompts: [
          { title: 'Growth Experiment Framework', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Growth-Experimentation/Growth-Experiment-Framework.md` },
          { title: 'Viral Loop Designer', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Growth-Experimentation/Viral-Loop-Designer.md` },
          { title: 'Product-Led Growth Playbook', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Growth-Experimentation/Product-Led-Growth-Playbook.md` },
        ],
      },
      {
        name: 'Inbound & Outbound',
        prompts: [
          { title: 'Inbound Marketing Strategy', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Inbound-Marketing/Inbound-Marketing-Strategy.md` },
          { title: 'Outbound Prospecting Sequences', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Outbound-Prospecting/Outbound-Prospecting-Sequences.md` },
          { title: 'Cold Email Personalization Engine', difficulty: 'Intermediaire', timeEstimate: '10 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Outbound-Marketing/Cold-Email-Personalization-Engine.md` },
        ],
      },
      {
        name: 'ABM & Community',
        prompts: [
          { title: 'ABM Target Account Strategy', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Account-Based-Marketing/ABM-Target-Account-Strategy.md` },
          { title: 'ABM Campaign Orchestrator', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Account-Based-Marketing/ABM-Campaign-Orchestrator.md` },
          { title: 'Community Building Playbook', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/04_Demand-&-Lead-Generation-&-Growth/Event-Marketing/Community-Building-Playbook.md` },
        ],
      },
    ],
  },
  {
    id: 'analytics-ops',
    name: 'Analytics & Marketing Ops',
    icon: 'bar-chart',
    subcategories: [
      {
        name: 'Performance & KPI',
        prompts: [
          { title: 'KPI Dashboard Builder', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/05_Analytics-&-Marketing-Operations/KPI-Dashboard-Creation/KPI-Dashboard-Builder.md` },
          { title: 'Campaign Performance Analyzer', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/05_Analytics-&-Marketing-Operations/Campaign-Performance-Analysis/Campaign-Performance-Analyzer.md` },
          { title: 'Marketing Attribution Report', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/05_Analytics-&-Marketing-Operations/Campaign-Performance-Analysis/Marketing-Attribution-Report.md` },
        ],
      },
      {
        name: 'Automation & Tech Stack',
        prompts: [
          { title: 'Marketing Automation Audit', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/05_Analytics-&-Marketing-Operations/MarTech-Stack-Optimization/Marketing-Automation-Audit.md` },
          { title: 'MarTech Stack Evaluator', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/05_Analytics-&-Marketing-Operations/MarTech-Stack-Optimization/MarTech-Stack-Evaluator.md` },
          { title: 'Data Integration Planner', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/05_Analytics-&-Marketing-Operations/MarTech-Stack-Optimization/Data-Integration-Planner.md` },
        ],
      },
      {
        name: 'Intelligence & Knowledge Base',
        prompts: [
          { title: 'Advanced Marketing Intelligence', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/05_Analytics-&-Marketing-Operations/Advanced-Marketing-Intelligence/Advanced-Marketing-Intelligence.md` },
          { title: 'AI Knowledge Base Manager', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/05_Analytics-&-Marketing-Operations/AI-Knowledge-Base-Management/AI-Knowledge-Base-Manager.md` },
          { title: 'Predictive Analytics Framework', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/05_Analytics-&-Marketing-Operations/Advanced-Marketing-Intelligence/Predictive-Analytics-Framework.md` },
        ],
      },
    ],
  },
  {
    id: 'market-playbooks',
    name: 'Playbooks par marche',
    icon: 'map',
    subcategories: [
      {
        name: 'B2B Marketing',
        prompts: [
          { title: 'B2B Content Marketing Playbook', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/06_Market-Specific-Playbooks/B2B-Marketing/B2B-Content-Marketing-Playbook.md` },
          { title: 'Enterprise Sales Enablement Kit', difficulty: 'Avance', timeEstimate: '30 min', githubPath: `${GITHUB_BASE}/06_Market-Specific-Playbooks/B2B-Marketing/Enterprise-Sales-Enablement-Kit.md` },
          { title: 'B2B Demand Gen Strategy', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/06_Market-Specific-Playbooks/B2B-Marketing/B2B-Demand-Gen-Strategy.md` },
        ],
      },
      {
        name: 'SaaS Marketing',
        prompts: [
          { title: 'SaaS Growth Framework', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/06_Market-Specific-Playbooks/SaaS-Marketing/SaaS-Growth-Framework.md` },
          { title: 'PLG Onboarding Optimizer', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/06_Market-Specific-Playbooks/SaaS-Marketing/PLG-Onboarding-Optimizer.md` },
          { title: 'SaaS Metrics & Benchmarking', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/06_Market-Specific-Playbooks/SaaS-Marketing/SaaS-Metrics-Benchmarking.md` },
          { title: 'Churn Prevention Playbook', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/06_Market-Specific-Playbooks/SaaS-Marketing/Churn-Prevention-Playbook.md` },
        ],
      },
      {
        name: 'D2C & Retail',
        prompts: [
          { title: 'D2C Brand Launch Playbook', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/06_Market-Specific-Playbooks/D2C-Retail/D2C-Brand-Launch-Playbook.md` },
          { title: 'E-commerce Conversion Optimizer', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/06_Market-Specific-Playbooks/D2C-Retail/E-commerce-Conversion-Optimizer.md` },
          { title: 'Customer Loyalty Program', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/06_Market-Specific-Playbooks/D2C-Retail/Customer-Loyalty-Program.md` },
        ],
      },
    ],
  },
  {
    id: 'hybrid-ai-team',
    name: 'Gestion equipe hybride IA',
    icon: 'users',
    subcategories: [
      {
        name: 'Collaboration IA-Humain',
        prompts: [
          { title: 'AI-Human Workflow Designer', difficulty: 'Avance', timeEstimate: '25 min', githubPath: `${GITHUB_BASE}/07_Hybrid-AI-Team-Management/AI-Human-Workflow-Designer.md` },
          { title: 'AI Task Delegation Framework', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/07_Hybrid-AI-Team-Management/AI-Task-Delegation-Framework.md` },
          { title: 'Marketing Team AI Adoption', difficulty: 'Intermediaire', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/07_Hybrid-AI-Team-Management/Marketing-Team-AI-Adoption.md` },
        ],
      },
      {
        name: 'Prompt Engineering',
        prompts: [
          { title: 'Prompt Library Builder', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/07_Hybrid-AI-Team-Management/Prompt-Library-Builder.md` },
          { title: 'Prompt Quality Assessor', difficulty: 'Intermediaire', timeEstimate: '10 min', githubPath: `${GITHUB_BASE}/07_Hybrid-AI-Team-Management/Prompt-Quality-Assessor.md` },
          { title: 'Chain-of-Thought Prompt Designer', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/07_Hybrid-AI-Team-Management/Chain-of-Thought-Prompt-Designer.md` },
        ],
      },
      {
        name: 'Ethique & Gouvernance',
        prompts: [
          { title: 'AI Ethics Checklist for Marketing', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/07_Hybrid-AI-Team-Management/AI-Ethics-Checklist-Marketing.md` },
          { title: 'AI Governance Framework', difficulty: 'Avance', timeEstimate: '20 min', githubPath: `${GITHUB_BASE}/07_Hybrid-AI-Team-Management/AI-Governance-Framework.md` },
          { title: 'Responsible AI Usage Policy', difficulty: 'Intermediaire', timeEstimate: '15 min', githubPath: `${GITHUB_BASE}/07_Hybrid-AI-Team-Management/Responsible-AI-Usage-Policy.md` },
        ],
      },
    ],
  },
];
