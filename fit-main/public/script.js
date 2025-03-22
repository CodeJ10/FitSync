let camera;
let pose;
let currentExercise = null;
let repCount = 0;
let xpEarned = 0;
let counter = 0;
let lastCountTime = 0;
let inProperPosition = false;
let videoElement;
let userProfile = null;
let shownBadges = new Set();

// Add badge definitions
const badges = [
    { id: 'pushup_10', name: 'Push-up Novice', icon: '💪', requirement: { exercise: 'pushup', count: 10 } },
    { id: 'pushup_100', name: 'Push-up Warrior', icon: '⚔️', requirement: { exercise: 'pushup', count: 100 } },
    { id: 'pushup_1000', name: 'Push-up Master', icon: '👑', requirement: { exercise: 'pushup', count: 1000 } },
    { id: 'squat_10', name: 'Squat Novice', icon: '🦵', requirement: { exercise: 'squat', count: 10 } },
    { id: 'squat_100', name: 'Squat Warrior', icon: '⚔️', requirement: { exercise: 'squat', count: 100 } },
    { id: 'squat_1000', name: 'Squat Master', icon: '👑', requirement: { exercise: 'squat', count: 1000 } },
    { id: 'plank_30', name: 'Plank Novice', icon: '⏱️', requirement: { exercise: 'plank', count: 30 } },
    { id: 'plank_300', name: 'Plank Warrior', icon: '⚔️', requirement: { exercise: 'plank', count: 300 } },
    { id: 'plank_3000', name: 'Plank Master', icon: '👑', requirement: { exercise: 'plank', count: 3000 } },
    { id: 'jumpingjack_10', name: 'Jumping Jack Novice', icon: '🦘', requirement: { exercise: 'jumpingjack', count: 10 } },
    { id: 'jumpingjack_100', name: 'Jumping Jack Warrior', icon: '⚔️', requirement: { exercise: 'jumpingjack', count: 100 } },
    { id: 'jumpingjack_1000', name: 'Jumping Jack Master', icon: '👑', requirement: { exercise: 'jumpingjack', count: 1000 } },
    { id: 'armraises_10', name: 'Arm Raises Novice', icon: '🦾', requirement: { exercise: 'armraises', count: 10 } },
    { id: 'armraises_100', name: 'Arm Raises Warrior', icon: '⚔️', requirement: { exercise: 'armraises', count: 100 } },
    { id: 'armraises_1000', name: 'Arm Raises Master', icon: '👑', requirement: { exercise: 'armraises', count: 1000 } }
];

// Add exercise instructions
const exerciseInstructions = {
    pushup: {
        title: "Push-ups",
        steps: "1. Start in a plank position with your hands slightly wider than your shoulders\n2. Keep your body straight from head to heels\n3. Lower your body until your chest nearly touches the ground\n4. Push back up to the starting position",
        tips: "• Keep your elbows close to your body\n• Maintain a straight back\n• Breathe out when pushing up\n• Keep your core tight",
        image: "https://raw.githubusercontent.com/your-username/fitness-quest/main/public/images/pushup.jpg"
    },
    squat: {
        title: "Squats",
        steps: "1. Stand with feet shoulder-width apart\n2. Keep your back straight and chest up\n3. Lower your body by bending your knees\n4. Keep your knees aligned with your toes\n5. Push back up to the starting position",
        tips: "• Keep your weight in your heels\n• Don't let your knees go past your toes\n• Keep your chest up\n• Breathe out when standing up",
        image: "https://raw.githubusercontent.com/your-username/fitness-quest/main/public/images/squat.jpg"
    },
    plank: {
        title: "Plank",
        steps: "1. Get into a push-up position\n2. Lower your forearms to the ground\n3. Keep your body straight from head to heels\n4. Hold this position",
        tips: "• Keep your core tight\n• Don't let your hips sag\n• Maintain a neutral spine\n• Breathe steadily",
        image: "https://raw.githubusercontent.com/your-username/fitness-quest/main/public/images/plank.jpg"
    },
    jumpingjack: {
        title: "Jumping Jacks",
        steps: "1. Stand with your feet together and arms at your sides\n2. Jump while spreading your legs shoulder-width apart\n3. Simultaneously raise your arms above your head\n4. Jump back to the starting position",
        tips: "• Keep your knees slightly bent\n• Land softly on your feet\n• Keep your core engaged\n• Maintain a steady rhythm",
        image: "https://raw.githubusercontent.com/your-username/fitness-quest/main/public/images/jumpingjack.jpg"
    },
    armraises: {
        title: "Arm Raises",
        steps: "1. Stand with feet shoulder-width apart\n2. Start with arms at your sides\n3. Raise both arms straight up above your head\n4. Lower arms back to starting position",
        tips: "• Keep your back straight\n• Don't swing your arms\n• Control the movement\n• Keep your shoulders down",
        image: "https://raw.githubusercontent.com/your-username/fitness-quest/main/public/images/armraises.jpg"
    }
};

