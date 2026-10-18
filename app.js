/**
 * Suite #9 Coffee Shop — 2905 Castleberry Rd, Cumming, GA 30040
 * Complete 3D BIM, MEP & 4D Goldstone Construction Phasing Digital Twin
 * Built from Permit Drawings (07/28/2026) + Goldstone Contract & Project Plan (10/03/2026 Meeting)
 * Scale: 1.0 Three.js Unit = 1.0 Foot
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. SUITE #9 DIMENSIONS, CAMERA PRESETS & GLOBAL STATE
  // ==========================================================================

  const CONFIG = {
    suite: {
      width: 20.4,        // 20'-4" interior clear width (20'-11.5" overall) -> X: -10.2' to +10.2'
      length: 50.0,       // 49'-10.5" interior clear length (52'-1" overall) -> Z: -25.0' (North/Back) to +25.0' (South/Front)
      deckHeight: 16.0,   // 16'-0" low deck bearing / 16'-11" high deck
      coffeeBarCeil: 10.0,// 10'-0" AFF ACT & GYP ceiling over Coffee Bar 02
      backHouseCeil: 8.0, // 8'-0" AFF ACT ceiling over Kitchen 03, RR 04/05, Dry Storage 06
      wallThickness: 0.42 // 5" partition walls
    },
    cameraPresets: {
      orbit:      { pos: new THREE.Vector3(24, 22, 34),    target: new THREE.Vector3(0, 4, 2) },
      blueprint:  { pos: new THREE.Vector3(0, 62, 0.01),   target: new THREE.Vector3(0, 0, 0) },
      firstPerson:{ pos: new THREE.Vector3(4.5, 5.5, 21),  target: new THREE.Vector3(-2, 5.2, 4) },
      drivethru:  { pos: new THREE.Vector3(-24, 6.5, 6),   target: new THREE.Vector3(-8, 4.5, 4) },
      a50_1:      { pos: new THREE.Vector3(6.5, 5.6, 19.5),target: new THREE.Vector3(-3.5, 4.2, 2.0) },
      a51_3:      { pos: new THREE.Vector3(-5.2, 5.4, 9.5),target: new THREE.Vector3(-5.2, 4.5, -8.0) },
      a51_4:      { pos: new THREE.Vector3(-4.0, 5.4, -2.5),target: new THREE.Vector3(3.0, 5.5, 16.0) },
      a52_5:      { pos: new THREE.Vector3(4.2, 5.2, -16.8),target: new THREE.Vector3(-1.5, 4.0, -14.5) },
      a52_6:      { pos: new THREE.Vector3(-5.8, 5.2, -7.2),target: new THREE.Vector3(-6.8, 4.2, -17.5) },
      drystorage: { pos: new THREE.Vector3(-2.0, 6.0, -19.0),target: new THREE.Vector3(-6.5, 4.5, -24.5) },
      rooftop:    { pos: new THREE.Vector3(18, 28, -8),    target: new THREE.Vector3(-2, 16, -6) }
    }
  };

  const STATE = {
    discipline: 'all',
    phase: 'all',         // 'all' | 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'OWNER'
    viewMode: 'orbit',
    isTransitioning: false,
    fpKeys: { w: false, a: false, s: false, d: false, shift: false },
    mouse: new THREE.Vector2(),
    raycaster: new THREE.Raycaster(),
    hotspots: [],
    groups: {
      structure: new THREE.Group(),
      wallsOpaque: [],
      interior: new THREE.Group(),
      ceilings: new THREE.Group(),
      roofDeck: new THREE.Group(),
      hvac: new THREE.Group(),
      electrical: new THREE.Group(),
      plumbing: new THREE.Group(),
      gridLines: new THREE.Group(),
      hotspots: new THREE.Group(),
      // 4D Phase-Specific Sub-Groups for Dynamic Construction Simulation
      phaseP0_Shell: new THREE.Group(),
      phaseP1_Underground: new THREE.Group(),
      phaseP2_FramingMEP: new THREE.Group(),
      phaseP3_Finishes: new THREE.Group(),
      phaseP4_Closeout: new THREE.Group(),
      phaseOwner_Items: new THREE.Group()
    },
    activeZone: null
  };

  // ==========================================================================
  // 2. GOLDSTONE PROJECT PLAN & 90 DESIGN ITEMS DATA (FROM ATTACHED SHEET)
  // ==========================================================================

  const CONSTRUCTION_PHASES = {
    'P0': {
      tag: 'PHASE 0 · WK 0–1',
      code: 'PAYMENT 1: $29,700 (15%)',
      room: 'DUE: OCT 15, 2026 (NTP)',
      title: 'Phase 0: Pre-Construction & Shell Handover',
      icon: 'fa-file-signature',
      dimensions: 'Week 0–1',
      height: '$29,700 (15%)',
      power: '2026-10-15',
      architecture: 'Contract signed and Notice to Proceed (NTP): Building permit BC2026-058 issued by City of Cumming; lease signed in Madras Dreams LLC name; Goldstone license, COI insurance certificate, subcontractor list, and schedule of values received. Existing shell building (perimeter walls, storefront, existing RTU-9, Panel A, 1,500-gal grease interceptor) ready for mobilization.',
      materials: [
        { label: 'P0-1 (Oct 08–14)', val: 'Send revised construction agreement to Sanjeev [t1]' },
        { label: 'P0-2 (Oct 08–14)', val: 'Sign agreement: Madras Dreams LLC & Goldstone GC (no personal guaranty) [t1]' },
        { label: 'P0-3 (Oct 08–14)', val: 'Building permit BC2026-058 issued by City of Cumming / county [g1]' },
        { label: 'P0-4 (Oct 08–14)', val: 'Lease signed in LLC name w/ drive-thru rights (negotiate 12/1 rent date)' },
        { label: 'P0-5 (Oct 08–14)', val: 'Goldstone delivers license, COI insurance, sub list, schedule of values [g9]' },
        { label: 'P0-6 (Oct 08–21)', val: 'Confirm w/ Landlord: RTU-9 scope & interior sprinkler provision [h1]' },
        { label: 'P0-7 (Oct 08–14)', val: 'Remove sinks from Owner equipment order (~$1,650 saved; Goldstone procures) [p9, p10]' }
      ],
      details: [
        'Release Gate P1 ($29,700): Signed agreement; Permit posted on site',
        'Release Gate P1: COI naming Madras Dreams LLC and V N Builders, LLC',
        'Pay only from the Madras Dreams LLC account'
      ],
      electrical: [
        { label: 'g1 — Building & Trade Permits', val: 'CS-1.0 n.2, 14 | Goldstone #1 (Covered)' },
        { label: 'g9 — Contractor Liability COI', val: 'M-0.1 H | Goldstone (Covered)' },
        { label: 'p9 — 3-Comp Sink (KE-03)', val: 'P-5.1 / A-1.2 | Goldstone procures within contract cost' },
        { label: 'p10 — Hand/Dump/Mop Sinks', val: 'HS-1 (eyewash), HS-2, HS-3, JS-1 | Goldstone procures' }
      ],
      hvac: [
        { label: 'h1 — Existing RTU-9 (4-Ton)', val: 'M-1.1 n.1 | Landlord delivers working unit; Goldstone services & rebalances to 360 CFM OA' },
        { label: 'p13 — Existing 3/4" Gas Line', val: 'P-3.1 | Existing gas piping on roof to RTU-9 only' }
      ],
      plumbing: [
        { label: 'O-12 — Sprinkler Provision', val: 'Confirm w/ Landlord who designs/permits; Goldstone does interior integration only' },
        { label: 'O-13 — RTU-9 Landlord Scope', val: 'Confirm Landlord delivers working RTU-9 prior to rebalance' },
        { label: 'O-21 — Lease Rent Start Date', val: 'Draft lease has 12/1/2026 (64 rent days before 02/03/2027 CO) — negotiate!' }
      ],
      equipment: [
        { name: 'Action P0-7: Remove Sinks from Owner Opo Order', detail: 'Goldstone procures 3-comp sink KE-03, hand sinks HS-1/HS-2, dump sink HS-3 & mop sink JS-1 (~$1,650 savings)' },
        { name: 'Action O-15: Confirm Temporary Facilities (g4)', detail: 'Confirm Goldstone includes temp power/lighting, construction toilet & staging in general conditions' }
      ]
    },

    'P1': {
      tag: 'PHASE 1 · WK 1–3',
      code: 'PAYMENT 2: $29,700 (15%)',
      room: 'DUE: NOV 04, 2026 (WK 3)',
      title: 'Phase 1: Mobilization, Underground & Slab',
      icon: 'fa-trowel-bricks',
      dimensions: 'Weeks 1–3',
      height: '$29,700 (15%)',
      power: '2026-11-04',
      architecture: 'Mobilization and underground complete: slab saw-cut and trenched; underground 4" sanitary sewer, 3" grease waste, and vent piping installed; 3 floor drains (FD-1) and 5 stainless floor sinks (FS-1) set and tied into the existing 1,500-gallon grease interceptor; underground plumbing inspection passed; ribbon slab infill poured with 15-mil vapor retarder and special inspection; material submittals delivered.',
      materials: [
        { label: 'P1-1 (Wk 1: Oct 15–21)', val: 'Mobilize: protection, temp power/light, toilet, dumpster [g4, g5]' },
        { label: 'P1-2 (Wk 1: Oct 15–21)', val: 'Layout, saw-cut and trench concrete slab [c2]' },
        { label: 'P1-3 (Wk 1–2: Oct 15–28)', val: 'Underground sanitary, grease waste & vents; FD-1 (3) & FS-1 (5); tie to interceptor [p1–p4]' },
        { label: 'P1-4 (Wk 2: Oct 22–28)', val: 'Underground plumbing inspection by City of Cumming [p1]' },
        { label: 'P1-5 (Wk 3: Oct 29–Nov 04)', val: 'Ribbon slab infill & trench patch; 15-mil vapor retarder; special inspection [c1, c2, g3]' },
        { label: 'P1-6 (Wk 1–3: Oct 15–Nov 04)', val: 'Deliver submittals: fixtures, doors/hardware, tile & countertop options [g6]' }
      ],
      details: [
        'Release Gate P2 ($29,700): Passed underground plumbing inspection',
        'Release Gate P2: Concrete slab special-inspection report (CS-1.0 n.18)',
        'Release Gate P2: Submittals delivered + Interim lien waiver for Payment 1'
      ],
      electrical: [
        { label: 'c1 — Ribbon Slab Infill', val: 'Sheet A-1.0B | 4,000 PSI concrete w/ #4 dowels @ 24" O.C. & 15-mil vapor retarder' },
        { label: 'c2 — Trench & Patch Slab', val: 'Sheet G-0.3 3.3 | Saw-cut, trench & restore slab for underground DWV' },
        { label: 'g3 — Special Inspections', val: 'Sheet CS-1.0 n.18 | Concrete/soil/steel special inspection & summary letter' }
      ],
      hvac: [
        { label: 'g4 — Temp Facilities (Confirm)', val: 'CS-1.0 n.4 / AS-1.0 | Temp power, lighting, toilet, staging (O-15)' },
        { label: 'g5 — Dumpster & Debris', val: 'G-0.3 1.1.10 | Daily debris removal & dumpster (Exhibit A — confirm)' },
        { label: 'g6 — Architect Submittals', val: 'G-0.3 1.1.19 | Millwork, doors, tile, plumbing & light cut sheets (Exhibit A)' }
      ],
      plumbing: [
        { label: 'p1 — Underground DWV & Vents', val: 'Sheet P-1.1 | 4" SS sanitary & 3" GW grease waste sloped 1/4" per ft' },
        { label: 'p2 — Grease Interceptor Tie-In', val: 'Sheet CS-1.0 / P-1.1 | Connect to existing 1,500-gal interceptor (210 gal load)' },
        { label: 'p3 — 3x Floor Drains (FD-1)', val: 'Sheet P-5.1 | Watts FD-100-A 3" epoxy cast-iron drains in Restrooms & Kitchen' },
        { label: 'p4 — 5x Floor Sinks (FS-1)', val: 'Sheet P-5.1 | Watts FS-790 12"×12"×8" 14-ga SS sanitary floor sinks' }
      ],
      equipment: [
        { name: 'Owner Due Wk 2 (Oct 22) — O-1: Drive-Thru Exterior Contract', detail: 'Get 2–3 quotes for exterior conduit, power/data to order screen & menu boards, bollards & detection loop' },
        { name: 'Owner Due Wk 3 (Oct 29) — O-10: Webcam & Speaker Locations', detail: 'Buy webcam/speakers and mark exact plan locations before Wk 4 electrical rough-in' },
        { name: 'Owner Due Wk 3 (Oct 29) — O-11: Wall Blocking List (f6)', detail: 'List TV mounts, shelving & wall-mounted items so Goldstone installs fire-retardant wood blocking in Wk 4' }
      ]
    },

    'P2': {
      tag: 'PHASE 2 · WK 4–8',
      code: 'PAYMENT 3: $59,400 (30%)',
      room: 'DUE: DEC 09, 2026 (WK 8)',
      title: 'Phase 2: Framing, MEP Rough-In & Roof/Window',
      icon: 'fa-helmet-safety',
      dimensions: 'Weeks 4–8',
      height: '$59,400 (30%)',
      power: '2026-12-09',
      architecture: 'Framing and MEP rough-in complete: all interior metal-stud walls (A1–A4, B1–B2, C1–C2) framed with fire-retardant wood blocking; plumbing (1-1/4" water upsize, CW/HW, RO lines, trap primer, WH-1), electrical (60A Panel B, ~30 breakers in Panel A, receptacles, disconnects, low-voltage conduits, sign J-box), and HVAC rough-in done; Owner-supplied 1-ton split AC (DS/HP-1) and roof equipment set; Drive-thru window installed by Landlord; all rough-in and R-13 insulation inspections passed.',
      materials: [
        { label: 'P2-1 (Wk 4–5: Nov 05–18)', val: 'Metal-stud framing: RR, kitchen, storage, hallway, knee walls + blocking [f1–f3, f6]' },
        { label: 'P2-2 (Wk 4–6: Nov 05–25)', val: 'Plumbing rough-in: upsize 1" to 1-1/4" CW, HW, RO lines, trap primer, WH-1 [p5–p8]' },
        { label: 'P2-3 (Wk 4–7: Nov 05–Dec 02)', val: 'Electrical rough-in: Panel B, circuits, boxes, TV/data/camera/speaker conduits, sign J-box [e1–e5, e11, e12]' },
        { label: 'P2-4 (Wk 5–7: Nov 12–Dec 02)', val: 'HVAC: ductwork, EF-1, AC-1 rough-in; set Owner split AC DS/HP-1; rebalance RTU-9 [h1–h6]' },
        { label: 'P2-5 (Wk 5: Nov 12–18)', val: 'Roof penetrations by Landlord roofer + roof-warranty letter [h9]' },
        { label: 'P2-6 (Wk 5–6: Nov 12–25)', val: 'Drive-thru window (Model 275/600): Landlord cuts opening & installs [dt1]' },
        { label: 'P2-7 (Wk 6–7: Nov 19–Dec 02)', val: 'Sprinkler integration inside suite per Landlord provision' },
        { label: 'P2-8 & P2-9 (Wk 7–8: Nov 26–Dec 09)', val: 'Framing, Plumbing, Electrical, Mechanical rough-in + R-13 insulation inspections [f5]' }
      ],
      details: [
        'Release Gate P3 ($59,400): Passed Building, Plumbing, Electrical & Mechanical rough-in inspections',
        'Release Gate P3: Passed R-13 wall batt insulation inspection',
        'Release Gate P3: Interim lien waivers for Payment 2'
      ],
      electrical: [
        { label: 'e1 & e2 — Panel B & Panel A', val: 'Sheet E-3.1 | New 60A Panel B + ~30 new bolt-on breakers (GFCI) in 200A Panel A' },
        { label: 'e3 & e4 — Branch Circuits', val: 'Sheet E-1.1 | NEMA 6-20R (Espresso/Oven), 6-30R (Brewer), 5-20R GFCI & Roof WP outlet' },
        { label: 'e5 — Safety Disconnects', val: 'Sheet E-1.1 | NEMA-3R switches for HP-1, EF-1, AC-1 & 60A NEMA-1 for WH-1' },
        { label: 'e11 & e12 — Sign & LV Conduits', val: 'Sheet E-1.1 n.1, 7 | Exterior sign 20A J-box + (2) 1"C TV conduits & data stubs (Confirm)' }
      ],
      hvac: [
        { label: 'f1, f2, f3, f5, f6 — Framing', val: 'Sheet A-1.0A | 6" & 3-5/8" studs @ 16" O.C., C1/C2 knee walls, R-13 batt, FR wood blocking' },
        { label: 'h2 — Split System DS/HP-1', val: 'Sheet M-5.1 | Carrier 1-Ton 4-Way Cassette (Owner buys O-4; Goldstone installs)' },
        { label: 'h3, h4, h5, h6 — Ducts & Fans', val: 'Sheet M-1.1 | Greenheck EF-1, Powered Aire AC-1, 16"Ø/12"Ø spiral ducts, S-1/S-2/E-1 grilles' },
        { label: 'h9 & dt1 — Roof & DT Window', val: 'Landlord roofer penetrations (O-14) + Landlord installs Owner DT Window Model 275/600 (O-3)' }
      ],
      plumbing: [
        { label: 'p5 — 1-1/4" Copper Water Main', val: 'Sheet P-2.1 n.2 | Upsize existing 1" CW after tee to 1-1/4" Type L copper' },
        { label: 'p6 — 1/2" RO Water Loop', val: 'Sheet P-2.1 n.3, 4 | Route RO piping over Coffee Bar ceiling to Espresso, Brewer, Ice, Kegerator' },
        { label: 'p7 — Trap Primer & TMV-1', val: 'Sheet P-5.1 | PPP PTS-6-500 6-outlet electronic trap primer, water hammer arrestors, ASSE 1017 valve' },
        { label: 'p8 — Water Heater WH-1', val: 'Sheet P-5.1 | A.O. Smith DRE-52 (50-gal, 12.3 kW, 208V) on housekeeping pad' }
      ],
      equipment: [
        { name: 'Owner Due Wk 4 (Nov 05) — O-2, O-3, O-8', detail: 'Order exterior menu boards/headset (O-2); Deliver DT window to Landlord (O-3); Select Countertop CT1 (O-8)' },
        { name: 'Owner Due Wk 5 (Nov 12) — O-4 & O-7', detail: 'Deliver 1-ton Split AC unit DS/HP-1 to site (O-4); Select Wall Tiles WT1 & WC1 from Goldstone options (O-7)' },
        { name: 'Owner Due Wk 6 (Nov 19) — O-5: Designer Lights', detail: 'Order designer light fixtures (LT3 brass pendants, LT8 cove, LT5 sconce)' },
        { name: 'Owner Due Wk 8 (Dec 03) — O-9, O-17, O-18', detail: 'Approve Epoxy Floor color (O-9); Order Bar/Kitchen Equipment B3–B18, K1–K8 (O-17); Exterior Signage contract (O-18)' }
      ]
    },

    'P3': {
      tag: 'PHASE 3 · WK 9–14',
      code: 'PAYMENT 4: $59,400 (30%)',
      room: 'DUE: JAN 20, 2027 (WK 14)',
      title: 'Phase 3: Close-In, Finishes, Millwork & Equipment',
      icon: 'fa-paint-roller',
      dimensions: 'Weeks 9–14',
      height: '$59,400 (30%)',
      power: '2027-01-20',
      architecture: 'Finishes complete: drywall hung and 2-hr demising wall firestopped; ceilings (Tricorn Black C1 open ceiling, C4 washable ACT, C3 restroom ACT, C2 GYP soffit, Owner-supplied Sunken Oak coffee-bean clouds CC) installed; FRP in kitchen/storage; Artisan Oyster (WT1) & Victorian Green (WC1) wall tiles; epoxy floor & cove base; doors/hardware/corner guards; Coffee Bar casework (MD1/MD2), 2" Frost White Quartz top (CT1), walnut slat wall (WC2) & base light; light fixtures & controls; plumbing fixtures (Kohler toilets/lavs, all sinks) & restroom accessories; Owner equipment B1–B18 & K1–K8 set and hooked up; HVAC started and balanced.',
      materials: [
        { label: 'P3-1 (Wk 9–10: Dec 10–23)', val: 'Drywall hang & finish; firestop 2-hour demising wall [f4]' },
        { label: 'P3-2 (Wk 10–11: Dec 17–30)', val: 'Ceilings: C4/C3 ACT, C2 GYP soffit, paint C1 Tricorn Black, install Owner bean clouds CC [cl1–cl5]' },
        { label: 'P3-3 (Wk 10: Dec 17–23)', val: 'White gloss FRP panels (WT2) in Kitchen 03 & Dry Storage 06 [w3, w4]' },
        { label: 'P3-4 & P3-5 (Wk 11–12: Dec 24–Jan 06)', val: 'Wall tile WT1 (Coffee Bar) & WC1 (Restrooms) + Paint PT1/PT2, CMU & epoxy RR paint [w1, w2, w5, w6]' },
        { label: 'P3-6 & P3-7 (Wk 12–13: Dec 31–Jan 13)', val: 'Epoxy floor system & base (B1/B2/B3) + Doors B/C/D, hardware, kickplates, 48" SS corner guards [c3, c4, d1–d3, f7]' },
        { label: 'P3-8 & P3-12 (Wk 12–13: Dec 31–Jan 13)', val: 'Coffee bar casework MD1/MD2, 2" Quartz CT1, cutouts, SS drink ledge, Walnut slat wall WC2 & base light [m1–m3, m5, w7, w8]' },
        { label: 'P3-9 (Wk 12–13: Dec 31–Jan 13)', val: 'Light fixtures (LT1–LT8), exit/emergency lights (EXL1/EXL2/E1/E2), dimmers & timeclock [e6–e10]' },
        { label: 'P3-10 & P3-11 (Wk 13–14: Jan 07–20)', val: 'Plumbing fixtures: Kohler toilets/lavs, all sinks, mixing valves + RR accessories & ADA signs [r1–r4, p9, p10]' },
        { label: 'P3-13 & P3-14 (Wk 13–14: Jan 07–20)', val: 'Owner equipment B1–B18 & K1–K8 set & connected to water/drain/power + HVAC startup & T&B report [o1, o2, p11, p12, h7, h8]' }
      ],
      details: [
        'Release Gate P4 ($59,400): Owner walk-through verification of all finishes & equipment hookups',
        'Release Gate P4: Certified independent HVAC Test & Balance (T&B) report (M-0.3)',
        'Release Gate P4: Interim lien waivers for Payment 3'
      ],
      electrical: [
        { label: 'cl1–cl5 — All Ceiling Systems', val: 'C1 Tricorn Black, C4 Ceramaguard, C3 Calla Health Zone, C2 GYP Soffit, CC Bean Clouds' },
        { label: 'w1–w8 — Walls, Tile & Slats', val: 'PT1/PT2 Paint, WT2 FRP, WT1 Oyster Tile, WC1 Green Tile, WC2 Walnut Slats + Base Light' },
        { label: 'c3, c4 — Epoxy Floor & Base', val: 'Epoxy floor system (Owner color O-9) + Roppe B1/B3 rubber base & Schluter B2 trim' },
        { label: 'e6–e10 — Luminaires & Controls', val: 'LT1/LT2 Troffers, LT3 Brass Pendants, LT4/LT6 Downlights, LT8 Cove LED, EXL/E1, Timeclock' }
      ],
      hvac: [
        { label: 'm1, m2, m3, m5 — Millwork', val: 'Studio Teak MD1/MD2 cabinets, 2" Frost White Quartz CT1, equipment cutouts, SS drink ledge' },
        { label: 'd1, d2, d3, f7 — Doors & Guards', val: 'HM Door B, 2x RR Doors C, Ellison Double-Acting Door D, 48" SS Corner Guards CG1' },
        { label: 'h7 & h8 — Startup & T&B', val: 'Wall thermostats installed + Independent AABC/NEBB Air Balance Report (Confirm)' }
      ],
      plumbing: [
        { label: 'r1, r2, r3, r4 — Restrooms', val: '2x Kohler K-43999 Toilets, 2x K-2032 Lavs, Grab Bars, Mirrors, Dryers, Koala Kare, ADA Signs' },
        { label: 'p9, p10 — Goldstone Sinks', val: '3-Comp Sink KE-03, Hand Sinks HS-1/HS-2, Dump Sink HS-3, Mop Sink JS-1 installed' },
        { label: 'o1, o2, p11, p12 — Hookups', val: 'Final water, indirect floor sink drain (2" air gap) & power connections for B1–B18 & K1–K8 + DS-1 condensate' }
      ],
      equipment: [
        { name: 'Owner Due Wk 10 (Dec 17) — O-6 & O-19', detail: 'Deliver 3 clusters of Coffee-Bean Ceiling Clouds (O-6); Order Internet/Wi-Fi & set up POS (O-19)' },
        { name: 'Owner Due Wk 13 (Jan 07) — O-16 & O-17 Delivery', detail: 'Deliver Bar/Kitchen Equipment B3–B18, K1–K8 + Condiment Bar, Gondola Rack & 3 Trash Cans to site' },
        { name: 'Owner Due Wk 14 (Jan 14) — O-20: Health Dept Permit', detail: 'Schedule Health Department final food-service inspection with Goldstone' }
      ]
    },

    'P4': {
      tag: 'PHASE 4 · WK 15–16',
      code: 'PAYMENT 5: $19,800 (10%)',
      room: 'DUE: FEB 03, 2027 (CO)',
      title: 'Phase 4: Final Inspections, CO & Closeout',
      icon: 'fa-award',
      dimensions: 'Weeks 15–16',
      height: '$19,800 (10%)',
      power: '2027-02-03',
      architecture: 'Substantial Completion and Certificate of Occupancy (CO): potable water system pressure-tested and sterilized; all final inspections passed (Building, Electrical, Plumbing, Mechanical, Fire Marshal, and Health Department); Class A and Class K fire extinguishers mounted; typed circuit directories installed in Panels A and B; punch-list walk completed; O&M manuals, warranties, as-built drawings, final lien waivers, and master keys delivered.',
      materials: [
        { label: 'P4-1 (Wk 15: Jan 21–27)', val: 'Pressure-test and sterilize domestic & RO water systems [p14]' },
        { label: 'P4-2 (Wk 15: Jan 21–27)', val: 'Final inspections: Building, Electrical, Plumbing, Mechanical, Fire Marshal [g2]' },
        { label: 'P4-3 (Wk 15–16: Jan 21–Feb 03)', val: 'Health-Department final food-service inspection [g2]' },
        { label: 'P4-4 (Wk 15: Jan 21–27)', val: 'Mount Class A & Class K fire extinguishers; install typed panel directories [e13, e14]' },
        { label: 'P4-5 (Wk 16: Jan 28–Feb 03)', val: 'Certificate of Occupancy (CO) issued by City of Cumming [g2]' },
        { label: 'P4-6 (Wk 15–16: Jan 21–Feb 03)', val: 'Joint Punch-List walk and completion by Goldstone & Madras Dreams' },
        { label: 'P4-7 & P4-8 (Wk 16: Jan 28–Feb 03)', val: 'Closeout: O&M manuals, 1-yr warranty, as-builts, final lien waivers, rekeying & final clean [g5, g7, g8, d4]' }
      ],
      details: [
        'Release Gate P5 ($19,800): Certificate of Occupancy (CO) in hand',
        'Release Gate P5: Punch list signed off by Madras Dreams LLC',
        'Release Gate P5: O&M manuals, warranties, as-builts, keys & Final Lien Waivers from Goldstone and subs'
      ],
      electrical: [
        { label: 'e13 — Typed Panel Directories', val: 'Sheet E-0.2 2.12 / NEC 408.4 | Typed circuit directories in Panel A & Panel B + J-box labels' },
        { label: 'e14 — Fire Extinguishers', val: 'Sheet G-0.2 | Class A (Dining/Hallway) & Class K (Kitchen wet chemical) mounted ≤26" bottom AFF' }
      ],
      hvac: [
        { label: 'g2 — Certificate of Occupancy', val: 'Sheet CS-1.0 n.2 | Final Building, MEP, Fire Marshal & Health Dept sign-offs' },
        { label: 'g7 & g8 — Closeout & Warranty', val: 'Sheet G-0.3 1.1.5, 1.1.16 | 1-Year workmanship warranty + O&M manuals & red-line as-builts' }
      ],
      plumbing: [
        { label: 'p14 — Water Sterilization', val: 'Sheet P-0.3 3.5 | Pressure-test and sterilize potable water piping per local utility code' },
        { label: 'd4 & g5 — Rekey & Final Clean', val: 'Sheet G-0.3 8.6, 1.1.20 | Rekey all doors (2 keys/door + 2 masters) & commercial vacuum/glass clean' }
      ],
      equipment: [
        { name: 'Final Milestone Payment 5: $19,800 (10%)', detail: 'Released upon CO issuance, completed punch list, closeout binder, and unconditional final lien waivers' }
      ]
    },

    'OWNER': {
      tag: 'OWNER & SEPARATE',
      code: '21 ACTION ITEMS (O-1 TO O-21)',
      room: 'MADRAS DREAMS / LANDLORD / NIC',
      title: 'Owner Purchases, Decisions & Separate Contracts',
      icon: 'fa-clipboard-user',
      dimensions: '21 Action Items',
      height: '17 Confirmations',
      power: 'Wk 0 to Wk 14',
      architecture: 'Items outside Goldstone\'s base supply or requiring Madras Dreams purchase, selection, or separate specialty contracting. In the 3D viewport, all Owner-supplied equipment (B3–B18, K1–K3, K6–K7), Coffee-Bean Ceiling Clouds (CC), Designer Pendants (LT3/LT8), Split AC (DS/HP-1), Drive-Thru Window (Model 275/600), Gondola/Condiment Bar (R, CB), and Exterior Drive-Thru Lane works (dt2–dt5) are highlighted!',
      materials: [
        { label: 'O-1 (Wk 2: Oct 22) [dt2–dt5]', val: 'SEPARATE CONTRACT: Drive-thru exterior conduit, foundations, 6" bollards, loop & lane striping' },
        { label: 'O-2 (Wk 4: Nov 05) [dt2, dt4]', val: 'OWNER PURCHASE: Freestanding menu boards, digital order screen, clearance bar, headset system' },
        { label: 'O-3 (Wk 4: Nov 05) [dt1]', val: 'OWNER PURCHASE / LANDLORD INSTALLS: Drive-thru window Model 275/600 (already purchased)' },
        { label: 'O-4 (Wk 5: Nov 12) [h1, h2]', val: 'OWNER PURCHASE: 1.0-Ton Ductless Split AC (Carrier DS/HP-1); Goldstone installs at no extra cost' },
        { label: 'O-5 (Wk 6: Nov 19) [e7, e8]', val: 'OWNER PURCHASE: Designer light fixtures (LT3 brass dome pendants, LT8 cove, LT5 sconce)' },
        { label: 'O-6 (Wk 10: Dec 17) [cl5]', val: 'OWNER PURCHASE: 3 Clusters of Bean-Shaped Ceiling Clouds (CC); Goldstone installs' },
        { label: 'O-7, O-8, O-9 (Wk 4–8)', val: 'OWNER SELECTIONS: Wall tiles WT1/WC1 (Wk 5), Countertop CT1 (Wk 4), Epoxy floor color (Wk 8)' },
        { label: 'O-16 & O-17 (Wk 8 / Wk 13)', val: 'OWNER PURCHASE: Bar/Kitchen equipment B3–B18, K1–K3, K6–K7 (minus sinks!) + Condiment Bar & Gondola' }
      ],
      details: [
        '17 Goldstone Confirmations (Exhibit A): Dumpster/cleaning (g5), Submittals (g6), 48" Corner guards (f7)',
        'Confirmations: SS Drink ledge (m3), ADA signs (r4), RO piping (p6), Trap primer/TMV-1 (p7), Condensate (p12)',
        'Confirmations: Water sterilization (p14), Thermostats (h7), T&B report (h8), Sign J-box (e11), TV conduits (e12), Panel directories (e13), Fire extinguishers (e14), Slat base light (w8), Rekey (d4)'
      ],
      electrical: [
        { label: 'O-10 (Due Wk 3: Oct 29)', val: 'Buy webcam & integrated speakers; mark plan locations before Wk 4 electrical rough-in [e12]' },
        { label: 'O-18 (Due Wk 8: Dec 03)', val: 'SEPARATE CONTRACT: Exterior building signage, landlord approval & sign permit [e11]' },
        { label: 'O-19 (Due Wk 10: Dec 17)', val: 'Order commercial fiber/internet service early; configure Square POS & Wi-Fi [e12]' }
      ],
      hvac: [
        { label: 'O-12 & O-13 (Due Wk 0)', val: 'LANDLORD: Confirm sprinkler provision & confirm Landlord delivers working RTU-9' },
        { label: 'O-14 (Due Wk 1: Oct 15)', val: 'NOT IN CONTRACT: Confirm who pays Landlord\'s roofer for roof penetrations & warranty letter [h9]' }
      ],
      plumbing: [
        { label: 'P0-7 Savings (~$1,650)', val: 'Remove 3-comp sink, hand sinks, dump sink & mop sink from Owner order (Goldstone procures!)' },
        { label: 'O-21 Lease Rent Risk (64 Days)', val: 'Draft lease starts rent 12/01/2026 vs 02/03/2027 completion — negotiate rent start to opening!' }
      ],
      equipment: [
        { name: 'Out-of-Scope Exterior Drive-Thru Package (dt2, dt3, dt4, dt5)', detail: 'Conduit/power/data to digital order screen & menu boards, 6" bollards, vehicle loop & pavement arrows' },
        { name: 'Owner Equipment Package (o1, o2 — Order Wk 8, Deliver Wk 13)', detail: 'Merrychef B3, Bunn B4/B6, Fetco B5, Square B7, Avantco B8/B16, Mahlkönig B9/B10, La Marzocco B12, Manitowoc B15, Puqpress B17, Beverage-Air B18, True K1/K2, Shelving K3/K6, Work Desk K7' }
      ]
    }
  };

  // ==========================================================================
  // 3. PROCEDURAL TEXTURES (PER FINISH SCHEDULE SHEET A-1.4)
  // ==========================================================================

  const Textures = {
    createSealedConcrete() {
      const c = document.createElement('canvas');
      c.width = 1024; c.height = 1024;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#9e9a93';
      ctx.fillRect(0, 0, 1024, 1024);
      const img = ctx.getImageData(0, 0, 1024, 1024);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (Math.random() - 0.5) * 24;
        d[i] = Math.min(255, Math.max(0, d[i] + n));
        d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
        d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
      }
      ctx.putImageData(img, 0, 0);
      ctx.strokeStyle = 'rgba(55, 52, 48, 0.35)';
      ctx.lineWidth = 3;
      for (let i = 256; i < 1024; i += 256) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1024); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 7);
      return tex;
    },

    createWalnutSlats() {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#111113';
      ctx.fillRect(0, 0, 512, 512);
      const slatW = 20, gapW = 8;
      for (let x = 0; x < 512; x += slatW + gapW) {
        const grad = ctx.createLinearGradient(x, 0, x + slatW, 0);
        grad.addColorStop(0, '#3d2314');
        grad.addColorStop(0.5, '#593620');
        grad.addColorStop(1, '#2b170c');
        ctx.fillStyle = grad;
        ctx.fillRect(x, 0, slatW, 512);
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 1);
      return tex;
    },

    createWoodLaminate(isTeak = false) {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = isTeak ? '#6e4e32' : '#7c5836';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = isTeak ? '#4d341f' : '#573b22';
      ctx.globalAlpha = 0.28;
      for (let y = 0; y < 512; y += 3) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= 512; x += 32) {
          ctx.lineTo(x, y + Math.sin(x * 0.03 + y * 0.05) * 4);
        }
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      return tex;
    },

    createArtisanOysterTile() {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, 0, 512, 512);
      const tw = 30, th = 124, g = 3;
      for (let x = 0; x < 512; x += tw + g) {
        for (let y = 0; y < 512; y += th + g) {
          const shade = 236 + Math.floor((Math.random() - 0.5) * 10);
          ctx.fillStyle = `rgb(${shade}, ${shade - 2}, ${shade - 6})`;
          ctx.fillRect(x, y, tw, th);
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 3);
      return tex;
    },

    createVictorianGreenTile() {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(0, 0, 512, 512);
      const tw = 36, th = 124, g = 3;
      for (let x = 0; x < 512; x += tw + g) {
        for (let y = 0; y < 512; y += th + g) {
          const gr = 52 + Math.floor((Math.random() - 0.5) * 14);
          ctx.fillStyle = `rgb(14, ${gr}, 32)`;
          ctx.fillRect(x, y, tw, th);
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 2);
      return tex;
    },

    createACTGrid() {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 8;
      ctx.strokeRect(0, 0, 512, 512);
      ctx.strokeRect(256, 0, 0, 512);
      ctx.strokeRect(0, 256, 512, 0);
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 6);
      return tex;
    },

    createFrostQuartz() {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 512, Math.random() * 512);
        ctx.bezierCurveTo(Math.random() * 512, Math.random() * 512, Math.random() * 512, Math.random() * 512, Math.random() * 512, Math.random() * 512);
        ctx.stroke();
      }
      return new THREE.CanvasTexture(c);
    },

    createDigitalMenu(boardNum = 1) {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 768;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#111318';
      ctx.fillRect(0, 0, 512, 768);
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 4;
      ctx.strokeRect(14, 14, 484, 740);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(boardNum === 1 ? 'ESPRESSO & COFFEE' : 'COLD BREW & BAKERY', 40, 75);
      ctx.font = '24px "JetBrains Mono", monospace';
      const items = boardNum === 1
        ? [['Espresso', '$3.25'], ['Americano', '$3.75'], ['Cortado', '$4.25'], ['Cappuccino', '$4.50'], ['Caffe Latte', '$4.95'], ['Caramel Macchiato', '$5.45'], ['Mocha', '$5.45'], ['Fetco Batch Brew', '$3.50']]
        : [['Nitro Cold Brew', '$5.25'], ['Iced Vanilla Latte', '$5.25'], ['Bunn Ultra Slushy', '$4.95'], ['Matcha Green Latte', '$5.50'], ['Merrychef Panini', '$7.95'], ['Butter Croissant', '$4.25'], ['Blueberry Muffin', '$3.95'], ['Artisan Bagel', '$3.75']];
      items.forEach(([name, price], i) => {
        const y = 155 + i * 72;
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(name, 40, y);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(price, 385, y);
      });
      return new THREE.CanvasTexture(c);
    },

    createCoffeeArt(seed = 1) {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 512, 512);
      const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 200);
      grad.addColorStop(0, seed % 2 === 0 ? '#d97706' : '#a16207');
      grad.addColorStop(0.6, '#451a03');
      grad.addColorStop(1, '#1c1917');
      ctx.fillStyle = grad;
      ctx.fillRect(48, 48, 416, 416);
      ctx.strokeStyle = '#fef3c7';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(256, 256, 95, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(256, 256, 55, 0, Math.PI); ctx.stroke();
      return new THREE.CanvasTexture(c);
    }
  };

  // ==========================================================================
  // 4. THREE.JS SCENE & SYSTEM INITIALIZATION
  // ==========================================================================

  let scene, camera, renderer, controls;
  let mats = {};
  const canvas = document.getElementById('webgl-canvas');

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d14);
    scene.fog = new THREE.FogExp2(0x090d14, 0.0045);

    camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.2, 250);
    camera.position.copy(CONFIG.cameraPresets.orbit.pos);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputEncoding = THREE.sRGBEncoding;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 2.0;
    controls.maxDistance = 95.0;
    controls.target.copy(CONFIG.cameraPresets.orbit.target);

    Object.values(STATE.groups).forEach(g => {
      if (g instanceof THREE.Group) scene.add(g);
    });

    setupLighting();
    buildMaterialsAndGrids();
    buildSuiteArchitecture();
    buildInteriorAndEquipment();
    buildCeilingsAndBeanClouds();
    buildMechanicalHVAC();
    buildElectricalAndLighting();
    buildPlumbingAndGas();
    buildDriveThruExteriorNIC();
    buildEngineeringHotspots();
    populateProjectPlanModal();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('click', onPointerClick);
    window.addEventListener('keydown', (e) => onFPKey(e, true));
    window.addEventListener('keyup', (e) => onFPKey(e, false));
  }

  function setupLighting() {
    scene.add(new THREE.AmbientLight(0xfffbeb, 0.72));
    const sun = new THREE.DirectionalLight(0xfff7ed, 1.15);
    sun.position.set(-28, 38, 36);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 110;
    sun.shadow.camera.left = -35;
    sun.shadow.camera.right = 35;
    sun.shadow.camera.top = 35;
    sun.shadow.camera.bottom = -35;
    sun.shadow.bias = -0.0005;
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(0xe0f2fe, 0x3b2f2f, 0.35));
  }

  function buildMaterialsAndGrids() {
    mats = {
      concreteFloor: new THREE.MeshStandardMaterial({ map: Textures.createSealedConcrete(), roughness: 0.32, metalness: 0.05 }),
      ribbonSlab: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4, transparent: true, opacity: 0.45 }),
      wallPT1: new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.85 }),
      wallPT2: new THREE.MeshStandardMaterial({ color: 0xebe9e1, roughness: 0.85 }),
      wallFRP: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 }),
      tileOyster: new THREE.MeshStandardMaterial({ map: Textures.createArtisanOysterTile(), roughness: 0.18 }),
      tileGreen: new THREE.MeshStandardMaterial({ map: Textures.createVictorianGreenTile(), roughness: 0.16 }),
      walnutSlat: new THREE.MeshStandardMaterial({ map: Textures.createWalnutSlats(), roughness: 0.45 }),
      sunkenOak: new THREE.MeshStandardMaterial({ map: Textures.createWoodLaminate(false), roughness: 0.4 }),
      studioTeak: new THREE.MeshStandardMaterial({ map: Textures.createWoodLaminate(true), roughness: 0.45 }),
      frostQuartz: new THREE.MeshStandardMaterial({ map: Textures.createFrostQuartz(), roughness: 0.15, metalness: 0.05 }),
      actCeiling: new THREE.MeshStandardMaterial({ map: Textures.createACTGrid(), roughness: 0.9, side: THREE.DoubleSide }),
      tricornBlack: new THREE.MeshStandardMaterial({ color: 0x18191c, roughness: 0.9 }),
      stainless: new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.22, metalness: 0.88 }),
      matteBlack: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.7 }),
      brass: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.88 }),
      oliveChair: new THREE.MeshStandardMaterial({ color: 0x5c6446, roughness: 0.65 }),
      storefrontGlass: new THREE.MeshPhysicalMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.32, roughness: 0.08, metalness: 0.1 })
    };

    // Main Concrete Floor Slab (Phase 0 Existing Shell + Phase 3 Epoxy C3)
    const slab = new THREE.Mesh(new THREE.BoxGeometry(21.2, 0.5, 51.0), mats.concreteFloor);
    slab.position.set(0, -0.25, 0);
    slab.receiveShadow = true;
    STATE.groups.structure.add(slab);

    // Phase 1 Ribbon Slab Trench Infill Highlight (Sheet A-1.0B — c1, c2)
    const ribbonPatch = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.52, 28.0), mats.ribbonSlab);
    ribbonPatch.position.set(-4.5, -0.23, -4.0);
    ribbonPatch.visible = false;
    ribbonPatch.name = 'RibbonSlabPatch';
    STATE.groups.structure.add(ribbonPatch);

    // Exterior Drive-Thru Asphalt & South Sidewalk
    const dtLane = new THREE.Mesh(new THREE.BoxGeometry(13, 0.4, 58), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.92 }));
    dtLane.position.set(-17.0, -0.22, 2);
    dtLane.receiveShadow = true;
    STATE.groups.structure.add(dtLane);

    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(26, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 }));
    sidewalk.position.set(2, -0.2, 29.0);
    STATE.groups.structure.add(sidewalk);

    // Column Grids A–D & 1–2
    const gridMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
    [25.0, 11.3, -6.2, -25.0].forEach(z => {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-15, 0.05, z), new THREE.Vector3(15, 0.05, z)]);
      STATE.groups.gridLines.add(new THREE.Line(geo, gridMat));
    });
    [-10.2, 10.2].forEach(x => {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0.05, -29), new THREE.Vector3(x, 0.05, 29)]);
      STATE.groups.gridLines.add(new THREE.Line(geo, gridMat));
    });
  }

  function addWall(w, h, d, x, y, z, mat, isInteriorFraming = false) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat.clone());
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.isInteriorFraming = isInteriorFraming;
    STATE.groups.structure.add(mesh);
    STATE.groups.wallsOpaque.push(mesh);
    return mesh;
  }

  // ==========================================================================
  // 5. SUITE #9 SHELL & INTERIOR FRAMING (PHASES 0, 2 & 3)
  // ==========================================================================

  function buildSuiteArchitecture() {
    const T = CONFIG.suite.wallThickness;

    // PHASE 0: EXISTING PERIMETER SHELL WALLS & STOREFRONT
    addWall(T, 14.0, 50.0, 10.2, 7.0, 0, mats.wallPT1, false);      // East 2-Hr Demising Wall
    addWall(16.7, 14.0, T, -1.85, 7.0, -25.0, mats.wallPT2, false); // North Rear Wall
    addWall(3.0, 7.0, T, 8.0, 10.5, -25.0, mats.wallPT1, false);
    const exit2Door = new THREE.Mesh(new THREE.BoxGeometry(3.0, 7.0, 0.15), mats.matteBlack);
    exit2Door.position.set(8.0, 3.5, -25.0);
    STATE.groups.structure.add(exit2Door);

    // West Exterior Wall with Drive-Thru Window Opening
    addWall(T, 14.0, 18.8, -10.2, 7.0, -15.6, mats.wallFRP, false);
    addWall(T, 14.0, 8.7, -10.2, 7.0, -1.85, mats.tileOyster, false);
    addWall(T, 14.0, 5.3, -10.2, 7.0, 8.65, mats.tileOyster, false);
    addWall(T, 3.2, 3.5, -10.2, 1.6, 4.25, mats.tileOyster, false);
    addWall(T, 7.0, 3.5, -10.2, 10.5, 4.25, mats.tileOyster, false);
    addWall(T, 14.0, 13.7, -10.2, 7.0, 18.15, mats.wallPT1, false);

    // Drive-Thru Window (dt1 — Owner Purchased O-3, Landlord Installs in Phase 2 P2-6)
    const dtGroup = new THREE.Group();
    dtGroup.userData = { phase: 'P2', isOwner: true };
    const dtFrame = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.8, 3.5), mats.matteBlack);
    dtFrame.position.set(-10.2, 5.1, 4.25);
    dtGroup.add(dtFrame);
    const dtGlass = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.5, 3.2), mats.storefrontGlass);
    dtGlass.position.set(-10.2, 5.1, 4.25);
    dtGroup.add(dtGlass);
    const dtLedge = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 3.8), mats.stainless);
    dtLedge.position.set(-10.2, 3.15, 4.25);
    dtGroup.add(dtLedge);
    STATE.groups.structure.add(dtGroup);

    // South Storefront Glazing (Existing Shell)
    const sfGlass = new THREE.Mesh(new THREE.BoxGeometry(20.4, 10.0, 0.15), mats.storefrontGlass);
    sfGlass.position.set(0, 5.0, 25.0);
    STATE.groups.structure.add(sfGlass);
    addWall(20.4, 4.0, T, 0, 12.0, 25.0, mats.wallPT1, false);
    for (let mx = -10.2; mx <= 10.2; mx += 3.4) {
      const mul = new THREE.Mesh(new THREE.BoxGeometry(0.18, 10.0, 0.35), mats.matteBlack);
      mul.position.set(mx, 5.0, 25.0);
      STATE.groups.structure.add(mul);
    }

    // PHASE 2: INTERIOR METAL-STUD FRAMING PARTITIONS (f1, f2, f3 — Task P2-1)
    addWall(3.5, 10.0, T, -8.45, 5.0, -6.2, mats.tileOyster, true);
    addWall(3.5, 10.0, T, -1.95, 5.0, -6.2, mats.tileOyster, true);
    addWall(3.0, 3.0, T, -5.2, 8.5, -6.2, mats.tileOyster, true);
    addWall(T, 9.0, 12.3, -2.5, 4.5, -12.35, mats.wallFRP, true);
    addWall(8.3, 10.0, T, 1.65, 5.0, -6.2, mats.wallPT1, true);
    addWall(8.3, 9.0, T, 1.65, 4.5, -12.3, mats.wallPT1, true);
    addWall(8.3, 9.0, T, 1.65, 4.5, -18.5, mats.wallPT1, true);
    addWall(T, 9.0, 12.3, 5.8, 4.5, -12.35, mats.wallPT1, true);
    addWall(8.8, 10.0, 0.35, -5.6, 5.0, 11.4, mats.wallPT1, true);

    // PHASE 3: DOORS (d1, d2, d3) & RESTROOM WAINSCOT TILE (w6)
    const doorD = new THREE.Mesh(new THREE.BoxGeometry(2.9, 6.9, 0.15), new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.5 }));
    doorD.position.set(-5.2, 3.45, -6.2);
    STATE.groups.interior.add(doorD);

    [-9.2, -15.4].forEach(dz => {
      const doorC = new THREE.Mesh(new THREE.BoxGeometry(0.22, 6.9, 2.9), mats.studioTeak);
      doorC.position.set(5.8, 3.45, dz);
      STATE.groups.interior.add(doorC);

      const greenTileW = new THREE.Mesh(new THREE.BoxGeometry(8.0, 5.0, 5.8), mats.tileGreen);
      greenTileW.material.side = THREE.BackSide;
      greenTileW.position.set(1.65, 2.5, dz);
      STATE.groups.interior.add(greenTileW);
    });
  }

  // ==========================================================================
  // 6. INTERIOR MILLWORK, FINISHES & OWNER/GOLDSTONE EQUIPMENT
  // ==========================================================================

  function buildInteriorAndEquipment() {
    const gGoldstone = STATE.groups.interior;      // Goldstone Phase 3 Finishes, Millwork & Sinks
    const gOwner = STATE.groups.phaseOwner_Items;  // Owner-Purchased Equipment (o1, o2, m4)

    // GOLDSTONE PHASE 3 MILLWORK: Slat Wall WC2 (w7), Base Light (w8), Casework MD1/MD2 (m1), 2" Quartz CT1 (m2)
    const frontCounterBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.85, 14.0), mats.walnutSlat);
    frontCounterBase.position.set(-1.2, 1.48, 3.8);
    frontCounterBase.castShadow = true;
    gGoldstone.add(frontCounterBase);

    const toeLight = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.12, 14.1), new THREE.MeshBasicMaterial({ color: 0xffd27d }));
    toeLight.position.set(-1.2, 0.06, 3.8);
    gGoldstone.add(toeLight);

    const frontQuartz = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.18, 14.2), mats.frostQuartz);
    frontQuartz.position.set(-1.2, 2.98, 3.8);
    gGoldstone.add(frontQuartz);

    const southWingBase = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.85, 2.2), mats.walnutSlat);
    southWingBase.position.set(-4.0, 1.48, 10.2);
    gGoldstone.add(southWingBase);
    const southWingQuartz = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.18, 2.5), mats.frostQuartz);
    southWingQuartz.position.set(-4.0, 2.98, 10.2);
    gGoldstone.add(southWingQuartz);

    const backCounterBase = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.85, 9.0), mats.studioTeak);
    backCounterBase.position.set(-9.0, 1.48, -1.4);
    gGoldstone.add(backCounterBase);
    const backQuartz = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 9.1), mats.frostQuartz);
    backQuartz.position.set(-9.0, 2.98, -1.4);
    gGoldstone.add(backQuartz);

    // GOLDSTONE-PROCURED SINKS (p9, p10 — Task P0-7 & P3-10): B1 Hand Sink, B2 Dump Sink, K5 3-Comp Sink, K4 Hand Sink, K8 Mop Sink
    [-5.1, -3.9].forEach(sz => {
      const basin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.4, 1.1), mats.stainless);
      basin.position.set(-9.0, 3.02, sz);
      gGoldstone.add(basin);
    });
    const k5Sink = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.0, 6.2), mats.stainless);
    k5Sink.position.set(-3.8, 1.5, -9.8);
    gGoldstone.add(k5Sink);
    const k4Sink = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.5), mats.stainless);
    k4Sink.position.set(-3.4, 2.8, -14.2);
    gGoldstone.add(k4Sink);
    const k8Mop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 1.8), mats.stainless);
    k8Mop.position.set(-3.6, 0.5, -16.8);
    gGoldstone.add(k8Mop);

    // GOLDSTONE RESTROOM FIXTURES & ACCESSORIES (r1, r2, r3 — Task P3-10 & P3-11)
    [-9.2, -15.4].forEach(rz => {
      const wcBowl = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 2.1), mats.wallPT1);
      wcBowl.position.set(-1.1, 0.7, rz - 1.4);
      gGoldstone.add(wcBowl);
      const wcTank = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 1.6), mats.wallPT1);
      wcTank.position.set(-1.8, 2.1, rz - 1.4);
      gGoldstone.add(wcTank);
      const lav = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.8), mats.wallPT1);
      lav.position.set(-1.4, 2.7, rz + 1.4);
      gGoldstone.add(lav);
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.0, 2.0), mats.stainless);
      mirror.position.set(-2.2, 4.8, rz + 1.4);
      gGoldstone.add(mirror);
    });

    // OWNER-SUPPLIED BAR & KITCHEN EQUIPMENT (o1, o2, m4 — Tasks O-16, O-17, P3-13)
    const b3Oven = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.9, 1.4), mats.matteBlack);
    b3Oven.position.set(-9.0, 4.0, -2.5);
    gOwner.add(b3Oven);

    const b4Grinder = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.1, 0.9), mats.matteBlack);
    b4Grinder.position.set(-9.0, 4.1, -1.1);
    gOwner.add(b4Grinder);

    const b5Brewer = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.4, 1.8), mats.stainless);
    b5Brewer.position.set(-9.0, 4.25, 0.4);
    gOwner.add(b5Brewer);

    const b6Slush = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 1.3), mats.matteBlack);
    b6Slush.position.set(-9.0, 4.15, 2.1);
    gOwner.add(b6Slush);

    [[-1.2, -1.2], [-8.8, 3.2]].forEach(([px, pz]) => {
      const posScreen = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.6), mats.matteBlack);
      posScreen.position.set(px, 3.4, pz);
      gOwner.add(posScreen);
    });

    const b8Case = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.8, 2.8), mats.matteBlack);
    b8Case.position.set(-1.2, 2.4, -4.6);
    gOwner.add(b8Case);

    [0.8, 2.0].forEach(gz => {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 1.2, 16), mats.matteBlack);
      body.position.set(-1.2, 3.65, gz);
      gOwner.add(body);
    });

    const b12Body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.65, 2.6), mats.matteBlack);
    b12Body.position.set(-1.2, 3.88, 4.6);
    gOwner.add(b12Body);

    const b15Ice = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.7, 2.0), mats.stainless);
    b15Ice.position.set(-5.2, 1.4, 9.8);
    gOwner.add(b15Ice);

    const b16Keg = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.7, 2.0), mats.matteBlack);
    b16Keg.position.set(-2.8, 1.4, 9.8);
    gOwner.add(b16Keg);

    [7.4, 9.2].forEach((mz, idx) => {
      const mBoard = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.4, 1.5), new THREE.MeshBasicMaterial({ map: Textures.createDigitalMenu(idx + 1) }));
      mBoard.position.set(-9.9, 6.8, mz);
      gOwner.add(mBoard);
    });

    // K1 Cooler, K2 Freezer, K7 Work Desk, K3/K6 Shelving (Owner O-17)
    const k7Desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 3.6), mats.stainless);
    k7Desk.position.set(-8.8, 1.4, -9.0);
    gOwner.add(k7Desk);

    [-12.6, -15.6].forEach(kz => {
      const unit = new THREE.Mesh(new THREE.BoxGeometry(2.5, 6.8, 2.6), mats.stainless);
      unit.position.set(-8.8, 3.4, kz);
      gOwner.add(unit);
    });

    [[-8.8, -18.2], [-4.5, -23.8]].forEach(([sx, sz]) => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.0, 6.2, 4.0), new THREE.MeshStandardMaterial({ color: 0x94a3b8, wireframe: true }));
      shelf.position.set(sx, 3.1, sz);
      gOwner.add(shelf);
    });

    // Gondola Rack R & Condiment Bar CB (Owner O-16 / m4)
    const gondola = new THREE.Mesh(new THREE.BoxGeometry(3.2, 6.2, 1.4), mats.matteBlack);
    gondola.position.set(3.2, 3.1, -5.4);
    gOwner.add(gondola);

    const condBar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.0, 2.6), mats.studioTeak);
    condBar.position.set(-9.1, 1.5, 13.2);
    gOwner.add(condBar);

    // Dining Tables, Chairs & Wall Art
    function createChair(x, z, rotY) {
      const ch = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 1.5), mats.oliveChair);
      seat.position.y = 1.5; ch.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.3, 0.2), mats.oliveChair);
      back.position.set(0, 2.25, -0.65); ch.add(back);
      ch.position.set(x, 0, z); ch.rotation.y = rotY;
      return ch;
    }

    [-1.0, 4.5, 10.0, 15.5].forEach(tz => {
      const tbl = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 2.6), mats.sunkenOak);
      tbl.position.set(7.4, 2.45, tz);
      gOwner.add(tbl);
      const ped = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 0.2), mats.matteBlack);
      ped.position.set(7.4, 1.2, tz);
      gOwner.add(ped);
      gOwner.add(createChair(6.4, tz - 1.6, 0), createChair(8.4, tz - 1.6, 0), createChair(6.4, tz + 1.6, Math.PI), createChair(8.4, tz + 1.6, Math.PI));
    });

    [17.2, 21.6].forEach(lz => {
      const rTbl = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.12, 24), mats.frostQuartz);
      rTbl.position.set(-5.5, 2.2, lz);
      gOwner.add(rTbl);
      for (let a = 0; a < 3; a++) {
        const ang = (a * Math.PI * 2) / 3 + 0.3;
        gOwner.add(createChair(-5.5 + Math.cos(ang) * 2.3, lz + Math.sin(ang) * 2.3, -ang - Math.PI / 2));
      }
    });

    let artIdx = 1;
    [-1.0, 3.2, 8.8, 13.0].forEach(az => {
      [4.6, 7.6].forEach(ay => {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 2.5), new THREE.MeshBasicMaterial({ map: Textures.createCoffeeArt(artIdx++) }));
        frame.position.set(9.92, ay, az);
        gGoldstone.add(frame);
      });
    });
  }

  // ==========================================================================
  // 7. CEILINGS & COFFEE-BEAN CLOUDS (cl1–cl5 · O-6 OWNER CLOUDS)
  // ==========================================================================

  function buildCeilingsAndBeanClouds() {
    const cGroup = STATE.groups.ceilings;
    const rGroup = STATE.groups.roofDeck;

    const cbCeil = new THREE.Mesh(new THREE.BoxGeometry(9.7, 0.2, 17.5), mats.actCeiling);
    cbCeil.position.set(-5.35, 10.0, 2.55);
    cGroup.add(cbCeil);

    const fascia = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.0, 17.5), mats.wallPT1);
    fascia.position.set(-0.5, 11.5, 2.55);
    cGroup.add(fascia);
    const coveLed = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 17.5), new THREE.MeshBasicMaterial({ color: 0xffe4a0 }));
    coveLed.position.set(-0.35, 10.15, 2.55);
    cGroup.add(coveLed);

    const bohCeil = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.2, 18.8), mats.actCeiling);
    bohCeil.position.set(-2.2, 8.0, -15.6);
    cGroup.add(bohCeil);

    // CC: Coffee-Bean Clouds (cl5 — Owner Supplies O-6, Goldstone Installs in Phase 3 P3-2)
    function createCoffeeBeanCloud(x, y, z, rotY) {
      const beanGroup = new THREE.Group();
      const lobeGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.18, 24, 1, false, 0, Math.PI);
      const lobeL = new THREE.Mesh(lobeGeo, mats.sunkenOak);
      lobeL.scale.set(1.0, 1.0, 1.45); lobeL.position.x = -0.08;
      beanGroup.add(lobeL);
      const lobeR = new THREE.Mesh(lobeGeo, mats.sunkenOak);
      lobeR.rotation.y = Math.PI; lobeR.scale.set(1.0, 1.0, 1.45); lobeR.position.x = 0.08;
      beanGroup.add(lobeR);
      beanGroup.position.set(x, y, z);
      beanGroup.rotation.y = rotY;
      return beanGroup;
    }

    [
      [2.5, 11.1, -2.5, 0.4], [6.5, 10.6, -1.8, -0.6], [4.6, 10.9, 1.2, 1.2],
      [2.4, 10.9, 7.0, 0.8],  [6.6, 10.4, 7.8, -0.5], [4.5, 10.0, 10.6, 1.4],
      [-1.8, 10.8, 16.5, 0.6],[2.8, 10.3, 17.2, -0.6],[0.6, 10.4, 20.2, 1.1]
    ].forEach(([bx, by, bz, br]) => {
      cGroup.add(createCoffeeBeanCloud(bx, by, bz, br));
    });

    rGroup.visible = false;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(21.0, 0.3, 50.6), mats.tricornBlack);
    deck.position.set(0, 16.0, 0);
    rGroup.add(deck);
    for (let jz = -22; jz <= 22; jz += 5.5) {
      const joist = new THREE.Mesh(new THREE.BoxGeometry(20.4, 0.8, 0.2), mats.tricornBlack);
      joist.position.set(0, 15.4, jz);
      rGroup.add(joist);
    }
  }

  // ==========================================================================
  // 8. MECHANICAL HVAC, ELECTRICAL & PLUMBING (PHASES 1 & 2)
  // ==========================================================================

  function buildMechanicalHVAC() {
    const hGroup = STATE.groups.hvac;
    const supplyDuctMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.28, metalness: 0.75 });
    const returnDuctMat = new THREE.MeshStandardMaterial({ color: 0x818cf8, roughness: 0.35, metalness: 0.65 });
    const exhaustDuctMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.35, metalness: 0.65 });
    const equipMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.7 });

    const rtu9 = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.6, 7.2), equipMat);
    rtu9.position.set(-1.5, 18.0, 1.5);
    hGroup.add(rtu9);

    const supplyDrop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.8, 1.2), supplyDuctMat);
    supplyDrop.position.set(-1.5, 14.8, 2.5);
    hGroup.add(supplyDrop);

    const spiralMain = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 22.0, 20), supplyDuctMat);
    spiralMain.rotation.x = Math.PI / 2;
    spiralMain.position.set(4.2, 13.6, 7.0);
    hGroup.add(spiralMain);

    const branchCross = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 6.0, 16), supplyDuctMat);
    branchCross.rotation.z = Math.PI / 2;
    branchCross.position.set(1.4, 13.6, 2.5);
    hGroup.add(branchCross);

    [-2.0, 5.0, 12.0, 17.5].forEach(sz => {
      const grille = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 2.6), new THREE.MeshBasicMaterial({ color: 0x00d2ff }));
      grille.position.set(4.2, 13.2, sz);
      hGroup.add(grille);
    });

    [-1.5, 6.5].forEach(cz => {
      const diff = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 2.0), supplyDuctMat);
      diff.position.set(-4.8, 10.05, cz);
      hGroup.add(diff);
      const flex = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 3.5, 12), supplyDuctMat);
      flex.position.set(-4.8, 11.8, cz);
      hGroup.add(flex);
    });

    const raDuct = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.2, 1.2), returnDuctMat);
    raDuct.position.set(-1.5, 14.5, -0.5);
    hGroup.add(raDuct);

    const ds1Cassette = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 2.2), equipMat);
    ds1Cassette.position.set(-6.2, 8.05, -13.5);
    hGroup.add(ds1Cassette);

    const hp1Roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.4, 1.4), equipMat);
    hp1Roof.position.set(-1.5, 17.2, -9.5);
    hGroup.add(hp1Roof);

    const refPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 9.2, 8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    refPipe.position.set(-6.2, 12.6, -13.5);
    hGroup.add(refPipe);

    const ef1Roof = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.9, 2.2, 16), exhaustDuctMat);
    ef1Roof.position.set(1.8, 17.1, -12.3);
    hGroup.add(ef1Roof);

    const efRiser = new THREE.Mesh(new THREE.BoxGeometry(0.7, 9.0, 0.7), exhaustDuctMat);
    efRiser.position.set(1.8, 12.5, -12.3);
    hGroup.add(efRiser);

    const ac1Unit = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.9, 3.6), equipMat);
    ac1Unit.position.set(-9.6, 7.35, 4.25);
    hGroup.add(ac1Unit);
  }

  function buildElectricalAndLighting() {
    const eGroup = STATE.groups.electrical;
    const iGroup = STATE.groups.interior;

    const panelMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3, metalness: 0.8 });
    [-4.2, -2.2].forEach(px => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 0.4), panelMat);
      panel.position.set(px, 4.8, -24.6);
      eGroup.add(panel);
    });

    const conduit208Mat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const mainConduit = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 36.0, 8), conduit208Mat);
    mainConduit.rotation.x = Math.PI / 2;
    mainConduit.position.set(-4.2, 10.6, -6.5);
    eGroup.add(mainConduit);

    [[-1.2, 4.6], [-9.0, 0.4], [-9.0, -2.5], [-8.6, -23.2]].forEach(([dx, dz]) => {
      const drop = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 7.2, 8), conduit208Mat);
      drop.position.set(dx, 6.8, dz);
      eGroup.add(drop);
    });

    // LT3 Designer Brass Dome Pendants (Owner O-5 / Goldstone Installs P3-9)
    [-2.5, 1.0, 4.5, 8.0].forEach(pz => {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.0, 8), mats.matteBlack);
      cord.position.set(-1.2, 9.0, pz);
      iGroup.add(cord);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.brass);
      dome.position.set(-1.2, 8.0, pz);
      iGroup.add(dome);
      const pLight = new THREE.PointLight(0xffd89b, 0.55, 14);
      pLight.position.set(-1.2, 7.8, pz);
      iGroup.add(pLight);
    });

    [[4.5, -1.0], [4.5, 8.5], [0.5, 18.0], [7.4, -1.0], [7.4, 4.5], [7.4, 10.0], [7.4, 15.5], [-5.5, 17.2], [-5.5, 21.6]].forEach(([lx, lz]) => {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 6.0, 8), mats.matteBlack);
      cord.position.set(lx, 13.0, lz);
      iGroup.add(cord);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.65, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.brass);
      dome.position.set(lx, 10.0, lz);
      iGroup.add(dome);
    });

    // Phase 4 Closeout Fire Extinguishers (Class A & Class K — e14 / P4-4)
    const feMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3, metalness: 0.5 });
    [[-3.2, 2.5, -6.5], [-9.6, 2.5, 23.5]].forEach(([fx, fy, fz]) => {
      const fe = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.8, 12), feMat);
      fe.position.set(fx, fy, fz);
      STATE.groups.phaseP4_Closeout.add(fe);
    });
  }

  function buildPlumbingAndGas() {
    const pGroup = STATE.groups.plumbing;
    const p1Underground = STATE.groups.phaseP1_Underground;

    const ssMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 });
    const gwMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
    const cwMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 });
    const hwMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const roMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.3 });
    const fsMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.8 });

    // PHASE 1 UNDERGROUND PLUMBING (p1, p2, p3, p4 — Tasks P1-3 & P1-4)
    const ssMain = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 36.0, 12), ssMat);
    ssMain.rotation.x = Math.PI / 2;
    ssMain.position.set(1.2, -0.8, -6.0);
    p1Underground.add(ssMain);

    const gwMain = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 32.0, 12), gwMat);
    gwMain.rotation.x = Math.PI / 2;
    gwMain.position.set(-5.0, -0.9, -4.0);
    p1Underground.add(gwMain);

    // 5x FS-1 Stainless Floor Sinks & 3x FD-1 Floor Drains
    [[-8.6, -4.5], [-8.6, 0.4], [-1.5, 4.6], [-4.2, 9.8], [-3.8, -9.8]].forEach(([fx, fz]) => {
      const fs = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.65, 1.0), fsMat);
      fs.position.set(fx, -0.1, fz);
      p1Underground.add(fs);
    });

    // PHASE 2 ABOVE-GROUND PLUMBING ROUGH-IN (p5, p6, p7, p8 — Task P2-2)
    const whTank = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 5.2, 24), new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.6 }));
    whTank.position.set(-8.6, 2.9, -23.2);
    pGroup.add(whTank);

    const cwMain = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 34.0, 10), cwMat);
    cwMain.rotation.x = Math.PI / 2;
    cwMain.position.set(-7.5, 8.8, -7.0);
    pGroup.add(cwMain);

    const hwMain = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 30.0, 10), hwMat);
    hwMain.rotation.x = Math.PI / 2;
    hwMain.position.set(-7.0, 8.5, -8.5);
    pGroup.add(hwMain);

    const roUnit = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.8), roMat);
    roUnit.position.set(-9.5, 4.2, -19.8);
    pGroup.add(roUnit);

    const roPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 30.5, 10), roMat);
    roPipe.rotation.x = Math.PI / 2;
    roPipe.position.set(-5.0, 9.4, -4.5);
    pGroup.add(roPipe);
  }

  // Build Exterior Drive-Thru Separate Contract Elements (O-1 & O-2: dt2, dt3, dt4, dt5)
  function buildDriveThruExteriorNIC() {
    const gOwner = STATE.groups.phaseOwner_Items;
    const bollardMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const screenMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3 });

    // 6" Concrete-Filled Yellow Bollards (dt3)
    [[-12.2, 2.2], [-12.2, 6.2], [-15.5, -14.0], [-15.5, -20.0]].forEach(([bx, bz]) => {
      const bol = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 3.8, 12), bollardMat);
      bol.position.set(bx, 1.9, bz);
      gOwner.add(bol);
    });

    // Freestanding Digital Order Screen, Menu Board & Clearance Bar (dt2, O-2)
    const menuPedestal = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6.2, 3.6), screenMat);
    menuPedestal.position.set(-15.5, 3.1, -16.0);
    gOwner.add(menuPedestal);

    const orderBox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4.8, 1.8), screenMat);
    orderBox.position.set(-15.5, 2.4, -22.0);
    gOwner.add(orderBox);
  }

  // ==========================================================================
  // 9. 4D CONSTRUCTION PHASING ENGINE (P0 → P1 → P2 → P3 → P4 → OWNER)
  // ==========================================================================

  function setConstructionPhase(phaseId) {
    STATE.phase = phaseId;

    document.querySelectorAll('.phase-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.phase === phaseId);
    });

    const ribbonPatch = scene.getObjectByName('RibbonSlabPatch');
    const summaryEl = document.getElementById('active-phase-summary');

    if (phaseId === 'all') {
      setWallsXRay(false);
      STATE.groups.structure.visible = true;
      STATE.groups.phaseP1_Underground.visible = true;
      STATE.groups.hvac.visible = true;
      STATE.groups.electrical.visible = true;
      STATE.groups.plumbing.visible = true;
      STATE.groups.interior.visible = true;
      STATE.groups.ceilings.visible = true;
      STATE.groups.phaseOwner_Items.visible = true;
      STATE.groups.phaseP4_Closeout.visible = true;
      STATE.groups.wallsOpaque.forEach(w => w.visible = true);
      if (ribbonPatch) ribbonPatch.visible = false;
      if (summaryEl) summaryEl.textContent = 'Showing: Complete Build (All 90 Design Items · $198,000)';
      showToast('4D View: Complete 16-Week Build Restored', 'fa-layer-group');
      return;
    }

    if (phaseId === 'P0') {
      // Phase 0: Existing Shell Only (Perimeter walls, slab, no interior framing yet)
      setWallsXRay(false);
      STATE.groups.wallsOpaque.forEach(w => { w.visible = !w.userData.isInteriorFraming; });
      STATE.groups.phaseP1_Underground.visible = false;
      STATE.groups.hvac.visible = false;
      STATE.groups.electrical.visible = false;
      STATE.groups.plumbing.visible = false;
      STATE.groups.interior.visible = false;
      STATE.groups.ceilings.visible = false;
      STATE.groups.phaseOwner_Items.visible = false;
      STATE.groups.phaseP4_Closeout.visible = false;
      if (ribbonPatch) ribbonPatch.visible = false;
      if (summaryEl) summaryEl.textContent = 'Phase 0: Pre-Con & Existing Shell | Payment 1: $29,700 (Oct 15)';
    } else if (phaseId === 'P1') {
      // Phase 1: Underground DWV, Floor Sinks FS-1 (5), Floor Drains FD-1 (3), Ribbon Slab Infill
      setWallsXRay(true);
      STATE.groups.wallsOpaque.forEach(w => { w.visible = !w.userData.isInteriorFraming; });
      STATE.groups.phaseP1_Underground.visible = true;
      STATE.groups.hvac.visible = false;
      STATE.groups.electrical.visible = false;
      STATE.groups.plumbing.visible = false;
      STATE.groups.interior.visible = false;
      STATE.groups.ceilings.visible = false;
      STATE.groups.phaseOwner_Items.visible = false;
      STATE.groups.phaseP4_Closeout.visible = false;
      if (ribbonPatch) ribbonPatch.visible = true;
      if (summaryEl) summaryEl.textContent = 'Phase 1 (Wks 1–3): Underground DWV, FS-1/FD-1 & Ribbon Slab | Payment 2: $29,700 (Nov 04)';
    } else if (phaseId === 'P2') {
      // Phase 2: Interior Stud Framing + MEP Rough-In (Ducts, Panels/Conduits, CW/HW/RO Pipes, WH-1, DT Window)
      setWallsXRay(true);
      STATE.groups.wallsOpaque.forEach(w => { w.visible = true; });
      STATE.groups.phaseP1_Underground.visible = true;
      STATE.groups.hvac.visible = true;
      STATE.groups.electrical.visible = true;
      STATE.groups.plumbing.visible = true;
      STATE.groups.interior.visible = false;
      STATE.groups.ceilings.visible = false;
      STATE.groups.phaseOwner_Items.visible = false;
      STATE.groups.phaseP4_Closeout.visible = false;
      if (ribbonPatch) ribbonPatch.visible = false;
      if (summaryEl) summaryEl.textContent = 'Phase 2 (Wks 4–8): Framing & MEP Rough-In | Payment 3: $59,400 (Dec 09)';
    } else if (phaseId === 'P3') {
      // Phase 3: Close-In, Ceilings, Tile, Millwork, Slat Wall, Fixtures & Owner Equipment Set
      setWallsXRay(false);
      STATE.groups.wallsOpaque.forEach(w => { w.visible = true; });
      STATE.groups.phaseP1_Underground.visible = true;
      STATE.groups.hvac.visible = true;
      STATE.groups.electrical.visible = true;
      STATE.groups.plumbing.visible = true;
      STATE.groups.interior.visible = true;
      STATE.groups.ceilings.visible = true;
      STATE.groups.phaseOwner_Items.visible = true;
      STATE.groups.phaseP4_Closeout.visible = false;
      if (ribbonPatch) ribbonPatch.visible = false;
      if (summaryEl) summaryEl.textContent = 'Phase 3 (Wks 9–14): Finishes, Millwork & Equipment Hookup | Payment 4: $59,400 (Jan 20)';
    } else if (phaseId === 'P4') {
      // Phase 4: Inspections, Fire Extinguishers, CO & Closeout
      setWallsXRay(false);
      STATE.groups.wallsOpaque.forEach(w => { w.visible = true; });
      STATE.groups.phaseP1_Underground.visible = true;
      STATE.groups.hvac.visible = true;
      STATE.groups.electrical.visible = true;
      STATE.groups.plumbing.visible = true;
      STATE.groups.interior.visible = true;
      STATE.groups.ceilings.visible = true;
      STATE.groups.phaseOwner_Items.visible = true;
      STATE.groups.phaseP4_Closeout.visible = true;
      if (ribbonPatch) ribbonPatch.visible = false;
      if (summaryEl) summaryEl.textContent = 'Phase 4 (Wks 15–16): Final Inspections, CO & Closeout | Payment 5: $19,800 (Feb 03)';
    } else if (phaseId === 'OWNER') {
      // Isolate Owner Purchases & Separate Contracts in X-Ray Shell
      setWallsXRay(true);
      STATE.groups.wallsOpaque.forEach(w => { w.visible = true; });
      STATE.groups.phaseP1_Underground.visible = false;
      STATE.groups.hvac.visible = false;
      STATE.groups.electrical.visible = false;
      STATE.groups.plumbing.visible = false;
      STATE.groups.interior.visible = false;
      STATE.groups.ceilings.visible = true; // Shows Coffee Bean Clouds
      STATE.groups.phaseOwner_Items.visible = true;
      STATE.groups.phaseP4_Closeout.visible = false;
      if (ribbonPatch) ribbonPatch.visible = false;
      if (summaryEl) summaryEl.textContent = 'Owner & Separate Contracts (O-1 to O-21): Equipment, Bean Clouds, Split AC & Drive-Thru Lane';
    }

    const phaseSpec = CONSTRUCTION_PHASES[phaseId];
    if (phaseSpec) {
      openZoneSpecs(phaseSpec, new THREE.Vector3(0, 4, 2));
      showToast(`4D Phase Loaded: ${phaseSpec.title}`, phaseSpec.icon);
    }
  }

  // ==========================================================================
  // 10. HOTSPOTS & ZONE SPECIFICATIONS
  // ==========================================================================

  const PERMIT_ZONES = {
    'coffee_bar': {
      tag: 'B1–B18 · P3-8/P3-13',
      code: 'SHEETS A-4.3 / A-4.4 / E-3.1',
      room: 'RM 02 — COFFEE BAR (197 SF)',
      title: 'Coffee Bar, Millwork & Espresso Lab',
      icon: 'fa-mug-hot',
      dimensions: '17\'-6" × 10\'-0"',
      height: 'Phase 2 & 3',
      power: '208Y/120V',
      architecture: 'Constructed across Phase 1 (4x FS-1 floor sinks & 3" GW under slab), Phase 2 (knee wall C2 framing, 208V/120V circuits, 1/2" RO water loop), and Phase 3 (Artisan Oyster WT1 wall tile, Studio Teak MD1/MD2 casework, 2" Frost White Quartz CT1, Walnut Slat Wall WC2 w/ base light, Goldstone sinks B1/B2, and Owner equipment B3–B18 hookups).',
      materials: [
        { label: 'Phase 1 (Wks 1–2)', val: '4x FS-1 Floor Sinks & 3" Grease Waste under slab [p1, p4]' },
        { label: 'Phase 2 (Wks 4–7)', val: 'Knee walls C1/C2 framed [f3], RO water [p6], 208V/120V circuits [e3]' },
        { label: 'Phase 3 (Wks 11–13)', val: 'WT1 Oyster Tile [w5], MD1/MD2 Casework & 2" Quartz [m1, m2], Slat Wall [w7]' },
        { label: 'Phase 3 (Wks 13–14)', val: 'Goldstone Sinks B1/B2 [p10] + Owner Equipment B3–B18 hooked up [o1, p11]' }
      ],
      details: [
        'Owner Decision O-7 (Due Wk 5): Select WT1 Wall Tile from Goldstone options',
        'Owner Decision O-8 (Due Wk 4): Select Countertop CT1 quality/color',
        'Owner Purchase O-17 (Order Wk 8, Deliver Wk 13): Equipment B3–B18 (minus sinks!)'
      ],
      electrical: [
        { label: 'B12 La Marzocco Linea PB', val: '208V/1Ø, 4,160W (NEMA 6-20R) — Panel A Ckt 24,26 (Phase 2 e3)' },
        { label: 'B5 Fetco CBS-1242 Brewer', val: '208V/1Ø, 5,200W (NEMA 6-30R) — Panel A Ckt 17,19 (Phase 2 e3)' },
        { label: 'B3 Merrychef Eikon E1S', val: '208V/1Ø, 3,120W (NEMA 6-20R) — Panel A Ckt 25,27 (Phase 2 e3)' }
      ],
      hvac: [
        { label: 'Supply Diffusers (S-1)', val: '2x Titus TMS-AA 24"×24" 3-Cone Diffusers (Phase 2 h6)' }
      ],
      plumbing: [
        { label: 'RO Water Loop (p6)', val: '1/2" RO Overhead Line to B12, B5, B15, B16, B14 (Confirm w/ Goldstone)' },
        { label: 'Sinks B1 & B2 (p10)', val: 'Goldstone procures & installs Elkay B1 & Regency Dump Sink B2' }
      ],
      equipment: [
        { name: 'Goldstone Scope: Casework, Quartz, Slat Wall & Sinks B1/B2', detail: 'Included in $198,000 Contract Sum (Tasks P3-8, P3-10, P3-12)' },
        { name: 'Owner Scope (O-17): Equipment B3–B18', detail: 'Madras Dreams buys & delivers Wk 13; Goldstone sets & connects in Task P3-13' }
      ]
    },
    'drivethru_window': {
      tag: 'DT1 / AC-1 · O-1/O-3',
      code: 'SHEETS AS-1.0 / A-7.0 / M-5.1',
      room: 'DRIVE-THRU WINDOW & LANE',
      title: 'Drive-Thru Window, Air Curtain & Exterior Lane',
      icon: 'fa-car-side',
      dimensions: '3\'-6" × 3\'-10"',
      height: 'Phase 2 & NIC',
      power: '208V / Separate',
      architecture: 'Split responsibility zone: (1) Drive-Thru Window Model 275/600 (dt1) is already purchased by Madras Dreams (O-3) and installed by the Landlord in Weeks 5–6 (P2-6); (2) Air Curtain AC-1 (h4) and SS Drink Ledge (m3) are installed by Goldstone; (3) Exterior drive-thru civil works (conduit/power/data to order screen & menu boards, 6" bollards, vehicle detection loop, lane arrows dt2–dt5) are OUT OF SCOPE and require Separate Contract O-1 (Due Wk 2)!',
      materials: [
        { label: 'dt1 — Drive-Thru Window', val: 'Owner Purchased (O-3); Landlord cuts opening & installs Wk 5–6 (P2-6)' },
        { label: 'h4 — Air Curtain AC-1', val: 'Goldstone supplies & installs Powered Aire EVE-1-42 (P2-4)' },
        { label: 'm3 — SS Drink Ledge', val: 'Goldstone supplies & installs in Wk 12–13 (P3-8 — Confirm Exhibit A)' },
        { label: 'dt2–dt5 — Exterior Lane', val: 'NOT IN CONTRACT: Separate Contract O-1 + Owner Purchase O-2' }
      ],
      details: [
        'CRITICAL O-1 (Due Wk 2: Oct 22): Get 2–3 quotes & award Separate Contract for exterior drive-thru',
        'CRITICAL O-2 (Due Wk 4: Nov 05): Order menu boards, digital order screen, clearance bar & headset',
        'CRITICAL O-3 (Due Wk 4: Nov 05): Deliver DT Window Model 275/600 to Landlord for Wk 5 install'
      ],
      electrical: [
        { label: 'AC-1 Power (Goldstone)', val: '208V/1Ø, 30A Switch — Panel A Ckt 21,23 (Phase 2 e5)' },
        { label: 'Exterior Conduit (NIC)', val: 'dt2: Conduit, power & data to order screen & menu boards (Separate Contract O-1)' }
      ],
      hvac: [
        { label: 'AC-1 Powered Aire EVE-1-42', val: '1,243 CFM high-velocity air curtain interlocked w/ window switch (Covered h4)' }
      ],
      plumbing: [
        { label: 'dt3 — Foundations & Bollards', val: '6" concrete-filled bollards & menu foundations (Separate Contract O-1)' }
      ],
      equipment: [
        { name: 'O-1 Separate Contract (dt2, dt3, dt4, dt5)', detail: 'Exterior trenching, conduit, bollards, detection loop & directional pavement arrows' },
        { name: 'O-2 Owner Purchase: Menu Boards & Headset System', detail: 'Freestanding pre-menu, menu board, digital order screen & headset base station' }
      ]
    },
    'dining_clouds': {
      tag: 'RM 01 / CC · P3-2/O-6',
      code: 'SHEETS A-1.1 / A-1.1A / A-5.0',
      room: 'RM 01 — DINING & CEILING CLOUDS',
      title: 'Dining Hall, Bean Clouds (O-6) & Pendants (O-5)',
      icon: 'fa-cloud',
      dimensions: '435 SF Net',
      height: 'Phase 3 (W10–13)',
      power: '120V Lighting',
      architecture: 'Goldstone paints the 16\'-0" open ceiling Tricorn Black (cl1) in Week 10–11 and installs the 3 clusters of Coffee-Bean Suspended Ceiling Clouds (cl5) which are supplied by Madras Dreams (O-6, Due Wk 10: Dec 17). Standard lights are by Goldstone, while designer fixtures (LT3 brass dome pendants, LT8 cove light, LT5 sconce) are purchased by Madras Dreams (O-5, Due Wk 6: Nov 19) and installed by Goldstone (P3-9).',
      materials: [
        { label: 'cl1 — Open Ceiling Paint', val: 'Goldstone paints SW 6258 Tricorn Black in Wk 10–11 (P3-2)' },
        { label: 'cl5 — Bean Ceiling Clouds', val: 'Owner Supplies (O-6 Due Dec 17); Goldstone installs in Wk 10–11 (P3-2)' },
        { label: 'e7 — Designer Lights (LT3)', val: 'Owner Supplies (O-5 Due Nov 19); Goldstone installs in Wk 12–13 (P3-9)' },
        { label: 'c3 — Epoxy Floor System', val: 'Goldstone installs Wk 12–13 (P3-6); Owner selects color by Wk 8 (O-9)' }
      ],
      details: [
        'Owner Purchase O-5 (Due Wk 6: Nov 19): Order Designer Light Fixtures (LT3, LT8, LT5)',
        'Owner Purchase O-6 (Due Wk 10: Dec 17): Deliver 3 Clusters of Bean Ceiling Clouds (CC)',
        'Owner Purchase O-16 (Due Wk 13: Jan 07): Deliver Condiment Bar, Gondola Rack & 3 Trash Cans'
      ],
      electrical: [
        { label: 'e7 — LT3 Pendants & LT8 Cove', val: 'Owner buys designer fixtures; Goldstone wires & hangs (P3-9)' },
        { label: 'e9 & e10 — Exit & Controls', val: 'Goldstone supplies & installs EXL1/EXL2/E1, dimmers & timeclock' }
      ],
      hvac: [
        { label: 'h5 & h6 — Spiral Ducts & S-2', val: 'Goldstone installs exposed 16"Ø/12"Ø spiral ducts & Titus S-2 grilles in Wk 5–7 (P2-4)' }
      ],
      plumbing: [
        { label: 'c4 — Rubber Wall Base', val: 'Goldstone installs Roppe 100 Black Rubber Base (B1) in Wk 12–13 (P3-6)' }
      ],
      equipment: [
        { name: 'O-6: 3 Clusters of Coffee-Bean Ceiling Clouds (cl5)', detail: '9 total Wilsonart Sunken Oak Y0744 clouds — Owner delivers by Dec 17, 2026' },
        { name: 'O-16: Condiment Bar (CB), Gondola Rack (R) & 3 Trash Cans (T)', detail: 'Owner purchases & delivers by Jan 07, 2027 (Design item m4)' }
      ]
    },
    'kitchen_prep': {
      tag: 'K1–K8 · P2-4/P3-10',
      code: 'SHEETS A-4.2 / A-5.2 / P-5.1',
      room: 'RM 03 — KITCHENETTE (115 SF)',
      title: 'Kitchen, Goldstone Sinks & Split AC (O-4)',
      icon: 'fa-sink',
      dimensions: '18\'-3½" × 7\'-6½"',
      height: 'Phase 2 & 3',
      power: '120V / 208V',
      architecture: 'Key scope update from the 10/03/2026 meeting with Sanjeev: (1) Goldstone procures and installs the 3-Compartment Sink (K5/KE-03), Hand Sink w/ Eyewash (K4/HS-1), and Mop Sink (K8/JS-1) within the $198,000 contract price (saving ~$1,650 — Task P0-7); (2) Madras Dreams supplies the 1.0-Ton Ductless Split AC unit (DS/HP-1, Task O-4 Due Wk 5) and Goldstone installs it at no extra cost (P2-4); (3) Madras Dreams supplies K1 Cooler, K2 Freezer, K6 Shelving & K7 Work Desk (O-17).',
      materials: [
        { label: 'p9 & p10 — Sinks by Goldstone', val: 'Goldstone procures & installs K5 3-Comp, K4 Hand & K8 Mop Sink!' },
        { label: 'h2 — 1-Ton Split AC (DS/HP-1)', val: 'Owner buys unit (O-4 Due Nov 12); Goldstone installs in Wk 5–7 (P2-4)' },
        { label: 'w3 & cl2 — FRP & ACT Ceiling', val: 'Goldstone installs full-height white FRP (Wk 10) & 2\'×2\' washable ACT (Wk 10–11)' },
        { label: 'o2 — Owner Kitchen Equip', val: 'Owner buys True K1 Cooler, K2 Freezer, K7 Desk, K3/K6 Racks (Deliver Wk 13)' }
      ],
      details: [
        'Action P0-7 (Immediate): Remove sinks from Owner Opo equipment order (~$1,650 savings)',
        'Owner Purchase O-4 (Due Wk 5: Nov 12): Deliver Carrier 1-Ton Split AC unit DS/HP-1 to site',
        'Confirm p12: Ductless unit 3/4" PVC condensate routed via air gap to Mop Sink K8'
      ],
      electrical: [
        { label: 'K1 & K2 Dedicated GFCI', val: '120V/20A GFCI circuits in Panel A Ckt 11 & 13 (Goldstone Phase 2 e3)' },
        { label: 'e6 — Kitchen LED Troffers', val: 'Goldstone supplies & installs 3x LT1 & LT2 emergency 2\'×2\' troffers (P3-9)' }
      ],
      hvac: [
        { label: 'h2 — Carrier 45MBCAQ12 / 37MARAQ12', val: '1.0-Ton 4-Way Ceiling Cassette + Rooftop Heat Pump (Owner supplies O-4)' }
      ],
      plumbing: [
        { label: 'p9 — 3-Comp Sink (KE-03)', val: 'Goldstone procures & connects 1/2" CW/HW & 2" indirect drain to FS-1' },
        { label: 'p12 — AC Condensate Line', val: 'Route 3/4" condensate to Mop Sink K8 via air gap (Confirm Exhibit A)' }
      ],
      equipment: [
        { name: 'Goldstone Procured Sinks: K5 (3-Comp), K4 (Hand), K8 (Mop)', detail: 'Included in $198,000 Contract Sum per 10/03/2026 meeting with Sanjeev' },
        { name: 'Owner Purchased Kitchen Package (O-17): K1, K2, K3, K6, K7', detail: 'True T-23 Cooler, True T-23F Freezer, SS Work Desk & Wire Shelving' }
      ]
    },
    'restrooms_ada': {
      tag: 'RM 04 & 05 · P3-4/P3-10',
      code: 'SHEETS A-4.0 / A-4.1 / A-5.2',
      room: 'MEN\'S & WOMEN\'S ADA RESTROOMS',
      title: 'ADA Restrooms (100% Goldstone Scope + Tile Selection)',
      icon: 'fa-restroom',
      dimensions: '51 SF each',
      height: 'Phase 1, 2 & 3',
      power: '120V GFCI',
      architecture: '100% covered within Goldstone\'s $198,000 contract estimation (items f1, cl3, w2, w6, d2, r1, r2, r3, r4, h3). Madras Dreams only selects the wall tile option (O-7 Due Wk 5: Nov 12) and confirms the ADA tactile signage (r4).',
      materials: [
        { label: 'w6 — Restroom Wall Tile (WC1)', val: 'Goldstone installs Wk 11–12 (P3-4); Owner selects tile by Wk 5 (O-7)' },
        { label: 'r1 & r2 — Kohler Fixtures', val: 'Goldstone supplies & installs 2x K-43999 Toilets & 2x K-2032 Lavatories (P3-10)' },
        { label: 'r3 — All Accessories', val: 'Goldstone supplies Grab Bars, Mirrors, Soap/Tissue, 2x Hand Dryers, 2x Koala Kare (P3-11)' },
        { label: 'r4 — ADA Tactile Signs', val: 'Included in Exhibit A (Confirm with Goldstone — P3-11)' }
      ],
      details: [
        'Owner Decision O-7 (Due Wk 5: Nov 12): Select Restroom Wall Tile from Goldstone options',
        'Confirm r4 (Exhibit A): ASI InTouch Grade-2 Braille Men\'s & Women\'s Restroom Signs'
      ],
      electrical: [
        { label: 'Hand Dryers & GFCI', val: 'Goldstone installs 2x Excel TA-SB-120 dryers, GFCI outlets & occupancy sensors' }
      ],
      hvac: [
        { label: 'h3 — Greenheck EF-1 Exhaust', val: 'Goldstone supplies & installs rooftop EF-1 (140 CFM) & Titus E-1 grilles (P2-4)' }
      ],
      plumbing: [
        { label: 'p3 & p7 — Drains & Trap Primer', val: '2x FD-1 floor drains (Phase 1) + Electronic Trap Primer & TMV-1 mixing valve (Phase 2)' }
      ],
      equipment: [
        { name: 'r1, r2, r3 — Complete Restroom Package by Goldstone', detail: 'Confirmed covered within Goldstone $198k estimation on 10/03/2026' }
      ]
    },
    'drystorage_mep': {
      tag: 'PANELS A/B & WH-1 · P2-2/P2-3',
      code: 'SHEETS E-1.1 / E-3.1 / P-2.1',
      room: 'RM 06 — DRY STORAGE & MEP HUB',
      title: 'Panels A/B, Water Heater WH-1 & Low-Voltage',
      icon: 'fa-bolt',
      dimensions: '11\'-0" × 10\'-6"',
      height: 'Phase 2 & 4',
      power: '200A / 60A',
      architecture: 'Primary MEP rough-in hub completed in Phase 2 (Weeks 4–7): Goldstone supplies and installs the new 60A Panelboard B (e1), ~30 new breakers in Existing 200A Panelboard A (e2), the 50-gal A.O. Smith DRE-52 electric water heater WH-1 (p8), 1-1/4" copper main upsizing (p5), and electronic trap primer (p7).',
      materials: [
        { label: 'e1 & e2 — Panels B & A', val: 'Goldstone installs 60A Panel B & ~30 breakers in Panel A in Wk 4–7 (P2-3)' },
        { label: 'p8 — Water Heater WH-1', val: 'Goldstone supplies & installs A.O. Smith DRE-52 (50-gal, 12.3 kW) in Wk 4–6 (P2-2)' },
        { label: 'e12 — Low-Voltage Conduits', val: 'Goldstone installs TV/data/camera/speaker conduits; Owner marks locations by Wk 3 (O-10)' },
        { label: 'e13 & e14 — Phase 4 Closeout', val: 'Typed panel directories & Class A/K fire extinguishers in Wk 15 (P4-4)' }
      ],
      details: [
        'Owner Action O-10 (Due Wk 3: Oct 29): Buy webcam & speakers and give locations before Wk 4 wiring',
        'Owner Action O-19 (Due Wk 10: Dec 17): Order internet service early & configure POS/Wi-Fi'
      ],
      electrical: [
        { label: 'e1–e5 — Full Power Rough-In', val: 'Covered in Goldstone #6 (Weeks 4–7, Milestone P3)' },
        { label: 'e11–e14 — Confirmations', val: 'Sign J-box (e11), TV/data conduits (e12), Typed directories (e13), Extinguishers (e14)' }
      ],
      hvac: [
        { label: 'w4 — Dry Storage FRP', val: 'Goldstone installs white FRP panels in Dry Storage in Wk 10 (P3-3)' }
      ],
      plumbing: [
        { label: 'p5, p6, p7, p8 — Water Hub', val: '1-1/4" CW upsize, 1/2" RO loop, Trap Primer PTS-6-500, TMV-1 & WH-1 Water Heater' }
      ],
      equipment: [
        { name: 'Goldstone MEP Core: Panel B, Breakers, WH-1 & Rough-In', detail: 'Completed in Phase 2 (Weeks 4–8) for Payment Milestone 3 ($59,400)' }
      ]
    },
    'rooftop_hvac': {
      tag: 'RTU-9 / HP-1 / EF-1 · P2-4/P2-5',
      code: 'SHEETS M-1.1 / M-5.1 / G-0.3 7.2',
      room: 'ROOFTOP MECHANICAL & PENETRATIONS',
      title: 'Rooftop Units, Split AC & Roof Penetrations (O-14)',
      icon: 'fa-fan',
      dimensions: 'Full Roof Plan',
      height: 'Phase 0, 2 & 3',
      power: '208V / 1Ø',
      architecture: 'Rooftop mechanical coordination across Landlord, Madras Dreams, and Goldstone: (1) Landlord delivers working Existing 4-Ton RTU-9 (O-13) and Goldstone services & rebalances outside air to 360 CFM (h1); (2) Madras Dreams supplies 1-Ton Split AC unit HP-1 (O-4) and Goldstone mounts & wires it (h2); (3) Goldstone supplies & installs Greenheck Restroom Exhaust Fan EF-1 (h3); (4) Roof penetrations & warranty letter by Landlord\'s approved roofer (h9 / O-14 — confirm who pays!).',
      materials: [
        { label: 'h1 — Existing 4-Ton RTU-9', val: 'Landlord delivers working unit (O-13); Goldstone services & rebalances (P2-4)' },
        { label: 'h2 — 1-Ton Split AC (HP-1)', val: 'Owner supplies unit (O-4 Due Nov 12); Goldstone installs on roof rails (P2-4)' },
        { label: 'h3 — Exhaust Fan (EF-1)', val: 'Goldstone supplies & installs Greenheck CUE-070-VG (P2-4)' },
        { label: 'h9 — Roof Penetrations', val: 'NOT IN CONTRACT (O-14): Landlord\'s roofer cuts/flashes roof & issues warranty letter' }
      ],
      details: [
        'CRITICAL O-13 (Due Wk 0): Confirm w/ Landlord that RTU-9 is in working order',
        'CRITICAL O-14 (Due Wk 1: Oct 15): Confirm who pays Landlord\'s roofer for roof penetrations (h9)',
        'Confirm h7 & h8 (Exhibit A): Thermostats & Independent AABC/NEBB Test-and-Balance Report (Wk 14)'
      ],
      electrical: [
        { label: 'e4 & e5 — Roof Disconnects', val: 'Goldstone installs NEMA-3R disconnects for HP-1, EF-1 & 120V WP/GFCI outlet' }
      ],
      hvac: [
        { label: 'P3-14 (Wk 14: Jan 14–20)', val: 'HVAC startup, thermostat calibration & independent Test-and-Balance report' }
      ],
      plumbing: [
        { label: 'p1 & p13 — Vents & Gas', val: '3" VTR sanitary vent stacks through roof + existing 3/4" natural gas to RTU-9' }
      ],
      equipment: [
        { name: 'Action O-14: Roof Penetrations & Warranty Letter (G-0.3 7.2)', detail: 'Must be performed by Landlord\'s approved roofing subcontractor prior to Wk 5 HVAC rough-in' }
      ]
    }
  };

  function buildEngineeringHotspots() {
    const hGroup = STATE.groups.hotspots;
    const nodes = [
      { id: 'coffee_bar',       pos: new THREE.Vector3(-1.2, 5.2, 3.5),   color: 0xf59e0b },
      { id: 'drivethru_window', pos: new THREE.Vector3(-9.5, 5.2, 4.25),  color: 0x38bdf8 },
      { id: 'dining_clouds',    pos: new THREE.Vector3(4.5, 6.0, 8.5),    color: 0x10b981 },
      { id: 'kitchen_prep',     pos: new THREE.Vector3(-6.0, 5.0, -11.5), color: 0x06b6d4 },
      { id: 'restrooms_ada',    pos: new THREE.Vector3(1.8, 5.0, -12.3),  color: 0x34d399 },
      { id: 'drystorage_mep',   pos: new THREE.Vector3(-5.5, 5.2, -22.5), color: 0xeab308 },
      { id: 'rooftop_hvac',     pos: new THREE.Vector3(-1.5, 19.5, 1.5),  color: 0x60a5fa }
    ];

    nodes.forEach(n => {
      const spec = PERMIT_ZONES[n.id];
      const node = new THREE.Group();
      node.position.copy(n.pos);
      node.userData = { id: n.id, spec };

      const core = new THREE.Mesh(new THREE.SphereGeometry(0.48, 20, 20), new THREE.MeshBasicMaterial({ color: n.color, transparent: true, opacity: 0.9 }));
      node.add(core);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.78, 16, 16), new THREE.MeshBasicMaterial({ color: n.color, wireframe: true, transparent: true, opacity: 0.45 }));
      node.add(halo);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.6, 1.15, 24), new THREE.MeshBasicMaterial({ color: n.color, side: THREE.DoubleSide, transparent: true, opacity: 0.65 }));
      ring.rotation.x = Math.PI / 2;
      node.add(ring);

      hGroup.add(node);
      STATE.hotspots.push({ group: node, core, halo, ring, spec, id: n.id });
    });
  }

  // ==========================================================================
  // 11. POPULATE FULL 16-WEEK PROJECT PLAN MODAL
  // ==========================================================================

  function populateProjectPlanModal() {
    const container = document.getElementById('phase-matrix-content');
    if (!container) return;

    const phasesOrder = ['P0', 'P1', 'P2', 'P3', 'P4', 'OWNER'];
    container.innerHTML = phasesOrder.map(pid => {
      const p = CONSTRUCTION_PHASES[pid];
      return `
        <div class="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div class="flex items-center gap-2.5">
              <span class="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">${p.tag}</span>
              <h4 class="text-sm font-bold text-white">${p.title}</h4>
            </div>
            <div class="flex items-center gap-3 font-mono text-xs">
              <span class="text-emerald-400 font-bold">${p.code}</span>
              <span class="text-gray-500">|</span>
              <span class="text-cyan-300">${p.room}</span>
            </div>
          </div>
          <p class="text-gray-300 text-xs leading-relaxed">${p.architecture}</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            ${p.materials.map(m => `
              <div class="bg-white/5 px-3 py-2 rounded-xl border border-white/5 flex justify-between gap-2 font-mono text-[11px]">
                <span class="text-amber-300 font-semibold shrink-0">${m.label}:</span>
                <span class="text-gray-200 text-right">${m.val}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // 12. DISCIPLINE MODES, CAMERA TRANSITIONS & UI EVENTS
  // ==========================================================================

  function setDisciplineMode(mode) {
    STATE.discipline = mode;
    document.querySelectorAll('.discipline-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.discipline === mode);
    });

    const isXray = (mode === 'mechanical' || mode === 'electrical' || mode === 'plumbing');
    setWallsXRay(isXray);
    document.getElementById('chk-xray').checked = isXray;

    if (mode === 'all') {
      STATE.groups.interior.visible = true;
      STATE.groups.phaseOwner_Items.visible = true;
      STATE.groups.ceilings.visible = true;
      STATE.groups.hvac.visible = true;
      STATE.groups.electrical.visible = true;
      STATE.groups.plumbing.visible = true;
      STATE.groups.phaseP1_Underground.visible = true;
      showToast('Composite BIM Mode Active', 'fa-layer-group');
    } else if (mode === 'interior') {
      STATE.groups.interior.visible = true;
      STATE.groups.phaseOwner_Items.visible = true;
      STATE.groups.ceilings.visible = true;
      STATE.groups.hvac.visible = false;
      STATE.groups.electrical.visible = false;
      STATE.groups.plumbing.visible = false;
      STATE.groups.phaseP1_Underground.visible = false;
      showToast('Interior & Finishes Mode Active', 'fa-couch');
    } else if (mode === 'mechanical') {
      STATE.groups.interior.visible = true;
      STATE.groups.ceilings.visible = false;
      STATE.groups.hvac.visible = true;
      STATE.groups.electrical.visible = false;
      STATE.groups.plumbing.visible = false;
      STATE.groups.phaseP1_Underground.visible = false;
      openZoneSpecs(PERMIT_ZONES.rooftop_hvac, new THREE.Vector3(-1.5, 16, 1.5));
      showToast('Mechanical HVAC Mode Active', 'fa-fan');
    } else if (mode === 'electrical') {
      STATE.groups.interior.visible = true;
      STATE.groups.ceilings.visible = false;
      STATE.groups.hvac.visible = false;
      STATE.groups.electrical.visible = true;
      STATE.groups.plumbing.visible = false;
      STATE.groups.phaseP1_Underground.visible = false;
      openZoneSpecs(PERMIT_ZONES.drystorage_mep, new THREE.Vector3(-4.0, 5, -24));
      showToast('Electrical Power & Lighting Mode Active', 'fa-bolt');
    } else if (mode === 'plumbing') {
      STATE.groups.interior.visible = false;
      STATE.groups.phaseOwner_Items.visible = false;
      STATE.groups.ceilings.visible = false;
      STATE.groups.hvac.visible = false;
      STATE.groups.electrical.visible = false;
      STATE.groups.plumbing.visible = true;
      STATE.groups.phaseP1_Underground.visible = true;
      openZoneSpecs(PERMIT_ZONES.coffee_bar, new THREE.Vector3(-4.0, 2, 2));
      showToast('Plumbing (DWV, CW/HW & RO) Mode Active', 'fa-faucet-drip');
    }
  }

  function setWallsXRay(enabled) {
    STATE.groups.wallsOpaque.forEach(mesh => {
      mesh.material.transparent = enabled;
      mesh.material.opacity = enabled ? 0.22 : 1.0;
      mesh.material.needsUpdate = true;
    });
  }

  function transitionCamera(targetPos, targetLookAt, duration = 1100, onComplete = null) {
    STATE.isTransitioning = true;
    controls.enabled = false;
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1.0);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      camera.position.lerpVectors(startPos, targetPos, ease);
      controls.target.lerpVectors(startTarget, targetLookAt, ease);
      camera.lookAt(controls.target);
      if (t < 1.0) {
        requestAnimationFrame(step);
      } else {
        controls.enabled = true;
        STATE.isTransitioning = false;
        if (onComplete) onComplete();
      }
    }
    requestAnimationFrame(step);
  }

  function setViewMode(mode) {
    STATE.viewMode = mode;
    document.querySelectorAll('.view-mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${mode}`)?.classList.add('active');

    const bpOverlay = document.getElementById('blueprint-grid-overlay');
    const fpHud = document.getElementById('firstperson-hud');

    if (mode === 'blueprint') {
      bpOverlay.classList.remove('opacity-0');
      fpHud.classList.add('hidden');
      STATE.groups.ceilings.visible = false;
      transitionCamera(CONFIG.cameraPresets.blueprint.pos, CONFIG.cameraPresets.blueprint.target, 1200);
    } else if (mode === 'firstperson') {
      bpOverlay.classList.add('opacity-0');
      fpHud.classList.remove('hidden');
      STATE.groups.ceilings.visible = true;
      transitionCamera(CONFIG.cameraPresets.firstPerson.pos, CONFIG.cameraPresets.firstPerson.target, 1200);
    } else if (mode === 'drivethru') {
      bpOverlay.classList.add('opacity-0');
      fpHud.classList.add('hidden');
      transitionCamera(CONFIG.cameraPresets.drivethru.pos, CONFIG.cameraPresets.drivethru.target, 1200);
    } else {
      bpOverlay.classList.add('opacity-0');
      fpHud.classList.add('hidden');
      transitionCamera(CONFIG.cameraPresets.orbit.pos, CONFIG.cameraPresets.orbit.target, 1200);
    }
  }

  function onFPKey(e, isDown) {
    const k = e.key.toLowerCase();
    if (k === 'w' || k === 'arrowup') STATE.fpKeys.w = isDown;
    if (k === 's' || k === 'arrowdown') STATE.fpKeys.s = isDown;
    if (k === 'a' || k === 'arrowleft') STATE.fpKeys.a = isDown;
    if (k === 'd' || k === 'arrowright') STATE.fpKeys.d = isDown;
    if (k === 'shift') STATE.fpKeys.shift = isDown;
  }

  function updateFirstPerson(delta) {
    if (STATE.viewMode !== 'firstperson' || STATE.isTransitioning) return;
    const speed = (STATE.fpKeys.shift ? 14.0 : 8.0) * delta;
    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd);
    fwd.y = 0; fwd.normalize();
    const right = new THREE.Vector3().crossVectors(fwd, camera.up).normalize();
    const move = new THREE.Vector3();
    if (STATE.fpKeys.w) move.add(fwd);
    if (STATE.fpKeys.s) move.sub(fwd);
    if (STATE.fpKeys.d) move.add(right);
    if (STATE.fpKeys.a) move.sub(right);
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed);
      camera.position.add(move);
      camera.position.y = 5.5;
      camera.position.x = Math.max(-9.4, Math.min(9.4, camera.position.x));
      camera.position.z = Math.max(-24.0, Math.min(28.0, camera.position.z));
      controls.target.copy(camera.position).add(fwd);
    }
  }

  let hoveredHotspot = null;

  function onPointerMove(e) {
    STATE.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    STATE.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    if (!STATE.groups.hotspots.visible || STATE.isTransitioning) return;

    STATE.raycaster.setFromCamera(STATE.mouse, camera);
    const meshes = [];
    STATE.hotspots.forEach(h => meshes.push(h.core, h.halo));
    const hits = STATE.raycaster.intersectObjects(meshes);
    const tooltip = document.getElementById('hotspot-hover-tooltip');

    if (hits.length > 0) {
      document.body.style.cursor = 'pointer';
      const node = hits[0].object.parent;
      hoveredHotspot = node;
      if (tooltip && node.userData.spec) {
        document.getElementById('tooltip-tag').textContent = `[${node.userData.spec.tag}]`;
        document.getElementById('tooltip-text').textContent = node.userData.spec.title;
        tooltip.style.left = `${e.clientX}px`;
        tooltip.style.top = `${e.clientY - 14}px`;
        tooltip.classList.remove('opacity-0');
      }
    } else {
      document.body.style.cursor = 'default';
      hoveredHotspot = null;
      tooltip?.classList.add('opacity-0');
    }
  }

  function onPointerClick() {
    if (hoveredHotspot && hoveredHotspot.userData.spec) {
      openZoneSpecs(hoveredHotspot.userData.spec, hoveredHotspot.position);
    }
  }

  function openZoneSpecs(spec, worldPos) {
    STATE.activeZone = spec;
    const sidebar = document.getElementById('specs-sidebar');
    if (!sidebar) return;

    document.getElementById('sidebar-zone-code').textContent = spec.code;
    document.getElementById('sidebar-room-tag').textContent = spec.room;
    document.getElementById('sidebar-zone-title').textContent = spec.title;
    document.getElementById('stat-dimensions').textContent = spec.dimensions;
    document.getElementById('stat-height').textContent = spec.height;
    document.getElementById('stat-power').textContent = spec.power;
    document.getElementById('sidebar-icon-box').innerHTML = `<i class="fa-solid ${spec.icon}"></i>`;
    document.getElementById('desc-architecture').textContent = spec.architecture;

    document.getElementById('materials-list').innerHTML = spec.materials.map(m => `
      <div class="glass-panel p-2 rounded-lg border border-white/5 flex justify-between gap-2">
        <span class="text-amber-300 font-mono font-semibold shrink-0">${m.label}:</span>
        <span class="text-white font-medium text-right">${m.val}</span>
      </div>
    `).join('');

    document.getElementById('details-list').innerHTML = spec.details.map(d => `
      <div class="glass-panel p-2 rounded-lg border border-cyan-500/20 text-cyan-300 flex items-center gap-2">
        <i class="fa-solid fa-circle-check text-xs"></i>
        <span>${d}</span>
      </div>
    `).join('');

    document.getElementById('mep-electrical').innerHTML = spec.electrical.map(e => `
      <div class="glass-panel p-2 rounded-lg border border-white/5 flex justify-between gap-2">
        <span class="text-yellow-400 font-semibold shrink-0">${e.label}:</span>
        <span class="text-gray-200 text-right">${e.val}</span>
      </div>
    `).join('');

    document.getElementById('mep-hvac').innerHTML = spec.hvac.map(h => `
      <div class="glass-panel p-2 rounded-lg border border-white/5 flex justify-between gap-2">
        <span class="text-cyan-400 font-semibold shrink-0">${h.label}:</span>
        <span class="text-gray-200 text-right">${h.val}</span>
      </div>
    `).join('');

    document.getElementById('mep-plumbing').innerHTML = spec.plumbing.map(p => `
      <div class="glass-panel p-2 rounded-lg border border-white/5 flex justify-between gap-2">
        <span class="text-blue-400 font-semibold shrink-0">${p.label}:</span>
        <span class="text-gray-200 text-right">${p.val}</span>
      </div>
    `).join('');

    document.getElementById('equipment-list').innerHTML = spec.equipment.map(eq => `
      <div class="glass-panel p-2.5 rounded-xl border border-white/10">
        <div class="font-bold text-amber-300 text-xs">${eq.name}</div>
        <div class="text-gray-300 text-[11px] mt-0.5">${eq.detail}</div>
      </div>
    `).join('');

    sidebar.classList.remove('translate-x-full');

    const flyBtn = document.getElementById('btn-fly-to-zone');
    if (flyBtn && worldPos) {
      flyBtn.onclick = () => {
        const camOffset = worldPos.clone().add(new THREE.Vector3(8, 6, 10));
        transitionCamera(camOffset, worldPos, 1000);
      };
    }
  }

  function updateMiniMap() {
    const mc = document.getElementById('minimap-canvas');
    if (!mc) return;
    const ctx = mc.getContext('2d');
    const w = mc.width, h = mc.height;
    ctx.fillStyle = '#070b12';
    ctx.fillRect(0, 0, w, h);

    const toX = (wx) => 100 + (wx / 20.4) * 90;
    const toY = (wz) => 88 + (wz / 50.0) * 148;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(toX(-10.2), toY(-25.0), toX(10.2) - toX(-10.2), toY(25.0) - toY(-25.0));

    ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
    ctx.fillRect(toX(-10.2), toY(-6.2), toX(-0.8) - toX(-10.2), toY(11.3) - toY(-6.2));
    ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
    ctx.fillRect(toX(-10.2), toY(-18.5), toX(-2.5) - toX(-10.2), toY(-6.2) - toY(-18.5));
    ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
    ctx.fillRect(toX(-2.5), toY(-18.5), toX(5.8) - toX(-2.5), toY(-6.2) - toY(-18.5));
    ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
    ctx.fillRect(toX(-10.2), toY(-25.0), toX(2.0) - toX(-10.2), toY(-18.5) - toY(-25.0));

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px "JetBrains Mono", monospace';
    ctx.fillText('06 DRY STRG', toX(-9.5), toY(-21.0));
    ctx.fillText('03 KITCH', toX(-9.5), toY(-12.0));
    ctx.fillText('04/05 RR', toX(-1.5), toY(-12.0));
    ctx.fillText('02 BAR', toX(-8.5), toY(3.0));
    ctx.fillText('01 DINING', toX(1.5), toY(12.0));

    const cx = toX(camera.position.x);
    const cy = toY(camera.position.z);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const ang = Math.atan2(dir.z, dir.x);

    ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 22, ang - 0.45, ang + 0.45); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
  }

  function showToast(msg, icon = 'fa-circle-check') {
    const t = document.getElementById('toast-notification');
    if (!t) return;
    document.getElementById('toast-message').textContent = msg;
    document.getElementById('toast-icon').className = `fa-solid ${icon} text-emerald-400`;
    t.classList.remove('opacity-0', '-translate-y-4');
    t.classList.add('opacity-100', 'translate-y-0');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.classList.remove('opacity-100', 'translate-y-0');
      t.classList.add('opacity-0', '-translate-y-4');
    }, 3000);
  }

  function bindUI() {
    document.querySelectorAll('.discipline-btn').forEach(btn => {
      btn.addEventListener('click', () => setDisciplineMode(btn.dataset.discipline));
    });

    // 4D Construction Phase Buttons
    document.querySelectorAll('.phase-btn').forEach(btn => {
      btn.addEventListener('click', () => setConstructionPhase(btn.dataset.phase));
    });

    document.getElementById('view-orbit')?.addEventListener('click', () => setViewMode('orbit'));
    document.getElementById('view-blueprint')?.addEventListener('click', () => setViewMode('blueprint'));
    document.getElementById('view-firstperson')?.addEventListener('click', () => setViewMode('firstperson'));
    document.getElementById('view-drivethru')?.addEventListener('click', () => setViewMode('drivethru'));
    document.getElementById('btn-reset-cam')?.addEventListener('click', () => setViewMode('orbit'));

    document.getElementById('chk-ceiling')?.addEventListener('change', (e) => { STATE.groups.ceilings.visible = e.target.checked; });
    document.getElementById('chk-roof')?.addEventListener('change', (e) => { STATE.groups.roofDeck.visible = e.target.checked; });
    document.getElementById('chk-xray')?.addEventListener('change', (e) => { setWallsXRay(e.target.checked); });
    document.getElementById('chk-hvac')?.addEventListener('change', (e) => { STATE.groups.hvac.visible = e.target.checked; });
    document.getElementById('chk-elec')?.addEventListener('change', (e) => { STATE.groups.electrical.visible = e.target.checked; });
    document.getElementById('chk-plumb')?.addEventListener('change', (e) => {
      STATE.groups.plumbing.visible = e.target.checked;
      STATE.groups.phaseP1_Underground.visible = e.target.checked;
    });
    document.getElementById('chk-hotspots')?.addEventListener('change', (e) => { STATE.groups.hotspots.visible = e.target.checked; });

    document.querySelectorAll('.cam-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = CONFIG.cameraPresets[btn.dataset.cam];
        if (p) {
          transitionCamera(p.pos, p.target, 1100);
          showToast(`Camera Aligned: ${btn.textContent.trim()}`, 'fa-camera');
        }
      });
    });

    document.getElementById('btn-close-sidebar')?.addEventListener('click', () => {
      document.getElementById('specs-sidebar')?.classList.add('translate-x-full');
    });

    document.querySelectorAll('.spec-tab-btn').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.spec-tab-btn').forEach(t => {
          t.classList.remove('active');
          t.classList.replace('text-amber-400', 'text-gray-400');
          t.classList.replace('border-amber-400', 'border-transparent');
        });
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
        e.currentTarget.classList.add('active');
        e.currentTarget.classList.replace('text-gray-400', 'text-amber-400');
        e.currentTarget.classList.replace('border-transparent', 'border-amber-400');
        document.getElementById(e.currentTarget.dataset.tab)?.classList.remove('hidden');
      });
    });

    // Modals
    const schedModal = document.getElementById('schedules-modal');
    document.getElementById('btn-schedules-modal')?.addEventListener('click', () => {
      schedModal.classList.remove('hidden'); schedModal.classList.add('flex');
    });
    document.getElementById('btn-close-modal')?.addEventListener('click', () => {
      schedModal.classList.add('hidden'); schedModal.classList.remove('flex');
    });

    const phaseModal = document.getElementById('phase-matrix-modal');
    document.getElementById('btn-phase-matrix-modal')?.addEventListener('click', () => {
      phaseModal.classList.remove('hidden'); phaseModal.classList.add('flex');
    });
    document.getElementById('btn-close-phase-modal')?.addEventListener('click', () => {
      phaseModal.classList.add('hidden'); phaseModal.classList.remove('flex');
    });

    document.getElementById('minimap-canvas')?.addEventListener('click', (e) => {
      const rect = e.target.getBoundingClientRect();
      const wx = (((e.clientX - rect.left) - 100) / 90) * 20.4;
      const wz = (((e.clientY - rect.top) - 88) / 148) * 50.0;
      transitionCamera(new THREE.Vector3(wx, 5.5, wz + 6), new THREE.Vector3(wx, 4.5, wz - 4), 900);
    });

    document.getElementById('btn-export-spec')?.addEventListener('click', () => {
      if (!STATE.activeZone) return;
      const blob = new Blob([JSON.stringify(STATE.activeZone, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Suite9_${STATE.activeZone.tag.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      a.click();
    });
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    if (controls.enabled) controls.update();
    updateFirstPerson(delta);

    STATE.hotspots.forEach((h, i) => {
      const t = elapsed * 2.4 + i;
      h.halo.rotation.y = elapsed * 0.8;
      const s = 1.0 + (Math.sin(t) + 1) * 0.35;
      h.ring.scale.set(s, s, 1);
      h.ring.material.opacity = Math.max(0.1, 0.7 - (s - 1) * 0.6);
    });

    const coordEl = document.getElementById('camera-coords-display');
    if (coordEl) {
      coordEl.textContent = `X: ${camera.position.x.toFixed(1)}' Y: ${camera.position.y.toFixed(1)}' Z: ${camera.position.z.toFixed(1)}'`;
    }

    updateMiniMap();
    renderer.render(scene, camera);
  }

  window.addEventListener('DOMContentLoaded', () => {
    initThree();
    bindUI();
    animate();
  });

})();
