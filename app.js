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
const kpiAvailableSetsEl = document.getElementById('kpi-available-sets');
const kpiSetsPerDriverEl = document.getElementById('kpi-sets-per-driver');
const kpiMountedSetsEl = document.getElementById('kpi-mounted-sets');
const mainContent = document.querySelector('main');
const backButton = document.createElement('button');
// Update Mileage modal elements
const updateMileageModal = document.getElementById('update-mileage-modal');
const updateMileageForm = document.getElementById('update-mileage-form');
const updateTrackSelect = document.getElementById('update-track');
const updateLapsInput = document.getElementById('update-laps');
const updateSessionInput = document.getElementById('update-session');
const updateDistanceEl = document.getElementById('update-distance-display');
const updateTotalMileageEl = document.getElementById('update-total-display');
const updateTotalLapsEl = document.getElementById('update-total-laps-display');
let currentUpdatingTireId = null;

// European racing tracks (km)
const EUROPE_TRACKS = [
    { id: 'monza', name: 'Monza (ITA)', lengthKm: 5.793 },
    { id: 'imola', name: 'Imola (ITA)', lengthKm: 4.909 },
    { id: 'mugello', name: 'Mugello (ITA)', lengthKm: 5.245 },
    { id: 'misano', name: 'Misano (ITA)', lengthKm: 4.226 },
    { id: 'vallelunga', name: 'Vallelunga (ITA)', lengthKm: 4.085 },
    { id: 'spa', name: 'Spa-Francorchamps (BEL)', lengthKm: 7.004 },
    { id: 'zolder', name: 'Zolder (BEL)', lengthKm: 4.011 },
    { id: 'silverstone', name: 'Silverstone (UK)', lengthKm: 5.891 },
    { id: 'brands', name: 'Brands Hatch (UK)', lengthKm: 3.916 },
    { id: 'donington', name: 'Donington Park (UK)', lengthKm: 4.023 },
    { id: 'nurb_gp', name: 'Nürburgring GP (DEU)', lengthKm: 5.148 },
    { id: 'hockenheim', name: 'Hockenheimring (DEU)', lengthKm: 4.574 },
    { id: 'oschersleben', name: 'Oschersleben (DEU)', lengthKm: 3.696 },
    { id: 'redbull', name: 'Red Bull Ring (AUT)', lengthKm: 4.318 },
    { id: 'hungaroring', name: 'Hungaroring (HUN)', lengthKm: 4.381 },
    { id: 'slovakiaring', name: 'Slovakiaring (SVK)', lengthKm: 5.922 },
    { id: 'zandvoort', name: 'Zandvoort (NLD)', lengthKm: 4.259 },
    { id: 'assen', name: 'Assen (NLD)', lengthKm: 4.542 },
    { id: 'barcelona', name: 'Barcelona-Catalunya (ESP)', lengthKm: 4.657 },
    { id: 'jerez', name: 'Jerez (ESP)', lengthKm: 4.428 },
    { id: 'valencia', name: 'Valencia Ricardo Tormo (ESP)', lengthKm: 4.005 },
    { id: 'portimao', name: 'Portimão (PRT)', lengthKm: 4.653 },
    { id: 'paulricard', name: 'Paul Ricard (FRA)', lengthKm: 5.842 },
    { id: 'magnycours', name: 'Magny-Cours (FRA)', lengthKm: 4.411 },
    { id: 'monaco', name: 'Monaco (MCO)', lengthKm: 3.337 },
    { id: 'brno', name: 'Brno (CZE)', lengthKm: 5.403 },
    { id: 'most', name: 'Autodrom Most (CZE)', lengthKm: 4.212 }
];
// Auth & Audit elements
const loginBtn = document.getElementById('login-btn');
const loginBtnLabel = document.getElementById('login-btn-label');
const loginModalEl = document.getElementById('login-modal');
const registerModalEl = document.getElementById('register-modal');
const loginFormEl = document.getElementById('login-form');
const registerFormEl = document.getElementById('register-form');
const openRegisterLink = document.getElementById('open-register');
const auditLogContainer = document.getElementById('audit-log');
const activityListEl = document.getElementById('activity-list');
const openActivityLogBtn = document.getElementById('open-activity-log-btn');
// Auth banner elements
const authBannerEl = document.getElementById('auth-banner');
const authBannerTextEl = document.getElementById('auth-banner-text');
const authBannerCloseBtn = document.getElementById('auth-banner-close');
let auth = null; // { user, role }

