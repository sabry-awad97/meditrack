# Medicine Forms Categories Summary

## Pharmacy-Related Categories (18 categories)

### 1. **Oral Solid Dosage** (9 items)

Tablets, capsules, caplets, lozenges, etc.

### 2. **Oral Liquid Dosage** (10 items)

Syrups, suspensions, solutions, elixirs, etc.

### 3. **Injectable** (5 items)

Injections, ampules, vials, infusions, pre-filled syringes

### 4. **Drops** (7 items)

Eye drops, ear drops, nasal drops, oral drops

### 5. **Topical** (13 items)

Creams, ointments, gels, lotions for medical use

### 6. **Powder** (4 items)

Medicinal powders, effervescent powders, sachets

### 7. **Inhalation** (7 items)

Inhalers, aerosols, nasal sprays, insufflations

### 8. **Rectal** (2 items)

Suppositories, enemas

### 9. **Vaginal** (3 items)

Vaginal pessaries, creams, douches

### 10. **Transdermal** (2 items)

Patches, medicated patches

### 11. **Wound Care** (10 items)

Cotton, gauze, plasters, bandages

### 12. **Medical Devices** (15 items)

Syringes, needles, catheters, surgical devices, mobility aids

### 13. **Diagnostic Devices** (8 items)

Blood pressure meters, glucose meters, test strips, pregnancy tests, thermometers

### 14. **Oral Care** (9 items)

Mouthwash, dental products, toothpaste, dental floss

### 15. **Antiseptic & Disinfectant** (2 items)

Antiseptics, disinfectants

### 16. **Herbal & Supplements** (3 items)

Dried herbs, herbal extracts, herbal tea bags

### 17. **Nutrition & Supplements** (8 items)

Athletic supplements, diabetic food, infant formula, artificial sweeteners

### 18. **Baby Care** (11 items)

Baby food, diapers, feeding bottles, pacifiers

### 19. **Maternity & Contraceptive** (1 item)

Maternity devices

### 20. **Contraceptive** (4 items)

Condoms, IUDs, contraceptive devices

### 21. **Optical** (8 items)

Eyeglasses, contact lenses, lens care products

### 22. **Geriatric Care** (3 items)

Geriatric products, devices, diapers

---

## Non-Pharmacy Categories (3 categories)

### 23. **Personal Care** (28 items)

Shampoos, conditioners, body wash, deodorants, hair care, shaving products

### 24. **Cosmetics** (21 items)

Makeup, perfumes, nail polish, hair dye, beauty products

### 25. **Non-Pharmacy** (15 items)

Household items, toys, stationery, electronics, clothing

### 26. **Other** (1 item)

Miscellaneous uncategorized items

---

## Statistics

- **Total Items**: 234
- **Pharmacy-Related**: ~173 items (74%)
- **Non-Pharmacy**: ~61 items (26%)

## Recommended Database Categories

For your seeding script, I recommend using these main categories:

```typescript
enum MedicineFormCategory {
  // Core Pharmaceutical
  ORAL_SOLID = "Oral Solid Dosage",
  ORAL_LIQUID = "Oral Liquid Dosage",
  INJECTABLE = "Injectable",
  TOPICAL = "Topical",
  DROPS = "Drops",
  INHALATION = "Inhalation",
  RECTAL = "Rectal",
  VAGINAL = "Vaginal",
  TRANSDERMAL = "Transdermal",
  POWDER = "Powder",

  // Medical Supplies
  WOUND_CARE = "Wound Care",
  MEDICAL_DEVICES = "Medical Devices",
  DIAGNOSTIC_DEVICES = "Diagnostic Devices",

  // Healthcare Products
  ORAL_CARE = "Oral Care",
  ANTISEPTIC = "Antiseptic & Disinfectant",
  HERBAL = "Herbal & Supplements",
  NUTRITION = "Nutrition & Supplements",

  // Specialized Care
  BABY_CARE = "Baby Care",
  MATERNITY = "Maternity & Contraceptive",
  CONTRACEPTIVE = "Contraceptive",
  OPTICAL = "Optical",
  GERIATRIC = "Geriatric Care",

  // Non-Pharmacy (Optional - may want to exclude)
  PERSONAL_CARE = "Personal Care",
  COSMETICS = "Cosmetics",
  NON_PHARMACY = "Non-Pharmacy",
  OTHER = "Other",
}
```
