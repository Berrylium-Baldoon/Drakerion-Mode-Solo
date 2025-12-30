let gold = 0;
let prestige = 0;
let turn = 1;
let iaActionCount = 0;
let maneuverGoldAdded = false;
let iaNoMoreAttackers = false;
let iaHasPassedDefinitively = false;
let hasHadZeroGold = false;
let zeroGoldActionCount = 0;

function loadWelcomeScreen() {
    const screen = document.getElementById('welcomeScreen');
    const template = document.getElementById('welcomeTemplate');
    if (screen && template) {
        screen.innerHTML = template.innerHTML;
        screen.style.display = 'flex';
    }
}

function startGame() {
    const screen = document.getElementById('welcomeScreen');
    if (screen) screen.style.display = 'none';
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
    if (prestige >= 20) {
        const victory = document.getElementById('victoryScreen');
        if (victory) victory.style.display = 'flex';
    }
}

function applyInterfaceLock() {
    const lock = !maneuverGoldAdded;
    const pSec = document.getElementById('prestigeSection');
    const tSec = document.getElementById('turnSection');
    const iGrp = document.getElementById('iaButtonGroup');
    if (pSec) pSec.classList.toggle('locked-zone', lock);
    if (tSec) tSec.classList.toggle('locked-zone', lock);
    if (iGrp) iGrp.classList.toggle('locked-zone', lock);
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
        } catch (e) { modal.innerHTML = "<div class='modal-content'>Erreur de chargement.</div>"; }
    }
    if (modal) modal.style.display = 'flex';
}

function hideHelp() { 
    const modal = document.getElementById('helpModal');
    if (modal) modal.style.display = 'none'; 
}

function switchTab(evt, tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    if (evt) evt.currentTarget.classList.add('active');
}

function toggleBoardState() {
    const btn = document.getElementById('boardStateBtn');
    if (btn) {
        if (!iaNoMoreAttackers) { iaNoMoreAttackers = true; btn.textContent = "BOARD INCLINÉ"; }
        else { iaNoMoreAttackers = false; btn.textContent = "PLUS D'ATTAQUANTS"; }
    }
}

function performAppAction() {
    if (iaHasPassedDefinitively) return;
    iaActionCount++;
    const actBtn = document.getElementById('actionBtn');
    if (actBtn) actBtn.textContent = "ACTION (" + iaActionCount + ")";
    let validActionFound = false;
    let move = "";
    if (gold === 0) zeroGoldActionCount++;
    while (!validActionFound) {
        let rand = Math.floor(Math.random() * 100);
        let passThreshold = (hasHadZeroGold) ? Math.max(5, zeroGoldActionCount * 10) : 0;
        if (rand < passThreshold) {
            move = "Je passe mon tour définitivement.";
            iaHasPassedDefinitively = true;
            if (actBtn) actBtn.disabled = true;
            validActionFound = true;
        } else if (rand < 40) {
            if (gold > 0) {
                move = "Je joue une carte personnage/attachement.";
                iaNoMoreAttackers = false;
                const bBtn = document.getElementById('boardStateBtn');
                if (bBtn) bBtn.textContent = "PLUS D'ATTAQUANTS";
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
    const res = document.getElementById('actionResult');
    if (res) res.innerHTML = "<p>" + move + "</p>";
}

function startCombat(isIA) {
    const mod = document.getElementById('combatModule');
    const iaGrp = document.getElementById('iaButtonGroup');
    const res = document.getElementById('actionResult');
    const resp = document.getElementById('combatResponse');
    if (mod) mod.style.display = 'block';
    if (iaGrp) iaGrp.classList.add('locked-zone');
    document.querySelectorAll('#iaButtonGroup button').forEach(b => b.disabled = true);
    if (res) res.style.display = 'none';
    if (resp) resp.innerHTML = isIA ? "🔥 JE DÉCLARE UN COMBAT 🔥" : "🔥 COMBAT DÉCLARÉ 🔥";
    const endBtn = document.getElementById('endCombatBtn');
    if (endBtn) endBtn.disabled = true;
}

function performCombatAction() {
    const moves = ["Je joue un événement 'Combat'.", "Je passe."];
    const resp = document.getElementById('combatResponse');
    const cBtn = document.getElementById('combatBtn');
    const eBtn = document.getElementById('endCombatBtn');
    if (resp) resp.innerHTML = moves[Math.floor(Math.random() * moves.length)];
    if (cBtn) cBtn.style.display = 'none';
    if (eBtn) eBtn.disabled = false;
}

function endCombat() {
    const mod = document.getElementById('combatModule');
    const iaGrp = document.getElementById('iaButtonGroup');
    const res = document.getElementById('actionResult');
    const cBtn = document.getElementById('combatBtn');
    if (mod) mod.style.display = 'none';
    if (iaGrp) iaGrp.classList.remove('locked-zone');
    applyInterfaceLock();
    if (res) { res.style.display = 'flex'; res.innerHTML = "<p>Combat terminé.</p>"; }
    if (cBtn) cBtn.style.display = 'flex';
}

function nextTurn() {
    turn++; maneuverGoldAdded = false; iaActionCount = 0;
    iaHasPassedDefinitively = false; iaNoMoreAttackers = false;
    hasHadZeroGold = (gold === 0); zeroGoldActionCount = 0;
    const bBtn = document.getElementById('boardStateBtn');
    const tVal = document.getElementById('turnValue');
    const aBtn = document.getElementById('actionBtn');
    if (bBtn) bBtn.textContent = "PLUS D'ATTAQUANTS";
    if (tVal) tVal.textContent = turn;
    if (aBtn) aBtn.textContent = "ACTION (0)";
    applyInterfaceLock();
}

function applyBonusAction() {
    if (Math.random() < 0.5) updateGold(1);
    else updatePrestige(1);
}

function resetGame() { location.reload(); }

window.onload = function() {
    loadWelcomeScreen();
    applyInterfaceLock();
};
