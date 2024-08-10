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
    const pvpLobbiesRef = db.ref('pvpLobbies');
    const completedMatchesRef = db.ref('completedMatches');

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
    const lifeTokensElement = document.getElementById('life-tokens');
    const deathTokensElement = document.getElementById('death-tokens');
    const leaderboardList = document.getElementById('leaderboard-list');
    const bossHealthElement = document.getElementById('boss-health');
    const healthBarElement = document.getElementById('health-bar');
    const bossNameElement = document.getElementById('boss-name');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const hamburgerContent = document.querySelector('.hamburger-content');
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    const createPvpButton = document.getElementById('create-pvp-button');
    const pvpLobbiesList = document.getElementById('pvp-lobbies-list');
    const pvpModal = document.getElementById('pvp-modal');
    const pvpStatus = document.getElementById('pvp-status');
    const playerNameElement = document.getElementById('player-name');
    const playerHealthElement = document.getElementById('player-health');
    const opponentNameElement = document.getElementById('opponent-name');
    const opponentHealthElement = document.getElementById('opponent-health');
    const pvpAttackButton = document.getElementById('pvp-attack-button');
    const closePvpButton = document.getElementById('close-pvp-button');

    let loggedIn = false;
    let username = '';
    let userId = '';
    let playerDamage = 1;
    let gold = 0;
    let killingBlows = 0;
    let bossTokens = 0;
    let lifeTokens = 0;
    let deathTokens = 0;
    let bossId = '';
    let currentMatchId = null;
    let isPlayerTurn = false;

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
        lifeTokensElement.textContent = lifeTokens;
        deathTokensElement.textContent = deathTokens;
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
                        bossTokens: 0,
                        lifeTokens: 0,
                        deathTokens: 0
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
            
            // Check if the user has an active lobby and rejoin
            const lobbyId = `lobby_${userId}`;
            pvpLobbiesRef.child(lobbyId).once('value', snapshot => {
                if (snapshot.exists()) {
                    currentMatchId = lobbyId;
                    showModal(pvpModal);
                    pvpLobbiesRef.child(lobbyId).on('value', updatePvpModal);
                }
            });
    
            // Also check if the user is player2 in any lobby
            pvpLobbiesRef.once('value', snapshot => {
                snapshot.forEach(childSnapshot => {
                    const lobby = childSnapshot.val();
                    if (lobby.player2 && lobby.player2.id === userId) {
                        currentMatchId = childSnapshot.key;
                        showModal(pvpModal);
                        pvpLobbiesRef.child(currentMatchId).on('value', updatePvpModal);
                    }
                });
            });
    
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
                                        playerData.bossTokens = (playerData.bossTokens || 0) + 1; // Add a boss token
                                        // If this is the current player, update their gold variable and UI
                                        if (childSnapshot.key === userId) {
                                            gold = playerData.gold;
                                            bossTokens = playerData.bossTokens; // Update boss tokens for the current player
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

        const goldLeaderboardList = document.getElementById('gold-leaderboard-list');
        playersRef.orderByChild('gold').limitToLast(3).once('value', snapshot => {
            goldLeaderboardList.innerHTML = '';
            const leaderboardData = [];
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                leaderboardData.push(data);
            });
            leaderboardData.sort((a, b) => b.gold - a.gold);
            leaderboardData.forEach(data => {
                const listItem = document.createElement('li');
                listItem.textContent = `${data.displayName} - ${data.gold} Gold`;
                goldLeaderboardList.appendChild(listItem);
            });
        });

        const bossTokensLeaderboardList = document.getElementById('boss-tokens-leaderboard-list');
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

        const lifeTokensLeaderboardList = document.getElementById('life-tokens-leaderboard-list');
        playersRef.orderByChild('lifeTokens').limitToLast(3).once('value', snapshot => {
            lifeTokensLeaderboardList.innerHTML = '';
            const leaderboardData = [];
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                leaderboardData.push(data);
            });
            leaderboardData.sort((a, b) => b.lifeTokens - a.lifeTokens);
            leaderboardData.forEach(data => {
                const listItem = document.createElement('li');
                listItem.textContent = `${data.displayName} - ${data.lifeTokens} Life Tokens`;
                lifeTokensLeaderboardList.appendChild(listItem);
            });
        });

        const deathTokensLeaderboardList = document.getElementById('death-tokens-leaderboard-list');
        playersRef.orderByChild('deathTokens').limitToLast(3).once('value', snapshot => {
            deathTokensLeaderboardList.innerHTML = '';
            const leaderboardData = [];
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                leaderboardData.push(data);
            });
            leaderboardData.sort((a, b) => b.deathTokens - a.deathTokens);
            leaderboardData.forEach(data => {
                const listItem = document.createElement('li');
                listItem.textContent = `${data.displayName} - ${data.deathTokens} Death Tokens`;
                deathTokensLeaderboardList.appendChild(listItem);
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
                    lifeTokens = data.lifeTokens;
                    deathTokens = data.deathTokens;
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

    createPvpButton.addEventListener('click', () => {
        if (!loggedIn) {
            alert('You must be logged in to create a PvP lobby');
            return;
        }
    
        const lobbyId = `lobby_${userId}`;
        const lobbyData = {
            player1: {
                id: userId,
                displayName: username,
                health: 100
            },
            player2: null,
            status: 'waiting',
            turn: userId
        };
    
        pvpLobbiesRef.child(lobbyId).set(lobbyData).then(() => {
            currentMatchId = lobbyId;
            showModal(pvpModal);
            pvpStatus.textContent = 'Waiting for opponent...';
            playerNameElement.textContent = username;
            playerHealthElement.textContent = 100;
            opponentNameElement.textContent = 'Opponent';
            opponentHealthElement.textContent = '';
            
            // Listen for changes in the lobby so the creator can see when an opponent joins
            pvpLobbiesRef.child(lobbyId).on('value', updatePvpModal);
        }).catch(error => {
            console.error('Error creating PvP lobby:', error);
        });
    });
    

    function listPvpLobbies() {
        pvpLobbiesRef.on('child_added', snapshot => {
            const lobby = snapshot.val();
            if (lobby.status === 'waiting') {
                const listItem = document.createElement('li');
                listItem.setAttribute('data-key', snapshot.key);
                listItem.textContent = `${lobby.player1.displayName}'s Lobby`;
                const joinButton = document.createElement('button');
                joinButton.textContent = 'Join Lobby';
                joinButton.addEventListener('click', () => joinPvpLobby(snapshot.key));
                listItem.appendChild(joinButton);
                pvpLobbiesList.appendChild(listItem);
            }
        });
    
        pvpLobbiesRef.on('child_removed', snapshot => {
            const lobbyKey = snapshot.key;
            const lobbyItem = document.querySelector(`li[data-key="${lobbyKey}"]`);
            if (lobbyItem) {
                lobbyItem.remove();
            }
        });
    }
    

    function joinPvpLobby(lobbyId) {
        if (!loggedIn) {
            alert('You must be logged in to join a PvP lobby');
            return;
        }
    
        console.log(`Attempting to join lobby with ID: ${lobbyId}`);
        
        pvpLobbiesRef.child(lobbyId).transaction(lobby => {
            if (lobby && !lobby.player2) {
                lobby.player2 = {
                    id: userId,
                    displayName: username,
                    health: 100
                };
                lobby.status = 'active';
                console.log(`Player 2 joined: ${username}`);
                return lobby;
            }
            return lobby;
        }, (error, committed, snapshot) => {
            if (error) {
                console.error('Error joining PvP lobby:', error);
            } else if (!committed) {
                console.log('Transaction not committed');
            } else {
                currentMatchId = lobbyId;
                console.log(`Lobby joined successfully, lobbyId: ${lobbyId}`);
                showModal(pvpModal);
                pvpStatus.textContent = 'Battle begins!';
                pvpAttackButton.disabled = snapshot.val().turn !== userId;
                pvpLobbiesRef.child(lobbyId).on('value', updatePvpModal);
            }
        });
    }
    
    function updatePvpModal(snapshot) {
        const lobby = snapshot.val();
        if (!lobby) return;
    
        console.log('Updating PvP modal with lobby data:', lobby);
    
        if (lobby.player2) { // Ensure player2 exists before updating
            playerNameElement.textContent = lobby.player1.id === userId ? lobby.player1.displayName : lobby.player2.displayName;
            opponentNameElement.textContent = lobby.player1.id === userId ? lobby.player2.displayName : lobby.player1.displayName;
            playerHealthElement.textContent = lobby.player1.id === userId ? lobby.player1.health : lobby.player2.health;
            opponentHealthElement.textContent = lobby.player1.id === userId ? lobby.player2.health : lobby.player1.health;
            isPlayerTurn = lobby.turn === userId;
            pvpAttackButton.disabled = !isPlayerTurn;
    
            if (lobby.status === 'completed') {
                pvpStatus.textContent = lobby.winner === userId ? 'You won!' : 'You lost!';
                console.log('Match completed, winner:', lobby.winner);
    
                if (lobby.winner === userId) {
                    playersRef.child(userId).transaction(player => {
                        player.lifeTokens = (player.lifeTokens || 0) + 1;
                        return player;
                    });
                } else {
                    playersRef.child(userId).transaction(player => {
                        player.deathTokens = (player.deathTokens || 0) + 1;
                        return player;
                    });
                }
                completedMatchesRef.push(lobby);
                pvpLobbiesRef.child(currentMatchId).remove();
            } else {
                pvpStatus.textContent = isPlayerTurn ? 'Your turn!' : 'Opponent\'s turn...';
                console.log('Match ongoing, player turn:', isPlayerTurn ? 'You' : 'Opponent');
            }
        } else {
            console.log('Waiting for opponent...');
            pvpStatus.textContent = 'Waiting for opponent...';
        }
    }
    
    
    

    pvpAttackButton.addEventListener('click', () => {
        if (!isPlayerTurn || !currentMatchId) return;

        pvpLobbiesRef.child(currentMatchId).transaction(lobby => {
            if (!lobby) return;

            const opponent = lobby.player1.id === userId ? lobby.player2 : lobby.player1;
            const player = lobby.player1.id === userId ? lobby.player1 : lobby.player2;

            const damage = Math.floor(Math.random() * 10) + 1;
            const criticalHit = Math.random() < 0.05;
            const finalDamage = criticalHit ? damage * 2 : damage;

            opponent.health -= finalDamage;
            if (opponent.health <= 0) {
                lobby.status = 'completed';
                lobby.winner = userId;
            } else {
                lobby.turn = opponent.id;
            }

            return lobby;
        }).then(() => {
            pvpLobbiesRef.child(currentMatchId).once('value').then(updatePvpModal);
        }).catch(error => {
            console.error('Error updating PvP match:', error);
        });
    });

    closePvpButton.addEventListener('click', () => {
        closeModal(pvpModal);
    });

    listPvpLobbies();
});
