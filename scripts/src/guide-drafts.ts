export type GuideDraft = {
  handle: string;
  title: string;
  summary: string;
  tags: string[];
  body: string;
};

function faq(items: Array<{ q: string; a: string }>) {
  return `<section class="faq"><h2>Frequently asked questions</h2>${items
    .map((item) => `<details><summary>${item.q}</summary><p>${item.a}</p></details>`)
    .join("")}</section>`;
}

function sources(items: Array<{ label: string; url: string }>) {
  return `<section class="guide-sources"><h2>Sources reviewed</h2><ul>${items
    .map((item) => `<li><a href="${item.url}" rel="noopener noreferrer">${item.label}</a></li>`)
    .join("")}</ul><p><em>Regulations and product requirements change. Verify the current rule, model listing, manufacturer literature, and local permit requirements before purchase or installation.</em></p></section>`;
}

export const GUIDE_DRAFTS: GuideDraft[] = [
  {
    handle: "california-hvac-compliance-guide",
    title: "California HVAC Compliance Guide: SEER2, CEC Listings, AHRI and Rule 1111",
    summary: "A practical checklist for checking central HVAC equipment before it is sold or installed in California.",
    tags: ["California", "Compliance", "SEER2", "CEC", "AHRI", "Rule 1111"],
    body: `
      <div class="short-answer"><strong>Short answer:</strong> In California, do not treat one efficiency number as proof that an HVAC system is compliant. Check the exact equipment combination, current federal efficiency rules, California appliance certification where applicable, AHRI matched-system data, local air-district rules for furnaces, and the permit requirements for the installation address.</div>
      <nav class="article-toc" aria-label="On this page"><strong>On this page</strong><ul><li><a href="#seer2">SEER2 and EER2</a></li><li><a href="#cec">CEC / MAEDbS</a></li><li><a href="#ahri">AHRI matching</a></li><li><a href="#rule1111">South Coast AQMD Rule 1111</a></li><li><a href="#checklist">Buying checklist</a></li></ul></nav>
      <h2 id="seer2">1. Start with the federal SEER2/EER2 rules</h2>
      <p>California is in the federal Southwest region for regional central-air-conditioner standards. The current rules use the newer SEER2 and EER2 test metrics. For split-system central air conditioners installed in the Southwest, the minimum cooling-efficiency thresholds depend on capacity and, for EER2, the system's SEER2 level. Single-package central air conditioners have a separate threshold. Heat pumps have their own federal minimums.</p>
      <p>That means a product described only as “high efficiency” is not enough. The exact certified rating for the exact equipment combination matters. HVAC Pacific therefore displays SEER2, EER2 and HSPF2 only when those values are present in the catalog; we do not estimate or derive them from older ratings.</p>
      <h2 id="cec">2. Verify California appliance certification</h2>
      <p>The California Energy Commission says regulated appliance types must comply with Title 20 before they can be sold or offered for sale in California. Manufacturers certify regulated models through the Modernized Appliance Efficiency Database System (MAEDbS). The public can search the database by model number, brand or manufacturer, and an approved model listing is the practical way to verify the model's Title 20 status.</p>
      <p>Do not confuse “CEC listed” with a general marketing badge. It is model-specific. If a product page does not show a CEC field, verify the exact model in MAEDbS before treating it as certified.</p>
      <h2 id="ahri">3. Check the AHRI matched system</h2>
      <p>Split systems are combinations of components, not just an outdoor condenser. The AHRI Directory of Certified Product Performance lets you search by AHRI Certified Reference Number or by model numbers. Use it to confirm that the outdoor unit, indoor coil or air handler, and furnace where applicable form the certified combination associated with the published ratings.</p>
      <p>A nominal “3 ton” outdoor unit and a nominal “3 ton” coil are not automatically a certified match. Model numbers are the safer identifier.</p>
      <h2 id="rule1111">4. South Coast AQMD Rule 1111 matters for gas furnaces</h2>
      <p>In the South Coast Air Basin, Rule 1111 regulates NOx emissions from natural-gas-fired, fan-type central furnaces. South Coast AQMD states that the rule established a 14 nanogram-per-joule NOx limit for natural-gas central furnaces. The rule was amended again on January 9, 2026; special provisions can apply to particular furnace categories, so the current rule text should be checked for the exact application.</p>
      <p>For buyers in the Los Angeles area, this is one reason a furnace cannot be selected on AFUE and capacity alone. The installation address and air-district requirements matter too.</p>
      <h2 id="checklist">A practical pre-purchase checklist</h2>
      <ol><li>Write down every exact model number in the proposed system.</li><li>Confirm the system's current SEER2/EER2/HSPF2 data rather than converting from older ratings.</li><li>Search regulated models in California's MAEDbS.</li><li>Use the AHRI Directory to verify the exact matched combination when an AHRI reference is available.</li><li>For a gas furnace in South Coast AQMD territory, verify current Rule 1111 compliance.</li><li>Have the licensed contractor confirm electrical service, refrigerant, ductwork, load calculation and permit requirements for the job address.</li></ol>
      <p>Compare <a href="/units/heat-pump-systems">heat pump systems</a> and <a href="/units/ac-furnace-systems">AC + furnace systems</a> after the project requirements are verified. You can also <a href="/need-installer">request an independent installer referral</a>.</p>
      ${faq([
        {q:"Is a SEER2 rating by itself enough to prove California compliance?",a:"No. The exact system, federal regional standards, California appliance certification where applicable, local air-district rules and permit requirements can all matter."},
        {q:"Does an AHRI match automatically mean a model is CEC listed?",a:"No. AHRI certification and California appliance certification are separate checks."},
        {q:"Does South Coast AQMD Rule 1111 apply to every furnace in California?",a:"No. Rule 1111 is a South Coast AQMD rule; verify whether the installation address is within its jurisdiction and check the current rule."}
      ])}
      ${sources([
        {label:"California Energy Commission — Appliance Regulations Certification Assistance",url:"https://www.energy.ca.gov/rules-and-regulations/appliance-efficiency-regulations-title-20/appliance-regulations-certification"},
        {label:"California Energy Commission — Appliance Efficiency Outreach and MAEDbS guidance",url:"https://www.energy.ca.gov/programs-and-topics/programs/appliance-efficiency-program-outreach-and-education"},
        {label:"AHRI Directory of Certified Product Performance",url:"https://www.ahridirectory.org/"},
        {label:"South Coast AQMD — Rule 1111",url:"https://www.aqmd.gov/home/rules-compliance/rules/scaqmd-rule-book/regulation-xi"},
        {label:"U.S. DOE — 2023 Central Air Conditioner Regional Standards FAQ",url:"https://www1.eere.energy.gov/buildings/appliance_standards/pdfs/2023_CAC_Standards_FAQ_10-5-2022_Final.pdf"}
      ])}
    `,
  },
  {
    handle: "what-is-an-ahri-matched-system",
    title: "What Is an AHRI Matched HVAC System, and How Do You Look One Up?",
    summary: "How to use exact component model numbers and the AHRI Directory to verify a certified HVAC combination.",
    tags: ["AHRI", "Matched System", "Heat Pump", "Central AC"],
    body: `
      <div class="short-answer"><strong>Short answer:</strong> An AHRI matched system is a tested and certified combination of HVAC components whose published performance applies to that specific combination. For a split system, verify the outdoor model and the matching indoor coil or air handler — and the furnace when the certified combination includes one — instead of matching equipment by tonnage alone.</div>
      <nav class="article-toc" aria-label="On this page"><strong>On this page</strong><ul><li><a href="#why">Why matching matters</a></li><li><a href="#lookup">How to look it up</a></li><li><a href="#certificate">How to read the result</a></li><li><a href="#pitfalls">Common mistakes</a></li></ul></nav>
      <h2 id="why">Why the exact combination matters</h2>
      <p>Central split HVAC equipment works as a system. The outdoor unit, indoor heat exchanger, blower configuration and sometimes furnace affect the tested performance. Two components can have the same nominal capacity and still produce a different certified rating — or have no certified match together at all.</p>
      <p>This matters when comparing SEER2, EER2 or HSPF2, checking eligibility for a program, or documenting a permitted installation. A rating attached to one combination should not be copied onto a different combination.</p>
      <h2 id="lookup">How to look up a system</h2>
      <ol><li>Collect the complete model numbers from the proposal or product pages. Do not rely on a shortened family name.</li><li>Open the AHRI Directory of Certified Product Performance.</li><li>If you already have an AHRI Certified Reference Number, search that number first. Otherwise use the model-number search tools.</li><li>Compare every component on the result with the equipment you are actually buying.</li><li>Check the certified ratings shown for that combination and keep the reference information with the job records.</li></ol>
      <h2 id="certificate">What to confirm on the result</h2>
      <p>Start with identity: manufacturer, outdoor model and indoor model. Where a furnace is part of the certified combination, verify it too. Then review the ratings that are actually listed. Do not fill in a missing rating yourself.</p>
      <p>On HVAC Pacific product pages, an AHRI reference appears only when the catalog contains one. The component table likewise uses the stored outdoor, indoor and furnace model fields instead of a guessed pairing.</p>
      <h2 id="pitfalls">Common matching mistakes</h2>
      <ul><li><strong>Matching by tonnage:</strong> nominal capacity is not a certification identifier.</li><li><strong>Using one component's efficiency:</strong> split-system efficiency is tied to the tested combination.</li><li><strong>Ignoring suffixes:</strong> model-number suffixes can identify a different revision or configuration.</li><li><strong>Assuming a replacement component preserves the old rating:</strong> verify the new combination.</li><li><strong>Treating AHRI as the only approval:</strong> California appliance certification, local air-district rules and permitting can be separate checks.</li></ul>
      <p>When comparing products, start with exact models in <a href="/units/heat-pump-systems">heat pump systems</a> or <a href="/units/ac-furnace-systems">AC + furnace systems</a>, then verify the matched-system record before installation.</p>
      ${faq([
        {q:"Can I match an outdoor unit and coil only by tonnage?",a:"No. Nominal tonnage does not establish an AHRI-certified combination; verify the exact component model numbers."},
        {q:"Where do I look up an AHRI reference number?",a:"Use the AHRI Directory of Certified Product Performance and search by the reference number or exact model numbers."},
        {q:"Can changing one component change the certified efficiency?",a:"Yes. Published split-system ratings apply to specific certified combinations."}
      ])}
      ${sources([
        {label:"AHRI Directory of Certified Product Performance",url:"https://www.ahridirectory.org/"},
        {label:"California Energy Commission — Appliance certification guidance",url:"https://www.energy.ca.gov/rules-and-regulations/appliance-efficiency-regulations-title-20/appliance-regulations-certification"}
      ])}
    `,
  },
  {
    handle: "how-to-size-central-ac-heat-pump",
    title: "How to Size a Central AC or Heat Pump: Why a Manual J Beats a Square-Foot Chart",
    summary: "Why HVAC capacity should be based on a residential load calculation rather than a simple tons-per-square-foot shortcut.",
    tags: ["Manual J", "Sizing", "Central AC", "Heat Pump", "Tonnage"],
    body: `
      <div class="short-answer"><strong>Short answer:</strong> Do not select a central AC or heat pump from square footage alone. ACCA Manual J is the ANSI-recognized residential load-calculation procedure used to determine heating and cooling loads from the building and local design conditions. A contractor should use a proper load calculation before final equipment selection.</div>
      <nav class="article-toc" aria-label="On this page"><strong>On this page</strong><ul><li><a href="#tons">What tonnage means</a></li><li><a href="#why">Why square footage is not enough</a></li><li><a href="#manualj">What Manual J considers</a></li><li><a href="#buying">What to ask before buying</a></li></ul></nav>
      <h2 id="tons">Tonnage is capacity, not the size of the house</h2>
      <p>HVAC “tons” describe cooling capacity; they are not a direct measurement of floor area. Two houses with the same square footage can have materially different loads because of climate, orientation, windows, insulation, air leakage, roof conditions, occupancy and duct losses.</p>
      <p>That is why HVAC Pacific does not publish a generic “X square feet equals Y tons” chart as a purchasing rule. A shortcut can be useful for rough conversation, but it is not a substitute for system design.</p>
      <h2 id="why">Oversizing and undersizing are both problems</h2>
      <p>An undersized system may struggle to meet the design load. An oversized system can also create comfort and operating problems because capacity, airflow, staging and runtime need to fit the building. The goal is not “the biggest unit that fits”; it is equipment selected for the calculated load and the actual duct and electrical system.</p>
      <h2 id="manualj">What a Manual J calculation does</h2>
      <p>ACCA describes Manual J 8th Edition as the national ANSI-recognized standard for producing residential HVAC equipment sizing loads. It covers single-family homes and a range of dwelling types with their own heating and cooling systems. The procedure uses design conditions and building-component information to estimate heating and cooling loads.</p>
      <p>A credible load calculation therefore starts with the building, not with a product page. After the load is known, the contractor can move to equipment selection and verify that the proposed matched system can deliver the required capacity under the design conditions.</p>
      <h2 id="buying">Questions to ask before ordering equipment</h2>
      <ul><li>Was a Manual J or equivalent code-accepted load calculation completed?</li><li>What are the design heating and cooling loads?</li><li>Is the proposed equipment an AHRI-certified match?</li><li>Is the existing duct system appropriate for the required airflow?</li><li>Does the electrical service match the equipment requirements?</li><li>What permit, refrigerant and local compliance rules apply at the address?</li></ul>
      <p>If you already know the required capacity, compare <a href="/units/heat-pump-systems">heat pump systems</a> or <a href="/units/mini-splits">ductless mini splits</a>. If you still need job-specific sizing, <a href="/need-installer">request an installer referral</a> before purchasing.</p>
      ${faq([
        {q:"How many square feet does one ton of AC cool?",a:"There is no reliable universal square-foot rule. Building envelope, climate, glass, orientation, infiltration, occupancy and ducts all affect the load."},
        {q:"What is Manual J?",a:"Manual J is ACCA's ANSI-recognized residential heating and cooling load-calculation procedure."},
        {q:"Should I replace an old unit with the same tonnage automatically?",a:"Not automatically. A replacement is a good time to verify the current building load, duct system and equipment selection."}
      ])}
      ${sources([
        {label:"ACCA — Manual J Residential Load Calculation",url:"https://www.acca.org/standards/technical-manuals/manual-j"},
        {label:"ACCA — Approved Manual J Software",url:"https://www.acca.org/acca/standards/approved-software"}
      ])}
    `,
  },
  {
    handle: "packaged-unit-vs-split-system",
    title: "Packaged Unit vs. Split HVAC System: What Is the Difference?",
    summary: "A practical comparison of packaged HVAC equipment and split systems, including space, duct and service considerations.",
    tags: ["Packaged Units", "Split System", "HVAC Systems"],
    body: `
      <div class="short-answer"><strong>Short answer:</strong> A split HVAC system divides the major equipment between an outdoor unit and an indoor unit. A packaged system places the major heating and cooling components in one outdoor cabinet and connects that cabinet to the building's ductwork. The right format depends on the building, existing equipment, duct layout, electrical or gas service and the intended replacement design.</div>
      <nav class="article-toc" aria-label="On this page"><strong>On this page</strong><ul><li><a href="#split">Split systems</a></li><li><a href="#package">Packaged systems</a></li><li><a href="#compare">What to compare</a></li><li><a href="#replacement">Replacement jobs</a></li></ul></nav>
      <h2 id="split">How a split system is arranged</h2>
      <p>In a conventional split system, the outdoor section contains the compressor and condenser while the indoor side contains the evaporator coil or air handler. A furnace can be part of the indoor assembly in an AC-plus-furnace system. Refrigerant lines connect the indoor and outdoor components.</p>
      <p>The separated design makes component matching important. When you buy a split system, verify the outdoor model, indoor coil or air-handler model, and furnace model where applicable rather than shopping for each piece independently by nominal tonnage.</p>
      <h2 id="package">How a packaged system is arranged</h2>
      <p>Carrier describes a packaged HVAC system as one in which the major heating and cooling components are contained in a single outdoor cabinet that connects to the duct system. Depending on the product, the package may be a heat pump, gas/electric system, or another configuration.</p>
      <p>Packaged equipment can be useful where there is limited indoor mechanical space, but it is not automatically a drop-in replacement for every rooftop or ground-mounted unit. Cabinet dimensions, curb or duct transitions, gas and electrical connections, condensate, airflow and controls all need to match the job.</p>
      <h2 id="compare">What to compare before choosing</h2>
      <ul><li><strong>Existing layout:</strong> is the building already configured for a package unit or separate indoor/outdoor equipment?</li><li><strong>Fuel and system type:</strong> heat pump, gas/electric, AC with furnace, or another design?</li><li><strong>Capacity:</strong> use the calculated load, not just the old unit's nominal size.</li><li><strong>Efficiency:</strong> compare the certified SEER2/EER2/HSPF2 or AFUE values that apply to the exact product or combination.</li><li><strong>Electrical service:</strong> verify voltage, phase, minimum circuit ampacity and overcurrent protection from manufacturer data.</li><li><strong>Physical fit:</strong> cabinet dimensions and duct connection locations can matter as much as tonnage on a replacement.</li></ul>
      <h2 id="replacement">For a replacement job</h2>
      <p>Photograph the existing nameplate and record the full model number. A contractor can then compare capacity, configuration, duct connection, electrical requirements and current code requirements. Do not order solely because a new unit shares the same tonnage as the old one.</p>
      <p>Browse <a href="/units/packaged-units">packaged units</a> or compare <a href="/units/heat-pump-systems">heat pump systems</a> once the job requirements are known.</p>
      ${faq([
        {q:"Is a packaged unit the same as a split system?",a:"No. A packaged unit contains the major heating and cooling components in one outdoor cabinet; a split system separates major components between indoor and outdoor sections."},
        {q:"Can a packaged unit replace any rooftop unit with the same tonnage?",a:"No. Cabinet dimensions, curb or duct connections, electrical or gas requirements, airflow and controls must be checked for the specific replacement."},
        {q:"Which type is more efficient?",a:"Efficiency depends on the exact certified product or system, not simply whether the equipment is packaged or split."}
      ])}
      ${sources([
        {label:"Carrier — Types of HVAC Systems and Units",url:"https://www.carrier.com/us/en/residential/hvac-resources/types-of-hvac-systems-and-hvac-units/"},
        {label:"Carrier — What Is a Split HVAC System?",url:"https://www.carrier.com/us/en/residential/hvac-resources/air-conditioners/what-is-split-hvac-system/"}
      ])}
    `,
  },
  {
    handle: "r454b-vs-r32-vs-r410a",
    title: "R-454B vs. R-32 vs. R-410A: What Changed in Residential HVAC?",
    summary: "A current overview of the lower-GWP refrigerant transition and why refrigerant type is a system design requirement, not an interchangeable choice.",
    tags: ["R-454B", "R-32", "R-410A", "Refrigerant", "A2L"],
    body: `
      <div class="short-answer"><strong>Short answer:</strong> New U.S. residential and light-commercial AC and heat-pump equipment has moved toward refrigerants below EPA's 700-GWP limit. R-32 and R-454B are lower-GWP A2L refrigerants used in new equipment designed for them. R-410A has a much higher GWP and remains important for servicing legacy systems, but refrigerants are not interchangeable unless the equipment manufacturer specifically designed and approved the system for that refrigerant.</div>
      <nav class="article-toc" aria-label="On this page"><strong>On this page</strong><ul><li><a href="#rule">What the rule changed</a></li><li><a href="#compare">R-410A, R-32 and R-454B</a></li><li><a href="#a2l">What A2L means for buying</a></li><li><a href="#legacy">Existing R-410A systems</a></li></ul></nav>
      <h2 id="rule">The federal transition is based on GWP limits</h2>
      <p>EPA's Technology Transitions Program sets a 700 global-warming-potential limit for stationary residential and light-commercial air-conditioning and heat-pump products beginning January 1, 2025, with transition provisions for equipment already in the supply chain. EPA's rules and later actions contain details and exceptions, so the manufacture date and whether something is a complete new system or a service component can matter.</p>
      <h2 id="compare">How the refrigerants compare</h2>
      <p>EPA's reference data places R-410A at a GWP of about 2,088. EPA lists HFC-32 (R-32) at 675 and classifies it A2L. EPA also lists R-454B as A2L, with current EPA tables using a GWP in the mid-400s depending on the referenced assessment dataset. Both R-32 and R-454B are below the 700 limit used for this HVAC subsector.</p>
      <p>The practical buying point is more important than the exact GWP decimal: the refrigerant is part of the equipment design. The compressor, controls, heat exchangers, service fittings, safety features and installation instructions are designed around a particular refrigerant. Do not treat R-32, R-454B and R-410A as field-interchangeable substitutes.</p>
      <h2 id="a2l">A2L equipment has specific use conditions</h2>
      <p>EPA's SNAP program lists R-32 and R-454B as acceptable for new residential and light-commercial AC and heat-pump equipment subject to use conditions. A2L indicates lower flammability than higher-flammability refrigerant classes, but it still changes equipment, installation and service requirements. Follow the exact manufacturer instructions and applicable codes.</p>
      <h2 id="legacy">What about an existing R-410A system?</h2>
      <p>The transition does not mean every existing R-410A system must be removed. EPA distinguishes new systems from service components and allows continued sale of R-410A components for servicing legacy equipment under the applicable rules. A replacement condenser intended for service is not the same regulatory situation as assembling a new R-410A system.</p>
      <p>Compare refrigerant-specific equipment in <a href="/units/heat-pump-systems">heat pump systems</a> and <a href="/units/mini-splits">ductless mini splits</a>, and verify the refrigerant printed on every matched component. For cylinders, see our <a href="/refrigerant-sales-policy">refrigerant sales policy</a>.</p>
      ${faq([
        {q:"Can R-32, R-454B and R-410A be mixed or swapped in the same system?",a:"No. Use only the refrigerant and service procedures approved by the equipment manufacturer for the exact model."},
        {q:"Are R-32 and R-454B A2L refrigerants?",a:"Yes. EPA lists both for applicable new equipment subject to the specified use conditions."},
        {q:"Do existing R-410A systems have to be replaced immediately?",a:"No. EPA distinguishes existing-system service from the requirements that apply to new systems and products."}
      ])}
      ${sources([
        {label:"U.S. EPA — Technology Transitions HFC Restrictions by Sector",url:"https://www.epa.gov/hfcs/technology-transitions-hfc-restrictions-sector"},
        {label:"U.S. EPA — Technology Transitions GWP Reference Table",url:"https://www.epa.gov/hfcs/technology-transitions-gwp-reference-table"},
        {label:"U.S. EPA — SNAP substitutes for residential and light-commercial AC and heat pumps",url:"https://www.epa.gov/snap/substitutes-residential-and-light-commercial-air-conditioning-and-heat-pumps"},
        {label:"U.S. EPA — HFC phasedown frequent questions",url:"https://www.epa.gov/hfcs/frequent-questions-phasedown-hydrofluorocarbons"}
      ])}
    `,
  },
  {
    handle: "how-to-choose-replacement-dual-run-capacitor",
    title: "How to Choose a Replacement Dual Run Capacitor: MFD, Voltage and Shape",
    summary: "How to read an HVAC run capacitor label and avoid mismatching capacitance, voltage or terminal functions.",
    tags: ["Capacitors", "Dual Run Capacitor", "MFD", "HVAC Parts"],
    body: `
      <div class="short-answer"><strong>Short answer:</strong> Match the required microfarad value exactly and use a capacitor with an appropriate voltage rating for the application. On a dual run capacitor, both capacitance values matter. Physical shape can affect mounting, but electrical ratings and correct terminal identification are the first checks.</div>
      <nav class="article-toc" aria-label="On this page"><strong>On this page</strong><ul><li><a href="#label">Reading the label</a></li><li><a href="#dual">Dual-run values</a></li><li><a href="#voltage">Voltage rating</a></li><li><a href="#shape">Round vs. oval</a></li><li><a href="#safety">Safety</a></li></ul></nav>
      <h2 id="label">Start with the old capacitor and equipment data</h2>
      <p>Record the complete label before disconnecting anything. HVAC capacitors are marked with capacitance in microfarads — often written μF or MFD — and a voltage rating. The motor or equipment literature is the better authority if the existing part is not known to be original.</p>
      <h2 id="dual">A dual run capacitor has two capacitance values</h2>
      <p>A dual run capacitor combines two capacitor sections in one case, commonly serving a compressor and a fan motor. A marking such as “45/5 MFD” therefore contains two separate capacitance requirements. Do not replace it with a part that matches only one of the values.</p>
      <p>Terminals are typically identified for the common connection and the two loads. Wire placement must follow the equipment diagram and the markings on the replacement part; do not rely on terminal position alone.</p>
      <h2 id="voltage">Do not install a lower voltage rating</h2>
      <p>MARS service guidance says replacement capacitance must be correct and warns against using a lower voltage rating. Its capacitor reference material also notes that, generally, the same MFD rating with a higher voltage rating can be used where the application permits it. When the correct rating is uncertain, use the motor or equipment manufacturer's specified replacement rather than guessing.</p>
      <h2 id="shape">Round vs. oval is mainly a fit question</h2>
      <p>Run capacitors are sold in different case shapes and dimensions. If the electrical rating and application are correct, the case still has to fit securely in the equipment with adequate clearance and a proper mounting method. Measure the old case and mounting space before ordering.</p>
      <h2 id="safety">Capacitors can retain electrical charge</h2>
      <p>HVAC electrical work can expose you to line voltage and stored energy even after power is switched off. If you are not trained to isolate, verify and service the circuit safely, have a qualified technician diagnose and replace the component.</p>
      <p>Browse <a href="/parts/capacitors">HVAC capacitors</a>, including <a href="/parts/capacitors/dual-run-capacitors">dual run capacitors</a>. Filter and product specs should be matched to the equipment requirement, not to appearance alone.</p>
      ${faq([
        {q:"What does 45/5 MFD mean on a dual run capacitor?",a:"It identifies two capacitance values in one capacitor, commonly one section for the compressor and one for the fan motor."},
        {q:"Can I use a lower voltage-rated capacitor?",a:"No. Replacement guidance warns against using a lower voltage rating."},
        {q:"Does round versus oval change the electrical rating?",a:"The electrical requirements come from capacitance and voltage ratings; case shape mainly affects physical fit and mounting."}
      ])}
      ${sources([
        {label:"MARS — Capacitor Basics",url:"https://c3.marsdelivers.com/wps/wcm/connect/56f57020-4764-429e-810e-ca911432dc10/Capacitor_Basics-98610.pdf?CONVERT_TO=url&MOD=AJPERES"},
        {label:"Trane — Heat Pump Capacitors and Signs of Trouble",url:"https://www.trane.com/residential/en/resources/troubleshooting/heat-pumps/heat-pump-capacitor/"}
      ])}
    `,
  },
  {
    handle: "buying-r22-california-epa-608",
    title: "Buying R-22 in California: EPA 608 Rules, Reclaimed Refrigerant and Existing Systems",
    summary: "What buyers should know about R-22 sales restrictions, the 2020 production/import phaseout and reclaimed refrigerant.",
    tags: ["R-22", "EPA 608", "Refrigerant", "California"],
    body: `
      <div class="short-answer"><strong>Short answer:</strong> R-22 can still be used to service existing equipment, but U.S. production and import of new HCFC-22 for ordinary servicing ended in 2020. Stationary refrigerant sales are restricted to EPA-certified technicians and qualifying employers or authorized representatives, and used refrigerant sold to a new owner must generally be reclaimed by an EPA-certified reclaimer.</div>
      <nav class="article-toc" aria-label="On this page"><strong>On this page</strong><ul><li><a href="#phaseout">What the R-22 phaseout did</a></li><li><a href="#purchase">Who can buy it</a></li><li><a href="#reclaimed">What reclaimed means</a></li><li><a href="#existing">Existing R-22 equipment</a></li></ul></nav>
      <h2 id="phaseout">The phaseout stopped new production and import — not service of every existing system</h2>
      <p>EPA ended U.S. production and import of HCFC-22 for ordinary servicing as of January 1, 2020. EPA also states that existing R-22 equipment can continue to be serviced. Supply for those systems comes from previously produced stock and recovered/reclaimed refrigerant rather than newly produced domestic R-22 for normal service.</p>
      <h2 id="purchase">EPA restricts sales of stationary refrigerant</h2>
      <p>Section 608 sales restrictions generally limit purchases of ozone-depleting refrigerants and non-ozone-depleting substitutes in cylinders, cans or drums to appropriately certified technicians or qualifying employers/authorized representatives. For stationary refrigeration and air-conditioning refrigerants, Section 608 certification is the relevant certification.</p>
      <p>For an online sale, the seller still has to verify and maintain documentation supporting the purchaser's eligibility. That is why an EPA-gated refrigerant product on HVAC Pacific asks for certification information before it can be added to the cart.</p>
      <h2 id="reclaimed">Recovered, recycled and reclaimed are not interchangeable terms</h2>
      <p>EPA's reclamation rules restrict resale of used ozone-depleting or substitute refrigerant to a new owner unless it has been reclaimed by an EPA-certified reclaimer. EPA says properly reclaimed refrigerant must be reprocessed to the required purity level and verified using the specified laboratory protocol. Refrigerant recovered and reused within equipment owned by the same person can fall under different rules.</p>
      <h2 id="existing">Should an existing R-22 system be repaired or replaced?</h2>
      <p>EPA does not require automatic replacement merely because a system uses R-22. The decision is project-specific and can involve equipment condition, repair scope, refrigerant availability, efficiency, parts availability and the economics of keeping the older system in service.</p>
      <p>If refrigerant is being purchased, verify the product, certification requirement, cylinder size and pickup/delivery restrictions. Browse <a href="/parts/refrigerant">refrigerant products</a> and <a href="/parts/refrigeration-parts">refrigeration parts</a>, then read the <a href="/refrigerant-sales-policy">HVAC Pacific refrigerant sales policy</a> before ordering.</p>
      ${faq([
        {q:"Can existing R-22 equipment still be serviced?",a:"Yes. EPA states existing R-22 equipment can continue to be serviced even though ordinary production and import of new HCFC-22 ended in 2020."},
        {q:"Who can buy stationary refrigerant?",a:"Federal Section 608 sales restrictions generally require an appropriately certified technician or qualifying employer/authorized representative."},
        {q:"Is recovered refrigerant automatically reclaimed?",a:"No. Reclaimed refrigerant must be processed and verified to the required standard by an EPA-certified reclaimer."}
      ])}
      ${sources([
        {label:"U.S. EPA — Refrigerant Sales Restriction",url:"https://www.epa.gov/section608/refrigerant-sales-restriction"},
        {label:"U.S. EPA — Refrigerant Reclamation Requirements",url:"https://www.epa.gov/section608/stationary-refrigeration-refrigerant-reclamation-requirements"},
        {label:"U.S. EPA — Technicians and Contractors: HCFC-22 Frequent Questions",url:"https://www.epa.gov/ods-phaseout/technicians-and-contractors-frequent-questions"},
        {label:"U.S. EPA — Questions and Answers about Refrigerant Sales Restriction",url:"https://www.epa.gov/section608/questions-and-answers-about-refrigerant-sales-restriction"}
      ])}
    `,
  },
  {
    handle: "mini-split-buying-guide",
    title: "Mini Split Buying Guide: Single-Zone vs. Multi-Zone, Capacity and Electrical Requirements",
    summary: "How to compare ductless mini split systems without guessing at capacity, voltage or component compatibility.",
    tags: ["Mini Split", "Ductless", "Heat Pump", "Single Zone", "Multi Zone"],
    body: `
      <div class="short-answer"><strong>Short answer:</strong> Start with the number of spaces you need to condition, then determine the load for each space. A single-zone mini split connects one outdoor unit to one indoor unit. A multi-zone system connects a compatible outdoor unit to multiple indoor units. Capacity, voltage, breaker requirements, line-set limits and allowable indoor-unit combinations are model-specific.</div>
      <nav class="article-toc" aria-label="On this page"><strong>On this page</strong><ul><li><a href="#zones">Single vs. multi-zone</a></li><li><a href="#capacity">Capacity</a></li><li><a href="#electrical">115V vs. 208/230V</a></li><li><a href="#efficiency">Efficiency</a></li><li><a href="#checklist">Buying checklist</a></li></ul></nav>
      <h2 id="zones">Single-zone and multi-zone describe the system arrangement</h2>
      <p>A single-zone ductless system uses one outdoor unit with one indoor unit for one primary zone. A multi-zone system uses one compatible outdoor unit with multiple indoor units so different spaces can be controlled independently. The exact number and type of indoor units allowed depends on the outdoor model and the manufacturer's combination rules.</p>
      <p>Do not assume an indoor head that physically connects to a line set is compatible with a particular condenser. Verify the exact indoor and outdoor model numbers.</p>
      <h2 id="capacity">Size the load, not just the room's floor area</h2>
      <p>BTU capacity is a key filter, but room area is only one input. Layout, glass, insulation, air leakage, occupancy, exposure and climate affect the load. Carrier's current buying guidance likewise recommends matching capacity to the heating and cooling load rather than square footage alone.</p>
      <h2 id="electrical">115V vs. 208/230V is a model requirement</h2>
      <p>Mini splits are available with different electrical requirements. Do not choose voltage as a preference after selecting the equipment; confirm the nameplate and installation manual for the exact outdoor unit. A licensed installer should verify voltage, phase, minimum circuit ampacity, maximum overcurrent protection, disconnect requirements and the available panel capacity before installation.</p>
      <h2 id="efficiency">Compare the ratings that apply to the actual system</h2>
      <p>For heat-pump mini splits, SEER2 describes seasonal cooling efficiency and HSPF2 describes seasonal heating efficiency. Ratings vary by model and, in multi-zone systems, can depend on the certified combination. ENERGY STAR maintains certification criteria and model datasets, but an ENERGY STAR label is not a substitute for checking the exact model and job requirements.</p>
      <h2 id="checklist">Mini split buying checklist</h2>
      <ol><li>Decide which rooms or zones need conditioning.</li><li>Have the heating and cooling load determined for those spaces.</li><li>Choose single-zone or multi-zone architecture.</li><li>Verify the exact indoor/outdoor combination and refrigerant.</li><li>Check voltage, phase and circuit requirements from manufacturer literature.</li><li>Check line-set length, elevation and condensate-routing limits.</li><li>Confirm efficiency ratings and applicable California certification.</li><li>Have a qualified installer confirm the final design and permit requirements.</li></ol>
      <p>Browse <a href="/units/mini-splits">ductless mini split systems</a> and compare them with <a href="/units/heat-pump-systems">central heat pump systems</a>, or <a href="/need-installer">request an independent installer referral</a>.</p>
      ${faq([
        {q:"What is the difference between single-zone and multi-zone mini splits?",a:"Single-zone systems connect one outdoor unit to one indoor unit. Multi-zone systems connect a compatible outdoor unit to multiple approved indoor units."},
        {q:"Can I choose 115V or 230V after selecting the mini split?",a:"No. Voltage and circuit requirements are model-specific and must match the equipment and available electrical service."},
        {q:"Can I size a mini split by room square footage alone?",a:"No. Square footage is only one input; the heating and cooling load depends on the building and design conditions."}
      ])}
      ${sources([
        {label:"ENERGY STAR — Air-Source Heat Pumps",url:"https://www.energystar.gov/products/air_source_heat_pumps"},
        {label:"Carrier — Single vs. Multi-Zone Mini Split Systems",url:"https://www.carrier.com/us/en/residential/hvac-resources/ductless-mini-splits/multi-zone-mini-split/"},
        {label:"Carrier — Mini Split Buyer's Guide",url:"https://www.carrier.com/us/en/residential/hvac-resources/ductless-mini-splits/buyers-guide/"},
        {label:"California Energy Commission — Appliance certification guidance",url:"https://www.energy.ca.gov/rules-and-regulations/appliance-efficiency-regulations-title-20/appliance-regulations-certification"}
      ])}
    `,
  },
];
