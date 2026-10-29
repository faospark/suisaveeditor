// Guardian Deity Statue & Blueprints Editor (game_data.parts_no)
// Forensic Reverse-Engineered Implementation for Suikoden II HD Remaster & Classic Saves

const GUARDIAN_STATUE_REWARDS = ["Dragon Censer [Item #28]", "Fire Orb [Rune #1]", "None (Dud - 0 Reward)", "6x Medicine [Item #1]", "Flame Helmet [Equipment #11]", "Fury Orb [Rune #87]", "9,000 Potch", "Stone of Speed [Item #26]", "Headgear [Equipment #7]", "Balance Orb [Rune #77]", "30,000 Potch", "Stone of Power [Item #21]", "Leather Hat [Equipment #2]", "Double-Edged Orb [Rune #82]", "8,000 Potch", "9x Protect Mist [Item #10]", "Bandanna [Equipment #1]", "Rage Orb [Rune #2]", "15,000 Potch", "9x Flaming Arrows [Item #6]", "Silver Hat [Equipment #8]", "Skunk Orb [Rune #79]", "22,000 Potch", "9x Clay Guardian [Item #15]", "Circlet [Equipment #5]", "Firefly Orb [Rune #80]", "32,000 Potch", "9x Thunder Runner [Item #19]", "Silver Hat [Equipment #8]", "Fire Sealing Orb [Rune #78]", "17,000 Potch", "9x Raw Tomato [Dish #9]", "Full Helmet [Equipment #9]", "None (Dud - 0 Reward)", "None (Dud - 0 Reward)", "9x Kindness Drops [Item #9]", "Wind Hat [Equipment #10]", "Double-Jab Orb [Rune #65]", "36,000 Potch", "9x Tom Yum Stew [Dish #216]", "Half Helmet [Equipment #6]", "Killer Orb [Rune #66]", "Gold Bar [Trade #41]", "6x Beefsteak [Dish #219]", "Wind Feather Ornament [Equipment #3]", "Wall Orb [Rune #73]", "35,000 Potch", "Stone of Luck [Item #27]", "Circlet [Equipment #5]", "Counter Orb [Rune #67]", "17,000 Potch", "None (Dud - 0 Reward)", "Pointed Hat [Equipment #4]", "Spark Orb [Rune #68]", "22,000 Potch", "9x Medicine [Item #1]", "Half Helmet [Equipment #6]", "Gale Orb [Rune #69]", "39,000 Potch", "6x Bolt of Wrath [Item #20]", "Full Helmet [Equipment #9]", "Titan Orb [Rune #19]", "12,000 Potch", "6x Revenge Earth [Item #16]", "Wing Ornament [Equipment #64]", "Knight Orb [Rune #72]", "8,000 Potch", "6x Flaming Sea Special [Dish #240]", "Horned Helmet [Equipment #12]", "Viper Orb [Rune #20]", "16,000 Potch", "8x Tekka-don [Dish #198]", "Crimson Cape [Equipment #59]", "Great Hawk Orb [Rune #21]", "None (Dud - 0 Reward)", "Chick (Bath Set) [Item #31]", "Gloves [Equipment #50]", "Lion Orb [Rune #22]", "17,000 Potch", "Toy Boat [Item #33]", "Goldlet [Equipment #54]", "Water Orb [Rune #3]", "19,000 Potch", "Stone of Dexterity [Item #25]", "Rose Brooch [Equipment #75]", "Blue Gate Orb [Rune #17]", "22,000 Potch", "4x Antitoxin [Item #3]", "Wind Amulet [Equipment #78]", "Hunter Orb [Rune #94]", "72,000 Potch", "9x Mega Medicine [Item #2]", "Power Ring [Equipment #82]", "Kite Orb [Rune #23]", "16,000 Potch", "6x Kindness Rain [Item #11]", "Guard Ring [Equipment #79]", "Unicorn Orb [Rune #24]", "39,000 Potch", "9x Revenge Earth [Item #16]", "Belt of Strength [Equipment #68]", "Thunder Orb [Rune #10]", "Flowing Orb [Rune #4]", "7x Mellow Stew [Dish #233]", "Blue Ribbon [Equipment #71]", "Gozu Orb [Rune #25]", "None (Dud - 0 Reward)", "9x Antitoxin [Item #3]", "Cape of Darkness [Equipment #58]", "Pixie Orb [Rune #26]", "67,000 Potch", "9x Needle [Item #5]", "Wooden Shoes [Equipment #45]", "Banshee Orb [Rune #27]", "Ancient Text [Trade #40]", "9x Throat Drops [Item #4]", "Star Earrings [Equipment #72]", "Sylph Orb [Rune #28]", "9,000 Potch", "None (Dud - 0 Reward)", "Iron Boots [Equipment #49]", "Chimera Orb [Rune #29]", "35,000 Potch", "9x Rising Sun Bento [Dish #189]", "Gold Emblem [Equipment #70]", "Haziness Orb [Rune #74]", "11,000 Potch", "Fortune Orb [Rune #62]", "Silver Armor [Equipment #34]", "Fire Lizard Orb [Rune #92]", "None (Dud - 0 Reward)", "Drinking Set [Item #32]", "Master Garb [Equipment #30]", "Technique Orb [Rune #95]", "32,000 Potch", "None (Dud - 0 Reward)", "Windspun Armor [Equipment #37]", "Silence Orb [Rune #96]", "88,000 Potch", "None (Dud - 0 Reward)", "Scale Mail [Equipment #25]", "Poison Orb [Rune #97]", "63,000 Potch", "None (Dud - 0 Reward)", "Thunder God Garb [Equipment #24]", "Knockdown Orb [Rune #98]", "34,000 Potch", "None (Dud - 0 Reward)", "Knight Armor [Equipment #35]", "Wizard Orb [Rune #83]", "31,000 Potch", "Drinking Set [Item #32] + Toy Boat [Item #33]", "Ninja Suit [Equipment #21]", "Mother Earth Orb [Rune #8]", "65,000 Potch", "Stone of Defense [Item #23]", "Dream Robe [Equipment #33]", "Sleep Orb [Rune #99]", "72,000 Potch", "None (Dud - 0 Reward)", "Master Robe [Equipment #27]", "Friendship Orb [Rune #100]", "Prosperity Orb [Rune #63]", "4x Throat Drops [Item #4]", "Magic Robe [Equipment #23]", "Magic Drain Orb [Rune #93]", "120,000 Potch", "9x Wind of Sleep [Item #12]", "Earth Armor [Equipment #32]", "Earth Orb [Rune #7]", "110,000 Potch", "9x Canopy Defense [Item #17]", "Half Plate [Equipment #22]", "Kindness Orb [Rune #102]", "98,000 Potch", "6x Red Curry [Dish #168]", "Robe of Mist [Equipment #31]", "Nymph Orb [Rune #30]", "55,000 Potch", "9x Tonkatsu [Dish #157]", "Full Plate [Equipment #28]", "Rune #103 [Rune #103]", "28,000 Potch", "9x Pancakes [Dish #146]", "Taikyoku Wear [Equipment #29]", "Dryad Orb [Rune #31]", "78,000 Potch", "Cyclone Orb [Rune #6]", "Blood Armor [Equipment #36]", "Water Orb [Rune #3]", "83,000 Potch", "Wine [Trade #34]", "Lucky Ring [Equipment #84]", "Drain Orb [Rune #75]", "57,000 Potch", "None (Dud - 0 Reward)", "Fire Emblem [Equipment #69]", "Barrier Orb [Rune #76]", "22,000 Potch", "None (Dud - 0 Reward)", "Kite Shield [Equipment #40]", "Balance Orb [Rune #77]", "56,000 Potch", "4x Needle [Item #5]", "Lucky Ring [Equipment #84]", "Fire Sealing Orb [Rune #78]", "14,000 Potch", "9x Fire Wall [Item #8]", "Sun Badge [Equipment #73]", "Darkness Orb [Rune #16]", "None (Dud - 0 Reward)", "9x Angry Blow [Item #18]", "Silver Shield [Equipment #42]", "Medicine Orb [Rune #81]", "14,000 Potch", "6x Japanese Curry [Dish #166]", "Fish Badge [Equipment #74]", "Resurrection Orb [Rune #12]", "34,000 Potch", "8x Sukiyaki [Dish #170]", "Magic Ring [Equipment #80]", "Phero Orb [Rune #71]", "None (Dud - 0 Reward)", "8x Ship Combo [Dish #226]", "Main-Gauche [Equipment #41]", "Earth Orb [Rune #7]", "58,000 Potch", "3x Mega Medicine [Item #2]", "Winged Boots [Equipment #48]", "Fire Orb [Rune #1]", "63,000 Potch", "Stone of Magic-Defense [Item #24]", "Earth Shield [Equipment #44]", "Water Orb [Rune #3]", "None (Dud - 0 Reward)", "9x Healing Wind [Item #13]", "Speed Ring [Equipment #81]", "Wind Orb [Rune #5]", "None (Dud - 0 Reward)", "Escape Talisman [Item #34]", "Boots [Equipment #46]", "Lightning Orb [Rune #9]", "22,000 Potch", "8x Chinese Noodles [Dish #176]", "Iron Shield [Equipment #39]", "Warrior Orb [Rune #84]", "13,000 Potch", "6x Dancing Flames [Item #7]", "Wooden Shield [Equipment #38]", "Earth Orb [Rune #7]", "74,000 Potch", "6x The Shredding [Item #14]", "Chaos Shield [Equipment #43]", "Wind Orb [Rune #5]", "66,000 Potch", "Stone of Magic [Item #22]"];

