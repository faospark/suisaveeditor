import GameData from '../gamedata.js';
import { EDITOR_LABELS } from '../config/schema.js';

/**
 * Creates a smart item picker modal dialog
 * Allows user to select item type first, search/filter, and choose a specific item.
 * Automatically sets both item_no and use_cnt.
 * Includes a search filter and "✕ Clear Slot" button.
 */
function createItemPickerDialog(currentItemNo, currentUseCnt, onSelect) {
  const dialog = document.createElement('dialog');
  dialog.style.cssText = 'max-width: 800px; max-height: 85vh; padding: 0; border: none; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-size: 0.75rem;';
  
  const content = document.createElement('article');
  content.style.cssText = 'margin: 0; padding: 1rem; display: flex; flex-direction: column; height: 100%; max-height: 80vh; font-size: 0.75rem;';
  
  // Header
  const header = document.createElement('header');
  header.style.marginBottom = '0.75rem';
  const title = document.createElement('h3');
  title.textContent = 'Select Item';
  title.style.cssText = 'margin: 0; font-size: 1rem;';
  header.appendChild(title);
  content.appendChild(header);
  
  // Main container - side by side layout
  const mainContainer = document.createElement('div');
  mainContainer.style.cssText = 'display: grid; grid-template-columns: 200px 1fr; gap: 1rem; flex: 1; overflow: hidden;';
  
  // Left side - Item Type Checkboxes
  const typeContainer = document.createElement('div');
  typeContainer.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem; border: 1px solid var(--pico-muted-border-color); border-radius: 4px; overflow-y: auto;';
  
  const typeLabel = document.createElement('label');
  typeLabel.textContent = 'Item Type:';
  typeLabel.style.cssText = 'font-weight: bold; margin-bottom: 0.25rem; font-size: 0.75rem;';
  typeContainer.appendChild(typeLabel);
  
  const itemTypes = [
    { value: '0', label: 'Regular Items', desc: 'use_cnt: 0-9' },
    { value: '16', label: 'Equipment', desc: 'use_cnt: 16' },
    { value: '32', label: 'Runes', desc: 'use_cnt: 32' },
    { value: '48', label: 'Farming Items', desc: 'use_cnt: 48' },
    { value: '64', label: 'Trade Items', desc: 'use_cnt: 64' },
    { value: '80', label: 'Base/Warehouse', desc: 'use_cnt: 80' },
    { value: '101', label: 'Food Items', desc: 'use_cnt: 101-106' }
  ];

  // Determine initial type selection from current slot use_cnt
  let initialType = '0';
  if (currentUseCnt === 16) initialType = '16';
  else if (currentUseCnt === 32) initialType = '32';
  else if (currentUseCnt === 48) initialType = '48';
  else if (currentUseCnt === 64) initialType = '64';
  else if (currentUseCnt === 80) initialType = '80';
  else if (currentUseCnt >= 99) initialType = '101';
  else initialType = '0';
  
  let selectedType = initialType;
  const checkboxes = [];
  
  itemTypes.forEach(type => {
    const checkboxLabel = document.createElement('label');
    checkboxLabel.style.cssText = 'display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; padding: 0.25rem; border-radius: 4px; font-size: 0.75rem;';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = type.value;
    checkbox.checked = (type.value === initialType);
    checkbox.style.cssText = 'margin: 0.25rem 0 0 0; flex-shrink: 0;';
    checkboxes.push(checkbox);
    
    const labelText = document.createElement('div');
    labelText.style.fontSize = '0.75rem';
    labelText.innerHTML = `<strong>${type.label}</strong><br><span style="color: var(--pico-muted-color); font-size: 0.7rem;">${type.desc}</span>`;
    
    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(labelText);
    typeContainer.appendChild(checkboxLabel);
    
    // Single selection behavior
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        checkboxes.forEach(cb => {
          if (cb !== e.target) cb.checked = false;
        });
        selectedType = type.value;
        updateItemList(selectedType);
      } else {
        selectedType = null;
        updateItemList(null);
      }
    });
  });
  
  mainContainer.appendChild(typeContainer);
  
  // Right side - Search + Item List Container (scrollable)
  const rightColumn = document.createElement('div');
  rightColumn.style.cssText = 'display: flex; flex-direction: column; overflow: hidden;';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Search by name or ID...';
  searchInput.style.cssText = 'font-size: 0.75rem; padding: 0.35rem 0.6rem; margin-bottom: 0.5rem;';
  rightColumn.appendChild(searchInput);

  const listContainer = document.createElement('div');
  listContainer.style.cssText = 'overflow-y: auto; flex: 1; border: 1px solid var(--pico-muted-border-color); border-radius: 4px; padding: 0.5rem; font-size: 0.75rem;';
  rightColumn.appendChild(listContainer);
  
  mainContainer.appendChild(rightColumn);
  content.appendChild(mainContainer);
  
  // Helper to extract name from object/string format
  const extractName = (value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null && value.name) return value.name;
    return null;
  };
  
  // Helper to get use_cnt for food items based on item_no
  const getFoodUseCnt = (itemNo) => {
    const foodItem = GameData.FOOD?.[itemNo];
    if (foodItem && foodItem.attrs && foodItem.attrs.length > 0) {
      return foodItem.attrs[0];
    }
    return 101; // Default
  };

  let allLoadedItems = [];

  const renderItemsList = (itemsToRender) => {
    listContainer.innerHTML = '';

    if (!itemsToRender || itemsToRender.length === 0) {
      listContainer.innerHTML = '<p style="text-align: center; color: var(--pico-muted-color); font-size: 0.75rem; margin: 1rem 0;">No items found</p>';
      return;
    }

    itemsToRender.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.style.cssText = 'padding: 0.4rem; margin: 0.2rem 0; cursor: pointer; border-radius: 4px; border: 1px solid transparent; font-size: 0.75rem; display: flex; justify-content: space-between; align-items: center;';
      
      const isCurrent = (item.id === currentItemNo) && (item.useCnt === currentUseCnt || selectedType === '16');
      if (isCurrent) {
        itemDiv.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
        itemDiv.style.borderColor = 'var(--pico-primary)';
      }

      itemDiv.innerHTML = `<span><strong>${item.id}:</strong> ${item.name}</span> <span style="color: var(--pico-muted-color); font-size: 0.7rem;">(use: ${item.useCnt})</span>`;
      
      itemDiv.addEventListener('mouseenter', () => {
        if (!isCurrent) {
          itemDiv.style.backgroundColor = 'var(--pico-primary-background)';
          itemDiv.style.borderColor = 'var(--pico-primary)';
        }
      });
      
      itemDiv.addEventListener('mouseleave', () => {
        if (!isCurrent) {
          itemDiv.style.backgroundColor = '';
          itemDiv.style.borderColor = 'transparent';
        }
      });
      
      itemDiv.addEventListener('click', () => {
        onSelect(item.id, item.useCnt);
        dialog.close();
        setTimeout(() => dialog.remove(), 100);
      });
      
      listContainer.appendChild(itemDiv);
    });
  };

  const applySearchFilter = () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      renderItemsList(allLoadedItems);
    } else {
      const filtered = allLoadedItems.filter(it => 
        String(it.id).includes(query) || it.name.toLowerCase().includes(query)
      );
      renderItemsList(filtered);
    }
  };

  searchInput.addEventListener('input', applySearchFilter);
  
  // Build item list based on selected type
  const updateItemList = (type) => {
    if (!type) {
      allLoadedItems = [];
      listContainer.innerHTML = '<p style="text-align: center; color: var(--pico-muted-color); font-size: 0.75rem; margin: 1rem 0;">Select an item type</p>';
      return;
    }
    
    let items = [];
    
    if (type === '0') {
      // Regular Items
      Object.entries(GameData.ITEMS || {}).forEach(([id, item]) => {
        const name = extractName(item);
        if (name) items.push({ id: parseInt(id), name, useCnt: item.attrs?.[0] || 0 });
      });
    } else if (type === '16') {
      // Equipment - combine all equipment types
      const seenIds = new Set();
      
      Object.entries(GameData.HELMET || {}).forEach(([id, item]) => {
        const name = extractName(item);
        const itemId = parseInt(id);
        if (name && !seenIds.has(itemId)) {
          items.push({ id: itemId, name: itemId === 0 ? name : `[Helmet] ${name}`, useCnt: 16 });
          seenIds.add(itemId);
        }
      });
      Object.entries(GameData.ARMOR || {}).forEach(([id, item]) => {
        const name = extractName(item);
        const itemId = parseInt(id);
        if (name && !seenIds.has(itemId)) {
          items.push({ id: itemId, name: `[Armor] ${name}`, useCnt: 16 });
          seenIds.add(itemId);
        }
      });
      Object.entries(GameData.SHIELD || {}).forEach(([id, item]) => {
        const name = extractName(item);
        const itemId = parseInt(id);
        if (name && !seenIds.has(itemId)) {
          items.push({ id: itemId, name: `[Shield] ${name}`, useCnt: 16 });
          seenIds.add(itemId);
        }
      });
      Object.entries(GameData.OTHER_EQUIP_GEAR || {}).forEach(([id, item]) => {
        const name = extractName(item);
        const itemId = parseInt(id);
        if (name && !seenIds.has(itemId)) {
          items.push({ id: itemId, name: `[Accessory] ${name}`, useCnt: 16 });
          seenIds.add(itemId);
        }
      });
    } else if (type === '32') {
      // Runes
      Object.entries(GameData.RUNES || {}).forEach(([id, item]) => {
        const name = extractName(item);
        if (name) items.push({ id: parseInt(id), name, useCnt: 32 });
      });
    } else if (type === '48') {
      // Farming
      Object.entries(GameData.FARMING || {}).forEach(([id, item]) => {
        const name = extractName(item);
        if (name) items.push({ id: parseInt(id), name, useCnt: 48 });
      });
    } else if (type === '64') {
      // Trade
      Object.entries(GameData.TRADE || {}).forEach(([id, item]) => {
        const name = extractName(item);
        if (name) items.push({ id: parseInt(id), name, useCnt: 64 });
      });
    } else if (type === '80') {
      // Base/Warehouse
      Object.entries(GameData.BASE_ITEM || {}).forEach(([id, item]) => {
        const name = extractName(item);
        if (name) items.push({ id: parseInt(id), name, useCnt: 80 });
      });
    } else if (type === '101') {
      // Food Items
      Object.entries(GameData.FOOD || {}).forEach(([id, item]) => {
        const name = extractName(item);
        if (name && id !== '0') {
          const foodUseCnt = getFoodUseCnt(parseInt(id));
          items.push({ id: parseInt(id), name, useCnt: foodUseCnt });
        }
      });
    }
    
    // Sort by ID
    items.sort((a, b) => a.id - b.id);
    allLoadedItems = items;
    applySearchFilter();
  };

  // Initial load
  if (selectedType) {
    updateItemList(selectedType);
  }
  
  // Footer with Clear and Cancel buttons
  const footer = document.createElement('footer');
  footer.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin: 0; padding-top: 0.75rem; border-top: 1px solid var(--pico-muted-border-color);';
  
  const clearSlotBtn = document.createElement('button');
  clearSlotBtn.type = 'button';
  clearSlotBtn.textContent = '✕ Clear Slot';
  clearSlotBtn.className = 'outline contrast';
  clearSlotBtn.style.cssText = 'font-size: 0.75rem; margin-bottom: 0;';
  clearSlotBtn.addEventListener('click', () => {
    onSelect(0, 0);
    dialog.close();
    setTimeout(() => dialog.remove(), 100);
  });
  footer.appendChild(clearSlotBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'secondary';
  cancelBtn.style.cssText = 'font-size: 0.75rem; margin-bottom: 0;';
  cancelBtn.addEventListener('click', () => {
    dialog.close();
    setTimeout(() => dialog.remove(), 100);
  });
  footer.appendChild(cancelBtn);
  
  content.appendChild(footer);
  dialog.appendChild(content);
  document.body.appendChild(dialog);
  dialog.showModal();
  
  // Handle ESC key
  dialog.addEventListener('cancel', () => {
    setTimeout(() => dialog.remove(), 100);
  });
}

