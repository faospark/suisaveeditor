import GameData from '../gamedata.js';

/**
 * Creates the key items editor interface
 * Displays special quest/story items in a 2-column grid
 * 
 * @param {Array<number>} arr - Array of key item IDs (6 slots)
 * @param {string} key - Label for the editor section
 * @param {Function} updateCallback - Callback function when values change
 * @returns {HTMLElement} - The key items editor container
 */
export function createKeyItemsEditor(arr, key, updateCallback) {
  const container = document.createElement('div');
  container.className = ' key-items-editor';
  container.id = 'key-items-editor';
  container.style.cssText = 'padding: 1rem; background: rgba(0, 0, 0, 0.1); border-radius: 6px;';

  const label = document.createElement('label');
  label.textContent = key;
  label.style.cssText = 'font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem;';
  container.appendChild(label);

  const gridContainer = document.createElement('div');
  gridContainer.className='two-css-col w-100';

  // Key item IDs: 29 (Blinking Mirror), 35-46, 51-55, 72-74
  const keyItemIds = [
    29, // Blinking Mirror
    35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, // Range 35-46
    51, 52, 53, 54, 55, // Range 51-55
    72, 73, 74 // Range 72-74
  ];

  // Only show first 6 slots (rest might be unused)
  for (let index = 0; index < Math.min(arr.length, 6); index++) {
    const itemId = arr[index];
    const slotDiv = document.createElement('div');
    slotDiv.className = 'json-item';
    slotDiv.style.cssText = 'margin-bottom: 0.5rem; display: flex; gap: 0.5rem; align-items: center;';

    const slotLabel = document.createElement('label');
    slotLabel.textContent = `Slot ${index + 1}`;
    slotLabel.style.cssText = 'min-width: 60px; margin-bottom: 0;';
    slotDiv.appendChild(slotLabel);

    // Dropdown for key items
    const select = document.createElement('select');
    select.style.cssText = 'flex: 1; margin-bottom: 0;';

    // Add "None" option
    const noneOption = document.createElement('option');
    noneOption.value = 0;
    noneOption.textContent = '0: None';
    select.appendChild(noneOption);

    // Add key item options
    keyItemIds.forEach(id => {
      const item = GameData && GameData.ITEMS && GameData.ITEMS[id];
      let itemName;
      
      if (item) {
        // Handle both string format and object format
        itemName = typeof item === 'string' ? item : (item.name || `Unknown Item ${id}`);
      } else {
        itemName = `Unknown Item ${id}`;
      }
      
      const option = document.createElement('option');
      option.value = id;
      option.textContent = `${id}: ${itemName}`;
      select.appendChild(option);
    });

    select.value = itemId;

    select.addEventListener('change', (e) => {
      arr[index] = parseInt(e.target.value);
    });

    slotDiv.appendChild(select);
    gridContainer.appendChild(slotDiv);
  }

  container.appendChild(gridContainer);
  return container;
}
