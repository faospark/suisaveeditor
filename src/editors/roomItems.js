import GameData from '../gamedata.js';

/**
 * Creates the room items editor interface
 * Simple 8-item storage with standard item selection
 * 
 * @param {Array<Object>} arr - Array of room item objects
 * @param {string} key - Label for the editor section
 * @param {Function} updateCallback - Callback function when values change
 * @returns {HTMLElement} - The room items editor container
 */
export function createRoomItemsEditor(arr, key, updateCallback) {
  const details = document.createElement('details');
  details.open = true;
  details.className = 'json-array';

  const summary = document.createElement('summary');
  summary.textContent = key + ` [${arr.length}]`;
  details.appendChild(summary);

  // Add warning description
  const description = document.createElement('p');
  description.style.cssText = 'font-size: 0.85rem; color: var(--pico-color-amber-500); margin-bottom: 1rem; padding: 0.5rem; background: rgba(255, 193, 7, 0.1); border-left: 3px solid var(--pico-color-amber-500); border-radius: 4px;';
  description.innerHTML = `<strong>⚠️ Use at Your Own Risk:</strong> Room items functionality is experimental. The effect of these values on the game is not fully understood.`;
  details.appendChild(description);

  // Create 2-column layout
  const mainContainer = document.createElement('div');
  mainContainer.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;';

  // Split items into two columns
  const leftColumn = document.createElement('div');
  leftColumn.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem;';
  
  const rightColumn = document.createElement('div');
  rightColumn.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem;';

  arr.forEach((item, index) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'json-item';
    rowDiv.style.cssText = 'display: grid; grid-template-columns: 70px 2fr 90px 110px 90px; gap: 0.5rem; align-items: center; padding: 0.5rem; background: rgba(0,0,0,0.05); border-radius: 4px;';

    // Slot number
    const slotLabel = document.createElement('span');
    slotLabel.style.cssText = 'font-weight: 600; color: var(--pico-primary); font-size: 0.9rem;';
    slotLabel.textContent = `Slot ${index}`;
    rowDiv.appendChild(slotLabel);

    // Item name display
    const itemName = document.createElement('span');
    itemName.style.cssText = 'font-size: 0.9rem; color: var(--pico-muted-color); font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
    
    const updateItemName = () => {
      const id = parseInt(item.item_no) || 0;
      
      if (id === 0) {
        itemName.textContent = 'None';
        categorySpan.textContent = '-';
        return;
      }

      // Search for item in GameData
      let foundItem = null;
      let foundCategory = null;
      
      if (typeof GameData !== 'undefined') {
        const categories = ['ITEMS', 'MEDICINE', 'BOOK', 'CRYSTAL', 'WEAPON', 'ARMOR', 'ACCESSORY', 'TRADE'];
        for (const category of categories) {
          if (GameData[category] && GameData[category][id]) {
            foundItem = GameData[category][id];
            foundCategory = category.toLowerCase();
            break;
          }
        }
      }

      if (foundItem) {
        itemName.textContent = foundItem;
        categorySpan.textContent = foundCategory;
      } else {
        itemName.textContent = `Unknown Item`;
        categorySpan.textContent = '-';
      }
    };

    rowDiv.appendChild(itemName);

    // Item ID input
    const idInput = document.createElement('input');
    idInput.type = 'number';
    idInput.min = '0';
    idInput.value = item.item_no || 0;
    idInput.style.cssText = 'margin-bottom: 0; text-align: center;';
    idInput.addEventListener('input', (e) => {
      item.item_no = parseInt(e.target.value) || 0;
      updateItemName();
    });
    rowDiv.appendChild(idInput);

    // Category display
    const categorySpan = document.createElement('span');
    categorySpan.style.cssText = 'font-size: 0.85rem; color: var(--pico-muted-color); text-align: center;';
    rowDiv.appendChild(categorySpan);

    // Count input
    const cntInput = document.createElement('input');
    cntInput.type = 'number';
    cntInput.min = '0';
    cntInput.value = item.use_cnt || 0;
    cntInput.style.cssText = 'margin-bottom: 0; text-align: center;';
    cntInput.addEventListener('input', (e) => {
      item.use_cnt = parseInt(e.target.value) || 0;
    });
    rowDiv.appendChild(cntInput);

    updateItemName();
    
    // Add to left or right column
    if (index < 4) {
      leftColumn.appendChild(rowDiv);
    } else {
      rightColumn.appendChild(rowDiv);
    }
  });

  mainContainer.appendChild(leftColumn);
  mainContainer.appendChild(rightColumn);
  details.appendChild(mainContainer);

  return details;
}
