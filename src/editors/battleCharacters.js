// Battle Characters Editor
// Renders detailed character editor with stats, runes, equipment, and accessories

import GameData from '../gamedata.js';
import { MAX_MP_VALUE, MP_PER_SQUARE, MP_LEVELS, CHAR_INDEX, RECRUIT_STATUS } from '../config/constants.js';

/**
 * Creates a curated item picker for accessories
 * Only shows Regular Items, Accessories, and Food (excludes Key Items, Farming, Trade, Base, Runes, Helmet, Armor, Shield)
 */
function createAccessoryPickerDialog(currentItemNo, currentUseCnt, onSelect) {
  const dialog = document.createElement('dialog');
  dialog.style.cssText = 'max-width: 800px; max-height: 85vh; padding: 0; border: none; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); font-size: 0.75rem;';
  
  const content = document.createElement('article');
  content.style.cssText = 'margin: 0; padding: 1rem; display: flex; flex-direction: column; height: 100%; max-height: 80vh; font-size: 0.75rem;';
  
  // Header
  const header = document.createElement('header');
  header.style.marginBottom = '0.75rem';
  const title = document.createElement('h3');
  title.textContent = 'Select Item for Accessory Slot';
  title.style.cssText = 'margin: 0; font-size: 1rem;';
  header.appendChild(title);
  content.appendChild(header);
  
  // Main container - side by side layout
  const mainContainer = document.createElement('div');
  mainContainer.style.cssText = 'display: grid; grid-template-columns: 200px 1fr; gap: 1rem; flex: 1; overflow: hidden;';
  
  // Left side - Item Type Checkboxes (curated list)
  const typeContainer = document.createElement('div');
  typeContainer.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem; border: 1px solid var(--pico-muted-border-color); border-radius: 4px; overflow-y: auto;';
  
  const typeLabel = document.createElement('label');
  typeLabel.textContent = 'Item Type:';
  typeLabel.style.cssText = 'font-weight: bold; margin-bottom: 0.25rem; font-size: 0.75rem;';
  typeContainer.appendChild(typeLabel);
  
  const itemTypes = [
    { value: '0', label: 'Regular Items', desc: 'use_cnt: 0-9' },
    { value: '16', label: 'Accessories', desc: 'use_cnt: 16' },
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
  
  // Helper to check if item is a key item (should be excluded)
  const isKeyItem = (itemId) => {
    // Key item IDs: 29 (Blinking Mirror), 35-46, 47-50, 51-55, 72-74
    const keyItemIds = [
      29, // Blinking Mirror
      35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, // Range 35-46
      47, 48, 49, 50, // Range 47-50
      51, 52, 53, 54, 55, // Range 51-55
      72, 73, 74 // Range 72-74
    ];
    return keyItemIds.includes(itemId);
  };
  
  // Build item list based on selected type
  const updateItemList = (selectedType) => {
    listContainer.innerHTML = '';
    
    if (!selectedType) {
      listContainer.innerHTML = '<p style="text-align: center; color: var(--pico-muted-color); font-size: 0.75rem;">Select an item type</p>';
      return;
    }
    
    let items = [];
    
    // Gather items based on type
    if (selectedType === '0') {
      // Regular Items (excluding key items)
      Object.entries(GameData.ITEMS).forEach(([id, item]) => {
        const name = extractName(item);
        const itemId = parseInt(id);
        if (name && !isKeyItem(itemId)) {
          items.push({ id: itemId, name, useCnt: item.attrs?.[0] || 0 });
        }
      });
    } else if (selectedType === '16') {
      // Accessories only (OTHER_EQUIP_GEAR)
      Object.entries(GameData.OTHER_EQUIP_GEAR).forEach(([id, item]) => {
        const name = extractName(item);
        if (name) items.push({ id: parseInt(id), name, useCnt: 16 });
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
        onSelect(item);
        dialog.close();
        dialog.remove();
      });
      
      listContainer.appendChild(itemDiv);
    });
  };
  
  // Footer with Cancel button
  const footer = document.createElement('footer');
  footer.style.cssText = 'margin-top: 1rem; display: flex; justify-content: flex-end; gap: 0.5rem;';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'secondary';
  cancelBtn.addEventListener('click', () => {
    dialog.close();
    dialog.remove();
  });
  footer.appendChild(cancelBtn);
  
  content.appendChild(footer);
  dialog.appendChild(content);
  document.body.appendChild(dialog);
  dialog.showModal();
}

/**
 * Filter runes based on character and slot restrictions
 * @param {number} characterIndex - Character ID
 * @param {number} slotIndex - Rune slot (0=Head, 1=Right Hand, 2=Left Hand)
 * @returns {Array} Filtered list of allowed runes
 */
