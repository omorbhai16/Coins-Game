
// =========================================================
//         Safety Alert Auto Show & Hide
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const safetyAlert = document.getElementById('coin-safety-alert');
    
    if (safetyAlert) {
        setTimeout(() => {
            safetyAlert.classList.add('show-alert');
        }, 500);

        setTimeout(() => {
            safetyAlert.classList.remove('show-alert');
        }, 15000);
    }
});






// ===================================
//             scrol logic
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflowY = 'auto';



    const overlayContent = document.querySelector('.overlay-content');
    const overlayBody = document.getElementById('overlay-body');

    if (overlayContent) {

        overlayContent.addEventListener('wheel', (e) => {
            overlayContent.scrollTop += e.deltaY;
        }, { passive: true });



        let touchStart = 0;
        overlayContent.addEventListener('touchstart', (e) => {
            touchStart = e.touches[0].pageY;
        }, { passive: true });

        overlayContent.addEventListener('touchmove', (e) => {
            let touchMove = e.touches[0].pageY;
            overlayContent.scrollTop += (touchStart - touchMove);
            touchStart = touchMove;
        }, { passive: true });
    }
});





// ==================================================
//              SETTINGS SECTION
// ==================================================
    const settingsBtn = document.getElementById('settingsBtn');
    const myDropdown = document.getElementById('myDropdown');


    settingsBtn.addEventListener('click', function(e) {
        e.stopPropagation(); 
        myDropdown.classList.toggle('show-dropdown');
    });

    window.addEventListener('click', function(e) {
        if (!settingsBtn.contains(e.target) && !myDropdown.contains(e.target)) {
            if (myDropdown.classList.contains('show-dropdown')) {
                myDropdown.classList.remove('show-dropdown');
            }
        }
    });


// ================================================
//         LEVEL AND ERAN SECTION
// ================================================
const LevelGameData = {
    totalCoins: 0,
    currentLevel: 1,
    maxLevel: 10,
    withdrawThreshold: 10000000 
};


let isClickCooldown = false;
const clickInterval = 300;

window.handleCoinClick = function(event) {
    if (isClickCooldown) return; 

    if (typeof LevelGameData !== 'undefined') {
        const earned = LevelGameData.currentLevel * 10;
        LevelGameData.totalCoins += earned;
        
        updateGameUI();
        saveToFirebase();
    }

    const coinBtn = document.getElementById('mainCoinBtn');
    if (coinBtn) {
        const rect = coinBtn.getBoundingClientRect();
        
        for (let i = 0; i < 10; i++) { 
            const burstCoin = document.createElement('div');
            burstCoin.className = 'burst-coin animate-burst';
            
            burstCoin.style.left = (rect.left + rect.width / 2) + 'px';
            burstCoin.style.top = (rect.top + rect.height / 2) + 'px';
            
            const x = (Math.random() - 0.5) * 500; 
            const y = - (Math.random() * 250 + 150); 
            
            burstCoin.style.setProperty('--x', `${x}px`);
            burstCoin.style.setProperty('--y', `${y}px`);
            
            document.body.appendChild(burstCoin);
            setTimeout(() => burstCoin.remove(), 4000); 
        }
    }

    isClickCooldown = true;
    setTimeout(() => { isClickCooldown = false; }, clickInterval);
};

window.openFeature = async function(feature) {
    const overlay = document.getElementById('feature-overlay');
    const body = document.getElementById('overlay-body');
    if (!overlay || !body) return;

    overlay.style.display = 'flex';
    body.innerHTML = "লোড হচ্ছে...";

    switch(feature) {
        case 'level':
            const nextLvl = LevelGameData.currentLevel + 1;
            const cost = (nextLvl === 2) ? 100000 : (nextLvl === 3 ? 300000 : (nextLvl - 1) * 200000);
            body.innerHTML = `
                <div class="feature-card">
                    <h3>Level Up</h3>
                    <p>Current: ${LevelGameData.currentLevel} | Cost: ${LevelGameData.currentLevel >= 10 ? 'MAX' : cost.toLocaleString()}</p>
                    <button class="btn-action" onclick="upgradeLevel()">Upgrade Now</button>
                </div>`;
            break;

        case 'tasks':
            body.innerHTML = `<h2>Tasks</h2>
                <div class="feature-card"><p>Daily Reward</p><button class="btn-action" onclick="claimDailyReward()">Claim</button></div>
                <div class="feature-card"><p>Watch Video Ad</p><button class="btn-action" onclick="watchVideoAd()">Watch</button></div>`;
            break;

        case 'withdraw':
            body.innerHTML = `<h2>Withdraw</h2>
                <div class="feature-card">
                    <input type="number" id="withdrawPoints" class="withdraw-input" placeholder="Min 10,000 Points">
                    <input type="text" id="withdrawNumber" class="withdraw-input" placeholder="Number">
                    <button class="btn-action" onclick="processWithdraw()">Confirm</button>
                </div>`;
            break;
            
        case 'profile':
            const user = window.fbAuth?.currentUser;
            if (user) {
                body.innerHTML = `<h3>Profile</h3><p>Level: ${LevelGameData.currentLevel}</p>`;
            }
            break;
    }
};


