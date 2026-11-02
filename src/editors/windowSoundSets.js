// Window Sets & Sound Sets Editors (Castle Tab)
// Forensic Reverse-Engineered Implementation for Suikoden II HD Remaster & Classic Saves
//
// Delivery Tracking:
// - Window Sets 1..7: event_flag[77] (0x4D) bitmask (bits 0..6: 0x01..0x40)
// - Sound Sets 1..7:  event_flag[78] (0x4E) bitmask (bits 0..6: 0x01..0x40)
//
// Active Configuration (game_data):
// - Active Window Style:        game_data.win_typ[0] (0..7)
// - Window Frame Color:         game_data.win_col (0..7)
// - Window Transparency/Suke:   game_data.win_suke (0..3)
// - Active Sound Effect Set:    game_data.se_set (0..7)

const WINDOW_SET_DEFS = [
  { id: 1, mask: 0x01, name: 'Window Set 1', desc: 'Simple Clean Border (Ryube / Castle Item Shop)' },
  { id: 2, mask: 0x02, name: 'Window Set 2', desc: 'Wood Carved Frame (Greenhill Item Shop)' },
  { id: 3, mask: 0x04, name: 'Window Set 3', desc: 'Stone Engraved Border (Cave of the Wind Chest)' },
  { id: 4, mask: 0x08, name: 'Window Set 4', desc: 'Jeweled Floral Ornament (Radat Town Appraisal)' },
  { id: 5, mask: 0x10, name: 'Window Set 5', desc: 'Gothic Iron Lattice (Tinto Mines Chest)' },
  { id: 6, mask: 0x20, name: 'Window Set 6', desc: 'Eastern Dragon Border (Rokkaku Hamlet Chest)' },
  { id: 7, mask: 0x40, name: 'Window Set 7', desc: 'Classic Minimal Frame (Gregminster Item Shop)' }
];

const SOUND_SET_DEFS = [
  { id: 1, mask: 0x01, name: 'Sound Set 1', desc: 'Whistle & Melodic Bells (Radat Town Appraisal)' },
  { id: 2, mask: 0x02, name: 'Sound Set 2', desc: 'Electronic Beeps & Synth (Forest Village Chief)' },
  { id: 3, mask: 0x04, name: 'Sound Set 3', desc: 'Soft Acoustic Notes (Kobold Village drop)' },
  { id: 4, mask: 0x08, name: 'Sound Set 4', desc: 'Mechanical Clicks & Tones (Two River / Radat)' },
  { id: 5, mask: 0x10, name: 'Sound Set 5', desc: 'Fantasy Chimes & Magic (Matilda Forest Path drop)' },
  { id: 6, mask: 0x20, name: 'Sound Set 6', desc: 'Retro 8-Bit Arcade (Rokkaku Hamlet Item Shop)' },
  { id: 7, mask: 0x40, name: 'Sound Set 7', desc: 'Classical Orchestral Accents (Gregminster Chest)' }
];

/**
 * Creates the Window Sets & Frame Customization editor card.
 * @param {Object} data - Root save data object
 * @param {string} label - Section label
 * @param {Function} updateCallback - Callback on changes
 * @returns {HTMLElement} - The Window Sets editor container
 */