function filterRunesForCharacter(characterIndex, slotIndex) {
  if (!GameData || !GameData.RUNES) return [];

  const slotTypes = ['HR', 'RH', 'LH']; // Head, Right Hand, Left Hand
  const currentSlotType = slotTypes[slotIndex];

  const allowedRunes = [];

  Object.entries(GameData.RUNES).forEach(([id, runeData]) => {
    // Handle both old string format and new object format
    const runeName = typeof runeData === 'string' ? runeData : runeData.name;
    const attrs = runeData.attrs || [];

    // Always include "None" (ID 0)
    if (id === '0') {
      allowedRunes.push({ id: 0, name: runeName, attrs: attrs });
      return;
    }

    // Exclude weapon-exclusive runes (ExR)
    if (attrs.includes('ExR')) return;

    // Check if rune has slot-specific attributes
    const hasSlotAttr = attrs.includes('HR') || attrs.includes('RH') || attrs.includes('LH');

    // Check if rune has the required slot type attribute
    let passesSlotCheck = false;

    if (slotIndex === 0) { // Head slot
      // If it has any slot-specific attribute, it must have HR
      if (hasSlotAttr) {
        passesSlotCheck = attrs.includes('HR');
      } else {
        // No slot restrictions - allow for N or character-specific runes
        passesSlotCheck = true;
      }
    } else if (slotIndex === 1) { // Right Hand
      // If it has any slot-specific attribute, check for RH or Wep (but not LH exclusive)
      if (hasSlotAttr) {
        passesSlotCheck = (attrs.includes('RH') || attrs.includes('Wep')) && !attrs.includes('LH');
      } else {
        // No slot restrictions - allow for N or character-specific runes
        passesSlotCheck = true;
      }
    } else if (slotIndex === 2) { // Left Hand
      // If it has any slot-specific attribute, check for LH or Wep (but not RH exclusive)
      if (hasSlotAttr) {
        passesSlotCheck = (attrs.includes('LH') || attrs.includes('Wep')) && !attrs.includes('RH');
      } else {
        // No slot restrictions - allow for N or character-specific runes
        passesSlotCheck = true;
      }
    }

    if (!passesSlotCheck) return;

    // Check character index match
    const hasCharacterMatch = attrs.includes('N') ||
      attrs.some(attr => {
        const num = parseInt(attr);
        return !isNaN(num) && num === characterIndex;
      });

    // For runes with character-specific attributes, only show if character matches
    const hasCharacterSpecificAttr = attrs.some(attr => {
      const num = parseInt(attr);
      return !isNaN(num);
    });

    if (hasCharacterSpecificAttr && !hasCharacterMatch) return;

    // If we got here, the rune passed all checks
    allowedRunes.push({ id: parseInt(id), name: runeName, attrs: attrs });
  });

  return allowedRunes;
}

/**
 * Create Battle Characters Editor
 * @param {Array} arr - Character data array
 * @param {string} key - Field key
 * @param {Function} updateCallback - Callback when data changes
 * @param {Function} createElementForValue - Helper to create form elements (from main.js)
 * @param {Object} fieldConfig - Field configuration object with labels (from schema.js)
 * @param {Array} charaFlag - Character recruitment flags array (optional)
 * @returns {HTMLElement} Container element
 */
