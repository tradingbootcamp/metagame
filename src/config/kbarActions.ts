import type { Action } from 'kbar';
import { SOCIAL_LINKS } from '../config';
import { coinCount } from '../stores/coinStore';

// Define our custom action type
interface CustomAction extends Action {
  section?: string;
  icon?: string;
  subtitle?: string;
}

const actionActions: CustomAction[] = [
  {
    id: "pay-respects",
    name: "Pay Respects",
    section: "Actions",
    icon: "🫡",
    shortcut: ["f"],
    perform: () => {
      const coins = coinCount.get();
      const cost = 1;
      if (coins >= cost) { // Assuming it costs 1 coin to pay respects
        coinCount.set(coins - cost);
        alert("You have paid your respects. 🫡");
      } else {
        alert(`Sorry, you need ${cost} coin${cost == 1 ? '' : 's'} to pay respects. You only have ${coins} coin${coins == 1 ? '' : 's'}.`);
      }
    }
  },
  {
    id: "doubt",
    name: "Doubt",
    section: "Actions",
    icon: "🤔",
    shortcut: ["X"],
    perform: () => {
      alert("You have doubted.");
    }
  },
  {
    id: "theme-toggle",
    name: "Theme Toggle",
    section: "Actions",
    icon: "🎨",
    shortcut: ["t"],
    perform: () => window.location.pathname = "/themeToggle"
  }
]

// Navigation Actions
const navigationActions: CustomAction[] = [
  {
    id: "home",
    name: "Home",
    shortcut: ["h"],
    keywords: "home main landing",
    section: "Navigation",
    icon: "🏠",
    perform: () => window.location.pathname = "/"
  },
  {
    id: "tickets",
    name: "Buy Tickets",
    shortcut: ["t"],
    keywords: "purchase buy register",
    section: "Navigation",
    icon: "🎫",
    perform: () => window.location.href = "/#tickets"
  },
  {
    id: "faq",
    name: "FAQ",
    shortcut: ["q"],
    keywords: "frequently asked questions",
    section: "Navigation",
    icon: "❓",
    perform: () => window.location.pathname = "/faq"
  }
];

// Game Actions
const gameActions: CustomAction[] = [
  // {
  //   id: "games",
  //   name: "Games",
  //   section: "Games",
  //   icon: "🎮",
  //   subtitle: "Browse all games"
  // },
  // {
  //   id: "crossword",
  //   name: "Play Crossword",
  //   section: "Games",
  //   icon: "📝",
  //   shortcut: ["c"],
  //   perform: () => window.location.pathname = "/games/crossword"
  // },
  {
    id: "set",
    name: "Play Set",
    section: "Games",
    icon: "🃏",
    subtitle: "Or like, mess with the current version of what Brian's working on",
    shortcut: ["s"],
    perform: () => window.location.pathname = "/set"
  }
];

// Social Actions
const socialActions: CustomAction[] = [
  {
    id: "twitter",
    name: "Twitter",
    section: "Social",
    icon: "🐦",
    shortcut: ["t"],
    perform: () => window.open(SOCIAL_LINKS.TWITTER, "_blank")
  },
  {
    id: "discord",
    name: "Discord",
    section: "Social",
    icon: "💬",
    shortcut: ["d"],
    perform: () => window.open(SOCIAL_LINKS.DISCORD, "_blank")
  }
];

export const staticActions = [
  ...actionActions,
  ...navigationActions,
  ...gameActions,
  ...socialActions
]; 