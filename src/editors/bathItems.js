import GameData from '../gamedata.js';

/**
 * Creates the bath items editor interface for Dunan Castle Bath House.
 * Handles paintings (slots 2, 5) and ornaments (slots 0, 1, 3, 4, 6, 7) with automatic use_cnt = 64.
 * 
 * @param {Array<Object>} arr - Array of bath item objects
 * @param {string} key - Label for the editor section
 * @param {Function} updateCallback - Callback function when values change
 * @returns {HTMLElement} - The bath items editor container
 */
export function createBathItemsEditor(arr, key, updateCallback) {
  const container = document.createElement('div');
  container.className = 'bath-items-editor-section';
  container.style.cssText = 'margin-bottom: 1.25rem; padding: 0.85rem 1rem; background: rgba(0,0,0,0.12); border: 1px solid var(--pico-muted-border-color); border-radius: 6px;';

  // Section Header
  const title = document.createElement('h4');
  title.style.cssText = 'margin: 0 0 0.35rem 0; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;';
  title.innerHTML = `<span>🛁 Castle Bath House Items (${arr.length} slots)</span>`;
  container.appendChild(title);

  // Description
  const description = document.createElement('p');
  description.style.cssText = 'font-size: 0.75rem; color: var(--pico-muted-color); margin-bottom: 0.85rem;';
  description.innerHTML = `Configure artwork and decorative items displayed in the Dunan Castle Bath House. Paintings occupy <strong>Slots 2 &amp; 5</strong>; antique ornaments decorate the Girl's and Boy's sides (automatically assigned Trade item category <code>use_cnt: 64</code>).`;
  container.appendChild(description);

  // Define item groups
  const paintingItems = [{ id: 0, name: 'None' }];

  // Dynamically load paintings from GameData.TRADE
  if (typeof GameData !== 'undefined' && GameData.TRADE) {
    // Original paintings (18-22)
    for (let id = 18; id <= 22; id++) {
      if (GameData.TRADE[id]) {
        paintingItems.push({ id: id, name: GameData.TRADE[id] });
      }
    }
    // New Karen paintings (42-44)
    for (let id = 42; id <= 44; id++) {
      if (GameData.TRADE[id]) {
        paintingItems.push({ id: id, name: GameData.TRADE[id] });
      }
    }
  }

  // Ornament items (exclude paintings 18-22, 42-44 and consumables 23-41)
  const ornamentItems = [];
  if (typeof GameData !== 'undefined' && GameData.TRADE) {
    for (let id in GameData.TRADE) {
      const numId = parseInt(id);
      // Include: 0, 1-17 (ornaments), 45-50 (statues and vases)
      if (numId === 0 || (numId >= 1 && numId <= 17) || (numId >= 45 && numId <= 50)) {
        ornamentItems.push({ id: numId, name: GameData.TRADE[id] });
      }
    }
  }

  // Define sections
  const sections = [
    { title: 'Paintings', indices: [2, 5], items: paintingItems, icon: '🖼️' },
    { title: "Girl's Side (Left Ornaments)", indices: [0, 1, 3], items: ornamentItems, icon: '🌸' },
    { title: "Boy's Side (Right Ornaments)", indices: [4, 6, 7], items: ornamentItems, icon: '⚔️' }
  ];

  // Helper to create slot item row
  const createSlotRow = (index, itemsList) => {
    const item = arr[index] || { item_no: 0, use_cnt: 64 };
    const row = document.createElement('div');
    row.className = 'json-item';
    row.style.cssText = 'display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.4rem;';

    const label = document.createElement('label');
    label.textContent = `Slot ${index}:`;
    label.style.cssText = 'min-width: 65px; font-weight: 600; font-size: 0.78rem; margin-bottom: 0;';
    row.appendChild(label);

    const select = document.createElement('select');
    select.style.cssText = 'flex: 1; margin-bottom: 0; font-size: 0.78rem; padding: 0.25rem 0.5rem;';

    itemsList.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.id;
      option.textContent = `${opt.id}: ${opt.name}`;
      if (item.item_no === opt.id) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      item.item_no = parseInt(e.target.value) || 0;
      item.use_cnt = 64; // Automatically set use_cnt to 64
      if (updateCallback) updateCallback();
    });

    // Ensure use_cnt is 64
    if (item.use_cnt !== 64) {
      item.use_cnt = 64;
    }

    row.appendChild(select);
    return row;
  };

  // 1. Paintings section (Slots 2 & 5 side by side)
  const paintingsSection = sections[0];
  const paintingDiv = document.createElement('div');
  paintingDiv.style.cssText = 'margin-bottom: 0.75rem; padding: 0.65rem 0.75rem; background: rgba(0,0,0,0.1); border-radius: 6px;';

  const paintingTitle = document.createElement('strong');
  paintingTitle.innerHTML = `${paintingsSection.icon} ${paintingsSection.title} <span style="font-size: 0.7rem; color: var(--pico-muted-color); font-weight: normal;">(Slots 2 &amp; 5)</span>`;
  paintingTitle.style.cssText = 'display: block; margin-bottom: 0.5rem; font-size: 0.82rem; color: var(--pico-primary);';
  paintingDiv.appendChild(paintingTitle);

  const paintingsGrid = document.createElement('div');
  paintingsGrid.className = 'bath-paintings-grid';
  paintingsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;';

  paintingsSection.indices.forEach(idx => {
    if (idx < arr.length) {
      paintingsGrid.appendChild(createSlotRow(idx, paintingsSection.items));
    }
  });

  paintingDiv.appendChild(paintingsGrid);
  container.appendChild(paintingDiv);

  // 2. Ornaments section (Girl's Side & Boy's Side in 2 columns)
  const ornamentsContainer = document.createElement('div');
  ornamentsContainer.className = 'bath-ornaments-grid';
  ornamentsContainer.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;';

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const sectionDiv = document.createElement('div');
    sectionDiv.style.cssText = 'padding: 0.65rem 0.75rem; background: rgba(0,0,0,0.1); border-radius: 6px;';

    const sectionTitle = document.createElement('strong');
    sectionTitle.innerHTML = `${section.icon} ${section.title}`;
    sectionTitle.style.cssText = 'display: block; margin-bottom: 0.5rem; font-size: 0.82rem; color: var(--pico-primary);';
    sectionDiv.appendChild(sectionTitle);

    section.indices.forEach(idx => {
      if (idx < arr.length) {
        sectionDiv.appendChild(createSlotRow(idx, section.items));
      }
    });

    ornamentsContainer.appendChild(sectionDiv);
  }

  container.appendChild(ornamentsContainer);
  return container;
}
