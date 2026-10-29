import GameData from '../gamedata.js';
import { CHAR_INDEX, RECRUIT_STATUS } from '../config/constants.js';

/**
 * Creates the recruitment editor interface with portrait cards and live filtering.
 * Replaces the old HTML table with responsive cards displaying character portraits,
 * recruitment badges, and instant status selectors.
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

  // Section Title
  const title = document.createElement('h3');
  title.textContent = `${key} [${Math.max(0, arr.length - 1)} characters]`;
  title.style.cssText = 'margin: 0 0 1rem 0; font-size: 1.25rem;';
  container.appendChild(title);

  // Check if Hero Name (Suikoden 1) is set
  const macdName = gameData?.game_data?.macd_name || '';
  const hasMcDohl = macdName && macdName.trim().length > 0;

  // Recruitment Mods that you have on (identical styled card to Battle Characters tab)
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'recruitment-mods-section';
  optionsContainer.style.cssText = 'margin-bottom: 1.25rem; padding: 0.85rem 1rem; background: rgba(0,0,0,0.15); border: 1px solid var(--pico-muted-border-color); border-radius: 6px;';
  
  const optionsTitle = document.createElement('h4');
  optionsTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 0.95rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;';
  optionsTitle.innerHTML = `<span>⚙️ Recruitment Mods that you have on</span><span style="font-size: 0.75rem; color: var(--pico-muted-color); font-weight: normal;">(Honored in recruitment badges & '✓ Recruited Only' filter)</span>`;
  optionsContainer.appendChild(optionsTitle);

  const modsGrid = document.createElement('div');
  modsGrid.style.cssText = 'display: flex; flex-direction: column; gap: 0.4rem;';

  // Better Leona Option
  const leonaLabel = document.createElement('label');
  leonaLabel.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0; cursor: pointer; font-size: 0.85rem;';
  const leonaRadio = document.createElement('input');
  leonaRadio.type = 'checkbox';
  leonaRadio.id = 'better-leona-option';
  leonaRadio.className = 'better-leona-checkbox';
  leonaRadio.style.cssText = 'margin: 0;';
  leonaRadio.checked = localStorage.getItem('recruitment_better_leona') === 'true';
  leonaLabel.appendChild(leonaRadio);
  const leonaText = document.createElement('span');
  leonaText.innerHTML = '<strong>Better Leona Option Via SuikodenFix</strong> - Allows Recruitment of Both Valeria and Kasumi';
  leonaLabel.appendChild(leonaText);
  modsGrid.appendChild(leonaLabel);

  // Kraken Patch
  const krakenLabel = document.createElement('label');
  krakenLabel.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0; cursor: pointer; font-size: 0.85rem;';
  const krakenRadio = document.createElement('input');
  krakenRadio.type = 'checkbox';
  krakenRadio.id = 'kraken-patch';
  krakenRadio.className = 'kraken-patch-checkbox';
  krakenRadio.style.cssText = 'margin: 0;';
  krakenRadio.checked = localStorage.getItem('recruitment_kraken_patch') === 'true';
  krakenLabel.appendChild(krakenRadio);
  const krakenText = document.createElement('span');
  krakenText.innerHTML = '<strong>Kraken Patch</strong> - If Chuchara is recruited, also recruits Abizboah and Rulodia';
  krakenLabel.appendChild(krakenText);
  modsGrid.appendChild(krakenLabel);

  optionsContainer.appendChild(modsGrid);
  container.appendChild(optionsContainer);

  // Recruitment Status Info & Warning Grid (2 Columns: small values column + larger warning column)
  const infoSection = document.createElement('div');
  infoSection.className = 'recruitment-info-section';
  infoSection.style.cssText = 'margin-bottom: 1.25rem;';

  const sectionTitle = document.createElement('h4');
  sectionTitle.textContent = 'Recruitment Flag';
  sectionTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 0.95rem;';
  infoSection.appendChild(sectionTitle);

  const infoGrid = document.createElement('div');
  infoGrid.className = 'recruitment-info-grid';
  infoGrid.style.cssText = 'display: grid; grid-template-columns: 240px 1fr; gap: 1rem; align-items: stretch;';

  // Small Column: Status Values
  const valuesCard = document.createElement('div');
  valuesCard.className = 'recruitment-values-card';
  valuesCard.style.cssText = 'padding: 0.85rem 1rem; background: rgba(0,0,0,0.12); border: 1px solid var(--pico-muted-border-color); border-radius: 6px; font-size: 0.8rem; line-height: 1.6;';
  valuesCard.innerHTML = `<strong style="display: block; margin-bottom: 0.4rem; color: var(--pico-color);">Recruitment Status Values:</strong>
    <div style="color: var(--pico-muted-color);">
      • <strong>1:</strong> <span style="color: #3498db; font-weight: 600;">💬 Spoke to</span><br>
      • <strong>70:</strong> ✓ Auto Join<br>
      • <strong>71:</strong> ✓ Manual Recruit<br>
      • <strong>86:</strong> 🔒 Event Locked<br>
      • <strong>212:</strong> 💀 Deceased<br>
      • <strong>213:</strong> 📋 On Leave
    </div>`;
  infoGrid.appendChild(valuesCard);

  // Larger Column: Warning
  const warningCard = document.createElement('div');
  warningCard.className = 'recruitment-warning-card';
  warningCard.style.cssText = 'padding: 0.85rem 1rem; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-left: 4px solid #f59e0b; border-radius: 6px; font-size: 0.8rem; line-height: 1.5; display: flex; flex-direction: column; justify-content: center;';
  warningCard.innerHTML = `<strong style="color: #f59e0b; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.35rem;">⚠️ Warning</strong>
    <p style="margin: 0 0 0.5rem 0; color: var(--pico-color);">Do not use this tool as a method to recruit both Kasumi and Valeria simultaneously, or to recruit all of the Beasts at once. If you want those outcomes, please use <strong>SuikodenFix</strong> together with the <strong>Kraken Patch</strong> (enabled above).</p>
    <p style="margin: 0; color: var(--pico-muted-color);">This tool is best suited for reviving characters that you may have lost during war battles. It also provides a convenient way to track and review your recruitment progress, giving you an overview of which characters have already joined and which ones are still pending.</p>`;
  infoGrid.appendChild(warningCard);

  infoSection.appendChild(infoGrid);
  container.appendChild(infoSection);

  // Toolbar: Search Box + Status Filter + Live Stars Counter
  const toolbar = document.createElement('div');
  toolbar.className = 'recruitment-toolbar';
  toolbar.style.cssText = 'margin-bottom: 1rem; padding: 0.75rem 1rem; background: rgba(0,0,0,0.12); border: 1px solid var(--pico-muted-border-color); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;';

  const toolbarFilters = document.createElement('div');
  toolbarFilters.style.cssText = 'display: flex; gap: 0.75rem; align-items: center; flex: 1; min-width: 280px; flex-wrap: wrap;';

  const searchBox = document.createElement('div');
  searchBox.style.cssText = 'flex: 1; min-width: 180px;';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Search by name or ID (e.g. Riou, Flik, 82)...';
  searchInput.style.cssText = 'margin-bottom: 0; font-size: 0.78rem; padding: 0.3rem 0.6rem 0.3rem 2.1rem;';
  searchBox.appendChild(searchInput);
  toolbarFilters.appendChild(searchBox);

  const filterBox = document.createElement('div');
  filterBox.style.cssText = 'min-width: 170px;';
  const filterSelect = document.createElement('select');
  filterSelect.style.cssText = 'margin-bottom: 0; font-size: 0.78rem; padding: 0.3rem 0.6rem;';
  const filterOpts = [
    { value: 'all', text: 'All Characters' },
    { value: 'recruited', text: '✓ Recruited Only' },
    { value: 'spoke_to', text: '💬 Spoke To Only' },
    { value: 'not_recruited', text: '✗ Not Recruited Only' }
  ];
  filterOpts.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.text;
    filterSelect.appendChild(opt);
  });
  filterBox.appendChild(filterSelect);
  toolbarFilters.appendChild(filterBox);

  toolbar.appendChild(toolbarFilters);

  // Counter badge
  const counterBadge = document.createElement('div');
  counterBadge.className = 'recruitment-counter-badge';
  counterBadge.style.cssText = 'font-size: 0.82rem; font-weight: 700; color: var(--pico-primary); background: rgba(52, 152, 219, 0.12); border: 1px solid var(--pico-primary); padding: 0.35rem 0.75rem; border-radius: 20px; white-space: nowrap;';
  toolbar.appendChild(counterBadge);

  container.appendChild(toolbar);

  // Cards Grid Container
  const cardsGrid = document.createElement('div');
  cardsGrid.className = 'recruitment-cards-grid';
  container.appendChild(cardsGrid);

  const lookupTable = typeof GameData !== 'undefined' ? GameData.CHARACTERS : null;
  const cardControllers = [];

  const recruitOptions = [
    { value: 0, text: '0: ✗ Not Recruited' },
    { value: 1, text: '1: 💬 Spoke to' },
    { value: 70, text: '70: ✓ Auto Join (Recruited)' },
    { value: 71, text: '71: ✓ Manual Recruit (Recruited)' },
    { value: 86, text: '86: 🔒 Event Locked' },
    { value: 212, text: '212: 💀 Deceased' },
    { value: 213, text: '213: 📋 On Leave' }
  ];

  // Build character cards
  arr.forEach((flagValue, index) => {
    if (index === 0) return; // Skip index 0

    const charEntry = lookupTable && lookupTable[index];
    const charName = charEntry ? (typeof charEntry === 'string' ? charEntry : (charEntry.name || `Character ${index}`)) : `Character ${index}`;

    const card = document.createElement('div');
    card.className = 'recruitment-card';
    card.dataset.index = String(index);
    card.dataset.name = charName;

    // Left: Portrait
    const portraitWrap = document.createElement('div');
    portraitWrap.className = 'recruitment-portrait-wrapper';

    const portraitImg = document.createElement('img');
    const portraitNum = String(index).padStart(3, '0');
    portraitImg.src = `./image/portraits/fp_${portraitNum}.png`;
    portraitImg.alt = charName;
    portraitImg.title = `${charName} (#${index})`;
    portraitImg.onerror = () => {
      portraitWrap.style.display = 'none';
    };
    portraitWrap.appendChild(portraitImg);
    card.appendChild(portraitWrap);

    // Right: Info & Controls
    const cardBody = document.createElement('div');
    cardBody.className = 'recruitment-card-body';

    // Header: Name & Status Badge
    const cardHeader = document.createElement('div');
    cardHeader.className = 'recruitment-card-header';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'recruitment-char-name';
    nameSpan.innerHTML = `<strong>#${String(index).padStart(2, '0')}:</strong> ${charName}`;
    cardHeader.appendChild(nameSpan);

    const statusBadge = document.createElement('span');
    statusBadge.className = 'recruitment-status-badge';
    cardHeader.appendChild(statusBadge);

    cardBody.appendChild(cardHeader);

    // Controls: Select Dropdown
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'recruitment-card-controls';

    const select = document.createElement('select');
    select.className = 'recruitment-select';

    recruitOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = String(opt.value);
      option.textContent = opt.text;
      select.appendChild(option);
    });

    // Check for custom flag value
    if (!recruitOptions.some(o => o.value === flagValue)) {
      const customOpt = document.createElement('option');
      customOpt.value = String(flagValue);
      customOpt.textContent = `${flagValue}: Custom (${flagValue})`;
      select.appendChild(customOpt);
    }
    select.value = String(flagValue);

    controlsDiv.appendChild(select);
    cardBody.appendChild(controlsDiv);
    card.appendChild(cardBody);

    // Dynamic status updater
    const updateCardState = () => {
      const currentFlag = arr[index];
      select.value = String(currentFlag);

      const betterLeonaEnabled = localStorage.getItem('recruitment_better_leona') === 'true';
      const krakenPatchEnabled = localStorage.getItem('recruitment_kraken_patch') === 'true';

      let isSpecialCase = false;
      let isRecruited = (currentFlag === RECRUIT_STATUS.AUTO_JOIN || currentFlag === RECRUIT_STATUS.MANUAL_RECRUIT);

      // 1. McDohl and Gremio
      if ((index === CHAR_INDEX.MCDOHL || index === CHAR_INDEX.GREMIO) && hasMcDohl && (currentFlag === RECRUIT_STATUS.NOT_RECRUITED || currentFlag === RECRUIT_STATUS.SPOKE_TO)) {
        statusBadge.textContent = '✓ Available (Import)';
        statusBadge.style.color = 'var(--pico-ins-color)';
        statusBadge.title = 'Available via Suikoden 1 save transfer';
        isSpecialCase = true;
        isRecruited = true;
      }

      // 2. Better Leona Option (Valeria or Kasumi)
      if (betterLeonaEnabled && !isSpecialCase) {
        const valeriaFlag = arr[CHAR_INDEX.VALERIA];
        const kasumiFlag = arr[CHAR_INDEX.KASUMI];

        if (index === CHAR_INDEX.VALERIA && (kasumiFlag === RECRUIT_STATUS.AUTO_JOIN || kasumiFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && !isRecruited) {
          statusBadge.textContent = '✓ Recruited Via SFix';
          statusBadge.style.color = 'var(--pico-ins-color)';
          statusBadge.title = 'Automatically recruited via Better Leona Option';
          isSpecialCase = true;
          isRecruited = true;
        } else if (index === CHAR_INDEX.KASUMI && (valeriaFlag === RECRUIT_STATUS.AUTO_JOIN || valeriaFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && !isRecruited) {
          statusBadge.textContent = '✓ Recruited Via SFix';
          statusBadge.style.color = 'var(--pico-ins-color)';
          statusBadge.title = 'Automatically recruited via Better Leona Option';
          isSpecialCase = true;
          isRecruited = true;
        }
      }

      // 3. Kraken Patch
      if (krakenPatchEnabled && !isSpecialCase) {
        const chucharaFlag = arr[CHAR_INDEX.CHUCHARA];
        if ((index === CHAR_INDEX.ABIZBOAH || index === CHAR_INDEX.RULODIA) && (chucharaFlag === RECRUIT_STATUS.AUTO_JOIN || chucharaFlag === RECRUIT_STATUS.MANUAL_RECRUIT) && !isRecruited) {
          statusBadge.textContent = '✓ Recruited Via Kraken';
          statusBadge.style.color = 'var(--pico-ins-color)';
          statusBadge.title = 'Automatically recruited via Kraken Patch';
          isSpecialCase = true;
          isRecruited = true;
        }
      }

      // 4. Standard recruitment statuses
      if (!isSpecialCase) {
        if (isRecruited) {
          statusBadge.textContent = '✓ Recruited';
          statusBadge.style.color = 'var(--pico-ins-color)';
          statusBadge.title = '';
        } else if (currentFlag === RECRUIT_STATUS.ON_LEAVE) {
          statusBadge.textContent = '📋 On Leave';
          statusBadge.style.color = '#f39c12';
          statusBadge.title = '';
        } else if (currentFlag === RECRUIT_STATUS.DECEASED) {
          statusBadge.textContent = '☠ Deceased';
          statusBadge.style.color = 'var(--pico-del-color)';
          statusBadge.title = '';
        } else if (currentFlag === RECRUIT_STATUS.EVENT_LOCKED) {
          statusBadge.textContent = '🔒 Event Locked';
          statusBadge.style.color = '#e67e22';
          statusBadge.title = '';
        } else if (currentFlag === RECRUIT_STATUS.SPOKE_TO) {
          statusBadge.textContent = '💬 Spoke To';
          statusBadge.style.color = '#3498db';
          statusBadge.title = '';
        } else {
          statusBadge.textContent = '✗ Not Recruited';
          statusBadge.style.color = 'var(--pico-muted-color)';
          statusBadge.title = '';
        }
      }

      const isSpokeTo = (currentFlag === RECRUIT_STATUS.SPOKE_TO) && !isRecruited;

      if (isRecruited) {
        card.dataset.isRecruited = 'true';
        card.dataset.isSpokeTo = 'false';
        card.classList.add('is-recruited');
        card.classList.remove('is-spoke-to');
        card.classList.remove('not-recruited');
      } else if (isSpokeTo) {
        card.dataset.isRecruited = 'false';
        card.dataset.isSpokeTo = 'true';
        card.classList.add('is-spoke-to');
        card.classList.remove('is-recruited');
        card.classList.remove('not-recruited');
      } else {
        card.dataset.isRecruited = 'false';
        card.dataset.isSpokeTo = 'false';
        card.classList.add('not-recruited');
        card.classList.remove('is-recruited');
        card.classList.remove('is-spoke-to');
      }
    };

    select.addEventListener('change', (e) => {
      const newStatus = parseInt(e.target.value) || 0;
      arr[index] = newStatus;

      updateCardState();

      // If editing Valeria or Kasumi, update the other card
      if (index === CHAR_INDEX.VALERIA || index === CHAR_INDEX.KASUMI) {
        const otherIndex = index === CHAR_INDEX.VALERIA ? CHAR_INDEX.KASUMI : CHAR_INDEX.VALERIA;
        const otherCtrl = cardControllers.find(c => c.index === otherIndex);
        if (otherCtrl) otherCtrl.update();
      }

      // If editing Chuchara, update Abizboah and Rulodia
      if (index === CHAR_INDEX.CHUCHARA) {
        [CHAR_INDEX.ABIZBOAH, CHAR_INDEX.RULODIA].forEach(relIdx => {
          const relCtrl = cardControllers.find(c => c.index === relIdx);
          if (relCtrl) relCtrl.update();
        });
      }

      updateCounter();
      applyFilters();

      if (updateCallback) updateCallback();
      window.dispatchEvent(new CustomEvent('recruitment-flags-changed'));
    });

    updateCardState();
    cardsGrid.appendChild(card);

    cardControllers.push({
      index,
      card,
      name: charName,
      update: updateCardState
    });
  });

  const updateCounter = () => {
    let recruited = 0;
    cardControllers.forEach(c => {
      if (c.card.dataset.isRecruited === 'true') recruited++;
    });
    counterBadge.textContent = `⭐ Recruited: ${recruited} / ${cardControllers.length}`;
  };

  const applyFilters = () => {
    const q = searchInput.value.trim().toLowerCase();
    const filter = filterSelect.value;

    cardControllers.forEach(c => {
      const idxStr = String(c.index);
      const nameStr = c.name.toLowerCase();
      const isRecruited = c.card.dataset.isRecruited === 'true';

      const isSpokeTo = c.card.dataset.isSpokeTo === 'true';
      const matchesSearch = !q || idxStr.includes(q) || nameStr.includes(q);
      let matchesFilter = true;
      if (filter === 'recruited') matchesFilter = isRecruited;
      else if (filter === 'spoke_to') matchesFilter = isSpokeTo;
      else if (filter === 'not_recruited') matchesFilter = !isRecruited && !isSpokeTo;

      c.card.style.display = (matchesSearch && matchesFilter) ? 'flex' : 'none';
    });
  };

  searchInput.addEventListener('input', applyFilters);
  filterSelect.addEventListener('change', applyFilters);

  // Sync with changes from Battle Characters tab or other editors
  const onExternalModChange = () => {
    leonaRadio.checked = localStorage.getItem('recruitment_better_leona') === 'true';
    krakenRadio.checked = localStorage.getItem('recruitment_kraken_patch') === 'true';
    cardControllers.forEach(c => c.update());
    updateCounter();
    applyFilters();
  };
  window.addEventListener('recruitment-mods-changed', onExternalModChange);

  const onExternalFlagChange = () => {
    cardControllers.forEach(c => c.update());
    updateCounter();
    applyFilters();
  };
  window.addEventListener('recruitment-flags-changed', onExternalFlagChange);

  updateCounter();
  applyFilters();

  return container;
}
