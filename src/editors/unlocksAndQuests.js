// Unlocks, Collections, Quests & War Room Editors
// Provides granular bit/item controls alongside bulk Unlock All / Reset All actions

import GameData from '../gamedata.js';

/**
 * Helper to get base dish name for Recipe #1..40 from GameData.FOOD
 * Each recipe produces 6 dishes in GameData.FOOD: (recipeNum - 1) * 6 + 1
 */
function getRecipeDishName(recipeNum) {
  const foodId = (recipeNum - 1) * 6 + 1;
  const entry = GameData?.FOOD?.[foodId];
  if (!entry) return `Recipe #${recipeNum}`;
  const dishName = typeof entry === 'string' ? entry : entry.name;
  return dishName ? `Recipe #${recipeNum}: ${dishName}` : `Recipe #${recipeNum}`;
}

/**
 * Creates a Known Cooking Recipes editor (game_data.food_resipi - 5 bytes, 40 bits)
 * Granular 40 individual recipe checkboxes + search + Unlock All / Clear All
 */
export function createKnownRecipesEditor(arr, key, updateCallback) {
  const container = document.createElement('details');
  container.className = 'json-object';
  container.open = true;

  const summary = document.createElement('summary');
  summary.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-weight: bold;';
  const titleSpan = document.createElement('span');
  titleSpan.textContent = labelOrDefault(key, 'Known Cooking Recipes (Hai Yo)');
  const countBadge = document.createElement('span');
  countBadge.style.cssText = 'font-size: 0.8rem; color: var(--pico-primary); margin-left: auto; padding-left: 1rem;';
  summary.appendChild(titleSpan);
  summary.appendChild(countBadge);
  container.appendChild(summary);

  const body = document.createElement('div');
  body.style.cssText = 'padding: 0.75rem 0;';

  // Toolbar: Search + Unlock All + Clear All
  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem;';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Filter recipes by # or dish name...';
  searchInput.style.cssText = 'flex: 1; min-width: 200px; margin-bottom: 0; font-size: 0.75rem; padding: 0.35rem 0.6rem 0.35rem 2.1rem;';

  const unlockAllBtn = document.createElement('button');
  unlockAllBtn.type = 'button';
  unlockAllBtn.textContent = '✓ Unlock All 40 Recipes';
  unlockAllBtn.style.cssText = 'font-size: 0.75rem; padding: 0.35rem 0.75rem; margin-bottom: 0;';

  const clearAllBtn = document.createElement('button');
  clearAllBtn.type = 'button';
  clearAllBtn.className = 'secondary outline';
  clearAllBtn.textContent = '✗ Clear All';
  clearAllBtn.style.cssText = 'font-size: 0.75rem; padding: 0.35rem 0.75rem; margin-bottom: 0;';

  toolbar.appendChild(searchInput);
  toolbar.appendChild(unlockAllBtn);
  toolbar.appendChild(clearAllBtn);
  body.appendChild(toolbar);

  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 0.4rem;';

  const checkboxes = [];

  const updateBadge = () => {
    let unlocked = 0;
    for (let r = 0; r < 40; r++) {
      const byteIdx = Math.floor(r / 8);
      const bitIdx = r % 8;
      if (((arr[byteIdx] || 0) & (1 << bitIdx)) !== 0) unlocked++;
    }
    countBadge.textContent = `${unlocked} / 40 Unlocked`;
  };

  for (let r = 0; r < 40; r++) {
    const recipeNum = r + 1;
    const byteIdx = Math.floor(r / 8);
    const bitIdx = r % 8;
    const labelText = getRecipeDishName(recipeNum);

    const itemLabel = document.createElement('label');
    itemLabel.style.cssText = 'display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; padding: 0.3rem 0.5rem; background: rgba(0,0,0,0.15); border-radius: 4px; cursor: pointer; margin-bottom: 0;';
    itemLabel.dataset.searchText = labelText.toLowerCase();

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.style.margin = '0';
    cb.checked = ((arr[byteIdx] || 0) & (1 << bitIdx)) !== 0;

    cb.addEventListener('change', (e) => {
      if (e.target.checked) {
        arr[byteIdx] = (arr[byteIdx] || 0) | (1 << bitIdx);
      } else {
        arr[byteIdx] = (arr[byteIdx] || 0) & ~(1 << bitIdx);
      }
      updateBadge();
      if (updateCallback) updateCallback(arr);
    });

    const span = document.createElement('span');
    span.textContent = labelText;

    itemLabel.appendChild(cb);
    itemLabel.appendChild(span);
    grid.appendChild(itemLabel);
    checkboxes.push({ cb, byteIdx, bitIdx, itemLabel });
  }

  unlockAllBtn.addEventListener('click', () => {
    for (let i = 0; i < 5; i++) arr[i] = 255;
    checkboxes.forEach(item => { item.cb.checked = true; });
    updateBadge();
    if (updateCallback) updateCallback(arr);
  });

  clearAllBtn.addEventListener('click', () => {
    for (let i = 0; i < 5; i++) arr[i] = 0;
    checkboxes.forEach(item => { item.cb.checked = false; });
    updateBadge();
    if (updateCallback) updateCallback(arr);
  });

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    checkboxes.forEach(({ itemLabel }) => {
      itemLabel.style.display = !q || itemLabel.dataset.searchText.includes(q) ? 'flex' : 'none';
    });
  });

  updateBadge();
  body.appendChild(grid);
  container.appendChild(body);
  return container;
}

/**
 * Creates a Library Old Books editor (game_data.lib_flag - 16-bit bitmask)
 * Granular checkboxes for Old Book Vol. 1 to Vol. 12 + Unlock All / Clear All
 */
