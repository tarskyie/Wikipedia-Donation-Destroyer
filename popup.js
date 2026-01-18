const unreliableDomainsDefault = [
    "nytimes.com",
    "washingtonpost.com",
    "theatlantic.com",
    "cnn.com",
    "espn.com",
    "politico.com",
    "thedailybeast.com",
    "newyorker.com",
    "buzzfeednews.com",
    "people.com",
    "huffpost.com",
    "npr.org",
    "bbc.com",
    "motherjones.com",
    "huffingtonpost.ca",
    "economist.com",
    "azfamily.com",
    "axios.com",
    "aljazeera.com",
    "vanityfair.com"
];

let unreliableDomains = [];

// Load domains from storage
async function loadDomains() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['unreliableDomains'], function(result) {
            if (chrome.runtime.lastError) {
                console.error("Error loading domains:", chrome.runtime.lastError);
                resolve(unreliableDomainsDefault);
                return;
            }
            
            // If no custom domains saved, use defaults
            const domains = result.unreliableDomains && result.unreliableDomains.length > 0 
                ? result.unreliableDomains 
                : unreliableDomainsDefault;
            
            resolve(domains);
        });
    });
}

// Save domains to storage
function saveDomains(domains) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({unreliableDomains: domains}, function() {
            if (chrome.runtime.lastError) {
                console.error("Error saving domains:", chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
                return;
            }
            unreliableDomains = domains;
            resolve();
        });
    });
}

function updateTheList() {
    const theList = document.querySelector(".domain-list");
    if (!theList) {
        console.error("Domain list element not found");
        return;
    }
    
    theList.innerHTML = '';
    unreliableDomains.forEach((domain) => {
        const li = document.createElement("li");
        li.textContent = domain;
        theList.appendChild(li);
    });
}

async function addDomainOnclick() {
    const domain = prompt("Enter a domain to add (e.g., example.com):");
    
    if (!domain || domain.trim() === '') {
        return; // User cancelled or entered nothing
    }
    
    const cleanDomain = domain.trim().toLowerCase().replace(/^www\./, '');
    
    if (unreliableDomains.includes(cleanDomain)) {
        alert(`"${cleanDomain}" is already in the list.`);
        return;
    }
    
    try {
        const updatedDomains = [...unreliableDomains, cleanDomain];
        await saveDomains(updatedDomains);
        updateTheList();
        alert(`Added "${cleanDomain}" to the list.`);
    } catch (error) {
        alert("Failed to add domain. Please try again.");
        console.error("Error adding domain:", error);
    }
}

async function removeDomainOnclick() {
    const indexStr = prompt("Enter the index number of the domain to remove (shown before the colon):");
    
    if (indexStr === null || indexStr.trim() === '') {
        return; // User cancelled
    }
    
    const idx = parseInt(indexStr);

    if (isNaN(idx) || idx < 1 || idx > unreliableDomains.length) {
        alert(`Invalid index. Please enter a number between 1 and ${unreliableDomains.length}.`);
        return;
    }
    
    try {
        const domainToRemove = unreliableDomains[idx - 1];
        const updatedDomains = unreliableDomains.filter((_, i) => i !== idx - 1);
        await saveDomains(updatedDomains);
        updateTheList();
        alert(`Removed "${domainToRemove}" from the list.`);
    } catch (error) {
        alert("Failed to remove domain. Please try again.");
        console.error("Error removing domain:", error);
    }
}

async function resetDomainList() {
    try {
        await saveDomains(unreliableDomainsDefault);
        updateTheList();
        alert("Domain list has been reset to default.");
    } catch (error) {
        alert("Failed to reset domain list. Please try again.");
        console.error("Error resetting domain list:", error);
    }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
    // Load domains first
    unreliableDomains = await loadDomains();
    
    // Display the list
    updateTheList();
    
    // Setup event listeners
    const addButton = document.getElementById("add-domain-button");
    const removeButton = document.getElementById("remove-domain-button");
    const resetButton = document.getElementById("reset-list-button");
    
    if (addButton) {
        addButton.addEventListener("click", addDomainOnclick);
    } else {
        console.error("Add button not found");
    }
    
    if (removeButton) {
        removeButton.addEventListener("click", removeDomainOnclick);
    } else {
        console.error("Remove button not found");
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetDomainList);
    } else {
        console.error("Reset button not found");
    }
});