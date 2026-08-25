import postgres from "postgres";
import fs from "fs";
import path from "path";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:REDACTED_DB_PASSWORD@185.190.143.94:5432/myprintos";

async function runSeed() {
  console.log("🚀 Starting PrintOS PostgreSQL database seed...");
  const sql = postgres(DATABASE_URL);

  try {
    // 1. Seed Materials
    const materialsRaw = fs.readFileSync(path.join(process.cwd(), "data/materials.json"), "utf8");
    const materials = JSON.parse(materialsRaw);
    console.log(`📦 Seeding ${materials.length} Raw Materials...`);

    for (const mat of materials) {
      const { id, ...data } = mat;
      await sql`
        INSERT INTO collection_materials (id, data, created_at, updated_at)
        VALUES (${id}, ${sql.json(data)}, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE 
        SET data = ${sql.json(data)}, updated_at = NOW()
      `;
    }
    console.log("✅ Materials seeded successfully.");

    // 2. Seed Services
    const servicesRaw = fs.readFileSync(path.join(process.cwd(), "data/services.json"), "utf8");
    const services = JSON.parse(servicesRaw);
    console.log(`📚 Seeding ${services.length} Print Services...`);

    for (const srv of services) {
      const { id, ...data } = srv;
      await sql`
        INSERT INTO collection_services (id, data, created_at, updated_at)
        VALUES (${id}, ${sql.json(data)}, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE 
        SET data = ${sql.json(data)}, updated_at = NOW()
      `;
    }
    console.log("✅ Services seeded successfully.");

    // 3. Seed Pricing Rules
    const rulesRaw = fs.readFileSync(path.join(process.cwd(), "data/pricing-rules.json"), "utf8");
    const rules = JSON.parse(rulesRaw);
    console.log(`⚖️ Seeding ${rules.length} Pricing Rules...`);

    for (const rule of rules) {
      const { id, ...data } = rule;
      await sql`
        INSERT INTO collection_pricing_rules (id, data, created_at, updated_at)
        VALUES (${id}, ${sql.json(data)}, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE 
        SET data = ${sql.json(data)}, updated_at = NOW()
      `;
    }
    console.log("✅ Pricing Rules seeded successfully.");

    // 4. Seed Customers
    const customersRaw = fs.readFileSync(path.join(process.cwd(), "data/customers.json"), "utf8");
    const customers = JSON.parse(customersRaw);
    console.log(`👥 Seeding ${customers.length} Customers...`);

    for (const cust of customers) {
      const { id, ...data } = cust;
      await sql`
        INSERT INTO collection_customers (id, data, created_at, updated_at)
        VALUES (${id}, ${sql.json(data)}, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE 
        SET data = ${sql.json(data)}, updated_at = NOW()
      `;
    }
    console.log("✅ Customers seeded successfully.");

    console.log("\n🎉 Database seeding complete!");
  } catch (err) {
    console.error("❌ Seeding failed with error:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runSeed();