export function createLibraryBooksEditor(value, key, updateCallback, sourceData) {
  const container = document.createElement('div');
  container.className = 'json-object library-books-editor';
  container.style.cssText = 'padding: 0.75rem 1rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12); margin-bottom: 1rem;';

  let currentMask = Number(sourceData?.lib_flag ?? value ?? 0);

  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-weight: bold; margin-bottom: 0.6rem; border-bottom: 1px solid var(--pico-muted-border-color); padding-bottom: 0.4rem;';
  const titleSpan = document.createElement('span');
  titleSpan.textContent = labelOrDefault(key, 'Castle Library Old Books (Vol. 1–12)');
  const countBadge = document.createElement('span');
  countBadge.style.cssText = 'font-size: 0.8rem; color: var(--pico-primary); margin-left: auto; padding-left: 1rem;';
  header.appendChild(titleSpan);
  header.appendChild(countBadge);
  container.appendChild(header);

  const body = document.createElement('div');
  body.style.cssText = 'padding: 0.5rem 0;';

  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem;';

  const unlockAllBtn = document.createElement('button');
  unlockAllBtn.type = 'button';
  unlockAllBtn.textContent = '✓ Unlock All 12 Volumes';
  unlockAllBtn.style.cssText = 'font-size: 0.75rem; padding: 0.35rem 0.75rem; margin-bottom: 0;';

  const clearAllBtn = document.createElement('button');
  clearAllBtn.type = 'button';
  clearAllBtn.className = 'secondary outline';
  clearAllBtn.textContent = '✗ Clear All';
  clearAllBtn.style.cssText = 'font-size: 0.75rem; padding: 0.35rem 0.75rem; margin-bottom: 0;';

  const rawLabel = document.createElement('span');
  rawLabel.style.cssText = 'font-size: 0.75rem; color: var(--pico-muted-color); margin-left: auto;';

  toolbar.appendChild(unlockAllBtn);
  toolbar.appendChild(clearAllBtn);
  toolbar.appendChild(rawLabel);
  body.appendChild(toolbar);

  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 0.4rem;';

  const checkboxes = [];

  const syncValue = (newMask) => {
    currentMask = newMask;
    if (sourceData) sourceData.lib_flag = currentMask;
    if (updateCallback) updateCallback(currentMask);
    let count = 0;
    for (let b = 0; b < 12; b++) {
      if ((currentMask & (1 << b)) !== 0) count++;
    }
    countBadge.textContent = `${count} / 12 Unlocked`;
    rawLabel.textContent = `Raw Bitmask: ${currentMask}`;
  };

  for (let b = 0; b < 12; b++) {
    const volNum = b + 1;
    const itemLabel = document.createElement('label');
    itemLabel.style.cssText = 'display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; padding: 0.35rem 0.5rem; background: rgba(0,0,0,0.15); border-radius: 4px; cursor: pointer; margin-bottom: 0;';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.style.margin = '0';
    cb.checked = (currentMask & (1 << b)) !== 0;

    cb.addEventListener('change', (e) => {
      const next = e.target.checked ? (currentMask | (1 << b)) : (currentMask & ~(1 << b));
      syncValue(next);
    });

    const span = document.createElement('span');
    span.textContent = GameData?.BASE_ITEM?.[volNum] || `Old Book Vol. ${volNum}`;

    itemLabel.appendChild(cb);
    itemLabel.appendChild(span);
    grid.appendChild(itemLabel);
    checkboxes.push({ cb, bit: b });
  }

  unlockAllBtn.addEventListener('click', () => {
    checkboxes.forEach(item => { item.cb.checked = true; });
    syncValue(0x0FFF); // All 12 bits set (4095)
  });

  clearAllBtn.addEventListener('click', () => {
    checkboxes.forEach(item => { item.cb.checked = false; });
    syncValue(0);
  });

  syncValue(currentMask);
  body.appendChild(grid);
  container.appendChild(body);
  return container;
}

/**
 * Creates a Castle Flags, Farming & Ranch editor (game_data.hon_flag - 50 bytes)
 * Features granular checkboxes for Vegetable Plots (bytes 30-31), Farm Animals (byte 32),
 * AND a full 50-byte bit-level inspector for advanced castle flags.
 */
export function createCastleFlagsEditor(arr, key, updateCallback) {
  const container = document.createElement('div');
  container.className = 'castle-flags-editor';

  // Section 1: Granular Farming & Ranch (hon_flag[30..32]) - Non-collapsible
  const farmDetails = document.createElement('div');
  farmDetails.className = 'json-object';
  farmDetails.style.cssText = 'padding: 0.75rem 1rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12); margin-bottom: 1rem;';

  const farmSummary = document.createElement('div');
  farmSummary.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-weight: bold; margin-bottom: 0.6rem; border-bottom: 1px solid var(--pico-muted-border-color); padding-bottom: 0.4rem;';
  farmSummary.innerHTML = '<strong>🌱 Castle Farm Plots & Livestock (hon_flag[30–32])</strong>';
  farmDetails.appendChild(farmSummary);

  const farmBody = document.createElement('div');
  farmBody.style.cssText = 'padding: 0.5rem 0; display: flex; flex-direction: column; gap: 1rem;';

  const farmConfigs = [
    {
      byteIndex: 30,
      title: 'Vegetable Plots Group A (hon_flag[30] — Cabbage / Potato)',
      bitNames: [
        'Plot A1 (Bit 0)', 'Plot A2 (Bit 1)', 'Plot A3 (Bit 2)', 'Plot A4 (Bit 3)',
        'Seed/Growth State 1 (Bit 4)', 'Seed/Growth State 2 (Bit 5)', 'Seed/Growth State 3 (Bit 6)', 'Seed/Growth State 4 (Bit 7)'
      ],
      presets: [
        { label: '✓ Fill All (255)', val: 255 },
        { label: 'Planted Empty (240)', val: 240 },
        { label: '✗ Clear (0)', val: 0 }
      ]
    },
    {
      byteIndex: 31,
      title: 'Vegetable Plots Group B (hon_flag[31] — Spinach / Tomato)',
      bitNames: [
        'Plot B1 (Bit 0)', 'Plot B2 (Bit 1)', 'Plot B3 (Bit 2)', 'Plot B4 (Bit 3)',
        'Seed/Growth State 5 (Bit 4)', 'Seed/Growth State 6 (Bit 5)', 'Seed/Growth State 7 (Bit 6)', 'Seed/Growth State 8 (Bit 7)'
      ],
      presets: [
        { label: '✓ Fill All (255)', val: 255 },
        { label: 'Planted Empty (240)', val: 240 },
        { label: '✗ Clear (0)', val: 0 }
      ]
    },
    {
      byteIndex: 32,
      title: 'Yuzu Ranch Livestock (hon_flag[32] — Chick / Piglet / Lamb / Calf)',
      bitNames: [
        'Chick Slot 1 (Bit 0)', 'Chick Slot 2 (Bit 1)', 'Piglet Slot 1 (Bit 2)', 'Piglet Slot 2 (Bit 3)',
        'Lamb Slot 1 (Bit 4)', 'Lamb Slot 2 (Bit 5)', 'Calf Slot 1 (Bit 6)', 'Calf Slot 2 (Bit 7)'
      ],
      presets: [
        { label: '✓ Standard Full Ranch (221)', val: 221 },
        { label: '✓ All Bits On (255)', val: 255 },
        { label: '✗ Clear All (0)', val: 0 }
      ]
    }
  ];

  farmConfigs.forEach(cfg => {
    const card = document.createElement('div');
    card.style.cssText = 'padding: 0.75rem; background: rgba(0,0,0,0.15); border-radius: 6px;';

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;';

    const title = document.createElement('strong');
    title.style.fontSize = '0.85rem';
    title.textContent = cfg.title;
    header.appendChild(title);

    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;';

    const byteInput = document.createElement('input');
    byteInput.type = 'number';
    byteInput.min = '0';
    byteInput.max = '255';
    byteInput.value = arr[cfg.byteIndex] || 0;
    byteInput.style.cssText = 'width: 75px; margin-bottom: 0; font-size: 0.75rem; padding: 0.25rem;';

    const bitCheckboxes = [];

    const setByteValue = (newVal) => {
      const clamped = Math.max(0, Math.min(255, parseInt(newVal) || 0));
      arr[cfg.byteIndex] = clamped;
      byteInput.value = clamped;
      bitCheckboxes.forEach((cb, bit) => {
        cb.checked = (clamped & (1 << bit)) !== 0;
      });
      if (updateCallback) updateCallback(arr);
    };

    byteInput.addEventListener('input', (e) => setByteValue(e.target.value));
    controls.appendChild(byteInput);

    cfg.presets.forEach(preset => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = preset.val === 0 ? 'secondary outline' : 'outline';
      btn.textContent = preset.label;
      btn.style.cssText = 'font-size: 0.7rem; padding: 0.25rem 0.5rem; margin-bottom: 0;';
      btn.addEventListener('click', () => setByteValue(preset.val));
      controls.appendChild(btn);
    });

    header.appendChild(controls);
    card.appendChild(header);

    const bitGrid = document.createElement('div');
    bitGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.35rem;';

    cfg.bitNames.forEach((bitName, bit) => {
      const bitLabel = document.createElement('label');
      bitLabel.style.cssText = 'display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; cursor: pointer; margin-bottom: 0;';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.style.margin = '0';
      cb.checked = ((arr[cfg.byteIndex] || 0) & (1 << bit)) !== 0;

      cb.addEventListener('change', (e) => {
        const cur = arr[cfg.byteIndex] || 0;
        const next = e.target.checked ? (cur | (1 << bit)) : (cur & ~(1 << bit));
        setByteValue(next);
      });

      const span = document.createElement('span');
      span.textContent = bitName;

      bitLabel.appendChild(cb);
      bitLabel.appendChild(span);
      bitGrid.appendChild(bitLabel);
      bitCheckboxes.push(cb);
    });

    card.appendChild(bitGrid);
    farmBody.appendChild(card);
  });

  farmDetails.appendChild(farmBody);
  container.appendChild(farmDetails);

  return container;
}