// Initialize the app
function initApp() {
    loadData();
    setupEventListeners();
    loadAuth();
    updateAuthUI();
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

    // Open modals (guarded)
    addDriverBtn.addEventListener('click', () => {
        if (!requireLoggedIn()) { showAuthBanner('You must log in before performing any action.'); return; }
        if (!requireAdmin()) { alert('Only admin can modify'); return; }
        driverModal.style.display = 'grid';
    });
    addTireBtn.addEventListener('click', () => {
        if (!requireLoggedIn()) { showAuthBanner('You must log in before performing any action.'); return; }
        if (!requireAdmin()) { alert('Only admin can modify'); return; }
        if (drivers.length === 0) {
            alert('Please add a driver first');
            return;
        }
        tireModal.style.display = 'grid';
    });

    // Auth: login/logout toggle and forms
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (auth && auth.user) {
                logout();
                updateAuthUI();
            } else if (loginModalEl) {
                loginModalEl.style.display = 'block';
            }
        });
    }
    if (openRegisterLink) {
        openRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginModalEl) loginModalEl.style.display = 'none';
            if (registerModalEl) registerModalEl.style.display = 'block';
        });
    }
    if (loginFormEl) loginFormEl.addEventListener('submit', handleLoginSubmit);
    if (registerFormEl) registerFormEl.addEventListener('submit', handleRegisterSubmit);

    // Activity Log open
    if (openActivityLogBtn) {
        openActivityLogBtn.addEventListener('click', () => {
            setActiveTab('activity');
            renderFullAuditLog();
        });
    }

    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            driverModal.style.display = 'none';
            tireModal.style.display = 'none';
            if (loginModalEl) loginModalEl.style.display = 'none';
            if (registerModalEl) registerModalEl.style.display = 'none';
            if (updateMileageModal) updateMileageModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === driverModal) driverModal.style.display = 'none';
        if (e.target === tireModal) tireModal.style.display = 'none';
        if (e.target === loginModalEl) loginModalEl.style.display = 'none';
        if (e.target === registerModalEl) registerModalEl.style.display = 'none';
        if (e.target === updateMileageModal) updateMileageModal.style.display = 'none';
    });

    // Form submissions
    driverForm.addEventListener('submit', handleDriverSubmit);
    tireForm.addEventListener('submit', handleTireSubmit);

    // Filters
    driverFilter.addEventListener('change', renderTires);
    compoundFilter.addEventListener('change', renderTires);
    mountedFilter.addEventListener('change', renderTires);

    // Update mileage modal interactions
    if (updateMileageForm) {
        updateMileageForm.addEventListener('submit', handleUpdateMileageSubmit);
    }
    if (updateTrackSelect) {
        updateTrackSelect.addEventListener('change', recomputeUpdateMileagePreview);
    }
    if (updateLapsInput) {
        updateLapsInput.addEventListener('input', recomputeUpdateMileagePreview);
    }
    if (updateSessionInput) {
        updateSessionInput.addEventListener('input', recomputeUpdateMileagePreview);
    }
    // Manual override inputs removed; recomputation reacts to track, laps, and session name only
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
    // Render activity when switching to activity tab
    if (tabId === 'activity') {
        renderFullAuditLog();
    }
}

