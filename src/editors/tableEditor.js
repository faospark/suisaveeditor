import GameData from '../gamedata.js';
import { EDITOR_LABELS } from '../config/schema.js';

/**
 * Creates a smart item picker modal dialog
 * Allows user to select item type first, then choose specific item
 * Automatically sets both item_no and use_cnt
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
  
  let selectedType = null;
  const checkboxes = [];
  
  itemTypes.forEach(type => {
    const checkboxLabel = document.createElement('label');
    checkboxLabel.style.cssText = 'display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; padding: 0.25rem; border-radius: 4px; font-size: 0.75rem;';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = type.value;
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
        listContainer.innerHTML = '<p style="text-align: center; color: var(--pico-muted-color); font-size: 0.75rem;">Select an item type</p>';
      }
    });
  });
  
  mainContainer.appendChild(typeContainer);
  
  // Right side - Item List Container (scrollable)
  const listContainer = document.createElement('div');
  listContainer.style.cssText = 'overflow-y: auto; border: 1px solid var(--pico-muted-border-color); border-radius: 4px; padding: 0.5rem; font-size: 0.75rem;';
  listContainer.innerHTML = '<p style="text-align: center; color: var(--pico-muted-color); font-size: 0.75rem;">Select an item type</p>';
  mainContainer.appendChild(listContainer);
  
  content.appendChild(mainContainer);
  
  // Helper to extract name from object/string format
  const extractName = (value) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null && value.name) return value.name;
    return null;
  };
  
  // Helper to get use_cnt for food items based on item_no
  const getFoodUseCnt = (itemNo) => {
    const foodItem = GameData.FOOD[itemNo];
    if (foodItem && foodItem.attrs && foodItem.attrs.length > 0) {
      return foodItem.attrs[0];
    }
    return 101; // Default
  };
  
  // Build item list based on selected type
  const updateItemList = (selectedType) => {
    listContainer.innerHTML = '';
    
    if (!selectedType) {
      listContainer.innerHTML = '<p style="text-align: center; color: var(--pico-muted-color); font-size: 0.75rem;">Select an item type</p>';
      return;
    }
    
    let items = [];
    let useCnt = parseInt(selectedType);
    
    // Gather items based on type
    if (selectedType === '0') {
      // Regular Items
      Object.entries(GameData.ITEMS).forEach(([id, item]) => {
        const name = extractName(item);
        if (name) items.push({ id: parseInt(id), name, useCnt: item.attrs?.[0] || 0 });
      });
    } else if (selectedType === '16') {
      // Equipment - combine all equipment types
      // Use a Set to track IDs and avoid duplicates (especially ID 0)
      const seenIds = new Set();
      
      Object.entries(GameData.HELMET).forEach(([id, item]) => {
        const name = extractName(item);
        const itemId = parseInt(id);
        if (name && !seenIds.has(itemId)) {
          items.push({ id: itemId, name: itemId === 0 ? name : `[Helmet] ${name}`, useCnt: 16 });
          seenIds.add(itemId);
        }
      });
      Object.entries(GameData.ARMOR).forEach(([id, item]) => {
        const name = extractName(item);
        const itemId = parseInt(id);
        if (name && !seenIds.has(itemId)) {
          items.push({ id: itemId, name: `[Armor] ${name}`, useCnt: 16 });
          seenIds.add(itemId);
        }
      });
      Object.entries(GameData.SHIELD).forEach(([id, item]) => {
        const name = extractName(item);
        const itemId = parseInt(id);
        if (name && !seenIds.has(itemId)) {
          items.push({ id: itemId, name: `[Shield] ${name}`, useCnt: 16 });
          seenIds.add(itemId);
        }
      });
      Object.entries(GameData.OTHER_EQUIP_GEAR).forEach(([id, item]) => {
        const name = extractName(item);
        const itemId = parseInt(id);
        if (name && !seenIds.has(itemId)) {
          items.push({ id: itemId, name: `[Accessory] ${name}`, useCnt: 16 });
          seenIds.add(itemId);
        }
      });
    } else if (selectedType === '32') {
      // Runes
      Object.entries(GameData.RUNES).forEach(([id, item]) => {
        const name = extractName(item);
        if (name) items.push({ id: parseInt(id), name, useCnt: 32 });
      });
    } else if (selectedType === '48') {
      // Farming
      Object.entries(GameData.FARMING).forEach(([id, item]) => {
        const name = extractName(item);
        if (name) items.push({ id: parseInt(id), name, useCnt: 48 });
      });
    } else if (selectedType === '64') {
      // Trade
      Object.entries(GameData.TRADE).forEach(([id, item]) => {
        const name = extractName(item);
        if (name) items.push({ id: parseInt(id), name, useCnt: 64 });
      });
    } else if (selectedType === '80') {
      // Base/Warehouse
      Object.entries(GameData.BASE_ITEM).forEach(([id, item]) => {
        const name = extractName(item);
        if (name) items.push({ id: parseInt(id), name, useCnt: 80 });
      });
    } else if (selectedType === '101') {
      // Food Items
      Object.entries(GameData.FOOD).forEach(([id, item]) => {
        const name = extractName(item);
        if (name && id !== '0') {
          const foodUseCnt = getFoodUseCnt(parseInt(id));
          items.push({ id: parseInt(id), name, useCnt: foodUseCnt });
        }
      });
    }
    
    // Sort by ID
    items.sort((a, b) => a.id - b.id);
    
    // Create selectable list
    items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.style.cssText = 'padding: 0.4rem; margin: 0.2rem 0; cursor: pointer; border-radius: 4px; border: 1px solid transparent; font-size: 0.75rem;';
      itemDiv.innerHTML = `<strong>${item.id}:</strong> ${item.name} <span style="color: var(--pico-muted-color); font-size: 0.7rem;">(use_cnt: ${item.useCnt})</span>`;
      
      itemDiv.addEventListener('mouseenter', () => {
        itemDiv.style.backgroundColor = 'var(--pico-primary-background)';
        itemDiv.style.borderColor = 'var(--pico-primary)';
      });
      
      itemDiv.addEventListener('mouseleave', () => {
        itemDiv.style.backgroundColor = '';
        itemDiv.style.borderColor = 'transparent';
      });
      
      itemDiv.addEventListener('click', () => {
        onSelect(item.id, item.useCnt);
        dialog.close();
        setTimeout(() => dialog.remove(), 100);
      });
      
      listContainer.appendChild(itemDiv);
    });
    
    if (items.length === 0) {
      listContainer.innerHTML = '<p style="text-align: center; color: var(--pico-muted-color); font-size: 0.75rem;">No items found</p>';
    }
  };
  
  // Footer with Cancel button
  const footer = document.createElement('footer');
  footer.style.cssText = 'display: flex; justify-content: flex-end; margin: 0; padding-top: 0.75rem; border-top: 1px solid var(--pico-muted-border-color);';
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'secondary';
  cancelBtn.style.fontSize = '0.75rem';
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

/**
 * Creates a table editor interface for item arrays
 * Handles different item types based on use_cnt values and displays appropriate names
 * 
 * @param {Array<Object>} arr - Array of item objects with item_no and use_cnt properties
 * @param {string} key - Label for the editor section
 * @param {Function} updateCallback - Callback function when values change
 * @param {Array<string>} columns - Array of column property names to display
 * @returns {HTMLElement} - The table editor container
 */