export function createWindowSetsEditor(data, label, updateCallback) {
  const container = document.createElement('div');
  container.className = 'json-object window-sets-editor';
  container.style.cssText = 'padding: 0.85rem 1.15rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12); margin-bottom: 1.25rem;';

  const gameData = data.game_data || data;
  if (!Array.isArray(data.event_flag)) {
    data.event_flag = new Array(256).fill(0);
  }
  if (!Array.isArray(gameData.win_typ)) {
    gameData.win_typ = [0, 0];
  }

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-weight: bold; margin-bottom: 0.75rem; border-bottom: 1px solid var(--pico-muted-border-color); padding-bottom: 0.45rem; flex-wrap: wrap; gap: 0.5rem;';

  const titleSpan = document.createElement('span');
  titleSpan.innerHTML = '🪟 <strong>Tenkou\'s Window Sets & Frame Customization</strong>';

  const countBadge = document.createElement('span');
  countBadge.style.cssText = 'font-size: 0.8rem; color: var(--pico-primary);';

  header.appendChild(titleSpan);
  header.appendChild(countBadge);
  container.appendChild(header);

  const updateBadge = () => {
    const flagVal = Number(data.event_flag[77]) || 0;
    let unlocked = 0;
    WINDOW_SET_DEFS.forEach((w) => {
      if ((flagVal & w.mask) !== 0) unlocked++;
    });
    countBadge.textContent = `${unlocked} / 7 Delivered to Tenkou`;
  };

  // Section 1: Active In-Game Window Customization Controls
  const settingsSection = document.createElement('div');
  settingsSection.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; padding: 0.75rem; background: rgba(0,0,0,0.18); border-radius: 6px; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.06);';

  // Active Window Style Dropdown
  const styleGroup = document.createElement('div');
  styleGroup.style.cssText = 'display: flex; flex-direction: column; gap: 0.3rem;';
  const styleLabel = document.createElement('label');
  styleLabel.style.cssText = 'font-size: 0.75rem; font-weight: bold; margin-bottom: 0;';
  styleLabel.textContent = 'Active Window Style (win_typ[0]):';
  const styleSelect = document.createElement('select');
  styleSelect.style.cssText = 'font-size: 0.8rem; padding: 0.35rem 0.5rem; margin-bottom: 0;';

  const styleOptions = [
    { val: 0, text: '0: Default Classic Style' },
    { val: 1, text: '1: Window Set 1' },
    { val: 2, text: '2: Window Set 2' },
    { val: 3, text: '3: Window Set 3' },
    { val: 4, text: '4: Window Set 4' },
    { val: 5, text: '5: Window Set 5' },
    { val: 6, text: '6: Window Set 6' },
    { val: 7, text: '7: Window Set 7' }
  ];
  styleOptions.forEach((opt) => {
    const o = document.createElement('option');
    o.value = opt.val;
    o.textContent = opt.text;
    styleSelect.appendChild(o);
  });
  styleSelect.value = String(gameData.win_typ[0] ?? 0);
  styleSelect.addEventListener('change', (e) => {
    gameData.win_typ[0] = parseInt(e.target.value, 10) || 0;
    if (updateCallback) updateCallback();
  });
  styleGroup.appendChild(styleLabel);
  styleGroup.appendChild(styleSelect);
  settingsSection.appendChild(styleGroup);

  // Window Color (win_col)
  const colorGroup = document.createElement('div');
  colorGroup.style.cssText = 'display: flex; flex-direction: column; gap: 0.3rem;';
  const colorLabel = document.createElement('label');
  colorLabel.style.cssText = 'font-size: 0.75rem; font-weight: bold; margin-bottom: 0;';
  colorLabel.textContent = 'Frame Color (win_col):';
  const colorSelect = document.createElement('select');
  colorSelect.style.cssText = 'font-size: 0.8rem; padding: 0.35rem 0.5rem; margin-bottom: 0;';
  for (let c = 0; c <= 7; c++) {
    const o = document.createElement('option');
    o.value = c;
    o.textContent = c === 0 ? '0: Default Theme Color' : `Color Scheme #${c}`;
    colorSelect.appendChild(o);
  }
  colorSelect.value = String(gameData.win_col ?? 0);
  colorSelect.addEventListener('change', (e) => {
    gameData.win_col = parseInt(e.target.value, 10) || 0;
    if (updateCallback) updateCallback();
  });
  colorGroup.appendChild(colorLabel);
  colorGroup.appendChild(colorSelect);
  settingsSection.appendChild(colorGroup);

  // Window Transparency / Suke (win_suke)
  const sukeGroup = document.createElement('div');
  sukeGroup.style.cssText = 'display: flex; flex-direction: column; gap: 0.3rem;';
  const sukeLabel = document.createElement('label');
  sukeLabel.style.cssText = 'font-size: 0.75rem; font-weight: bold; margin-bottom: 0;';
  sukeLabel.textContent = 'Opacity / Transparency (win_suke):';
  const sukeSelect = document.createElement('select');
  sukeSelect.style.cssText = 'font-size: 0.8rem; padding: 0.35rem 0.5rem; margin-bottom: 0;';
  const sukeOptions = [
    { val: 0, text: '0: Fully Opaque (Solid 100%)' },
    { val: 1, text: '1: Light Transparency (~75%)' },
    { val: 2, text: '2: Medium Transparency (~50%)' },
    { val: 3, text: '3: High Transparency (~25%)' }
  ];
  sukeOptions.forEach((opt) => {
    const o = document.createElement('option');
    o.value = opt.val;
    o.textContent = opt.text;
    sukeSelect.appendChild(o);
  });
  sukeSelect.value = String(Math.min(3, Math.max(0, gameData.win_suke ?? 2)));
  sukeSelect.addEventListener('change', (e) => {
    gameData.win_suke = parseInt(e.target.value, 10) || 0;
    if (updateCallback) updateCallback();
  });
  sukeGroup.appendChild(sukeLabel);
  sukeGroup.appendChild(sukeSelect);
  settingsSection.appendChild(sukeGroup);

  container.appendChild(settingsSection);

  // Section 2: Delivery Checkboxes (event_flag[77])
  const deliveryHeader = document.createElement('div');
  deliveryHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;';
  
  const subtitle = document.createElement('div');
  subtitle.style.cssText = 'font-size: 0.75rem; color: var(--pico-muted-color);';
  subtitle.textContent = 'Sets marked as delivered will be available in Tenkou\'s Window Selection menu in Castle HQ.';

  const btnToolbar = document.createElement('div');
  btnToolbar.style.cssText = 'display: flex; gap: 0.5rem; margin-left: auto;';

  const deliverAllBtn = document.createElement('button');
  deliverAllBtn.type = 'button';
  deliverAllBtn.className = 'outline';
  deliverAllBtn.textContent = '✓ Deliver All 7 Sets';
  deliverAllBtn.style.cssText = 'font-size: 0.75rem; padding: 0.25rem 0.65rem; margin-bottom: 0;';

  const clearAllBtn = document.createElement('button');
  clearAllBtn.type = 'button';
  clearAllBtn.className = 'secondary outline';
  clearAllBtn.textContent = '✗ Clear All';
  clearAllBtn.style.cssText = 'font-size: 0.75rem; padding: 0.25rem 0.65rem; margin-bottom: 0;';

  btnToolbar.appendChild(deliverAllBtn);
  btnToolbar.appendChild(clearAllBtn);
  deliveryHeader.appendChild(subtitle);
  deliveryHeader.appendChild(btnToolbar);
  container.appendChild(deliveryHeader);

  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.5rem;';

  const checkboxMap = new Map();

  WINDOW_SET_DEFS.forEach((w) => {
    const card = document.createElement('label');
    card.style.cssText = 'display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.8rem; padding: 0.5rem 0.65rem; background: rgba(0,0,0,0.15); border-radius: 4px; cursor: pointer; margin-bottom: 0; border: 1px solid rgba(255,255,255,0.04);';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.style.marginTop = '0.2rem';
    cb.style.marginBottom = '0';

    const flagVal = Number(data.event_flag[77]) || 0;
    cb.checked = (flagVal & w.mask) !== 0;

    cb.addEventListener('change', (e) => {
      let currentVal = Number(data.event_flag[77]) || 0;
      if (e.target.checked) {
        currentVal |= w.mask;
      } else {
        currentVal &= ~w.mask;
      }
      data.event_flag[77] = currentVal;
      updateBadge();
      if (updateCallback) updateCallback();
    });

    const info = document.createElement('div');
    info.style.cssText = 'display: flex; flex-direction: column; gap: 0.15rem;';
    const nameSpan = document.createElement('span');
    nameSpan.style.fontWeight = 'bold';
    nameSpan.textContent = `${w.name} (Bit ${Math.log2(w.mask)})`;
    const descSpan = document.createElement('span');
    descSpan.style.cssText = 'font-size: 0.7rem; color: var(--pico-muted-color);';
    descSpan.textContent = w.desc;

    info.appendChild(nameSpan);
    info.appendChild(descSpan);
    card.appendChild(cb);
    card.appendChild(info);
    grid.appendChild(card);

    checkboxMap.set(w.mask, cb);
  });

  deliverAllBtn.addEventListener('click', () => {
    let currentVal = Number(data.event_flag[77]) || 0;
    currentVal |= 0x7F; // All 7 bits
    data.event_flag[77] = currentVal;
    WINDOW_SET_DEFS.forEach((w) => {
      const cb = checkboxMap.get(w.mask);
      if (cb) cb.checked = true;
    });
    updateBadge();
    if (updateCallback) updateCallback();
  });

  clearAllBtn.addEventListener('click', () => {
    let currentVal = Number(data.event_flag[77]) || 0;
    currentVal &= ~0x7F;
    data.event_flag[77] = currentVal;
    WINDOW_SET_DEFS.forEach((w) => {
      const cb = checkboxMap.get(w.mask);
      if (cb) cb.checked = false;
    });
    updateBadge();
    if (updateCallback) updateCallback();
  });

  container.appendChild(grid);
  updateBadge();
  return container;
}

