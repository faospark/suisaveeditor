import GameData from '../gamedata.js';
import { CHAR_INDEX, RECRUIT_STATUS } from '../config/constants.js';

/**
 * Creates the recruitment editor interface
 * Displays recruitment status flags for all characters in a table
 * 
 * @param {Array<number>} arr - Array of recruitment flag values (one per character)
 * @param {string} key - Label for the editor section
 * @param {Function} updateCallback - Callback function when values change
 * @returns {HTMLElement} - The recruitment editor container
 */
/**
 * Creates the recruitment editor interface
 * Displays recruitment status flags for all characters in a table
 * 
 * @param {Array<number>} arr - Array of recruitment flag values (one per character)
 * @param {string} key - Label for the editor section
 * @param {Function} updateCallback - Callback function when values change
 * @param {Object} gameData - Full game data object for checking Hero Name
 * @returns {HTMLElement} - The recruitment editor container
 */
export function createRecruitmentEditor(arr, key, updateCallback, gameData = null) {
  const container = document.createElement('div');
  container.className = 'recruitment-editor-section';

  // Add title
  const title = document.createElement('h3');
  title.textContent = `${key} [${arr.length} characters]`;
  title.style.cssText = 'margin: 0 0 1rem 0; font-size: 1.25rem;';
  container.appendChild(title);

  // Check if Hero Name (Suikoden 1) is set
  const macdName = gameData?.game_data?.macd_name || '';
  const hasMcDohl = macdName && macdName.trim().length > 0;

  // Add radio buttons for recruitment options
  const optionsContainer = document.createElement('div');
  optionsContainer.style.cssText = 'margin-bottom: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.1); border-radius: 6px;';
  
  const optionsTitle = document.createElement('h4');
  optionsTitle.textContent = 'Recruitment Options';
  optionsTitle.style.cssText = 'margin: 0 0 0.75rem 0; font-size: 1rem;';
  optionsContainer.appendChild(optionsTitle);

  // Better Leona Option
  const leonaLabel = document.createElement('label');
  leonaLabel.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer;';
  const leonaRadio = document.createElement('input');
  leonaRadio.type = 'checkbox';
  leonaRadio.id = 'better-leona-option';
  leonaRadio.style.cssText = 'margin: 0;';
  // Load saved state from localStorage
  leonaRadio.checked = localStorage.getItem('recruitment_better_leona') === 'true';
  // Save state when changed
  leonaRadio.addEventListener('change', (e) => {
    localStorage.setItem('recruitment_better_leona', e.target.checked);
  });
  leonaLabel.appendChild(leonaRadio);
  const leonaText = document.createElement('span');
  leonaText.innerHTML = '<strong>Better Leona Option</strong> - If Valeria or Kasumi is recruited, recruit the other via SFix';
  leonaLabel.appendChild(leonaText);
  optionsContainer.appendChild(leonaLabel);

  // Kraken Patch
  const krakenLabel = document.createElement('label');
  krakenLabel.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; cursor: pointer;';
  const krakenRadio = document.createElement('input');
  krakenRadio.type = 'checkbox';
  krakenRadio.id = 'kraken-patch';
  krakenRadio.style.cssText = 'margin: 0;';
  // Load saved state from localStorage
  krakenRadio.checked = localStorage.getItem('recruitment_kraken_patch') === 'true';
  // Save state when changed
  krakenRadio.addEventListener('change', (e) => {
    localStorage.setItem('recruitment_kraken_patch', e.target.checked);
  });
  krakenLabel.appendChild(krakenRadio);
  const krakenText = document.createElement('span');
  krakenText.innerHTML = '<strong>Kraken Patch</strong> - If Chuchara is recruited, also recruit Abizaboah and Rulodia';
  krakenLabel.appendChild(krakenText);
  optionsContainer.appendChild(krakenLabel);

  container.appendChild(optionsContainer);

  // Add description for recruitment status values
  const description = document.createElement('p');
  description.style.cssText = 'font-size: 0.85rem; color: var(--pico-muted-color); margin-bottom: 1rem;';
  description.innerHTML = `<strong>Recruitment Status Values:</strong><br>
    • 1: Spoke to<br>
    • 70: Auto Join<br>
    • 71: Manual Recruit<br>
    • 86: Event Locked Not Party<br>
    • 212: Deceased<br>
    • 213: On Leave`;
  container.appendChild(description);

  const table = document.createElement('table');
  
  // Use character names for recruitment display to avoid redundant tables
  const lookupTable = typeof GameData !== 'undefined' ? GameData.CHARACTERS : null;
  
  // Function to rebuild table body with updated status indicators
  const rebuildTableBody = () => {
    const existingBody = table.querySelector('tbody');
    if (existingBody) {
      existingBody.remove();
    }
    
    const tbody = document.createElement('tbody');
    
    arr.forEach((flagValue, index) => {
      // Skip index 0 (not a valid character)
      if (index === 0) return;

      const tr = document.createElement('tr');

      // Index column
      const tdIndex = document.createElement('td');
      tdIndex.textContent = index;
      tdIndex.style.fontWeight = 'bold';
      tdIndex.style.width = '60px';
      tdIndex.textContent = index;
      tr.appendChild(tdIndex);

      // Character name column with recruitment status
      const tdName = document.createElement('td');
      const charEntry = lookupTable && lookupTable[index];
      const charName = charEntry ? (typeof charEntry === 'string' ? charEntry : (charEntry.name || `Character ${index}`)) : `Character ${index}`;
      
      // Create flex container for name and status
      const nameContainer = document.createElement('div');
      nameContainer.style.cssText = 'display: flex; justify-content: space-between; align-items: center; gap: 1rem;';
      
      const nameSpan = document.createElement('span');
      nameSpan.textContent = charName;
      nameSpan.style.fontStyle = 'italic';
      nameSpan.style.color = 'var(--pico-muted-color)';
      nameContainer.appendChild(nameSpan);
      
      // Add recruitment status indicator
      const statusSpan = document.createElement('span');
      statusSpan.style.cssText = 'font-size: 0.85rem; font-weight: 600;';
      
      // Get checkbox states
      const betterLeonaEnabled = document.getElementById('better-leona-option')?.checked || false;
      const krakenPatchEnabled = document.getElementById('kraken-patch')?.checked || false;
      
      // Check for special mod/import cases
      let isSpecialCase = false;
      
      // McDohl and Gremio: Available if Hero Name 1 is set
      if ((index === CHAR_INDEX.MCDOHL || index === CHAR_INDEX.GREMIO) && hasMcDohl && (flagValue === RECRUIT_STATUS.NOT_RECRUITED || flagValue === RECRUIT_STATUS.SPOKE_TO)) {
        statusSpan.textContent = '✓ Available (Import)';
        statusSpan.style.color = 'var(--pico-ins-color)';
        isSpecialCase = true;
      }
      
      // Better Leona Option: Valeria or Kasumi
      if (betterLeonaEnabled && !isSpecialCase) {
        const valeriaFlag = arr[CHAR_INDEX.VALERIA];
        const kasumiFlag = arr[CHAR_INDEX.KASUMI];
        
        if (index === CHAR_INDEX.VALERIA && (kasumiFlag === RECRUIT_STATUS.AUTO_JOIN || kasumiFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && flagValue !== RECRUIT_STATUS.AUTO_JOIN && flagValue !== RECRUIT_STATUS.MANUAL_RECRUIT) {
          statusSpan.textContent = '✓ Recruited Via SFix';
          statusSpan.style.color = 'var(--pico-ins-color)';
          statusSpan.title = 'Automatically recruited via Better Leona Option';
          isSpecialCase = true;
        } else if (index === CHAR_INDEX.KASUMI && (valeriaFlag === RECRUIT_STATUS.AUTO_JOIN || valeriaFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && flagValue !== RECRUIT_STATUS.AUTO_JOIN && flagValue !== RECRUIT_STATUS.MANUAL_RECRUIT) {
          statusSpan.textContent = '✓ Recruited Via SFix';
          statusSpan.style.color = 'var(--pico-ins-color)';
          statusSpan.title = 'Automatically recruited via Better Leona Option';
          isSpecialCase = true;
        }
      }
      
      // Kraken Patch: Abizboah and Rulodia if Chuchara recruited
      if (krakenPatchEnabled && !isSpecialCase) {
        const chucharaFlag = arr[CHAR_INDEX.CHUCHARA];
        
        if ((index === CHAR_INDEX.ABIZBOAH || index === CHAR_INDEX.RULODIA) && (chucharaFlag === RECRUIT_STATUS.AUTO_JOIN || chucharaFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && flagValue !== RECRUIT_STATUS.AUTO_JOIN && flagValue !== RECRUIT_STATUS.MANUAL_RECRUIT) {
          statusSpan.textContent = '✓ Recruited Via Kraken';
          statusSpan.style.color = 'var(--pico-ins-color)';
          statusSpan.title = 'Automatically recruited via Kraken Patch';
          isSpecialCase = true;
        }
      }
      
      // Normal recruitment status values if not a special case:
      // 1: Spoke to, 70: Auto Join, 71: Manual Recruit, 86: Event Locked Not Party, 212: Deceased, 213: On Leave
      if (!isSpecialCase) {
        if (flagValue === RECRUIT_STATUS.AUTO_JOIN || flagValue === RECRUIT_STATUS.MANUAL_RECRUIT) {
          statusSpan.textContent = '✓ Recruited';
          statusSpan.style.color = 'var(--pico-ins-color)';
        } else if (flagValue === RECRUIT_STATUS.ON_LEAVE) {
          statusSpan.textContent = '📋 On Leave';
          statusSpan.style.color = '#f39c12';
        } else if (flagValue === RECRUIT_STATUS.DECEASED) {
          statusSpan.textContent = '☠ Deceased';
          statusSpan.style.color = 'var(--pico-del-color)';
        } else if (flagValue === RECRUIT_STATUS.EVENT_LOCKED) {
          statusSpan.textContent = '🔒 Event Locked';
          statusSpan.style.color = '#e67e22';
        } else if (flagValue === RECRUIT_STATUS.SPOKE_TO) {
          statusSpan.textContent = '💬 Spoke To';
          statusSpan.style.color = '#95a5a6';
        } else {
          statusSpan.textContent = '✗ Not Recruited';
          statusSpan.style.color = 'var(--pico-muted-color)';
        }
      }
      
      nameContainer.appendChild(statusSpan);
      tdName.appendChild(nameContainer);
      tr.appendChild(tdName);

      // Flag value input column
      const tdFlag = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.value = flagValue;
      input.style.marginBottom = '0';
      input.style.padding = '0.25rem';
      input.style.width = '80px';
      input.addEventListener('input', (e) => {
        const newStatus = parseFloat(e.target.value) || 0;
        arr[index] = newStatus;
        
        // Update current row's status span
        const updateStatusSpan = (span, charIndex, status) => {
          const betterLeonaEnabled = document.getElementById('better-leona-option')?.checked || false;
          const krakenPatchEnabled = document.getElementById('kraken-patch')?.checked || false;
          let isSpecialCase = false;
          
          // McDohl and Gremio: Available if Hero Name 1 is set
          if ((charIndex === CHAR_INDEX.MCDOHL || charIndex === CHAR_INDEX.GREMIO) && hasMcDohl && (status === RECRUIT_STATUS.NOT_RECRUITED || status === RECRUIT_STATUS.SPOKE_TO)) {
            span.textContent = '✓ Available (Import)';
            span.style.color = 'var(--pico-ins-color)';
            isSpecialCase = true;
          }
          
          // Better Leona Option: Valeria or Kasumi
          if (betterLeonaEnabled && !isSpecialCase) {
            const valeriaFlag = arr[CHAR_INDEX.VALERIA];
            const kasumiFlag = arr[CHAR_INDEX.KASUMI];
            
            if (charIndex === CHAR_INDEX.VALERIA && (kasumiFlag === RECRUIT_STATUS.AUTO_JOIN || kasumiFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && status !== RECRUIT_STATUS.AUTO_JOIN && status !== RECRUIT_STATUS.MANUAL_RECRUIT) {
              span.textContent = '✓ Recruited Via SFix';
              span.style.color = 'var(--pico-ins-color)';
              span.title = 'Automatically recruited via Better Leona Option';
              isSpecialCase = true;
            } else if (charIndex === CHAR_INDEX.KASUMI && (valeriaFlag === RECRUIT_STATUS.AUTO_JOIN || valeriaFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && status !== RECRUIT_STATUS.AUTO_JOIN && status !== RECRUIT_STATUS.MANUAL_RECRUIT) {
              span.textContent = '✓ Recruited Via SFix';
              span.style.color = 'var(--pico-ins-color)';
              span.title = 'Automatically recruited via Better Leona Option';
              isSpecialCase = true;
            }
          }
          
          // Kraken Patch: Abizboah and Rulodia if Chuchara recruited
          if (krakenPatchEnabled && !isSpecialCase) {
            const chucharaFlag = arr[CHAR_INDEX.CHUCHARA];
            
            if ((charIndex === CHAR_INDEX.ABIZBOAH || charIndex === CHAR_INDEX.RULODIA) && (chucharaFlag === RECRUIT_STATUS.AUTO_JOIN || chucharaFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && status !== RECRUIT_STATUS.AUTO_JOIN && status !== RECRUIT_STATUS.MANUAL_RECRUIT) {
              span.textContent = '✓ Recruited Via Kraken';
              span.style.color = 'var(--pico-ins-color)';
              span.title = 'Automatically recruited via Kraken Patch';
              isSpecialCase = true;
            }
          }
          
          // Normal recruitment status values if not a special case
          if (!isSpecialCase) {
            if (status === RECRUIT_STATUS.AUTO_JOIN || status === RECRUIT_STATUS.MANUAL_RECRUIT) {
              span.textContent = '✓ Recruited';
              span.style.color = 'var(--pico-ins-color)';
            } else if (status === RECRUIT_STATUS.ON_LEAVE) {
              span.textContent = '📋 On Leave';
              span.style.color = '#f39c12';
            } else if (status === RECRUIT_STATUS.DECEASED) {
              span.textContent = '☠ Deceased';
              span.style.color = 'var(--pico-del-color)';
            } else if (status === RECRUIT_STATUS.EVENT_LOCKED) {
              span.textContent = '🔒 Event Locked';
              span.style.color = '#e67e22';
            } else if (status === RECRUIT_STATUS.SPOKE_TO) {
              span.textContent = '💬 Spoke To';
              span.style.color = '#95a5a6';
            } else {
              span.textContent = '✗ Not Recruited';
              span.style.color = 'var(--pico-muted-color)';
            }
          }
        };
        
        // Update current row
        updateStatusSpan(statusSpan, index, newStatus);
        
        // If editing Valeria or Kasumi, update the other's status
        if (index === CHAR_INDEX.VALERIA || index === CHAR_INDEX.KASUMI) {
          const otherIndex = index === CHAR_INDEX.VALERIA ? CHAR_INDEX.KASUMI : CHAR_INDEX.VALERIA;
          const otherRow = tbody.querySelector(`tr:nth-child(${otherIndex})`);
          if (otherRow) {
            const otherStatusSpan = otherRow.querySelector('td:nth-child(2) > div > span:last-child');
            if (otherStatusSpan) {
              updateStatusSpan(otherStatusSpan, otherIndex, arr[otherIndex]);
            }
          }
        }
        
        // If editing Chuchara, update Abizboah and Rulodia
        if (index === CHAR_INDEX.CHUCHARA) {
          [CHAR_INDEX.ABIZBOAH, CHAR_INDEX.RULODIA].forEach(relatedIndex => {
            const relatedRow = tbody.querySelector(`tr:nth-child(${relatedIndex})`);
            if (relatedRow) {
              const relatedStatusSpan = relatedRow.querySelector('td:nth-child(2) > div > span:last-child');
              if (relatedStatusSpan) {
                updateStatusSpan(relatedStatusSpan, relatedIndex, arr[relatedIndex]);
              }
            }
          });
        }
        
        if (updateCallback) updateCallback();
      });
      tdFlag.appendChild(input);
      tr.appendChild(tdFlag);

      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
  };
  
  // Add event listeners to checkboxes to update display
  leonaRadio.addEventListener('change', rebuildTableBody);
  krakenRadio.addEventListener('change', rebuildTableBody);
  table.className = 'striped';
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');

  const headers = ['Index', 'Character Name', 'Recruitment Flag'];
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  // Initial build of table body
  rebuildTableBody();

  container.appendChild(table);

  return container;
}
