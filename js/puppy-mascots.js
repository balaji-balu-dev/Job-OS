/**
 * ==========================================================================
 * JobOS Puppy Mascots SVG & Animation Engine (js/puppy-mascots.js)
 * High-precision vector puppy mascots for all 7 AI agents and 8 states
 * ==========================================================================
 */

export function renderPuppyMascot(agentId, state = 'idle') {
  // Breed palettes & accessories
  const breeds = {
    'orchestrator': {
      fur: '#EAB308',      // Golden Retriever
      furDark: '#CA8A04',
      ear: '#A16207',
      vest: '#312E81',
      accessory: 'vest_badge',
      eye: '#1E293B'
    },
    'scout': {
      fur: '#D97706',      // Beagle
      furDark: '#B45309',
      ear: '#78350F',
      patch: '#FFFFFF',
      accessory: 'spectacles',
      eye: '#0F172A'
    },
    'job-intelligence': {
      fur: '#F97316',      // Corgi
      furDark: '#EA580C',
      ear: '#C2410C',
      bowtie: '#F59E0B',
      accessory: 'bowtie_loupe',
      eye: '#1E293B'
    },
    'application-agent': {
      fur: '#FDE047',      // Cream Shiba Inu
      furDark: '#EAB308',
      ear: '#D97706',
      accessory: 'pen_holster',
      eye: '#0F172A'
    },
    'tracking-agent': {
      fur: '#94A3B8',      // Slate Husky
      furDark: '#64748B',
      ear: '#475569',
      mask: '#F1F5F9',
      accessory: 'radar_tag',
      eye: '#0284C7'       // Blue husky eyes
    },
    'email-agent': {
      fur: '#B45309',      // Red Dachshund
      furDark: '#92400E',
      ear: '#78350F',
      accessory: 'courier_satchel',
      eye: '#1E293B'
    },
    'verification-agent': {
      fur: '#334155',      // Obsidian Frenchie
      furDark: '#1E293B',
      ear: '#0F172A',
      accessory: 'emerald_seal',
      eye: '#F8FAFC'
    }
  };

  const b = breeds[agentId] || breeds['orchestrator'];

  // State-specific modifiers
  const isWorking = state === 'working' || state === 'searching';
  const isThinking = state === 'thinking';
  const isWaiting = state === 'waiting';
  const isSuccess = state === 'success';
  const isError = state === 'error';
  const isAttention = state === 'attention';

  // Dynamic Accessories & Overlays
  let accessorySvg = '';
  if (b.accessory === 'vest_badge') {
    accessorySvg = `
      <!-- Orchestrator Navy Vest & Golden Star Badge -->
      <path d="M 32 64 Q 50 68 68 64 L 70 82 Q 50 86 30 82 Z" fill="${b.vest}" />
      <polygon points="50,69 52,74 57,74 53,77 55,82 50,79 45,82 47,77 43,74 48,74" fill="#FBBF24" />
    `;
  } else if (b.accessory === 'spectacles') {
    accessorySvg = `
      <!-- Scout Brass Monocle / Spectacles -->
      <circle cx="42" cy="46" r="8" fill="none" stroke="#FDE047" stroke-width="2" />
      <circle cx="58" cy="46" r="8" fill="none" stroke="#FDE047" stroke-width="2" />
      <line x1="50" y1="46" x2="50" y2="46" stroke="#FDE047" stroke-width="2" />
      <line x1="66" y1="46" x2="72" y2="44" stroke="#FDE047" stroke-width="1.5" />
    `;
  } else if (b.accessory === 'bowtie_loupe') {
    accessorySvg = `
      <!-- Intelligence Bowtie & Loupe -->
      <polygon points="44,64 50,67 44,70" fill="${b.bowtie}" />
      <polygon points="56,64 50,67 56,70" fill="${b.bowtie}" />
      <circle cx="50" cy="67" r="2.5" fill="#FFF" />
    `;
  } else if (b.accessory === 'pen_holster') {
    accessorySvg = `
      <!-- Application Quill Fountain Pen -->
      <rect x="68" y="58" width="5" height="18" rx="2" fill="#0D9488" transform="rotate(15 68 58)" />
      <polygon points="71,76 74,82 69,79" fill="#F59E0B" transform="rotate(15 68 58)" />
    `;
  } else if (b.accessory === 'radar_tag') {
    accessorySvg = `
      <!-- Tracking Agent Radar Tag -->
      <circle cx="50" cy="67" r="4" fill="#0284C7" />
      <path d="M 46 64 A 5 5 0 0 1 54 64" fill="none" stroke="#38BDF8" stroke-width="1.5" />
      <path d="M 44 61 A 8 8 0 0 1 56 61" fill="none" stroke="#7DD3FC" stroke-width="1.5" />
    `;
  } else if (b.accessory === 'courier_satchel') {
    accessorySvg = `
      <!-- Email Agent Courier Satchel -->
      <rect x="58" y="66" width="14" height="12" rx="2" fill="#78350F" />
      <line x1="38" y1="62" x2="62" y2="69" stroke="#92400E" stroke-width="2" />
      <circle cx="65" cy="72" r="2" fill="#FBBF24" />
    `;
  } else if (b.accessory === 'emerald_seal') {
    accessorySvg = `
      <!-- Verification Sentry Emerald Seal -->
      <circle cx="50" cy="67" r="5" fill="#059669" stroke="#34D399" stroke-width="1" />
      <polygon points="50,64 52,67 50,70 48,67" fill="#ECFDF5" />
    `;
  }

  // Expression & Mood Overlays
  let stateHeadClass = '';
  let expressionSvg = '';
  if (isThinking) {
    stateHeadClass = 'mascot-head';
    expressionSvg = `
      <!-- Thinking Bubbles -->
      <circle cx="70" cy="24" r="2.5" fill="#F59E0B" opacity="0.8">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="78" cy="16" r="4" fill="#F59E0B" opacity="0.9">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" begin="0.3s" repeatCount="indefinite" />
      </circle>
      <circle cx="88" cy="10" r="5.5" fill="#FBBF24">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
      </circle>
    `;
  } else if (isSuccess) {
    expressionSvg = `
      <!-- Subtle Golden Sparks / Starburst -->
      <path d="M 80 18 L 82 22 L 86 24 L 82 26 L 80 30 L 78 26 L 74 24 L 78 22 Z" fill="#FBBF24">
        <animate attributeName="transform" type="rotate" values="0 80 24; 360 80 24" dur="4s" repeatCount="indefinite" />
      </path>
    `;
  } else if (isError) {
    expressionSvg = `
      <!-- Friendly Alert Mark -->
      <circle cx="82" cy="20" r="7" fill="#F43F5E" />
      <text x="82" y="24" fill="#FFF" font-size="11" font-weight="bold" text-anchor="middle">!</text>
    `;
  } else if (isAttention) {
    expressionSvg = `
      <!-- Attention Envelope in Mouth -->
      <rect x="42" y="52" width="16" height="11" rx="2" fill="#FBBF24" stroke="#D97706" stroke-width="1" />
      <polyline points="42,53 50,59 58,53" fill="none" stroke="#B45309" stroke-width="1" />
    `;
  }

  // Keyboard / Desktop workstation if working
  let workDeskSvg = '';
  if (isWorking) {
    workDeskSvg = `
      <!-- Mini Laptop / Terminal -->
      <rect x="26" y="80" width="48" height="4" rx="1" fill="#475569" />
      <polygon points="32,74 68,74 72,80 28,80" fill="#334155" />
      <rect x="36" y="75" width="28" height="2" fill="#06B6D4" opacity="0.8">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="0.8s" repeatCount="indefinite" />
      </rect>
    `;
  }

  return `
    <svg class="puppy-svg mascot-${state} ${isWorking ? 'mascot-working' : ''} ${isThinking ? 'mascot-thinking' : ''} ${isWaiting ? 'mascot-waiting' : ''} ${isSuccess ? 'mascot-success' : ''}" 
         viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pup-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(0,0,0,0.35)" />
          <stop offset="100%" stop-color="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      <!-- Soft Ground Shadow -->
      <ellipse cx="50" cy="88" rx="30" ry="6" fill="url(#pup-shadow)" />

      <!-- Mascot Body Container (Breathing animation) -->
      <g class="mascot-breathing">
        
        <!-- Tail -->
        <g class="mascot-tail">
          <path d="M 28 72 C 16 66 12 50 18 46 C 22 44 26 56 30 68 Z" fill="${b.furDark}" />
        </g>

        <!-- Torso & Hind Legs -->
        <path d="M 30 62 C 30 52 70 52 70 62 L 72 82 C 72 85 68 86 64 86 C 60 86 58 82 58 78 L 42 78 C 42 82 40 86 36 86 C 32 86 28 85 28 82 Z" fill="${b.fur}" />

        <!-- Front Paws (with typing movement when working) -->
        <g class="mascot-paws">
          <ellipse cx="40" cy="82" rx="5" ry="4" fill="${b.furDark}" />
          <ellipse cx="60" cy="82" rx="5" ry="4" fill="${b.furDark}" />
        </g>

        <!-- Head Group (Tilts when thinking) -->
        <g class="${stateHeadClass}">
          <!-- Ears -->
          <g class="mascot-ears">
            <!-- Left Ear -->
            <path d="M 32 30 C 22 30 18 48 24 58 C 28 62 34 50 34 42 Z" fill="${b.ear}" />
            <!-- Right Ear -->
            <path d="M 68 30 C 78 30 82 48 76 58 C 72 62 66 50 66 42 Z" fill="${b.ear}" />
          </g>

          <!-- Head Base -->
          <circle cx="50" cy="42" r="22" fill="${b.fur}" />
          ${b.patch ? `<ellipse cx="50" cy="46" rx="12" ry="15" fill="${b.patch}" />` : ''}

          <!-- Snout & Nose -->
          <ellipse cx="50" cy="48" rx="9" ry="7" fill="${b.furDark}" />
          <polygon points="47,44 53,44 50,47" fill="#090C10" />
          <path d="M 50 47 L 50 50 M 47 50 Q 50 52 53 50" stroke="#090C10" stroke-width="1.2" fill="none" stroke-linecap="round" />

          <!-- Eyes -->
          <ellipse cx="41" cy="40" rx="3.5" ry="4" fill="${b.eye}" />
          <circle cx="40" cy="38.5" r="1.2" fill="#FFFFFF" />
          <ellipse cx="59" cy="40" rx="3.5" ry="4" fill="${b.eye}" />
          <circle cx="58" cy="38.5" r="1.2" fill="#FFFFFF" />

          <!-- Cheeks / Blushes -->
          <ellipse cx="36" cy="46" rx="3" ry="2" fill="rgba(244, 63, 94, 0.25)" />
          <ellipse cx="64" cy="46" rx="3" ry="2" fill="rgba(244, 63, 94, 0.25)" />

          <!-- Breed Accessory -->
          ${accessorySvg}
        </g>
        
        <!-- Work Station / Keyboard if Working -->
        ${workDeskSvg}

        <!-- Expressions (Thinking/Success/Attention) -->
        ${expressionSvg}
      </g>
    </svg>
  `;
}
