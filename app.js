// App data
let drivers = [];
let tires = [];
let currentView = 'main'; // 'main' or 'driver-detail'
let selectedDriverId = null;

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const addDriverBtn = document.getElementById('add-driver-btn');
const addTireBtn = document.getElementById('add-tire-btn');
const driverModal = document.getElementById('driver-modal');
const tireModal = document.getElementById('tire-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const driverForm = document.getElementById('driver-form');
const tireForm = document.getElementById('tire-form');
const driverList = document.getElementById('driver-list');
const tireList = document.getElementById('tire-list');
const driverFilter = document.getElementById('driver-filter');
const compoundFilter = document.getElementById('compound-filter');
const mountedFilter = document.getElementById('mounted-filter');
const tireDriverSelect = document.getElementById('tire-driver');
const totalTiresCount = document.getElementById('total-tires-count');
const compoundStats = document.getElementById('compound-stats');
const driverStats = document.getElementById('driver-stats');
const mainContent = document.querySelector('main');
const backButton = document.createElement('button');

// Initialize the app
function initApp() {
    loadData();
    setupEventListeners();
    renderDrivers();
    renderTires();
    updateDriverSelects();
    updateChampionshipsDatalist();
    updateStats();
    
    // Setup back button
    backButton.className = 'back-btn';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back';
    backButton.addEventListener('click', navigateToMainView);
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            setActiveTab(tabId);
        });
    });

    // Open modals
    addDriverBtn.addEventListener('click', () => driverModal.style.display = 'block');
    addTireBtn.addEventListener('click', () => {
        if (drivers.length === 0) {
            alert('Please add a driver first');
            return;
        }
        tireModal.style.display = 'block';
    });

    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            driverModal.style.display = 'none';
            tireModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === driverModal) driverModal.style.display = 'none';
        if (e.target === tireModal) tireModal.style.display = 'none';
    });

    // Form submissions
    driverForm.addEventListener('submit', handleDriverSubmit);
    tireForm.addEventListener('submit', handleTireSubmit);

    // Filters
    driverFilter.addEventListener('change', renderTires);
    compoundFilter.addEventListener('change', renderTires);
    mountedFilter.addEventListener('change', renderTires);
}

