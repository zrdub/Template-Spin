        let items = ['Pizza', 'Burger', 'Sushi', 'Pasta', 'Steak', 'Tacos'];
        let isSpinning = false;
        let currentRotation = 0;

        const canvas = document.getElementById('wheel');
        const ctx = canvas.getContext('2d');
        const spinBtn = document.getElementById('spinBtn');
        const itemInput = document.getElementById('itemInput');
        const addBtn = document.getElementById('addBtn');
        const clearBtn = document.getElementById('clearBtn');
        const popupResultText = document.getElementById('popupResultText');
        const resultPopup = document.getElementById('resultPopup');
        const closePopup = document.getElementById('closePopup');

        // Free SFX from Mixkit: "Fast bike wheel spin"
        const spinSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1500/1500-preview.mp3');
        spinSound.preload = 'auto';
        spinSound.loop = false;
        spinSound.volume = 0.32;
        let spinSoundFadeTimer = null;

        // Colors for wheel segments
        const colors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24',
            '#f8b500', '#eb4d4b', '#6c5ce7', '#a29bfe',
            '#fd79a8', '#fdcb6e', '#55a3ff', '#00b894'
        ];

        function playSpinSound() {
            clearInterval(spinSoundFadeTimer);
            spinSound.currentTime = 0;
            spinSound.volume = 0.32;

            const playPromise = spinSound.play();
            if (playPromise) {
                playPromise.catch(() => {
                    // Some browsers block audio; the wheel should keep working silently.
                });
            }
        }

        function stopSpinSound() {
            clearInterval(spinSoundFadeTimer);

            if (spinSound.paused) return;

            const fadeSteps = 8;
            const fadeAmount = spinSound.volume / fadeSteps;
            let currentStep = 0;

            spinSoundFadeTimer = setInterval(() => {
                currentStep++;
                spinSound.volume = Math.max(0, spinSound.volume - fadeAmount);

                if (currentStep >= fadeSteps || spinSound.volume <= 0.01) {
                    clearInterval(spinSoundFadeTimer);
                    spinSound.pause();
                    spinSound.currentTime = 0;
                    spinSound.volume = 0.32;
                }
            }, 45);
        }

        function drawWheel() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 180;
            
            if (items.length === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#2c3e50';
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.fillStyle = '#ecf0f1';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Tambah item untuk mulai', centerX, centerY);
                return;
            }

            const anglePerItem = (2 * Math.PI) / items.length;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw segments starting from top (12 o'clock position)
            for (let i = 0; i < items.length; i++) {
                // Start from -PI/2 (top of circle) and go clockwise
                const startAngle = -Math.PI / 2 + (i * anglePerItem);
                const endAngle = startAngle + anglePerItem;
                
                // Draw segment
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                
                ctx.fillStyle = colors[i % colors.length];
                ctx.fill();
                
                // Add glow effect
                ctx.shadowColor = colors[i % colors.length];
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Draw border
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Draw text
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(startAngle + anglePerItem / 2);
                ctx.fillStyle = '#2c3e50';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(items[i], radius * 0.7, 5);
                ctx.restore();
            }
        }

        function spin() {
            if (isSpinning || items.length === 0) return;
            
            isSpinning = true;
            spinBtn.classList.add('spinning');
            playSpinSound();
            
            const spins = Math.random() * 10 + 10; // 10-20 spins
            const finalRotation = currentRotation + spins * 360;
            
            canvas.style.transition = 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)';
            canvas.style.transform = `rotate(${finalRotation}deg)`;
            currentRotation = finalRotation % 360;
            
            setTimeout(() => {
                stopSpinSound();

                // Calculate winning segment - pointer is at top (0 degrees)
                const normalizedRotation = ((currentRotation % 360) + 360) % 360;
                const anglePerItem = 360 / items.length;
                
                // Since pointer is at top and wheel rotates clockwise,
                // we need to find which segment is at the top position
                const topAngle = (360 - normalizedRotation) % 360;
                const winningIndex = Math.floor(topAngle / anglePerItem) % items.length;
                const winner = items[winningIndex];
                
                // Show popup result
                popupResultText.textContent = winner;
                resultPopup.classList.add('show');
                
                isSpinning = false;
                spinBtn.classList.remove('spinning');
            }, 4000);
        }

        function addItem() {
            const newItem = itemInput.value.trim();
            if (newItem && !items.includes(newItem)) {
                items.push(newItem);
                updateItemsList();
                drawWheel();
                itemInput.value = '';
            }
        }

        function removeItem(button) {
            const item = button.parentElement;
            const itemText = item.querySelector('span').textContent;
            const index = items.indexOf(itemText);
            
            if (index > -1) {
                items.splice(index, 1);
                item.remove();
                drawWheel();
            }
        }

        function updateItemsList() {
            const itemsList = document.getElementById('itemsList');
            itemsList.innerHTML = '';
            
            items.forEach(item => {
                const li = document.createElement('li');
                li.className = 'item';
                li.innerHTML = `
                    <span>${item}</span>
                    <button class="delete-btn" onclick="removeItem(this)" aria-label="Hapus item">&times;</button>
                `;
                itemsList.appendChild(li);
            });
        }

        function clearAllItems() {
            stopSpinSound();
            items = [];
            updateItemsList();
            drawWheel();
            resultPopup.classList.remove('show');
        }

        function closeResultPopup() {
            resultPopup.classList.remove('show');
        }

        // Event listeners
        spinBtn.addEventListener('click', spin);
        addBtn.addEventListener('click', addItem);
        clearBtn.addEventListener('click', clearAllItems);
        closePopup.addEventListener('click', closeResultPopup);

        // Close popup when clicking overlay
        resultPopup.addEventListener('click', (e) => {
            if (e.target.classList.contains('result-popup') || e.target.classList.contains('popup-overlay')) {
                closeResultPopup();
            }
        });

        itemInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addItem();
            }
        });

        // Initialize wheel
        drawWheel();

        document.getElementById('year').textContent = new Date().getFullYear();

        