export function createTableEditor(arr, key, updateCallback, columns) {
  const container = document.createElement('div');
  container.className = 'table-editor-section';

  // Add title
  const title = document.createElement('h3');
  title.textContent = `${key} [${arr.length}]`;
  title.style.cssText = 'margin: 0 0 1rem 0; font-size: 1.25rem;';
  container.appendChild(title);

  // Add description for Party Bag and warehouse items explaining use_cnt classification
  if (key.includes('Party Bag') || key.includes('Inventory') || key.includes('Warehouse')) {
    const description = document.createElement('p');
    description.id = `${key.toLowerCase().replace(/\s+/g, '-')}-description`;
    description.style.cssText = 'font-size: 0.85rem; color: var(--pico-muted-color); margin-bottom: 1rem;';
    description.innerHTML = `<strong>Item Type Classification by Count:</strong><br>
      • 0-9: Regular Items<br>
      • 16: Equipment (All equipment types use value 16)<br>
      • 32: Runes<br>
      • 48: Farming Items<br>
      • 64: Trade Items / Bath Items<br>
      • 80: Base/Warehouse Items<br>
      • 99+: Food Items [has specific values so be careful when it comes to use count]`;
    container.appendChild(description);
  }

  const table = document.createElement('table');
  table.className = 'striped';
  table.id = `table-${key.toLowerCase().replace(/\s+/g, '-')}`;

  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');

  // Cache lookup table determination
  let lookupTable = null;
  if (typeof GameData !== 'undefined') {
    if (key.includes('Warehouse')) lookupTable = GameData.BASE_ITEM;
    else if (key.includes('Bath')) lookupTable = GameData.ITEMS;
    else if (key.includes('Room')) lookupTable = GameData.ITEMS;
  }

  // Helper function to get the correct lookup table based on use_cnt
  function getItemLookup(useCnt) {
    if (!GameData) return null;
    if (useCnt === 16) {
      // use_cnt 16 is used for HELMET, ARMOR, SHIELD, and OTHER_EQUIP
      // We need to check the item_no to determine which category
      // For now, return a combined lookup (will be handled specially below)
      return null; // Will handle specially below
    }
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
    return 'Regular Item';
  }

  // Helper function to get equipment name based on item_no (for use_cnt 16)
  function getEquipmentName(itemNo) {
    if (!GameData) return null;

    // Helper to extract name from either string or object format
    const extractName = (value) => {
      if (typeof value === 'string') return value;
      if (typeof value === 'object' && value !== null && value.name) return value.name;
      return null;
    };

    // Check each equipment category by item_no ranges
    if (GameData.HELMET[itemNo]) return extractName(GameData.HELMET[itemNo]);
    if (GameData.ARMOR[itemNo]) return extractName(GameData.ARMOR[itemNo]);
    if (GameData.SHIELD[itemNo]) return extractName(GameData.SHIELD[itemNo]);
    if (GameData.OTHER_EQUIP_GEAR && GameData.OTHER_EQUIP_GEAR[itemNo]) return extractName(GameData.OTHER_EQUIP_GEAR[itemNo]);
    return null;
  }

  // Add Slot # column header
  const slotHeader = document.createElement('th');
  slotHeader.textContent = 'Slot #';
  slotHeader.style.width = '80px';
  trHead.appendChild(slotHeader);

  // Add Actions column header
  const actionsHeader = document.createElement('th');
  actionsHeader.textContent = 'Actions';
  actionsHeader.style.width = '100px';
  trHead.appendChild(actionsHeader);

  // Add Item Name column if we have a lookup
  if (lookupTable || arr.length > 0) {
    const th = document.createElement('th');
    th.textContent = 'Item Name';
    trHead.appendChild(th);
  }

  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = EDITOR_LABELS[col] || col;
    trHead.appendChild(th);

    // Add Item Type column before use_cnt column
    if (col === 'use_cnt') {
      const typeHeader = document.createElement('th');
      typeHeader.textContent = 'Item Type';
      trHead.insertBefore(typeHeader, th);
    }
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  // Optimize: limit rendering and use fragment for better performance
  const fragment = document.createDocumentFragment();
  const maxItems = Math.min(arr.length, 200);

  for (let index = 0; index < maxItems; index++) {
    const item = arr[index];
    const tr = document.createElement('tr');
    tr.id = `${key.toLowerCase().replace(/\s+/g, '-')}-row-${index}`;

    // Cache values for performance
    const itemUseCnt = item['use_cnt'] || 0;
    const itemId = item['item_no'] || 0;
    const itemLookup = getItemLookup(itemUseCnt);

    // Add slot number cell
    const slotTd = document.createElement('td');
    slotTd.textContent = index + 1;
    slotTd.style.textAlign = 'center';
    slotTd.style.fontWeight = 'bold';
    tr.appendChild(slotTd);

    // Add "Pick Item" button
    const actionTd = document.createElement('td');
    const pickBtn = document.createElement('button');
    pickBtn.textContent = '🔍 Pick';
    pickBtn.className = 'secondary';
    pickBtn.style.cssText = 'padding: 0.25rem 0.5rem; font-size: 0.85rem; margin: 0;';
    pickBtn.addEventListener('click', () => {
      createItemPickerDialog(item['item_no'], item['use_cnt'], (newItemNo, newUseCnt) => {
        // Update the item object
        item['item_no'] = newItemNo;
        item['use_cnt'] = newUseCnt;
        
        // Update the display
        const nameCell = tr.cells[2]; // Now at index 2 (Slot, Actions, Name)
        const itemLookup = getItemLookup(newUseCnt);
        
        if (newUseCnt === 16) {
          const itemName = getEquipmentName(newItemNo);
          nameCell.textContent = itemName || `Unknown Equipment (${newItemNo})`;
        } else if (itemLookup) {
          const lookupValue = itemLookup[newItemNo];
          if (typeof lookupValue === 'object' && lookupValue !== null && lookupValue.name) {
            nameCell.textContent = lookupValue.name;
          } else if (typeof lookupValue === 'string') {
            nameCell.textContent = lookupValue;
          } else {
            nameCell.textContent = `Unknown (${newItemNo})`;
          }
        } else {
          nameCell.textContent = `ID: ${newItemNo}`;
        }
        
        // Update type cell
        const typeCell = document.getElementById(`type-${index}`);
        if (typeCell) {
          typeCell.textContent = getItemTypeName(newUseCnt);
        }
        
        // Update input fields - find by data attribute
        const inputs = tr.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
          if (input.dataset.column === 'item_no') {
            input.value = newItemNo;
          } else if (input.dataset.column === 'use_cnt') {
            input.value = newUseCnt;
          }
        });
        
        if (updateCallback) updateCallback();
      });
    });
    actionTd.appendChild(pickBtn);
    tr.appendChild(actionTd);

    // Add item name cell
    const nameTd = document.createElement('td');

    let itemName;
    if (itemUseCnt === 16) {
      // Special handling for equipment (use_cnt 16)
      itemName = getEquipmentName(itemId);
      nameTd.textContent = itemName || `Unknown Equipment (${itemId})`;
    } else if (itemLookup) {
      const lookupValue = itemLookup[itemId];
      // Handle both string format and object format (for RUNES)
      if (typeof lookupValue === 'object' && lookupValue !== null && lookupValue.name) {
        nameTd.textContent = lookupValue.name;
      } else if (typeof lookupValue === 'string') {
        nameTd.textContent = lookupValue;
      } else {
        nameTd.textContent = `Unknown (${itemId})`;
      }
    } else {
      nameTd.textContent = `ID: ${itemId}`;
    }
    nameTd.style.fontStyle = 'italic';
    nameTd.style.color = 'var(--pico-muted-color)';
    tr.appendChild(nameTd);

    columns.forEach(col => {
      // Add Item Type column before use_cnt
      if (col === 'use_cnt') {
        const typeTd = document.createElement('td');
        typeTd.textContent = getItemTypeName(item['use_cnt'] || 0);
        typeTd.style.fontStyle = 'italic';
        typeTd.style.fontSize = '0.85rem';
        typeTd.id = `type-${index}`; // Add ID for updating
        tr.appendChild(typeTd);
      }

      const td = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.value = item[col];
      input.style.marginBottom = '0';
      input.style.padding = '0.25rem';
      input.dataset.column = col; // Add data attribute for easier selection
      input.addEventListener('input', (e) => {
        item[col] = parseFloat(e.target.value);
        // Update item name display if this is the item_no or use_cnt column
        if ((col === 'item_no' || col === 'use_cnt')) {
          const nameCell = tr.cells[2]; // Item name is at index 2 (Slot, Actions, Name)
          const newId = item['item_no'] || 0;
          const newUseCnt = item['use_cnt'] || 0;

          // Update item type if use_cnt changed
          if (col === 'use_cnt') {
            const typeCell = document.getElementById(`type-${index}`);
            if (typeCell) {
              typeCell.textContent = getItemTypeName(newUseCnt);
            }
          }

          if (newUseCnt === 16) {
            // Special handling for equipment
            const newName = getEquipmentName(newId);
            nameCell.textContent = newName || `Unknown Equipment (${newId})`;
          } else {
            const newLookup = getItemLookup(newUseCnt);
            if (newLookup) {
              const lookupValue = newLookup[newId];
              // Handle both string format and object format
              if (typeof lookupValue === 'object' && lookupValue !== null && lookupValue.name) {
                nameCell.textContent = lookupValue.name;
              } else if (typeof lookupValue === 'string') {
                nameCell.textContent = lookupValue;
              } else {
                nameCell.textContent = `Unknown (${newId})`;
              }
            } else {
              nameCell.textContent = `ID: ${newId}`;
            }
          }
        }
      });
      td.appendChild(input);
      tr.appendChild(td);
    });
    fragment.appendChild(tr);
  }

  tbody.appendChild(fragment); // Batch DOM update

  if (arr.length > 200) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columns.length + 1; // +1 for item name column
    td.textContent = `... and ${arr.length - 200} more items (hidden)`;
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  container.appendChild(table);

  return container;
}