// Handle driver form submission
function handleDriverSubmit(e) {
    e.preventDefault();
    if (!guardModify()) return;
    
    const name = document.getElementById('driver-name').value;
    const team = document.getElementById('driver-team').value;
    const championship = document.getElementById('driver-championship') ? document.getElementById('driver-championship').value : '';
    const photoInput = document.getElementById('driver-photo');
    const photoFile = photoInput && photoInput.files && photoInput.files[0] ? photoInput.files[0] : null;
    
    const finalizeAdd = (photoDataUrl) => {
        const newDriver = {
            id: Date.now().toString(),
            name,
            team,
            championship,
            photo: photoDataUrl || null
        };
        drivers.push(newDriver);
        saveData();
        logAction('add_driver', { driverId: newDriver.id, name });
        renderDrivers();
        updateDriverSelects();
        updateChampionshipsDatalist();
        driverForm.reset();
        driverModal.style.display = 'none';
    };

    if (photoFile) {
        const reader = new FileReader();
        reader.onload = () => finalizeAdd(reader.result);
        reader.onerror = () => finalizeAdd(null);
        reader.readAsDataURL(photoFile);
    } else {
        finalizeAdd(null);
    }
}

// Handle tire form submission
function handleTireSubmit(e) {
    e.preventDefault();
    if (!guardModify()) return;
    
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
    logAction('add_tire', { tireId: newTire.id, driverId, setName });
    
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

    // Driver profile header with avatar and upload control
    const initials = (driver.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
    const profile = document.createElement('div');
    profile.className = 'driver-profile';
    profile.innerHTML = `
        <div class="driver-profile-left">
            ${driver.photo ? `<img class="driver-avatar" src="${driver.photo}" alt="${driver.name}">` : `<div class="driver-avatar placeholder">${initials}</div>`}
            <div>
                <div class="card-title">${driver.name}</div>
                ${driver.team ? `<div class="card-subtitle">${driver.team}</div>` : ''}
            </div>
        </div>
        <div class="driver-profile-actions">
            <button id="upload-driver-photo-btn" class="btn-small"><i class="fas fa-camera"></i> Upload Photo</button>
            <input id="upload-driver-photo-input" type="file" accept="image/*" style="display:none;" />
        </div>
    `;
    driverDetailView.appendChild(profile);
    
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
        tireModal.style.display = 'grid';
    });

    // Bind upload photo button
    const uploadBtn = document.getElementById('upload-driver-photo-btn');
    const uploadInput = document.getElementById('upload-driver-photo-input');
    if (uploadBtn && uploadInput) {
        uploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!guardModify()) return;
            uploadInput.click();
        });
        uploadInput.addEventListener('change', () => {
            if (!guardModify()) return;
            const file = uploadInput.files && uploadInput.files[0] ? uploadInput.files[0] : null;
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const d = drivers.find(dd => dd.id === driverId);
                if (!d) return;
                d.photo = reader.result;
                saveData();
                logAction('update_driver_photo', { driverId: driverId });
                // Re-render driver detail to reflect new avatar
                navigateToDriverDetail(driverId);
                // Also refresh driver list avatars
                renderDrivers();
            };
            reader.onerror = () => {
                alert('Failed to load image. Please try another file.');
            };
            reader.readAsDataURL(file);
        });
    }
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
    if (!guardModify()) return;
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
    logAction('delete_driver', { driverId, alsoDeleteSets });

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
    if (!guardModify()) {
        // Re-render to revert checkbox visual change and show banner
        if (currentView === 'driver-detail') {
            renderDriverTires(selectedDriverId);
        } else {
            renderTires();
        }
        return;
    }
    const tire = tires.find(t => t.id === tireId);
    if (!tire) return;
    
    tire.trashed = isTrash;
    saveData();
    logAction('toggle_trash', { tireId, trashed: tire.trashed });
    
    if (currentView === 'driver-detail') {
        renderDriverTires(selectedDriverId);
    } else {
        renderTires();
    }
}