// Set active tab
function setActiveTab(tabId) {
    // If we're in driver detail view and trying to switch tabs, go back to main view first
    if (currentView === 'driver-detail') {
        navigateToMainView();
    }
    
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    tabContents.forEach(content => {
        if (content.id === `${tabId}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });

    // Update stats when switching to stats tab
    if (tabId === 'stats') {
        updateStats();
    }
}

// Handle driver form submission
function handleDriverSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('driver-name').value;
    const team = document.getElementById('driver-team').value;
    const championship = document.getElementById('driver-championship') ? document.getElementById('driver-championship').value : '';
    
    const newDriver = {
        id: Date.now().toString(),
        name,
        team,
        championship
    };
    
    drivers.push(newDriver);
    saveData();
    renderDrivers();
    updateDriverSelects();
    updateChampionshipsDatalist();
    
    driverForm.reset();
    driverModal.style.display = 'none';
}

// Handle tire form submission
function handleTireSubmit(e) {
    e.preventDefault();
    
    const driverId = document.getElementById('tire-driver').value;
    const compound = document.getElementById('tire-compound').value;
    const condition = document.getElementById('tire-condition').value;
    const setNumber = parseInt(document.getElementById('tire-set-number').value);
    const notes = document.getElementById('tire-notes').value;
    
    // Get driver to create set name
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    // Create set name: first letter of first name + first letter of last name + set number (padded to at least 2 digits)
    const nameParts = driver.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    const formattedSetNumber = setNumber.toString().padStart(2, '0');
    const setName = `${firstName.charAt(0)}${lastName.charAt(0)}-${formattedSetNumber}`;
    
    const newTire = {
        id: Date.now().toString(),
        driverId,
        compound,
        condition,
        notes,
        setName: setName,
        setNumber: setNumber,
        dateAdded: new Date().toISOString(),
        laps: 0,
        mileage: 0,
        events: [], // Array to store last 3 events
        trashed: false, // Whether the tire set is trashed
        mounted: false // Whether the tire set is mounted on rims
    };
    
    tires.push(newTire);
    saveData();
    
    // Close modal first to prevent UI lag
    tireForm.reset();
    tireModal.style.display = 'none';
    
    // Update UI based on current view
    if (currentView === 'driver-detail' && selectedDriverId === driverId) {
        renderDriverTires(selectedDriverId);
    } else if (currentView === 'main') {
        renderTires();
    }
    
    updateStats();
}

// Navigate to driver detail view
function navigateToDriverDetail(driverId) {
    currentView = 'driver-detail';
    selectedDriverId = driverId;
    
    // Hide all tab content
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Create driver detail view
    const driverDetailView = document.createElement('section');
    driverDetailView.id = 'driver-detail-view';
    driverDetailView.className = 'tab-content active';
    
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    
    // Create back button
    const backBtnEl = document.createElement('button');
    backBtnEl.className = 'back-btn';
    backBtnEl.id = 'back-to-drivers-btn';
    backBtnEl.innerHTML = '<i class="fas fa-arrow-left"></i> Back';
    
    // Add back button to header
    const header = document.createElement('div');
    header.className = 'section-header';
    header.appendChild(backBtnEl);
    header.innerHTML += `<h2>${driver.name}'s Tires</h2>`;
    
    driverDetailView.appendChild(header);
    
    // Add tire management section
    const tireManagement = document.createElement('div');
    tireManagement.className = 'tire-management';
    tireManagement.innerHTML = `
        <button id="add-tire-for-driver-btn" class="floating-action-btn">
            <i class="fas fa-plus"></i>
        </button>
    `;
    driverDetailView.appendChild(tireManagement);
    
    // Add tire list
    const driverTireList = document.createElement('div');
    driverTireList.className = 'list-container';
    driverTireList.id = 'driver-tire-list';
    driverDetailView.appendChild(driverTireList);
    
    // Replace current content with driver detail view
    mainContent.innerHTML = '';
    mainContent.appendChild(driverDetailView);
    
    // Render driver's tires
    renderDriverTires(driverId);
    
    // Bind back button and add tire button
    document.getElementById('back-to-drivers-btn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigateToMainView();
    });
    document.getElementById('add-tire-for-driver-btn').addEventListener('click', () => {
        document.getElementById('tire-driver').value = driverId;
        tireModal.style.display = 'block';
    });
}

// Navigate back to main view
function navigateToMainView() {
    currentView = 'main';
    selectedDriverId = null;
    
    // Restore original content
    mainContent.innerHTML = '';
    tabContents.forEach(content => {
        mainContent.appendChild(content);
    });
    
    // Activate drivers tab
    setActiveTab('drivers');
}

// Delete driver with double confirmation and optional set deletion
function deleteDriver(driverId) {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    const confirmed = confirm(`Are you sure you want to delete driver "${driver.name}"?`);
    if (!confirmed) {
        // Explicitly abort and re-render to ensure no side effects
        renderDrivers();
        return;
    }

    const alsoDeleteSets = confirm(`BIG WARNING:\n\nAlso delete ALL tire sets related to "${driver.name}"?\nThis action cannot be undone.`);

    // Remove driver
    drivers = drivers.filter(d => d.id !== driverId);

    // Optionally remove tires
    if (alsoDeleteSets) {
        tires = tires.filter(t => t.driverId !== driverId);
    }

    saveData();

    // Return to main view and refresh lists
    navigateToMainView();
    renderDrivers();
    renderTires();
    updateDriverSelects();
    updateChampionshipsDatalist();
    updateStats();
}

// Function to toggle trashed status
function toggleTrashedStatus(tireId, isTrash) {
    const tire = tires.find(t => t.id === tireId);
    if (!tire) return;
    
    tire.trashed = isTrash;
    saveData();
    
    if (currentView === 'driver-detail') {
        renderDriverTires(selectedDriverId);
    } else {
        renderTires();
    }
}

// Function to toggle mounted status
function toggleMountedStatus(tireId, isMounted) {
    const tire = tires.find(t => t.id === tireId);
    if (!tire) return;
    
    tire.mounted = isMounted;
    saveData();
    
    if (currentView === 'driver-detail') {
        renderDriverTires(selectedDriverId);
    } else {
        renderTires();
    }
}

// Render driver's tires in detail view
function renderDriverTires(driverId) {
    const driverTireList = document.getElementById('driver-tire-list');
    if (!driverTireList) return;
    
    driverTireList.innerHTML = '';
    
    const driverTires = tires.filter(tire => tire.driverId === driverId);
    
    if (driverTires.length === 0) {
        driverTireList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-circle-notch"></i>
                <p>No tire sets found for this driver</p>
            </div>
        `;
        return;
    }
    
    driverTires.forEach(tire => {
        const tireCard = document.createElement('div');
        tireCard.className = `card tire-card ${tire.compound} ${tire.trashed ? 'trashed' : ''}`;
        
        // Calculate mileage color
        let mileageColor = '#4CAF50'; // Green by default
        if (tire.mileage > 90) {
            // Calculate gradient from yellow to red between 90-120km
            const percentage = Math.min(1, (tire.mileage - 90) / 30);
            const r = Math.floor(255);
            const g = Math.floor(204 * (1 - percentage));
            const b = 0;
            mileageColor = `rgb(${r}, ${g}, ${b})`;
        } else if (tire.mileage > 60) {
            mileageColor = '#FFCC00'; // Yellow
        }
        
        const dateAdded = new Date(tire.dateAdded).toLocaleDateString();
        
        // Format events
        let eventsHtml = '<p>No events recorded</p>';
        if (tire.events && tire.events.length > 0) {
            eventsHtml = '<ul class="events-list">';
            tire.events.slice(0, 3).forEach(event => {
                eventsHtml += `<li>${event.name} - ${event.date}</li>`;
            });
            eventsHtml += '</ul>';
        }
        
        tireCard.innerHTML = `
            <div class="card-header">
                <span class="card-title">${tire.setName}</span>
                <span class="card-subtitle">${getCompoundName(tire.compound)} - ${tire.condition === 'new' ? 'New' : 'Used'}</span>
            </div>
            <div class="card-detail">
                <span class="card-detail-label">Laps:</span>
                <span>${tire.laps}</span>
            </div>
            <div class="card-detail">
                <span class="card-detail-label">Mileage:</span>
                <span style="color: ${mileageColor}; font-weight: bold;">${tire.mileage} km</span>
            </div>
            <div class="card-detail">
                <span class="card-detail-label">Added:</span>
                <span>${dateAdded}</span>
            </div>
            <div class="card-detail">
                <span class="card-detail-label">Recent Events:</span>
                ${eventsHtml}
            </div>
            ${tire.notes ? `<div class="card-notes">${tire.notes}</div>` : ''}
            <div class="card-status">
                <label class="status-checkbox">
                    <input type="checkbox" ${tire.trashed ? 'checked' : ''} onchange="toggleTrashedStatus('${tire.id}', this.checked)">
                    Trashed
                </label>
                <label class="status-checkbox">
                    <input type="checkbox" ${tire.mounted ? 'checked' : ''} onchange="toggleMountedStatus('${tire.id}', this.checked)">
                    Mounted
                </label>
            </div>
            <div class="card-actions">
                <button class="btn-small" onclick="updateTireMileage('${tire.id}')">
                    <i class="fas fa-edit"></i> Update
                </button>
                <button class="btn-small" onclick="addTireEvent('${tire.id}')">
                    <i class="fas fa-plus"></i> Add Event
                </button>
                <button class="btn-small btn-delete" onclick="deleteTire('${tire.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        driverTireList.appendChild(tireCard);
    });
}

// Update tire mileage and laps
function updateTireMileage(tireId) {
    const tire = tires.find(t => t.id === tireId);
    if (!tire) return;
    
    const laps = prompt('Enter number of laps:', tire.laps);
    if (laps === null) return;
    
    const mileage = prompt('Enter mileage in km:', tire.mileage);
    if (mileage === null) return;
    
    tire.laps = parseInt(laps) || 0;
    tire.mileage = parseFloat(mileage) || 0;
    
    saveData();
    
    if (currentView === 'driver-detail') {
        renderDriverTires(selectedDriverId);
    } else {
        renderTires();
    }
}

// Add event to tire
function addTireEvent(tireId) {
    const tire = tires.find(t => t.id === tireId);
    if (!tire) return;
    
    const eventName = prompt('Enter event name:');
    if (!eventName) return;
    
    const eventDate = prompt('Enter event date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!eventDate) return;
    
    // Add event to the beginning of the array
    tire.events.unshift({
        name: eventName,
        date: eventDate
    });
    
    // Keep only the last 3 events
    if (tire.events.length > 3) {
        tire.events = tire.events.slice(0, 3);
    }
    
    saveData();
    
    if (currentView === 'driver-detail') {
        renderDriverTires(selectedDriverId);
    } else {
        renderTires();
    }
}

// Delete tire
function deleteTire(tireId) {
    if (confirm('Are you sure you want to delete this tire?')) {
        const tireIndex = tires.findIndex(t => t.id === tireId);
        if (tireIndex !== -1) {
            tires.splice(tireIndex, 1);
            saveData();
            
            if (currentView === 'driver-detail') {
                renderDriverTires(selectedDriverId);
            } else {
                renderTires();
            }
            
            updateStats();
        }
    }
}

// Render drivers list
function renderDrivers() {
    driverList.innerHTML = '';
    
    if (drivers.length === 0) {
        driverList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-slash"></i>
                <p>No drivers added yet</p>
            </div>
        `;
        return;
    }
    
    drivers.forEach(driver => {
        const driverTires = tires.filter(tire => tire.driverId === driver.id);
        
        const driverCard = document.createElement('div');
        driverCard.className = 'card driver-card';
        driverCard.innerHTML = `
            <div class="card-header">
                <span class="card-title">${driver.name}</span>
                <span class="card-subtitle">${driver.team || ''}</span>
                <button class="btn-small btn-delete driver-delete-btn" title="Delete Driver">
                    <i class="fas fa-user-minus"></i>
                </button>
            </div>
            ${driver.championship ? `
            <div class="card-detail">
                <span class="card-detail-label">Championship:</span>
                <span>${driver.championship}</span>
            </div>` : ''}
            <div class="card-detail">
                <span class="card-detail-label">Tire Sets:</span>
                <span>${driverTires.length}</span>
            </div>
        `;
        
        // Navigate to driver detail when clicking card
        driverCard.addEventListener('click', () => {
            navigateToDriverDetail(driver.id);
        });
        // Bind delete button (stop propagation so it won't navigate)
        const delBtn = driverCard.querySelector('.driver-delete-btn');
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            deleteDriver(driver.id);
        });
        
        driverList.appendChild(driverCard);
    });
}

// Render tires list
function renderTires() {
    tireList.innerHTML = '';
    
    // Apply filters
    const selectedDriverId = driverFilter.value;
    const selectedCompound = compoundFilter.value;
    const selectedMountedStatus = mountedFilter.value;
    
    let filteredTires = [...tires];
    
    if (selectedDriverId !== 'all') {
        filteredTires = filteredTires.filter(tire => tire.driverId === selectedDriverId);
    }
    
    if (selectedCompound !== 'all') {
        filteredTires = filteredTires.filter(tire => tire.compound === selectedCompound);
    }
    
    // Apply mounted filter
    if (selectedMountedStatus !== 'all') {
        const isMounted = selectedMountedStatus === 'mounted';
        filteredTires = filteredTires.filter(tire => tire.mounted === isMounted);
    }
    
    if (filteredTires.length === 0) {
        tireList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-circle-notch"></i>
                <p>No tire sets found</p>
            </div>
        `;
        return;
    }
    
    filteredTires.forEach(tire => {
        const driver = drivers.find(d => d.id === tire.driverId);
        const tireCard = document.createElement('div');
        tireCard.className = `card tire-card ${tire.compound} ${tire.trashed ? 'trashed' : ''}`;
        
        // Calculate mileage color
        let mileageColor = '#4CAF50'; // Green by default
        if (tire.mileage > 90) {
            // Calculate gradient from yellow to red between 90-120km
            const percentage = Math.min(1, (tire.mileage - 90) / 30);
            const r = Math.floor(255);
            const g = Math.floor(204 * (1 - percentage));
            const b = 0;
            mileageColor = `rgb(${r}, ${g}, ${b})`;
        } else if (tire.mileage > 60) {
            mileageColor = '#FFCC00'; // Yellow
        }
        
        const dateAdded = new Date(tire.dateAdded).toLocaleDateString();
        
        tireCard.innerHTML = `
            <div class="card-header">
                <span class="card-title">${tire.setName}</span>
                <span class="card-subtitle">${getCompoundName(tire.compound)} - ${tire.condition === 'new' ? 'New' : 'Used'}</span>
            </div>
            <div class="card-detail">
                <span class="card-detail-label">Driver:</span>
                <span>${driver ? driver.name : 'Unknown'}</span>
            </div>
            <div class="card-detail">
                <span class="card-detail-label">Laps:</span>
                <span>${tire.laps || 0}</span>
            </div>
            <div class="card-detail">
                <span class="card-detail-label">Mileage:</span>
                <span style="color: ${mileageColor}; font-weight: bold;">${tire.mileage || 0} km</span>
            </div>
            <div class="card-detail">
                <span class="card-detail-label">Added:</span>
                <span>${dateAdded}</span>
            </div>
            ${tire.notes ? `<div class="card-notes">${tire.notes}</div>` : ''}
            <div class="card-status">
                <label class="status-checkbox">
                    <input type="checkbox" ${tire.trashed ? 'checked' : ''} onchange="toggleTrashedStatus('${tire.id}', this.checked)">
                    Trashed
                </label>
                <label class="status-checkbox">
                    <input type="checkbox" ${tire.mounted ? 'checked' : ''} onchange="toggleMountedStatus('${tire.id}', this.checked)">
                    Mounted
                </label>
            </div>
            <div class="card-actions">
                <button class="btn-small btn-delete" onclick="deleteTire('${tire.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        tireList.appendChild(tireCard);
    });
}

// Update driver selects in forms and filters
function updateDriverSelects() {
    // Clear existing options
    driverFilter.innerHTML = '<option value="all">All Drivers</option>';
    tireDriverSelect.innerHTML = '';
    
    // Add driver options
    drivers.forEach(driver => {
        const filterOption = document.createElement('option');
        filterOption.value = driver.id;
        filterOption.textContent = driver.name;
        driverFilter.appendChild(filterOption);
        
        const selectOption = document.createElement('option');
        selectOption.value = driver.id;
        selectOption.textContent = driver.name;
        tireDriverSelect.appendChild(selectOption);
    });
}

// Populate championship suggestions from existing drivers
function updateChampionshipsDatalist() {
    const dataList = document.getElementById('championships-list');
    if (!dataList) return;

    // Collect unique non-empty championships
    const set = new Set();
    drivers.forEach(d => {
        if (d.championship && d.championship.trim().length > 0) {
            set.add(d.championship.trim());
        }
    });

    // Clear existing options
    dataList.innerHTML = '';

    // Add options
    Array.from(set).sort().forEach(ch => {
        const opt = document.createElement('option');
        opt.value = ch;
        dataList.appendChild(opt);
    });
}

// Update statistics
function updateStats() {
    // Update total tires count
    totalTiresCount.textContent = tires.length;
    
    // Update compound stats
    updateCompoundStats();
    
    // Update driver stats
    updateDriverStats();
}

// Update compound statistics
function updateCompoundStats() {
    compoundStats.innerHTML = '';
    
    const compounds = {
        soft: 0,
        medium: 0,
        hard: 0,
        wet: 0,
        intermediate: 0
    };
    
    // Count tires by compound
    tires.forEach(tire => {
        if (compounds.hasOwnProperty(tire.compound)) {
            compounds[tire.compound]++;
        }
    });
    
    // Find the maximum value for scaling
    const maxCount = Math.max(...Object.values(compounds), 1);
    
    // Create stat bars
    for (const [compound, count] of Object.entries(compounds)) {
        if (count > 0) {
            const percentage = (count / maxCount) * 100;
            
            const statBar = document.createElement('div');
            statBar.className = 'stat-bar';
            statBar.innerHTML = `
                <div class="stat-bar-label">
                    <span>${getCompoundName(compound)}</span>
                    <span>${count}</span>
                </div>
                <div class="stat-bar-track">
                    <div class="stat-bar-fill" style="width: ${percentage}%; background-color: ${getCompoundColor(compound)};"></div>
                </div>
            `;
            
            compoundStats.appendChild(statBar);
        }
    }
}

// Update driver statistics
function updateDriverStats() {
    driverStats.innerHTML = '';
    
    if (drivers.length === 0) {
        driverStats.innerHTML = '<p>No drivers added yet</p>';
        return;
    }
    
    const driverTireCounts = {};
    
    // Count tires by driver
    drivers.forEach(driver => {
        driverTireCounts[driver.id] = tires.filter(tire => tire.driverId === driver.id).length;
    });
    
    // Find the maximum value for scaling
    const maxCount = Math.max(...Object.values(driverTireCounts), 1);
    
    // Create stat bars
    for (const [driverId, count] of Object.entries(driverTireCounts)) {
        const driver = drivers.find(d => d.id === driverId);
        if (driver) {
            const percentage = (count / maxCount) * 100;
            
            const statBar = document.createElement('div');
            statBar.className = 'stat-bar';
            statBar.innerHTML = `
                <div class="stat-bar-label">
                    <span>${driver.name}</span>
                    <span>${count}</span>
                </div>
                <div class="stat-bar-track">
                    <div class="stat-bar-fill" style="width: ${percentage}%;"></div>
                </div>
            `;
            
            driverStats.appendChild(statBar);
        }
    }
}

// Helper function to get compound display name
function getCompoundName(compound) {
    const names = {
        slicks: 'Slicks',
        wet: 'Wets'
    };
    
    return names[compound] || compound;
}

// Helper function to get compound color
function getCompoundColor(compound) {
    const colors = {
        slicks: '#ff4d4d',
        wet: '#3399ff'
    };
    
    return colors[compound] || '#e63946';
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('tireTrackerDrivers', JSON.stringify(drivers));
    localStorage.setItem('tireTrackerTires', JSON.stringify(tires));
}

// Load data from localStorage
function loadData() {
    const savedDrivers = localStorage.getItem('tireTrackerDrivers');
    const savedTires = localStorage.getItem('tireTrackerTires');
    
    if (savedDrivers) {
        drivers = JSON.parse(savedDrivers);
    }
    
    if (savedTires) {
        tires = JSON.parse(savedTires);
    }
}

// Make functions available globally
window.updateTireMileage = updateTireMileage;
window.addTireEvent = addTireEvent;
window.deleteTire = deleteTire;
window.deleteDriver = deleteDriver;
window.toggleTrashedStatus = toggleTrashedStatus;
window.toggleMountedStatus = toggleMountedStatus;

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);