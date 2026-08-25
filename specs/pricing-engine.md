# Pricing Engine Specification

## Mathematical Quoting Models for PrintOS

**Companion doc to:** `tech-architecture.md` & `PRD.md`  
**Domain Reference:** Adapted from Nigerian Print Production models (`teylod-backend`)

---

## 1. Overview & Core Philosophy

In traditional print software, catalog explosion happens because shops attempt to create hundreds of rigid product SKUs.

PrintOS decouples the **Physical Item / Service** from the **Quoting Algorithm** by routing all print jobs through **3 Mathematical Engines + Finishing Add-ons**:

```text
                              ┌───────────────────────────────────────────────┐
                              │            PrintOS Pricing Pipeline           │
                              └──────────────────────┬────────────────────────┘
                                                     │
         ┌───────────────────────────────────┼──────────────────────────────────┐
         ▼                                   ▼                                  ▼
┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
│ 1. Matrix Engine │               │  2. Area Engine  │               │3.Perimeter Engine│
│ (Volume Tiered)  │               │   (2D Surface)   │               │   (1D Linear)    │
└────────┬─────────┘               └────────┬─────────┘               └────────┬─────────┘
         │                                  │                                  │
  • T-Shirts / Merch                 • Flex Banners                     • Picture Frames
  • Business Cards                   • SAV Vinyl Stickers               • Canvas Stretchers
  • Flyers & Jotters                 • Large Posters                    • Edge Hemming
  (Size × Quantity Tier)             (Width × Height × Area Rate)       (2(W+H) × Linear Rate)
```

---

## 2. The 3 Quoting Engines

### Engine 1: The Size / Quantity Matrix Engine

* **Use Case:** Discrete, volume-tiered items (Apparel, DTF, Screen Print, Embroidery, Flyers, Business Cards, Mugs).
* **Concept:** Unit price decreases as quantity increases across standard print areas.
* **Mathematical Formula:**
  $$\text{quotedPrice} = \text{quantity} \times \left( \text{baseBlankCost} + \text{unitPrice}(\text{sizeArea}, \text{quantityTier}) \right)$$
* **Quantity Brackets:** `1–20`, `21–100`, `101–500`, `500+`
* **Print Areas / Sizes:** `Pocket/Logo`, `A4`, `A3`, `Full-Wrap`, `Single-Sided`, `Double-Sided`

```typescript
export function calculateMatrixPrice(
  quantity: number,
  sizeArea: string,
  baseBlankCost: number = 0,
  pricingRules: PricingRule[]
): number {
  const matchingRule = pricingRules.find(rule => 
    rule.sizeArea === sizeArea &&
    quantity >= rule.minQuantity &&
    (rule.maxQuantity === null || quantity <= rule.maxQuantity)
  );

  const printUnitPrice = matchingRule ? matchingRule.unitPrice : 0;
  return quantity * (baseBlankCost + printUnitPrice);
}
```

---

### Engine 2: The Area Calculator Engine

* **Use Case:** Continuous roll materials (Flex Banners, Roll-up Banners, Self-Adhesive Vinyl (SAV) Stickers, Mesh Banners, Wall Graphics).
* **Concept:** Price is strictly determined by physical 2D square area (sqft / sqm) plus optional hardware (e.g. roll-up stand).
* **Mathematical Formula:**
  $$\text{area} = \text{width} \times \text{height}$$
  $$\text{quotedPrice} = \text{quantity} \times \left( (\text{area} \times \text{ratePerUnitArea}) + \text{baseBlankCost} \right)$$

```typescript
export function calculateAreaPrice(
  quantity: number,
  width: number,
  height: number,
  ratePerUnitArea: number,
  baseBlankCost: number = 0
): number {
  const totalArea = width * height;
  const unitPrice = (totalArea * ratePerUnitArea) + baseBlankCost;
  return quantity * unitPrice;
}
```

---

### Engine 3: The Perimeter / Linear Calculator Engine

* **Use Case:** 1D linear measurements (Custom Picture Framing, Canvas Stretcher Bars, Edge Hemming).
* **Concept:** Price is calculated based on outer continuous border length.
* **Mathematical Formula:**
  $$\text{perimeter} = (\text{width} + \text{height}) \times 2$$
  $$\text{quotedPrice} = \text{quantity} \times \left( (\text{perimeter} \times \text{ratePerLinearUnit}) + \text{baseBlankCost} \right)$$