window.updateGameUI = function() {
    const coinDisplay = document.getElementById('balanceDisplay');
    if (coinDisplay) coinDisplay.innerText = LevelGameData.totalCoins.toLocaleString();
};

window.closeOverlay = function() {
    document.getElementById('feature-overlay').style.display = 'none';
};

function saveToFirebase() {
    const user = window.fbAuth?.currentUser;

    if (!user) return;

    window.dbUpdate(
        window.dbRef(window.fbDatabase, 'users/' + user.uid),
        {
            coins: LevelGameData.totalCoins,
            level: LevelGameData.currentLevel
        }
    ).catch((error) => {
        console.error("Save Error:", error);
    });
}

window.loadUserData = function(coins, level) {
    LevelGameData.totalCoins = coins || 0;
    LevelGameData.currentLevel = level || 1;
    updateGameUI();
};

document.addEventListener('DOMContentLoaded', () => {
    const mainCoin = document.getElementById('mainCoinBtn');
    if (mainCoin) mainCoin.onclick = (e) => window.handleCoinClick(e);
    updateGameUI();
});



window.loadUserData = function(coins, level) {
    LevelGameData.totalCoins = coins || 0;
    LevelGameData.currentLevel = level || 1;
    updateGameUI();
};

window.upgradeLevel = function() {
    if (LevelGameData.currentLevel >= LevelGameData.maxLevel) {
        alert("আপনি ইতিমধ্যে সর্বোচ্চ ১০ লেভেলে আছেন!");
        return;
    }

    const nextLevel = LevelGameData.currentLevel + 1;
    let upgradeCost = (nextLevel === 2) ? 100000 : (nextLevel === 3 ? 300000 : (nextLevel - 1) * 200000);

    if (LevelGameData.totalCoins >= upgradeCost) {
        LevelGameData.totalCoins -= upgradeCost;
        LevelGameData.currentLevel = nextLevel;
        
        updateGameUI();
        saveToFirebase();
        alert(`অভিনন্দন! আপনার লেভেল এখন ${LevelGameData.currentLevel}`);
        
        if (typeof openFeature === 'function') openFeature('level');
    } else {
        alert(`আরও ${(upgradeCost - LevelGameData.totalCoins).toLocaleString()} কয়েন প্রয়োজন।`);
    }
};

window.updateGameUI = function() {
    const coinDisplay = document.getElementById('balanceDisplay');
    const levelLabels = document.querySelectorAll('.nav-label');

    if (coinDisplay) coinDisplay.innerText = LevelGameData.totalCoins.toLocaleString();
    
    levelLabels.forEach(label => {
        if (label.innerText.includes('Level')) {
            label.innerText = `Level ${LevelGameData.currentLevel}`;
        }
    });
};

window.openFeature = function(feature) {
    const overlay = document.getElementById('feature-overlay');
    const body = document.getElementById('overlay-body');
    if (!overlay || !body) return;

    overlay.style.display = 'flex';

    if (feature === 'level') {
        const nextLvl = LevelGameData.currentLevel + 1;
        const cost = (nextLvl === 2) ? 100000 : (nextLvl === 3 ? 300000 : (nextLvl - 1) * 200000);
        body.innerHTML = `
            <div class="feature-card">
                <h3>Level Up</h3>
                <p>Current Level: ${LevelGameData.currentLevel}</p>
                <p>Cost: ${LevelGameData.currentLevel >= 10 ? 'MAX' : cost.toLocaleString()}</p>
                <button class="btn-action" onclick="upgradeLevel()">Upgrade Now</button>
            </div>`;
    } else {
        body.innerHTML = `<h3>${feature.toUpperCase()}</h3><p>Coming Soon...</p>`;
    }
};

