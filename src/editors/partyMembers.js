import GameData from '../gamedata.js';

/**
 * Creates the party members editor interface
 * Allows selection of battle party (6 slots, IDs 1-83) and convoy (2 slots, IDs 1-124)
 * 
 * @param {Array<number>} arr - Array of character IDs (8 slots: 6 battle + 2 convoy)
 * @param {string} key - Label for the editor section
 * @param {Function} updateCallback - Callback function when values change
 * @returns {HTMLElement} - The party members editor container
 */
export function createPartyMembersEditor(arr, key, updateCallback) {
  const container = document.createElement('div');
  container.className = 'party-members-section';
  // container.style.cssText = 'margin-bottom: 2rem; padding: 1rem; background: var(--pico-card-sectioning-background-color); border-radius: 6px;';

  const title = document.createElement('h3');
  title.textContent = key;
  // title.style.cssText = 'margin-top: 0; margin-bottom: 0.5rem; color: var(--pico-primary);';
  container.appendChild(title);

  const description = document.createElement('p');
  description.style.cssText = 'font-size: 0.875rem; color: var(--pico-muted-color); margin-bottom: 1rem;';
  description.textContent = 'First 6 slots are battle characters (0-83 only), last 2 slots are convoy members (full roster 0-124).';
  container.appendChild(description);

  const gridContainer = document.createElement('div');
  gridContainer.className = 'party-members-grid';
  // gridContainer.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;';

  // Only show 8 slots (6 battle + 2 convoy)
  for (let index = 0; index < Math.min(arr.length, 8); index++) {
    const charId = arr[index];
    const slotDiv = document.createElement('div');
    slotDiv.className = 'json-item';
    slotDiv.style.cssText = 'margin-bottom: 0;';

    const label = document.createElement('label');
    if (index < 6) {
      label.textContent = `Battle Slot ${index + 1}`;
    } else {
      label.textContent = `Convoy ${index - 5}`;
    }
    slotDiv.appendChild(label);

    // Dropdown for characters
    const select = document.createElement('select');
    select.style.cssText = 'flex: 1; margin-bottom: 0;';

    // Add "None" option
    const noneOption = document.createElement('option');
    noneOption.value = 0;
    noneOption.textContent = '0: None';
    select.appendChild(noneOption);

    // Build options based on slot type
    if (index < 6) {
      // Battle slots: 1-83 only (playable battle characters)
      for (let id = 1; id <= 83; id++) {
        const char = GameData && GameData.CHARACTERS && GameData.CHARACTERS[id];
        if (char) {
          const option = document.createElement('option');
          option.value = id;
          option.textContent = `${id}: ${char.name}`;
          select.appendChild(option);
        }
      }
    } else {
      // Convoy slots: Full roster 0-124
      if (GameData && GameData.CHARACTERS) {
        Object.keys(GameData.CHARACTERS).forEach(id => {
          const numId = parseInt(id);
          const char = GameData.CHARACTERS[numId];
          if (char && numId > 0) {
            const option = document.createElement('option');
            option.value = numId;
            option.textContent = `${numId}: ${char.name}`;
            select.appendChild(option);
          }
        });
      }
    }

    select.value = charId;

    select.addEventListener('change', (e) => {
      arr[index] = parseInt(e.target.value);
    });

    slotDiv.appendChild(select);
    gridContainer.appendChild(slotDiv);
  }

  container.appendChild(gridContainer);
  return container;
}
