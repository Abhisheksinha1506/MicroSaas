/**
 * Card Tricks - Interactivity Script
 * Updated to use Supabase for persistent cross-user voting.
 */

console.log('Card Tricks script initialized (Supabase Mode).');

// --- Performance Optimizations ---
// Debounce function to prevent excessive API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- Supabase Configuration ---
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';
let sbClient = null;

async function loadEnv() {
    // Check if variables are loaded via config.js (build-time or file:// protocol)
    if (window.ENV) {
        SUPABASE_URL = window.ENV.SUPABASE_URL;
        SUPABASE_ANON_KEY = window.ENV.SUPABASE_ANON_KEY;
        
        if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL') {
            sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase initialized with config.js values.');
            return;
        }
    }

    // Fallback: try to load .env file for local development
    try {
        const response = await fetch('.env');
        const text = await response.text();

        // Basic .env parser
        const lines = text.split('\n');
        lines.forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                if (key.trim() === 'SUPABASE_URL') SUPABASE_URL = value;
                if (key.trim() === 'SUPABASE_ANON_KEY') SUPABASE_ANON_KEY = value;
            }
        });

        if (SUPABASE_URL && SUPABASE_ANON_KEY) {
            sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase initialized with .env values.');
        }
    } catch (err) {
        console.warn('Could not load environment variables. Falling back to default behavior.');
        showConfigurationMessage();
    }
}

// --- Configuration Helper ---
function showConfigurationMessage() {
    // Create a configuration notice
    const notice = document.createElement('div');
    notice.id = 'config-notice';
    notice.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff8a00, #e52e71);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: 'DM Mono', monospace;
        font-size: 12px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    notice.innerHTML = `
        <strong>⚠️ Database Not Configured</strong><br>
        <small>Voting is disabled. Add Supabase credentials to enable.</small>
        <br><br>
        <small>See config.example.js for instructions.</small>
    `;
    
    document.body.appendChild(notice);
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (notice.parentNode) {
            notice.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notice.remove(), 300);
        }
    }, 10000);
}

// --- Live Vote Counts ---
// Debounced version to prevent API rate limiting
const debouncedFetchVoteCounts = debounce(async function() {
    await fetchVoteCounts();
}, 300);

async function fetchVoteCounts() {
    if (!sbClient) return;

    try {
        const { data, error } = await sbClient
            .from('votes')
            .select('idea_index');

        if (error) throw error;

        // Count votes per idea
        const counts = {};
        data.forEach(vote => {
            counts[vote.idea_index] = (counts[vote.idea_index] || 0) + 1;
        });

        // Update UI
        document.querySelectorAll('.vote-count').forEach(el => {
            const index = parseInt(el.getAttribute('data-index'));
            const count = counts[index] || 0;
            el.innerText = `${count} ${count === 1 ? 'vote' : 'votes'}`;
        });

        console.log('Vote counts updated from Supabase.');
    } catch (err) {
        console.error('Failed to fetch vote counts:', err.message);
    }
}