window.closeOverlay = function() {
    document.getElementById('feature-overlay').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    const mainCoin = document.getElementById('mainCoinBtn');
    if (mainCoin) mainCoin.onclick = handleCoinClick;
    updateGameUI();
});


// ============================================
//           REFERRAL SECTION
// ============================================
const ReferralRewards = [
    { friends: 1, reward: "1,000 Coins" },
    { friends: 10, reward: "15,000 Coins" },
    { friends: 50, reward: "80,000 Coins" },
    { friends: 100, reward: "1,70,000 Coins" },
    { friends: 500, reward: "9,00,000 Coins" },
    { friends: 1000, reward: "20,00,000 Coins" },
    { friends: 5000, reward: "1,10,00,000 Coins" },
    { friends: 10000, reward: "2,50,00,000 Coins" }
];


function renderReferUI(body) {
    const user = window.fbAuth?.currentUser;
    const refLink = user ? `${window.location.origin}?ref=${user.uid}` : "লগইন করুন...";

    let html = `
        <div style="text-align:center;">
            <i class="fas fa-gift" style="font-size: 40px; color: #ffcc00; margin-bottom: 10px;"></i>
            <h2 style="color:#ffcc00; margin-bottom:5px;">Refer & Earn</h2>
            <p style="font-size:12px; color:#aaa; margin-bottom:15px;">বন্ধুদের ইনভাইট করুন এবং বিশাল রিওয়ার্ড জিতুন!</p>
        </div>

        <div class="feature-card">
            <p style="font-size:13px; margin-bottom:8px;">আপনার রেফার লিঙ্ক:</p>
            <div style="display:flex; gap:5px;">
                <input type="text" value="${refLink}" readonly class="withdraw-input" style="font-size:10px; flex:1; margin-bottom:0;">
                <button onclick="copyReferLink()" style="background:#ffcc00; border:none; border-radius:8px; padding:0 15px; cursor:pointer;">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        </div>

        <h3 style="font-size:14px; color:#ffcc00; margin: 20px 0 10px;">Referral Milestones</h3>
        <div class="milestone-container">
    `;

    ReferralRewards.forEach(item => {
        html += `
            <div class="milestone-card">
                <div class="ms-friends"><i class="fas fa-user-plus"></i> ${item.friends} Friends</div>
                <div class="ms-reward">${item.reward}</div>
            </div>
        `;
    });

    html += `</div>
        <p style="font-size:11px; color:#777; margin-top:15px; text-align:center;">
            * নতুন ইউজার জয়েন করলে পাবেন ১০,০০০ কয়েন বোনাস!
        </p>`;
    
    body.innerHTML = html;
}

const referOpenFeature = window.openFeature;
window.openFeature = function(feature) {
    if (feature === 'refer') {
        const overlay = document.getElementById('feature-overlay');
        const body = document.getElementById('overlay-body');
        if (overlay && body) {
            overlay.style.display = 'flex';
            renderReferUI(body);
            document.querySelector('.overlay-content').scrollTop = 0;
            return;
        }
    }
    if (referOpenFeature) referOpenFeature(feature);
};

window.copyReferLink = function() {
    const copyText = document.querySelector('.feature-card input[type="text"]');
    
    if (copyText && copyText.value !== "লগইন করুন...") {
        copyText.select();
        copyText.setSelectionRange(0, 99999);

        navigator.clipboard.writeText(copyText.value).then(() => {
            alert("রেফার লিঙ্ক কপি হয়েছে: " + copyText.value);
        }).catch(err => {
            console.error("Copy failed", err);
            alert("কপি করা সম্ভব হয়নি, দয়া করে ম্যানুয়ালি কপি করুন।");
        });
    } else {
        alert("কপি করার জন্য কোনো লিঙ্ক পাওয়া যায়নি। দয়া করে লগইন করুন।");
    }
};




// =============================================
//                TASK SECTION
// =============================================

const TaskGameData = {
    dailyRewardLastClaim: 0,
    adsWatchedToday: 0,
    adRewardsLimit: 9,       
    adRewardAmount: 1000,    
    adDuration: 30000,      
    adLinks:
    "https://www.profitablecpmratenetwork.com/dnab7r3a8t?key=9f2b45dd97524c8e6ea9a88b7243c015"
};