/**
 * Creates All 50 Castle Flag Bytes raw granular bit editor for Experimental tab
 * Non-collapsible per user design
 */
export function createCastleFlagsRawEditor(arr, key, updateCallback) {
  return createGranularBitArrayEditor(
    arr,
    '🏰 All 50 Castle Flag Bytes (hon_flag[0–49] — Granular Bit & Byte Editor)',
    (idx) => `Byte ${idx}${idx === 30 || idx === 31 ? ' (Veggies)' : idx === 32 ? ' (Animals)' : ''}`,
    (idx, bit) => `Bit ${bit}`,
    updateCallback,
    true,
    false // Non-collapsible
  );
}

/**
 * Creates a Richmond Detective Investigation editor (tantei_lv, tantei_cano, tantei_ca_lv)
 */
export function createRichmondDetectiveEditor(arr, key, updateCallback, fullData) {
  const container = document.createElement('div');
  container.className = 'richmond-detective-editor';

  const gd = fullData?.game_data;

  // Active Investigation Header Card (Non-collapsible)
  if (gd) {
    const activeCard = document.createElement('div');
    activeCard.className = 'json-object';
    activeCard.style.cssText = 'padding: 0.75rem 1rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12); margin-bottom: 1rem;';

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; border-bottom: 1px solid var(--pico-muted-border-color); padding-bottom: 0.4rem;';
    header.innerHTML = '<strong>🕵️ Active Richmond Investigation (tantei_cano & tantei_ca_lv)</strong>';
    activeCard.appendChild(header);

    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; padding: 0.5rem 0;';

    // Target Character dropdown
    const charDiv = document.createElement('div');
    charDiv.className = 'json-item';
    const charLabel = document.createElement('label');
    charLabel.textContent = 'Target Character (tantei_cano)';
    charDiv.appendChild(charLabel);

    const charSelect = document.createElement('select');
    charSelect.style.marginBottom = '0';
    const noneOpt = document.createElement('option');
    noneOpt.value = 0;
    noneOpt.textContent = '0: None';
    charSelect.appendChild(noneOpt);

    if (GameData?.CHARACTERS) {
      Object.entries(GameData.CHARACTERS).forEach(([id, entry]) => {
        const name = typeof entry === 'string' ? entry : entry.name;
        if (name && name !== 'NA-') {
          const opt = document.createElement('option');
          opt.value = id;
          opt.textContent = `${id}: ${name}`;
          charSelect.appendChild(opt);
        }
      });
    }
    charSelect.value = gd.tantei_cano || 0;
    charSelect.addEventListener('change', (e) => {
      gd.tantei_cano = parseInt(e.target.value) || 0;
      if (updateCallback) updateCallback(arr);
    });
    charDiv.appendChild(charSelect);
    grid.appendChild(charDiv);

    // Investigation Level
    const lvDiv = document.createElement('div');
    lvDiv.className = 'json-item';
    const lvLabel = document.createElement('label');
    lvLabel.textContent = 'Current Investigation Stage (tantei_ca_lv)';
    lvDiv.appendChild(lvLabel);

    const lvInput = document.createElement('input');
    lvInput.type = 'number';
    lvInput.min = '0';
    lvInput.max = '10';
    lvInput.value = gd.tantei_ca_lv || 0;
    lvInput.style.marginBottom = '0';
    lvInput.addEventListener('input', (e) => {
      gd.tantei_ca_lv = parseInt(e.target.value) || 0;
      if (updateCallback) updateCallback(arr);
    });
    lvDiv.appendChild(lvInput);
    grid.appendChild(lvDiv);

    activeCard.appendChild(grid);
    container.appendChild(activeCard);
  }

  // Granular 65-byte Detective Clues Bit Editor
  const cluesEditor = createGranularBitArrayEditor(
    arr,
    "🔍 Richmond's Detective Clues (tantei_lv[0–64] — Granular Bit & Byte Editor)",
    (idx) => {
      const char1 = GameData?.CHARACTERS?.[idx * 2]?.name || `ID ${idx * 2}`;
      const char2 = GameData?.CHARACTERS?.[idx * 2 + 1]?.name || `ID ${idx * 2 + 1}`;
      return `Byte ${idx} (${char1} / ${char2})`;
    },
    (idx, bit) => {
      const charIdx = idx * 2 + (bit >= 4 ? 1 : 0);
      const charName = GameData?.CHARACTERS?.[charIdx]?.name || `Char ${charIdx}`;
      const clueNum = (bit % 4) + 1;
      return `${charName}: Clue ${clueNum} (Bit ${bit})`;
    },
    updateCallback,
    true,
    false // Non-collapsible for Investigations tab
  );
  container.appendChild(cluesEditor);

  return container;
}

/**
 * Creates a 256 World Treasure Chests editor (t_box_flag[0..31])
 * Granular 256 individual chest checkboxes + byte inputs + Open All / Reset All
 */
export function createTreasureChestsEditor(arr, key, updateCallback) {
  return createGranularBitArrayEditor(
    arr,
    '🧰 World Map Treasure Chests (t_box_flag — 256 Individual Chests)',
    (idx) => `Group ${idx + 1}: Chests #${idx * 8 + 1}–${idx * 8 + 8} (Byte ${idx})`,
    (idx, bit) => `Chest #${idx * 8 + bit + 1}`,
    updateCallback,
    true
  );
}

/**
 * Reusable Granular Bit + Byte Array Editor
 * Renders a filterable grid of byte cards where each card has a numeric byte input (0-255)
 * AND 8 individual bit checkboxes, plus global Unlock All (255) and Reset All (0) buttons.
 */