export function createBattleCharactersEditor(arr, key, updateCallback, createElementForValue, fieldConfig, charaFlag = null, gameData = null) {
  const container = document.createElement('div');
  container.className = 'battle-characters-section';

  // Add title
  const title = document.createElement('h3');
  title.textContent = `${key} [${Math.min(arr.length, 84)} playable characters]`;
  title.style.cssText = 'margin: 0 0 1rem 0; font-size: 1.25rem;';
  container.appendChild(title);

  const lookupTable = typeof GameData !== 'undefined' ? GameData.CHARACTERS : null;

  // Add filter dropdown
  const filterContainer = document.createElement('div');
  filterContainer.style.cssText = 'margin-bottom: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.1); border-radius: 6px;';

  const filterLabel = document.createElement('label');
  filterLabel.textContent = 'Filter by Character Type:';
  filterLabel.style.cssText = 'display: block; margin-bottom: 0.5rem; font-weight: bold; font-size: 0.75rem;';
  filterContainer.appendChild(filterLabel);

  const filterSelect = document.createElement('select');
  filterSelect.style.cssText = 'width: 100%; max-width: 200px; margin-bottom: 0; font-size: 0.75rem;';
  filterSelect.id = 'character-type-filter';

  // Add filter options
  const filterOptions = [
    { value: 'all', label: 'All Characters' },
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'K', label: 'Kobold' },
    { value: 'W', label: 'Winger' },
    { value: 'Z', label: 'Monster' },
    { value: 'N', label: 'Noble' }
  ];

  filterOptions.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    filterSelect.appendChild(option);
  });

  filterContainer.appendChild(filterSelect);
  container.appendChild(filterContainer);

  // Only show first 84 characters (1-83) as those are playable, skip index 0 (N/A)
  const maxIndex = Math.min(arr.length, 84);

  // Stat labels for para array
  const statLabels = ['Strength', 'Dexterity', 'Protection', 'Magic', 'Magic Defense', 'Speed', 'Luck'];

  // Equipment labels for mon_eqp array
  const equipmentLabels = ['Head Rune', 'Right Hand Rune', 'Left Hand Rune'];

  for (let index = 1; index < maxIndex; index++) {
    const charData = arr[index];
    const entry = lookupTable && lookupTable[index];
    const charName = entry ? (typeof entry === 'string' ? entry : (entry.name || `Character ${index}`)) : `Character ${index}`;

    // Skip characters with empty or N/A names
    if (!charName || charName === 'N/A' || charName === '' || charName.trim() === '') {
      continue;
    }

    // Get character attributes for filtering
    const charAttrs = entry && entry.attrs ? entry.attrs : [];

    const charDetails = document.createElement('details');
    charDetails.open = false;
    charDetails.className = 'json-object';

    // Add data attributes for filtering
    charDetails.dataset.charIndex = index;
    if (charAttrs.includes('M')) charDetails.dataset.isMale = 'true';
    if (charAttrs.includes('F')) charDetails.dataset.isFemale = 'true';
    if (charAttrs.includes('K')) charDetails.dataset.isKobold = 'true';
    if (charAttrs.includes('W')) charDetails.dataset.isWinger = 'true';
    if (charAttrs.includes('Z')) charDetails.dataset.isMonster = 'true';
    if (charAttrs.includes('N')) charDetails.dataset.isNoble = 'true';

    const charSummary = document.createElement('summary');
    charSummary.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';
    
    const nameSpan = document.createElement('span');
    nameSpan.innerHTML = `<strong>${index}:</strong> ${charName}`;
    charSummary.appendChild(nameSpan);
    
    // Add recruitment status from chara_flag
    if (charaFlag && charaFlag[index] !== undefined) {
      const statusSpan = document.createElement('span');
      statusSpan.style.cssText = 'font-size: 0.85rem; margin-left: auto; padding-left: 1rem; font-weight: 600;';
      const recruitmentValue = charaFlag[index];
      
      // Check for Hero Name (Suikoden 1) for McDohl/Gremio availability
      const macdName = gameData?.game_data?.macd_name || '';
      const hasMcDohl = macdName && macdName.trim().length > 0;
      
      // Get checkbox states from recruitment tab (if they exist)
      const betterLeonaEnabled = document.getElementById('better-leona-option')?.checked || false;
      const krakenPatchEnabled = document.getElementById('kraken-patch')?.checked || false;
      
      let isSpecialCase = false;
      
      // McDohl and Gremio: Available if Hero Name 1 is set
      if ((index === CHAR_INDEX.MCDOHL || index === CHAR_INDEX.GREMIO) && hasMcDohl && (recruitmentValue === RECRUIT_STATUS.NOT_RECRUITED || recruitmentValue === RECRUIT_STATUS.SPOKE_TO)) {
        statusSpan.textContent = '✓ Available (Import)';
        statusSpan.style.color = 'var(--pico-ins-color)';
        statusSpan.title = 'Available from Suikoden 1 import';
        isSpecialCase = true;
      }
      
      // Better Leona Option: Valeria or Kasumi
      if (betterLeonaEnabled && !isSpecialCase) {
        const valeriaFlag = charaFlag[CHAR_INDEX.VALERIA];
        const kasumiFlag = charaFlag[CHAR_INDEX.KASUMI];
        
        if (index === CHAR_INDEX.VALERIA && (kasumiFlag === RECRUIT_STATUS.AUTO_JOIN || kasumiFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && recruitmentValue !== RECRUIT_STATUS.AUTO_JOIN && recruitmentValue !== RECRUIT_STATUS.MANUAL_RECRUIT) {
          statusSpan.textContent = '✓ Recruited Via SFix';
          statusSpan.style.color = 'var(--pico-ins-color)';
          statusSpan.title = 'Automatically recruited via Better Leona Option';
          isSpecialCase = true;
        } else if (index === CHAR_INDEX.KASUMI && (valeriaFlag === RECRUIT_STATUS.AUTO_JOIN || valeriaFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && recruitmentValue !== RECRUIT_STATUS.AUTO_JOIN && recruitmentValue !== RECRUIT_STATUS.MANUAL_RECRUIT) {
          statusSpan.textContent = '✓ Recruited Via SFix';
          statusSpan.style.color = 'var(--pico-ins-color)';
          statusSpan.title = 'Automatically recruited via Better Leona Option';
          isSpecialCase = true;
        }
      }
      
      // Kraken Patch: Abizboah and Rulodia if Chuchara recruited
      if (krakenPatchEnabled && !isSpecialCase) {
        const chucharaFlag = charaFlag[CHAR_INDEX.CHUCHARA];
        
        if ((index === CHAR_INDEX.ABIZBOAH || index === CHAR_INDEX.RULODIA) && (chucharaFlag === RECRUIT_STATUS.AUTO_JOIN || chucharaFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && recruitmentValue !== RECRUIT_STATUS.AUTO_JOIN && recruitmentValue !== RECRUIT_STATUS.MANUAL_RECRUIT) {
          statusSpan.textContent = '✓ Recruited Via Kraken';
          statusSpan.style.color = 'var(--pico-ins-color)';
          statusSpan.title = 'Automatically recruited via Kraken Patch';
          isSpecialCase = true;
        }
      }
      
      // Normal recruitment status values if not a special case:
      // 1: Spoke to, 70: Auto Join, 71: Manual Recruit, 86: Event Locked Not Party, 212: Deceased, 213: On Leave
      if (!isSpecialCase) {
        if (recruitmentValue === RECRUIT_STATUS.AUTO_JOIN || recruitmentValue === RECRUIT_STATUS.MANUAL_RECRUIT) {
          statusSpan.textContent = '✓ Recruited';
          statusSpan.style.color = 'var(--pico-ins-color)';
        } else if (recruitmentValue === RECRUIT_STATUS.ON_LEAVE) {
          statusSpan.textContent = '📋 On Leave';
          statusSpan.style.color = '#f39c12';
        } else if (recruitmentValue === RECRUIT_STATUS.DECEASED) {
          statusSpan.textContent = '💀 Deceased';
          statusSpan.style.color = 'var(--pico-del-color)';
        } else if (recruitmentValue === RECRUIT_STATUS.EVENT_LOCKED) {
          statusSpan.textContent = '🔒 Event Locked';
          statusSpan.style.color = 'var(--pico-muted-color)';
        } else if (recruitmentValue === RECRUIT_STATUS.SPOKE_TO) {
          statusSpan.textContent = '💬 Spoke to';
          statusSpan.style.color = '#3498db';
        } else {
          statusSpan.textContent = '✗ Not Recruited';
          statusSpan.style.color = 'var(--pico-del-color)';
        }
      }
      charSummary.appendChild(statusSpan);
    }
    
    charDetails.appendChild(charSummary);

    // Create 2-column layout container
    const columnsContainer = document.createElement('div');
    columnsContainer.className = 'grid g-2-col';

    // Left column: Stats and other properties
    const leftColumn = document.createElement('div');
    leftColumn.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';

    // Right column: Runes, Equipment, Accessories
    const rightColumn = document.createElement('div');
    rightColumn.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';

    // Create General section (Level, Experience, HP, Killed Enemies)
    const generalContainer = document.createElement('div');
    generalContainer.className = 'battle-character-general';
    generalContainer.id = `char-${index}-general`;

    const generalTitle = document.createElement('h4');
    generalTitle.textContent = 'General';
    generalTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
    generalContainer.appendChild(generalTitle);

    // General fields to include
    const generalFields = [
      { prop: 'level', label: 'Level' },
      { prop: 'exp', label: 'Experience' },
      { prop: 'max_hp', label: 'Max HP' },
      { prop: 'now_hp', label: 'Current HP' },
      { prop: 'todome', label: 'Killed Enemies' }
    ];

    generalFields.forEach(field => {
      if (charData[field.prop] !== undefined) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'json-item';
        const label = document.createElement('label');
        label.textContent = field.label;
        fieldDiv.appendChild(label);

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = charData[field.prop];
        input.addEventListener('input', (e) => {
          charData[field.prop] = parseFloat(e.target.value);
        });
        fieldDiv.appendChild(input);
        generalContainer.appendChild(fieldDiv);
      }
    });

    leftColumn.appendChild(generalContainer);

    // Create Magic section (MP Levels)
    if (charData['mp'] && Array.isArray(charData['mp'])) {
      const mpContainer = document.createElement('div');
      mpContainer.className = 'battle-character-magic';
      mpContainer.id = `char-${index}-magic`;

      const mpTitle = document.createElement('h4');
      mpTitle.textContent = 'Magic';
      mpTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
      mpContainer.appendChild(mpTitle);

      const mpLevelLabels = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];

      charData['mp'].forEach((value, i) => {
        if (i < MP_LEVELS) {
          const mpDiv = document.createElement('div');
          mpDiv.className = 'json-item mp-level gap-1';
          mpDiv.style.cssText = 'display: flex; align-items: center;';

          const label = document.createElement('label');
          label.textContent = mpLevelLabels[i];
          mpDiv.appendChild(label);

          const input = document.createElement('input');
          input.type = 'number';
          input.min = '0';
          input.max = MAX_MP_VALUE.toString();
          input.value = value;
          input.style.maxWidth = '80px';
          input.addEventListener('input', (e) => {
            const newValue = Math.min(MAX_MP_VALUE, Math.max(0, parseFloat(e.target.value) || 0));
            e.target.value = newValue;
            charData['mp'][i] = newValue;
            // Update squares display
            updateSquares();
          });
          mpDiv.appendChild(input);

          // Add squares display
          const squaresDiv = document.createElement('div');
          squaresDiv.className = 'mp-squares';
          squaresDiv.style.cssText = 'display: flex; gap: 2px; font-size: 0.9rem; line-height: 1;';

          const updateSquares = () => {
            const currentValue = parseFloat(input.value) || 0;
            const filledSquares = Math.floor(currentValue / MP_PER_SQUARE);
            const totalSquares = Math.ceil(MAX_MP_VALUE / MP_PER_SQUARE);
            
            squaresDiv.innerHTML = '';
            for (let j = 0; j < totalSquares; j++) {
              const square = document.createElement('span');
              square.textContent = j < filledSquares ? '■' : '□';
              square.style.color = j < filledSquares ? 'var(--pico-primary)' : 'var(--pico-muted-color)';
              squaresDiv.appendChild(square);
            }
          };

          updateSquares();
          mpDiv.appendChild(squaresDiv);
          mpContainer.appendChild(mpDiv);
        }
      });

      leftColumn.appendChild(mpContainer);
    }

    // Create Weapon section (Weapon Level, Weapon Rune)
    const weaponContainer = document.createElement('div');
    weaponContainer.className = 'battle-character-weapon';
    weaponContainer.id = `char-${index}-weapon`;

    const weaponTitle = document.createElement('h4');
    weaponTitle.textContent = 'Weapon';
    weaponTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
    weaponContainer.appendChild(weaponTitle);

    // Weapon Level
    if (charData['buki_lv'] !== undefined) {
      const weaponLvDiv = document.createElement('div');
      weaponLvDiv.className = 'json-item';
      const label = document.createElement('label');
      label.textContent = 'Weapon Level';
      weaponLvDiv.appendChild(label);

      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.value = charData['buki_lv'];
      input.addEventListener('input', (e) => {
        charData['buki_lv'] = parseFloat(e.target.value);
      });
      weaponLvDiv.appendChild(input);
      weaponContainer.appendChild(weaponLvDiv);
    }

    // Weapon Rune (will be added later in the loop)
    rightColumn.appendChild(weaponContainer); // Add to right column above runes

    // Render all properties of this character
    Object.keys(charData).forEach(prop => {
      // Skip properties already handled in General and Magic sections
      if (['level', 'exp', 'max_hp', 'now_hp', 'todome', 'mp'].includes(prop)) return;

      // Skip buki_lv as it's already in Weapon section
      if (prop === 'buki_lv') return;

      let el;

      // Special handling for para (stats) array - NON-COLLAPSIBLE
      if (prop === 'para' && Array.isArray(charData[prop])) {
        const paraContainer = document.createElement('div');
        paraContainer.className = 'battle-character-stats';
        paraContainer.id = `char-${index}-stats`;

        const statsTitle = document.createElement('h4');
        statsTitle.textContent = 'Stats';
        statsTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
        paraContainer.appendChild(statsTitle);

        charData[prop].forEach((value, i) => {
          if (i < statLabels.length) {
            const statDiv = document.createElement('div');
            statDiv.className = 'json-item';
            const label = document.createElement('label');
            label.textContent = statLabels[i];
            statDiv.appendChild(label);

            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.value = value;
            input.addEventListener('input', (e) => {
              charData[prop][i] = parseFloat(e.target.value);
            });
            statDiv.appendChild(input);
            paraContainer.appendChild(statDiv);
          }
        });

        leftColumn.appendChild(paraContainer);
        return; // Don't add to el
      }
      // Special handling for mon_eqp (runes) array - NON-COLLAPSIBLE
      else if (prop === 'mon_eqp' && Array.isArray(charData[prop])) {
        const eqpContainer = document.createElement('div');
        eqpContainer.className = 'runes-equiped-section';
        eqpContainer.id = `char-${index}-runes`;

        const runesTitle = document.createElement('h4');
        runesTitle.textContent = 'Runes';
        runesTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
        eqpContainer.appendChild(runesTitle);

        charData[prop].forEach((value, i) => {
          if (i < equipmentLabels.length) {
            const eqpDiv = document.createElement('div');
            eqpDiv.className = 'json-item runes';
            eqpDiv.style.display = 'flex';
            eqpDiv.style.gap = '1rem';
            eqpDiv.style.alignItems = 'center';

            const slotLabel = document.createElement('span');
            slotLabel.textContent = `${equipmentLabels[i]}:`;
            slotLabel.style.fontWeight = 'bold';
            slotLabel.style.minWidth = '120px';
            eqpDiv.appendChild(slotLabel);

            // Create dropdown for rune selection
            const select = document.createElement('select');
            select.style.marginBottom = '0';
            select.style.flex = '1';

            // Get filtered runes for this character and slot
            const allowedRunes = filterRunesForCharacter(index, i);

            // Check if current rune has X (locked) attribute
            let isLocked = false;
            if (value && GameData && GameData.RUNES && GameData.RUNES[value]) {
              const currentRuneData = GameData.RUNES[value];
              const currentAttrs = currentRuneData.attrs || [];
              isLocked = currentAttrs.includes('X');
            }

            // Populate dropdown with filtered runes
            allowedRunes.forEach(rune => {
              const option = document.createElement('option');
              option.value = rune.id;
              option.textContent = `${rune.id}: ${rune.name}`;
              if (value === rune.id) {
                option.selected = true;
              }
              select.appendChild(option);
            });

            // If rune is locked, disable the dropdown
            if (isLocked && value !== 0) {
              select.disabled = true;
              select.style.opacity = '0.6';
              select.style.cursor = 'not-allowed';
              select.title = 'This rune is locked and cannot be changed';
            } else {
              // Set current value
              select.value = value || 0;

              // Update handler
              select.addEventListener('change', (e) => {
                charData[prop][i] = parseInt(e.target.value);
              });
            }

            eqpDiv.appendChild(select);
            eqpContainer.appendChild(eqpDiv);
          }
        });

        rightColumn.appendChild(eqpContainer); // Add to right column
        return; // Don't add to el
      }
      // Special handling for bogu_eqp (equipment worn) array - NON-COLLAPSIBLE
      else if (prop === 'bogu_eqp' && Array.isArray(charData[prop])) {
        const boguContainer = document.createElement('div');
        boguContainer.className = 'equipment-worn-section';
        boguContainer.id = `char-${index}-equipment`;

        const equipmentTitle = document.createElement('h4');
        equipmentTitle.textContent = 'Equipment';
        equipmentTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
        boguContainer.appendChild(equipmentTitle);

        // Check if this character is a beast/monster (cannot equip any armor)
        const isBeast = GameData && GameData.BEASTS && GameData.BEASTS.includes(index);

        // Equipment slot labels and corresponding GameData categories
        const equipmentSlots = [
          { label: 'Helmet', category: 'HELMET' },
          { label: 'Armor', category: 'ARMOR' },
          { label: 'Shield', category: 'SHIELD' }
        ];

        charData[prop].forEach((value, i) => {
          if (i < equipmentSlots.length) {
            const boguDiv = document.createElement('div');
            boguDiv.className = 'json-item equipment';
            boguDiv.style.display = 'flex';
            boguDiv.style.gap = '1rem';
            boguDiv.style.alignItems = 'center';

            const slotLabel = document.createElement('span');
            slotLabel.textContent = `${equipmentSlots[i].label}:`;
            slotLabel.style.fontWeight = 'bold';
            slotLabel.style.minWidth = '80px';
            boguDiv.appendChild(slotLabel);

            // Create dropdown for equipment selection
            const select = document.createElement('select');
            select.style.marginBottom = '0';
            select.style.flex = '1';

            // Get the appropriate equipment category
            const categoryData = GameData && GameData[equipmentSlots[i].category] ? GameData[equipmentSlots[i].category] : {};

            // Characters that can equip shields
            const shieldUsers = [2, 5, 7, 9, 12, 13, 23, 28, 33, 35, 39, 64];
            const isShieldSlot = i === 2; // Shield is the 3rd slot (index 2)
            const canEquipShield = shieldUsers.includes(index);

            // If character is a beast/monster, disable all equipment
            if (isBeast) {
              // Create disabled dropdown with only "None" option
              const option = document.createElement('option');
              option.value = 0;
              option.textContent = '0: None (Beast/Monster - Cannot equip)';
              option.selected = true;
              select.appendChild(option);
              select.disabled = true;
              select.style.opacity = '0.6';
              select.style.cursor = 'not-allowed';

              // Force value to 0
              charData[prop][i] = 0;
            }
            // If this is a shield slot and character can't equip shields, disable it
            else if (isShieldSlot && !canEquipShield) {
              // Create disabled dropdown with only "None" option
              const option = document.createElement('option');
              option.value = 0;
              option.textContent = '0: None (Cannot equip shields)';
              option.selected = true;
              select.appendChild(option);
              select.disabled = true;
              select.style.opacity = '0.6';
              select.style.cursor = 'not-allowed';

              // Force value to 0
              charData[prop][i] = 0;
            } else {
              // Get character attributes for equipment filtering
              const charEntry = lookupTable && lookupTable[index];
              const charAttrs = charEntry && charEntry.attrs ? charEntry.attrs : [];

              Object.entries(categoryData).forEach(([id, itemData]) => {
                let itemName, itemAttrs;
                if (typeof itemData === 'string') {
                  itemName = itemData;
                  itemAttrs = null;
                } else if (typeof itemData === 'object' && itemData.name) {
                  itemName = itemData.name;
                  itemAttrs = itemData.attrs || [];
                } else {
                  return;
                }

                // For armor slot, filter by character attributes
                if (equipmentSlots[i].category === 'ARMOR' && itemAttrs && itemAttrs.length > 0) {
                  const hasMatchingAttr = itemAttrs.some(attr => charAttrs.includes(attr));
                  if (!hasMatchingAttr && id !== '0') {
                    return;
                  }
                }
                // For helmet slot, filter by character attributes
                if (equipmentSlots[i].category === 'HELMET' && itemAttrs && itemAttrs.length > 0) {
                  const hasMatchingAttr = itemAttrs.some(attr => charAttrs.includes(attr));
                  if (!hasMatchingAttr && id !== '0') {
                    return;
                  }
                }

                const option = document.createElement('option');
                option.value = id;
                option.textContent = itemName;
                select.appendChild(option);
              });

              // Set current value
              select.value = value || 0;

              // Update handler
              select.addEventListener('change', (e) => {
                charData[prop][i] = parseInt(e.target.value);
              });
            }

            boguDiv.appendChild(select);
            boguContainer.appendChild(boguDiv);
          }
        });

        rightColumn.appendChild(boguContainer); // Add to right column
        return; // Don't add to el
      }
      // Special handling for item_eqp (accessories) array - NON-COLLAPSIBLE
      else if (prop === 'item_eqp' && Array.isArray(charData[prop])) {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'equip-accessories-section';
        itemContainer.id = `char-${index}-accessories`;

        // Check if this character is a beast/monster (cannot equip any accessories)
        const isBeast = GameData && GameData.BEASTS && GameData.BEASTS.includes(index);

        const accessoriesTitle = document.createElement('h4');
        accessoriesTitle.textContent = `Accessories [${charData[prop].length}]`;
        accessoriesTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
        itemContainer.appendChild(accessoriesTitle);

        // If beast/monster, show a disabled message
        if (isBeast) {
          const disabledMsg = document.createElement('p');
          disabledMsg.textContent = 'Beast/Monster character - Cannot equip accessories';
          disabledMsg.style.cssText = 'color: var(--pico-muted-color); font-style: italic; margin: 0.5rem 0;';
          itemContainer.appendChild(disabledMsg);
          rightColumn.appendChild(itemContainer);
          return;
        }

        charData[prop].forEach((item, i) => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'json-item';
          itemDiv.style.display = 'flex';
          itemDiv.style.gap = '0.5rem';
          itemDiv.style.alignItems = 'center';
          itemDiv.style.marginBottom = '0.5rem';

          const slotLabel = document.createElement('span');
          slotLabel.textContent = `Slot ${i + 1}:`;
          slotLabel.style.fontWeight = 'bold';
          slotLabel.style.minWidth = '60px';
          itemDiv.appendChild(slotLabel);

          // Pick button
          const pickBtn = document.createElement('button');
          pickBtn.textContent = '🔍 Pick';
          pickBtn.style.cssText = 'padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-bottom: 0;';
          pickBtn.addEventListener('click', (e) => {
            e.preventDefault();
            createAccessoryPickerDialog(item.item_no, item.use_cnt, (selectedItem) => {
              item.item_no = selectedItem.id;
              item.use_cnt = selectedItem.useCnt;
              itemName.textContent = selectedItem.name;
              idInput.value = selectedItem.id;
              cntInput.value = selectedItem.useCnt;
              if (updateCallback) updateCallback();
            });
          });
          itemDiv.appendChild(pickBtn);

          // Item name display - check different sources based on use_cnt
          const itemName = document.createElement('span');
          itemName.style.fontStyle = 'italic';
          itemName.style.color = 'var(--pico-muted-color)';
          itemName.style.minWidth = '180px';
          itemName.style.fontSize = '0.85rem';
          const itemId = item.item_no || 0;
          const useCnt = item.use_cnt || 0;

          // Helper function to get item name based on use_cnt
          const getItemName = (id, cnt) => {
            if (cnt === 16 && GameData && GameData.OTHER_EQUIP_GEAR && GameData.OTHER_EQUIP_GEAR[id]) {
              return GameData.OTHER_EQUIP_GEAR[id];
            } else if (cnt <= 9 && GameData && GameData.ITEMS && GameData.ITEMS[id]) {
              const item = GameData.ITEMS[id];
              return typeof item === 'string' ? item : (item.name || `Item ${id}`);
            } else if (cnt >= 100 && GameData && GameData.FOOD && GameData.FOOD[id]) {
              const item = GameData.FOOD[id];
              return typeof item === 'string' ? item : (item.name || `Item ${id}`);
            }
            return `Item ${id}`;
          };

          itemName.textContent = getItemName(itemId, useCnt);
          itemDiv.appendChild(itemName);

          // Item ID input
          const idInput = document.createElement('input');
          idInput.type = 'number';
          idInput.min = '0';
          idInput.value = item.item_no;
          idInput.style.width = '70px';
          idInput.style.marginBottom = '0';
          idInput.addEventListener('input', (e) => {
            item.item_no = parseFloat(e.target.value);
            const newId = parseFloat(e.target.value);
            itemName.textContent = getItemName(newId, item.use_cnt);
            if (updateCallback) updateCallback();
          });
          itemDiv.appendChild(idInput);

          // Use count input
          const cntLabel = document.createElement('label');
          cntLabel.textContent = 'use_cnt';
          cntLabel.style.marginBottom = '0';
          cntLabel.style.fontSize = '0.75rem';
          itemDiv.appendChild(cntLabel);

          const cntInput = document.createElement('input');
          cntInput.type = 'number';
          cntInput.min = '0';
          cntInput.value = item.use_cnt;
          cntInput.style.width = '60px';
          cntInput.style.marginBottom = '0';
          cntInput.addEventListener('input', (e) => {
            item.use_cnt = parseFloat(e.target.value);
            // Update item name display when use_cnt changes
            itemName.textContent = getItemName(item.item_no, parseFloat(e.target.value));
            if (updateCallback) updateCallback();
          });
          itemDiv.appendChild(cntInput);

          itemContainer.appendChild(itemDiv);
        });

        rightColumn.appendChild(itemContainer); // Add to right column
        return; // Don't add to el
      }
      // Special handling for buki_mon (Weapon Runes) - DROPDOWN, add to Weapon section
      else if (prop === 'buki_mon') {
        const weaponRuneDiv = document.createElement('div');
        weaponRuneDiv.className = 'json-item';

        const label = document.createElement('label');
        label.textContent = 'Weapon Rune';
        weaponRuneDiv.appendChild(label);

        // Check if this character is a beast/monster (cannot equip weapon runes)
        const isBeast = GameData && GameData.BEASTS && GameData.BEASTS.includes(index);

        const select = document.createElement('select');
        select.style.marginBottom = '0';

        if (isBeast) {
          // Create disabled dropdown with only "None" option for beasts/monsters
          const option = document.createElement('option');
          option.value = 0;
          option.textContent = '0: None (Beast/Monster - Cannot equip)';
          option.selected = true;
          select.appendChild(option);
          select.disabled = true;
          select.style.opacity = '0.6';
          select.style.cursor = 'not-allowed';

          // Force value to 0
          charData[prop] = 0;
        } else {
          // Weapon rune options for normal characters
          const weaponRunes = [
            { id: 0, name: 'None' },
            { id: 1, name: 'Fire Orb' },
            { id: 2, name: 'Rage Orb' },
            { id: 3, name: 'Water Orb' },
            { id: 4, name: 'Flowing Orb' },
            { id: 5, name: 'Wind Orb' },
            { id: 6, name: 'Cyclone Orb' },
            { id: 7, name: 'Earth Orb' },
            { id: 8, name: 'Mother Earth Orb' },
            { id: 9, name: 'Lightning Orb' },
            { id: 10, name: 'Thunder Orb' },
            { id: 94, name: 'Hunter Orb' },
            { id: 95, name: 'Technique Orb' },
            { id: 96, name: 'Silence Orb' },
            { id: 97, name: 'Poison Orb' },
            { id: 98, name: 'Knockdown Orb' },
            { id: 99, name: 'Sleep Orb' },
            { id: 100, name: 'Friendship Orb' },
            { id: 101, name: 'Solitude Orb' },
            { id: 102, name: 'Kindness Orb' },
            { id: 103, name: 'Exertion Orb' }
          ];

          weaponRunes.forEach(rune => {
            const option = document.createElement('option');
            option.value = rune.id;
            option.textContent = `${rune.id}: ${rune.name}`;
            if (charData[prop] === rune.id) {
              option.selected = true;
            }
            select.appendChild(option);
          });

          select.addEventListener('change', (e) => {
            charData[prop] = parseInt(e.target.value);
          });
        }

        weaponRuneDiv.appendChild(select);
        weaponContainer.appendChild(weaponRuneDiv); // Add to Weapon section instead of leftColumn
        return; // Don't add to el
      }
      else {
        // Use field config label if available, otherwise use property name
        const displayLabel = fieldConfig[prop]?.label || prop;
        el = createElementForValue(charData[prop], displayLabel, (newValue) => {
          charData[prop] = newValue;
        }, charData);

        // Add to left column
        leftColumn.appendChild(el);
        return; // Don't add to el
      }
    });

    // Add both columns to the container
    columnsContainer.appendChild(leftColumn);
    columnsContainer.appendChild(rightColumn);
    charDetails.appendChild(columnsContainer);

    container.appendChild(charDetails);
  }

  if (arr.length > 84) {
    const note = document.createElement('p');
    note.textContent = `Note: Showing only first 84 playable characters. ${arr.length - 84} non-playable characters hidden.`;
    note.style.fontStyle = 'italic';
    note.style.color = 'var(--pico-muted-color)';
    container.appendChild(note);
  }

  // Add filter event listener
  filterSelect.addEventListener('change', (e) => {
    const filterValue = e.target.value;
    const allCharDetails = container.querySelectorAll('.json-object');

    allCharDetails.forEach(charDetail => {
      if (filterValue === 'all') {
        charDetail.style.display = '';
      } else {
        // Check if character has the selected attribute
        let shouldShow = false;
        if (filterValue === 'M' && charDetail.dataset.isMale === 'true') shouldShow = true;
        if (filterValue === 'F' && charDetail.dataset.isFemale === 'true') shouldShow = true;
        if (filterValue === 'K' && charDetail.dataset.isKobold === 'true') shouldShow = true;
        if (filterValue === 'W' && charDetail.dataset.isWinger === 'true') shouldShow = true;
        if (filterValue === 'Z' && charDetail.dataset.isMonster === 'true') shouldShow = true;
        if (filterValue === 'N' && charDetail.dataset.isNoble === 'true') shouldShow = true;

        charDetail.style.display = shouldShow ? '' : 'none';
      }
    });
  });

  return container;
}
