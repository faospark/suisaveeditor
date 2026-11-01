// Story & Event Flags Editor (event_flag[0..255])
// Provides granular bit-level and byte-level editing across all 256 game event flags,
// pre-annotated with known story progression and character recruitment flags.

/**
 * Registry of known story, quest, and character recruitment flags in Suikoden II.
 * Keys are byte indices (0-255).
 * Bits are bit indices (0-7, where bit N represents 1 << N).
 */
export const KNOWN_STORY_FLAGS = {
  20: {
    name: 'Gregminster Alliance & Tomo Lockout',
    area: 'vf01 / vb10',
    desc: 'Toran Republic alliance decision and Tomo recruitment availability',
    bits: {
      0: 'Toran Alliance Completed (Choice made)',
      7: 'Tomo Late-Game Lockout (Rockaxe Campaign)'
    }
  },
  23: {
    name: 'South Window Region / Genshu Recruitment',
    area: 'vc18',
    desc: 'Kuskus port interactions and Genshu weapon level inspection',
    bits: {
      3: 'Genshu Recruited at Kuskus Port (Mask 8)'
    }
  },
  29: {
    name: 'Radat Wharf (Simone & Vincent)',
    area: 'vd02',
    desc: 'Simone recruitment and Vincent reunion sequence',
    bits: {
      3: 'Simone Recruited (Mask 8)',
      5: 'Vincent Spoken First Time (Mask 32)',
      6: 'Vincent Reunion Cutscene Active (Mask 64)',
      7: 'Vincent Recruited (Mask 128)'
    }
  },
  65: {
    name: 'Two River Sewers (Sid Recruitment)',
    area: 'vf04',
    desc: 'Two River sewers exploration and Sid recruitment status',
    bits: {
      1: 'Sid Recruited into Army (Mask 2)'
    }
  },
  68: {
    name: 'Two River Kobold District (Hans Armory)',
    area: 'vf02',
    desc: 'Two River Kobold armor shop and Hans recruitment status',
    bits: {
      0: 'Hans Recruited / Armory Opened (Mask 1)'
    }
  },
  92: {
    name: 'South Window (Annallee Unpaid Meal)',
    area: 'vd17 / vd03',
    desc: 'Inn unpaid meal cutscene; moves Annallee to the street',
    bits: {
      0: 'Unpaid Meal Triggered (Spawns on street vd03)'
    }
  },
  94: {
    name: 'Clive Quest Milestones & Cutoffs',
    area: 'World',
    desc: 'Elza pursuit milestones and time-sensitive triggers',
    bits: {
      0: 'Muse Encounter (<3h)',
      1: 'South Window (Clive Joins)',
      2: 'Lakewest Letter (<11h)',
      3: 'Forest Village Lookalike (<13h)',
      4: 'Rockaxe Guild Intelligence',
      5: 'Radat Hostage Duel (<14h)',
      6: 'Muse Hill Confrontation (<15h)',
      7: 'Sajah Finale Conclusion (<20h)'
    }
  },
  110: {
    name: 'Tessai Recruitment',
    area: 'vd01',
    desc: 'Kuskus blacksmith Tessai recruitment status',
    bits: {
      1: 'Tessai Recruited into Army (Mask 2)'
    }
  },
  112: {
    name: 'Annallee Recruitment',
    area: 'vd03',
    desc: 'South Window park song quest completion',
    bits: {
      4: 'Annallee Recruited (Bit 4 / Mask 16)',
      5: 'Annallee Recruited (Bit 5 / Mask 32)'
    }
  },
  114: {
    name: 'Alberto Recruitment',
    area: 'vg08',
    desc: 'Tinto armory Alberto recruitment status',
    bits: {
      4: 'Alberto Recruited (Bit 4 / Mask 16)',
      5: 'Alberto Recruited (Bit 5 / Mask 32)'
    }
  },
  118: {
    name: 'Greenhill / Matilda Liberation Story Gate',
    area: 'World',
    desc: 'Late-game story campaign progression for musician spawning',
    bits: {
      3: 'Post-Greenhill Liberation Gate (Musicians Active)'
    }
  },
  123: {
    name: 'Kuskus Blacksmith Counters',
    area: 'vd01',
    desc: 'Enables blacksmith shop services and apprentice NPC',
    bits: {
      0: 'Blacksmith Service Counters Active'
    }
  },
  128: {
    name: 'Kuskus Tessai Spawn',
    area: 'vd01',
    desc: 'Spawns Tessai inside Kuskus blacksmith shop',
    bits: {
      0: 'Tessai Spawn Active in Kuskus'
    }
  },
  151: {
    name: 'Tinto Progression & Alberto Despawn',
    area: 'vg08',
    desc: 'Tinto area story progression and armory NPC despawning',
    bits: {
      6: 'Alberto Despawns from Tinto Armory (Mask 64)'
    }
  },
  152: {
    name: 'Hai Yo Cook-Off Battles (Part 1)',
    area: 'Castle HQ',
    desc: 'First half of Hai Yo cook-off opponents defeated',
    bits: {
      0: 'Ky Yun Defeated',
      1: 'Goetsu Defeated',
      2: 'Shinki Defeated',
      3: 'Ryuki Defeated',
      4: 'Bashok Defeated',
      5: 'Ryuko Defeated',
      6: 'Antonio Defeated',
      7: 'Gyokuran Defeated'
    }
  },
  153: {
    name: 'Hai Yo Cook-Off Battles (Part 2)',
    area: 'Castle HQ',
    desc: 'Second half of Hai Yo cook-off opponents and system flag',
    bits: {
      0: 'Retso (1st Duel) Defeated',
      1: 'Lester Defeated',
      2: 'Retso (2nd Duel) Defeated',
      3: 'Jinkai (Grand Finale) Defeated',
      5: 'Cook-Off System Active'
    }
  },
  160: {
    name: 'Ryube Village (Millie & Bonaparte)',
    area: 'vb01 / vb05',
    desc: 'Millie recruitment and Bonaparte pet recovery in Ryube Forest',
    bits: {
      0: 'Millie Recruited / Bonaparte Returned (Mask 1)',
      6: 'Bonaparte Chase Active in Ryube Forest (Mask 64)'
    }
  },
  164: {
    name: 'Ryube Forest (Kinnison & Shiro)',
    area: 'vb05',
    desc: 'Fallen bird nest event and Kinnison/Shiro recruitment status',
    bits: {
      1: 'Bird Nest Returned to Tree (Mask 2)',
      2: 'Kinnison & Shiro Recruited into Army (Mask 4)'
    }
  },
  166: {
    name: 'Early Game Recruits (Anita, Zamza, Templeton)',
    area: 'va06 / vb03 / vb04',
    desc: 'Anita Muse tavern tasks, Zamza Toto Inn, and Templeton Mercenary Fort ruins',
    bits: {
      0: 'Anita Recruited in Muse Tavern (Mask 1)',
      2: 'Zamza Recruited at Toto Inn (Mask 4)',
      4: 'Templeton Encountered at Burned Fort (Mask 16)',
      5: 'Templeton Recruited with Suiko Map (Mask 32)'
    }
  },
  171: {
    name: 'Ryube Forest (Tomo)',
    area: 'vb10',
    desc: 'Tsai house errand and Tomo recruitment status',
    bits: {
      6: 'Tomo Recruited into Army (Mask 64)'
    }
  },
  206: {
    name: 'White Deer Inn & Sindar Ruins (Alex & Hilda)',
    area: 'vb02 / vb11 / vb18',
    desc: 'Sindar Ruins expedition, mist monster boss battle, and Alex/Hilda recruitment',
    bits: {
      0: 'Sindar Ruins Entrance Unlocked (Mask 1)',
      1: 'Mist Monster Defeated (Mask 2)',
      2: 'Alex & Hilda Recruited (Mask 4)'
    }
  },
  208: {
    name: "Ryube Forest (Tsai's Spear Errand)",
    area: 'vb04 / vb10',
    desc: 'Erran to Tsai cottage for fire spears to defend the Mercenary Fort',
    bits: {
      0: 'Tsai Tools Errand Active (Mask 1)',
      1: 'Spears Completed / Tsai Joins (Mask 2)'
    }
  },
  210: {
    name: 'Forest Path & Matilda Region (Viki Teleportation)',
    area: 've04 / ve01 / ve07',
    desc: 'Forest Path wandering encounter where Viki sneezes and teleports to Castle HQ',
    bits: {
      0: 'Forest Village Entry Event (Mask 1)',
      1: 'Matilda Border Gate Interaction (Mask 2)',
      3: 'Rockaxe Town Event Step 1 (Mask 8)',
      4: 'Rockaxe Town Event Step 2 (Mask 16)',
      5: 'Highway Path Event (Mask 32)',
      6: 'Viki Encountered on Forest Path (Mask 64)',
      7: 'Viki Recruited / Teleports to Castle (Mask 128)'
    }
  },
  211: {
    name: 'Badeaux & Tenkou Recruitment',
    area: 've04 / vk14',
    desc: 'Forest Path beastmaster and Castle terrace windowmaker',
    bits: {
      1: 'Badeaux Spoke Once / Declined (Mask 2)',
      2: 'Badeaux Recruited into Army (Mask 4)',
      3: 'Tenkou Recruited into Army (Mask 8)',
      4: 'Tenkou Spoken on Terrace (Mask 16)'
    }
  },
  212: {
    name: 'Tinto Armory (Alberto Progression)',
    area: 'vg08',
    desc: 'Alberto dialogue progression and HQ check',
    bits: {
      0: 'Spoke to Alberto in Tinto (Mask 1)',
      1: 'Heard Annallee & Pico in Castle HQ (Mask 2)'
    }
  },
  215: {
    name: 'Forest Village (Feather & Ayda Encounter)',
    area: 've02',
    desc: 'Forest Village griffin ambush and recruitment scene',
    bits: {
      2: 'Feather Ambush Triggered (Mask 4)',
      4: 'Feather Recruited (Mask 16)',
      6: 'Ayda Recruited (Mask 64)'
    }
  },
  216: {
    name: 'Forest Village (Connell, Tony, Wakaba)',
    area: 've02',
    desc: 'Forest Village recruitments and introductory dialogues',
    bits: {
      0: 'Connell Spoke First Time (Mask 1)',
      1: 'Connell Recruited with Sound Set (Mask 2)',
      4: 'Tony Spoke First Time (Mask 16)',
      5: 'Tony Recruited to Castle Farm (Mask 32)',
      6: 'Meg & Gadget Recruited at Greenhill Border (Mask 64)',
      7: 'Wakaba Initial Talk (Mask 128)'
    }
  },
  222: {
    name: 'Coronet Wharf Party Members',
    area: 'vj01',
    desc: 'Coronet dock companion interactions and event states',
    bits: {
      0: 'Coronet Dock Trigger 1 (Mask 1)',
      1: 'Coronet Dock Trigger 2 (Mask 2)',
      2: 'Coronet Dock Trigger 3 (Mask 4)',
      3: 'Coronet Dock Trigger 4 (Mask 8)',
      4: 'Coronet Dock Trigger 5 (Mask 16)',
      5: 'Coronet Dock Trigger 6 (Mask 32)',
      6: 'Coronet Dock Trigger 7 (Mask 64)',
      7: 'Coronet Dock Trigger 8 (Mask 128)'
    }
  },
  230: {
    name: 'Listening Crystals & Beastmaster Quests',
    area: 'World',
    desc: 'Listening Crystal grant state and beast encounters (Feather, Kraken, Siegfried)',
    bits: {
      0: 'Listening Crystals Granted by Badeaux (Mask 1)',
      1: 'Feather / Ayda Quest Active (Mask 2)',
      2: 'Abizboah Recruited with Crystal (Mask 4)',
      3: 'Rulodia Recruited with Crystal (Mask 8)'
    }
  }
};

