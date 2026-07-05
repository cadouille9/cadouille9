// ============================================================================
// Questionnaire schema — VSME Basic Module (EFRAG, December 2024), B1–B11.
//
// This is a guided, plain-language questionnaire aligned with the VSME
// Basic Module disclosures. It is a preparation aid, not legal advice —
// the report says so explicitly.
//
// Field types: text | textarea | number | select | yesno | note
// Every label/help is bilingual: { en, de }.
// `showIf: { field, value }` hides a field until another field has a value.
// ============================================================================

export const SCHEMA = [
  {
    id: 'b1',
    code: 'B1',
    title: {
      en: 'Basis for preparation',
      de: 'Grundlage der Berichterstattung',
    },
    intro: {
      en: 'Who is reporting, and on what basis. This information frames the whole report.',
      de: 'Wer berichtet und auf welcher Grundlage. Diese Angaben bilden den Rahmen des gesamten Berichts.',
    },
    fields: [
      { id: 'b1_company_name', type: 'text', label: { en: 'Legal name of the company', de: 'Rechtlicher Name des Unternehmens' } },
      {
        id: 'b1_legal_form', type: 'text',
        label: { en: 'Legal form', de: 'Rechtsform' },
        help: { en: 'e.g. GmbH, AG, SARL, Ltd.', de: 'z. B. GmbH, AG, KG, e.K.' },
      },
      {
        id: 'b1_country', type: 'text',
        label: { en: 'Country of registered office', de: 'Land des eingetragenen Sitzes' },
      },
      {
        id: 'b1_address', type: 'text',
        label: { en: 'Registered address', de: 'Anschrift des Sitzes' },
      },
      {
        id: 'b1_nace', type: 'text',
        label: { en: 'Main sector(s) — NACE code(s)', de: 'Hauptsektor(en) — NACE-Code(s)' },
        help: {
          en: 'The EU statistical classification of your main activity, e.g. "C25 — Manufacture of fabricated metal products". Your accountant or chamber of commerce can tell you.',
          de: 'Die EU-Klassifikation Ihrer Haupttätigkeit, z. B. „C25 — Herstellung von Metallerzeugnissen". Ihr Steuerberater oder Ihre IHK kennt den Code.',
        },
      },
      {
        id: 'b1_reporting_year', type: 'text',
        label: { en: 'Reporting period (financial year)', de: 'Berichtszeitraum (Geschäftsjahr)' },
        help: { en: 'e.g. "1 January – 31 December 2025"', de: 'z. B. „1. Januar – 31. Dezember 2025"' },
      },
      {
        id: 'b1_basis', type: 'select',
        label: { en: 'Reporting basis', de: 'Berichtsbasis' },
        options: [
          { value: 'individual', en: 'Individual basis (this company only)', de: 'Einzelbasis (nur dieses Unternehmen)' },
          { value: 'consolidated', en: 'Consolidated basis (including subsidiaries)', de: 'Konsolidierte Basis (einschließlich Tochterunternehmen)' },
        ],
      },
      {
        id: 'b1_subsidiaries', type: 'textarea',
        label: { en: 'Subsidiaries included (name and address)', de: 'Einbezogene Tochterunternehmen (Name und Anschrift)' },
        showIf: { field: 'b1_basis', value: 'consolidated' },
      },
      {
        id: 'b1_turnover_eur', type: 'number', unit: '€',
        label: { en: 'Turnover in the reporting year', de: 'Umsatz im Berichtsjahr' },
        help: { en: 'Net turnover from your annual accounts. Also used to compute your GHG intensity in section B3.', de: 'Nettoumsatz laut Jahresabschluss. Wird auch für die THG-Intensität in Abschnitt B3 verwendet.' },
      },
      {
        id: 'b1_balance_sheet_eur', type: 'number', unit: '€',
        label: { en: 'Balance sheet total', de: 'Bilanzsumme' },
      },
      {
        id: 'b1_employees_count', type: 'number',
        label: { en: 'Number of employees (headcount at year end)', de: 'Anzahl Beschäftigte (Kopfzahl am Jahresende)' },
      },
      {
        id: 'b1_sites', type: 'textarea',
        label: { en: 'Sites / locations (one per line: name, address, country)', de: 'Standorte (einer pro Zeile: Name, Adresse, Land)' },
        help: { en: 'List every site you operate, including rented premises.', de: 'Listen Sie alle betriebenen Standorte auf, auch gemietete.' },
      },
      {
        id: 'b1_certifications', type: 'textarea',
        label: { en: 'Sustainability certifications or labels (optional)', de: 'Nachhaltigkeitszertifikate oder -label (optional)' },
        help: { en: 'e.g. ISO 14001, EcoVadis, B Corp — with issuer, date and rating if applicable.', de: 'z. B. ISO 14001, EcoVadis, B Corp — mit Aussteller, Datum und ggf. Bewertung.' },
      },
      {
        id: 'b1_omissions', type: 'yesno',
        label: { en: 'Have you omitted any classified or sensitive information?', de: 'Wurden vertrauliche oder sensible Informationen weggelassen?' },
      },
      {
        id: 'b1_omissions_note', type: 'textarea',
        label: { en: 'Which type of information was omitted?', de: 'Welche Art von Informationen wurde weggelassen?' },
        showIf: { field: 'b1_omissions', value: 'yes' },
      },
    ],
  },

  {
    id: 'b2',
    code: 'B2',
    title: {
      en: 'Practices & policies for a more sustainable economy',
      de: 'Praktiken & Richtlinien für eine nachhaltigere Wirtschaft',
    },
    intro: {
      en: 'For each sustainability topic: do you have specific practices or policies in place? A short honest "no" is a valid answer — the standard only asks you to say so.',
      de: 'Für jedes Nachhaltigkeitsthema: Gibt es konkrete Praktiken oder Richtlinien? Ein ehrliches „Nein" ist eine gültige Antwort — der Standard verlangt nur die Angabe.',
    },
    fields: [
      { id: 'b2_climate', type: 'yesno', label: { en: 'Climate change — practices or policies in place?', de: 'Klimawandel — Praktiken oder Richtlinien vorhanden?' } },
      { id: 'b2_climate_note', type: 'textarea', label: { en: 'Briefly describe them', de: 'Kurze Beschreibung' }, showIf: { field: 'b2_climate', value: 'yes' } },
      { id: 'b2_pollution', type: 'yesno', label: { en: 'Pollution — practices or policies in place?', de: 'Umweltverschmutzung — Praktiken oder Richtlinien vorhanden?' } },
      { id: 'b2_pollution_note', type: 'textarea', label: { en: 'Briefly describe them', de: 'Kurze Beschreibung' }, showIf: { field: 'b2_pollution', value: 'yes' } },
      { id: 'b2_water', type: 'yesno', label: { en: 'Water & marine resources — practices or policies in place?', de: 'Wasser & Meeresressourcen — Praktiken oder Richtlinien vorhanden?' } },
      { id: 'b2_water_note', type: 'textarea', label: { en: 'Briefly describe them', de: 'Kurze Beschreibung' }, showIf: { field: 'b2_water', value: 'yes' } },
      { id: 'b2_biodiversity', type: 'yesno', label: { en: 'Biodiversity & ecosystems — practices or policies in place?', de: 'Biodiversität & Ökosysteme — Praktiken oder Richtlinien vorhanden?' } },
      { id: 'b2_biodiversity_note', type: 'textarea', label: { en: 'Briefly describe them', de: 'Kurze Beschreibung' }, showIf: { field: 'b2_biodiversity', value: 'yes' } },
      { id: 'b2_circular', type: 'yesno', label: { en: 'Circular economy — practices or policies in place?', de: 'Kreislaufwirtschaft — Praktiken oder Richtlinien vorhanden?' } },
      { id: 'b2_circular_note', type: 'textarea', label: { en: 'Briefly describe them', de: 'Kurze Beschreibung' }, showIf: { field: 'b2_circular', value: 'yes' } },
      { id: 'b2_workforce', type: 'yesno', label: { en: 'Own workforce — practices or policies in place?', de: 'Eigene Belegschaft — Praktiken oder Richtlinien vorhanden?' } },
      { id: 'b2_workforce_note', type: 'textarea', label: { en: 'Briefly describe them', de: 'Kurze Beschreibung' }, showIf: { field: 'b2_workforce', value: 'yes' } },
      { id: 'b2_community', type: 'yesno', label: { en: 'Workers in the value chain, communities, consumers — practices or policies?', de: 'Beschäftigte in der Wertschöpfungskette, Gemeinschaften, Verbraucher — Praktiken oder Richtlinien?' } },
      { id: 'b2_community_note', type: 'textarea', label: { en: 'Briefly describe them', de: 'Kurze Beschreibung' }, showIf: { field: 'b2_community', value: 'yes' } },
      { id: 'b2_conduct', type: 'yesno', label: { en: 'Business conduct (anti-corruption, fair competition) — practices or policies?', de: 'Unternehmensführung (Antikorruption, fairer Wettbewerb) — Praktiken oder Richtlinien?' } },
      { id: 'b2_conduct_note', type: 'textarea', label: { en: 'Briefly describe them', de: 'Kurze Beschreibung' }, showIf: { field: 'b2_conduct', value: 'yes' } },
      {
        id: 'b2_public', type: 'yesno',
        label: { en: 'Are any of these policies publicly available (e.g. on your website)?', de: 'Sind diese Richtlinien öffentlich verfügbar (z. B. auf Ihrer Website)?' },
      },
      {
        id: 'b2_future', type: 'textarea',
        label: { en: 'Planned future initiatives (optional)', de: 'Geplante zukünftige Initiativen (optional)' },
        help: { en: 'e.g. "Install rooftop PV in 2027", "Switch fleet to EV by 2028".', de: 'z. B. „PV-Anlage 2027", „Umstellung der Flotte auf E-Fahrzeuge bis 2028".' },
      },
    ],
  },

  {
    id: 'b3',
    code: 'B3',
    title: { en: 'Energy & greenhouse gas emissions', de: 'Energie & Treibhausgasemissionen' },
    intro: {
      en: 'Enter your annual consumption — the app calculates your energy mix and Scope 1 & 2 emissions automatically. You can find these numbers on your utility bills and fuel invoices.',
      de: 'Tragen Sie Ihren Jahresverbrauch ein — die App berechnet Energiemix und Scope-1- und Scope-2-Emissionen automatisch. Die Zahlen finden Sie auf Ihren Energie- und Tankrechnungen.',
    },
    fields: [
      {
        id: 'b3_grid_country', type: 'select',
        label: { en: 'Electricity grid (for the emission factor)', de: 'Stromnetz (für den Emissionsfaktor)' },
        options: [
          { value: 'DE', en: 'Germany (0.380 kg CO₂e/kWh)', de: 'Deutschland (0,380 kg CO₂e/kWh)' },
          { value: 'EU', en: 'EU-27 average (0.251 kg CO₂e/kWh)', de: 'EU-27-Durchschnitt (0,251 kg CO₂e/kWh)' },
          { value: 'AT', en: 'Austria (0.110 kg CO₂e/kWh)', de: 'Österreich (0,110 kg CO₂e/kWh)' },
          { value: 'FR', en: 'France (0.056 kg CO₂e/kWh)', de: 'Frankreich (0,056 kg CO₂e/kWh)' },
          { value: 'CH', en: 'Switzerland (0.012 kg CO₂e/kWh)', de: 'Schweiz (0,012 kg CO₂e/kWh)' },
        ],
      },
      { id: 'b3_electricity_nonrenewable_kwh', type: 'number', unit: 'kWh', label: { en: 'Purchased electricity — conventional', de: 'Eingekaufter Strom — konventionell' } },
      {
        id: 'b3_electricity_renewable_kwh', type: 'number', unit: 'kWh',
        label: { en: 'Purchased electricity — certified renewable (green tariff)', de: 'Eingekaufter Strom — zertifiziert erneuerbar (Ökostrom)' },
        help: { en: 'Only if your contract guarantees renewable origin (e.g. guarantees of origin).', de: 'Nur wenn Ihr Vertrag erneuerbare Herkunft garantiert (z. B. Herkunftsnachweise).' },
      },
      { id: 'b3_self_generated_kwh', type: 'number', unit: 'kWh', label: { en: 'Self-generated renewable energy (e.g. rooftop PV, own use)', de: 'Selbst erzeugte erneuerbare Energie (z. B. PV-Eigenverbrauch)' } },
      { id: 'b3_gas_kwh', type: 'number', unit: 'kWh', label: { en: 'Natural gas', de: 'Erdgas' } },
      { id: 'b3_district_kwh', type: 'number', unit: 'kWh', label: { en: 'District heating', de: 'Fernwärme' } },
      { id: 'b3_heating_oil_l', type: 'number', unit: 'L', label: { en: 'Heating oil', de: 'Heizöl' } },
      { id: 'b3_diesel_l', type: 'number', unit: 'L', label: { en: 'Diesel (company vehicles & machinery)', de: 'Diesel (Firmenfahrzeuge & Maschinen)' } },
      { id: 'b3_petrol_l', type: 'number', unit: 'L', label: { en: 'Petrol (company vehicles)', de: 'Benzin (Firmenfahrzeuge)' } },
      { id: 'b3_lpg_l', type: 'number', unit: 'L', label: { en: 'LPG / propane', de: 'Flüssiggas / Propan' } },
      {
        id: 'b3_other_energy_kwh', type: 'number', unit: 'kWh',
        label: { en: 'Other energy (optional)', de: 'Sonstige Energie (optional)' },
        help: { en: 'Anything not covered above, converted to kWh. Not included in the emission calculation — describe it in the note below.', de: 'Alles oben nicht Erfasste, umgerechnet in kWh. Nicht in der Emissionsberechnung enthalten — bitte unten erläutern.' },
      },
      {
        id: 'b3_ef_electricity', type: 'number', unit: 'kg CO₂e/kWh',
        label: { en: 'Override: electricity emission factor (optional)', de: 'Überschreiben: Emissionsfaktor Strom (optional)' },
        help: { en: 'Leave empty to use the grid default selected above. Enter your supplier-specific factor if you have one.', de: 'Leer lassen für den oben gewählten Netz-Standardwert. Tragen Sie den Faktor Ihres Versorgers ein, falls bekannt.' },
      },
      { id: 'b3_ef_gas', type: 'number', unit: 'kg CO₂e/kWh', label: { en: 'Override: natural gas emission factor (optional)', de: 'Überschreiben: Emissionsfaktor Erdgas (optional)' } },
      { id: 'b3_ef_district', type: 'number', unit: 'kg CO₂e/kWh', label: { en: 'Override: district heating emission factor (optional)', de: 'Überschreiben: Emissionsfaktor Fernwärme (optional)' } },
      {
        id: 'b3_note', type: 'textarea',
        label: { en: 'Methodology notes (optional)', de: 'Methodische Anmerkungen (optional)' },
        help: { en: 'e.g. estimates used, sites excluded, meter reading periods.', de: 'z. B. verwendete Schätzungen, ausgeschlossene Standorte, Ablesezeiträume.' },
      },
    ],
  },

  {
    id: 'b4',
    code: 'B4',
    title: { en: 'Pollution of air, water and soil', de: 'Verschmutzung von Luft, Wasser und Boden' },
    intro: {
      en: 'Only relevant if you are already legally required to report emissions of pollutants (e.g. under an environmental permit or the E-PRTR). Most offices and many small businesses simply answer "no".',
      de: 'Nur relevant, wenn Sie bereits gesetzlich verpflichtet sind, Schadstoffemissionen zu berichten (z. B. durch eine Umweltgenehmigung oder das E-PRTR). Die meisten Büros und viele Kleinbetriebe antworten hier „Nein".',
    },
    fields: [
      {
        id: 'b4_required', type: 'yesno',
        label: { en: 'Are you legally required to report pollutant emissions to authorities?', de: 'Sind Sie gesetzlich verpflichtet, Schadstoffemissionen an Behörden zu melden?' },
      },
      {
        id: 'b4_pollutants', type: 'textarea',
        label: { en: 'Pollutants and amounts reported (per medium: air / water / soil)', de: 'Gemeldete Schadstoffe und Mengen (je Medium: Luft / Wasser / Boden)' },
        showIf: { field: 'b4_required', value: 'yes' },
        help: { en: 'Copy the figures from your permit or E-PRTR report.', de: 'Übernehmen Sie die Zahlen aus Ihrer Genehmigung oder Ihrem E-PRTR-Bericht.' },
      },
    ],
  },

  {
    id: 'b5',
    code: 'B5',
    title: { en: 'Biodiversity', de: 'Biodiversität' },
    intro: {
      en: 'Whether any of your sites are in or near sensitive natural areas (e.g. Natura 2000, nature reserves), and optionally your land use.',
      de: 'Ob sich Standorte in oder nahe sensiblen Naturgebieten befinden (z. B. Natura 2000, Naturschutzgebiete), und optional Ihre Flächennutzung.',
    },
    fields: [
      {
        id: 'b5_sensitive_sites', type: 'yesno',
        label: { en: 'Are any sites located in or near biodiversity-sensitive areas?', de: 'Liegen Standorte in oder nahe biodiversitätssensiblen Gebieten?' },
        help: { en: 'Check the EEA "Natura 2000 viewer" online, or ask your municipality.', de: 'Prüfen Sie den „Natura 2000 Viewer" der EEA online oder fragen Sie Ihre Gemeinde.' },
      },
      { id: 'b5_sensitive_count', type: 'number', label: { en: 'Number of such sites', de: 'Anzahl solcher Standorte' }, showIf: { field: 'b5_sensitive_sites', value: 'yes' } },
      { id: 'b5_sensitive_area_ha', type: 'number', unit: 'ha', label: { en: 'Total area of these sites', de: 'Gesamtfläche dieser Standorte' }, showIf: { field: 'b5_sensitive_sites', value: 'yes' } },
      { id: 'b5_total_sealed_ha', type: 'number', unit: 'ha', label: { en: 'Total sealed area (buildings, asphalt) — optional', de: 'Versiegelte Fläche gesamt (Gebäude, Asphalt) — optional' } },
      { id: 'b5_nature_oriented_ha', type: 'number', unit: 'ha', label: { en: 'Nature-oriented area on site (green roofs, meadows) — optional', de: 'Naturnahe Fläche am Standort (Gründächer, Wiesen) — optional' } },
    ],
  },

  {
    id: 'b6',
    code: 'B6',
    title: { en: 'Water', de: 'Wasser' },
    intro: {
      en: 'Your annual water withdrawal — from your water bill. Water stress information: the WRI "Aqueduct" atlas (free, online) shows whether your region is water-stressed; most of central Europe is not.',
      de: 'Ihre jährliche Wasserentnahme — laut Wasserrechnung. Wasserstress: Der kostenlose Online-Atlas „Aqueduct" (WRI) zeigt, ob Ihre Region unter Wasserstress steht; Mitteleuropa größtenteils nicht.',
    },
    fields: [
      { id: 'b6_withdrawal_m3', type: 'number', unit: 'm³', label: { en: 'Total water withdrawal', de: 'Gesamte Wasserentnahme' } },
      {
        id: 'b6_stress_sites', type: 'yesno',
        label: { en: 'Do you have sites in areas of high water stress?', de: 'Gibt es Standorte in Gebieten mit hohem Wasserstress?' },
      },
      { id: 'b6_stress_withdrawal_m3', type: 'number', unit: 'm³', label: { en: 'Withdrawal at water-stressed sites', de: 'Entnahme an Standorten mit Wasserstress' }, showIf: { field: 'b6_stress_sites', value: 'yes' } },
      {
        id: 'b6_consumption_m3', type: 'number', unit: 'm³',
        label: { en: 'Water consumption (withdrawal minus discharge) — if known', de: 'Wasserverbrauch (Entnahme minus Einleitung) — falls bekannt' },
        help: { en: 'Relevant mainly for production processes. Offices can usually leave this empty.', de: 'Vor allem für Produktionsprozesse relevant. Büros können dies meist leer lassen.' },
      },
    ],
  },

  {
    id: 'b7',
    code: 'B7',
    title: { en: 'Resource use, circular economy & waste', de: 'Ressourcennutzung, Kreislaufwirtschaft & Abfall' },
    intro: {
      en: 'How you handle materials and waste. Your waste contractor’s annual statement has the tonnages.',
      de: 'Wie Sie mit Materialien und Abfall umgehen. Die Jahresabrechnung Ihres Entsorgers enthält die Tonnagen.',
    },
    fields: [
      {
        id: 'b7_circular_principles', type: 'yesno',
        label: { en: 'Do you apply circular economy principles?', de: 'Wenden Sie Prinzipien der Kreislaufwirtschaft an?' },
        help: { en: 'e.g. designing for reuse, take-back schemes, refurbishing, using recycled inputs.', de: 'z. B. wiederverwendbares Design, Rücknahmesysteme, Aufarbeitung, Einsatz von Rezyklaten.' },
      },
      { id: 'b7_circular_note', type: 'textarea', label: { en: 'Describe how', de: 'Beschreibung' }, showIf: { field: 'b7_circular_principles', value: 'yes' } },
      { id: 'b7_waste_nonhaz_t', type: 'number', unit: 't', label: { en: 'Non-hazardous waste generated per year', de: 'Nicht gefährlicher Abfall pro Jahr' } },
      { id: 'b7_waste_haz_t', type: 'number', unit: 't', label: { en: 'Hazardous waste generated per year', de: 'Gefährlicher Abfall pro Jahr' } },
      { id: 'b7_waste_recycled_t', type: 'number', unit: 't', label: { en: 'Waste diverted to recycling or reuse', de: 'Abfall, der recycelt oder wiederverwendet wird' } },
      {
        id: 'b7_materials', type: 'textarea',
        label: { en: 'Key materials used and their annual mass (optional)', de: 'Wichtigste eingesetzte Materialien und Jahresmenge (optional)' },
        help: { en: 'Mainly relevant for manufacturing. e.g. "Steel: 120 t, of which 30% recycled".', de: 'Vor allem für produzierende Unternehmen. z. B. „Stahl: 120 t, davon 30 % Rezyklat".' },
      },
    ],
  },

  {
    id: 'b8',
    code: 'B8',
    title: { en: 'Workforce — general characteristics', de: 'Belegschaft — allgemeine Merkmale' },
    intro: {
      en: 'Basic facts about your employees, as of the end of the reporting year. Your payroll or HR records have all of this.',
      de: 'Grunddaten zu Ihren Beschäftigten zum Ende des Berichtsjahres. Ihre Lohnbuchhaltung hat alle Zahlen.',
    },
    fields: [
      {
        id: 'b8_count_basis', type: 'select',
        label: { en: 'Counting method', de: 'Zählweise' },
        options: [
          { value: 'headcount', en: 'Headcount (number of people)', de: 'Kopfzahl (Anzahl Personen)' },
          { value: 'fte', en: 'Full-time equivalents (FTE)', de: 'Vollzeitäquivalente (VZÄ)' },
        ],
      },
      { id: 'b8_permanent', type: 'number', label: { en: 'Employees with permanent contracts', de: 'Beschäftigte mit unbefristeten Verträgen' } },
      { id: 'b8_temporary', type: 'number', label: { en: 'Employees with temporary contracts', de: 'Beschäftigte mit befristeten Verträgen' } },
      { id: 'b8_male', type: 'number', label: { en: 'Male employees', de: 'Männliche Beschäftigte' } },
      { id: 'b8_female', type: 'number', label: { en: 'Female employees', de: 'Weibliche Beschäftigte' } },
      { id: 'b8_other_gender', type: 'number', label: { en: 'Other / not reported', de: 'Divers / keine Angabe' } },
      {
        id: 'b8_countries', type: 'textarea',
        label: { en: 'Employees per country (if more than one country)', de: 'Beschäftigte pro Land (falls mehrere Länder)' },
        help: { en: 'e.g. "Germany: 42, Austria: 5". Leave empty if all in one country.', de: 'z. B. „Deutschland: 42, Österreich: 5". Leer lassen, wenn alle in einem Land.' },
      },
      {
        id: 'b8_turnover_rate', type: 'number', unit: '%',
        label: { en: 'Employee turnover rate (optional, if ≥ 50 employees)', de: 'Fluktuationsrate (optional, ab 50 Beschäftigten)' },
        help: { en: 'Leavers during the year ÷ average number of employees × 100.', de: 'Abgänge im Jahr ÷ durchschnittliche Beschäftigtenzahl × 100.' },
      },
    ],
  },

  {
    id: 'b9',
    code: 'B9',
    title: { en: 'Workforce — health & safety', de: 'Belegschaft — Gesundheit & Sicherheit' },
    intro: {
      en: 'Work-related accidents in the reporting year. Your accident insurance (e.g. Berufsgenossenschaft) statements list recordable accidents.',
      de: 'Arbeitsunfälle im Berichtsjahr. Die Meldungen an Ihre Berufsgenossenschaft enthalten die meldepflichtigen Unfälle.',
    },
    fields: [
      { id: 'b9_accidents', type: 'number', label: { en: 'Number of recordable work-related accidents', de: 'Anzahl meldepflichtiger Arbeitsunfälle' } },
      { id: 'b9_fatalities', type: 'number', label: { en: 'Number of work-related fatalities', de: 'Anzahl tödlicher Arbeitsunfälle' } },
      {
        id: 'b9_hours_worked', type: 'number', unit: 'h',
        label: { en: 'Total hours worked by all employees (optional)', de: 'Gesamte geleistete Arbeitsstunden aller Beschäftigten (optional)' },
        help: { en: 'If provided, the app computes the accident rate per 200,000 hours worked. A rough estimate: employees × 1,600 h.', de: 'Falls angegeben, berechnet die App die Unfallrate pro 200.000 Arbeitsstunden. Faustregel: Beschäftigte × 1.600 h.' },
      },
    ],
  },

  {
    id: 'b10',
    code: 'B10',
    title: { en: 'Workforce — pay, bargaining & training', de: 'Belegschaft — Vergütung, Tarifbindung & Weiterbildung' },
    intro: {
      en: 'Fair pay and skills development.',
      de: 'Faire Bezahlung und Kompetenzentwicklung.',
    },
    fields: [
      {
        id: 'b10_minimum_wage', type: 'yesno',
        label: { en: 'Do all employees receive at least the applicable minimum wage?', de: 'Erhalten alle Beschäftigten mindestens den geltenden Mindestlohn?' },
      },
      {
        id: 'b10_pay_gap', type: 'number', unit: '%',
        label: { en: 'Gender pay gap (optional, if ≥ 150 employees)', de: 'Geschlechtsspezifisches Lohngefälle (optional, ab 150 Beschäftigten)' },
        help: { en: '(Average gross hourly pay of men − women) ÷ men × 100.', de: '(Durchschnittlicher Bruttostundenlohn Männer − Frauen) ÷ Männer × 100.' },
      },
      {
        id: 'b10_collective_bargaining', type: 'number', unit: '%',
        label: { en: 'Share of employees covered by collective bargaining', de: 'Anteil der Beschäftigten mit Tarifbindung' },
        help: { en: 'Enter 0 if no collective agreements apply.', de: '0 eintragen, wenn keine Tarifverträge gelten.' },
      },
      { id: 'b10_training_hours_male', type: 'number', unit: 'h', label: { en: 'Average training hours per male employee', de: 'Durchschnittliche Weiterbildungsstunden pro männlichem Beschäftigten' } },
      { id: 'b10_training_hours_female', type: 'number', unit: 'h', label: { en: 'Average training hours per female employee', de: 'Durchschnittliche Weiterbildungsstunden pro weiblicher Beschäftigten' } },
    ],
  },

  {
    id: 'b11',
    code: 'B11',
    title: { en: 'Convictions & fines — corruption and bribery', de: 'Verurteilungen & Bußgelder — Korruption und Bestechung' },
    intro: {
      en: 'Convictions and fines for violations of anti-corruption and anti-bribery laws in the reporting year. For nearly all SMEs both numbers are zero — and reporting "0" is exactly what the standard wants.',
      de: 'Verurteilungen und Bußgelder wegen Verstößen gegen Antikorruptions- und Bestechungsgesetze im Berichtsjahr. Bei fast allen KMU sind beide Zahlen null — und genau das soll berichtet werden.',
    },
    fields: [
      { id: 'b11_convictions', type: 'number', label: { en: 'Number of convictions', de: 'Anzahl Verurteilungen' } },
      { id: 'b11_fines_eur', type: 'number', unit: '€', label: { en: 'Total amount of fines', de: 'Gesamtsumme der Bußgelder' } },
    ],
  },
];

/** All input field ids (used for progress calculation and tests). */
export function allFieldIds() {
  return SCHEMA.flatMap((s) => s.fields.map((f) => f.id));
}

/** Is a field currently visible given the data (showIf logic)? */
export function isVisible(field, data) {
  if (!field.showIf) return true;
  return data[field.showIf.field] === field.showIf.value;
}

/** Completion ratio 0..1 — filled visible fields / visible fields (optional-marked fields excluded from the denominator only if empty). */
export function completion(data) {
  let filled = 0;
  let total = 0;
  for (const section of SCHEMA) {
    for (const f of section.fields) {
      if (!isVisible(f, data)) continue;
      total++;
      const v = data[f.id];
      if (v !== undefined && v !== null && String(v).trim() !== '') filled++;
    }
  }
  return total > 0 ? filled / total : 0;
}
