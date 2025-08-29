

// Get all the necessary elements from the DOM
const likeCountSpan = document.querySelector('.navbar-badge.red span');
const coinCountSpan = document.querySelector('.navbar-badge.yellow span');
const copyCountButton = document.querySelector('.navbar-button');
const callHistoryList = document.querySelector('#call-history-list');
const clearHistoryBtn = document.querySelector('.clear-history-button');
const callButtons = document.querySelectorAll('.card-button.success');
const favoriteButtons = document.querySelectorAll('.card-favorite-btn');
const copyButtons = document.querySelectorAll('.card-button.ghost');

// Initialize counts from localStorage or set defaults
let likes = parseInt(localStorage.getItem('likes')) || 0;
let coins = parseInt(localStorage.getItem('coins')) || 100;
let callHistory = JSON.parse(localStorage.getItem('callHistory')) || [];
let copyCount = parseInt(localStorage.getItem('copyCount')) || 2;

// Function to update the counts in the navbar
function updateNavbarCounts() {
    likeCountSpan.textContent = likes;
    coinCountSpan.textContent = coins;
    copyCountButton.textContent = `${copyCount} Copy`;
}

// Function to save the current state to localStorage
function saveState() {
    localStorage.setItem('likes', likes);
    localStorage.setItem('coins', coins);
    localStorage.setItem('callHistory', JSON.stringify(callHistory));
    localStorage.setItem('copyCount', copyCount);
}

// Function to render the call history dynamically
function renderCallHistory() {
    callHistoryList.innerHTML = ''; // Clear existing history
    if (callHistory.length === 0) {
        callHistoryList.innerHTML = '<li class="text-gray-500 text-sm p-3">No calls yet.</li>';
        return;
    }
    callHistory.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-list-item';
        li.innerHTML = `
            <div>
                <p class="history-item-name">${item.name}</p>
                <p class="history-item-number">${item.number}</p>
            </div>
            <span class="history-item-time">${item.time}</span>
        `;
        callHistoryList.appendChild(li);
    });
}

// Function to initialize favorite button states on page load
function initializeFavoriteButtons() {
    favoriteButtons.forEach(button => {
        const card = button.closest('.card');
        const serviceId = card.getAttribute('data-service-id');
        if (favoritedServices.includes(serviceId)) {
            button.querySelector('svg').style.color = '#ef4444'; // Set to red if favorited
        }
    });
}

// Event Listeners for Call Buttons
callButtons.forEach(button => {
    button.addEventListener('click', () => {
        const card = button.closest('.card');
        const serviceName = card.querySelector('.card-title').textContent;
        const serviceNumber = card.querySelector('.card-hotline').textContent;
        const costPerCall = 20;

        if (coins < costPerCall) {
            alert(`Insufficient coins! You need ${costPerCall} coins to make this call.`);
            return;
        }

        coins -= costPerCall;
        updateNavbarCounts();

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        callHistory.unshift({
            name: serviceName,
            number: serviceNumber,
            time: timeString
        });
        
        // Keep the history limited to a reasonable number, e.g., 10
        if (callHistory.length > 10) {
            callHistory.pop();
        }

        alert(`Calling ${serviceName} at ${serviceNumber}!`);
        renderCallHistory();
        saveState();
    });
});

// Event Listeners for Favorite Buttons
favoriteButtons.forEach(button => {
    button.addEventListener('click', () => {
        const card = button.closest('.card');
        const serviceId = card.getAttribute('data-service-id');
        const heartSVG = button.querySelector('svg');

        if (favoriteButtons.includes(serviceId)) { // You need to track favorited items
            favoriteButtons = favoriteButtons.filter(id => id !== serviceId);
            likes--;
            heartSVG.style.color = '#ccc'; // Change to default color
        } else {
            favoriteButtons.push(serviceId);
            likes++;
            heartSVG.style.color = '#ef4444'; // Change to red
        }
        updateNavbarCounts();
        saveState();
    });
});

// Event Listeners for Copy Buttons
copyButtons.forEach(button => {
    button.addEventListener('click', async () => {
        const card = button.closest('.card');
        const serviceNumber = card.querySelector('.card-hotline').textContent;
        
        try {
            await navigator.clipboard.writeText(serviceNumber);
            alert(`Copied "${serviceNumber}" to clipboard!`);
            copyCount++;
            updateNavbarCounts();
            saveState();
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard. Please try manually.');
        }
    });
});

// Event Listener for Clear History Button
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all call history?')) {
        callHistory = [];
        renderCallHistory();
        saveState();
    }
});

// Initial rendering and state updates on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavbarCounts();
    renderCallHistory();
    initializeFavoriteButtons();
});