/**
 * Creates the comprehensive Story & Event Flags editor.
 * 
 * @param {Array<number>} arr - Array of 256 event flag bytes (data.event_flag)
 * @param {string} key - Section label
 * @param {Function} updateCallback - Callback triggered on modification
 * @param {Object} fullData - Full save file root object
 * @returns {HTMLElement} - Rendered editor element
 */
export function createStoryFlagsEditor(arr, key, updateCallback, fullData = null) {
  const container = document.createElement('div');
  container.className = 'story-flags-editor-section';
  container.style.cssText = 'padding: 0.5rem 0;';

  // Ensure array is valid 256 bytes
  if (!Array.isArray(arr) || arr.length < 256) {
    if (fullData && (!Array.isArray(fullData.event_flag) || fullData.event_flag.length < 256)) {
      fullData.event_flag = new Array(256).fill(0);
      arr = fullData.event_flag;
    }
  }

  // Header / Title Row
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; border-bottom: 1px solid var(--pico-muted-border-color); padding-bottom: 0.75rem;';

  const titleWrap = document.createElement('div');
  const title = document.createElement('h3');
  title.style.cssText = 'margin: 0; font-size: 1.15rem; display: flex; align-items: center; gap: 0.5rem;';
  title.innerHTML = '🚩 Story & Event Flags <span style="font-size: 0.8rem; font-weight: normal; color: var(--pico-muted-color);">(256 Bytes, Bits 0..7)</span>';

  const subtitle = document.createElement('p');
  subtitle.style.cssText = 'margin: 0.25rem 0 0 0; font-size: 0.8rem; color: var(--pico-muted-color);';
  subtitle.textContent = 'Inspect and modify raw bitflags driving story quests, NPC spawns, cutscenes, and character recruitment.';
  titleWrap.appendChild(title);
  titleWrap.appendChild(subtitle);
  header.appendChild(titleWrap);

  const statsBadge = document.createElement('span');
  statsBadge.style.cssText = 'font-size: 0.8rem; font-weight: 600; padding: 0.3rem 0.65rem; border-radius: 4px; background: rgba(52, 152, 219, 0.15); color: var(--pico-primary); border: 1px solid rgba(52, 152, 219, 0.3);';
  header.appendChild(statsBadge);
  container.appendChild(header);

  // Toolbar: Search + Quick Filter + Clear Action
  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 1.25rem; background: rgba(0,0,0,0.12); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--pico-muted-border-color);';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Search by flag # (e.g. 211, 230), character (Badeaux, Clive), or area...';
  searchInput.style.cssText = 'flex: 2; min-width: 240px; margin-bottom: 0; font-size: 0.8rem; padding: 0.35rem 0.65rem;';

  const filterSelect = document.createElement('select');
  filterSelect.style.cssText = 'flex: 1; min-width: 170px; margin-bottom: 0; font-size: 0.8rem; padding: 0.35rem 0.65rem; height: auto;';
  const filterOptions = [
    { value: 'all', text: 'All Flags (0-255)' },
    { value: 'known', text: '⭐ Known Story Flags Only' },
    { value: 'active', text: '✓ Active Flags Only (> 0)' },
    { value: 'inactive', text: '✗ Inactive Flags Only (= 0)' }
  ];
  filterOptions.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt.value;
    o.textContent = opt.text;
    filterSelect.appendChild(o);
  });

  const resetAllBtn = document.createElement('button');
  resetAllBtn.type = 'button';
  resetAllBtn.className = 'outline secondary';
  resetAllBtn.textContent = '⚠️ Clear Filtered to 0';
  resetAllBtn.title = 'Resets currently displayed flags to 0';
  resetAllBtn.style.cssText = 'font-size: 0.75rem; padding: 0.35rem 0.65rem; margin-bottom: 0; white-space: nowrap;';

  toolbar.appendChild(searchInput);
  toolbar.appendChild(filterSelect);
  toolbar.appendChild(resetAllBtn);
  container.appendChild(toolbar);

  // Flags Grid
  const grid = document.createElement('div');
  grid.className = 'story-flags-grid';
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 0.75rem;';
  container.appendChild(grid);

  const flagCards = [];

  const updateStats = () => {
    let activeCount = 0;
    for (let i = 0; i < 256; i++) {
      if ((arr[i] || 0) > 0) activeCount++;
    }
    statsBadge.textContent = `Active Flags: ${activeCount} / 256 | Known Annotated: ${Object.keys(KNOWN_STORY_FLAGS).length}`;
  };

  // Build 256 Flag Cards
  for (let i = 0; i < 256; i++) {
    const flagIdx = i;
    const knownInfo = KNOWN_STORY_FLAGS[flagIdx] || null;

    const card = document.createElement('div');
    card.className = 'story-flag-card';
    card.style.cssText = 'padding: 0.7rem 0.85rem; background: rgba(0,0,0,0.14); border: 1px solid var(--pico-muted-border-color); border-radius: 6px; display: flex; flex-direction: column; gap: 0.5rem; transition: border-color 0.15s, transform 0.15s;';
    card.dataset.index = String(flagIdx);
    card.dataset.hasKnown = knownInfo ? 'true' : 'false';

    // Card Top Row: Index + Hex/Dec inputs
    const topRow = document.createElement('div');
    topRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;';

    const indexBadge = document.createElement('div');
    indexBadge.style.cssText = 'display: flex; align-items: baseline; gap: 0.4rem;';
    indexBadge.innerHTML = `<strong style="font-size: 0.88rem; color: var(--pico-primary);">#${flagIdx}</strong><span style="font-size: 0.72rem; color: var(--pico-muted-color); font-family: monospace;">(0x${flagIdx.toString(16).padStart(2, '0').toUpperCase()})</span>`;
    topRow.appendChild(indexBadge);

    const inputsWrap = document.createElement('div');
    inputsWrap.style.cssText = 'display: flex; align-items: center; gap: 0.35rem;';

    // Decimal Input (0-255)
    const decInput = document.createElement('input');
    decInput.type = 'number';
    decInput.min = '0';
    decInput.max = '255';
    decInput.value = String(arr[flagIdx] || 0);
    decInput.title = 'Decimal value (0-255)';
    decInput.style.cssText = 'width: 58px; font-size: 0.75rem; padding: 0.2rem 0.35rem; margin-bottom: 0; text-align: center; height: auto;';

    // Hex Display
    const hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.maxLength = 4;
    hexInput.value = `0x${((arr[flagIdx] || 0)).toString(16).padStart(2, '0').toUpperCase()}`;
    hexInput.title = 'Hexadecimal value';
    hexInput.style.cssText = 'width: 54px; font-size: 0.72rem; padding: 0.2rem 0.35rem; margin-bottom: 0; text-align: center; font-family: monospace; height: auto;';

    inputsWrap.appendChild(decInput);
    inputsWrap.appendChild(hexInput);
    topRow.appendChild(inputsWrap);
    card.appendChild(topRow);

    // Known Annotation Header
    let searchText = `flag ${flagIdx} 0x${flagIdx.toString(16)}`;
    if (knownInfo) {
      searchText += ` ${knownInfo.name.toLowerCase()} ${knownInfo.area.toLowerCase()} ${knownInfo.desc.toLowerCase()}`;
      Object.values(knownInfo.bits).forEach(bDesc => {
        searchText += ` ${bDesc.toLowerCase()}`;
      });

      const annotBox = document.createElement('div');
      annotBox.style.cssText = 'font-size: 0.74rem; background: rgba(52, 152, 219, 0.08); border-left: 3px solid var(--pico-primary); padding: 0.25rem 0.45rem; border-radius: 0 4px 4px 0; line-height: 1.35;';
      annotBox.innerHTML = `<strong>${knownInfo.name}</strong> <span style="font-size: 0.68rem; color: var(--pico-muted-color);">[${knownInfo.area}]</span><div style="font-size: 0.68rem; color: var(--pico-muted-color); margin-top: 0.15rem;">${knownInfo.desc}</div>`;
      card.appendChild(annotBox);
    }
    card.dataset.searchText = searchText;

    // Bit Toggles Bar (Bits 0 to 7)
    const bitsBar = document.createElement('div');
    bitsBar.style.cssText = 'display: grid; grid-template-columns: repeat(8, 1fr); gap: 0.2rem; align-items: center; margin-top: 0.2rem;';

    const bitCheckboxes = [];

    for (let b = 0; b < 8; b++) {
      const bitIdx = b;
      const mask = 1 << bitIdx;
      const isKnownBit = knownInfo?.bits?.[bitIdx] !== undefined;

      const bitWrap = document.createElement('label');
      bitWrap.style.cssText = `display: flex; flex-direction: column; align-items: center; gap: 0.15rem; font-size: 0.64rem; margin-bottom: 0; padding: 0.2rem 0.1rem; border-radius: 3px; cursor: pointer; background: ${isKnownBit ? 'rgba(52, 152, 219, 0.15)' : 'rgba(255,255,255,0.04)'}; border: 1px solid ${isKnownBit ? 'rgba(52, 152, 219, 0.35)' : 'transparent'};`;
      
      const bitTitle = isKnownBit ? `Bit ${bitIdx} (Mask ${mask} / 0x${mask.toString(16).toUpperCase()}): ${knownInfo.bits[bitIdx]}` : `Bit ${bitIdx} (Mask ${mask} / 0x${mask.toString(16).toUpperCase()})`;
      bitWrap.title = bitTitle;

      const bitCb = document.createElement('input');
      bitCb.type = 'checkbox';
      bitCb.style.cssText = 'margin: 0; width: 14px; height: 14px; cursor: pointer;';
      bitCb.checked = ((arr[flagIdx] || 0) & mask) !== 0;

      const bitLabel = document.createElement('span');
      bitLabel.style.cssText = `font-weight: ${isKnownBit ? '700' : '500'}; color: ${isKnownBit ? 'var(--pico-primary)' : 'var(--pico-muted-color)'}; font-family: monospace; font-size: 0.65rem;`;
      bitLabel.textContent = `b${bitIdx}`;

      bitWrap.appendChild(bitCb);
      bitWrap.appendChild(bitLabel);
      bitsBar.appendChild(bitWrap);

      bitCb.addEventListener('change', (e) => {
        let curVal = arr[flagIdx] || 0;
        if (e.target.checked) {
          curVal |= mask;
        } else {
          curVal &= ~mask;
        }
        arr[flagIdx] = curVal;
        syncInputs();
        card.dataset.value = String(curVal);
        updateCardVisual();
        updateStats();
        if (updateCallback) updateCallback();
      });

      bitCheckboxes.push({ bitIdx, cb: bitCb, mask });
    }
    card.appendChild(bitsBar);

    // Sync input handlers
    const syncInputs = () => {
      const val = arr[flagIdx] || 0;
      decInput.value = String(val);
      hexInput.value = `0x${val.toString(16).padStart(2, '0').toUpperCase()}`;
      bitCheckboxes.forEach(({ cb, mask }) => {
        cb.checked = (val & mask) !== 0;
      });
    };

    const updateCardVisual = () => {
      const val = arr[flagIdx] || 0;
      if (val > 0) {
        card.style.borderColor = knownInfo ? 'rgba(52, 152, 219, 0.45)' : 'rgba(46, 204, 113, 0.35)';
        card.style.background = knownInfo ? 'rgba(52, 152, 219, 0.05)' : 'rgba(46, 204, 113, 0.04)';
      } else {
        card.style.borderColor = 'var(--pico-muted-border-color)';
        card.style.background = 'rgba(0,0,0,0.14)';
      }
    };

    decInput.addEventListener('change', (e) => {
      let v = parseInt(e.target.value);
      if (isNaN(v)) v = 0;
      v = Math.max(0, Math.min(255, v));
      arr[flagIdx] = v;
      syncInputs();
      card.dataset.value = String(v);
      updateCardVisual();
      updateStats();
      if (updateCallback) updateCallback();
    });

    hexInput.addEventListener('change', (e) => {
      let raw = e.target.value.trim().replace(/^0x/i, '');
      let v = parseInt(raw, 16);
      if (isNaN(v)) v = 0;
      v = Math.max(0, Math.min(255, v));
      arr[flagIdx] = v;
      syncInputs();
      card.dataset.value = String(v);
      updateCardVisual();
      updateStats();
      if (updateCallback) updateCallback();
    });

    card.dataset.value = String(arr[flagIdx] || 0);
    updateCardVisual();
    grid.appendChild(card);

    flagCards.push({
      index: flagIdx,
      card,
      hasKnown: Boolean(knownInfo),
      sync: syncInputs,
      updateVisual: updateCardVisual
    });
  }

  // Filter & Search handler
  const applyFilters = () => {
    const q = searchInput.value.trim().toLowerCase();
    const mode = filterSelect.value;

    flagCards.forEach(fc => {
      const val = arr[fc.index] || 0;
      let matchesFilter = true;

      if (mode === 'known') {
        matchesFilter = fc.hasKnown;
      } else if (mode === 'active') {
        matchesFilter = val > 0;
      } else if (mode === 'inactive') {
        matchesFilter = val === 0;
      }

      let matchesSearch = true;
      if (q.length > 0) {
        matchesSearch = fc.card.dataset.searchText.includes(q);
      }

      fc.card.style.display = (matchesFilter && matchesSearch) ? 'flex' : 'none';
    });
  };

  searchInput.addEventListener('input', applyFilters);
  filterSelect.addEventListener('change', applyFilters);

  resetAllBtn.addEventListener('click', () => {
    const visibleCards = flagCards.filter(fc => fc.card.style.display !== 'none');
    if (visibleCards.length === 0) return;

    const confirmMsg = `Reset all ${visibleCards.length} currently filtered event flags to 0?`;
    if (window.confirm(confirmMsg)) {
      visibleCards.forEach(fc => {
        arr[fc.index] = 0;
        fc.sync();
        fc.card.dataset.value = '0';
        fc.updateVisual();
      });
      updateStats();
      if (updateCallback) updateCallback();
    }
  });

  updateStats();
  return container;
}
