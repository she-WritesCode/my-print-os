export interface PrintService {
  id: string;
  name: string;
  category: "apparel" | "largeFormat" | "stationery" | "framing" | "souvenirs";
  categoryLabel: string;
  pricingEngine: "matrix" | "area" | "perimeter" | "flatRate";
  displayTitle: string;
  bestFor: string;
  startingPrice: string;
  turnaround: string;
  imageUrl: string;
  isActive: boolean;
  unit: string;
}

export const PRINT_SERVICES: PrintService[] = [
  {
    id: "srv-custom-tshirt",
    name: "Full-Color Custom T-Shirt",
    category: "apparel",
    categoryLabel: "T-Shirts & Merch",
    pricingEngine: "matrix",
    displayTitle: "Premium Full-Color Custom T-Shirt",
    bestFor: "Vibrant multi-color graphics, brand merch, photo shoots",
    startingPrice: "₦4,500 / piece",
    turnaround: "24–48h Delivery",
    imageUrl: "/images/services/dtf-tshirt.jpg",
    isActive: true,
    unit: "piece",
  },
  {
    id: "srv-screen-tshirt",
    name: "Promotional Solid T-Shirt",
    category: "apparel",
    categoryLabel: "T-Shirts & Merch",
    pricingEngine: "matrix",
    displayTitle: "Bulk Promotional Printed T-Shirt",
    bestFor: "Bulk event giveaways, rallies, volunteer uniforms",
    startingPrice: "₦2,800 / piece",
    turnaround: "2–3 Days",
    imageUrl: "/images/categories/clothing.png",
    isActive: true,
    unit: "piece",
  },
  {
    id: "srv-embroidery-polo",
    name: "Stitched Corporate Polo",
    category: "apparel",
    categoryLabel: "T-Shirts & Merch",
    pricingEngine: "matrix",
    displayTitle: "Executive Embroidered Polo Shirt",
    bestFor: "Corporate office staff, luxury brand uniforms",
    startingPrice: "₦6,800 / piece",
    turnaround: "3–4 Days",
    imageUrl: "/images/categories/workwear.png",
    isActive: true,
    unit: "piece",
  },
  {
    id: "srv-flex-banner",
    name: "Outdoor Event Banner",
    category: "largeFormat",
    categoryLabel: "Banners & Signs",
    pricingEngine: "area",
    displayTitle: "Weatherproof Outdoor Flex Banner",
    bestFor: "Church programs, party backdrops, roadside announcements",
    startingPrice: "₦850 / sqft",
    turnaround: "Same-Day / 24h",
    imageUrl: "/images/categories/banners.png",
    isActive: true,
    unit: "sqft",
  },
  {
    id: "srv-rollup-banner",
    name: "Retractable Standup Banner",
    category: "largeFormat",
    categoryLabel: "Banners & Signs",
    pricingEngine: "area",
    displayTitle: "Luxury Retractable Roll-Up Banner Stand",
    bestFor: "Conferences, exhibitions, church lobbies, office receptions",
    startingPrice: "₦32,000 / unit",
    turnaround: "24h Express",
    imageUrl: "/images/services/rollup-banner.jpg",
    isActive: true,
    unit: "sqft",
  },
  {
    id: "srv-waterproof-sticker",
    name: "Waterproof Custom Stickers",
    category: "largeFormat",
    categoryLabel: "Banners & Signs",
    pricingEngine: "area",
    displayTitle: "Waterproof Die-Cut Stickers & Labels",
    bestFor: "Bottle labels, food packaging, window stickers, product branding",
    startingPrice: "₦1,200 / sqft",
    turnaround: "24h Express",
    imageUrl: "/images/categories/stickers.png",
    isActive: true,
    unit: "sqft",
  },
  {
    id: "srv-flyers",
    name: "Full-Color Marketing Flyers",
    category: "stationery",
    categoryLabel: "Flyers & Cards",
    pricingEngine: "matrix",
    displayTitle: "Glossy Marketing & Event Handout Flyers",
    bestFor: "Promotions, restaurant menus, church bulletins, event invites",
    startingPrice: "₦18,500 / 100 pcs",
    turnaround: "24–48h Delivery",
    imageUrl: "/images/categories/marketing.png",
    isActive: true,
    unit: "pack",
  },
  {
    id: "srv-business-cards",
    name: "Premium Business Cards",
    category: "stationery",
    categoryLabel: "Flyers & Cards",
    pricingEngine: "matrix",
    displayTitle: "Heavyweight Velvet Matte Business Cards",
    bestFor: "Executive networking, corporate branding",
    startingPrice: "₦12,000 / 100 pcs",
    turnaround: "24h Express",
    imageUrl: "/images/services/business-cards.jpg",
    isActive: true,
    unit: "pack",
  },
  {
    id: "srv-photo-frame",
    name: "Custom Picture & Canvas Frame",
    category: "framing",
    categoryLabel: "Frames & Canvas",
    pricingEngine: "perimeter",
    displayTitle: "Glass & Wood Photographic Frame",
    bestFor: "Portraits, wedding memories, certificates & wall art",
    startingPrice: "₦15,000 / frame",
    turnaround: "24–48h Delivery",
    imageUrl: "/images/services/photo-frame.jpg",
    isActive: true,
    unit: "unit",
  },
  {
    id: "srv-custom-mug",
    name: "Custom Branded Coffee Mug",
    category: "souvenirs",
    categoryLabel: "Mugs & Souvenirs",
    pricingEngine: "matrix",
    displayTitle: "Glossy Ceramic Branded Mug",
    bestFor: "Corporate gift boxes, birthday souvenirs, wedding favors",
    startingPrice: "₦3,200 / unit",
    turnaround: "24h Express",
    imageUrl: "/images/categories/drinkware.png",
    isActive: true,
    unit: "unit",
  },
];

export function getServiceById(id: string): PrintService | undefined {
  return PRINT_SERVICES.find((s) => s.id === id);
}

export function getServicesByCategory(category: string): PrintService[] {
  if (category === "all") return PRINT_SERVICES;
  return PRINT_SERVICES.filter((s) => s.category === category);
}