// Authentication Functions
async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login.');
            showTab('login');
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error registering');
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            // Update UI with user stats
            if (data.stats) {
                updateStats(data.stats);
            }
            showPage('main-page');
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error logging in');
    }
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        showPage('auth-page');
    } catch (error) {
        alert('Error logging out');
    }
}

// UI Functions
function showTab(tabId) {
    document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabId}-form`).classList.remove('hidden');
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
}

// Game Functions
async function loadUserProfile() {
    try {
        const response = await fetch('/api/profile');
        if (response.ok) {
            userProfile = await response.json();
            updateUI();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function updateUI() {
    if (!userProfile) return;

    document.getElementById('player-level').textContent = `Level: ${userProfile.level}`;
    document.getElementById('player-xp').textContent = `XP: ${userProfile.xp}/${userProfile.level * 1000}`;
    document.getElementById('xp-progress').style.width = `${(userProfile.xp / (userProfile.level * 1000)) * 100}%`;
    updateLeaderboard();
    updateBadges();
}

async function updateLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
            const leaderboard = await response.json();
            const leaderboardList = document.getElementById('leaderboard-list');
            
            // Create the table structure
            leaderboardList.innerHTML = `
                <table class="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Level</th>
                            <th>XP</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${leaderboard.map((user, index) => `
                            <tr>
                                <td class="rank">#${index + 1}</td>
                                <td class="username">${user.username}</td>
                                <td class="level">${user.level}</td>
                                <td class="xp">${user.xp}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        // Show error message in leaderboard
        document.getElementById('leaderboard-list').innerHTML = `
            <div class="leaderboard-error">
                <p>Unable to load leaderboard</p>
            </div>
        `;
    }
}

// Exercise Functions
function selectExercise(exercise) {
    currentExercise = exercise;
    counter = 0;
    let totalXPEarned = 0;
    
    // Update instruction page content
    document.getElementById('exercise-title').textContent = exerciseInstructions[exercise].title;
    document.getElementById('exercise-steps').textContent = exerciseInstructions[exercise].steps;
    document.getElementById('exercise-tips').textContent = exerciseInstructions[exercise].tips;
    document.getElementById('exercise-image').src = exerciseInstructions[exercise].image;
    
    // Show instruction page
    showPage('exercise-instruction-page');
}

function startExercise() {
    // Reset counters and displays
    document.getElementById('counter').textContent = '0 reps';
    document.getElementById('xp-earned').textContent = '+0 XP';
    document.getElementById('total-xp-earned').textContent = 'Total: 0 XP';
    
    // Show exercise page and initialize camera
    showPage('exercise-page');
    initializeCamera();
}

function returnToMain() {
    if (camera) {
        camera.stop();
    }
    showPage('main-page');
}

function initializeCamera() {
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');
    videoElement = document.createElement('video');

    function onResults(results) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw video
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

        if (results.poseLandmarks) {
            // Draw pose landmarks
            for (const landmark of results.poseLandmarks) {
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI);
                ctx.fill();
            }

            checkExercise(results.poseLandmarks);
        }
        ctx.restore();
    }

    pose = new Pose({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
    });
    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    pose.onResults(onResults);

    camera = new Camera(videoElement, {
        onFrame: async () => {
            await pose.send({image: videoElement});
        },
        width: 1280,
        height: 720
    });
    camera.start();
}

async function checkExercise(landmarks) {
    const now = Date.now();
    if (now - lastCountTime < 1000) return; // 1-second debounce

    let isInProperPosition = false;
    let wasInDefaultPosition = !inProperPosition;

    switch (currentExercise) {
        case 'pushup':
            const leftElbowAngle = calculateAngle(
                landmarks[11], // left shoulder
                landmarks[13], // left elbow
                landmarks[15]  // left wrist
            );
            const rightElbowAngle = calculateAngle(
                landmarks[12], // right shoulder
                landmarks[14], // right elbow
                landmarks[16]  // right wrist
            );
            isInProperPosition = leftElbowAngle < 90 && rightElbowAngle < 90;
            break;

        case 'squat':
            const leftKneeAngle = calculateAngle(
                landmarks[23], // left hip
                landmarks[25], // left knee
                landmarks[27]  // left ankle
            );
            const rightKneeAngle = calculateAngle(
                landmarks[24], // right hip
                landmarks[26], // right knee
                landmarks[28]  // right ankle
            );
            isInProperPosition = leftKneeAngle < 90 && rightKneeAngle < 90;
            break;

        case 'plank':
            const bodyAngle = calculateAngle(
                landmarks[11], // shoulder
                landmarks[23], // hip
                landmarks[27]  // ankle
            );
            isInProperPosition = Math.abs(180 - bodyAngle) < 20;
            break;

        case 'jumpingjack':
            const leftArmAngle = calculateAngle(
                landmarks[11], // left shoulder
                landmarks[13], // left elbow
                landmarks[15]  // left wrist
            );
            const rightArmAngle = calculateAngle(
                landmarks[12], // right shoulder
                landmarks[14], // right elbow
                landmarks[16]  // right wrist
            );
            const legSpread = Math.abs(landmarks[23].x - landmarks[24].x) * window.innerWidth;
            isInProperPosition = leftArmAngle > 160 && rightArmAngle > 160 && legSpread > 100;
            break;

        case 'armraises':
            const hipLevel = (landmarks[23].y + landmarks[24].y) / 2;
            const earLevel = Math.min(landmarks[7].y, landmarks[8].y);
            const leftWristAboveHead = landmarks[15].y < earLevel;
            const rightWristAboveHead = landmarks[16].y < earLevel;
            const wristsBelowHips = landmarks[15].y > hipLevel && landmarks[16].y > hipLevel;
            
            if (wristsBelowHips) {
                wasInDefaultPosition = true;
            }
            isInProperPosition = leftWristAboveHead && rightWristAboveHead;
            break;
    }

    if (isInProperPosition && wasInDefaultPosition) {
        counter++;
        document.getElementById('counter').textContent = `${counter} reps`;
        
        // Calculate XP based on exercise type
        const xpRates = {
            pushup: 5,
            squat: 5,
            plank: 10,
            jumpingjack: 3,
            armraises: 2
        };
        const xpEarned = xpRates[currentExercise] || 1;
        
        // Update XP display with animation
        const xpDisplay = document.getElementById('xp-earned');
        xpDisplay.textContent = `+${xpEarned} XP`;
        xpDisplay.style.opacity = '1';
        setTimeout(() => {
            xpDisplay.style.opacity = '0.8';
        }, 100);

        // Update total XP earned
        const totalXPDisplay = document.getElementById('total-xp-earned');
        const currentTotal = parseInt(totalXPDisplay.textContent.split(': ')[1]) || 0;
        const newTotal = currentTotal + xpEarned;
        totalXPDisplay.textContent = `Total: ${newTotal} XP`;
        
        // Save exercise data
        saveExercise(currentExercise, counter, xpEarned);
        
        lastCountTime = now;
    }
    inProperPosition = isInProperPosition;
}

async function saveExercise(exercise, reps, xp) {
    try {
        const response = await fetch('/api/exercise', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exercise, reps, xp })
        });
        if (response.ok) {
            await loadUserProfile();
            
            // Check for new badge unlocks
            const exerciseTotals = {};
            userProfile.exerciseHistory.forEach(record => {
                exerciseTotals[record.exercise] = (exerciseTotals[record.exercise] || 0) + record.reps;
            });

            badges.forEach(badge => {
                const { exercise: badgeExercise, count } = badge.requirement;
                const total = exerciseTotals[badgeExercise] || 0;
                // Only show badge if it's newly unlocked (not in achievements and not shown before)
                if (total >= count && !userProfile.achievements.includes(badge.id) && !shownBadges.has(badge.id)) {
                    // New badge unlocked!
                    userProfile.achievements.push(badge.id);
                    shownBadges.add(badge.id);
                    showBadgeUnlock(badge);
                }
            });
        }
    } catch (error) {
        console.error('Error saving exercise:', error);
    }
}

function calculateAngle(a, b, c) {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
}

// Add function to show badge unlock animation
function showBadgeUnlock(badge) {
    const notification = document.createElement('div');
    notification.className = 'badge-unlock';
    notification.innerHTML = `
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-name">${badge.name} Unlocked!</div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add function to update badges
function updateBadges() {
    const badgesContainer = document.getElementById('badges-container');
    badgesContainer.innerHTML = '';

    // Calculate exercise totals
    const exerciseTotals = {};
    userProfile.exerciseHistory.forEach(record => {
        exerciseTotals[record.exercise] = (exerciseTotals[record.exercise] || 0) + record.reps;
    });

    // Don't reset shownBadges here anymore, as we want to keep track of shown badges across updates

    badges.forEach(badge => {
        const { exercise, count } = badge.requirement;
        const total = exerciseTotals[exercise] || 0;
        const isUnlocked = total >= count;
        const progress = Math.min(total, count);

        const badgeElement = document.createElement('div');
        badgeElement.className = `badge ${isUnlocked ? '' : 'locked'}`;
        badgeElement.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-progress">${progress}/${count}</div>
        `;
        badgesContainer.appendChild(badgeElement);
    });
}

// Event Listeners
window.addEventListener('resize', () => {
    const canvas = document.getElementById('output');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    showPage('auth-page');
    showTab('login');
    
    // Update leaderboard immediately
    updateLeaderboard();
    
    // Update leaderboard every 30 seconds
    setInterval(updateLeaderboard, 30000);
});

function updateStats(stats) {
    document.getElementById('player-level').textContent = `Level: ${stats.level}`;
    document.getElementById('player-xp').textContent = `XP: ${stats.xp}/${stats.level * 1000}`;
    document.getElementById('xp-progress').style.width = `${(stats.xp / (stats.level * 1000)) * 100}%`;
}

async function updateExerciseStats(exerciseType, count) {
    try {
        const response = await fetch('/api/update-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exerciseType, count })
        });

        if (response.ok) {
            const stats = await response.json();
            updateStats(stats);
            
            // Update badge completion
            updateBadgeCompletion(exerciseType, count);
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Navigation Functions
function showSection(sectionId) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to clicked nav link
    const clickedLink = document.querySelector(`.nav-link[onclick="showSection('${sectionId}')"]`);
    if (clickedLink) {
        clickedLink.classList.add('active');
    }

    // Scroll to the section
    const section = document.getElementById(`${sectionId}-section`);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function createContactSection() {
    const contactSection = document.createElement('div');
    contactSection.className = 'contact-section';
    contactSection.innerHTML = `
        <h2>Contact Us</h2>
        <div class="contact-content">
            <div class="contact-info">
                <div class="contact-item">
                    <span class="contact-icon">📧</span>
                    <h3>Email</h3>
                    <p>support@fitsync.com</p>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">📱</span>
                    <h3>Phone</h3>
                    <p>+1 (555) 123-4567</p>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">💬</span>
                    <h3>Social Media</h3>
                    <div class="social-links">
                        <a href="#" class="social-link">Twitter</a>
                        <a href="#" class="social-link">Instagram</a>
                        <a href="#" class="social-link">Facebook</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.querySelector('.game-content').appendChild(contactSection);
    return contactSection;
}

// Show all sections when the page loads
document.addEventListener('DOMContentLoaded', () => {
    showSection(); // Call without parameters to show all sections
});

// Add this function to update badge completion state
function updateBadgeCompletion(exerciseType, count) {
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        const badgeName = badge.querySelector('.badge-name').textContent.toLowerCase();
        const progress = badge.querySelector('.badge-progress');
        const [current, target] = progress.textContent.split('/').map(num => parseInt(num));
        
        if (badgeName.includes(exerciseType.toLowerCase())) {
            if (count >= target) {
                badge.classList.add('completed');
            }
            progress.textContent = `${Math.min(count, target)}/${target}`;
        }
    });
}
