document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: "AIzaSyCp1hlo-rPaqjDQ-UwrGuzr3OsyAaob3us",
        authDomain: "killing-blow.firebaseapp.com",
        projectId: "killing-blow",
        storageBucket: "killing-blow.appspot.com",
        messagingSenderId: "45238730546",
        appId: "1:45238730546:web:1926aaf13840ca95aba12b",
        databaseURL: "https://killing-blow-default-rtdb.firebaseio.com"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();
    const chatRef = db.ref('chat');
    const playersRef = db.ref('players');
    const bossRef = db.ref('boss');
    const killedBossesRef = db.ref('killedBosses');

    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const logoutButton = document.getElementById('logout-button');
    const accountButton = document.getElementById('account-button');
    const hamburgerLoginButton = document.getElementById('hamburger-login-button');
    const hamburgerRegisterButton = document.getElementById('hamburger-register-button');
    const hamburgerLogoutButton = document.getElementById('hamburger-logout-button');
    const hamburgerAccountButton = document.getElementById('hamburger-account-button');
    const registerModal = document.getElementById('register-modal');
    const loginModal = document.getElementById('login-modal');
    const registerClose = document.getElementById('register-close');
    const loginClose = document.getElementById('login-close');
    const registerSubmit = document.getElementById('register-submit');
    const loginSubmit = document.getElementById('login-submit');
    const sendButton = document.getElementById('send-button');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const usernameElement = document.getElementById('username');
    const attackButton = document.getElementById('attack-button');
    const upgradeAttackButton = document.getElementById('upgrade-attack-damage');
    const upgradeGoldButton = document.getElementById('upgrade-gold-drop');
    const playerDamageElement = document.getElementById('player-damage');
    const goldElement = document.getElementById('gold');
    const killingBlowsElement = document.getElementById('killing-blows');
    const bossTokensElement = document.getElementById('boss-tokens');
    const leaderboardList = document.getElementById('leaderboard-list');
    const bossTokensLeaderboardList = document.getElementById('boss-tokens-leaderboard-list');
    const bossHealthElement = document.getElementById('boss-health');
    const healthBarElement = document.getElementById('health-bar');
    const bossNameElement = document.getElementById('boss-name');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const hamburgerContent = document.querySelector('.hamburger-content');
    const hamburgerIcon = document.querySelector('.hamburger-icon');

    let loggedIn = false;
    let username = '';
    let userId = '';
    let playerDamage = 1;
    let gold = 0;
    let killingBlows = 0;
    let bossTokens = 0;
    let bossId = '';

    const prefixes = ["Ancient", "Dark", "Eternal", "Mystic", "Fierce", "Savage", "Infernal"];
    const coreNames = ["Dragon", "Warlord", "Titan", "Behemoth", "Golem", "Hydra", "Phoenix"];
    const suffixes = ["of Doom", "the Destroyer", "the Conqueror", "of Shadows", "the Immortal", "the Ruthless"];

    function generateBossName() {
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const coreName = coreNames[Math.floor(Math.random() * coreNames.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${prefix} ${coreName} ${suffix}`;
    }

    function createNewBoss(previousHealth) {
        const bossName = generateBossName();
        const bossId = `boss_${Date.now()}`;
        const newHealth = Math.ceil(previousHealth * 1.1);
        return {
            id: bossId,
            name: bossName,
            health: newHealth,
            maxHealth: newHealth,
            killedBy: null
        };
    }

    function toggleAuthButtons() {
        if (loggedIn) {
            loginButton.style.display = 'none';
            registerButton.style.display = 'none';
            logoutButton.style.display = 'inline';
            accountButton.style.display = 'inline';
            hamburgerLoginButton.style.display = 'none';
            hamburgerRegisterButton.style.display = 'none';
            hamburgerLogoutButton.style.display = 'block';
            hamburgerAccountButton.style.display = 'block';
            chatInput.disabled = false;
            sendButton.disabled = false;
        } else {
            loginButton.style.display = 'inline';
            registerButton.style.display = 'inline';
            logoutButton.style.display = 'none';
            accountButton.style.display = 'none';
            hamburgerLoginButton.style.display = 'block';
            hamburgerRegisterButton.style.display = 'block';
            hamburgerLogoutButton.style.display = 'none';
            hamburgerAccountButton.style.display = 'none';
            chatInput.disabled = true;
            sendButton.disabled = true;
        }
    }

    function showModal(modal) {
        modal.style.display = 'block';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
    }

    function updatePlayerStats() {
        usernameElement.innerHTML = loggedIn ? username : '<a href="#" id="login-register-link">Login/Register</a>';
        playerDamageElement.textContent = playerDamage;
        goldElement.textContent = gold;
        killingBlowsElement.textContent = killingBlows;
        bossTokensElement.textContent = bossTokens;
    }

    function addChatMessage(username, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        messageElement.innerHTML = `<span class="chat-username">${username}:</span> ${message}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
    }

    registerButton.addEventListener('click', () => {
        showModal(registerModal);
    });

    loginButton.addEventListener('click', () => {
        showModal(loginModal);
    });

    hamburgerRegisterButton.addEventListener('click', () => {
        showModal(registerModal);
    });

    hamburgerLoginButton.addEventListener('click', () => {
        showModal(loginModal);
    });

    registerClose.addEventListener('click', () => {
        closeModal(registerModal);
    });

    loginClose.addEventListener('click', () => {
        closeModal(loginModal);
    });

    window.addEventListener('click', (event) => {
        if (event.target == registerModal) {
            closeModal(registerModal);
        }
        if (event.target == loginModal) {
            closeModal(loginModal);
        }
    });

    registerSubmit.addEventListener('click', () => {
        const email = document.getElementById('register-username').value;
        const displayName = document.getElementById('register-display-name').value;
        const password = document.getElementById('register-password').value;
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                user.updateProfile({ displayName: displayName }).then(() => {
                    playersRef.child(user.uid).set({
                        email: email,
                        displayName: displayName,
                        damage: 1,
                        gold: 0,
                        killingBlows: 0,
                        bossTokens: 0
                    });
                    alert('Registration successful');
                    closeModal(registerModal);
                    window.location.reload(); // Reload the page to reflect changes
                });
            })
            .catch(error => {
                alert(error.message);
            });
    });

    loginSubmit.addEventListener('click', () => {
        const email = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                loggedIn = true;
                const user = userCredential.user;
                username = user.displayName;
                userId = user.uid;
                fetchPlayerData();
                fetchChatMessages();
                updateLeaderboard();
                toggleAuthButtons();
                closeModal(loginModal);
            })
            .catch(error => {
                alert(error.message);
            });
    });

    logoutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
            loggedIn = false;
            username = '';
            toggleAuthButtons();
            updatePlayerStats();
        });
    });

    hamburgerLogoutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
            loggedIn = false;
            username = '';
            toggleAuthButtons();
            updatePlayerStats();
            hamburgerContent.style.display = 'none';
        });
    });

    auth.onAuthStateChanged(user => {
        if (user) {
            loggedIn = true;
            username = user.displayName;
            userId = user.uid;
            fetchPlayerData();
            fetchChatMessages();
            updateLeaderboard();
        } else {
            loggedIn = false;
            username = '';
            updatePlayerStats();
        }
        toggleAuthButtons();
    });

    sendButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message && loggedIn) {
            const chatMessage = {
                username: username,
                message: message,
                timestamp: new Date().toISOString()
            };
            chatRef.push(chatMessage).catch(error => {
                alert('Error sending message: ' + error.message);
            });
            chatInput.value = '';
        } else if (!loggedIn) {
            alert('You must be logged in to send messages');
        }
    });

    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    // Fetch chat messages for all users (including guests)
    function fetchChatMessages() {
        chatRef.once('value', (snapshot) => {
            chatMessages.innerHTML = ''; // Clear previous messages
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                addChatMessage(data.username, data.message);
            });
        });
    }

    // Real-time listener for chat messages
    chatRef.on('child_added', (snapshot) => {
        const data = snapshot.val();
        addChatMessage(data.username, data.message);
    });

    // Initialize Boss if it doesn't exist
    bossRef.once('value', (snapshot) => {
        if (!snapshot.exists()) {
            console.log('Initializing new boss...');
            const newBoss = createNewBoss(100); // Initial boss health
            bossId = newBoss.id;
            bossRef.set(newBoss);
        } else {
            const data = snapshot.val();
            bossId = data.id;
        }
    });

    // Boss Logic
    bossRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            bossHealthElement.textContent = Math.max(0, data.health).toFixed(0);
            healthBarElement.style.width = `${(data.health / data.maxHealth) * 100}%`;
            bossNameElement.textContent = data.name;  // Update boss name in the UI
            console.log(`Boss health updated: ${data.health}`);
        }
    });

    attackButton.addEventListener('click', () => {
        if (!loggedIn) {
            alert('You must be logged in to attack');
            return;
        }
        bossRef.transaction(boss => {
            if (boss && typeof boss.health === 'number' && typeof boss.maxHealth === 'number') {
                console.log(`Attacking boss with health ${boss.health}`);
                let newHealth = boss.health - playerDamage;
                newHealth = Math.max(0, newHealth); // Ensure newHealth is not less than 0
                if (newHealth === 0) {
                    console.log('Boss defeated');
                    playersRef.child(userId).transaction(user => {
                        if (user) {
                            user.killingBlows = (user.killingBlows || 0) + 1;
                            killingBlows = user.killingBlows;
                            updatePlayerStats();
                            console.log(`Killing blows updated: ${user.killingBlows}`);
                        }
                        return user;
                    }, (error, committed, snapshot) => {
                        if (committed) {
                            const data = snapshot.val();
                            killingBlows = data.killingBlows;
                            updatePlayerStats();
                            updateLeaderboard();
                        }
                    });
                    const goldDrop = Math.floor(Math.random() * 101) + 50;
                    playersRef.once('value', snapshot => {
                        snapshot.forEach(childSnapshot => {
                            const user = childSnapshot.val();
                            if (user && user.damage > 0) { // Check if user and damage are not null
                                playersRef.child(childSnapshot.key).transaction(playerData => {
                                    if (playerData) {
                                        playerData.gold = (playerData.gold || 0) + goldDrop;
                                        playerData.bossTokens = (playerData.bossTokens || 0) + 1; // Add Boss Token
                                        // If this is the current player, update their gold variable and UI
                                        if (childSnapshot.key === userId) {
                                            gold = playerData.gold;
                                            bossTokens = playerData.bossTokens; // Update Boss Tokens
                                            updatePlayerStats();
                                        }
                                    }
                                    return playerData;
                                });
                            }
                        });
                    });
                    // Log killed boss
                    killedBossesRef.push({
                        bossId: boss.id,
                        bossName: boss.name, // Log boss name
                        killedBy: username,
                        timestamp: new Date().toISOString()
                    });
                    return createNewBoss(boss.maxHealth);
                } else {
                    return {
                        ...boss,
                        health: newHealth
                    };
                }
            } else {
                console.error('Invalid boss data:', boss);
                return boss; // Return the original boss object to avoid NaN
            }
        }, (error, committed, snapshot) => {
            if (error) {
                console.log('Transaction failed:', error);
            } else if (!committed) {
                console.log('Transaction not committed');
            } else {
                console.log('Transaction committed', snapshot.val());
                if (snapshot.val() && snapshot.val().health !== undefined) {
                    bossHealthElement.textContent = Math.max(0, snapshot.val().health).toFixed(0);
                    healthBarElement.style.width = `${(snapshot.val().health / snapshot.val().maxHealth) * 100}%`;
                }
            }
        });
    });

    // Upgrade Attack Damage
    upgradeAttackButton.addEventListener('click', () => {
        if (!loggedIn) {
            alert('You must be logged in to upgrade');
            return;
        }
        playersRef.child(userId).transaction(user => {
            if (user) {
                const upgradeCost = Math.floor(10 * Math.pow(1.2, user.damage - 1));
                if (user.gold >= upgradeCost) {
                    user.gold -= upgradeCost;
                    user.damage += 1;
                    playerDamage = user.damage;
                    gold = user.gold;
                    updatePlayerStats();
                    console.log(`Attack damage upgraded to: ${user.damage}`);
                } else {
                    alert('Not enough gold to upgrade attack damage');
                }
            }
            return user;
        });
    });

    // Upgrade Gold Drop
    upgradeGoldButton.addEventListener('click', () => {
        if (!loggedIn) {
            alert('You must be logged in to upgrade');
            return;
        }
        playersRef.child(userId).transaction(user => {
            if (user) {
                const upgradeCost = Math.floor(100 * Math.pow(1.5, user.goldDropLevel || 0));
                if (user.gold >= upgradeCost) {
                    user.gold -= upgradeCost;
                    user.goldDropLevel = (user.goldDropLevel || 0) + 1;
                    gold = user.gold;
                    updatePlayerStats();
                    console.log(`Gold drop level upgraded to: ${user.goldDropLevel}`);
                } else {
                    alert('Not enough gold to upgrade gold drop');
                }
            }
            return user;
        });
    });

    // Leaderboard Logic
    function updateLeaderboard() {
        playersRef.orderByChild('killingBlows').limitToLast(3).once('value', snapshot => {
            leaderboardList.innerHTML = '';
            const leaderboardData = [];
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                leaderboardData.push(data);
            });
            leaderboardData.sort((a, b) => b.killingBlows - a.killingBlows);
            leaderboardData.forEach(data => {
                const listItem = document.createElement('li');
                listItem.textContent = `${data.displayName} - ${data.killingBlows} KB`;
                leaderboardList.appendChild(listItem);
            });
        });

        // Update Boss Tokens Leaderboard
        playersRef.orderByChild('bossTokens').limitToLast(3).once('value', snapshot => {
            bossTokensLeaderboardList.innerHTML = '';
            const leaderboardData = [];
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                leaderboardData.push(data);
            });
            leaderboardData.sort((a, b) => b.bossTokens - a.bossTokens);
            leaderboardData.forEach(data => {
                const listItem = document.createElement('li');
                listItem.textContent = `${data.displayName} - ${data.bossTokens} Boss Tokens`;
                bossTokensLeaderboardList.appendChild(listItem);
            });
        });
    }

    // Fetch player data for the logged-in user
    function fetchPlayerData() {
        if (loggedIn) {
            playersRef.child(userId).once('value', snapshot => {
                const data = snapshot.val();
                if (data) { // Check if data is not null
                    playerDamage = data.damage;
                    gold = data.gold;
                    killingBlows = data.killingBlows;
                    bossTokens = data.bossTokens;
                    updatePlayerStats();
                }
            });
        }
    }

    // Call updateLeaderboard initially and whenever data changes
    updateLeaderboard();
    playersRef.on('child_changed', updateLeaderboard);
    playersRef.on('child_added', updateLeaderboard);

    // Add event listener to open login modal when the login/register link is clicked
    document.getElementById('player-stats').addEventListener('click', (event) => {
        if (event.target.id === 'login-register-link') {
            showModal(loginModal);
        }
    });

    // Hamburger menu logic
    hamburgerMenu.addEventListener('click', () => {
        hamburgerContent.style.display = hamburgerContent.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (event) => {
        if (!hamburgerMenu.contains(event.target) && !hamburgerContent.contains(event.target)) {
            hamburgerContent.style.display = 'none';
        }
    });
});