// Helper function to get the correct lookup table based on use_cnt
function getItemLookup(useCnt) {
  if (!GameData) return null;
  if (useCnt === 16) return null; // Equipment handled specially
  if (useCnt === 32) return GameData.RUNES;
  if (useCnt === 48) return GameData.FARMING;
  if (useCnt === 64) return GameData.TRADE;
  if (useCnt === 80) return GameData.BASE_ITEM;
  if (useCnt >= 99) return GameData.FOOD;
  return GameData.ITEMS; // Default fallback for use_cnt 0-9
}

// Helper function to get item type name based on use_cnt
function getItemTypeName(useCnt) {
  if (useCnt === 16) return 'Equipment';
  if (useCnt === 32) return 'Rune';
  if (useCnt === 48) return 'Farming';
  if (useCnt === 64) return 'Trade';
  if (useCnt === 80) return 'Base Item';
  if (useCnt >= 99) return 'Food';
  return 'Regular';
}

// Helper function to get equipment name based on item_no (for use_cnt 16)
function getEquipmentName(itemNo) {
  if (!GameData) return null;

  const extractName = (value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null && value.name) return value.name;
    return null;
  };

  if (GameData.HELMET && GameData.HELMET[itemNo]) return extractName(GameData.HELMET[itemNo]);
  if (GameData.ARMOR && GameData.ARMOR[itemNo]) return extractName(GameData.ARMOR[itemNo]);
  if (GameData.SHIELD && GameData.SHIELD[itemNo]) return extractName(GameData.SHIELD[itemNo]);
  if (GameData.OTHER_EQUIP_GEAR && GameData.OTHER_EQUIP_GEAR[itemNo]) return extractName(GameData.OTHER_EQUIP_GEAR[itemNo]);
  return null;
}

