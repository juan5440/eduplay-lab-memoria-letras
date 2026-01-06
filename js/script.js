
        // Datos del juego
        const alphabet = [
            { letter: 'A', word: 'Abeja', emoji: '🐝' },
            { letter: 'B', word: 'Ballena', emoji: '🐋' },
            { letter: 'C', word: 'Casa', emoji: '🏠' },
            { letter: 'D', word: 'Dinosaurio', emoji: '🦕' },
            { letter: 'E', word: 'Elefante', emoji: '🐘' },
            { letter: 'F', word: 'Flor', emoji: '🌸' },
            { letter: 'G', word: 'Gato', emoji: '🐱' },
            { letter: 'H', word: 'Helado', emoji: '🍦' },
            { letter: 'I', word: 'Iguana', emoji: '🦎' },
            { letter: 'J', word: 'Jirafa', emoji: '🦒' },
            { letter: 'K', word: 'Koala', emoji: '🐨' },
            { letter: 'L', word: 'León', emoji: '🦁' },
            { letter: 'M', word: 'Mariposa', emoji: '🦋' },
            { letter: 'N', word: 'Naranja', emoji: '🍊' },
            { letter: 'Ñ', word: 'Ñandú', emoji: '🐦' },
            { letter: 'O', word: 'Oso', emoji: '🐻' },
            { letter: 'P', word: 'Perro', emoji: '🐕' },
            { letter: 'Q', word: 'Queso', emoji: '🧀' },
            { letter: 'R', word: 'Ratón', emoji: '🐭' },
            { letter: 'S', word: 'Sol', emoji: '☀️' },
            { letter: 'T', word: 'Tortuga', emoji: '🐢' },
            { letter: 'U', word: 'Uvas', emoji: '🍇' },
            { letter: 'V', word: 'Vaca', emoji: '🐄' },
            { letter: 'W', word: 'Waffle', emoji: '🧇' },
            { letter: 'X', word: 'Xilófono', emoji: '🎵' },
            { letter: 'Y', word: 'Yogur', emoji: '🥛' },
            { letter: 'Z', word: 'Zorro', emoji: '🦊' }
        ];
        
        const colors = [
            'from-red-400 to-red-500',
            'from-orange-400 to-orange-500',
            'from-yellow-400 to-yellow-500',
            'from-green-400 to-green-500',
            'from-teal-400 to-teal-500',
            'from-blue-400 to-blue-500',
            'from-indigo-400 to-indigo-500',
            'from-purple-400 to-purple-500',
            'from-pink-400 to-pink-500'
        ];
        
        let currentLetter = null;
        let findScore = 0;
        let completeScore = 0;
        let currentWordIndex = 0;
        
        // Síntesis de voz: permite especificar `lang` o `voiceName`, usa la selección UI y espera voces si es necesario
        function speak(text, options = {}) {
            if (!('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();

            const { lang = 'es-ES', voiceName = null, rate = 0.8, pitch = 1.2 } = options;

            // Priorizar voiceName pasado en options, luego selección UI, luego localStorage
            const uiVoice = (typeof document !== 'undefined' && document.getElementById('voiceSelect')) ? document.getElementById('voiceSelect').value : null;
            const savedVoice = (typeof localStorage !== 'undefined') ? localStorage.getItem('selectedVoice') : null;
            const desiredVoiceName = voiceName || uiVoice || savedVoice || null;

            const speakNow = (voices) => {
                console.debug('Voces disponibles:', voices.map(v => `${v.name} (${v.lang})`));

                let selected = null;
                if (desiredVoiceName) {
                    selected = voices.find(v => v.name === desiredVoiceName);
                }
                if (!selected) {
                    selected = voices.find(v => v.lang === lang);
                }
                if (!selected) {
                    const prefix = lang.split('-')[0];
                    selected = voices.find(v => v.lang && v.lang.startsWith(prefix));
                }
                if (!selected) {
                    selected = voices.find(v => /latino|latam|latin|mex|mx|es-419/i.test(v.name + ' ' + v.lang));
                }

                const utterance = new SpeechSynthesisUtterance(text);
                if (selected) {
                    utterance.voice = selected;
                    utterance.lang = selected.lang || lang;
                } else {
                    utterance.lang = lang;
                }
                utterance.rate = rate;
                utterance.pitch = pitch;
                window.speechSynthesis.speak(utterance);
            };

            let voices = window.speechSynthesis.getVoices();
            if (!voices || voices.length === 0) {
                const handler = () => {
                    voices = window.speechSynthesis.getVoices();
                    speakNow(voices);
                    window.speechSynthesis.onvoiceschanged = null;
                };
                window.speechSynthesis.onvoiceschanged = handler;
            } else {
                speakNow(voices);
            }
        }

        // Rellena el select con las voces disponibles y restaura la selección guardada
        function populateVoiceList() {
            if (!('speechSynthesis' in window)) return;
            const select = document.getElementById('voiceSelect');
            if (!select) return;

            const voices = window.speechSynthesis.getVoices() || [];
            select.innerHTML = '<option value="">Predeterminada</option>';
            voices.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.name;
                opt.textContent = `${v.name} (${v.lang})`;
                select.appendChild(opt);
            });

            const saved = localStorage.getItem('selectedVoice');
            if (saved) select.value = saved;

            // Actualizar etiqueta y persistir la selección
            const currentLabel = document.getElementById('currentVoiceLabel');
            const previewBtn = document.getElementById('previewVoice');

            function updateLabel() {
                const name = select.value || 'Predeterminada';
                if (currentLabel) currentLabel.textContent = name;
                // Set tooltip example phrase
                if (previewBtn) previewBtn.title = select.value ? `Ejemplo con ${name}` : 'Haz clic para escuchar ejemplo';
                localStorage.setItem('selectedVoice', select.value);
            }

            select.onchange = updateLabel;
            // Inicializar etiqueta
            updateLabel();

            // Acción del botón de vista previa
            if (previewBtn) {
                previewBtn.onclick = () => {
                    const sample = 'Hola, ¿cómo estás? Esto es una prueba de voz.';
                    const voiceName = select.value || null;
                    speak(sample, { voiceName, lang: 'es-ES', rate: 0.9, pitch: 1 });
                };
            }
        }

        // Llenar la lista al cambiar las voces y al cargar la página
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = populateVoiceList;
        }
        
        // --- Fondo personalizable ---
        function setBackgroundImage(src) {
            const bg = document.getElementById('bgLayer');
            if (!bg) return;
            if (!src) {
                bg.style.backgroundImage = '';
                localStorage.removeItem('bgImage');
                return;
            }
            bg.style.backgroundImage = `url('${src}')`;
            localStorage.setItem('bgImage', src);
        }

        function handleBgFile(e) {
            const f = e.target.files && e.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                const dataUrl = ev.target.result;
                setBackgroundImage(dataUrl);
            };
            reader.readAsDataURL(f);
        }

        function applyBgUrl() {
            const input = document.getElementById('bgUrlInput');
            if (!input) return;
            const url = input.value.trim();
            if (!url) return alert('Pega la URL de la imagen');
            setBackgroundImage(url);
        }

        function clearBackground() {
            setBackgroundImage(null);
            const input = document.getElementById('bgUrlInput');
            if (input) input.value = '';
        }

        function loadSavedBackground() {
            const saved = localStorage.getItem('bgImage');
            if (saved) {
                // establecer pero sin bloquear hasta que exista bgLayer
                const bg = document.getElementById('bgLayer');
                if (bg) bg.style.backgroundImage = `url('${saved}')`;
            }
        }

        // Conectar input de archivo
        const bgFileInput = document.getElementById('bgFileInput');
        if (bgFileInput) bgFileInput.addEventListener('change', handleBgFile);

        // Conectar controles de opacidad y blur
        const opacityRange = document.getElementById('bgOpacityRange');
        const opacityLabel = document.getElementById('bgOpacityLabel');
        const blurRange = document.getElementById('bgBlurRange');
        const blurLabel = document.getElementById('bgBlurLabel');

        function setBgOpacity(value) {
            const bg = document.getElementById('bgLayer');
            if (!bg) return;
            bg.style.opacity = String(value);
            localStorage.setItem('bgOpacity', String(value));
            if (opacityLabel) opacityLabel.textContent = `${Math.round(value * 100)}%`;
        }

        function setBgBlur(px) {
            const bg = document.getElementById('bgLayer');
            if (!bg) return;
            const blurCss = px > 0 ? `blur(${px}px)` : 'none';
            bg.style.filter = blurCss;
            localStorage.setItem('bgBlur', String(px));
            if (blurLabel) blurLabel.textContent = `${px}px`;
        }

        if (opacityRange) {
            opacityRange.addEventListener('input', (e) => setBgOpacity(parseFloat(e.target.value)));
        }
        if (blurRange) {
            blurRange.addEventListener('input', (e) => setBgBlur(parseInt(e.target.value, 10)));
        }

        // Posición / Tamaño
        const posSelect = document.getElementById('bgPositionSelect');
        const sizeSelect = document.getElementById('bgSizeSelect');

        function setBgPosition(pos) {
            const bg = document.getElementById('bgLayer');
            if (!bg) return;
            bg.style.backgroundPosition = pos;
            localStorage.setItem('bgPosition', pos);
        }

        function setBgSize(sz) {
            const bg = document.getElementById('bgLayer');
            if (!bg) return;
            bg.style.backgroundSize = sz === 'cover' ? 'cover' : 'contain';
            localStorage.setItem('bgSize', sz);
        }

        if (posSelect) {
            posSelect.addEventListener('change', (e) => setBgPosition(e.target.value));
        }
        if (sizeSelect) {
            sizeSelect.addEventListener('change', (e) => setBgSize(e.target.value));
        }

        // Cargar valores guardados de opacidad/blur/posición/tamaño (si existen)
        (function restoreBgSettings() {
            const savedOpacity = localStorage.getItem('bgOpacity');
            const savedBlur = localStorage.getItem('bgBlur');
            const savedPos = localStorage.getItem('bgPosition');
            const savedSize = localStorage.getItem('bgSize');
            if (savedOpacity !== null) {
                const v = parseFloat(savedOpacity);
                if (opacityRange) opacityRange.value = String(v);
                setBgOpacity(v);
            }
            if (savedBlur !== null) {
                const b = parseInt(savedBlur, 10);
                if (blurRange) blurRange.value = String(b);
                setBgBlur(b);
            }
            if (savedPos !== null) {
                if (posSelect) posSelect.value = savedPos;
                setBgPosition(savedPos);
            }
            if (savedSize !== null) {
                if (sizeSelect) sizeSelect.value = savedSize;
                setBgSize(savedSize);
            }
        })();


        
        // Mostrar pantallas
        function showScreen(screen) {
            const screens = ['mainMenu', 'alphabetScreen', 'findLetterScreen', 'wordsScreen', 'completeScreen'];
            screens.forEach(s => {
                document.getElementById(s).classList.add('hidden');
            });
            
            switch(screen) {
                case 'main':
                    document.getElementById('mainMenu').classList.remove('hidden');
                    break;
                case 'alphabet':
                    document.getElementById('alphabetScreen').classList.remove('hidden');
                    generateAlphabet();
                    break;
                case 'findLetter':
                    document.getElementById('findLetterScreen').classList.remove('hidden');
                    findScore = 0;
                    updateFindScore();
                    generateFindGame();
                    break;
                case 'words':
                    document.getElementById('wordsScreen').classList.remove('hidden');
                    currentWordIndex = 0;
                    showWord();
                    break;
                case 'complete':
                    document.getElementById('completeScreen').classList.remove('hidden');
                    completeScore = 0;
                    updateCompleteScore();
                    generateCompleteGame();
                    break;
            }
        }
        
        // Generar el abecedario
        function generateAlphabet() {
            const grid = document.getElementById('alphabetGrid');
            grid.innerHTML = '';
            
            alphabet.forEach((item, index) => {
                const colorIndex = index % colors.length;
                const card = document.createElement('div');
                card.className = `letter-card bg-gradient-to-br ${colors[colorIndex]} p-4 md:p-6 rounded-2xl shadow-lg text-center text-white`;
                card.innerHTML = `
                    <div class="text-4xl md:text-5xl title-font">${item.letter}</div>
                    <div class="text-2xl mt-1">${item.emoji}</div>
                `;
                card.onclick = () => openLetterModal(item);
                grid.appendChild(card);
            });
        }
        
        // Modal de letra
        function openLetterModal(item) {
            currentLetter = item;
            document.getElementById('modalLetter').textContent = item.letter;
            document.getElementById('modalLetter').style.color = getRandomColor();
            document.getElementById('modalEmoji').textContent = item.emoji;
            document.getElementById('modalWord').textContent = item.word;
            document.getElementById('letterModal').classList.remove('hidden');
            speak(`${item.letter}. ${item.letter} de ${item.word}`);
            createConfetti();
        }
        
        function closeModal() {
            document.getElementById('letterModal').classList.add('hidden');
        }
        
        function speakLetter() {
            if (currentLetter) {
                speak(`${currentLetter.letter}. ${currentLetter.letter} de ${currentLetter.word}`);
            }
        }
        
        // Juego Encuentra la Letra
        function generateFindGame() {
            const target = alphabet[Math.floor(Math.random() * alphabet.length)];
            document.getElementById('targetLetter').textContent = target.letter;
            
            let options = [target];
            while (options.length < 6) {
                const random = alphabet[Math.floor(Math.random() * alphabet.length)];
                if (!options.find(o => o.letter === random.letter)) {
                    options.push(random);
                }
            }
            
            options = shuffleArray(options);
            
            const optionsContainer = document.getElementById('letterOptions');
            optionsContainer.innerHTML = '';
            
            options.forEach((item, index) => {
                const btn = document.createElement('button');
                btn.className = `game-btn bg-gradient-to-br ${colors[index % colors.length]} p-6 rounded-2xl text-white text-4xl md:text-5xl title-font shadow-lg`;
                btn.textContent = item.letter;
                btn.onclick = () => checkFindAnswer(item.letter, target.letter);
                optionsContainer.appendChild(btn);
            });
            
            document.getElementById('findFeedback').classList.add('hidden');
            speak(`Encuentra la letra ${target.letter}`);
        }
        
        function checkFindAnswer(selected, correct) {
            const feedback = document.getElementById('findFeedback');
            feedback.classList.remove('hidden');
            
            if (selected === correct) {
                feedback.textContent = '¡Muy bien! 🎉⭐';
                feedback.className = 'mt-6 text-3xl text-green-600 animate-celebrate';
                findScore += 10;
                updateFindScore();
                speak('¡Muy bien! ¡Excelente!');
                createStars();
                setTimeout(generateFindGame, 1500);
            } else {
                feedback.textContent = '¡Inténtalo de nuevo! 💪';
                feedback.className = 'mt-6 text-3xl text-orange-500';
                speak('Inténtalo de nuevo');
            }
        }
        
        function updateFindScore() {
            document.getElementById('findScore').textContent = findScore;
        }
        
        // Juego Aprende Palabras
        function showWord() {
            const item = alphabet[currentWordIndex];
            document.getElementById('wordEmoji').textContent = item.emoji;
            document.getElementById('wordText').textContent = item.word;
            
            const display = document.getElementById('wordDisplay');
            display.innerHTML = '';
            
            item.word.toUpperCase().split('').forEach((letter, index) => {
                const letterBox = document.createElement('div');
                letterBox.className = `bg-gradient-to-br ${colors[index % colors.length]} text-white text-3xl md:text-5xl title-font p-3 md:p-4 rounded-xl shadow-lg animate-pop`;
                letterBox.style.animationDelay = `${index * 0.1}s`;
                letterBox.textContent = letter;
                display.appendChild(letterBox);
            });
            
            speak(item.word);
        }
        
        function speakWord() {
            const item = alphabet[currentWordIndex];
            speak(item.word);
        }
        
        function nextWord() {
            currentWordIndex = (currentWordIndex + 1) % alphabet.length;
            showWord();
        }
        
        // Juego Completa la Palabra
        function generateCompleteGame() {
            const item = alphabet[Math.floor(Math.random() * alphabet.length)];
            const word = item.word.toUpperCase();
            const missingIndex = Math.floor(Math.random() * word.length);
            const missingLetter = word[missingIndex];
            
            document.getElementById('completeEmoji').textContent = item.emoji;
            
            const display = document.getElementById('completeWordDisplay');
            display.innerHTML = '';
            
            word.split('').forEach((letter, index) => {
                const letterBox = document.createElement('div');
                if (index === missingIndex) {
                    letterBox.className = 'bg-gray-300 text-gray-400 text-4xl md:text-6xl title-font p-3 md:p-5 rounded-xl shadow-lg border-4 border-dashed border-purple-400';
                    letterBox.textContent = '?';
                    letterBox.id = 'missingBox';
                } else {
                    letterBox.className = `bg-gradient-to-br ${colors[index % colors.length]} text-white text-4xl md:text-6xl title-font p-3 md:p-5 rounded-xl shadow-lg`;
                    letterBox.textContent = letter;
                }
                display.appendChild(letterBox);
            });
            
            // Generar opciones
            let options = [missingLetter];
            while (options.length < 4) {
                const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)].letter;
                if (!options.includes(randomLetter)) {
                    options.push(randomLetter);
                }
            }
            options = shuffleArray(options);
            
            const optionsContainer = document.getElementById('completeOptions');
            optionsContainer.innerHTML = '';
            
            options.forEach((letter, index) => {
                const btn = document.createElement('button');
                btn.className = `game-btn bg-gradient-to-br ${colors[index % colors.length]} px-8 py-6 rounded-2xl text-white text-4xl title-font shadow-lg`;
                btn.textContent = letter;
                btn.onclick = () => checkCompleteAnswer(letter, missingLetter, item.word);
                optionsContainer.appendChild(btn);
            });
            
            document.getElementById('completeFeedback').classList.add('hidden');
            speak(`Completa la palabra. ¿Qué letra falta en ${item.word}?`);
        }
        
        function checkCompleteAnswer(selected, correct, word) {
            const feedback = document.getElementById('completeFeedback');
            feedback.classList.remove('hidden');
            
            if (selected === correct) {
                feedback.textContent = '¡Excelente! 🌟🎊';
                feedback.className = 'mt-6 text-3xl text-green-600 animate-celebrate';
                completeScore += 10;
                updateCompleteScore();
                
                // Actualizar la casilla faltante
                const missingBox = document.getElementById('missingBox');
                missingBox.textContent = correct;
                missingBox.className = 'bg-gradient-to-br from-green-400 to-green-500 text-white text-4xl md:text-6xl title-font p-3 md:p-5 rounded-xl shadow-lg animate-celebrate';
                
                speak(`¡Muy bien! ${word}`);
                createStars();
                setTimeout(generateCompleteGame, 2000);
            } else {
                feedback.textContent = '¡Casi! Intenta otra vez 🤔';
                feedback.className = 'mt-6 text-3xl text-orange-500';
                speak('Intenta otra vez');
            }
        }
        
        function updateCompleteScore() {
            document.getElementById('completeScore').textContent = completeScore;
        }
        
        // Utilidades
        function shuffleArray(array) {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        }
        
        function getRandomColor() {
            const colorsList = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];
            return colorsList[Math.floor(Math.random() * colorsList.length)];
        }
        
        // Efectos visuales
        function createStars() {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    const star = document.createElement('div');
                    star.className = 'star';
                    star.textContent = '⭐';
                    star.style.left = Math.random() * window.innerWidth + 'px';
                    star.style.top = Math.random() * window.innerHeight + 'px';
                    star.style.fontSize = (Math.random() * 30 + 20) + 'px';
                    star.style.animation = 'sparkle 1s ease-out forwards';
                    document.body.appendChild(star);
                    
                    setTimeout(() => star.remove(), 1000);
                }, i * 100);
            }
        }
        
        function createConfetti() {
            const emojis = ['🎉', '🎊', '✨', '🌟', '💫', '🎈'];
            for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.className = 'confetti';
                    confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                    confetti.style.left = Math.random() * window.innerWidth + 'px';
                    confetti.style.top = '-50px';
                    confetti.style.fontSize = (Math.random() * 25 + 15) + 'px';
                    confetti.style.transition = 'all 2s ease-out';
                    document.body.appendChild(confetti);
                    
                    setTimeout(() => {
                        confetti.style.top = window.innerHeight + 50 + 'px';
                        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                    }, 10);
                    
                    setTimeout(() => confetti.remove(), 2000);
                }, i * 50);
            }
        }
        
        // Cerrar modal con click fuera
        document.getElementById('letterModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            // Mensaje de bienvenida
            setTimeout(() => {
                speak('¡Bienvenido! Vamos a aprender las letras jugando');
            }, 500);
            // Cargar voces y fondo guardado
            if (typeof populateVoiceList === 'function') populateVoiceList();
            loadSavedBackground();
        });
   