function createGranularBitArrayEditor(arr, titleText, getByteTitle, getBitLabel, updateCallback, openByDefault = false, collapsible = true) {
  const container = document.createElement(collapsible ? 'details' : 'div');
  container.className = 'json-object';
  if (collapsible) {
    container.open = openByDefault;
  } else {
    container.style.cssText = 'padding: 0.75rem 1rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12); margin-bottom: 1rem;';
  }

  const header = document.createElement(collapsible ? 'summary' : 'div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-weight: bold;' + (collapsible ? '' : ' margin-bottom: 0.6rem; border-bottom: 1px solid var(--pico-muted-border-color); padding-bottom: 0.4rem;');
  const titleSpan = document.createElement('span');
  titleSpan.textContent = titleText;
  const badgeSpan = document.createElement('span');
  badgeSpan.style.cssText = 'font-size: 0.8rem; color: var(--pico-primary); margin-left: auto; padding-left: 1rem;';
  header.appendChild(titleSpan);
  header.appendChild(badgeSpan);
  container.appendChild(header);

  const body = document.createElement('div');
  body.style.cssText = collapsible ? 'padding: 0.75rem 0;' : 'padding: 0.5rem 0;';

  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem;';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Filter by chest #, character name, or byte index...';
  searchInput.style.cssText = 'flex: 1; min-width: 220px; margin-bottom: 0; font-size: 0.75rem; padding: 0.35rem 0.6rem 0.35rem 2.1rem;';

  const setAllBtn = document.createElement('button');
  setAllBtn.type = 'button';
  setAllBtn.textContent = `✓ Set All (${arr.length * 8} bits = 255)`;
  setAllBtn.style.cssText = 'font-size: 0.75rem; padding: 0.35rem 0.75rem; margin-bottom: 0;';

  const clearAllBtn = document.createElement('button');
  clearAllBtn.type = 'button';
  clearAllBtn.className = 'secondary outline';
  clearAllBtn.textContent = '✗ Reset All (0)';
  clearAllBtn.style.cssText = 'font-size: 0.75rem; padding: 0.35rem 0.75rem; margin-bottom: 0;';

  toolbar.appendChild(searchInput);
  toolbar.appendChild(setAllBtn);
  toolbar.appendChild(clearAllBtn);
  body.appendChild(toolbar);

  const cardsGrid = document.createElement('div');
  cardsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.6rem;';

  const byteControllers = [];

  const updateTotalBadge = () => {
    let totalBits = 0;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i] || 0;
      for (let b = 0; b < 8; b++) {
        if ((v & (1 << b)) !== 0) totalBits++;
      }
    }
    badgeSpan.textContent = `${totalBits} / ${arr.length * 8} Bits Active`;
  };

  arr.forEach((byteVal, byteIdx) => {
    const card = document.createElement('div');
    card.style.cssText = 'padding: 0.6rem; background: rgba(0,0,0,0.15); border-radius: 6px; border: 1px solid var(--pico-muted-border-color);';

    const cardHeader = document.createElement('div');
    cardHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; gap: 0.4rem; margin-bottom: 0.45rem;';

    const cardTitle = document.createElement('strong');
    cardTitle.style.fontSize = '0.75rem';
    cardTitle.textContent = getByteTitle(byteIdx);

    const numInput = document.createElement('input');
    numInput.type = 'number';
    numInput.min = '0';
    numInput.max = '255';
    numInput.value = byteVal || 0;
    numInput.title = 'Raw byte value (0-255)';
    numInput.style.cssText = 'width: 68px; margin-bottom: 0; font-size: 0.72rem; padding: 0.2rem 0.35rem;';

    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(numInput);
    card.appendChild(cardHeader);

    const bitsGrid = document.createElement('div');
    bitsGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem;';

    const bitCbs = [];
    let searchTokens = cardTitle.textContent.toLowerCase();

    const syncByte = (newByte) => {
      const clamped = Math.max(0, Math.min(255, parseInt(newByte) || 0));
      arr[byteIdx] = clamped;
      numInput.value = clamped;
      bitCbs.forEach((cb, b) => {
        cb.checked = (clamped & (1 << b)) !== 0;
      });
      updateTotalBadge();
      if (updateCallback) updateCallback(arr);
    };

    numInput.addEventListener('input', (e) => syncByte(e.target.value));

    for (let bit = 0; bit < 8; bit++) {
      const bitText = getBitLabel(byteIdx, bit);
      searchTokens += ' ' + bitText.toLowerCase();

      const bitLbl = document.createElement('label');
      bitLbl.style.cssText = 'display: flex; align-items: center; gap: 0.3rem; font-size: 0.7rem; cursor: pointer; margin-bottom: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
      bitLbl.title = bitText;

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.style.margin = '0';
      cb.checked = ((byteVal || 0) & (1 << bit)) !== 0;

      cb.addEventListener('change', (e) => {
        const cur = arr[byteIdx] || 0;
        const next = e.target.checked ? (cur | (1 << bit)) : (cur & ~(1 << bit));
        syncByte(next);
      });

      const sp = document.createElement('span');
      sp.textContent = bitText;
      sp.style.cssText = 'overflow: hidden; text-overflow: ellipsis;';

      bitLbl.appendChild(cb);
      bitLbl.appendChild(sp);
      bitsGrid.appendChild(bitLbl);
      bitCbs.push(cb);
    }

    card.dataset.searchText = searchTokens;
    card.appendChild(bitsGrid);
    cardsGrid.appendChild(card);
    byteControllers.push({ card, syncByte });
  });

  setAllBtn.addEventListener('click', () => {
    byteControllers.forEach(c => c.syncByte(255));
  });

  clearAllBtn.addEventListener('click', () => {
    byteControllers.forEach(c => c.syncByte(0));
  });

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    byteControllers.forEach(({ card }) => {
      card.style.display = !q || card.dataset.searchText.includes(q) ? 'block' : 'none';
    });
  });

  updateTotalBadge();
  body.appendChild(cardsGrid);
  container.appendChild(body);
  return container;
}

/**
 * Creates a Major War Battle Units Editor (war_data: leader_no, sub_no, sub_to_leader)
 */