let adTimer; 
let secondsLeft = 0;
let isAdWatching = false;

window.claimDailyReward = function() {
    const user = window.fbAuth.currentUser;
    if (!user) return alert("দয়া করে আগে লগইন করুন!");

    const userRef = window.dbRef(window.fbDatabase, 'users/' + user.uid);

    window.dbOnValue(userRef, (snapshot) => {
        const data = snapshot.val();
        const lastClaim = data ? data.lastClaim : 0;
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (now - lastClaim >= oneDay) {
            const reward = LevelGameData.currentLevel * 1000; 
            LevelGameData.totalCoins += reward;

            window.dbUpdate(userRef, {
                coins: LevelGameData.totalCoins,
                lastClaim: now
            });

            updateGameUI();
            alert(`অভিনন্দন! আপনি ${reward} কয়েন রিওয়ার্ড পেয়েছেন।`);
            openFeature('tasks'); 
        } else {
            const remainingHours = Math.ceil((oneDay - (now - lastClaim)) / (60 * 60 * 1000));
            alert(`দুঃখিত! আপনাকে আরও ${remainingHours} ঘণ্টা অপেক্ষা করতে হবে।`);
        }
    }, { onlyOnce: true });
};

window.watchVideoAd = function(adNumber) {
    window.open(TaskGameData.adLinks, "_blank");
    
    isAdWatching = true;
    secondsLeft = 30; 
    
    alert("অ্যাডটি ওপেন হয়েছে। দয়া করে ৩০ সেকেন্ড অ্যাড পেজে থাকুন। আগে ফিরে আসলে কয়েন পাবেন না!");

    if (adTimer) clearInterval(adTimer);
    
    adTimer = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
            clearInterval(adTimer);
            isAdWatching = false;
            
            LevelGameData.totalCoins += TaskGameData.adRewardAmount;
            TaskGameData.adsWatchedToday += 1;

            updateGameUI();
            saveToFirebase(); 
            alert(`অ্যাড দেখা সফল! ১০০০ কয়েন যোগ করা হয়েছে।`);
            openFeature('tasks'); 
        }
    }, 1000);
};

document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "visible" && isAdWatching) {
        if (secondsLeft > 0) {
            clearInterval(adTimer);
            isAdWatching = false;
            secondsLeft = 0;
            alert("আপনি অ্যাডটি সম্পূর্ণ দেখেননি! কয়েন পেতে হলে ৩০ সেকেন্ড থাকতে হবে।");
            openFeature('tasks'); 
        }
    }
});


const originalOpenFeatureForTasks = window.openFeature;
window.openFeature = function(feature) {
    if (feature === 'tasks') {
        const overlay = document.getElementById('feature-overlay');
        const body = document.getElementById('overlay-body');
        if (!overlay || !body) return;

        overlay.style.display = 'flex';
        let taskHTML = `<h2 style="color:#ffcc00; margin-bottom:15px;">Tasks (Daily 9 Ad's)</h2>`;
        
        taskHTML += `
            <div class="feature-card">
                <p><strong>Daily Login Reward</strong></p>
                <p style="font-size:12px; color:#aaa;">Reward based on level</p>
                <button class="btn-action" onclick="claimDailyReward()">Claim Coins</button>
            </div>`;

        for (let i = 1; i <= 9; i++) {
            taskHTML += `
                <div class="feature-card">
                    <p><strong>Watch Video Ad ${i}</strong></p>
                    <p style="font-size:12px; color:#aaa;">Reward: 1000 Coins</p>
                    <button class="btn-action" onclick="watchVideoAd(${i})">Watch Ad</button>
                </div>`;
        }
        body.innerHTML = taskHTML;
        return;
    }
    if (originalOpenFeatureForTasks) originalOpenFeatureForTasks(feature);
};



