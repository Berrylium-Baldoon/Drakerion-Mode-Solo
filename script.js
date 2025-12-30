let gold = 0, prestige = 0, turn = 1, iaActionCount = 0, maneuverGoldAdded = false;
let iaNoMoreAttackers = false, iaHasPassedDefinitively = false, hasHadZeroGold = false;
let zeroGoldActionCount = 0; 

function startGame() { document.getElementById('welcomeScreen').style.display = 'none'; applyInterfaceLock(); }

function updateGold(amount) { 
    gold = Math.max(0, gold + amount); 
    document.getElementById('goldValue').textContent = gold; 
    if (gold === 0) hasHadZeroGold = true; 
    if (amount > 0 && !maneuverGoldAdded) { maneuverGoldAdded = true; applyInterfaceLock(); } 
}

function updatePrestige(amount) { 
    prestige = Math.max(0, prestige + amount); 
    document.getElementById('prestigeValue').textContent = prestige;
    if (prestige >= 20) document.getElementById('victoryScreen').style.display = 'flex';
}

function applyInterfaceLock() {
    const lock = !maneuverGoldAdded;
    document.getElementById('prestigeSection').classList.toggle('locked-zone', lock);
    document.getElementById('turnSection').classList.toggle('locked-zone', lock);
    document.getElementById('iaButtonGroup').classList.toggle('locked-zone', lock);
    
    document.querySelectorAll('#prestigeSection button, #turnSection button, #iaButtonGroup button').forEach(b => {
        if (b.id === 'actionBtn' && iaHasPassedDefinitively) b.disabled = true;
        else b.disabled = lock;
    });

    const res = document.getElementById('actionResult');
    if (lock) res.innerHTML = "<div class='gold-waiting-msg'>Ajoute l'Or de la manœuvre</div>";
    else if (iaHasPassedDefinitively) res.innerHTML = "<p style='color:#ff4444;'>J'ai passé mon tour définitivement.</p>";
    else res.innerHTML = "<p>En attente d'une action...</p>";
}

async function showHelp() {
    const modal = document.getElementById('helpModal');
    if (modal.innerHTML.trim() === "") {
        try {
            const response = await fetch('aide.html');
            const content = await response.text();
            modal.innerHTML = content;
        } catch (e) { modal.innerHTML = "<div class='modal-content'>Erreur de chargement.</div>"; }
    }
    modal.style.display = 'flex';
}

function hideHelp() { document.getElementById('helpModal').style.display = 'none'; }

function switchTab(evt, tabId) { 
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active')); 
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
    document.getElementById(tabId).classList.add('active'); 
    evt.currentTarget.classList.add('active'); 
}

function toggleBoardState() { 
    const btn = document.getElementById('boardStateBtn');
    if (!iaNoMoreAttackers) { iaNoMoreAttackers = true; btn.textContent = "BOARD INCLINÉ"; } 
    else { iaNoMoreAttackers = false; btn.textContent = "PLUS D'ATTAQUANTS"; }
}

function performAppAction() {
    if (iaHasPassedDefinitively) return;
    iaActionCount++;
    document.getElementById('actionBtn').textContent = `ACTION (${iaActionCount})`;
    
    let validActionFound = false;
    let move = "";
    if (gold === 0) zeroGoldActionCount++;

    while (!validActionFound) {
        let rand = Math.floor(Math.random() * 100);
        let passThreshold = (hasHadZeroGold) ? Math.max(5, zeroGoldActionCount * 10) : 0;

        if (rand < passThreshold) {
            move = "Je passe mon tour définitivement.";
            iaHasPassedDefinitively = true;
            document.getElementById('actionBtn').disabled = true;
            validActionFound = true;
        } else if (rand < 40) { 
            if (gold > 0) {
                move = "Je joue une carte personnage/attachement.";
                iaNoMoreAttackers = false;
                document.getElementById('boardStateBtn').textContent = "PLUS D'ATTAQUANTS";
                validActionFound = true;
            }
        } else if (rand < 65) { 
            if (!iaNoMoreAttackers) { startCombat(true); return; }
        } else if (rand < 85) {
            move = "Je joue une carte événement ACTION.";
            validActionFound = true;
        } else { 
            move = "J'active une capacité ACTION (de gauche à droite).";
            validActionFound = true;
        }
    }
    document.getElementById('actionResult').innerHTML = `<p>${move}</p>`;
}

function startCombat(isIA = false) {
    document.getElementById('combatModule').style.display = 'block';
    document.getElementById('iaButtonGroup').classList.add('locked-zone');
    document.querySelectorAll('#iaButtonGroup button').forEach(b => b.disabled = true);
    document.getElementById('actionResult').style.display = 'none';
    document.getElementById('combatResponse').innerHTML = isIA ? "🔥 JE DÉCLARE UN COMBAT 🔥" : "🔥 COMBAT DÉCLARÉ 🔥";
    document.getElementById('endCombatBtn').disabled = true;
}

function performCombatAction() {
    const moves = ["Je joue un événement 'Combat'.", "Je passe."];
    document.getElementById('combatResponse').innerHTML = moves[Math.floor(Math.random() * moves.length)];
    document.getElementById('combatBtn').style.display = 'none';
    document.getElementById('endCombatBtn').disabled = false;
}

function endCombat() {
    document.getElementById('combatModule').style.display = 'none';
    document.getElementById('iaButtonGroup').classList.remove('locked-zone');
    applyInterfaceLock();
    document.getElementById('actionResult').style.display = 'flex';
    document.getElementById('combatBtn').style.display = 'flex';
    document.getElementById('actionResult').innerHTML = "<p>Combat terminé.</p>";
}

function nextTurn() { 
    turn++; maneuverGoldAdded = false; iaActionCount = 0; 
    iaHasPassedDefinitively = false; iaNoMoreAttackers = false;
    hasHadZeroGold = (gold === 0);
    zeroGoldActionCount = 0; 
    document.getElementById('boardStateBtn').textContent = "PLUS D'ATTAQUANTS";
    document.getElementById('turnValue').textContent = turn; 
    document.getElementById('actionBtn').textContent = "ACTION (0)"; 
    applyInterfaceLock(); 
}

function applyBonusAction() { if (Math.random() < 0.5) updateGold(1); else updatePrestige(1); }
function resetGame() { location.reload(); }
window.onload = applyInterfaceLock;
