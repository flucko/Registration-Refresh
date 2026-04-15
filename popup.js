let currentTabId = null;
let updateInterval = null;

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Fill inputs with current time
    const now = new Date();
    document.getElementById('hour').value = String(now.getHours()).padStart(2, '0');
    document.getElementById('minute').value = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('second').value = '00';

    // Get current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
        currentTabId = tabs[0].id;
        checkStatus();
    }

    // Attach listeners
    document.getElementById('startBtn').addEventListener('click', onStart);
    document.getElementById('cancelBtn').addEventListener('click', onCancel);
    document.getElementById('testBtn').addEventListener('click', onTest);
});

function checkStatus() {
    chrome.storage.local.get(['refreshJobs'], (result) => {
        const jobs = result.refreshJobs || {};
        const targetTime = jobs[currentTabId];

        if (targetTime) {
            setUIActive(targetTime);
        } else {
            setUIInactive();
        }
    });
}

function setUIActive(targetTimestamp) {
    document.getElementById('statusIndicator').className = 'status active';
    document.getElementById('statusIndicator').querySelector('.text').textContent = 'Active for this tab';
    
    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('testBtn').classList.add('hidden');
    document.getElementById('cancelBtn').classList.remove('hidden');
    
    document.getElementById('countdown').classList.remove('hidden');
    
    // Clear existing interval
    if (updateInterval) clearInterval(updateInterval);
    
    // Update countdown every 100ms
    updateInterval = setInterval(() => {
        const now = Date.now();
        const remaining = targetTimestamp - now;
        
        if (remaining <= 0) {
            clearInterval(updateInterval);
            document.getElementById('countdown').textContent = 'Refreshing...';
            // Schedule UI check shortly after to revert to inactive if refresh is done
            setTimeout(() => checkStatus(), 1000);
            return;
        }
        
        const seconds = Math.floor((remaining / 1000) % 60);
        const minutes = Math.floor((remaining / 1000 / 60) % 60);
        const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
        
        document.getElementById('countdown').textContent = 
            `Refreshing in ${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
    }, 100);
}

function setUIInactive() {
    document.getElementById('statusIndicator').className = 'status inactive';
    document.getElementById('statusIndicator').querySelector('.text').textContent = 'Not Active';
    
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('testBtn').classList.remove('hidden');
    document.getElementById('cancelBtn').classList.add('hidden');
    
    document.getElementById('countdown').classList.add('hidden');
    
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

function onStart() {
    const h = parseInt(document.getElementById('hour').value) || 0;
    const m = parseInt(document.getElementById('minute').value) || 0;
    const s = parseInt(document.getElementById('second').value) || 0;
    
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, s, 0);
    
    // If target is in the past, assume tomorrow
    if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
    }
    
    scheduleRefresh(target.getTime());
}

function onTest() {
    const target = new Date(Date.now() + 20000);
    document.getElementById('hour').value = String(target.getHours()).padStart(2, '0');
    document.getElementById('minute').value = String(target.getMinutes()).padStart(2, '0');
    document.getElementById('second').value = String(target.getSeconds()).padStart(2, '0');
    scheduleRefresh(target.getTime());
}

function onCancel() {
    chrome.runtime.sendMessage({ action: 'cancel', tabId: currentTabId }, (response) => {
        if (response && response.success) {
            setUIInactive();
        }
    });
}

function scheduleRefresh(targetTimestamp) {
    if (!currentTabId) return;
    
    chrome.runtime.sendMessage({ 
        action: 'schedule', 
        tabId: currentTabId, 
        targetTimestamp: targetTimestamp 
    }, (response) => {
        if (response && response.success) {
            setUIActive(targetTimestamp);
        }
    });
}
