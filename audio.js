const music = document.getElementById('bgMusic');

function toggleMusic() {
    if (music.paused) { 
        music.play().catch(e => console.error("Erreur lecture :", e)); 
        document.getElementById('musicBtn').textContent = "🔊 MUSIQUE"; 
    }
    else { 
        music.pause(); 
        document.getElementById('musicBtn').textContent = "🔇 MUSIQUE"; 
    }
}
