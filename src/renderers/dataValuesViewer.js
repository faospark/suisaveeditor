import GameData from '../gamedata.js';

/**
 * Creates the data values viewer - displays reference data tables for all game items
 * Includes characters, items, equipment, runes, and a PayPal donate button
 * 
 * @param {HTMLElement} container - The container element to render into
 */
export function createDataValuesViewer(container) {
  container.innerHTML = '';
  container.className = 'tab-content data-values-content';

  if (typeof GameData === 'undefined') {
    container.innerHTML = '<p>GameData not loaded.</p>';
    return;
  }

  // Add intro text
  const intro = document.createElement('p');
  intro.style.cssText = 'margin-bottom: 1rem; color: var(--pico-muted-color);';
  intro.innerHTML = '<strong>Reference Data:</strong> Item IDs, character names, and use_cnt classifications for the save file editor.';
  container.appendChild(intro);

  // Define categories with their use_cnt information
  const categories = [
    { name: 'CHARACTERS', data: GameData.CHARACTERS, info: 'Character names by index (0-125)' },
    { name: 'ITEMS', data: GameData.ITEMS, info: 'Consumable items (use_cnt: 0-9)' },
    { name: 'FARMING', data: GameData.FARMING, info: 'Farm items (use_cnt: 48)' },
    { name: 'TRADE', data: GameData.TRADE, info: 'Trade goods (use_cnt: 64)' },
    { name: 'BASE_ITEM', data: GameData.BASE_ITEM, info: 'Warehouse items (use_cnt: 80)' },
    { name: 'FOOD', data: GameData.FOOD, info: 'Food recipes (use_cnt: 99+)' },
    { name: 'RUNES', data: GameData.RUNES, info: 'Rune orbs (use_cnt: 32)' },
    { name: 'HELMET', data: GameData.HELMET, info: 'Helmets (use_cnt: 16)' },
    { name: 'ARMOR', data: GameData.ARMOR, info: 'Armor (use_cnt: 16)' },
    { name: 'SHIELD', data: GameData.SHIELD, info: 'Shields (use_cnt: 16)' },
    { name: 'OTHER_EQUIP_GEAR', data: GameData.OTHER_EQUIP_GEAR, info: 'Accessories (use_cnt: 16)' }
  ];

  categories.forEach(category => {
    if (!category.data) return;

    const details = document.createElement('details');
    details.className = 'json-object';

    const summary = document.createElement('summary');
    summary.innerHTML = `<strong>${category.name}</strong> - ${category.info}`;
    details.appendChild(summary);

    const listContainer = document.createElement('div');
    listContainer.className = 'data-values-list';

    const entries = Object.entries(category.data);
    entries.forEach(([id, itemData]) => {
      const item = document.createElement('div');
      item.className = 'data-values-item';

      const idSpan = document.createElement('span');
      idSpan.className = 'id';
      idSpan.textContent = id + ':';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';

      // Handle both object format (CHARACTERS, ARMOR) and string format (other items)
      if (typeof itemData === 'object' && itemData !== null && itemData.name) {
        // Object format with name property
        nameSpan.textContent = itemData.name;

        // Optionally show attributes for CHARACTERS and ARMOR
        if (itemData.attrs && itemData.attrs.length > 0) {
          const attrsSpan = document.createElement('span');
          attrsSpan.className = 'attrs';
          attrsSpan.style.cssText = 'margin-left: 0.5rem; font-size: 0.85rem; color: var(--pico-muted-color); font-style: italic;';
          attrsSpan.textContent = `[${itemData.attrs.join(', ')}]`;
          nameSpan.appendChild(attrsSpan);
        }
      } else {
        // Simple string format
        nameSpan.textContent = itemData;
      }

      item.appendChild(idSpan);
      item.appendChild(nameSpan);
      listContainer.appendChild(item);
    });

    details.appendChild(listContainer);
    container.appendChild(details);
  });

  // Add PayPal Donate Button at the bottom
  const donateContainer = document.createElement('div');
  donateContainer.style.cssText = 'text-align: center; margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #f5d020 0%, #f0b90b 100%); border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';

  const donateText = document.createElement('p');
  donateText.style.cssText = 'margin: 0 0 1rem 0; font-size: 0.9rem; color: #000; font-weight: 600;';
  donateText.textContent = '☕ Enjoying this editor? Support development!';
  donateContainer.appendChild(donateText);

  const donateButton = document.createElement('a');
  donateButton.href = 'https://paypal.me/thefaospark?country.x=PH&locale.x=en_US';
  donateButton.target = '_blank';
  donateButton.rel = 'noopener noreferrer';
  donateButton.textContent = '💛 Donate via PayPal';
  donateButton.style.cssText = 'display: inline-block; padding: 0.75rem 2rem; background: #000; color: #f5d020; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 1rem; transition: all 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);';

  donateButton.addEventListener('mouseenter', () => {
    donateButton.style.transform = 'translateY(-2px)';
    donateButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
  });

  donateButton.addEventListener('mouseleave', () => {
    donateButton.style.transform = 'translateY(0)';
    donateButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  });

  donateContainer.appendChild(donateButton);
  container.appendChild(donateContainer);
}