const BEAST_NAMES = ['Dragon', 'Unicorn', 'Rabbit', 'Turtle'];

const GUARDIAN_BLUEPRINTS = [
  // Byte 0: Bits 0..7 (Dragon 1..4, Unicorn 1..4)
  { byteIdx: 0, bitIdx: 0, name: 'Dragon Plans #1', loc: 'Ryube Outskirts (Wild Pig drop)', segment: 'Head' },
  { byteIdx: 0, bitIdx: 1, name: 'Dragon Plans #2', loc: 'Mt. Senhu Trail Chest', segment: 'Body' },
  { byteIdx: 0, bitIdx: 2, name: 'Dragon Plans #3', loc: 'Tinto Mines (Lizard drop)', segment: 'Legs' },
  { byteIdx: 0, bitIdx: 3, name: 'Dragon Plans #4', loc: 'Crom Village (Boy behind Elder)', segment: 'Tail' },
  { byteIdx: 0, bitIdx: 4, name: 'Unicorn Plans #1', loc: 'Radat Town (White Wolf drop)', segment: 'Head' },
  { byteIdx: 0, bitIdx: 5, name: 'Unicorn Plans #2', loc: 'Two River Winger Quarter Sewer', segment: 'Body' },
  { byteIdx: 0, bitIdx: 6, name: 'Unicorn Plans #3', loc: 'Mt. Rakutei Summit Chest', segment: 'Legs' },
  { byteIdx: 0, bitIdx: 7, name: 'Unicorn Plans #4', loc: 'Coronet Wharf Chest', segment: 'Tail' },
  // Byte 1: Bits 0..7 (Rabbit 1..4, Turtle 1..4)
  { byteIdx: 1, bitIdx: 0, name: 'Rabbit Plans #1', loc: 'South Window City Hall Chest', segment: 'Head' },
  { byteIdx: 1, bitIdx: 1, name: 'Rabbit Plans #2', loc: 'Banner Village (Samurai drop)', segment: 'Body' },
  { byteIdx: 1, bitIdx: 2, name: 'Rabbit Plans #3', loc: 'Forest Path to Matilda Chest', segment: 'Legs' },
  { byteIdx: 1, bitIdx: 3, name: 'Rabbit Plans #4', loc: 'Greenhill Forest Path Chest', segment: 'Tail' },
  { byteIdx: 1, bitIdx: 4, name: 'Turtle Plans #1', loc: 'Two River Kobold District Well', segment: 'Head' },
  { byteIdx: 1, bitIdx: 5, name: 'Turtle Plans #2', loc: 'Radat Rope Minigame Prize', segment: 'Body' },
  { byteIdx: 1, bitIdx: 6, name: 'Turtle Plans #3', loc: 'Mt. Tigerwolf Path Chest', segment: 'Legs' },
  { byteIdx: 1, bitIdx: 7, name: 'Turtle Plans #4', loc: 'Kuskus Town (Appraiser Woman)', segment: 'Tail' }
];

