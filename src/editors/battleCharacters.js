// Battle Characters Editor
// Renders detailed character editor with stats, runes, equipment, accessories,
// packed-nibble MP controls, friendship (suki_value), and granular c_kotei_dat archetype/slot/affinity editors.

import GameData from '../gamedata.js';
import { MP_LEVELS, MP_SQUARES_PER_LEVEL, CHAR_INDEX, RECRUIT_STATUS } from '../config/constants.js';

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
    const keyItemIds = [
      29, // Blinking Mirror
      35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46,
      47, 48, 49, 50,
      51, 52, 53, 54, 55,
      72, 73, 74
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
    
    if (selectedType === '0') {
      Object.entries(GameData.ITEMS).forEach(([id, item]) => {
        const name = extractName(item);
        const itemId = parseInt(id);
        if (name && !isKeyItem(itemId)) {
          items.push({ id: itemId, name, useCnt: item.attrs?.[0] || 0 });
        }
      });
    } else if (selectedType === '16') {
      Object.entries(GameData.OTHER_EQUIP_GEAR).forEach(([id, item]) => {
        const name = extractName(item);
        if (name) items.push({ id: parseInt(id), name, useCnt: 16 });
      });
    } else if (selectedType === '101') {
      Object.entries(GameData.FOOD).forEach(([id, item]) => {
        const name = extractName(item);
        if (name && id !== '0') {
          const foodUseCnt = getFoodUseCnt(parseInt(id));
          items.push({ id: parseInt(id), name, useCnt: foodUseCnt });
        }
      });
    }
    
    items.sort((a, b) => a.id - b.id);
    
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
  
  const footer = document.createElement('footer');
  footer.style.cssText = 'margin-top: 1rem; display: flex; justify-content: flex-end; gap: 0.5rem;';

  const unequipBtn = document.createElement('button');
  unequipBtn.type = 'button';
  unequipBtn.textContent = '✕ Unequip / Clear Slot';
  unequipBtn.className = 'outline secondary';
  unequipBtn.style.cssText = 'margin-right: auto; font-size: 0.75rem; padding: 0.25rem 0.55rem;';
  unequipBtn.addEventListener('click', () => {
    onSelect({ id: 0, name: 'None (Empty)', useCnt: 0 });
    dialog.close();
    dialog.remove();
  });
  footer.appendChild(unequipBtn);
  
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
 * @param {boolean} bypassRestrictions - If true, allows all non-weapon-exclusive runes
 * @returns {Array} Filtered list of allowed runes
 */
function filterRunesForCharacter(characterIndex, slotIndex, bypassRestrictions = false) {
  if (!GameData || !GameData.RUNES) return [];

  const allowedRunes = [];

  Object.entries(GameData.RUNES).forEach(([id, runeData]) => {
    const runeName = typeof runeData === 'string' ? runeData : runeData.name;
    const attrs = runeData.attrs || [];

    if (id === '0') {
      allowedRunes.push({ id: 0, name: runeName, attrs: attrs });
      return;
    }

    if (attrs.includes('ExR')) return;

    if (bypassRestrictions) {
      allowedRunes.push({ id: parseInt(id), name: runeName, attrs: attrs });
      return;
    }

    const hasSlotAttr = attrs.includes('HR') || attrs.includes('RH') || attrs.includes('LH');
    let passesSlotCheck = false;

    if (slotIndex === 0) {
      passesSlotCheck = hasSlotAttr ? attrs.includes('HR') : true;
    } else if (slotIndex === 1) {
      passesSlotCheck = hasSlotAttr ? ((attrs.includes('RH') || attrs.includes('Wep')) && !attrs.includes('LH')) : true;
    } else if (slotIndex === 2) {
      passesSlotCheck = hasSlotAttr ? ((attrs.includes('LH') || attrs.includes('Wep')) && !attrs.includes('RH')) : true;
    }

    if (!passesSlotCheck) return;

    const hasCharacterMatch = attrs.includes('N') ||
      attrs.some(attr => {
        const num = parseInt(attr);
        return !isNaN(num) && num === characterIndex;
      });

    const hasCharacterSpecificAttr = attrs.some(attr => {
      const num = parseInt(attr);
      return !isNaN(num);
    });

    if (hasCharacterSpecificAttr && !hasCharacterMatch) return;

    allowedRunes.push({ id: parseInt(id), name: runeName, attrs: attrs });
  });

  return allowedRunes;
}

/**
 * Create Battle Characters Editor
 */
export function createBattleCharactersEditor(arr, key, updateCallback, createElementForValue, fieldConfig, charaFlag = null, gameData = null) {
  const container = document.createElement('div');
  container.className = 'battle-characters-section';

  const koteiArr = gameData?.chara_data?.c_kotei_dat || null;
  const sukiArr = gameData?.chara_data?.suki_value || null;

  // Title
  const title = document.createElement('h3');
  title.textContent = `${key} [${Math.min(arr.length, 84) - 1} playable characters]`;
  title.style.cssText = 'margin: 0 0 1rem 0; font-size: 1.25rem;';
  container.appendChild(title);

  // Recruitment Mods Section
  const modsContainer = document.createElement('div');
  modsContainer.className = 'recruitment-mods-section';
  modsContainer.style.cssText = 'margin-bottom: 1.25rem; padding: 0.85rem 1rem; background: rgba(0,0,0,0.15); border: 1px solid var(--pico-muted-border-color); border-radius: 6px;';

  const modsTitle = document.createElement('h4');
  modsTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 0.95rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;';
  modsTitle.innerHTML = '<span>⚙️ Recruitment Mods that you have on</span><span style="font-size: 0.75rem; color: var(--pico-muted-color); font-weight: normal;">(Honored in recruitment badges & \'✓ Recruited Only\' filter)</span>';
  modsContainer.appendChild(modsTitle);

  const modsGrid = document.createElement('div');
  modsGrid.style.cssText = 'display: flex; flex-direction: column; gap: 0.4rem;';

  // Better Leona Option
  const leonaLabel = document.createElement('label');
  leonaLabel.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0; cursor: pointer; font-size: 0.85rem;';
  const leonaCheckbox = document.createElement('input');
  leonaCheckbox.type = 'checkbox';
  leonaCheckbox.id = 'battle-better-leona-option';
  leonaCheckbox.className = 'better-leona-checkbox';
  leonaCheckbox.style.cssText = 'margin: 0;';
  leonaCheckbox.checked = localStorage.getItem('recruitment_better_leona') === 'true';
  leonaLabel.appendChild(leonaCheckbox);
  const leonaText = document.createElement('span');
  leonaText.innerHTML = '<strong>Better Leona Option Via SuikodenFix</strong> - Allows Recruitment of Both Valeria and Kasumi';
  leonaLabel.appendChild(leonaText);
  modsGrid.appendChild(leonaLabel);

  // Kraken Patch
  const krakenLabel = document.createElement('label');
  krakenLabel.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0; cursor: pointer; font-size: 0.85rem;';
  const krakenCheckbox = document.createElement('input');
  krakenCheckbox.type = 'checkbox';
  krakenCheckbox.id = 'battle-kraken-patch';
  krakenCheckbox.className = 'kraken-patch-checkbox';
  krakenCheckbox.style.cssText = 'margin: 0;';
  krakenCheckbox.checked = localStorage.getItem('recruitment_kraken_patch') === 'true';
  krakenLabel.appendChild(krakenCheckbox);
  const krakenText = document.createElement('span');
  krakenText.innerHTML = '<strong>Kraken Patch</strong> - If Chuchara is recruited, also recruits Abizboah and Rulodia';
  krakenLabel.appendChild(krakenText);
  modsGrid.appendChild(krakenLabel);

  modsContainer.appendChild(modsGrid);
  container.appendChild(modsContainer);

  const onModToggle = (storageKey, isChecked, checkboxClass) => {
    localStorage.setItem(storageKey, isChecked);
    document.querySelectorAll(`.${checkboxClass}, #${storageKey === 'recruitment_better_leona' ? 'better-leona-option' : 'kraken-patch'}`).forEach(cb => {
      cb.checked = isChecked;
    });
    window.dispatchEvent(new CustomEvent('recruitment-mods-changed'));
  };

  leonaCheckbox.addEventListener('change', (e) => onModToggle('recruitment_better_leona', e.target.checked, 'better-leona-checkbox'));
  krakenCheckbox.addEventListener('change', (e) => onModToggle('recruitment_kraken_patch', e.target.checked, 'kraken-patch-checkbox'));

  // Helper to dynamically update character recruitment status badge & filter state
  const updateCharRecruitmentStatus = (idx, detailsEl, badgeEl, selectEl = null) => {
    if (!charaFlag || charaFlag[idx] === undefined) return;

    const recruitmentValue = charaFlag[idx];
    if (selectEl && selectEl.value !== String(recruitmentValue)) {
      selectEl.value = String(recruitmentValue);
    }

    const macdName = gameData?.game_data?.macd_name || '';
    const hasMcDohl = macdName && macdName.trim().length > 0;
    const betterLeonaEnabled = localStorage.getItem('recruitment_better_leona') === 'true' || 
      (document.getElementById('better-leona-option')?.checked ?? false) ||
      leonaCheckbox.checked;
    const krakenPatchEnabled = localStorage.getItem('recruitment_kraken_patch') === 'true' || 
      (document.getElementById('kraken-patch')?.checked ?? false) ||
      krakenCheckbox.checked;

    let isSpecialCase = false;
    let isRecruited = (recruitmentValue === RECRUIT_STATUS.AUTO_JOIN || recruitmentValue === RECRUIT_STATUS.MANUAL_RECRUIT);

    // McDohl and Gremio: Available if Hero Name 1 is set
    if ((idx === CHAR_INDEX.MCDOHL || idx === CHAR_INDEX.GREMIO) && hasMcDohl && (recruitmentValue === RECRUIT_STATUS.NOT_RECRUITED || recruitmentValue === RECRUIT_STATUS.SPOKE_TO)) {
      badgeEl.textContent = '✓ Available (Import)';
      badgeEl.style.color = 'var(--pico-ins-color)';
      badgeEl.title = 'Available via Suikoden 1 save transfer';
      isSpecialCase = true;
      isRecruited = true;
    }

    // Better Leona Option: Valeria or Kasumi
    if (betterLeonaEnabled && !isSpecialCase) {
      const valeriaFlag = charaFlag[CHAR_INDEX.VALERIA];
      const kasumiFlag = charaFlag[CHAR_INDEX.KASUMI];

      if (idx === CHAR_INDEX.VALERIA && (kasumiFlag === RECRUIT_STATUS.AUTO_JOIN || kasumiFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && !isRecruited) {
        badgeEl.textContent = '✓ Recruited Via SFix';
        badgeEl.style.color = 'var(--pico-ins-color)';
        badgeEl.title = 'Automatically recruited via Better Leona Option';
        isSpecialCase = true;
        isRecruited = true;
      } else if (idx === CHAR_INDEX.KASUMI && (valeriaFlag === RECRUIT_STATUS.AUTO_JOIN || valeriaFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && !isRecruited) {
        badgeEl.textContent = '✓ Recruited Via SFix';
        badgeEl.style.color = 'var(--pico-ins-color)';
        badgeEl.title = 'Automatically recruited via Better Leona Option';
        isSpecialCase = true;
        isRecruited = true;
      }
    }

    // Kraken Patch: Abizboah and Rulodia if Chuchara recruited
    if (krakenPatchEnabled && !isSpecialCase) {
      const chucharaFlag = charaFlag[CHAR_INDEX.CHUCHARA];
      if ((idx === CHAR_INDEX.ABIZBOAH || idx === CHAR_INDEX.RULODIA) && (chucharaFlag === RECRUIT_STATUS.AUTO_JOIN || chucharaFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && !isRecruited) {
        badgeEl.textContent = '✓ Recruited Via Kraken';
        badgeEl.style.color = 'var(--pico-ins-color)';
        badgeEl.title = 'Automatically recruited via Kraken Patch';
        isSpecialCase = true;
        isRecruited = true;
      }
    }

    if (!isSpecialCase) {
      if (isRecruited) {
        badgeEl.textContent = '✓ Recruited';
        badgeEl.style.color = 'var(--pico-ins-color)';
      } else if (recruitmentValue === RECRUIT_STATUS.ON_LEAVE) {
        badgeEl.textContent = '📋 On Leave';
        badgeEl.style.color = '#f39c12';
      } else if (recruitmentValue === RECRUIT_STATUS.DECEASED) {
        badgeEl.textContent = '💀 Deceased';
        badgeEl.style.color = 'var(--pico-del-color)';
      } else if (recruitmentValue === RECRUIT_STATUS.EVENT_LOCKED) {
        badgeEl.textContent = '🔒 Event Locked';
        badgeEl.style.color = 'var(--pico-muted-color)';
      } else if (recruitmentValue === RECRUIT_STATUS.SPOKE_TO) {
        badgeEl.textContent = '💬 Spoke to';
        badgeEl.style.color = '#3498db';
      } else {
        badgeEl.textContent = '✗ Not Recruited';
        badgeEl.style.color = 'var(--pico-del-color)';
      }
    }

    if (isRecruited) {
      detailsEl.dataset.isRecruited = 'true';
    } else {
      delete detailsEl.dataset.isRecruited;
    }
  };

  const lookupTable = typeof GameData !== 'undefined' ? GameData.CHARACTERS : null;

  // Filter & Bulk Actions Toolbar
  const filterContainer = document.createElement('div');
  filterContainer.style.cssText = 'margin-bottom: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.12); border-radius: 6px; display: flex; flex-direction: column; gap: 0.85rem;';

  // Row 1: Search by Name + Filter by Type + Bypass Restrictions Toggle
  const filterRow = document.createElement('div');
  filterRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end;';

  const searchBoxWrap = document.createElement('div');
  searchBoxWrap.style.cssText = 'flex: 1; min-width: 200px;';
  const searchLbl = document.createElement('label');
  searchLbl.textContent = 'Search Character:';
  searchLbl.style.cssText = 'display: block; margin-bottom: 0.35rem; font-weight: bold; font-size: 0.75rem;';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Search by name or ID (e.g. Riou, Viktor, 82)...';
  searchInput.style.cssText = 'margin-bottom: 0; font-size: 0.75rem; padding: 0.35rem 0.6rem 0.35rem 2.1rem;';
  searchBoxWrap.appendChild(searchLbl);
  searchBoxWrap.appendChild(searchInput);
  filterRow.appendChild(searchBoxWrap);

  const typeFilterWrap = document.createElement('div');
  typeFilterWrap.style.cssText = 'min-width: 180px;';
  const filterLabel = document.createElement('label');
  filterLabel.textContent = 'Filter by Type:';
  filterLabel.style.cssText = 'display: block; margin-bottom: 0.35rem; font-weight: bold; font-size: 0.75rem;';
  const filterSelect = document.createElement('select');
  filterSelect.style.cssText = 'margin-bottom: 0; font-size: 0.75rem; padding: 0.35rem 0.6rem;';
  filterSelect.id = 'character-type-filter';

  const filterOptions = [
    { value: 'all', label: 'All Playable Characters' },
    { value: 'recruited', label: '✓ Recruited Only' },
    { value: 'M', label: 'Male (M)' },
    { value: 'F', label: 'Female (F)' },
    { value: 'K', label: 'Kobold (K)' },
    { value: 'W', label: 'Winger (W)' },
    { value: 'Z', label: 'Monster / Beast (Z)' },
    { value: 'N', label: 'Noble (N)' }
  ];

  filterOptions.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    filterSelect.appendChild(option);
  });
  typeFilterWrap.appendChild(filterLabel);
  typeFilterWrap.appendChild(filterSelect);
  filterRow.appendChild(typeFilterWrap);

  filterContainer.appendChild(filterRow);

  // Row 2: Bulk Actions Bar
  const bulkRow = document.createElement('div');
  bulkRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; padding-top: 0.6rem; border-top: 1px solid var(--pico-muted-border-color);';

  const bulkLabel = document.createElement('span');
  bulkLabel.textContent = 'Bulk Actions (Visible Characters):';
  bulkLabel.style.cssText = 'font-size: 0.75rem; font-weight: bold; margin-right: 0.25rem;';
  bulkRow.appendChild(bulkLabel);

  const createBulkBtn = (text, titleText, onClick) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'outline';
    btn.textContent = text;
    btn.title = titleText;
    btn.style.cssText = 'font-size: 0.72rem; padding: 0.3rem 0.6rem; margin-bottom: 0;';
    btn.addEventListener('click', onClick);
    return btn;
  };

  const charControllers = [];

  bulkRow.appendChild(createBulkBtn('❤️ Heal All HP & MP', 'Sets Current HP = Max HP and Current MP = Max MP for visible characters', () => {
    charControllers.forEach(c => {
      if (c.charDetails.style.display !== 'none') c.healHpMp();
    });
    if (updateCallback) updateCallback();
  }));

  bulkRow.appendChild(createBulkBtn('⚔️ Max Weapons (Lv 16)', 'Sets Weapon Level to 16 for visible non-beast characters', () => {
    charControllers.forEach(c => {
      if (c.charDetails.style.display !== 'none') c.maxWeapon();
    });
    if (updateCallback) updateCallback();
  }));

  if (koteiArr) {
    bulkRow.appendChild(createBulkBtn('⚡ Unlock All 3 Rune Slots (Lv 1)', 'Sets mon_kosu_type = [1, 1, 1] for visible characters', () => {
      charControllers.forEach(c => {
        if (c.charDetails.style.display !== 'none') c.unlockAllRuneSlots();
      });
      if (updateCallback) updateCallback();
    }));

    bulkRow.appendChild(createBulkBtn('✨ All Rune Affinities Rank A', 'Sets all elemental rune affinities to Rank A (+40% damage, no backfire) for visible characters', () => {
      charControllers.forEach(c => {
        if (c.charDetails.style.display !== 'none') c.setAllAffinitiesRankA();
      });
      if (updateCallback) updateCallback();
    }));
  }

  filterContainer.appendChild(bulkRow);
  container.appendChild(filterContainer);

  const maxIndex = Math.min(arr.length, 84);
  const statLabels = ['Strength', 'Magic', 'Protection', 'Magic Defence', 'Dexterity', 'Speed', 'Luck'];
  const equipmentLabels = ['Head Rune', 'Right Hand Rune', 'Left Hand Rune'];

  for (let index = 1; index < maxIndex; index++) {
    const charData = arr[index];
    const koteiData = koteiArr ? koteiArr[index] : null;
    const entry = lookupTable && lookupTable[index];
    const charName = entry ? (typeof entry === 'string' ? entry : (entry.name || `Character ${index}`)) : `Character ${index}`;

    if (!charName || charName === 'N/A' || charName.trim() === '') {
      continue;
    }

    const charAttrs = entry && entry.attrs ? entry.attrs : [];

    const charDetails = document.createElement('details');
    charDetails.open = false;
    charDetails.className = 'json-object';

    charDetails.dataset.charIndex = index;
    charDetails.dataset.searchText = `${index} ${charName}`.toLowerCase();
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
    
    // Recruitment status badge
    let statusSpan = null;
    let recruitSelect = null;
    if (charaFlag && charaFlag[index] !== undefined) {
      statusSpan = document.createElement('span');
      statusSpan.style.cssText = 'font-size: 0.85rem; margin-left: auto; padding-left: 1rem; font-weight: 600;';
      updateCharRecruitmentStatus(index, charDetails, statusSpan);
      charSummary.appendChild(statusSpan);
    }
    
    charDetails.appendChild(charSummary);

    const columnsContainer = document.createElement('div');
    columnsContainer.className = 'grid battle-character-columns';
    columnsContainer.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;';

    const colGeneral = document.createElement('div');
    colGeneral.className = 'battle-character-col';
    colGeneral.style.cssText = 'padding: 0.75rem; background: rgba(0,0,0,0.15); border-radius: 6px; display: flex; flex-direction: column; gap: 0.6rem; min-width: 0;';

    const colMagic = document.createElement('div');
    colMagic.className = 'battle-character-col';
    colMagic.style.cssText = 'padding: 0.75rem; background: rgba(0,0,0,0.15); border-radius: 6px; display: flex; flex-direction: column; gap: 0.6rem; min-width: 0;';

    const colGear = document.createElement('div');
    colGear.className = 'battle-character-col';
    colGear.style.cssText = 'padding: 0.75rem; background: rgba(0,0,0,0.15); border-radius: 6px; display: flex; flex-direction: column; gap: 0.6rem; min-width: 0;';

    // General section (Level, Experience, HP, Killed Enemies, Friendship)
    const generalContainer = document.createElement('div');
    generalContainer.className = 'battle-character-general';
    generalContainer.id = `char-${index}-general`;

    const generalHeader = document.createElement('div');
    generalHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;';
    const generalTitle = document.createElement('strong');
    generalTitle.style.fontSize = '0.82rem';
    generalTitle.textContent = 'General';
    generalHeader.appendChild(generalTitle);
    generalContainer.appendChild(generalHeader);

    const generalInputs = {};
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
          charData[field.prop] = parseFloat(e.target.value) || 0;
        });
        generalInputs[field.prop] = input;
        fieldDiv.appendChild(input);
        generalContainer.appendChild(fieldDiv);
      }
    });

    // Recruitment Status (chara_flag)
    if (charaFlag && charaFlag[index] !== undefined) {
      const recruitDiv = document.createElement('div');
      recruitDiv.className = 'json-item';
      const recruitLabel = document.createElement('label');
      recruitLabel.textContent = 'Recruitment Status (chara_flag)';
      recruitDiv.appendChild(recruitLabel);

      recruitSelect = document.createElement('select');
      recruitSelect.style.cssText = 'font-size: 0.8rem; padding: 0.25rem 0.5rem; margin-bottom: 0;';
      const recruitOptions = [
        { value: 0, text: '0: ✗ Not Recruited' },
        { value: 1, text: '1: 💬 Spoke to' },
        { value: 70, text: '70: ✓ Auto Join (Recruited)' },
        { value: 71, text: '71: ✓ Manual Recruit (Recruited)' },
        { value: 86, text: '86: 🔒 Event Locked' },
        { value: 212, text: '212: 💀 Deceased' },
        { value: 213, text: '213: 📋 On Leave' }
      ];
      recruitOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = String(opt.value);
        option.textContent = opt.text;
        recruitSelect.appendChild(option);
      });
      const curFlag = charaFlag[index];
      if (!recruitOptions.some(o => o.value === curFlag)) {
        const customOpt = document.createElement('option');
        customOpt.value = String(curFlag);
        customOpt.textContent = `${curFlag}: Custom (${curFlag})`;
        recruitSelect.appendChild(customOpt);
      }
      recruitSelect.value = String(curFlag);
      recruitSelect.addEventListener('change', (e) => {
        const newStatus = parseInt(e.target.value) || 0;
        charaFlag[index] = newStatus;
        refreshAllRecruitmentStatuses();
        window.dispatchEvent(new CustomEvent('recruitment-flags-changed'));
        if (updateCallback) updateCallback();
      });
      recruitDiv.appendChild(recruitSelect);
      generalContainer.appendChild(recruitDiv);
    }

    // Friendship / Affection (suki_value[index])
    if (sukiArr && sukiArr[index] !== undefined) {
      const sukiDiv = document.createElement('div');
      sukiDiv.className = 'json-item';
      const sukiLabel = document.createElement('label');
      sukiLabel.textContent = 'Friendship / Affection (suki_value)';
      sukiDiv.appendChild(sukiLabel);

      const sukiInput = document.createElement('input');
      sukiInput.type = 'number';
      sukiInput.min = '-128';
      sukiInput.max = '127';
      sukiInput.value = sukiArr[index];
      sukiInput.addEventListener('input', (e) => {
        sukiArr[index] = Math.max(-128, Math.min(127, parseInt(e.target.value) || 0));
      });
      sukiDiv.appendChild(sukiInput);
      generalContainer.appendChild(sukiDiv);
    }

    colGeneral.appendChild(generalContainer);

    // Magic section (Packed Nibble MP: High Nibble = Current MP 0-9, Low Nibble = Max MP 0-9)
    const mpSyncFns = [];
    if (charData['mp'] && Array.isArray(charData['mp'])) {
      const mpContainer = document.createElement('div');
      mpContainer.className = 'battle-character-magic';
      mpContainer.id = `char-${index}-magic`;

      const mpHeader = document.createElement('div');
      mpHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;';
      const mpTitle = document.createElement('strong');
      mpTitle.style.fontSize = '0.82rem';
      mpTitle.textContent = 'Magic (MP Levels)';
      mpHeader.appendChild(mpTitle);

      const maxMpBtn = document.createElement('button');
      maxMpBtn.type = 'button';
      maxMpBtn.className = 'outline';
      maxMpBtn.textContent = '⚡ Max All (9/9)';
      maxMpBtn.style.cssText = 'font-size: 0.7rem; padding: 0.2rem 0.5rem; margin-bottom: 0; white-space: nowrap;';
      mpHeader.appendChild(maxMpBtn);
      mpContainer.appendChild(mpHeader);

      const mpLevelLabels = ['Level 1', 'Level 2', 'Level 3', 'Level 4'];

      charData['mp'].forEach((rawByte, i) => {
        if (i < MP_LEVELS) {
          const mpDiv = document.createElement('div');
          mpDiv.className = 'json-item mp-level';
          mpDiv.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.45rem;';

          const label = document.createElement('label');
          label.textContent = mpLevelLabels[i];
          label.style.cssText = 'min-width: 58px; margin-bottom: 0; font-size: 0.8rem;';
          mpDiv.appendChild(label);

          let curMp = Math.min(9, (rawByte >> 4) & 0x0F);
          let maxMp = Math.min(9, rawByte & 0x0F);

          // Cur MP input (0-9)
          const curInput = document.createElement('input');
          curInput.type = 'number';
          curInput.min = '0';
          curInput.max = '9';
          curInput.value = curMp;
          curInput.title = 'Current MP charges (0–9)';
          curInput.style.cssText = 'width: 52px; margin-bottom: 0; padding: 0.2rem 0.35rem; font-size: 0.78rem; text-align: center;';

          const slashSpan = document.createElement('span');
          slashSpan.textContent = '/';
          slashSpan.style.fontWeight = 'bold';

          // Max MP input (0-9)
          const maxInput = document.createElement('input');
          maxInput.type = 'number';
          maxInput.min = '0';
          maxInput.max = '9';
          maxInput.value = maxMp;
          maxInput.title = 'Max MP capacity (0–9)';
          maxInput.style.cssText = 'width: 52px; margin-bottom: 0; padding: 0.2rem 0.35rem; font-size: 0.78rem; text-align: center;';

          // Clickable 0 button + 9 MP squares
          const squaresDiv = document.createElement('div');
          squaresDiv.className = 'mp-squares';
          squaresDiv.style.cssText = 'display: flex; align-items: center; gap: 3px; font-size: 0.95rem; line-height: 1; user-select: none;';

          const syncMpByte = (newCur, newMax) => {
            curMp = Math.max(0, Math.min(9, parseInt(newCur) || 0));
            maxMp = Math.max(0, Math.min(9, parseInt(newMax) || 0));
            curInput.value = curMp;
            maxInput.value = maxMp;
            const packed = (curMp << 4) | maxMp;
            charData['mp'][i] = packed;
            renderSquares();
          };

          const renderSquares = () => {
            squaresDiv.innerHTML = '';
            // Zero button
            const zeroBtn = document.createElement('span');
            zeroBtn.textContent = '0';
            zeroBtn.title = 'Set Level MP to 0/0';
            zeroBtn.style.cssText = 'font-size: 0.65rem; padding: 2px 4px; border-radius: 3px; background: rgba(0,0,0,0.2); cursor: pointer; color: var(--pico-muted-color); margin-right: 2px;';
            zeroBtn.addEventListener('click', () => syncMpByte(0, 0));
            squaresDiv.appendChild(zeroBtn);

            for (let sq = 1; sq <= MP_SQUARES_PER_LEVEL; sq++) {
              const square = document.createElement('span');
              const isFilled = sq <= curMp;
              const isWithinMax = sq <= maxMp;
              square.textContent = isFilled ? '■' : '□';
              square.style.cursor = 'pointer';
              square.style.color = isFilled
                ? 'var(--pico-primary)'
                : (isWithinMax ? '#f39c12' : 'var(--pico-muted-color)');
              square.title = `Click to set ${mpLevelLabels[i]} to ${sq}/${sq} MP (byte: ${(sq << 4) | sq})`;
              square.addEventListener('click', () => syncMpByte(sq, Math.max(sq, maxMp < sq ? sq : sq)));
              squaresDiv.appendChild(square);
            }
          };

          curInput.addEventListener('input', (e) => syncMpByte(e.target.value, maxMp));
          maxInput.addEventListener('input', (e) => syncMpByte(curMp, e.target.value));

          renderSquares();
          mpDiv.appendChild(curInput);
          mpDiv.appendChild(slashSpan);
          mpDiv.appendChild(maxInput);
          mpDiv.appendChild(squaresDiv);
          mpContainer.appendChild(mpDiv);

          mpSyncFns.push({
            heal: () => syncMpByte(maxMp, maxMp),
            maxAll: () => syncMpByte(9, 9)
          });
        }
      });

      maxMpBtn.addEventListener('click', () => {
        mpSyncFns.forEach(fn => fn.maxAll());
      });

      colMagic.appendChild(mpContainer);
    }

    // Weapon section (Weapon Level, Weapon Rune)
    const weaponContainer = document.createElement('div');
    weaponContainer.className = 'battle-character-weapon';
    weaponContainer.id = `char-${index}-weapon`;

    const weaponHeader = document.createElement('div');
    weaponHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;';
    const weaponTitle = document.createElement('strong');
    weaponTitle.style.fontSize = '0.82rem';
    weaponTitle.textContent = 'Weapon';
    weaponHeader.appendChild(weaponTitle);
    weaponContainer.appendChild(weaponHeader);

    let weaponLvInput = null;
    const isBeast = GameData && GameData.BEASTS && GameData.BEASTS.includes(index);

    if (charData['buki_lv'] !== undefined) {
      const weaponLvDiv = document.createElement('div');
      weaponLvDiv.className = 'json-item';
      const label = document.createElement('label');
      label.textContent = 'Weapon Level (1–16)';
      weaponLvDiv.appendChild(label);

      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.max = '16';
      input.value = charData['buki_lv'];
      input.addEventListener('input', (e) => {
        charData['buki_lv'] = parseFloat(e.target.value) || 0;
      });
      weaponLvInput = input;
      weaponLvDiv.appendChild(input);
      weaponContainer.appendChild(weaponLvDiv);
    }

    colGear.appendChild(weaponContainer);

    const runeSelectElements = [];
    let unlockAllRuneSlotsFn = () => {};
    let setAllAffinitiesRankAFn = () => {};

    // Render remaining properties of charData
    Object.keys(charData).forEach(prop => {
      if (['level', 'exp', 'max_hp', 'now_hp', 'todome', 'mp', 'buki_lv'].includes(prop)) return;

      if (prop === 'para' && Array.isArray(charData[prop])) {
        const paraContainer = document.createElement('div');
        paraContainer.className = 'battle-character-stats';
        paraContainer.id = `char-${index}-stats`;

        const statsHeader = document.createElement('div');
        statsHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin: 0.5rem 0 0.35rem 0; padding-top: 0.45rem; border-top: 1px dashed var(--pico-muted-border-color);';
        const statsTitle = document.createElement('strong');
        statsTitle.style.fontSize = '0.82rem';
        statsTitle.textContent = 'Stats';
        statsHeader.appendChild(statsTitle);
        paraContainer.appendChild(statsHeader);

        const statsGrid = document.createElement('div');
        statsGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem;';

        charData[prop].forEach((value, i) => {
          if (i < statLabels.length) {
            const statDiv = document.createElement('div');
            statDiv.style.cssText = 'display: flex; flex-direction: column; gap: 0.15rem;';
            const label = document.createElement('label');
            label.style.cssText = 'font-size: 0.72rem; margin-bottom: 0;';
            label.textContent = statLabels[i];
            statDiv.appendChild(label);

            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.max = '255';
            input.value = value;
            input.style.cssText = 'margin-bottom: 0; font-size: 0.75rem; padding: 0.2rem 0.35rem;';
            input.addEventListener('input', (e) => {
              charData[prop][i] = parseFloat(e.target.value) || 0;
            });
            statDiv.appendChild(input);
            statsGrid.appendChild(statDiv);
          }
        });
        paraContainer.appendChild(statsGrid);
        colGeneral.appendChild(paraContainer);
        return;
      }
      else if (prop === 'mon_eqp' && Array.isArray(charData[prop])) {
        const eqpContainer = document.createElement('div');
        eqpContainer.className = 'runes-equiped-section';
        eqpContainer.id = `char-${index}-runes`;

        const runesHeader = document.createElement('div');
        runesHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin: 0.5rem 0 0.35rem 0; padding-top: 0.45rem; border-top: 1px dashed var(--pico-muted-border-color);';
        const runesTitle = document.createElement('strong');
        runesTitle.style.fontSize = '0.82rem';
        runesTitle.textContent = 'Runes';
        runesHeader.appendChild(runesTitle);

        // Granular per-character Unlock Locked Runes / Bypass Restrictions toggle
        const bypassLabel = document.createElement('label');
        bypassLabel.style.cssText = 'display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; margin-bottom: 0; cursor: pointer; color: var(--pico-primary);';
        const bypassCb = document.createElement('input');
        bypassCb.type = 'checkbox';
        bypassCb.style.margin = '0';
        const bypassSpan = document.createElement('span');
        bypassSpan.textContent = '🔓 Allow Locked / Any Rune';
        bypassLabel.appendChild(bypassCb);
        bypassLabel.appendChild(bypassSpan);
        runesHeader.appendChild(bypassLabel);
        eqpContainer.appendChild(runesHeader);

        const rebuildRuneDropdowns = (allowAny) => {
          runeSelectElements.forEach(({ select, slotIdx }) => {
            const currentVal = charData[prop][slotIdx] || 0;
            select.innerHTML = '';
            const allowedRunes = filterRunesForCharacter(index, slotIdx, allowAny);

            let isLocked = false;
            if (!allowAny && currentVal && GameData?.RUNES?.[currentVal]) {
              const currentAttrs = GameData.RUNES[currentVal].attrs || [];
              isLocked = currentAttrs.includes('X');
            }

            // Ensure currently equipped rune is always in options even if restricted
            if (currentVal && !allowedRunes.some(r => r.id === currentVal) && GameData?.RUNES?.[currentVal]) {
              const rData = GameData.RUNES[currentVal];
              allowedRunes.push({
                id: currentVal,
                name: typeof rData === 'string' ? rData : rData.name,
                attrs: rData.attrs || []
              });
            }

            allowedRunes.forEach(rune => {
              const option = document.createElement('option');
              option.value = rune.id;
              option.textContent = `${rune.id}: ${rune.name}`;
              if (currentVal === rune.id) option.selected = true;
              select.appendChild(option);
            });

            if (isLocked && currentVal !== 0) {
              select.disabled = true;
              select.style.opacity = '0.6';
              select.style.cursor = 'not-allowed';
              select.title = 'Locked signature rune — check "Allow Locked / Any Rune" above to change';
            } else {
              select.disabled = false;
              select.style.opacity = '1';
              select.style.cursor = '';
              select.title = '';
              select.value = currentVal;
            }
          });
        };

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

            const select = document.createElement('select');
            select.style.marginBottom = '0';
            select.style.flex = '1';

            select.addEventListener('change', (e) => {
              charData[prop][i] = parseInt(e.target.value) || 0;
            });

            runeSelectElements.push({ select, slotIdx: i });
            eqpDiv.appendChild(select);
            eqpContainer.appendChild(eqpDiv);
          }
        });

        bypassCb.addEventListener('change', (e) => {
          rebuildRuneDropdowns(e.target.checked);
        });

        rebuildRuneDropdowns(false);
        colMagic.appendChild(eqpContainer);

        // Rune Slot Unlock Levels (mon_kosu_type[0..2]) directly underneath Runes
        if (koteiData && Array.isArray(koteiData.mon_kosu_type)) {
          const kosuContainer = document.createElement('div');
          kosuContainer.className = 'rune-slot-unlocks-section';
          kosuContainer.id = `char-${index}-rune-unlocks`;

          const kosuHeader = document.createElement('div');
          kosuHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin: 0.5rem 0 0.35rem 0; gap: 0.4rem; padding-top: 0.45rem; border-top: 1px dashed var(--pico-muted-border-color);';
          const kosuTitle = document.createElement('strong');
          kosuTitle.style.fontSize = '0.82rem';
          kosuTitle.textContent = 'Rune Slot Unlock Levels (mon_kosu_type)';
          kosuHeader.appendChild(kosuTitle);

          const unlockBtn = document.createElement('button');
          unlockBtn.type = 'button';
          unlockBtn.className = 'outline';
          unlockBtn.textContent = '⚡ Unlock All 3 at Lv 1';
          unlockBtn.style.cssText = 'font-size: 0.7rem; padding: 0.2rem 0.5rem; margin-bottom: 0; white-space: nowrap;';
          kosuHeader.appendChild(unlockBtn);
          kosuContainer.appendChild(kosuHeader);

          const kosuNote = document.createElement('p');
          kosuNote.style.cssText = 'font-size: 0.7rem; color: var(--pico-muted-color); margin: 0 0 0.5rem 0;';
          kosuNote.textContent = 'Level required to unlock each rune slot (1–99, or 100 = Never Unlocks).';
          kosuContainer.appendChild(kosuNote);

          const slotNames = ['Head Rune Unlock Lv:', 'Right Hand Unlock Lv:', 'Left Hand Unlock Lv:'];
          const kosuInputs = [];

          slotNames.forEach((sName, sIdx) => {
            const row = document.createElement('div');
            row.className = 'json-item';
            row.style.cssText = 'display: flex; gap: 1rem; align-items: center; margin-bottom: 0.35rem;';
            const lbl = document.createElement('span');
            lbl.style.cssText = 'font-weight: bold; min-width: 145px; font-size: 0.8rem;';
            lbl.textContent = sName;
            const inp = document.createElement('input');
            inp.type = 'number';
            inp.min = '1';
            inp.max = '100';
            inp.value = koteiData.mon_kosu_type[sIdx] ?? 1;
            inp.style.cssText = 'flex: 1; margin-bottom: 0; font-size: 0.8rem; padding: 0.25rem 0.5rem;';
            inp.addEventListener('input', (e) => {
              koteiData.mon_kosu_type[sIdx] = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
            });
            kosuInputs.push(inp);
            row.appendChild(lbl);
            row.appendChild(inp);
            kosuContainer.appendChild(row);
          });

          unlockAllRuneSlotsFn = () => {
            for (let s = 0; s < 3; s++) {
              koteiData.mon_kosu_type[s] = 1;
              if (kosuInputs[s]) kosuInputs[s].value = 1;
            }
          };

          unlockBtn.addEventListener('click', unlockAllRuneSlotsFn);
          colMagic.appendChild(kosuContainer);
        }

        return;
      }
      else if (prop === 'bogu_eqp' && Array.isArray(charData[prop])) {
        const boguContainer = document.createElement('div');
        boguContainer.className = 'equipment-worn-section';
        boguContainer.id = `char-${index}-equipment`;

        const equipmentHeader = document.createElement('div');
        equipmentHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin: 0.5rem 0 0.35rem 0; padding-top: 0.45rem; border-top: 1px dashed var(--pico-muted-border-color);';
        const equipmentTitle = document.createElement('strong');
        equipmentTitle.style.fontSize = '0.82rem';
        equipmentTitle.textContent = 'Equipment';
        equipmentHeader.appendChild(equipmentTitle);
        boguContainer.appendChild(equipmentHeader);

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

            const select = document.createElement('select');
            select.style.marginBottom = '0';
            select.style.flex = '1';

            const categoryData = GameData && GameData[equipmentSlots[i].category] ? GameData[equipmentSlots[i].category] : {};
            const shieldUsers = [2, 5, 7, 9, 12, 13, 23, 28, 33, 35, 39, 64];
            const isShieldSlot = i === 2;
            const canEquipShield = shieldUsers.includes(index) || (koteiData && ((koteiData.soubi_kanou & 32) !== 0));

            if (isBeast) {
              const option = document.createElement('option');
              option.value = 0;
              option.textContent = '0: None (Beast/Monster - Cannot equip)';
              option.selected = true;
              select.appendChild(option);
              select.disabled = true;
              select.style.opacity = '0.6';
              select.style.cursor = 'not-allowed';
              charData[prop][i] = 0;
            } else if (isShieldSlot && !canEquipShield) {
              const option = document.createElement('option');
              option.value = 0;
              option.textContent = '0: None (Cannot equip shields)';
              option.selected = true;
              select.appendChild(option);
              select.disabled = true;
              select.style.opacity = '0.6';
              select.style.cursor = 'not-allowed';
              charData[prop][i] = 0;
            } else {
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

                if ((equipmentSlots[i].category === 'ARMOR' || equipmentSlots[i].category === 'HELMET') && itemAttrs && itemAttrs.length > 0) {
                  const hasMatchingAttr = itemAttrs.some(attr => charAttrs.includes(attr));
                  if (!hasMatchingAttr && id !== '0') return;
                }

                const option = document.createElement('option');
                option.value = id;
                option.textContent = itemName;
                select.appendChild(option);
              });

              select.value = value || 0;
              select.addEventListener('change', (e) => {
                charData[prop][i] = parseInt(e.target.value) || 0;
              });
            }

            boguDiv.appendChild(select);
            boguContainer.appendChild(boguDiv);
          }
        });

        colGear.appendChild(boguContainer);
        return;
      }
      else if (prop === 'item_eqp' && Array.isArray(charData[prop])) {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'equip-accessories-section';
        itemContainer.id = `char-${index}-accessories`;

        const accessoriesHeader = document.createElement('div');
        accessoriesHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin: 0.5rem 0 0.35rem 0; padding-top: 0.45rem; border-top: 1px dashed var(--pico-muted-border-color);';
        const accessoriesTitle = document.createElement('strong');
        accessoriesTitle.style.fontSize = '0.82rem';
        accessoriesTitle.textContent = `Accessories [${charData[prop].length}]`;
        accessoriesHeader.appendChild(accessoriesTitle);
        itemContainer.appendChild(accessoriesHeader);

        if (isBeast) {
          const disabledMsg = document.createElement('p');
          disabledMsg.textContent = 'Beast/Monster character - Cannot equip accessories';
          disabledMsg.style.cssText = 'color: var(--pico-muted-color); font-style: italic; margin: 0.5rem 0;';
          itemContainer.appendChild(disabledMsg);
          colGear.appendChild(itemContainer);
          return;
        }

        charData[prop].forEach((item, i) => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'json-item';
          itemDiv.style.display = 'flex';
          itemDiv.style.gap = '0.45rem';
          itemDiv.style.alignItems = 'center';
          itemDiv.style.marginBottom = '0.4rem';
          itemDiv.style.flexWrap = 'wrap';

          const slotLabel = document.createElement('span');
          slotLabel.textContent = `Slot ${i + 1}:`;
          slotLabel.style.fontWeight = 'bold';
          slotLabel.style.minWidth = '52px';
          slotLabel.style.fontSize = '0.78rem';
          itemDiv.appendChild(slotLabel);

          const pickBtn = document.createElement('button');
          pickBtn.type = 'button';
          pickBtn.textContent = '🔍 Pick';
          pickBtn.style.cssText = 'padding: 0.2rem 0.5rem; font-size: 0.72rem; margin-bottom: 0; white-space: nowrap;';
          itemDiv.appendChild(pickBtn);

          const clearBtn = document.createElement('button');
          clearBtn.type = 'button';
          clearBtn.className = 'outline secondary';
          clearBtn.textContent = '✕';
          clearBtn.title = 'Clear / Unequip Accessory';
          clearBtn.style.cssText = 'padding: 0.2rem 0.45rem; font-size: 0.72rem; margin-bottom: 0; line-height: 1;';
          itemDiv.appendChild(clearBtn);

          const itemDesc = document.createElement('div');
          itemDesc.style.cssText = 'display: flex; align-items: baseline; gap: 0.35rem; flex-wrap: wrap; flex: 1; min-width: 140px; font-size: 0.78rem;';

          const itemName = document.createElement('span');
          const itemMeta = document.createElement('span');
          itemMeta.style.cssText = 'font-size: 0.7rem; color: var(--pico-muted-color);';

          itemDesc.appendChild(itemName);
          itemDesc.appendChild(itemMeta);
          itemDiv.appendChild(itemDesc);

          const getItemName = (id, cnt) => {
            if (id === 0) return 'None (Empty)';
            if (cnt === 16 && GameData?.OTHER_EQUIP_GEAR?.[id]) {
              return GameData.OTHER_EQUIP_GEAR[id];
            } else if (cnt <= 9 && GameData?.ITEMS?.[id]) {
              const it = GameData.ITEMS[id];
              return typeof it === 'string' ? it : (it.name || `Item ${id}`);
            } else if (cnt >= 100 && GameData?.FOOD?.[id]) {
              const it = GameData.FOOD[id];
              return typeof it === 'string' ? it : (it.name || `Item ${id}`);
            }
            return `Item ${id}`;
          };

          const updateDisplay = () => {
            const id = item.item_no || 0;
            const cnt = item.use_cnt || 0;
            if (id === 0) {
              itemName.textContent = 'None (Empty)';
              itemName.style.fontStyle = 'italic';
              itemName.style.color = 'var(--pico-muted-color)';
              itemName.style.fontWeight = 'normal';
              itemMeta.textContent = '';
              clearBtn.style.display = 'none';
            } else {
              itemName.textContent = getItemName(id, cnt);
              itemName.style.fontStyle = 'normal';
              itemName.style.color = 'var(--pico-color)';
              itemName.style.fontWeight = '600';
              itemMeta.textContent = `(#${id} · use_cnt: ${cnt})`;
              clearBtn.style.display = '';
            }
          };

          pickBtn.addEventListener('click', (e) => {
            e.preventDefault();
            createAccessoryPickerDialog(item.item_no, item.use_cnt, (selectedItem) => {
              item.item_no = selectedItem.id;
              item.use_cnt = selectedItem.useCnt;
              updateDisplay();
              if (updateCallback) updateCallback();
            });
          });

          clearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            item.item_no = 0;
            item.use_cnt = 0;
            updateDisplay();
            if (updateCallback) updateCallback();
          });

          updateDisplay();
          itemContainer.appendChild(itemDiv);
        });

        colGear.appendChild(itemContainer);
        return;
      }
      else if (prop === 'buki_mon') {
        const weaponRuneDiv = document.createElement('div');
        weaponRuneDiv.className = 'json-item';

        const label = document.createElement('label');
        label.textContent = 'Weapon Rune';
        weaponRuneDiv.appendChild(label);

        const select = document.createElement('select');
        select.style.marginBottom = '0';

        if (isBeast) {
          const option = document.createElement('option');
          option.value = 0;
          option.textContent = '0: None (Beast/Monster - Cannot equip)';
          option.selected = true;
          select.appendChild(option);
          select.disabled = true;
          select.style.opacity = '0.6';
          select.style.cursor = 'not-allowed';
          charData[prop] = 0;
        } else {
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
            if (charData[prop] === rune.id) option.selected = true;
            select.appendChild(option);
          });

          select.addEventListener('change', (e) => {
            charData[prop] = parseInt(e.target.value) || 0;
          });
        }

        weaponRuneDiv.appendChild(select);
        weaponContainer.appendChild(weaponRuneDiv);
        return;
      }
      else {
        const displayLabel = fieldConfig[prop]?.label || prop;
        const el = createElementForValue(charData[prop], displayLabel, (newValue) => {
          charData[prop] = newValue;
        }, charData);
        colGeneral.appendChild(el);
      }
    });

    columnsContainer.appendChild(colGeneral);
    columnsContainer.appendChild(colMagic);
    columnsContainer.appendChild(colGear);
    charDetails.appendChild(columnsContainer);

    // =========================================================================
    // ARCHETYPE, SLOT LOCKS & AFFINITY EDITOR (c_kotei_dat[index])
    // =========================================================================
    if (koteiData) {
      const koteiDetails = document.createElement('details');
      koteiDetails.className = 'json-object kotei-archetype-section';
      koteiDetails.style.cssText = 'margin-top: 1rem; border-top: 1px dashed var(--pico-muted-border-color); padding-top: 0.75rem;';

      const koteiSummary = document.createElement('summary');
      koteiSummary.innerHTML = '<strong>⚙️ Advanced Archetype: Slot Locks, Gear Permissions & Elemental Affinities (c_kotei_dat)</strong>';
      koteiDetails.appendChild(koteiSummary);

      const koteiGrid = document.createElement('div');
      koteiGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 1rem; padding-top: 0.75rem;';

      // 1. Elemental Rune Affinities (mon_zoku_aisyo[0..3] — 8 packed nibbles)
      if (Array.isArray(koteiData.mon_zoku_aisyo)) {
        const aisyoCard = document.createElement('div');
        aisyoCard.style.cssText = 'padding: 0.75rem; background: rgba(0,0,0,0.15); border-radius: 6px;';

        const aisyoHeader = document.createElement('div');
        aisyoHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; gap: 0.4rem; flex-wrap: wrap;';
        const aisyoTitle = document.createElement('strong');
        aisyoTitle.style.fontSize = '0.82rem';
        aisyoTitle.textContent = 'Elemental Rune Affinities (mon_zoku_aisyo)';
        aisyoHeader.appendChild(aisyoTitle);

        const rankABtn = document.createElement('button');
        rankABtn.type = 'button';
        rankABtn.className = 'outline';
        rankABtn.textContent = '✨ All Rank A';
        rankABtn.style.cssText = 'font-size: 0.7rem; padding: 0.2rem 0.5rem; margin-bottom: 0;';
        aisyoHeader.appendChild(rankABtn);
        aisyoCard.appendChild(aisyoHeader);

        const elements = [
          { name: '🔥 Fire', byteIdx: 0, isHigh: true },
          { name: '💧 Water', byteIdx: 0, isHigh: false },
          { name: '🌪️ Wind', byteIdx: 1, isHigh: true },
          { name: '🪨 Earth', byteIdx: 1, isHigh: false },
          { name: '⚡ Lightning', byteIdx: 2, isHigh: true },
          { name: '✨ Resurrection', byteIdx: 2, isHigh: false },
          { name: '🌑 Darkness', byteIdx: 3, isHigh: true },
          { name: '⭐ Special', byteIdx: 3, isHigh: false }
        ];

        const rankOptions = [
          { val: 0, label: '0: Unrated (Default)' },
          { val: 1, label: '1: Rank A (+40% Dmg & Bonus)' },
          { val: 2, label: '2: Rank B (+20% Dmg)' },
          { val: 3, label: '3: Rank C (100% Normal)' },
          { val: 4, label: '4: Rank D (-20% Dmg)' },
          { val: 5, label: '5: Rank E (-20% & Backfire!)' }
        ];

        const elGrid = document.createElement('div');
        elGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;';

        const affinitySelects = [];

        const getNibble = (bIdx, isHigh) => {
          const b = koteiData.mon_zoku_aisyo[bIdx] || 0;
          return isHigh ? ((b >> 4) & 0x0F) : (b & 0x0F);
        };

        const setNibble = (bIdx, isHigh, nibbleVal) => {
          const b = koteiData.mon_zoku_aisyo[bIdx] || 0;
          const v = Math.max(0, Math.min(15, parseInt(nibbleVal) || 0));
          koteiData.mon_zoku_aisyo[bIdx] = isHigh ? ((b & 0x0F) | (v << 4)) : ((b & 0xF0) | v);
        };

        elements.forEach(elCfg => {
          const itemDiv = document.createElement('div');
          itemDiv.style.cssText = 'display: flex; flex-direction: column; gap: 0.15rem;';
          const lbl = document.createElement('label');
          lbl.style.cssText = 'font-size: 0.72rem; margin-bottom: 0;';
          lbl.textContent = elCfg.name;

          const sel = document.createElement('select');
          sel.style.cssText = 'margin-bottom: 0; font-size: 0.72rem; padding: 0.2rem 0.35rem;';
          rankOptions.forEach(ro => {
            const opt = document.createElement('option');
            opt.value = ro.val;
            opt.textContent = ro.label;
            sel.appendChild(opt);
          });
          sel.value = getNibble(elCfg.byteIdx, elCfg.isHigh);
          sel.addEventListener('change', (e) => {
            setNibble(elCfg.byteIdx, elCfg.isHigh, e.target.value);
          });

          affinitySelects.push({ sel, elCfg });
          itemDiv.appendChild(lbl);
          itemDiv.appendChild(sel);
          elGrid.appendChild(itemDiv);
        });

        setAllAffinitiesRankAFn = () => {
          for (let b = 0; b < 4; b++) koteiData.mon_zoku_aisyo[b] = 0x11; // Both nibbles = 1 (Rank A)
          affinitySelects.forEach(({ sel }) => { sel.value = 1; });
        };

        rankABtn.addEventListener('click', setAllAffinitiesRankAFn);
        aisyoCard.appendChild(elGrid);
        koteiGrid.appendChild(aisyoCard);
      }

      // 2. Slot Locks Bitmask (soubi_henkou — 8 granular bit checkboxes)
      if (koteiData.soubi_henkou !== undefined) {
        const henkouCard = document.createElement('div');
        henkouCard.style.cssText = 'padding: 0.75rem; background: rgba(0,0,0,0.15); border-radius: 6px;';

        const henkouHeader = document.createElement('div');
        henkouHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; gap: 0.4rem;';
        const henkouTitle = document.createElement('strong');
        henkouTitle.style.fontSize = '0.82rem';
        henkouTitle.textContent = 'Slot Locks in Menu (soubi_henkou)';
        henkouHeader.appendChild(henkouTitle);

        const unlockSlotsBtn = document.createElement('button');
        unlockSlotsBtn.type = 'button';
        unlockSlotsBtn.className = 'outline';
        unlockSlotsBtn.textContent = '🔓 Unlock All (0)';
        unlockSlotsBtn.style.cssText = 'font-size: 0.7rem; padding: 0.2rem 0.5rem; margin-bottom: 0;';
        henkouHeader.appendChild(unlockSlotsBtn);
        henkouCard.appendChild(henkouHeader);

        const lockBits = [
          'Lock Helmet (Bit 0)',
          'Lock Armor (Bit 1)',
          'Lock Shield (Bit 2)',
          'Lock Head Rune (Bit 3)',
          'Lock Right Hand Rune (Bit 4)',
          'Lock Left Hand Rune (Bit 5)',
          'Lock Accessories (Bit 6)',
          'Lock Weapon Rune (Bit 7)'
        ];

        const bitGrid = document.createElement('div');
        bitGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 0.3rem;';
        const cbs = [];

        lockBits.forEach((bLabel, bit) => {
          const lbl = document.createElement('label');
          lbl.style.cssText = 'display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; cursor: pointer; margin-bottom: 0;';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.style.margin = '0';
          cb.checked = ((koteiData.soubi_henkou || 0) & (1 << bit)) !== 0;
          cb.addEventListener('change', (e) => {
            if (e.target.checked) {
              koteiData.soubi_henkou = (koteiData.soubi_henkou || 0) | (1 << bit);
            } else {
              koteiData.soubi_henkou = (koteiData.soubi_henkou || 0) & ~(1 << bit);
            }
          });
          const sp = document.createElement('span');
          sp.textContent = bLabel;
          lbl.appendChild(cb);
          lbl.appendChild(sp);
          bitGrid.appendChild(lbl);
          cbs.push(cb);
        });

        unlockSlotsBtn.addEventListener('click', () => {
          koteiData.soubi_henkou = 0;
          cbs.forEach(cb => { cb.checked = false; });
        });

        henkouCard.appendChild(bitGrid);
        koteiGrid.appendChild(henkouCard);
      }

      // 3. Equippable Gear Permissions (soubi_kanou — 6 granular bit checkboxes)
      if (koteiData.soubi_kanou !== undefined) {
        const kanouCard = document.createElement('div');
        kanouCard.style.cssText = 'padding: 0.75rem; background: rgba(0,0,0,0.15); border-radius: 6px;';

        const kanouHeader = document.createElement('div');
        kanouHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; gap: 0.4rem;';
        const kanouTitle = document.createElement('strong');
        kanouTitle.style.fontSize = '0.82rem';
        kanouTitle.textContent = 'Equippable Gear Classes (soubi_kanou)';
        kanouHeader.appendChild(kanouTitle);

        const allowAllGearBtn = document.createElement('button');
        allowAllGearBtn.type = 'button';
        allowAllGearBtn.className = 'outline';
        allowAllGearBtn.textContent = '🛡️ Allow All (63)';
        allowAllGearBtn.style.cssText = 'font-size: 0.7rem; padding: 0.2rem 0.5rem; margin-bottom: 0;';
        kanouHeader.appendChild(allowAllGearBtn);
        kanouCard.appendChild(kanouHeader);

        const gearBits = [
          'Heavy Helmet [E] (Bit 0)',
          'Cap / Hat [C] (Bit 1)',
          'Heavy Armor [H] (Bit 2)',
          'Light Armor [L] (Bit 3)',
          'Robe [R] (Bit 4)',
          'Shield [S] (Bit 5)'
        ];

        const bitGrid = document.createElement('div');
        bitGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 0.3rem;';
        const cbs = [];

        gearBits.forEach((bLabel, bit) => {
          const lbl = document.createElement('label');
          lbl.style.cssText = 'display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; cursor: pointer; margin-bottom: 0;';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.style.margin = '0';
          cb.checked = ((koteiData.soubi_kanou || 0) & (1 << bit)) !== 0;
          cb.addEventListener('change', (e) => {
            if (e.target.checked) {
              koteiData.soubi_kanou = (koteiData.soubi_kanou || 0) | (1 << bit);
            } else {
              koteiData.soubi_kanou = (koteiData.soubi_kanou || 0) & ~(1 << bit);
            }
          });
          const sp = document.createElement('span');
          sp.textContent = bLabel;
          lbl.appendChild(cb);
          lbl.appendChild(sp);
          bitGrid.appendChild(lbl);
          cbs.push(cb);
        });

        allowAllGearBtn.addEventListener('click', () => {
          koteiData.soubi_kanou = 63;
          cbs.forEach(cb => { cb.checked = true; });
        });

        kanouCard.appendChild(bitGrid);
        koteiGrid.appendChild(kanouCard);
      }

      koteiDetails.appendChild(koteiGrid);
      charDetails.appendChild(koteiDetails);
    }

    charControllers.push({
      charDetails,
      updateRecruitmentStatus: () => updateCharRecruitmentStatus(index, charDetails, statusSpan, recruitSelect),
      healHpMp: () => {
        if (charData.max_hp !== undefined) {
          charData.now_hp = charData.max_hp;
          if (generalInputs.now_hp) generalInputs.now_hp.value = charData.max_hp;
        }
        mpSyncFns.forEach(fn => fn.heal());
      },
      maxWeapon: () => {
        if (!isBeast && charData.buki_lv !== undefined) {
          charData.buki_lv = 16;
          if (weaponLvInput) weaponLvInput.value = 16;
        }
      },
      unlockAllRuneSlots: unlockAllRuneSlotsFn,
      setAllAffinitiesRankA: setAllAffinitiesRankAFn
    });

    container.appendChild(charDetails);
  }

  if (arr.length > 84) {
    const note = document.createElement('p');
    note.textContent = `Note: Showing only first 83 playable characters. ${arr.length - 84} non-playable slots hidden.`;
    note.style.fontStyle = 'italic';
    note.style.color = 'var(--pico-muted-color)';
    container.appendChild(note);
  }

  // Combined Search + Type Filter logic
  const applyFilters = () => {
    const filterValue = filterSelect.value;
    const query = searchInput.value.trim().toLowerCase();

    charControllers.forEach(({ charDetails }) => {
      let matchesType = false;
      if (filterValue === 'all') matchesType = true;
      else if (filterValue === 'recruited' && charDetails.dataset.isRecruited === 'true') matchesType = true;
      else if (filterValue === 'M' && charDetails.dataset.isMale === 'true') matchesType = true;
      else if (filterValue === 'F' && charDetails.dataset.isFemale === 'true') matchesType = true;
      else if (filterValue === 'K' && charDetails.dataset.isKobold === 'true') matchesType = true;
      else if (filterValue === 'W' && charDetails.dataset.isWinger === 'true') matchesType = true;
      else if (filterValue === 'Z' && charDetails.dataset.isMonster === 'true') matchesType = true;
      else if (filterValue === 'N' && charDetails.dataset.isNoble === 'true') matchesType = true;

      const matchesSearch = !query || charDetails.dataset.searchText.includes(query);
      charDetails.style.display = (matchesType && matchesSearch) ? '' : 'none';
    });
  };

  filterSelect.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);

  const refreshAllRecruitmentStatuses = () => {
    leonaCheckbox.checked = localStorage.getItem('recruitment_better_leona') === 'true';
    krakenCheckbox.checked = localStorage.getItem('recruitment_kraken_patch') === 'true';
    charControllers.forEach(c => {
      if (c.updateRecruitmentStatus) c.updateRecruitmentStatus();
    });
    applyFilters();
  };

  window.addEventListener('recruitment-mods-changed', refreshAllRecruitmentStatuses);
  window.addEventListener('recruitment-flags-changed', refreshAllRecruitmentStatuses);

  return container;
}
