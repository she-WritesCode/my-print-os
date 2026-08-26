import { getDyrectedServices } from "@/lib/dyrected";
import { StorefrontClient } from "@/components/storefront/StorefrontClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const services = await getDyrectedServices();

  return <StorefrontClient services={services} />;
}