const PRESET_STATUES = [
  { label: 'Pure Dragon (0x00) — Dragon Censer', head: 0, body: 0, legs: 0, tail: 0 },
  { label: 'Pure Unicorn (0x55) — Blue Gate Orb', head: 1, body: 1, legs: 1, tail: 1 },
  { label: 'Pure Rabbit (0xAA) — 110,000 Potch', head: 2, body: 2, legs: 2, tail: 2 },
  { label: 'Pure Turtle (0xFF) — Stone of Magic (+3 MAG)', head: 3, body: 3, legs: 3, tail: 3 },
  { label: 'Stone of Power (+3 ATK) — 0x0B', head: 3, body: 2, legs: 0, tail: 0 },
  { label: 'Stone of Speed (+3 SPD) — 0x07', head: 3, body: 1, legs: 0, tail: 0 },
  { label: 'Stone of Defense (+3 DEF) — 0x9B', head: 3, body: 2, legs: 1, tail: 2 },
  { label: 'Stone of Magic-Defense (+3 MDEF) — 0xE7', head: 3, body: 1, legs: 2, tail: 3 },
  { label: 'Stone of Dexterity (+3 SKL) — 0x53', head: 3, body: 0, legs: 1, tail: 1 },
  { label: 'Stone of Luck (+3 LUK) — 0x2F', head: 3, body: 3, legs: 2, tail: 0 },
  { label: 'Fury Orb (Berserk Atk) — 0x05', head: 1, body: 1, legs: 0, tail: 0 },
  { label: 'Rage Orb (Advanced Fire) — 0x11', head: 1, body: 0, legs: 1, tail: 0 },
  { label: 'Thunder Orb (Advanced Lightning) — 0x65', head: 1, body: 1, legs: 2, tail: 1 },
  { label: 'Mother Earth Orb (Advanced Earth) — 0x99', head: 1, body: 2, legs: 1, tail: 2 },
  { label: 'Top Cash 120,000 Potch — 0xA6', head: 2, body: 1, legs: 2, tail: 2 }
];