// Function to toggle mounted status
function toggleMountedStatus(tireId, isMounted) {
    if (!guardModify()) {
        // Re-render to revert checkbox visual change and show banner
        if (currentView === 'driver-detail') {
            renderDriverTires(selectedDriverId);
        } else {
            renderTires();
        }
        return;
    }
    const tire = tires.find(t => t.id === tireId);
    if (!tire) return;
    
    tire.mounted = isMounted;
    saveData();
    logAction('toggle_mounted', { tireId, mounted: tire.mounted });
    
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
    // Keep controls enabled; guardModify will block and show login banner
    
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
        // Build recent sessions snippet for inventory cards
        let sessionsHtml = '<div class="card-detail"><span class="card-detail-label">Recent Sessions:</span><span>No sessions recorded</span></div>';
        if (tire.sessions && tire.sessions.length > 0) {
            sessionsHtml = '<div class="card-detail"><span class="card-detail-label">Recent Sessions:</span><ul class="sessions-list">';
            tire.sessions.slice(0, 5).forEach(sess => {
                const label = `${sess.trackName || 'Session'}${sess.sessionName ? ' • ' + sess.sessionName : ''}`;
                sessionsHtml += `<li>${label} — ${sess.distanceKm} km, ${sess.laps || 0} laps <button class="btn-icon btn-delete-session" title="Delete" onclick="deleteTireSession('${tire.id}','${sess.id}')"><i class="fas fa-times"></i></button></li>`;
            });
            sessionsHtml += '</ul></div>';
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
                <span class="card-detail-label">Recent Sessions:</span>
                ${sessionsHtml}
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
    if (!guardModify()) return;
    const tire = tires.find(t => t.id === tireId);
    if (!tire) return;
    currentUpdatingTireId = tireId;
    populateTrackSelect();
    // Reset inputs
    if (updateTrackSelect) updateTrackSelect.value = updateTrackSelect.options[0]?.value || '';
    if (updateLapsInput) updateLapsInput.value = '';
    if (updateSessionInput) updateSessionInput.value = '';
    // Show modal and compute initial preview
    if (updateMileageModal) {
        updateMileageModal.style.display = 'grid'; // center using CSS grid
        recomputeUpdateMileagePreview();
    }
}

function populateTrackSelect() {
    if (!updateTrackSelect) return;
    // Always rebuild the list with a placeholder, then tracks
    updateTrackSelect.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = 'Select a track';
    updateTrackSelect.appendChild(ph);
    EUROPE_TRACKS.forEach(track => {
        const opt = document.createElement('option');
        opt.value = track.id;
        opt.textContent = `${track.name} — ${track.lengthKm.toFixed(3)} km`;
        updateTrackSelect.appendChild(opt);
    });
}

function recomputeUpdateMileagePreview() {
    if (!currentUpdatingTireId) return;
    const tire = tires.find(t => t.id === currentUpdatingTireId);
    if (!tire) return;
    const trackId = updateTrackSelect ? updateTrackSelect.value : '';
    const laps = updateLapsInput ? parseInt(updateLapsInput.value, 10) || 0 : 0;
    const track = EUROPE_TRACKS.find(t => t.id === trackId);
    const addedDistanceRaw = track ? track.lengthKm * laps : 0;
    const addedDistance = Math.round(addedDistanceRaw);
    const newTotalMileage = Math.round((tire.mileage || 0) + addedDistance);
    const newTotalLaps = (tire.laps || 0) + laps;
    if (updateDistanceEl) updateDistanceEl.textContent = `${addedDistance} km`;
    if (updateTotalMileageEl) updateTotalMileageEl.textContent = `${newTotalMileage} km`;
    if (updateTotalLapsEl) updateTotalLapsEl.textContent = `${newTotalLaps}`;
}

function handleUpdateMileageSubmit(e) {
    e.preventDefault();
    if (!currentUpdatingTireId) return;
    const tire = tires.find(t => t.id === currentUpdatingTireId);
    if (!tire) return;
    const trackId = updateTrackSelect ? updateTrackSelect.value : '';
    const laps = updateLapsInput ? parseInt(updateLapsInput.value, 10) || 0 : 0;
    const sessionName = updateSessionInput ? updateSessionInput.value.trim() : '';
    const track = EUROPE_TRACKS.find(t => t.id === trackId);
    // Validate inputs: require a valid track and positive laps
    if (!track) { alert('Please select a track'); return; }
    if (laps <= 0) { alert('Enter a valid number of laps'); return; }

    const addedDistance = Math.round(track.lengthKm * laps);
    // Apply laps and mileage updates (rounded integers)
    tire.laps = (tire.laps || 0) + laps;
    tire.mileage = Math.round((tire.mileage || 0) + addedDistance);
    // Record session ledger entry
    if (!tire.sessions) tire.sessions = [];
    const sessionEntry = {
        id: `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,
        date: new Date().toISOString(),
        trackId: track ? track.id : null,
        trackName: track ? track.name : 'Unknown',
        sessionName,
        laps,
        distanceKm: addedDistance
    };
    tire.sessions.unshift(sessionEntry);
    saveData();
    logAction('update_mileage', {
        tireId: tire.id,
        track: track ? track.name : null,
        laps,
        session: sessionName,
        addedDistanceKm: addedDistance,
        newMileageKm: tire.mileage,
        newLaps: tire.laps
    });
    // Re-render current view
    if (currentView === 'driver-detail') {
        renderDriverTires(selectedDriverId);
    } else {
        renderTires();
    }
    // Close modal and reset
    currentUpdatingTireId = null;
    if (updateMileageModal) updateMileageModal.style.display = 'none';
    if (updateMileageForm) updateMileageForm.reset();
}

// Delete a previously recorded session mileage
function deleteTireSession(tireId, sessionId) {
    if (!guardModify()) return;
    const tire = tires.find(t => t.id === tireId);
    if (!tire || !tire.sessions) return;
    const idx = tire.sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return;
    const s = tire.sessions[idx];
    // Subtract session contribution from totals
    tire.mileage = Math.max(0, (tire.mileage || 0) - (s.distanceKm || 0));
    tire.laps = Math.max(0, (tire.laps || 0) - (s.laps || 0));
    // Remove session entry
    tire.sessions.splice(idx, 1);
    saveData();
    logAction('delete_session', { tireId, sessionId, distanceKm: s.distanceKm, laps: s.laps });
    // Re-render current view
    if (currentView === 'driver-detail') {
        renderDriverTires(selectedDriverId);
    } else {
        renderTires();
    }
}

// Add event to tire
function addTireEvent(tireId) {
    if (!guardModify()) return;
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
    logAction('add_event', { tireId, events: tire.events });
    
    if (currentView === 'driver-detail') {
        renderDriverTires(selectedDriverId);
    } else {
        renderTires();
    }
}

// Delete tire
function deleteTire(tireId) {
    if (!guardModify()) return;
    if (confirm('Are you sure you want to delete this tire?')) {
        const tireIndex = tires.findIndex(t => t.id === tireId);
        if (tireIndex !== -1) {
            tires.splice(tireIndex, 1);
            saveData();
            logAction('delete_tire', { tireId });
            
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
    
    // Keep controls enabled; guardModify will block and show login banner
    drivers.forEach(driver => {
        const driverTires = tires.filter(tire => tire.driverId === driver.id);
        
        const driverCard = document.createElement('div');
        driverCard.className = 'card driver-card';
        const avatarHtml = driver.photo
            ? `<img class="driver-avatar" src="${driver.photo}" alt="${driver.name}">`
            : `<div class="driver-avatar placeholder">${(driver.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</div>`;
        driverCard.innerHTML = `
            <div class="card-header">
                <div class="driver-header-left">
                    ${avatarHtml}
                    <div>
                        <span class="card-title">${driver.name}</span>
                        <span class="card-subtitle">${driver.team || ''}</span>
                    </div>
                </div>
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
    
    // Keep controls enabled; guardModify will block and show login banner
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
        
        // Build recent sessions block for inventory cards
        let sessionsHtml = '';
        if (tire.sessions && tire.sessions.length > 0) {
            let list = '<ul class="sessions-list">';
            tire.sessions.slice(0, 5).forEach(sess => {
                const label = `${sess.trackName || 'Session'}${sess.sessionName ? ' • ' + sess.sessionName : ''}`;
                const distKm = Math.round(sess.distanceKm || 0);
                const laps = sess.laps || 0;
                list += `<li>${label} — ${distKm} km, ${laps} laps <button class="btn-icon btn-delete-session" title="Delete" onclick="deleteTireSession('${tire.id}','${sess.id}')"><i class="fas fa-times"></i></button></li>`;
            });
            list += '</ul>';
            sessionsHtml = `
            <div class="card-detail">
                <span class="card-detail-label">Recent Sessions:</span>
                <div style="font-weight: normal;">${list}</div>
            </div>`;
        } else {
            sessionsHtml = `
            <div class="card-detail">
                <span class="card-detail-label">Recent Sessions:</span>
                <span>No sessions recorded</span>
            </div>`;
        }
        
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
            ${sessionsHtml}
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
    // Update total tires count (guarded if card removed)
    if (totalTiresCount) totalTiresCount.textContent = tires.length;
    
    // Update KPI stats
    updateKpiStats();

    // Update compound stats
    updateCompoundStats();
    
    // Update driver stats
    updateDriverStats();
    // Admin-only audit summary visibility in Stats
    if (auditLogContainer) {
        if (requireAdmin()) {
            renderAuditSummary();
        } else {
            auditLogContainer.innerHTML = '<p class="muted">Activity details are visible to admins only.</p>';
        }
    }
}

// ===== Auth & Audit =====
function loadAuth() {
    const storedAuth = localStorage.getItem('auth');
    auth = storedAuth ? JSON.parse(storedAuth) : null;
    const usersStr = localStorage.getItem('users');
    if (!usersStr) {
        const defaultUsers = [{ username: 'admin', password: 'admin', role: 'admin' }];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

function updateAuthUI() {
    if (!loginBtnLabel) return;
    if (auth && auth.user) {
        loginBtnLabel.textContent = `Logout (${auth.user})`;
    } else {
        loginBtnLabel.textContent = 'Login';
    }
    // Admin-only Activity tab visibility
    const activityTabBtn = document.querySelector('.tab-btn[data-tab="activity"]');
    const activityTabContent = document.getElementById('activity-tab');
    const isAdmin = requireAdmin();
    if (activityTabBtn) activityTabBtn.style.display = isAdmin ? '' : 'none';
    if (activityTabContent) activityTabContent.style.display = isAdmin ? '' : 'none';
    if (!isAdmin) {
        const activeBtn = document.querySelector('.tab-btn.active');
        if (activeBtn && activeBtn.getAttribute('data-tab') === 'activity') {
            setActiveTab('stats');
        }
    }
    // Hide Stats summary button for non-admins
    if (openActivityLogBtn) openActivityLogBtn.style.display = isAdmin ? '' : 'none';
    // Keep add buttons enabled; clicks are guarded to show login banner
    // Re-render to apply disabled states consistently
    renderDrivers();
    renderTires();
    updateStats();
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const found = users.find(u => u.username === username && u.password === password);
    if (!found) { alert('Invalid credentials'); return; }
    auth = { user: found.username, role: found.role };
    localStorage.setItem('auth', JSON.stringify(auth));
    updateAuthUI();
    if (loginModalEl) loginModalEl.style.display = 'none';
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    if (!username || !password) { alert('Username and password required'); return; }
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.username === username)) { alert('Username already exists'); return; }
    users.push({ username, password, role });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Account created. You can login now.');
    if (registerModalEl) registerModalEl.style.display = 'none';
    if (loginModalEl) loginModalEl.style.display = 'block';
}

function logout() {
    auth = null;
    localStorage.removeItem('auth');
}

// Banner + highlight helpers
function showAuthBanner(message) {
    if (authBannerTextEl) authBannerTextEl.textContent = message || 'You must log in before performing any action.';
    if (authBannerEl) {
        authBannerEl.classList.remove('hidden');
    }
    if (loginBtn) {
        loginBtn.classList.add('highlight-login');
        setTimeout(() => loginBtn.classList.remove('highlight-login'), 1400);
    }
    // Auto-hide after a delay
    if (authBannerEl) {
        clearTimeout(authBannerEl._hideTimer);
        authBannerEl._hideTimer = setTimeout(() => hideAuthBanner(), 5000);
    }
}

function hideAuthBanner() {
    if (authBannerEl) authBannerEl.classList.add('hidden');
}

function requireLoggedIn() {
    return !!(auth && auth.user);
}

function requireAdmin() {
    return auth && auth.role === 'admin';
}

function guardModify() {
    if (!requireLoggedIn()) { showAuthBanner('You must log in before performing any action.'); return false; }
    if (!requireAdmin()) { alert('Only admin can modify'); return false; }
    return true;
}

function logAction(action, details) {
    const entry = { action, details, user: auth && auth.user ? auth.user : 'guest', at: new Date().toISOString() };
    const log = JSON.parse(localStorage.getItem('auditLog') || '[]');
    log.unshift(entry);
    localStorage.setItem('auditLog', JSON.stringify(log));
}

function renderAuditSummary() {
    const log = JSON.parse(localStorage.getItem('auditLog') || '[]');
    if (!auditLogContainer) return;
    if (log.length === 0) { auditLogContainer.innerHTML = '<p class="muted">No activity yet.</p>'; return; }
    const items = log.slice(0, 5).map(entry => {
        const time = new Date(entry.at).toLocaleString();
        const detailsStr = typeof entry.details === 'object' ? JSON.stringify(entry.details) : String(entry.details);
        return `<div class="audit-item"><strong>${entry.action}</strong> by <em>${entry.user}</em> at ${time}<br><small>${detailsStr}</small></div>`;
    }).join('');
    auditLogContainer.innerHTML = items;
}

function renderFullAuditLog() {
    const log = JSON.parse(localStorage.getItem('auditLog') || '[]');
    if (!activityListEl) return;
    if (log.length === 0) { activityListEl.innerHTML = '<p class="muted">No activity recorded.</p>'; return; }
    const items = log.slice(0, 100).map(entry => {
        const time = new Date(entry.at).toLocaleString();
        const detailsStr = typeof entry.details === 'object' ? JSON.stringify(entry.details) : String(entry.details);
        return `<div class="audit-item"><strong>${entry.action}</strong> by <em>${entry.user}</em> at ${time}<br><small>${detailsStr}</small></div>`;
    }).join('');
    activityListEl.innerHTML = items;
}

// Update compound statistics
function updateCompoundStats() {
    compoundStats.innerHTML = '';

    // Count totals for supported compounds
    const totals = {
        slicks: tires.filter(t => t.compound === 'slicks').length,
        wet: tires.filter(t => t.compound === 'wet').length,
    };

    const maxCount = Math.max(totals.slicks, totals.wet, 1);

    ['slicks', 'wet'].forEach(compound => {
        const count = totals[compound];
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
    });
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
    // Auth banner dismiss
    if (authBannerCloseBtn) {
        authBannerCloseBtn.addEventListener('click', hideAuthBanner);
    }
// Update KPI statistics
function updateKpiStats() {
    // Available sets: non-trashed tire records
    const availableCount = tires.filter(t => !t.trashed).length;
    if (kpiAvailableSetsEl) kpiAvailableSetsEl.textContent = String(availableCount);

    // Mounted sets: mounted and not trashed
    const mountedCount = tires.filter(t => t.mounted && !t.trashed).length;
    if (kpiMountedSetsEl) kpiMountedSetsEl.textContent = String(mountedCount);

    // Sets per driver (non-trashed)
    if (kpiSetsPerDriverEl) {
        kpiSetsPerDriverEl.innerHTML = '';
        const data = drivers.map(d => {
            const count = tires.filter(t => t.driverId === d.id && !t.trashed).length;
            return { name: d.name, count };
        }).filter(item => item.count > 0);

        if (data.length === 0) {
            kpiSetsPerDriverEl.innerHTML = '<p class="muted">No sets assigned yet</p>';
            return;
        }

        const list = document.createElement('div');
        list.className = 'stat-details';
        data.forEach(({ name, count }) => {
            const row = document.createElement('div');
            row.className = 'stat-bar-label';
            row.innerHTML = `<span>${name}</span><span>${count}</span>`;
            list.appendChild(row);
        });
        kpiSetsPerDriverEl.appendChild(list);
    }
}