// ========================================
//         WITHDRAW SECTION
// ========================================
window.processWithdraw = function() {
    const pointsInput = document.getElementById('withdrawPoints');
    const numberInput = document.getElementById('withdrawNumber');

    if (!pointsInput || !numberInput) return;

    const pointsToWithdraw = parseInt(pointsInput.value);
    const phoneNumber = numberInput.value.trim();
    const requiredCoins = pointsToWithdraw * 1000;

    if (isNaN(pointsToWithdraw) || pointsToWithdraw < 10000) {
        alert("দুঃখিত! সর্বনিম্ন ১০,০০০,০০ Cash Points না হলে উইথড্র দেওয়া সম্ভব নয়।");
        return;
    }

    if (LevelGameData.totalCoins < requiredCoins) {
        alert("আপনার একাউন্টে পর্যাপ্ত কয়েন নেই!");
        return;
    }

    if (phoneNumber.length < 11) {
        alert("দয়া করে সঠিক বিকাশ বা রকেট নম্বরটি দিন।");
        return;
    }

    LevelGameData.totalCoins -= requiredCoins;

    updateGameUI();
    if (typeof saveToFirebase === 'function') {
        saveToFirebase();
    }

    alert(`সফল! আপনার ${phoneNumber} নম্বরে ১০০ টাকা পাঠানোর রিকোয়েস্ট গ্রহণ করা হয়েছে।`);
    closeOverlay();
};

function renderWithdrawUI(body) {
    body.innerHTML = `
        <h2 style="color:#ffcc00; margin-bottom:10px;">Withdraw Funds</h2>
        <p style="font-size:12px; color:#aaa; margin-bottom:15px;">১০,০০০,০০  Points = ১০০ টাকা (বিকাশ/রকেট)</p>
        
        <div class="feature-card">
            <input type="number" id="withdrawPoints" class="withdraw-input" placeholder="Points লিখুন (সর্বনিম্ন ১০,০০০,০০ )">
            <input type="text" id="withdrawNumber" class="withdraw-input" placeholder="বিকাশ/রকেট মোবাইল নম্বর">
            
            <ul style="text-align:left; font-size:11px; color:#888; margin-top:10px; padding-left:15px;">
                <li>সর্বনিম্ন ১০,০০০,০০  পয়েন্ট লাগবে।</li>
                <li>পেমেন্ট ২৪ ঘণ্টার মধ্যে করা হবে।</li>
            </ul>
            
            <button class="btn-action" style="width:100%; margin-top:15px;" onclick="processWithdraw()">Confirm Withdraw</button>
        </div>
    `;
}

const originalOpenFeature = window.openFeature;
window.openFeature = function(feature) {
    if (feature === 'withdraw') {
        const overlay = document.getElementById('feature-overlay');
        const body = document.getElementById('overlay-body');
        if (overlay && body) {
            overlay.style.display = 'flex';
            renderWithdrawUI(body);
            return;
        }
    }
    if (originalOpenFeature) originalOpenFeature(feature);
};

// =====================================================
//           PROFILE SECTION
// =====================================================
async function getOrCreateGameUID(user) {
    const userRef = window.dbRef(window.fbDatabase, 'users/' + user.uid);
    
    return new Promise((resolve) => {
        window.dbOnValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.gameUID) {
                resolve(data.gameUID);
            } else {
                
                const newGameUID = Math.floor(10000000 + Math.random() * 90000000);
                window.dbUpdate(userRef, { gameUID: newGameUID });
                resolve(newGameUID);
            }
        }, { onlyOnce: true });
    });
}

async function renderProfileUI(body) {
    const user = window.fbAuth?.currentUser;
    if (!user) {
        body.innerHTML = "<h3 style='color:#ffcc00;'>Please Login First</h3>";
        return;
    }

    const gameUID = await getOrCreateGameUID(user);
    const level = LevelGameData.currentLevel || 1;

    body.innerHTML = `
        <div style="text-align:center; padding-top: 10px;">
            <i class="fas fa-user-circle" style="font-size: 60px; color: #ffcc00; margin-bottom: 10px;"></i>
            <h2 style="color:#ffcc00; margin: 0 0 20px 0;">User Profile</h2>
        </div>

        <div class="profile-card">
            <div style="margin-bottom: 15px;">
                <span class="info-label">Player ID (UID)</span>
                <span class="info-value">#${gameUID}</span>
            </div>

            <div style="margin-bottom: 15px;">
                <span class="info-label">Game Level</span>
                <span class="info-value" style="color: #fff;">Level ${level}</span>
            </div>

            <div style="margin-bottom: 15px;">
                <span class="info-label">Total Withdrawals</span>
                <span class="info-value" style="color: #fff;">0 Times</span>
            </div>

            <div style="margin-bottom: 5px;">
                <span class="info-label">Payment Status</span>
                <span class="info-value" style="color: #00ff00; font-size: 14px;">No History</span>
            </div>
        </div>

        <button class="btn-action" style="width:100%; margin-top:20px; background:#333; color:white;" onclick="closeOverlay()">Close</button>
    `;
}