// Embedded data to bypass CORS restricted fetch() on file:// protocol
const ideasData = [
    {
        "heading": "Document Intelligence API",
        "summary": "A lightning-fast Document Intelligence API that extracts structured data from any PDF, scanned image, invoice, or form into clean, ready-to-use JSON with 99% accuracy at literally 1/10th the cost of AWS Textract — letting startups, accountants, and SMBs automate document-heavy workflows without massive cloud bills or complex setup."
    },
    {
        "heading": "Auto Repair Shop Management",
        "summary": "All-in-one cloud platform that replaces the chaotic pen-and-paper systems still used by 180K+ independent auto repair shops with digital job cards, inventory tracking, customer CRM, invoicing, and technician scheduling — finally giving small garage owners the modern tools that big chains have had for years."
    },
    {
        "heading": "Salon & Spa Operations Suite",
        "summary": "Mobile-first salon and spa management platform that delivers seamless online booking, real-time inventory, staff scheduling, client CRM, and automated marketing — everything Mindbody promised but never truly delivered for small independent salons and spas."
    },
    {
        "heading": "Spreadsheet to API Converter",
        "summary": "Instant Spreadsheet-to-API converter that lets you upload any Excel or Google Sheet and immediately get a secure, live REST API with full CRUD operations, authentication, and webhooks — turning business data into production-ready endpoints in under 60 seconds with zero coding."
    },
    {
        "heading": "Compliance-First Vendor Manager",
        "summary": "Automated, proactive SaaS guardian that scans third-party vendors in real-time for compliance risks and regulatory changes, delivering instant alerts and dashboards so B2B teams stay audit-ready without manual effort — eliminating the expensive, error-prone quarterly reviews that leave companies exposed between audits."
    },
    {
        "heading": "Embedded Finance Validator",
        "summary": "Lightweight fintech validator that instantly stress-tests embedded finance integrations (payments, lending, BNPL) for compliance, fraud, and security risks, giving non-bank platforms a clear \"go/no-go\" report before launch — so startups avoid the six-figure regulatory fines that kill embedded finance products post-go-live."
    },
    {
        "heading": "Alternative Data Credit Risk API",
        "summary": "A B2B risk scoring API that aggregates alternative data points—such as utility payments, rental history, and income volatility—to predict default risk for the 'thin-file' market, solving the unit economics collapse that killed lenders like Tally and Plastiq by selling the 'shovel' (data intelligence) to smaller fintechs who cannot afford enterprise bureau contracts but desperately need to avoid high-risk subprime defaults."
    },
    {
        "heading": "ESG Compliance Badge Generator",
        "summary": "A self-serve compliance portal that enables small manufacturers and suppliers to upload operational data and instantly generate 'Compliance Ready' badges and audit-ready PDF reports, pivoting on the failure of enterprise-focused tools like Tallarna by targeting the SMEs who are desperate to satisfy the strict ESG requirements of massive buyers like Amazon and Walmart to avoid losing contracts."
    },
    {
        "heading": "AI Safety Layer for Multi-Agent Systems",
        "summary": "A real-time observability and safety platform that continuously monitors how multiple AI agents interact across workflows, tools, APIs, and shared data sources, building a live interaction graph of agent decisions and detecting conflicts such as goal misalignment, duplicate or contradictory actions, policy violations, race conditions, and hidden coordination failures. The system uses both rule-based detection and LLM-powered semantic reasoning to identify when agents are working against each other or creating downstream business risk, then assigns a quantified risk score, explains the conflict in plain English, and triggers alerts or automated guardrails before production impact occurs. Designed for companies deploying autonomous AI workflows, agent orchestration platforms, or multi-agent automation pipelines, it acts as a trust layer that enables safe scaling of AI agents without requiring humans to manually review every decision or interaction."
    },
    {
        "heading": "PrivacyScribe",
        "summary": "A local AI transcription tool that guarantees 100% HIPAA privacy by processing all audio entirely on-device, never sending patient data to the cloud — purpose-built for therapists, physicians, and clinics that need clinical-grade accuracy without the legal liability of third-party data handling."
    },
    {
        "heading": "Design Pulse",
        "summary": "An AI agent that ingests chaotic, scattered design feedback from Slack threads and Figma comments and transforms them into structured, de-duplicated, prioritized developer tickets — cutting the handoff gap between design and engineering that causes 40% of UI bugs and missed sprint deadlines."
    },
    {
        "heading": "Tutor Predict",
        "summary": "Predictive analytics platform for tutoring centers and online education businesses that flags at-risk students 2–4 weeks early based on login frequency, session length, and assignment completion patterns — giving educators time to intervene before churn, refund requests, or failed outcomes damage their reputation."
    },
    {
        "heading": "Logi Logic",
        "summary": "AI-driven inventory optimization that analyzes sales velocity, seasonal trends, and supplier lead times to help small e-commerce brands avoid the twin killers of overstocking (cash tied up in dead inventory) and stockouts (lost sales and expedited shipping costs that destroy margins)."
    },
    {
        "heading": "TOS Checker",
        "summary": "A specialized monitoring service that automatically audits weekly Terms of Service and privacy policy changes across the SaaS tools your business depends on, instantly flagging new legal risks, data ownership traps, or fee changes — so small businesses aren't blindsided by the contract updates that enterprise legal teams catch and they miss."
    },
    {
        "heading": "DeepSync",
        "summary": "A productivity bridge that detects when you open your IDE or enter focus mode and automatically mutes Slack, Teams, and email notifications while setting context-aware \"Deep Work\" statuses across all platforms — then restores everything the moment you stop coding, eliminating the context-switching tax that costs developers an average of 23 minutes of recovery time per interruption."
    },
    {
        "heading": "API Vitals",
        "summary": "A real-time monitoring dashboard that tracks the latency, uptime, error rates, and version changes of every external API your product depends on — proactively alerting your team before a third-party outage becomes your customer's support ticket and your team's all-hands incident response."
    },
    {
        "heading": "Treasury Safe",
        "summary": "A multi-bank cash management dashboard for founders and CFOs that monitors balances across all accounts in real time, recommends optimal distribution across FDIC-insured institutions, and alerts when concentration risk exceeds safe thresholds — the tool every startup wished existed the week Silicon Valley Bank collapsed."
    },
    {
        "heading": "Pod Manager",
        "summary": "An all-in-one billing, enrollment, and parent communication platform built specifically for the fast-growing learning pod and micro-school market, replacing the duct-taped combination of Venmo, Google Forms, and WhatsApp groups that pod educators currently use to run what are effectively small education businesses."
    },
    {
        "heading": "Curated Cart",
        "summary": "A white-label commerce tool that lets newsletter writers, influencers, and niche curators bundle and sell physical products from multiple retailers in a single unified checkout — monetizing their taste and audience trust without holding inventory, managing logistics, or building a storefront from scratch."
    }
];