export function createGuardianDeityEditor(arr, key, updateCallback, sourceData) {
  // Ensure arr is a 4-element array
  if (!Array.isArray(arr) || arr.length < 4) {
    arr = [255, 255, 0, 0];
    if (sourceData) sourceData.parts_no = arr;
  }

  const container = document.createElement('div');
  container.className = 'json-object guardian-deity-editor';
  container.style.cssText = 'padding: 0.75rem 1rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12); margin-bottom: 1rem;';

  // --- Header ---
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-weight: bold; margin-bottom: 0.8rem; border-bottom: 1px solid var(--pico-muted-border-color); padding-bottom: 0.4rem; flex-wrap: wrap; gap: 0.5rem;';
  
  const titleSpan = document.createElement('span');
  titleSpan.textContent = key || "Jude's Guardian Deity Statue & Blueprints (parts_no)";
  
  const summaryBadge = document.createElement('span');
  summaryBadge.style.cssText = 'font-size: 0.8rem; color: var(--pico-primary); margin-left: auto;';
  
  header.appendChild(titleSpan);
  header.appendChild(summaryBadge);
  container.appendChild(header);

  // --- Helpers for Syncing ---
  const notifyChange = () => {
    updateBadge();
    updateStatuePreview();
    if (updateCallback) updateCallback(arr);
  };

  // ==========================================================================
  // SECTION 1: BLUEPRINTS / PLANS DELIVERED TO JUDE (Byte 0 & Byte 1)
  // ==========================================================================
  const bpSection = document.createElement('div');
  bpSection.style.cssText = 'margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px dashed var(--pico-muted-border-color);';

  const bpHeader = document.createElement('div');
  bpHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;';

  const bpTitle = document.createElement('strong');
  bpTitle.style.cssText = 'font-size: 0.85rem; color: var(--pico-color);';
  bpTitle.innerHTML = '📜 Blueprints Delivered to Jude (16 Plans)';

  const bpToolbar = document.createElement('div');
  bpToolbar.style.cssText = 'display: flex; gap: 0.5rem; align-items: center;';

  const unlockAllPlansBtn = document.createElement('button');
  unlockAllPlansBtn.type = 'button';
  unlockAllPlansBtn.textContent = '✓ Deliver All 16 Plans';
  unlockAllPlansBtn.style.cssText = 'font-size: 0.75rem; padding: 0.3rem 0.65rem; margin-bottom: 0;';

  const clearAllPlansBtn = document.createElement('button');
  clearAllPlansBtn.type = 'button';
  clearAllPlansBtn.className = 'secondary outline';
  clearAllPlansBtn.textContent = '✗ Clear Plans';
  clearAllPlansBtn.style.cssText = 'font-size: 0.75rem; padding: 0.3rem 0.65rem; margin-bottom: 0;';

  bpToolbar.appendChild(unlockAllPlansBtn);
  bpToolbar.appendChild(clearAllPlansBtn);
  bpHeader.appendChild(bpTitle);
  bpHeader.appendChild(bpToolbar);
  bpSection.appendChild(bpHeader);

  // 16 Blueprint Checkboxes Grid (4 Columns: 1 Column for each Guardian Deity)
  const bpGrid = document.createElement('div');
  bpGrid.className = 'guardian-deity-plans-grid';
  bpGrid.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;';

  const bpCheckboxes = [];

  for (let deityIdx = 0; deityIdx < 4; deityIdx++) {
    const col = document.createElement('div');
    col.className = 'guardian-deity-col';
    col.style.cssText = 'display: flex; flex-direction: column; gap: 0.45rem;';

    const deityBlueprints = GUARDIAN_BLUEPRINTS.slice(deityIdx * 4, deityIdx * 4 + 4);
    deityBlueprints.forEach((bp) => {
      const label = document.createElement('label');
      label.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.5rem; border: 1px solid var(--pico-muted-border-color); border-radius: 4px; background: rgba(0,0,0,0.06); font-size: 0.78rem; cursor: pointer; margin-bottom: 0; user-select: none;';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.style.cssText = 'margin: 0; width: 14px; height: 14px;';
      cb.checked = (arr[bp.byteIdx] & (1 << bp.bitIdx)) !== 0;

      cb.addEventListener('change', () => {
        if (cb.checked) {
          arr[bp.byteIdx] |= (1 << bp.bitIdx);
        } else {
          arr[bp.byteIdx] &= ~(1 << bp.bitIdx);
        }
        notifyChange();
      });

      const textDiv = document.createElement('div');
      textDiv.style.cssText = 'display: flex; flex-direction: column; line-height: 1.2; overflow: hidden;';

      const nameSpan = document.createElement('span');
      nameSpan.style.cssText = 'font-weight: 600; color: var(--pico-primary);';
      nameSpan.textContent = bp.name + ' (' + bp.segment + ')';

      const locSpan = document.createElement('span');
      locSpan.style.cssText = 'font-size: 0.7rem; color: var(--pico-muted-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
      locSpan.textContent = bp.loc;
      locSpan.title = bp.loc;

      textDiv.appendChild(nameSpan);
      textDiv.appendChild(locSpan);

      label.appendChild(cb);
      label.appendChild(textDiv);
      col.appendChild(label);

      bpCheckboxes.push({ cb, bp });
    });

    bpGrid.appendChild(col);
  }

  unlockAllPlansBtn.addEventListener('click', () => {
    arr[0] = 255;
    arr[1] = 255;
    bpCheckboxes.forEach(item => { item.cb.checked = true; });
    notifyChange();
  });

  clearAllPlansBtn.addEventListener('click', () => {
    arr[0] = 0;
    arr[1] = 0;
    bpCheckboxes.forEach(item => { item.cb.checked = false; });
    notifyChange();
  });

  bpSection.appendChild(bpGrid);
  container.appendChild(bpSection);

  // ==========================================================================
  // SECTION 2: MODULAR STATUE CUSTOMIZER (Byte 2)
  // ==========================================================================
  const statueSection = document.createElement('div');
  statueSection.style.cssText = 'margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px dashed var(--pico-muted-border-color);';

  const statueHeader = document.createElement('div');
  statueHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.5rem;';

  const statueTitle = document.createElement('strong');
  statueTitle.style.cssText = 'font-size: 0.85rem; color: var(--pico-color);';
  statueTitle.innerHTML = '🗿 Modular Statue Customizer (parts_no[2])';

  statueHeader.appendChild(statueTitle);
  statueSection.appendChild(statueHeader);

  // Presets Toolbar
  const presetContainer = document.createElement('div');
  presetContainer.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem; flex-wrap: wrap;';

  const presetLabel = document.createElement('span');
  presetLabel.style.cssText = 'font-size: 0.75rem; font-weight: bold; color: var(--pico-muted-color);';
  presetLabel.textContent = 'Load Preset:';
  presetContainer.appendChild(presetLabel);

  const presetSelect = document.createElement('select');
  presetSelect.style.cssText = 'margin-bottom: 0; font-size: 0.75rem; padding: 0.25rem 0.5rem; flex: 1; min-width: 200px;';

  const defaultPresetOpt = document.createElement('option');
  defaultPresetOpt.value = '';
  defaultPresetOpt.textContent = '-- Select High-Tier / Iconic Preset --';
  presetSelect.appendChild(defaultPresetOpt);

  PRESET_STATUES.forEach((p, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = p.label;
    presetSelect.appendChild(opt);
  });

  presetContainer.appendChild(presetSelect);
  statueSection.appendChild(presetContainer);

  // 4 Anatomical Parts Dropdowns Grid
  const partsGrid = document.createElement('div');
  partsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.6rem; margin-bottom: 0.8rem;';

  const selects = [];
  const partSegments = [
    { name: 'Head Part', shift: 0 },
    { name: 'Body Part', shift: 2 },
    { name: 'Legs Part', shift: 4 },
    { name: 'Tail Part', shift: 6 }
  ];

  partSegments.forEach((seg) => {
    const chip = document.createElement('div');
    chip.style.cssText = 'padding: 0.45rem 0.6rem; background: rgba(0,0,0,0.15); border-radius: 4px; border: 1px solid var(--pico-muted-border-color); display: flex; flex-direction: column; gap: 0.25rem;';

    const lbl = document.createElement('label');
    lbl.style.cssText = 'font-size: 0.73rem; font-weight: bold; margin-bottom: 0; color: var(--pico-color);';
    lbl.textContent = seg.name;

    const sel = document.createElement('select');
    sel.style.cssText = 'margin-bottom: 0; font-size: 0.78rem; padding: 0.25rem 0.45rem;';

    BEAST_NAMES.forEach((bName, bIdx) => {
      const opt = document.createElement('option');
      opt.value = bIdx;
      opt.textContent = bName;
      sel.appendChild(opt);
    });

    // Init value from arr[2]
    const curVal = (arr[2] >> seg.shift) & 0x03;
    sel.value = curVal;

    sel.addEventListener('change', () => {
      const val = parseInt(sel.value, 10);
      arr[2] = (arr[2] & ~(0x03 << seg.shift)) | ((val & 0x03) << seg.shift);
      presetSelect.value = '';
      notifyChange();
    });

    chip.appendChild(lbl);
    chip.appendChild(sel);
    partsGrid.appendChild(chip);
    selects.push(sel);
  });

  statueSection.appendChild(partsGrid);

  // Preset Select Listener
  presetSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === '') return;
    const p = PRESET_STATUES[parseInt(val, 10)];
    if (!p) return;
    selects[0].value = p.head;
    selects[1].value = p.body;
    selects[2].value = p.legs;
    selects[3].value = p.tail;
    arr[2] = (p.tail << 6) | (p.legs << 4) | (p.body << 2) | p.head;
    notifyChange();
  });

  // Live Reward Evaluation Display Card
  const resultCard = document.createElement('div');
  resultCard.style.cssText = 'padding: 0.6rem 0.8rem; background: rgba(0,0,0,0.2); border-radius: 4px; border-left: 3px solid var(--pico-primary); display: flex; flex-direction: column; gap: 0.35rem;';

  const resHeader = document.createElement('div');
  resHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; font-weight: bold;';

  const resIndexSpan = document.createElement('span');
  resIndexSpan.style.cssText = 'color: var(--pico-muted-color); font-family: monospace;';

  const resRewardSpan = document.createElement('span');
  resRewardSpan.style.cssText = 'font-size: 0.85rem; font-weight: bold; color: var(--pico-color);';

  resHeader.appendChild(resRewardSpan);
  resHeader.appendChild(resIndexSpan);
  resultCard.appendChild(resHeader);

  const resComboSpan = document.createElement('div');
  resComboSpan.style.cssText = 'font-size: 0.73rem; color: var(--pico-muted-color);';
  resultCard.appendChild(resComboSpan);

  statueSection.appendChild(resultCard);
  container.appendChild(statueSection);

  // ==========================================================================
  // SECTION 3: SHRINE ACTIVE & REWARD CLAIMED STATUS (Byte 3)
  // ==========================================================================
  const stateSection = document.createElement('div');
  stateSection.style.cssText = 'display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;';

  const stateLabelDiv = document.createElement('div');
  stateLabelDiv.style.cssText = 'display: flex; flex-direction: column; line-height: 1.2;';

  const stateTitle = document.createElement('strong');
  stateTitle.style.cssText = 'font-size: 0.82rem; color: var(--pico-color);';
  stateTitle.textContent = '⛩️ Shrine Statue Active & Reward Claimed (parts_no[3])';

  const stateDesc = document.createElement('span');
  stateDesc.style.cssText = 'font-size: 0.72rem; color: var(--pico-muted-color);';
  stateDesc.textContent = "When enabled (1), the statue is assembled at Castle Shrine (vk33) and Jude's reward has been collected.";

  stateLabelDiv.appendChild(stateTitle);
  stateLabelDiv.appendChild(stateDesc);

  const stateToggleLabel = document.createElement('label');
  stateToggleLabel.style.cssText = 'display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; font-weight: bold; cursor: pointer; margin-bottom: 0;';

  const stateCb = document.createElement('input');
  stateCb.type = 'checkbox';
  stateCb.style.cssText = 'margin: 0; width: 16px; height: 16px;';
  stateCb.checked = (arr[3] !== 0);

  stateCb.addEventListener('change', () => {
    arr[3] = stateCb.checked ? 1 : 0;
    notifyChange();
  });

  stateToggleLabel.appendChild(stateCb);
  stateToggleLabel.appendChild(document.createTextNode('Claimed / Built'));

  stateSection.appendChild(stateLabelDiv);
  stateSection.appendChild(stateToggleLabel);
  container.appendChild(stateSection);

  // --- Dynamic Live Refresh Function ---
  function updateStatuePreview() {
    const id = arr[2] & 0xFF;
    const h = id & 3;
    const b = (id >> 2) & 3;
    const l = (id >> 4) & 3;
    const t = (id >> 6) & 3;

    selects[0].value = h;
    selects[1].value = b;
    selects[2].value = l;
    selects[3].value = t;

    const hex = '0x' + id.toString(16).toUpperCase().padStart(2, '0');
    const bin = id.toString(2).padStart(8, '0');
    const rewardText = GUARDIAN_STATUE_REWARDS[id] || 'None';
    const isDud = rewardText.startsWith('None');

    resIndexSpan.textContent = 'ID: ' + id + ' (' + hex + ') [' + bin + ']';
    resComboSpan.textContent = BEAST_NAMES[h] + ' Head / ' + BEAST_NAMES[b] + ' Body / ' + BEAST_NAMES[l] + ' Legs / ' + BEAST_NAMES[t] + ' Tail';

    if (isDud) {
      resRewardSpan.style.color = 'var(--pico-color-red-500, #e53935)';
      resRewardSpan.textContent = '⚠️ ' + rewardText;
      resultCard.style.borderLeftColor = 'var(--pico-color-red-500, #e53935)';
    } else {
      resRewardSpan.style.color = 'var(--pico-color-green-500, #43a047)';
      resRewardSpan.textContent = '🎁 Blessing: ' + rewardText;
      resultCard.style.borderLeftColor = 'var(--pico-primary, #1e88e5)';
    }
  }

  function updateBadge() {
    let bpCount = 0;
    for (let bit = 0; bit < 8; bit++) {
      if ((arr[0] & (1 << bit)) !== 0) bpCount++;
      if ((arr[1] & (1 << bit)) !== 0) bpCount++;
    }
    const id = arr[2] & 0xFF;
    const built = arr[3] !== 0;
    const hex = '0x' + id.toString(16).toUpperCase().padStart(2, '0');
    summaryBadge.textContent = bpCount + '/16 Plans | Statue ' + hex + ' | ' + (built ? 'Active' : 'Unclaimed');
  }

  // Initial populate
  updateBadge();
  updateStatuePreview();

  return container;
}
