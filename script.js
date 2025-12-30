let gold = 0, prestige = 0, turn = 1, iaActionCount = 0, maneuverGoldAdded = false;
let iaNoMoreAttackers = false, iaHasPassedDefinitively = false, hasHadZeroGold = false;
let zeroGoldActionCount = 0;

function startGame() { 
    document.getElementById('welcomeScreen').style.display = 'none'; 
    applyInterfaceLock(); 
}

function updateGold(amount) { 
    gold = Math.max(0, gold + amount); 
    document.getElementById('goldValue').textContent = gold; 
    if (gold === 0) hasHadZeroGold = true; 
    if (amount > 0 && !maneuverGoldAdded) { 
        maneuverGoldAdded = true; 
        applyInterfaceLock(); 
    } 
}

function updatePrestige(amount) { 
    prestige = Math.max(0, prestige + amount); 
    document.getElementById('prestigeValue').textContent = prestige;
    if (prestige >= 20) document.getElementById('victoryScreen').style.display = 'flex';
}

function applyInterfaceLock() {
    const lock = !maneuverGoldAdded;
    const prestigeSec = document.getElementById('prestigeSection');
    const turnSec = document.getElementById('turnSection');
    const iaBtnGrp = document.getElementById('iaButtonGroup');
    
    if(prestigeSec) prestigeSec.classList.toggle('locked-zone', lock);
    if(turnSec) turnSec.classList.toggle('locked-zone', lock);
    if(iaBtnGrp) iaBtnGrp.classList.toggle('locked-zone', lock);
    
    document.querySelectorAll('#prestigeSection button, #turnSection button, #iaButtonGroup button').forEach(b => {
        if (b.id === 'actionBtn' && iaHasPassedDefinitively) b.disabled = true;
        else b.disabled = lock;
    });

    const res = document.getElementById('actionResult');
    if (res) {
        if (lock) res.innerHTML = "<div class='gold-waiting-msg'>Ajoute l'Or de la manœuvre</div>";
        else if (iaHasPassedDefinitively) res.innerHTML = "<p style='color:#ff4444;'>J'ai passé mon tour définitivement.</p>";
        else res.innerHTML = "<p>En attente d'une action...</p>";
    }
}

async function showHelp() {
    const modal = document.getElementById('helpModal');
    if (modal && modal.innerHTML.trim() === "") {
        try {
            const response = await fetch('aide.html');
            const content = await response.text();
            modal.innerHTML = content;
        } catch (e) { 
            modal.innerHTML = "<div class='modal-content'>Erreur de chargement.</div>"; 
        }
    }
    if(modal) modal.style.display = 'flex';
}

function hideHelp() { 
    const modal = document.getElementById('helpModal');
    if(modal) modal.style.display = 'none'; 
}

function switchTab(evt, tabId) { 
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active')); 
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
    const target = document.getElementById(tabId);
    if(target) target.classList.add('active'); 
    if(evt) evt.currentTarget.classList.add('active'); 
}

function toggleBoardState() { 
    const btn = document.getElementById('boardStateBtn');
    if (btn) {
        if (!iaNoMoreAttackers) { 
            iaNoMoreAttackers = true; 
            btn.textContent = "BOARD INCLINÉ"; 
        } else { 
            iaNoMoreAttackers = false; 
            btn.textContent = "PLUS D'ATTAQUANTS"; 
        }
    }
}

function performAppAction() {
    if (iaHasPassedDefinitively) return;
    iaActionCount++;
    const actionBtn = document.getElementById('actionBtn');
    if(actionBtn) actionBtn.textContent = `ACTION (${iaActionCount})`;
    
    let validActionFound = false;
    let move = "";
    if (gold === 0) zeroGoldActionCount++;

    while (!validActionFound) {
        let rand = Math.floor(Math.random() * 100);
        let passThreshold = (hasHadZeroGold) ? Math.max(5, zeroGoldActionCount * 10) : 0;

        if (rand < passThreshold) {
            move = "Je passe mon tour définitivement.";
            iaHasPassedDefinitively = true;
            if(actionBtn) actionBtn.disabled = true;
            validActionFound = true;
        } else if (rand < 40) { 
            if (gold > 0) {
                move = "Je joue une carte personnage/attachement.";
                iaNoMoreAttackers = false;
                const boardBtn = document.getElementById('boardStateBtn');
                if(boardBtn) boardBtn.textContent = "PLUS D'ATTAQUANTS";
                validActionFound = true;
            }
        } else if (rand < 65) { 
            if (!iaNoMoreAttackers) { 
                startCombat(true); 
                return; 
            }
        } else if (rand < 85) {
            move = "Je joue une carte événement ACTION.";
            validActionFound = true;
        } else { 
            move = "J'active une capacité ACTION (de gauche à droite).";
            validActionFound = true;
        }
    }
    const res = document.getElementById('actionResult');
    if(res) res.innerHTML = `<p>${move}</p>`;
}

function startCombat(isIA = false) {
    const mod = document.getElementById('combatModule');
    const iaGrp = document.getElementById('iaButtonGroup');
    if(mod) mod.style.display = 'block';
    if(iaGrp) iaGrp.classList.add('locked-zone');
    
    document.querySelectorAll('#iaButtonGroup button').forEach(b => b.disabled = true);
    
    const res = document.getElementById('actionResult');
    const resp = document.getElementById('combatResponse');
    const endBtn = document.getElementById('endCombatBtn');
    
    if(res) res.style.display = 'none';
    if(resp) resp.innerHTML = isIA ? "🔥 JE DÉCLARE UN COMBAT 🔥" : "🔥 COMBAT DÉCLARÉ 🔥";
    if(endBtn) endBtn.disabled = true;
}

function performCombatAction() {
    const moves = ["Je joue un événement 'Combat'.", "Je passe."];
    const resp = document.getElementById('combatResponse');
    const cBtn = document.getElementById('combatBtn');
    const endBtn = document.getElementById('endCombatBtn');
    
    if(resp) resp.innerHTML = moves[Math.floor(Math.random() * moves.length)];
    if(cBtn) cBtn.style.display = 'none';
    if(endBtn) endBtn.disabled = false;
}

function endCombat() {
    const mod = document.getElementById('combatModule');
    const iaGrp = document.getElementById('iaButtonGroup');
    const res = document.getElementById('actionResult');
    const cBtn = document.getElementById('combatBtn');
    
    if(mod) mod.style.display = 'none';
    if(iaGrp) iaGrp.classList.remove('locked-zone');
    
    applyInterfaceLock();
    
    if(res) {
        res.style.display = 'flex';
        res.innerHTML = "<p>Combat terminé.</p>";
    }
    if(cBtn) cBtn.style.display = 'flex';
}

function nextTurn() { 
    turn++; 
    maneuverGoldAdded = false; 
    iaActionCount = 0; 
    iaHasPassedDefinitively = false; 
    iaNoMoreAttackers = false;
    hasHadZeroGold = (gold === 0);
    zeroGoldActionCount = 0; 
    
    const boardBtn = document.getElementById('boardStateBtn');
    const turnVal = document.getElementById('turnValue');
    const actBtn = document.getElementById('actionBtn');
    
    if(boardBtn) boardBtn.textContent = "PLUS D'ATTAQUANTS";
    if(turnVal) turnVal.textContent = turn; 
    if(actBtn) actBtn.textContent = "ACTION (0)"; 
    
    applyInterfaceLock(); 
}

function applyBonusAction() { 
    if (Math.random() < 0.5) updateGold(1); 
    else updatePrestige(1); 
}

function resetGame() { 
    location.reload(); 
}

window.onload = function() {
    applyInterfaceLock();
};
