import GameData from '../gamedata.js';

/**
 * Creates the Castle Suggestion Box (目安箱 / Meyasubako) editor interface.
 * Handles:
 * - `game_data.meyasu_data`: 32-byte bitfield storing 2-bit letter read level (0–3) for up to 128 characters.
 * - `game_data.b_meyasu`: Unread notification flag (1 = new letters waiting, 0 = checked/idle).
 * - `game_data.unread_letter`: 4 slots containing pending unread letters { title, msg, chara_id }.
 * - `game_data.meyasu_time`: Timing interval array [ushort, ushort].
 * 
 * @param {Object} data - Root save data object
 * @param {string} label - Section label
 * @param {Function} updateCallback - Callback when values change
 * @returns {HTMLElement} - The Suggestion Box editor container
 */
export function createSuggestionBoxEditor(data, label, updateCallback) {
  const container = document.createElement('div');
  container.className = 'suggestion-box-editor-section json-object';
  container.id = 'suggestion-box-editor';
  container.style.cssText = 'padding: 0.85rem 1rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12); margin-bottom: 1.25rem;';

  const gameData = data.game_data || data;

  // Initialize arrays if missing
  if (!Array.isArray(gameData.meyasu_data) || gameData.meyasu_data.length < 32) {
    const existing = Array.isArray(gameData.meyasu_data) ? gameData.meyasu_data : [];
    gameData.meyasu_data = new Array(32).fill(0).map((_, i) => existing[i] ?? 0);
  }

  if (!Array.isArray(gameData.unread_letter)) {
    gameData.unread_letter = [
      { title: 0, msg: 0, chara_id: 0 },
      { title: 0, msg: 0, chara_id: 0 },
      { title: 0, msg: 0, chara_id: 0 },
      { title: 0, msg: 0, chara_id: 0 }
    ];
  }

  // Bitfield helpers: each byte holds 4 characters (2 bits each: 0, 1, 2, or 3)
  const getCharLevel = (charaId) => {
    const byteIndex = Math.floor(charaId / 4);
    if (byteIndex < 0 || byteIndex >= 32) return 0;
    const bitOffset = (charaId % 4) * 2;
    return (gameData.meyasu_data[byteIndex] >> bitOffset) & 0x03;
  };

  const setCharLevel = (charaId, level) => {
    const byteIndex = Math.floor(charaId / 4);
    if (byteIndex < 0 || byteIndex >= 32) return;
    const bitOffset = (charaId % 4) * 2;
    const cleanLevel = Math.max(0, Math.min(3, level));
    const mask = ~(0x03 << bitOffset);
    gameData.meyasu_data[byteIndex] = (gameData.meyasu_data[byteIndex] & mask) | (cleanLevel << bitOffset);
  };

  const countTotalReadLetters = () => {
    let count = 0;
    for (let i = 1; i <= 125; i++) {
      count += getCharLevel(i);
    }
    return count;
  };

  const countActiveInboxLetters = () => {
    return gameData.unread_letter.filter(l => l && (l.chara_id > 0 || l.title > 0 || l.msg > 0)).length;
  };

  // Header section
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid var(--pico-muted-border-color); padding-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;';

  const titleBox = document.createElement('div');
  titleBox.style.cssText = 'display: flex; align-items: center; gap: 0.5rem;';
  const title = document.createElement('strong');
  title.style.fontSize = '0.95rem';
  title.textContent = '📮 Castle Suggestion Box (目安箱 / Meyasubako)';
  titleBox.appendChild(title);

  // Status badges
  const badgeContainer = document.createElement('div');
  badgeContainer.style.cssText = 'display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; font-size: 0.75rem;';

  const notifBadge = document.createElement('span');
  const inboxBadge = document.createElement('span');
  const readBadge = document.createElement('span');

  const updateBadges = () => {
    const isWaiting = (gameData.b_meyasu ?? 0) > 0;
    notifBadge.style.cssText = `padding: 2px 7px; border-radius: 4px; font-weight: 600; background: ${isWaiting ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.08)'}; color: ${isWaiting ? '#38bdf8' : 'var(--pico-muted-color)'}; border: 1px solid ${isWaiting ? 'rgba(56, 189, 248, 0.4)' : 'transparent'};`;
    notifBadge.textContent = isWaiting ? '🔔 New Mail Waiting' : '🔕 Box Idle';

    const activeInbox = countActiveInboxLetters();
    inboxBadge.style.cssText = `padding: 2px 7px; border-radius: 4px; font-weight: 600; background: ${activeInbox > 0 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.08)'}; color: ${activeInbox > 0 ? '#fbbf24' : 'var(--pico-muted-color)'}; border: 1px solid ${activeInbox > 0 ? 'rgba(251, 191, 36, 0.4)' : 'transparent'};`;
    inboxBadge.textContent = `📬 Inbox: ${activeInbox}/4`;

    const totalRead = countTotalReadLetters();
    readBadge.style.cssText = 'padding: 2px 7px; border-radius: 4px; font-weight: 600; background: rgba(74, 222, 128, 0.15); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3);';
    readBadge.textContent = `📖 Read Progress: ${totalRead} Letters`;
  };

  updateBadges();
  badgeContainer.appendChild(notifBadge);
  badgeContainer.appendChild(inboxBadge);
  badgeContainer.appendChild(readBadge);

  header.appendChild(titleBox);
  header.appendChild(badgeContainer);
  container.appendChild(header);

  // Description & Toolbar
  const desc = document.createElement('p');
  desc.style.cssText = 'font-size: 0.75rem; color: var(--pico-muted-color); margin-bottom: 0.75rem;';
  desc.innerHTML = 'Letters sent by recruited stars as the castle evolves. Each character has up to <strong>3 letter levels</strong>. Resetting to 0 lets you experience receiving letters again; completing all marks them all read.';
  container.appendChild(desc);

  // Action Buttons Bar
  const actionsBar = document.createElement('div');
  actionsBar.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: center;';

  const resetAllBtn = document.createElement('button');
  resetAllBtn.type = 'button';
  resetAllBtn.className = 'outline secondary';
  resetAllBtn.style.cssText = 'font-size: 0.75rem; padding: 0.3rem 0.65rem; border-color: rgba(239, 68, 68, 0.5); color: #ef4444;';
  resetAllBtn.textContent = '🔄 Reset All to Unread (0)';
  resetAllBtn.title = 'Resets all character letters to unread (0) and clears the inbox so you can receive them fresh!';
  resetAllBtn.onclick = () => {
    if (confirm('Reset all 108+ characters\' suggestion box letters to 0 (unread) and empty the inbox?')) {
      gameData.meyasu_data.fill(0);
      gameData.b_meyasu = 0;
      gameData.unread_letter.forEach(slot => {
        slot.title = 0;
        slot.msg = 0;
        slot.chara_id = 0;
      });
      updateBadges();
      refreshUI();
      if (typeof updateCallback === 'function') updateCallback();
    }
  };

  const completeAllBtn = document.createElement('button');
  completeAllBtn.type = 'button';
  completeAllBtn.className = 'outline primary';
  completeAllBtn.style.cssText = 'font-size: 0.75rem; padding: 0.3rem 0.65rem; border-color: rgba(74, 222, 128, 0.5); color: #4ade80;';
  completeAllBtn.textContent = '⚡ Mark All Read (Level 3)';
  completeAllBtn.title = 'Sets all characters to level 3 (all letters read) and empties the unread inbox.';
  completeAllBtn.onclick = () => {
    if (confirm('Mark all suggestion box letters as read (Level 3) for all characters?')) {
      gameData.meyasu_data.fill(255);
      gameData.b_meyasu = 0;
      gameData.unread_letter.forEach(slot => {
        slot.title = 0;
        slot.msg = 0;
        slot.chara_id = 0;
      });
      updateBadges();
      refreshUI();
      if (typeof updateCallback === 'function') updateCallback();
    }
  };

  const clearInboxBtn = document.createElement('button');
  clearInboxBtn.type = 'button';
  clearInboxBtn.className = 'outline secondary';
  clearInboxBtn.style.cssText = 'font-size: 0.75rem; padding: 0.3rem 0.65rem;';
  clearInboxBtn.textContent = '🧹 Empty Inbox Queue';
  clearInboxBtn.onclick = () => {
    gameData.b_meyasu = 0;
    gameData.unread_letter.forEach(slot => {
      slot.title = 0;
      slot.msg = 0;
      slot.chara_id = 0;
    });
    updateBadges();
    refreshInboxUI();
    if (typeof updateCallback === 'function') updateCallback();
  };

  actionsBar.appendChild(resetAllBtn);
  actionsBar.appendChild(completeAllBtn);
  actionsBar.appendChild(clearInboxBtn);
  container.appendChild(actionsBar);

  // Collapsible Inbox Panel
  const inboxDetails = document.createElement('details');
  inboxDetails.style.cssText = 'margin-bottom: 1rem; border: 1px solid var(--pico-muted-border-color); border-radius: 4px; padding: 0.5rem 0.75rem; background: rgba(0,0,0,0.2);';
  const inboxSummary = document.createElement('summary');
  inboxSummary.style.cssText = 'font-size: 0.8rem; font-weight: 600; cursor: pointer; color: var(--pico-contrast);';
  inboxSummary.textContent = '📬 Pending Inbox Slots (unread_letter: 4 slots)';
  inboxDetails.appendChild(inboxSummary);

  const inboxSlotsContainer = document.createElement('div');
  inboxSlotsContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.5rem; margin-top: 0.5rem;';
  inboxDetails.appendChild(inboxSlotsContainer);

  const refreshInboxUI = () => {
    inboxSlotsContainer.innerHTML = '';
    gameData.unread_letter.forEach((slot, idx) => {
      const slotBox = document.createElement('div');
      slotBox.style.cssText = 'border: 1px solid var(--pico-muted-border-color); border-radius: 4px; padding: 0.4rem 0.6rem; font-size: 0.75rem; background: rgba(255,255,255,0.03); display: flex; flex-direction: column; gap: 0.2rem;';
      
      const charName = (slot.chara_id > 0 && GameData?.CHARACTERS?.[slot.chara_id]?.name) 
        ? `${GameData.CHARACTERS[slot.chara_id].name} (#${slot.chara_id})` 
        : (slot.chara_id > 0 ? `Chara #${slot.chara_id}` : 'Empty');

      const isOccupied = slot.chara_id > 0 || slot.title > 0 || slot.msg > 0;
      slotBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color: ${isOccupied ? '#38bdf8' : 'var(--pico-muted-color)'};">Slot ${idx + 1}</strong>
          ${isOccupied ? '<button type="button" class="outline secondary" style="font-size:0.65rem; padding:1px 5px; margin:0;" title="Dismiss slot">Clear</button>' : '<span style="color:var(--pico-muted-color); font-size:0.7rem;">(Empty)</span>'}
        </div>
        <div style="font-size:0.7rem;"><strong>Sender:</strong> ${charName}</div>
        <div style="font-size:0.68rem; color:var(--pico-muted-color);">Title ID: ${slot.title} | Msg ID: ${slot.msg}</div>
      `;

      if (isOccupied) {
        const btn = slotBox.querySelector('button');
        if (btn) {
          btn.onclick = () => {
            slot.title = 0;
            slot.msg = 0;
            slot.chara_id = 0;
            if (countActiveInboxLetters() === 0) {
              gameData.b_meyasu = 0;
            }
            updateBadges();
            refreshInboxUI();
            if (typeof updateCallback === 'function') updateCallback();
          };
        }
      }

      inboxSlotsContainer.appendChild(slotBox);
    });
  };

  refreshInboxUI();
  container.appendChild(inboxDetails);

  // Search & Filter controls for characters
  const filterRow = document.createElement('div');
  filterRow.style.cssText = 'display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap;';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = '🔍 Search character by name or ID...';
  searchInput.style.cssText = 'flex: 1; min-width: 180px; font-size: 0.78rem; padding: 0.35rem 0.65rem; margin-bottom: 0;';

  const filterSelect = document.createElement('select');
  filterSelect.style.cssText = 'width: auto; font-size: 0.78rem; padding: 0.35rem 0.65rem; margin-bottom: 0;';
  filterSelect.innerHTML = `
    <option value="all">All Characters (1–125)</option>
    <option value="read">Has Read Letters (> 0)</option>
    <option value="unread">Unread / Fresh (Level 0)</option>
    <option value="incomplete">Incomplete (Level 0–2)</option>
    <option value="complete">Complete (Level 3)</option>
  `;

  filterRow.appendChild(searchInput);
  filterRow.appendChild(filterSelect);
  container.appendChild(filterRow);

  // Character list container
  const charListContainer = document.createElement('div');
  charListContainer.style.cssText = 'max-height: 480px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.35rem; padding-right: 4px; border: 1px solid var(--pico-muted-border-color); border-radius: 4px; padding: 0.5rem; background: rgba(0,0,0,0.15);';
  container.appendChild(charListContainer);

  const characterCards = [];

  // Build character cards
  for (let id = 1; id <= 125; id++) {
    const charMeta = GameData?.CHARACTERS?.[id];
    const name = charMeta?.name || `Character #${id}`;

    const card = document.createElement('div');
    card.className = 'suggestion-char-row';
    card.dataset.id = id;
    card.dataset.name = name.toLowerCase();
    card.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.3rem 0.6rem; border-radius: 4px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); gap: 0.5rem; flex-wrap: wrap;';

    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = 'display: flex; align-items: center; gap: 0.4rem; min-width: 150px;';
    const idSpan = document.createElement('span');
    idSpan.style.cssText = 'font-size: 0.7rem; color: var(--pico-muted-color); font-family: monospace; width: 30px;';
    idSpan.textContent = `#${id}`;
    const nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'font-size: 0.8rem; font-weight: 500;';
    nameSpan.textContent = name;
    infoDiv.appendChild(idSpan);
    infoDiv.appendChild(nameSpan);

    // Segmented button group for levels 0, 1, 2, 3
    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display: inline-flex; border-radius: 4px; overflow: hidden; border: 1px solid var(--pico-muted-border-color);';

    const levelButtons = [];
    [0, 1, 2, 3].forEach(lvl => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = 'padding: 2px 9px; font-size: 0.72rem; border-radius: 0; border: none; margin: 0; cursor: pointer; transition: background 0.15s ease;';
      btn.textContent = lvl === 0 ? '0 (None)' : `Lv ${lvl}`;
      btn.title = lvl === 0 ? 'No letters read' : `Letter ${lvl} read`;

      btn.onclick = () => {
        setCharLevel(id, lvl);
        updateCardButtons();
        updateBadges();
        if (typeof updateCallback === 'function') updateCallback();
      };

      levelButtons.push({ btn, lvl });
      btnGroup.appendChild(btn);
    });

    const updateCardButtons = () => {
      const currentLevel = getCharLevel(id);
      card.dataset.level = currentLevel;
      levelButtons.forEach(({ btn, lvl }) => {
        if (lvl === currentLevel) {
          if (lvl === 0) {
            btn.style.background = 'rgba(255,255,255,0.15)';
            btn.style.color = 'var(--pico-contrast)';
            btn.style.fontWeight = 'bold';
          } else if (lvl === 3) {
            btn.style.background = '#16a34a';
            btn.style.color = '#ffffff';
            btn.style.fontWeight = 'bold';
          } else {
            btn.style.background = '#2563eb';
            btn.style.color = '#ffffff';
            btn.style.fontWeight = 'bold';
          }
        } else {
          btn.style.background = 'transparent';
          btn.style.color = 'var(--pico-muted-color)';
          btn.style.fontWeight = 'normal';
        }
      });
    };

    updateCardButtons();
    card.appendChild(infoDiv);
    card.appendChild(btnGroup);
    charListContainer.appendChild(card);

    characterCards.push({ card, id, name: name.toLowerCase(), updateCardButtons });
  }

  // Filter & Search handler
  const filterCards = () => {
    const query = searchInput.value.trim().toLowerCase();
    const filterType = filterSelect.value;

    characterCards.forEach(({ card, id, name }) => {
      const lvl = getCharLevel(id);
      let matchesFilter = true;

      if (filterType === 'read' && lvl === 0) matchesFilter = false;
      if (filterType === 'unread' && lvl !== 0) matchesFilter = false;
      if (filterType === 'incomplete' && lvl === 3) matchesFilter = false;
      if (filterType === 'complete' && lvl !== 3) matchesFilter = false;

      let matchesSearch = true;
      if (query) {
        matchesSearch = name.includes(query) || id.toString() === query;
      }

      card.style.display = (matchesFilter && matchesSearch) ? 'flex' : 'none';
    });
  };

  searchInput.oninput = filterCards;
  filterSelect.onchange = filterCards;

  const refreshUI = () => {
    characterCards.forEach(c => c.updateCardButtons());
    refreshInboxUI();
    filterCards();
  };

  return container;
}
