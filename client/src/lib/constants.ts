export const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget ($)" },
  { value: "moderate", label: "Moderate ($$)" },
  { value: "luxury", label: "Luxury ($$$)" },
  { value: "ultra-luxury", label: "Ultra Luxury ($$$$)" }
];

export const TRAVELER_OPTIONS = [
  { value: "1", label: "Solo traveler" },
  { value: "2", label: "Couple" },
  { value: "3-4", label: "Small group (3-4)" },
  { value: "5+", label: "Large group (5+)" },
  { value: "family", label: "Family with kids" }
];

export const INTEREST_OPTIONS = [
  { value: "culture", label: "Culture & History" },
  { value: "food", label: "Food & Dining" },
  { value: "adventure", label: "Adventure" },
  { value: "nature", label: "Nature & Outdoors" },
  { value: "relaxation", label: "Relaxation" },
  { value: "shopping", label: "Shopping" },
  { value: "nightlife", label: "Nightlife" },
  { value: "family", label: "Family-friendly" }
];

export const HIGHLIGHT_COLORS = {
  openai: {
    primary: "bg-blue-600",
    secondary: "bg-blue-500",
    light: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-500",
    borderLight: "border-blue-200"
  },
  anthropic: {
    primary: "bg-teal-600",
    secondary: "bg-teal-500",
    light: "bg-teal-100",
    text: "text-teal-600",
    border: "border-teal-500",
    borderLight: "border-teal-200"
  }
};

export const STOCK_IMAGES = {
  destinations: [
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", // Paris
    "https://images.unsplash.com/photo-1531572753322-ad063cecc140?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", // Tokyo
    "https://images.unsplash.com/photo-1561729047-375330890d36?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", // London
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", // New York
    "https://images.unsplash.com/photo-1522083165195-3424ed129620?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", // Santorini
    "https://images.unsplash.com/photo-1543906965-f9520aa2ed8a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", // Bali
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", // Rome
    "https://images.unsplash.com/photo-1503501883941-a9232c26578a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", // Barcelona
  ],
  hotels: [
    "https://images.unsplash.com/photo-1589923158684-a21ea36a084f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Luxury hotel lobby
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Hotel suite
    "https://images.unsplash.com/photo-1559841644-08984562005a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Resort pool
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Hotel exterior
  ],
  activities: [
    "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // City tour
    "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Cooking class
    "https://images.unsplash.com/photo-1587974828695-6b9304abf45c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Hiking
    "https://images.unsplash.com/photo-1519642918088-1c6162c6b4dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Beach activity
  ],
  landmarks: [
    "https://images.unsplash.com/photo-1609690438220-df05efd09ad4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Eiffel Tower
    "https://images.unsplash.com/photo-1546281341-f172f5749086?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Colosseum
    "https://images.unsplash.com/photo-1555804843-2d279c07bdd5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Taj Mahal
    "https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80", // Golden Gate Bridge
  ]
};
