import GameData from '../gamedata.js';

/**
 * Creates the bath items editor interface
 * Handles paintings (slots 2, 5) and ornaments (other slots) with automatic use_cnt=64
 * 
 * @param {Array<Object>} arr - Array of bath item objects
 * @param {string} key - Label for the editor section
 * @param {Function} updateCallback - Callback function when values change
 * @returns {HTMLElement} - The bath items editor container
 */
export function createBathItemsEditor(arr, key, updateCallback) {
  const container = document.createElement('div');
  container.className = 'bath-items-editor-section';

  // Add title
  const title = document.createElement('h3');
  title.textContent = `${key} [${arr.length}]`;
  title.style.cssText = 'margin: 0 0 1rem 0; font-size: 1.25rem;';
  container.appendChild(title);

  // Add description
  const description = document.createElement('p');
  description.style.cssText = 'font-size: 0.85rem; color: var(--pico-muted-color); margin-bottom: 1rem;';
  description.innerHTML = `<strong>Bath Items:</strong> All items use Trade category (use_cnt: 64). Paintings for indices 2 & 5, ornaments for other slots.`;
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

  // Create grouped sections
  const sections = [
    { title: 'Paintings', indices: [2, 5], items: paintingItems, standalone: true },
    { title: "Girl's Side (Left Ornaments)", indices: [0, 1, 3], items: ornamentItems, standalone: false },
    { title: "Boy's Side (Right Ornaments)", indices: [4, 6, 7], items: ornamentItems, standalone: false }
  ];

  // Add Paintings section (standalone)
  const paintingsSection = sections[0];
  const paintingDiv = document.createElement('div');
  paintingDiv.style.cssText = 'margin-bottom: 1.5rem; padding: 0.75rem; background: rgba(0,0,0,0.1); border-radius: 6px;';

  const paintingTitle = document.createElement('h4');
  paintingTitle.textContent = paintingsSection.title;
  paintingTitle.style.cssText = 'margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pico-primary);';
  paintingDiv.appendChild(paintingTitle);

  paintingsSection.indices.forEach(index => {
    if (index >= arr.length) return;

    const item = arr[index];
    const itemDiv = document.createElement('div');
    itemDiv.className = 'json-item';
    itemDiv.style.cssText = 'margin-bottom: 0.5rem;';

    const label = document.createElement('label');
    label.textContent = `Slot ${index}`;
    label.style.cssText = 'min-width: 80px; font-weight: 600;';
    itemDiv.appendChild(label);

    // Create dropdown
    const select = document.createElement('select');
    select.style.cssText = 'flex: 1; margin-bottom: 0;';

    // Add options
    paintingsSection.items.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.id;
      option.textContent = `${opt.id}: ${opt.name}`;
      if (item.item_no === opt.id) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      item.item_no = parseInt(e.target.value);
      item.use_cnt = 64; // Automatically set use_cnt to 64
    });

    itemDiv.appendChild(select);
    paintingDiv.appendChild(itemDiv);

    // Ensure use_cnt is 64
    if (item.use_cnt !== 64) {
      item.use_cnt = 64;
    }
  });

  container.appendChild(paintingDiv);

  // Create container for Girl's and Boy's Side (responsive grid)
  const ornamentsContainer = document.createElement('div');
  ornamentsContainer.style.cssText = 'display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1rem;';
  ornamentsContainer.className = 'bath-ornaments-grid';

  // Add Girl's and Boy's Side sections
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const sectionDiv = document.createElement('div');
    sectionDiv.style.cssText = 'padding: 0.75rem; background: rgba(0,0,0,0.1); border-radius: 6px;';

    const sectionTitle = document.createElement('h4');
    sectionTitle.textContent = section.title;
    sectionTitle.style.cssText = 'margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pico-primary);';
    sectionDiv.appendChild(sectionTitle);

    section.indices.forEach(index => {
      if (index >= arr.length) return;

      const item = arr[index];
      const itemDiv = document.createElement('div');
      itemDiv.className = 'json-item';
      itemDiv.style.cssText = 'margin-bottom: 0.5rem;';

      const label = document.createElement('label');
      label.textContent = `Slot ${index}`;
      label.style.cssText = 'min-width: 80px; font-weight: 600;';
      itemDiv.appendChild(label);

      // Create dropdown
      const select = document.createElement('select');
      select.style.cssText = 'flex: 1; margin-bottom: 0;';

      // Add options
      section.items.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.id;
        option.textContent = `${opt.id}: ${opt.name}`;
        if (item.item_no === opt.id) {
          option.selected = true;
        }
        select.appendChild(option);
      });

      select.addEventListener('change', (e) => {
        item.item_no = parseInt(e.target.value);
        item.use_cnt = 64; // Automatically set use_cnt to 64
      });

      itemDiv.appendChild(select);
      sectionDiv.appendChild(itemDiv);

      // Ensure use_cnt is 64
      if (item.use_cnt !== 64) {
        item.use_cnt = 64;
      }
    });

    ornamentsContainer.appendChild(sectionDiv);
  }

  container.appendChild(ornamentsContainer);

  return container;
}