const modal = document.getElementById('idea-modal');
const closeButton = document.querySelector('.close-button');
const modalTitle = document.getElementById('modal-title');
const modalSummary = document.getElementById('modal-summary');
const modalIdeaNumber = document.getElementById('modal-idea-number');
const voteButton = document.getElementById('vote-button');
const voteAcknowledgment = document.getElementById('vote-acknowledgment');

// Initialize local tracking (can stay as a second layer of protection)
let votedIndices = JSON.parse(localStorage.getItem('votedIdeas') || '[]');

// Initialize everything
(async () => {
    await loadEnv();
    await fetchVoteCounts();

    // Initialize click handlers for all cards
    document.querySelectorAll('.card').forEach((card, index) => {
        card.addEventListener('click', async () => {
            const idea = ideasData[index];
            const ideaNumText = card.querySelector('.card-header p').innerText;
            const currentIdeaIndex = index;

            if (idea) {
                modalTitle.innerText = idea.heading;
                modalSummary.innerText = idea.summary;
                modalIdeaNumber.innerText = ideaNumText;
                modal.setAttribute('data-current-index', currentIdeaIndex);

                // Update contact links
                const emailLink = document.getElementById('email-link');
                const subject = encodeURIComponent(`Regarding feedback for idea number ${ideaNumText}`);
                emailLink.href = `mailto:abhisheksinha1594@gmail.com?subject=${subject}`;

                // Check if current user has already voted (localStorage only)
                // We don't check database because it contains votes from ALL users
                // localStorage tracks only this user's votes
                let isVoted = votedIndices.includes(currentIdeaIndex);

                // Note: We don't need to check Supabase for existing votes
                // because that would show if ANYONE has voted, not just this user
                // localStorage is the correct way to track individual user votes

                if (isVoted) {
                    voteButton.style.display = 'none';
                    voteAcknowledgment.style.display = 'flex';
                } else {
                    voteButton.style.display = 'block';
                    voteAcknowledgment.style.display = 'none';
                }

                modal.style.display = 'flex';
            }

            // Visual feedback on card
            card.style.borderColor = 'var(--color1)';
            setTimeout(() => card.style.borderColor = 'var(--tag-border)', 500);
        });
    });

    // Close modal logic
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Vote button logic
    voteButton.addEventListener('click', async () => {
        const currentIndex = parseInt(modal.getAttribute('data-current-index'));

        if (!votedIndices.includes(currentIndex)) {
            // Optimistic UI update
            voteButton.style.display = 'none';
            voteAcknowledgment.style.display = 'flex';

            // Save to localStorage
            votedIndices.push(currentIndex);
            localStorage.setItem('votedIdeas', JSON.stringify(votedIndices));

            // Save to Supabase (if configured)
            if (sbClient && SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL') {
                try {
                    const { error } = await sbClient
                        .from('votes')
                        .insert([{ idea_index: currentIndex }]);

                    if (error) throw error;
                    console.log('Vote persisted to Supabase.');

                    // Refresh counts after successful vote (debounced)
                    debouncedFetchVoteCounts();
                } catch (err) {
                    console.error('Supabase save failed:', err.message);
                    // Show error message but keep the vote in localStorage
                    const errorMsg = document.createElement('div');
                    errorMsg.style.cssText = `
                        position: fixed;
                        top: 80px;
                        right: 20px;
                        background: #e74c3c;
                        color: white;
                        padding: 10px 15px;
                        border-radius: 4px;
                        font-family: 'DM Mono', monospace;
                        font-size: 11px;
                        z-index: 10000;
                    `;
                    errorMsg.textContent = '⚠️ Vote saved locally but sync failed';
                    document.body.appendChild(errorMsg);
                    setTimeout(() => errorMsg.remove(), 3000);
                }
            } else {
                // No database configured - vote saved locally only
                console.log('Vote saved locally (no database configured)');
            }
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
    });

    // Welcome Modal logic
    const welcomeModal = document.getElementById('welcome-modal');
    const closeWelcome = document.getElementById('close-welcome');
    const whyWebsiteTrigger = document.getElementById('why-website-trigger');

    // Show welcome modal on every visit
    welcomeModal.style.display = 'flex';

    // Show welcome modal when clicking "Why this website"
    if (whyWebsiteTrigger) {
        whyWebsiteTrigger.addEventListener('click', () => {
            welcomeModal.style.display = 'flex';
        });
    }

    if (closeWelcome) {
        closeWelcome.addEventListener('click', () => {
            welcomeModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === welcomeModal) {
            welcomeModal.style.display = 'none';
        }
    });

    // Contact Modal logic
    const contactTrigger = document.getElementById('contact-trigger');
    const contactModal = document.getElementById('contact-modal');
    const closeContact = document.getElementById('close-contact');

    if (contactTrigger) {
        contactTrigger.addEventListener('click', () => {
            contactModal.style.display = 'flex';
        });
    }

    if (closeContact) {
        closeContact.addEventListener('click', () => {
            contactModal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === contactModal) {
            contactModal.style.display = 'none';
        }
    });
})();
