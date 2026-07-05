// ============================================================================
// Energy & GHG calculations (VSME Basic Module, disclosure B3)
// Pure functions — no DOM access, importable from Node for tests.
//
// Emission factors are typical published values (DEFRA 2024 / UBA / AIB
// residual-mix style figures) intended as sensible defaults. Users can
// override every factor in the app, and the report discloses the factors
// used. Review factors once a year (see MAINTENANCE.md).
// ============================================================================

// kg CO2e per unit
export const EMISSION_FACTORS = {
  electricityKgPerKwh: {
    DE: 0.380, // Germany, location-based grid average
    EU: 0.251, // EU-27 average
    AT: 0.110,
    FR: 0.056,
    CH: 0.012,
    custom: 0.251,
  },
  naturalGasKgPerKwh: 0.202,
  districtHeatingKgPerKwh: 0.20,
  heatingOilKgPerLitre: 2.66,
  dieselKgPerLitre: 2.68,
  petrolKgPerLitre: 2.31,
  lpgKgPerLitre: 1.56,
};

// Energy content used to convert fuel volumes to kWh (net calorific values)
export const KWH_PER_UNIT = {
  heatingOilPerLitre: 9.8,
  dieselPerLitre: 9.96,
  petrolPerLitre: 8.9,
  lpgPerLitre: 6.9,
};

const num = (v) => {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : v;
  return Number.isFinite(n) ? n : 0;
};

/**
 * Merge user factor overrides (all in the same units as EMISSION_FACTORS)
 * over the defaults. `overrides.electricityKgPerKwh` is a single number.
 */
export function resolveFactors(data) {
  const country = data.b3_grid_country || 'EU';
  const elDefault =
    EMISSION_FACTORS.electricityKgPerKwh[country] ??
    EMISSION_FACTORS.electricityKgPerKwh.EU;
  return {
    electricity: data.b3_ef_electricity !== '' && data.b3_ef_electricity != null
      ? num(data.b3_ef_electricity) : elDefault,
    naturalGas: data.b3_ef_gas !== '' && data.b3_ef_gas != null
      ? num(data.b3_ef_gas) : EMISSION_FACTORS.naturalGasKgPerKwh,
    districtHeating: data.b3_ef_district !== '' && data.b3_ef_district != null
      ? num(data.b3_ef_district) : EMISSION_FACTORS.districtHeatingKgPerKwh,
    heatingOil: EMISSION_FACTORS.heatingOilKgPerLitre,
    diesel: EMISSION_FACTORS.dieselKgPerLitre,
    petrol: EMISSION_FACTORS.petrolKgPerLitre,
    lpg: EMISSION_FACTORS.lpgKgPerLitre,
  };
}

/**
 * Compute the B3 energy & emissions block from raw form data.
 * Returns everything in the units the VSME standard asks for:
 * energy in MWh, emissions in tCO2e.
 */
export function computeB3(data) {
  const f = resolveFactors(data);

  const elRenew = num(data.b3_electricity_renewable_kwh);
  const elNonRenew = num(data.b3_electricity_nonrenewable_kwh);
  const gasKwh = num(data.b3_gas_kwh);
  const districtKwh = num(data.b3_district_kwh);
  const oilL = num(data.b3_heating_oil_l);
  const dieselL = num(data.b3_diesel_l);
  const petrolL = num(data.b3_petrol_l);
  const lpgL = num(data.b3_lpg_l);
  const otherKwh = num(data.b3_other_energy_kwh);
  const selfGenKwh = num(data.b3_self_generated_kwh);

  const fuelKwh =
    gasKwh +
    oilL * KWH_PER_UNIT.heatingOilPerLitre +
    dieselL * KWH_PER_UNIT.dieselPerLitre +
    petrolL * KWH_PER_UNIT.petrolPerLitre +
    lpgL * KWH_PER_UNIT.lpgPerLitre;

  const totalEnergyKwh =
    elRenew + elNonRenew + selfGenKwh + fuelKwh + districtKwh + otherKwh;
  const renewableKwh = elRenew + selfGenKwh;

  // Scope 1: direct combustion of fuels the company controls
  const scope1Kg =
    gasKwh * f.naturalGas +
    oilL * f.heatingOil +
    dieselL * f.diesel +
    petrolL * f.petrol +
    lpgL * f.lpg;

  // Scope 2 (location-based): purchased electricity + district heating.
  // Contractually renewable electricity is reported but still uses the grid
  // factor for the location-based figure only if the user says so; we keep it
  // simple: renewable electricity counts as 0 (market-based convention),
  // which is disclosed in the report methodology note.
  const scope2Kg = elNonRenew * f.electricity + districtKwh * f.districtHeating;

  const scope1T = scope1Kg / 1000;
  const scope2T = scope2Kg / 1000;
  const totalT = scope1T + scope2T;

  const turnoverEur = num(data.b1_turnover_eur);
  // tCO2e per million EUR turnover (a standard VSME intensity metric)
  const intensityPerMEur = turnoverEur > 0 ? totalT / (turnoverEur / 1e6) : null;

  return {
    factors: f,
    totalEnergyMwh: totalEnergyKwh / 1000,
    renewableEnergyMwh: renewableKwh / 1000,
    renewableShare: totalEnergyKwh > 0 ? renewableKwh / totalEnergyKwh : 0,
    scope1T,
    scope2T,
    totalT,
    intensityPerMEur,
  };
}

/**
 * B9 accident rate: recordable accidents per 200,000 hours worked
 * (the common OSHA-style incident rate; disclosed with its formula).
 */
export function accidentRate(accidents, hoursWorked) {
  const a = num(accidents);
  const h = num(hoursWorked);
  if (h <= 0) return null;
  return (a * 200000) / h;
}

/** Format a number for display: fixed decimals, thousands separators. */
export function fmt(n, decimals = 1, lang = 'en') {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