export function createWarRoomEditor(warData, key, updateCallback) {
  const details = document.createElement('details');
  details.className = 'json-object';
  details.open = true;

  const summary = document.createElement('summary');
  summary.innerHTML = '<strong>⚔️ Kiba & Shu War Room — Major Battle Units (war_data)</strong>';
  details.appendChild(summary);

  const body = document.createElement('div');
  body.style.cssText = 'padding: 0.75rem 0; display: flex; flex-direction: column; gap: 1rem;';

  const buildCharSelect = (currentVal, onChange) => {
    const select = document.createElement('select');
    select.style.cssText = 'margin-bottom: 0; font-size: 0.75rem; padding: 0.25rem 0.5rem;';
    const noneOpt = document.createElement('option');
    noneOpt.value = 0;
    noneOpt.textContent = '0: None / Default';
    select.appendChild(noneOpt);

    if (GameData?.CHARACTERS) {
      Object.entries(GameData.CHARACTERS).forEach(([id, entry]) => {
        const name = typeof entry === 'string' ? entry : entry.name;
        if (name && name !== 'NA-') {
          const opt = document.createElement('option');
          opt.value = id;
          opt.textContent = `${id}: ${name}`;
          select.appendChild(opt);
        }
      });
    }
    select.value = currentVal || 0;
    select.addEventListener('change', (e) => onChange(parseInt(e.target.value) || 0));
    return select;
  };

  // 1. Unit Leaders (leader_no)
  if (Array.isArray(warData?.leader_no)) {
    const leaderBox = document.createElement('div');
    leaderBox.innerHTML = '<h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">Unit Commanders (leader_no [14 slots])</h4>';
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 0.5rem;';

    warData.leader_no.forEach((val, idx) => {
      const item = document.createElement('div');
      item.style.cssText = 'display: flex; flex-direction: column; gap: 0.2rem;';
      const lbl = document.createElement('label');
      lbl.style.cssText = 'font-size: 0.72rem; margin-bottom: 0;';
      lbl.textContent = `Unit #${idx + 1} Leader`;
      item.appendChild(lbl);
      item.appendChild(buildCharSelect(val, (newVal) => {
        warData.leader_no[idx] = newVal;
        if (updateCallback) updateCallback(warData);
      }));
      grid.appendChild(item);
    });
    leaderBox.appendChild(grid);
    body.appendChild(leaderBox);
  }

  // 2. Sub-Officers & Assignments (sub_no & sub_to_leader)
  if (Array.isArray(warData?.sub_no)) {
    const subBox = document.createElement('div');
    subBox.innerHTML = '<h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem;">Sub-Officers & Unit Assignments (sub_no & sub_to_leader [28 slots])</h4>';
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 0.5rem;';

    warData.sub_no.forEach((val, idx) => {
      const card = document.createElement('div');
      card.style.cssText = 'padding: 0.45rem; background: rgba(0,0,0,0.15); border-radius: 4px; display: flex; flex-direction: column; gap: 0.3rem;';

      const lbl = document.createElement('strong');
      lbl.style.fontSize = '0.72rem';
      lbl.textContent = `Sub-Officer Slot #${idx + 1}`;
      card.appendChild(lbl);

      card.appendChild(buildCharSelect(val, (newVal) => {
        warData.sub_no[idx] = newVal;
        if (updateCallback) updateCallback(warData);
      }));

      if (Array.isArray(warData.sub_to_leader)) {
        const assignRow = document.createElement('div');
        assignRow.style.cssText = 'display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem;';
        const assignLbl = document.createElement('span');
        assignLbl.textContent = 'Assigned Unit (0–15):';
        const assignInput = document.createElement('input');
        assignInput.type = 'number';
        assignInput.min = '-1';
        assignInput.max = '15';
        assignInput.value = warData.sub_to_leader[idx] ?? 0;
        assignInput.style.cssText = 'width: 65px; margin-bottom: 0; font-size: 0.72rem; padding: 0.2rem;';
        assignInput.addEventListener('input', (e) => {
          warData.sub_to_leader[idx] = parseInt(e.target.value) || 0;
          if (updateCallback) updateCallback(warData);
        });
        assignRow.appendChild(assignLbl);
        assignRow.appendChild(assignInput);
        card.appendChild(assignRow);
      }

      grid.appendChild(card);
    });
    subBox.appendChild(grid);
    body.appendChild(subBox);
  }

  details.appendChild(body);
  return details;
}

/**
 * Creates a Side-Quests & World Counters editor for the General tab:
 * - Gordon's Trading Quest Progress (trade_transaction_total)
 * - Listening Crystal Beasts (l_mon_no)
 * - Escaped Battles (nige_cnt)
 * - Pickpocketed Potch (suri_potch)
 * - Luca Blight Ambush HP (luka_hp)
 */
export function createSideQuestsAndCountersEditor(fullData, updateCallback) {
  const gd = fullData?.game_data;
  if (!gd) return document.createElement('div');

  const fragment = document.createDocumentFragment();

  // 1. Gordon's Trading Profit (trade_transaction_total)
  const gordonRow = document.createElement('div');
  gordonRow.className = 'json-item';

  const gordonLabel = document.createElement('label');
  gordonLabel.textContent = "Gordon's Trade Volume (Potch)";
  gordonRow.appendChild(gordonLabel);

  const gordonControl = document.createElement('div');
  gordonControl.style.cssText = 'display: flex; gap: 0.5rem; align-items: center; flex: 1;';

  const gordonInput = document.createElement('input');
  gordonInput.type = 'number';
  gordonInput.min = '0';
  gordonInput.value = gd.trade_transaction_total || 0;
  gordonInput.style.cssText = 'flex: 1; margin-bottom: 0;';

  const gordonBtn = document.createElement('button');
  gordonBtn.type = 'button';
  gordonBtn.className = 'outline';
  gordonBtn.textContent = 'Set 50k';
  gordonBtn.style.cssText = 'font-size: 0.72rem; padding: 0.35rem 0.6rem; margin-bottom: 0; white-space: nowrap;';

  const gordonBadge = document.createElement('span');
  gordonBadge.style.cssText = 'font-size: 0.72rem; font-weight: bold; white-space: nowrap;';

  const updateGordonBadge = () => {
    const val = gd.trade_transaction_total || 0;
    if (val >= 50000) {
      gordonBadge.textContent = '✓ >= 50,000 (Eligible)';
      gordonBadge.style.color = 'var(--pico-ins-color)';
    } else {
      gordonBadge.textContent = `${val.toLocaleString()} / 50,000`;
      gordonBadge.style.color = '#f39c12';
    }
  };

  gordonInput.addEventListener('input', (e) => {
    gd.trade_transaction_total = Math.max(0, parseInt(e.target.value) || 0);
    updateGordonBadge();
    if (updateCallback) updateCallback();
  });

  gordonBtn.addEventListener('click', () => {
    gd.trade_transaction_total = 50000;
    gordonInput.value = 50000;
    updateGordonBadge();
    if (updateCallback) updateCallback();
  });

  updateGordonBadge();

  gordonControl.appendChild(gordonInput);
  gordonControl.appendChild(gordonBtn);
  gordonControl.appendChild(gordonBadge);
  gordonRow.appendChild(gordonControl);
  fragment.appendChild(gordonRow);

  // 2. Pickpocketed Potch (suri_potch)
  if (gd.suri_potch !== undefined) {
    const suriRow = document.createElement('div');
    suriRow.className = 'json-item';

    const suriLabel = document.createElement('label');
    suriLabel.textContent = 'Pickpocketed Potch (suri_potch)';
    suriRow.appendChild(suriLabel);

    const suriInput = document.createElement('input');
    suriInput.type = 'number';
    suriInput.min = '0';
    suriInput.value = gd.suri_potch || 0;
    suriInput.style.cssText = 'flex: 1; margin-bottom: 0;';
    suriInput.addEventListener('input', (e) => {
      gd.suri_potch = Math.max(0, parseInt(e.target.value) || 0);
      if (updateCallback) updateCallback();
    });

    suriRow.appendChild(suriInput);
    fragment.appendChild(suriRow);
  }

  // 3. Escaped Battles (nige_cnt)
  const escapeRow = document.createElement('div');
  escapeRow.className = 'json-item';

  const escapeLabel = document.createElement('label');
  escapeLabel.textContent = 'Escaped Battles Count (nige_cnt)';
  escapeRow.appendChild(escapeLabel);

  const escapeControl = document.createElement('div');
  escapeControl.style.cssText = 'display: flex; gap: 0.5rem; align-items: center; flex: 1;';

  const escapeInput = document.createElement('input');
  escapeInput.type = 'number';
  escapeInput.min = '0';
  escapeInput.max = '255';
  escapeInput.value = gd.nige_cnt || 0;
  escapeInput.style.cssText = 'flex: 1; margin-bottom: 0;';
  escapeInput.addEventListener('input', (e) => {
    gd.nige_cnt = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
    if (updateCallback) updateCallback();
  });

  const zeroEscapeBtn = document.createElement('button');
  zeroEscapeBtn.type = 'button';
  zeroEscapeBtn.className = 'outline';
  zeroEscapeBtn.textContent = 'Reset (0)';
  zeroEscapeBtn.style.cssText = 'font-size: 0.72rem; padding: 0.35rem 0.6rem; margin-bottom: 0; white-space: nowrap;';
  zeroEscapeBtn.addEventListener('click', () => {
    gd.nige_cnt = 0;
    escapeInput.value = 0;
    if (updateCallback) updateCallback();
  });

  escapeControl.appendChild(escapeInput);
  escapeControl.appendChild(zeroEscapeBtn);
  escapeRow.appendChild(escapeControl);
  fragment.appendChild(escapeRow);

  // 4. Luca Blight Ambush HP (luka_hp)
  const lukaRow = document.createElement('div');
  lukaRow.className = 'json-item';

  const lukaLabel = document.createElement('label');
  lukaLabel.textContent = 'Luca Blight Ambush Remaining HP (luka_hp)';
  lukaRow.appendChild(lukaLabel);

  const lukaInput = document.createElement('input');
  lukaInput.type = 'number';
  lukaInput.min = '0';
  lukaInput.max = '32767';
  lukaInput.value = gd.luka_hp || 0;
  lukaInput.style.cssText = 'flex: 1; margin-bottom: 0;';
  lukaInput.addEventListener('input', (e) => {
    gd.luka_hp = Math.max(0, parseInt(e.target.value) || 0);
    if (updateCallback) updateCallback();
  });

  lukaRow.appendChild(lukaInput);
  fragment.appendChild(lukaRow);

  // 5. Listening Crystal Pasture Beasts (l_mon_no[0..1])
  if (Array.isArray(gd.l_mon_no)) {
    const beastOptions = [
      { id: 0, name: '0: None' },
      { id: 49, name: '49: Abizboah' },
      { id: 50, name: '50: Feather' },
      { id: 72, name: '72: Siegfried' },
      { id: 74, name: '74: Rulodia' },
      { id: 79, name: '79: Chuchara' }
    ];

    gd.l_mon_no.forEach((beastId, slotIdx) => {
      const beastRow = document.createElement('div');
      beastRow.className = 'json-item';

      const beastLabel = document.createElement('label');
      beastLabel.textContent = `Listening Crystal Beast Slot #${slotIdx + 1} (l_mon_no[${slotIdx}])`;
      beastRow.appendChild(beastLabel);

      const select = document.createElement('select');
      select.style.cssText = 'flex: 1; margin-bottom: 0;';
      beastOptions.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.id;
        o.textContent = opt.name;
        select.appendChild(o);
      });
      select.value = beastId || 0;
      select.addEventListener('change', (e) => {
        gd.l_mon_no[slotIdx] = parseInt(e.target.value) || 0;
        if (updateCallback) updateCallback();
      });

      beastRow.appendChild(select);
      fragment.appendChild(beastRow);
    });
  }

  return fragment;
}