```typescript
export function calculatePerimeterPrice(
  quantity: number,
  width: number,
  height: number,
  ratePerLinearUnit: number,
  baseBlankCost: number = 0
): number {
  const perimeter = (width + height) * 2;
  const unitPrice = (perimeter * ratePerLinearUnit) + baseBlankCost;
  return quantity * unitPrice;
}
```

---

## 3. Finishing Add-ons & Post-Processing

Optional post-press charges added to the base price:

| Add-on | Unit Type | Formula / Rate | Typical Nigerian Cost |
| :--- | :--- | :--- | :--- |
| **Matte / Gloss Lamination** | Per Unit (Sheet) | `quantity × laminationRate` | ₦20 / sheet (A4/A3) |
| **SAV Lamination** | Per Sqm | `totalArea × laminationRatePerSqm` | ₦400 / sqm |
| **Corner Eyelets / Grommets** | Per Piece | `totalGrommets × ratePerGrommet` | ₦50 / eyelet |
| **Hot Foil Stamping / Embossing** | Flat + Per Hit | `basePlateFee + (quantity × hitRate)` | ₦5,000 flat + ₦30 / hit |

---

## 4. Default Seed Data (Nigerian Print Benchmarks)

```json
{
  "services": [
    {
      "name": "DTF T-Shirt",
      "category": "apparel",
      "pricingEngine": "matrix",
      "baseBlankCost": 3500,
      "unit": "piece",
      "defaultMaterial": "premium-cotton-blank"
    },
    {
      "name": "Roll-up Banner (3x7 ft)",
      "category": "largeFormat",
      "pricingEngine": "area",
      "baseBlankCost": 18000,
      "unit": "sqft",
      "defaultMaterial": "flex-banner-roll"
    },
    {
      "name": "SAV Vinyl Sticker",
      "category": "largeFormat",
      "pricingEngine": "area",
      "baseBlankCost": 0,
      "unit": "sqft",
      "defaultMaterial": "sav-gloss-vinyl"
    },
    {
      "name": "A5 Promotional Flyers",
      "category": "stationery",
      "pricingEngine": "matrix",
      "baseBlankCost": 0,
      "unit": "pack",
      "defaultMaterial": "art-card-150gsm"
    },
    {
      "name": "Custom Photo Frame",
      "category": "framing",
      "pricingEngine": "perimeter",
      "baseBlankCost": 2500,
      "unit": "inch",
      "defaultMaterial": "wooden-frame-molding"
    }
  ],
  "pricingRules": [
    {
      "service": "DTF T-Shirt",
      "sizeArea": "A4",
      "minQuantity": 1,
      "maxQuantity": 20,
      "unitPrice": 2500,
      "targetMarginPercent": 40
    },
    {
      "service": "DTF T-Shirt",
      "sizeArea": "A4",
      "minQuantity": 21,
      "maxQuantity": 100,
      "unitPrice": 2000,
      "targetMarginPercent": 40
    },
    {
      "service": "Roll-up Banner (3x7 ft)",
      "ratePerUnitArea": 1000,
      "targetMarginPercent": 45
    },
    {
      "service": "SAV Vinyl Sticker",
      "ratePerUnitArea": 750,
      "targetMarginPercent": 50
    },
    {
      "service": "Custom Photo Frame",
      "ratePerLinearUnit": 150,
      "targetMarginPercent": 45
    }
  ]
}
```

---

## 5. Integration with Quoting Engine & Margin Guardian

When an extracted print job specification is processed:
1. **Match Service & Engine:** The system matches `serviceCategory` or `item` to a `service`.
2. **Execute Pricing Math:** Calculates `quotedPrice` deterministically using the linked pricing engine.
3. **Lookup True Material Cost:** Evaluates `materialCost = quantity × material.unitCost`.
4. **Safety Margin Check:** 
   $$\text{marginPercent} = \frac{\text{quotedPrice} - \text{materialCost}}{\text{quotedPrice}} \times 100$$
   - If $\text{marginPercent} < 30\%$, the quoting engine flags the job internally as `atRisk` or `lossMaking`.
