let timers = {};

// When waking up, restore timers
chrome.storage.local.get(['refreshJobs'], (result) => {
    const jobs = result.refreshJobs || {};
    Object.keys(jobs).forEach(tabId => {
        scheduleRefresh(parseInt(tabId), jobs[tabId]);
    });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith('refresh_')) {
        const tabId = parseInt(alarm.name.split('_')[1]);
        chrome.storage.local.get(['refreshJobs'], (result) => {
            const jobs = result.refreshJobs || {};
            if (jobs[tabId]) {
                scheduleRefresh(tabId, jobs[tabId]);
            }
        });
    }
});

function scheduleRefresh(tabId, targetTimestamp) {
    const now = Date.now();
    const delay = targetTimestamp - now;
    
    // Clear existing local timeout just in case
    if (timers[tabId]) {
        clearTimeout(timers[tabId]);
        delete timers[tabId];
    }
    
    if (delay <= 0) {
        executeRefresh(tabId);
    } else if (delay <= 60000) {
        // Less than a minute, safe to use setTimeout
        timers[tabId] = setTimeout(() => {
            executeRefresh(tabId);
        }, delay);
    } else {
        // More than a minute, use alarm to wake up service worker 30 seconds before
        const wakeupTime = targetTimestamp - 30000;
        chrome.alarms.create(`refresh_${tabId}`, { when: wakeupTime });
    }
}

function executeRefresh(tabId) {
    chrome.tabs.reload(tabId, () => {
        if (chrome.runtime.lastError) {
            console.log('Tab might be closed:', chrome.runtime.lastError);
        }
    });

    // Remove job
    chrome.storage.local.get(['refreshJobs'], (result) => {
        const jobs = result.refreshJobs || {};
        delete jobs[tabId];
        chrome.storage.local.set({ refreshJobs: jobs });
    });

    // Remove timer/alarms
    delete timers[tabId];
    chrome.alarms.clear(`refresh_${tabId}`);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'schedule') {
        const { tabId, targetTimestamp } = request;
        chrome.storage.local.get(['refreshJobs'], (result) => {
            const jobs = result.refreshJobs || {};
            jobs[tabId] = targetTimestamp;
            chrome.storage.local.set({ refreshJobs: jobs }, () => {
                scheduleRefresh(tabId, targetTimestamp);
                sendResponse({ success: true });
            });
        });
        return true; // keeps the message channel open for sendResponse
    } else if (request.action === 'cancel') {
        const { tabId } = request;
        chrome.storage.local.get(['refreshJobs'], (result) => {
            const jobs = result.refreshJobs || {};
            delete jobs[tabId];
            chrome.storage.local.set({ refreshJobs: jobs }, () => {
                if (timers[tabId]) {
                    clearTimeout(timers[tabId]);
                    delete timers[tabId];
                }
                chrome.alarms.clear(`refresh_${tabId}`);
                sendResponse({ success: true });
            });
        });
        return true;
    }
});