/**
 * Creates the Sound Sets & Audio Customization editor card.
 * @param {Object} data - Root save data object
 * @param {string} label - Section label
 * @param {Function} updateCallback - Callback on changes
 * @returns {HTMLElement} - The Sound Sets editor container
 */
export function createSoundSetsEditor(data, label, updateCallback) {
  const container = document.createElement('div');
  container.className = 'json-object sound-sets-editor';
  container.style.cssText = 'padding: 0.85rem 1.15rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12); margin-bottom: 1.25rem;';

  const gameData = data.game_data || data;
  if (!Array.isArray(data.event_flag)) {
    data.event_flag = new Array(256).fill(0);
  }

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-weight: bold; margin-bottom: 0.75rem; border-bottom: 1px solid var(--pico-muted-border-color); padding-bottom: 0.45rem; flex-wrap: wrap; gap: 0.5rem;';

  const titleSpan = document.createElement('span');
  titleSpan.innerHTML = '🎵 <strong>Connell\'s Sound Sets & Audio Customization</strong>';

  const countBadge = document.createElement('span');
  countBadge.style.cssText = 'font-size: 0.8rem; color: var(--pico-primary);';

  header.appendChild(titleSpan);
  header.appendChild(countBadge);
  container.appendChild(header);

  const updateBadge = () => {
    const flagVal = Number(data.event_flag[78]) || 0;
    let unlocked = 0;
    SOUND_SET_DEFS.forEach((s) => {
      if ((flagVal & s.mask) !== 0) unlocked++;
    });
    countBadge.textContent = `${unlocked} / 7 Delivered to Connell`;
  };

  // Section 1: Active In-Game Sound Effect Setting (se_set)
  const settingsSection = document.createElement('div');
  settingsSection.style.cssText = 'display: flex; flex-direction: column; gap: 0.4rem; padding: 0.75rem; background: rgba(0,0,0,0.18); border-radius: 6px; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.06);';

  const seLabel = document.createElement('label');
  seLabel.style.cssText = 'font-size: 0.75rem; font-weight: bold; margin-bottom: 0;';
  seLabel.textContent = 'Active Sound Effect Set (game_data.se_set):';

  const seSelect = document.createElement('select');
  seSelect.style.cssText = 'font-size: 0.8rem; padding: 0.35rem 0.5rem; margin-bottom: 0; max-width: 400px;';

  const seOptions = [
    { val: 0, text: '0: Default Sound Set' },
    { val: 1, text: '1: Sound Set 1 (Whistles & Bells)' },
    { val: 2, text: '2: Sound Set 2 (Electronic Synth)' },
    { val: 3, text: '3: Sound Set 3 (Soft Acoustic)' },
    { val: 4, text: '4: Sound Set 4 (Mechanical Clicks)' },
    { val: 5, text: '5: Sound Set 5 (Fantasy Chimes)' },
    { val: 6, text: '6: Sound Set 6 (Retro 8-Bit Arcade)' },
    { val: 7, text: '7: Sound Set 7 (Classical Orchestral)' }
  ];
  seOptions.forEach((opt) => {
    const o = document.createElement('option');
    o.value = opt.val;
    o.textContent = opt.text;
    seSelect.appendChild(o);
  });
  seSelect.value = String(gameData.se_set ?? 0);
  seSelect.addEventListener('change', (e) => {
    gameData.se_set = parseInt(e.target.value, 10) || 0;
    if (updateCallback) updateCallback();
  });

  settingsSection.appendChild(seLabel);
  settingsSection.appendChild(seSelect);
  container.appendChild(settingsSection);

  // Section 2: Delivery Checkboxes (event_flag[78])
  const deliveryHeader = document.createElement('div');
  deliveryHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;';

  const subtitle = document.createElement('div');
  subtitle.style.cssText = 'font-size: 0.75rem; color: var(--pico-muted-color);';
  subtitle.textContent = 'Sets marked as delivered will be available in Connell\'s Sound Change studio in Castle HQ.';

  const btnToolbar = document.createElement('div');
  btnToolbar.style.cssText = 'display: flex; gap: 0.5rem; margin-left: auto;';

  const deliverAllBtn = document.createElement('button');
  deliverAllBtn.type = 'button';
  deliverAllBtn.className = 'outline';
  deliverAllBtn.textContent = '✓ Deliver All 7 Sets';
  deliverAllBtn.style.cssText = 'font-size: 0.75rem; padding: 0.25rem 0.65rem; margin-bottom: 0;';

  const clearAllBtn = document.createElement('button');
  clearAllBtn.type = 'button';
  clearAllBtn.className = 'secondary outline';
  clearAllBtn.textContent = '✗ Clear All';
  clearAllBtn.style.cssText = 'font-size: 0.75rem; padding: 0.25rem 0.65rem; margin-bottom: 0;';

  btnToolbar.appendChild(deliverAllBtn);
  btnToolbar.appendChild(clearAllBtn);
  deliveryHeader.appendChild(subtitle);
  deliveryHeader.appendChild(btnToolbar);
  container.appendChild(deliveryHeader);

  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.5rem;';

  const checkboxMap = new Map();

  SOUND_SET_DEFS.forEach((s) => {
    const card = document.createElement('label');
    card.style.cssText = 'display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.8rem; padding: 0.5rem 0.65rem; background: rgba(0,0,0,0.15); border-radius: 4px; cursor: pointer; margin-bottom: 0; border: 1px solid rgba(255,255,255,0.04);';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.style.marginTop = '0.2rem';
    cb.style.marginBottom = '0';

    const flagVal = Number(data.event_flag[78]) || 0;
    cb.checked = (flagVal & s.mask) !== 0;

    cb.addEventListener('change', (e) => {
      let currentVal = Number(data.event_flag[78]) || 0;
      if (e.target.checked) {
        currentVal |= s.mask;
      } else {
        currentVal &= ~s.mask;
      }
      data.event_flag[78] = currentVal;
      updateBadge();
      if (updateCallback) updateCallback();
    });

    const info = document.createElement('div');
    info.style.cssText = 'display: flex; flex-direction: column; gap: 0.15rem;';
    const nameSpan = document.createElement('span');
    nameSpan.style.fontWeight = 'bold';
    nameSpan.textContent = `${s.name} (Bit ${Math.log2(s.mask)})`;
    const descSpan = document.createElement('span');
    descSpan.style.cssText = 'font-size: 0.7rem; color: var(--pico-muted-color);';
    descSpan.textContent = s.desc;

    info.appendChild(nameSpan);
    info.appendChild(descSpan);
    card.appendChild(cb);
    card.appendChild(info);
    grid.appendChild(card);

    checkboxMap.set(s.mask, cb);
  });

  deliverAllBtn.addEventListener('click', () => {
    let currentVal = Number(data.event_flag[78]) || 0;
    currentVal |= 0x7F; // All 7 bits
    data.event_flag[78] = currentVal;
    SOUND_SET_DEFS.forEach((s) => {
      const cb = checkboxMap.get(s.mask);
      if (cb) cb.checked = true;
    });
    updateBadge();
    if (updateCallback) updateCallback();
  });

  clearAllBtn.addEventListener('click', () => {
    let currentVal = Number(data.event_flag[78]) || 0;
    currentVal &= ~0x7F;
    data.event_flag[78] = currentVal;
    SOUND_SET_DEFS.forEach((s) => {
      const cb = checkboxMap.get(s.mask);
      if (cb) cb.checked = false;
    });
    updateBadge();
    if (updateCallback) updateCallback();
  });

  container.appendChild(grid);
  updateBadge();
  return container;
}
