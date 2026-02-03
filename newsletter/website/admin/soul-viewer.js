# SOUL Viewer Modal
function showAgentModal(agentName) {
    const souls = {
        jarvis: `/agents/jarvis/SOUL.md`,
        shuri: `/agents/shuri/SOUL.md`,
        fury: `/agents/fury/SOUL.md`,
        loki: `/agents/loki/SOUL.md`,
        vision: `/agents/vision/SOUL.md`
    };
    
    fetch(souls[agentName])
        .then(r => r.text())
        .then(content => {
            document.getElementById('modalTitle').textContent = agentName.toUpperCase();
            document.getElementById('modalContent').textContent = content;
            document.getElementById('soulModal').style.display = 'flex';
        });
}