const profileBase = window.openFeature;
window.openFeature = function(feature) {
    if (feature === 'profile') {
        const overlay = document.getElementById('feature-overlay');
        const body = document.getElementById('overlay-body');
        if (overlay && body) {
            overlay.style.display = 'flex';
            body.innerHTML = ""; 
            renderProfileUI(body);
            return;
        }
    }
    if (profileBase) profileBase(feature);
};

window.uploadProfileImage = function(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert("File is too large! Please select an image under 2MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        const user = window.fbAuth?.currentUser;

        if (user) {
            window.dbUpdate(window.dbRef(window.fbDatabase, 'users/' + user.uid), {
                profilePic: imageData
            }).then(() => {
                const imgElement = document.getElementById('displayProfilePic');
                if (imgElement) imgElement.src = imageData;
                alert("Profile picture updated successfully!");
            }).catch(err => console.error("Upload Error:", err));
        }
    };
    reader.readAsDataURL(file);
};

async function renderProfileUI(body) {
    const user = window.fbAuth?.currentUser;
    if (!user) {
        body.innerHTML = "<h3 style='color:#ffcc00;'>Please Login First</h3>";
        return;
    }

    const gameUID = await getOrCreateGameUID(user);
    const level = LevelGameData.currentLevel || 1;

    window.dbOnValue(window.dbRef(window.fbDatabase, 'users/' + user.uid), (snapshot) => {
        const userData = snapshot.val();
        const profileImg = userData?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

        body.innerHTML = `
            <div style="text-align:center; padding-top: 10px;">
                <div class="profile-img-container" onclick="document.getElementById('profileUpload').click()">
                    <img id="displayProfilePic" src="${profileImg}">
                    <div class="camera-icon">
                        <i class="fas fa-camera"></i>
                    </div>
                </div>
                <input type="file" id="profileUpload" style="display:none" accept="image/*" onchange="uploadProfileImage(this)">
                
                <h2 style="color:#ffcc00; margin: 10px 0 20px 0;">User Profile</h2>
            </div>

            <div class="profile-card">
                <div style="margin-bottom: 15px;">
                    <span class="info-label">Player ID (UID)</span>
                    <span class="info-value">#${gameUID}</span>
                </div>
                <div style="margin-bottom: 15px;">
                    <span class="info-label">Current Level</span>
                    <span class="info-value" style="color: #fff;">Level ${level}</span>
                </div>
                <div style="margin-bottom: 5px;">
                    <span class="info-label">Payment Status</span>
                    <span class="info-value" style="color: #00ff00; font-size: 14px;">Verified Player</span>
                </div>
            </div>

            <button class="btn-action" style="width:100%; margin-top:20px; background:#333; color:white;" onclick="closeOverlay()">Close</button>
        `;
    }, { onlyOnce: true });
}


// =========================================================
//          Settings Dropdown Show/Hide Logic
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settingsBtn');
    const myDropdown = document.getElementById('myDropdown');

    if (settingsBtn && myDropdown) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            myDropdown.classList.toggle('show');
        });
        document.addEventListener('click', () => {
            if (myDropdown.classList.contains('show')) {
                myDropdown.classList.remove('show');
            }
        });
    }
});



// ===============================
// Firebase User Data Load
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    if (!window.onAuthChanged) return;

    window.onAuthChanged(window.fbAuth, (user) => {

        if (!user) return;

        const userRef = window.dbRef(
            window.fbDatabase,
            'users/' + user.uid
        );

        window.dbOnValue(userRef, (snapshot) => {

            const data = snapshot.val();

            if (data) {

                LevelGameData.totalCoins =
                    Number(data.coins) || 0;

                LevelGameData.currentLevel =
                    Number(data.level) || 1;

            } else {

                LevelGameData.totalCoins = 0;
                LevelGameData.currentLevel = 1;

                window.dbSet(userRef, {
                    coins: 0,
                    level: 1
                });
            }

            updateGameUI();

        });
    });
});