// Helper function to resolve item display information
function resolveItemInfo(itemNo, useCnt) {
  const id = parseInt(itemNo) || 0;
  const cnt = parseInt(useCnt) || 0;

  if (id === 0) {
    return {
      isEmpty: true,
      name: 'None (Empty)',
      type: '',
      meta: ''
    };
  }

  const typeName = getItemTypeName(cnt);
  let name = null;

  if (cnt === 16) {
    name = getEquipmentName(id) || `Unknown Equipment (${id})`;
  } else {
    const lookup = getItemLookup(cnt);
    if (lookup && lookup[id]) {
      const val = lookup[id];
      name = typeof val === 'object' && val !== null && val.name ? val.name : (typeof val === 'string' ? val : null);
    }
    // Fallback search across other GameData tables
    if (!name && GameData) {
      if (GameData.ITEMS && GameData.ITEMS[id]) {
        const val = GameData.ITEMS[id];
        name = typeof val === 'object' && val !== null && val.name ? val.name : (typeof val === 'string' ? val : null);
      } else if (GameData.BASE_ITEM && GameData.BASE_ITEM[id]) {
        const val = GameData.BASE_ITEM[id];
        name = typeof val === 'object' && val !== null && val.name ? val.name : (typeof val === 'string' ? val : null);
      }
    }
  }

  if (!name) {
    name = `Item #${id}`;
  }

  return {
    isEmpty: false,
    name,
    type: typeName,
    meta: `#${id} · use: ${cnt} · ${typeName}`
  };
}

