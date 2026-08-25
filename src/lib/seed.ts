import customersData from "../../data/customers.json";
import materialsData from "../../data/materials.json";
import servicesData from "../../data/services.json";
import pricingRulesData from "../../data/pricing-rules.json";
import seedAllData from "../../data/seed-all.json";

export interface SeedDataset {
  customers: typeof customersData;
  materials: typeof materialsData;
  services: typeof servicesData;
  pricingRules: typeof pricingRulesData;
}

export function getInitialSeedData(): SeedDataset {
  return {
    customers: customersData,
    materials: materialsData,
    services: servicesData,
    pricingRules: pricingRulesData,
  };
}

export { customersData, materialsData, servicesData, pricingRulesData, seedAllData };