/**
 * Creates Yam Koo's Fishing Minigame Record Board (tsuri_data[0..15])
 * and Hai Yo's Kitchen Ingredient Stock (food_num[0..11]) editor.
 *
 * Grounded in EventOverlayClass.Overlay_fishing & fish_dsp.disp_record:
 * - tsuri_data[fish_id * 2]     = Caught count (0-255)
 * - tsuri_data[fish_id * 2 + 1] = Max weight raw byte (0-255), Displayed Weight = raw_byte * 0.05
 * - Record Board UI order (fish_dsp.fish_kind_tbl): [0, 7, 4, 1, 5, 3, 2, 6]
 * - food_num[8..11]: Whitefish, Shellfish, Shrimp, Salmon stocks sent to Hai Yo's kitchen (0-3)
 */
export function createFishingRecordsEditor(arr, key, updateCallback, fullData) {
  const container = document.createElement('div');
  container.className = 'json-object fishing-records-editor';
  container.style.cssText = 'padding: 0.75rem 1rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12); margin-bottom: 1rem;';

  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-weight: bold; margin-bottom: 0.6rem; border-bottom: 1px solid var(--pico-muted-border-color); padding-bottom: 0.4rem;';
  const titleSpan = document.createElement('span');
  titleSpan.textContent = "🎣 Yam Koo's Fishing Minigame Records (tsuri_data)";
  const badgeSpan = document.createElement('span');
  badgeSpan.style.cssText = 'font-size: 0.8rem; color: var(--pico-primary); margin-left: auto; padding-left: 1rem;';
  header.appendChild(titleSpan);
  header.appendChild(badgeSpan);
  container.appendChild(header);

  const body = document.createElement('div');
  body.style.cssText = 'padding: 0.5rem 0; display: flex; flex-direction: column; gap: 1rem;';

  // Ordered exactly as displayed on Yam Koo's Record Board (fish_dsp.fish_kind_tbl = [0, 7, 4, 1, 5, 3, 2, 6])
  const fishBoardOrder = [
    { fishId: 0, name: '🐟 Salmon',    caughtIdx: 0,  weightIdx: 1,  trophyWeightRaw: 164, foodNumIdx: 11 },
    { fishId: 7, name: '🦐 Shrimp',    caughtIdx: 14, weightIdx: 15, trophyWeightRaw: 44,  foodNumIdx: 10 },
    { fishId: 4, name: '🐚 Shellfish', caughtIdx: 8,  weightIdx: 9,  trophyWeightRaw: 65,  foodNumIdx: 9  },
    { fishId: 1, name: '🐠 Whitefish', caughtIdx: 2,  weightIdx: 3,  trophyWeightRaw: 30,  foodNumIdx: 8  },
    { fishId: 5, name: '🐡 Blowfish',  caughtIdx: 10, weightIdx: 11, trophyWeightRaw: 85,  foodNumIdx: null },
    { fishId: 3, name: '🪨 Stonefish', caughtIdx: 6,  weightIdx: 7,  trophyWeightRaw: 73,  foodNumIdx: null },
    { fishId: 2, name: '🦑 Squid',     caughtIdx: 4,  weightIdx: 5,  trophyWeightRaw: 42,  foodNumIdx: null },
    { fishId: 6, name: '🥾 Boot',      caughtIdx: 12, weightIdx: 13, trophyWeightRaw: 19,  foodNumIdx: null }
  ];

  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;';

  const desc = document.createElement('span');
  desc.style.cssText = 'font-size: 0.75rem; color: var(--pico-muted-color); margin-right: auto;';
  desc.textContent = 'Ordered matching the in-game Record Board. Weight = Raw Byte × 0.05.';
  toolbar.appendChild(desc);

  const trophyBtn = document.createElement('button');
  trophyBtn.type = 'button';
  trophyBtn.className = 'outline';
  trophyBtn.textContent = '🏆 Set Trophy Records';
  trophyBtn.style.cssText = 'font-size: 0.72rem; padding: 0.3rem 0.6rem; margin-bottom: 0;';

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'secondary outline';
  resetBtn.textContent = '✗ Reset All (0)';
  resetBtn.style.cssText = 'font-size: 0.72rem; padding: 0.3rem 0.6rem; margin-bottom: 0;';

  toolbar.appendChild(trophyBtn);
  toolbar.appendChild(resetBtn);
  body.appendChild(toolbar);

  // Record Board Table (styled matching standard app tables)
  const tableWrap = document.createElement('div');
  tableWrap.style.cssText = 'overflow-x: auto;';

  const table = document.createElement('table');
  table.className = 'striped';
  table.style.cssText = 'margin-bottom: 0; font-size: 0.85rem; width: 100%;';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Fish / Item Name</th>
        <th style="width: 140px;">Caught (0–255)</th>
        <th style="width: 160px;">Max Weight (×0.05)</th>
        <th style="width: 140px;">Raw Weight Byte</th>
      </tr>
    </thead>
  `;

  const tbody = document.createElement('tbody');
  const rowControllers = [];

  const updateSummaryBadge = () => {
    let totalCaught = 0;
    let speciesCaught = 0;
    fishBoardOrder.forEach(f => {
      const c = arr[f.caughtIdx] || 0;
      totalCaught += c;
      if (c > 0) speciesCaught++;
    });
    badgeSpan.textContent = `${speciesCaught} / 8 Types Caught (${totalCaught} Total)`;
  };

  fishBoardOrder.forEach(fish => {
    const tr = document.createElement('tr');

    const nameTd = document.createElement('td');
    nameTd.innerHTML = `<strong>${fish.name}</strong> <span style="font-size: 0.7rem; color: var(--pico-muted-color);">(ID ${fish.fishId})</span>`;
    tr.appendChild(nameTd);

    // Caught input
    const caughtTd = document.createElement('td');
    const caughtInput = document.createElement('input');
    caughtInput.type = 'number';
    caughtInput.min = '0';
    caughtInput.max = '255';
    caughtInput.value = arr[fish.caughtIdx] || 0;
    caughtInput.style.cssText = 'margin-bottom: 0; padding: 0.25rem 0.4rem; font-size: 0.8rem; width: 95px;';
    caughtTd.appendChild(caughtInput);
    tr.appendChild(caughtTd);

    // Displayed Max Weight input (step 0.05)
    const weightTd = document.createElement('td');
    const weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.min = '0';
    weightInput.max = '12.75';
    weightInput.step = '0.05';
    weightInput.value = ((arr[fish.weightIdx] || 0) * 0.05).toFixed(2);
    weightInput.style.cssText = 'margin-bottom: 0; padding: 0.25rem 0.4rem; font-size: 0.8rem; width: 110px;';
    weightTd.appendChild(weightInput);
    tr.appendChild(weightTd);

    // Raw Byte input (0-255)
    const rawTd = document.createElement('td');
    const rawInput = document.createElement('input');
    rawInput.type = 'number';
    rawInput.min = '0';
    rawInput.max = '255';
    rawInput.value = arr[fish.weightIdx] || 0;
    rawInput.style.cssText = 'margin-bottom: 0; padding: 0.25rem 0.4rem; font-size: 0.78rem; width: 95px;';
    rawTd.appendChild(rawInput);
    tr.appendChild(rawTd);

    const setValues = (newCaught, newRawWeight) => {
      const c = Math.max(0, Math.min(255, parseInt(newCaught) || 0));
      const w = Math.max(0, Math.min(255, parseInt(newRawWeight) || 0));
      arr[fish.caughtIdx] = c;
      arr[fish.weightIdx] = w;
      caughtInput.value = c;
      rawInput.value = w;
      weightInput.value = (w * 0.05).toFixed(2);
      updateSummaryBadge();
      if (updateCallback) updateCallback(arr);
    };

    caughtInput.addEventListener('input', (e) => {
      setValues(e.target.value, arr[fish.weightIdx]);
    });

    weightInput.addEventListener('change', (e) => {
      const floatVal = Math.max(0, Math.min(12.75, parseFloat(e.target.value) || 0));
      const rawVal = Math.round(floatVal * 20);
      setValues(arr[fish.caughtIdx], rawVal);
    });

    rawInput.addEventListener('input', (e) => {
      setValues(arr[fish.caughtIdx], e.target.value);
    });

    rowControllers.push({
      fish,
      setValues
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableWrap.appendChild(table);
  body.appendChild(tableWrap);

  trophyBtn.addEventListener('click', () => {
    rowControllers.forEach(({ fish, setValues }) => {
      const c = Math.max(arr[fish.caughtIdx] || 0, 5);
      const w = Math.max(arr[fish.weightIdx] || 0, fish.trophyWeightRaw);
      setValues(c, w);
    });
  });

  resetBtn.addEventListener('click', () => {
    rowControllers.forEach(({ setValues }) => setValues(0, 0));
  });

  updateSummaryBadge();
  container.appendChild(body);
  return container;
}

/**
 * Creates Hai Yo's Kitchen Ingredient Stock (food_num[0..11]) & Seasonings (taste_flag) editor
 */
export function createKitchenStockEditor(arr, key, updateCallback, fullData) {
  const details = document.createElement('details');
  details.className = 'json-object kitchen-stock-editor';
  details.open = true;

  const summary = document.createElement('summary');
  summary.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-weight: bold;';
  const titleSpan = document.createElement('span');
  titleSpan.textContent = "🍲 Hai Yo's Kitchen Ingredient Stock (food_num[0..11] — Max 3 per Ingredient)";
  summary.appendChild(titleSpan);
  details.appendChild(summary);

  const body = document.createElement('div');
  body.style.cssText = 'padding: 0.75rem 0; display: flex; flex-direction: column; gap: 1rem;';

  // Hai Yo's Kitchen Ingredient Stock (food_num[0..11])
  const foodNumArr = Array.isArray(arr) ? arr : fullData?.game_data?.food_num;
  if (Array.isArray(foodNumArr)) {
    const stockCard = document.createElement('div');
    stockCard.style.cssText = 'padding: 0.75rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12);';

    const stockHeader = document.createElement('div');
    stockHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.5rem;';
    const stockTitle = document.createElement('strong');
    stockTitle.style.fontSize = '0.85rem';
    stockTitle.textContent = "🍲 Hai Yo's Kitchen Ingredient Stock (food_num[0..11] — Max 3 per Ingredient)";
    stockHeader.appendChild(stockTitle);

    const maxStockBtn = document.createElement('button');
    maxStockBtn.type = 'button';
    maxStockBtn.className = 'outline';
    maxStockBtn.textContent = '✓ Max All 12 Ingredients (3/3)';
    maxStockBtn.style.cssText = 'font-size: 0.72rem; padding: 0.25rem 0.55rem; margin-bottom: 0;';
    stockHeader.appendChild(maxStockBtn);
    stockCard.appendChild(stockHeader);

    const ingredientNames = [
      '🥬 Cabbage (food_num[0])',
      '🥔 Potato (food_num[1])',
      '🌿 Spinach (food_num[2])',
      '🍅 Tomato (food_num[3])',
      '🥚 Egg (food_num[4])',
      '🥩 Pork (food_num[5])',
      '🥩 Beef (food_num[6])',
      '🥩 Mutton (food_num[7])',
      '🐠 Whitefish (food_num[8])',
      '🐚 Shellfish (food_num[9])',
      '🦐 Shrimp (food_num[10])',
      '🐟 Salmon (food_num[11])'
    ];

    const stockGrid = document.createElement('div');
    stockGrid.style.cssText = 'display: grid; grid-template-columns: repeat(4, minmax(175px, 1fr)); gap: 0.5rem;';
    const stockInputs = [];

    foodNumArr.forEach((val, idx) => {
      const itemDiv = document.createElement('div');
      itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; gap: 0.4rem; padding: 0.3rem 0.5rem; background: rgba(0,0,0,0.15); border-radius: 4px;';
      const lbl = document.createElement('span');
      lbl.style.fontSize = '0.73rem';
      lbl.textContent = ingredientNames[idx] || `Ingredient #${idx + 1}`;

      const inp = document.createElement('input');
      inp.type = 'number';
      inp.min = '0';
      inp.max = '9';
      inp.value = val || 0;
      inp.style.cssText = 'width: 64px; margin-bottom: 0; padding: 0.2rem 0.35rem; font-size: 0.75rem; text-align: center;';
      inp.addEventListener('input', (e) => {
        foodNumArr[idx] = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
        if (updateCallback) updateCallback(arr);
      });

      stockInputs.push(inp);
      itemDiv.appendChild(lbl);
      itemDiv.appendChild(inp);
      stockGrid.appendChild(itemDiv);
    });

    maxStockBtn.addEventListener('click', () => {
      for (let i = 0; i < foodNumArr.length; i++) {
        foodNumArr[i] = 3;
        if (stockInputs[i]) stockInputs[i].value = 3;
      }
      if (updateCallback) updateCallback(arr);
    });

    stockCard.appendChild(stockGrid);
    body.appendChild(stockCard);
  }

  // Hai Yo's Kitchen Seasonings (game_data.taste_flag)
  const gd = fullData?.game_data;
  if (gd && typeof gd === 'object') {
    const tasteCard = document.createElement('div');
    tasteCard.style.cssText = 'padding: 0.75rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12);';

    const tasteHeader = document.createElement('div');
    tasteHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.5rem;';

    const tasteTitle = document.createElement('strong');
    tasteTitle.style.fontSize = '0.85rem';
    tasteTitle.textContent = "🧂 Hai Yo's Kitchen Seasonings (taste_flag)";
    tasteHeader.appendChild(tasteTitle);

    const tasteBtns = document.createElement('div');
    tasteBtns.style.cssText = 'display: flex; align-items: center; gap: 0.4rem;';

    const rawTasteLabel = document.createElement('span');
    rawTasteLabel.style.cssText = 'font-size: 0.72rem; color: var(--pico-muted-color);';
    rawTasteLabel.textContent = 'Raw Byte:';

    const rawTasteInput = document.createElement('input');
    rawTasteInput.type = 'number';
    rawTasteInput.min = '0';
    rawTasteInput.max = '255';
    rawTasteInput.value = gd.taste_flag || 0;
    rawTasteInput.style.cssText = 'width: 64px; margin-bottom: 0; padding: 0.2rem 0.35rem; font-size: 0.75rem; text-align: center;';

    const unlockTasteBtn = document.createElement('button');
    unlockTasteBtn.type = 'button';
    unlockTasteBtn.className = 'outline';
    unlockTasteBtn.textContent = '✓ Unlock All Seasonings';
    unlockTasteBtn.style.cssText = 'font-size: 0.72rem; padding: 0.25rem 0.55rem; margin-bottom: 0;';

    const clearTasteBtn = document.createElement('button');
    clearTasteBtn.type = 'button';
    clearTasteBtn.className = 'secondary outline';
    clearTasteBtn.textContent = '✗ Reset (Salt Only)';
    clearTasteBtn.style.cssText = 'font-size: 0.72rem; padding: 0.25rem 0.55rem; margin-bottom: 0;';

    tasteBtns.appendChild(rawTasteLabel);
    tasteBtns.appendChild(rawTasteInput);
    tasteBtns.appendChild(unlockTasteBtn);
    tasteBtns.appendChild(clearTasteBtn);
    tasteHeader.appendChild(tasteBtns);
    tasteCard.appendChild(tasteHeader);

    const seasonings = [
      { bit: null, name: '🧂 Salt (Row 0 — Always Unlocked)', always: true },
      { bit: 1,    name: '🥫 Mayonnaise (Bit 1 / +2)' },
      { bit: 2,    name: '🌶️ Red Pepper (Bit 2 / +4)' },
      { bit: 3,    name: '🍬 Sugar (Bit 3 / +8)' },
      { bit: 4,    name: '🍶 Soy Sauce (Bit 4 / +16)' },
      { bit: 5,    name: '🥛 White Sauce (Bit 5 / +32)' }
    ];

    const tasteGrid = document.createElement('div');
    tasteGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.45rem;';
    const tasteCbs = [];

    const syncTasteUI = (newVal) => {
      const clamped = Math.max(0, Math.min(255, parseInt(newVal) || 0));
      gd.taste_flag = clamped;
      rawTasteInput.value = clamped;
      tasteCbs.forEach(({ cb, bit }) => {
        cb.checked = (clamped & (1 << bit)) !== 0;
      });
      if (updateCallback) updateCallback(arr);
    };

    seasonings.forEach(s => {
      const lbl = document.createElement('label');
      lbl.style.cssText = 'display: flex; align-items: center; gap: 0.45rem; font-size: 0.75rem; padding: 0.35rem 0.55rem; background: rgba(0,0,0,0.15); border-radius: 4px; cursor: pointer; margin-bottom: 0;';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.style.margin = '0';

      if (s.always) {
        cb.checked = true;
        cb.disabled = true;
      } else {
        cb.checked = ((gd.taste_flag || 0) & (1 << s.bit)) !== 0;
        cb.addEventListener('change', (e) => {
          const cur = gd.taste_flag || 0;
          const next = e.target.checked ? (cur | (1 << s.bit)) : (cur & ~(1 << s.bit));
          syncTasteUI(next);
        });
        tasteCbs.push({ cb, bit: s.bit });
      }

      const span = document.createElement('span');
      span.textContent = s.name;
      lbl.appendChild(cb);
      lbl.appendChild(span);
      tasteGrid.appendChild(lbl);
    });

    rawTasteInput.addEventListener('input', (e) => {
      syncTasteUI(e.target.value);
    });

    unlockTasteBtn.addEventListener('click', () => {
      syncTasteUI((gd.taste_flag || 0) | 0x3E); // Bits 1..5 (62)
    });

    clearTasteBtn.addEventListener('click', () => {
      syncTasteUI(0);
    });

    tasteCard.appendChild(tasteGrid);
    body.appendChild(tasteCard);
  }

  details.appendChild(body);
  return details;
}

function labelOrDefault(key, fallback) {
  return key && key !== 'food_resipi' && key !== 'lib_flag' ? key : fallback;
}