// ===============================================
//     Authentication Business Logic
// ===============================================
let currentAuthMode = "login"; 


window.toggleAuthFormMode = function() {
    const formTitle = document.getElementById('authFormTitle');
    const formSubtitle = document.getElementById('authFormSubtitle');
    const primaryBtn = document.getElementById('primaryAuthBtn');
    const toggleMsg = document.getElementById('authToggleMessage');
    const toggleActionBtn = document.getElementById('authToggleActionBtn');

    if (!formTitle || !primaryBtn || !toggleActionBtn) return;

    if (currentAuthMode === "login") {
        currentAuthMode = "register";
        formTitle.innerText = "Register Account";
        formSubtitle.innerText = "নতুন অ্যাকাউন্ট তৈরি করে গেম খেলা শুরু করুন";
        primaryBtn.innerText = "Sign Up";
        toggleMsg.innerText = "ইতিমধ্যে অ্যাকাউন্ট আছে?";
        toggleActionBtn.innerText = "Login Here";
    } else {
        currentAuthMode = "login";
        formTitle.innerText = "Player Login";
        formSubtitle.innerText = "আপনার গেম ডাটা নিরাপদ রাখতে লগইন করুন";
        primaryBtn.innerText = "Login Now";
        toggleMsg.innerText = "নতুন প্লেয়ার? এখানে অ্যাকাউন্ট তৈরি করুন:";
        toggleActionBtn.innerText = "Create Account";
    }
};




window.handlePrimaryAuthAction = function() {
    const emailValue = document.getElementById('authEmailField')?.value.trim();
    const passwordValue = document.getElementById('authPasswordField')?.value;

    if (!emailValue || !passwordValue) {
        alert("দয়া করে ইমেইল এবং পাসওয়ার্ড সঠিকভাবে লিখুন!");
        return;
    }

    const firebaseAuth = window.fbCoreAuthInstance || window.fbAuth;
    const createUserMethod = window.fbGlobalCreateUser || window.createUser;
    const signInUserMethod = window.fbGlobalSignInUser || window.signInUser;

    if (!firebaseAuth) return;

    if (currentAuthMode === "register") {
        if (createUserMethod) {
            createUserMethod(firebaseAuth, emailValue, passwordValue)
                .then(() => alert("আপনার অ্যাকাউন্টটি সফলভাবে তৈরি হয়েছে!"))
                .catch((error) => handleAuthError(error.code));
        }
    } else {
        if (signInUserMethod) {
            signInUserMethod(firebaseAuth, emailValue, passwordValue)
                .then(() => alert("লগইন সফল হয়েছে!"))
                .catch((error) => handleAuthError(error.code));
        }
    }
};




window.logoutPlayerForSwitch = function() {
    const firebaseAuth = window.fbCoreAuthInstance || window.fbAuth;
    if (firebaseAuth) {
        if (confirm("আপনি কি এই আইডি লগআউট করে অন্য আইডিতে লগইন করতে চান?")) {
            firebaseAuth.signOut().then(() => {
                alert("সফলভাবে লগআউট হয়েছে।");
                if (typeof closeOverlay === "function") closeOverlay();
            }).catch(err => console.error(err));
        }
    }
};




function handleAuthError(errorCode) {
    if (errorCode === 'auth/email-already-in-use') alert("এই ইমেইলটি দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা আছে!");
    else if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password') alert("ভুল ইমেইল বা পাসওয়ার্ড দিয়েছেন!");
    else alert("সমস্যা হয়েছে! এরর কোড: " + errorCode);
}

// ==============================================
//           Real-Time Auth Observer 
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    const authScreen = document.getElementById('auth-screen-container');
    const mainGameLayout = document.getElementById('main-game-layout');
    
    const firebaseAuth = window.fbCoreAuthInstance || window.fbAuth;
    const authObserver = window.fbGlobalOnAuthChanged || window.onAuthChanged;

    if (authObserver && firebaseAuth) {
        authObserver(firebaseAuth, (user) => {
            if (user) {
                
                if (authScreen) authScreen.style.display = 'none';
                if (mainGameLayout) mainGameLayout.style.display = 'block';
            } else {
                if (mainGameLayout) mainGameLayout.style.display = 'none';
                if (authScreen) authScreen.style.display = 'flex';
            }
        });
    }
});