/**
 * Creates a modern 3-column card grid editor for item arrays (Party Bag, Warehouse, Room Items).
 * Renders items in a responsive 3-column layout with vertical (column-first) numbering.
 * Compacts the UI by removing bulky numeric inputs and displaying inline metadata with pick/clear buttons.
 * 
 * @param {Array<Object>} arr - Array of item objects with item_no and use_cnt properties
 * @param {string} key - Label for the editor section
 * @param {Function} updateCallback - Callback function when values change
 * @param {Array<string>} columns - Array of column property names (e.g. ['item_no', 'use_cnt'])
 * @returns {HTMLElement} - The editor container
 */
export function createTableEditor(arr, key, updateCallback, columns) {
  const container = document.createElement('div');
  container.className = 'table-editor-section';

  // Section Header
  const title = document.createElement('h3');
  title.textContent = `${key} [${arr.length}]`;
  title.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1.15rem;';
  container.appendChild(title);

  // Collapsible Classification Guide
  const guide = document.createElement('details');
  guide.style.cssText = 'margin-bottom: 0.75rem; font-size: 0.75rem;';
  const summary = document.createElement('summary');
  summary.style.cssText = 'cursor: pointer; color: var(--pico-muted-color); font-weight: 600; font-size: 0.75rem;';
  summary.textContent = 'ℹ️ Item Type Classification Guide (use_cnt reference)';
  guide.appendChild(summary);

  const guideBody = document.createElement('div');
  guideBody.style.cssText = 'padding: 0.5rem 0.75rem; margin-top: 0.35rem; background: rgba(0,0,0,0.15); border-radius: 4px; color: var(--pico-muted-color); line-height: 1.4;';
  guideBody.innerHTML = `<strong>Item Type Classification by Count:</strong><br>
    • <strong>0–9:</strong> Regular Items (use_cnt = remaining charges / uses)<br>
    • <strong>16:</strong> Equipment (Helmets, Armor, Shields, Accessories)<br>
    • <strong>32:</strong> Runes<br>
    • <strong>48:</strong> Farming Items<br>
    • <strong>64:</strong> Trade / Bath Items<br>
    • <strong>80:</strong> Base / Warehouse Items<br>
    • <strong>99+:</strong> Food Items (specific recipe IDs)`;
  guide.appendChild(guideBody);
  container.appendChild(guide);

  // 3-Column Layout with Vertical (Column-First) Counting
  const gridContainer = document.createElement('div');
  gridContainer.className = 'items-3col-grid';

  const totalItems = arr.length;
  const numColumns = 3;
  const itemsPerCol = Math.ceil(totalItems / numColumns);

  for (let colIndex = 0; colIndex < numColumns; colIndex++) {
    const startIdx = colIndex * itemsPerCol;
    const endIdx = Math.min(startIdx + itemsPerCol, totalItems);

    if (startIdx >= totalItems && totalItems > 0) {
      continue;
    }

    const columnDiv = document.createElement('div');
    columnDiv.className = 'items-column';
    columnDiv.style.cssText = 'display: flex; flex-direction: column; gap: 0.35rem; min-width: 0;';

    // Column Header Badge: e.g. "📦 Slots 1–10"
    if (totalItems > 0) {
      const colHeader = document.createElement('div');
      colHeader.style.cssText = 'font-size: 0.75rem; font-weight: 700; color: var(--pico-muted-color); padding: 0.2rem 0.4rem; border-bottom: 1px solid var(--pico-muted-border-color); margin-bottom: 0.2rem; display: flex; justify-content: space-between; align-items: center;';
      colHeader.innerHTML = `<span>📦 Slots ${startIdx + 1}–${endIdx}</span><span style="font-weight: normal; font-size: 0.7rem; color: var(--pico-muted-color);">${endIdx - startIdx} slots</span>`;
      columnDiv.appendChild(colHeader);
    }

    for (let index = startIdx; index < endIdx; index++) {
      const item = arr[index];

      const slotCard = document.createElement('div');
      slotCard.className = 'item-slot-chip';
      slotCard.id = `${key.toLowerCase().replace(/\s+/g, '-')}-slot-${index}`;

      // Slot number badge
      const slotBadge = document.createElement('span');
      const padLen = totalItems >= 10 ? 2 : 1;
      slotBadge.textContent = `#${String(index + 1).padStart(padLen, '0')}`;
      slotBadge.style.cssText = 'font-weight: 700; font-size: 0.72rem; color: var(--pico-muted-color); min-width: 26px; flex-shrink: 0;';
      slotCard.appendChild(slotBadge);

      // Pick button
      const pickBtn = document.createElement('button');
      pickBtn.type = 'button';
      pickBtn.textContent = '🔍 Pick';
      pickBtn.title = `Pick item for Slot ${index + 1}`;
      pickBtn.className = 'secondary';
      pickBtn.style.cssText = 'padding: 0.2rem 0.45rem; font-size: 0.72rem; margin-bottom: 0; white-space: nowrap; line-height: 1.2; flex-shrink: 0;';
      slotCard.appendChild(pickBtn);

      // Clear button
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'outline secondary';
      clearBtn.textContent = '✕';
      clearBtn.title = `Clear Slot ${index + 1}`;
      clearBtn.style.cssText = 'padding: 0.2rem 0.45rem; font-size: 0.72rem; margin-bottom: 0; line-height: 1.2; flex-shrink: 0;';
      slotCard.appendChild(clearBtn);

      // Details container
      const itemDetails = document.createElement('div');
      itemDetails.style.cssText = 'display: flex; flex-direction: column; min-width: 0; flex: 1; overflow: hidden;';

      const nameSpan = document.createElement('span');
      nameSpan.style.cssText = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.2; font-size: 0.75rem;';

      const metaSpan = document.createElement('span');
      metaSpan.style.cssText = 'font-size: 0.68rem; color: var(--pico-muted-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.2;';

      itemDetails.appendChild(nameSpan);
      itemDetails.appendChild(metaSpan);
      slotCard.appendChild(itemDetails);

      const updateSlotDisplay = () => {
        const id = item.item_no || 0;
        const cnt = item.use_cnt || 0;
        const info = resolveItemInfo(id, cnt);

        if (info.isEmpty) {
          nameSpan.textContent = 'Empty Slot';
          nameSpan.style.fontStyle = 'italic';
          nameSpan.style.color = 'var(--pico-muted-color)';
          nameSpan.style.fontWeight = 'normal';
          metaSpan.textContent = '';
          metaSpan.style.display = 'none';
          clearBtn.style.visibility = 'hidden';
          slotCard.classList.add('empty-slot');
        } else {
          nameSpan.textContent = info.name;
          nameSpan.style.fontStyle = 'normal';
          nameSpan.style.color = 'var(--pico-color)';
          nameSpan.style.fontWeight = '600';
          metaSpan.textContent = info.meta;
          metaSpan.style.display = '';
          clearBtn.style.visibility = 'visible';
          slotCard.classList.remove('empty-slot');
        }
      };

      pickBtn.addEventListener('click', (e) => {
        e.preventDefault();
        createItemPickerDialog(item.item_no, item.use_cnt, (newItemNo, newUseCnt) => {
          item.item_no = newItemNo;
          item.use_cnt = newUseCnt;
          updateSlotDisplay();
          if (updateCallback) updateCallback();
        });
      });

      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        item.item_no = 0;
        item.use_cnt = 0;
        updateSlotDisplay();
        if (updateCallback) updateCallback();
      });

      updateSlotDisplay();
      columnDiv.appendChild(slotCard);
    }

    gridContainer.appendChild(columnDiv);
  }

  container.appendChild(gridContainer);
  return container;
}
