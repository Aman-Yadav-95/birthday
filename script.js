(() => {
    const body = document.body;
    const intro = document.getElementById("cinematicIntro");
    const introContinue = document.getElementById("introContinue");
    const nightSky = document.getElementById("nightSky");
    const canvas = document.getElementById("fireworkCanvas");
    const context = canvas.getContext("2d");

    const scenes = Array.from(document.querySelectorAll(".scene"));
    const music = document.getElementById("birthdayMusic");
    const musicToggle = document.getElementById("musicToggle");
    const progressNumber = document.getElementById("progressNumber");
    const progressFill = document.getElementById("progressFill");
    const nextHint = document.getElementById("nextHint");

    const cakeScene = document.querySelector(".scene-one");
    const cakeHint = document.getElementById("cakeHint");

    const huntHeart = document.getElementById("huntHeart");
    const huntCopy = document.getElementById("huntCopy");
    const huntIndicators = Array.from(
        document.querySelectorAll("#huntCount span")
    );

    const giftScene = document.querySelector(".gift-scene");
    const giftStage = document.getElementById("giftStage");
    const giftContinue = document.getElementById("giftContinue");

    const envelopeStage = document.getElementById("envelopeStage");
    const letterTyped = document.getElementById("letterTyped");
    const letterPrompt = document.getElementById("letterPrompt");
    const letterContinue = document.getElementById("letterContinue");

    const heartReveal =
        document.getElementById("heartReveal");

    const countdownScene =
        document.querySelector(".countdown-scene");
    const countdownNumber =
        document.getElementById("countdownNumber");
    const countdownHint =
        document.getElementById("countdownHint");

    const playfulScene =
        document.querySelector(".playful-scene");
    const playfulButton =
        document.getElementById("playfulButton");

    const finalScene =
        document.querySelector(".final-scene");

    const colors = [
        "#ffb7d4",
        "#ffd58f",
        "#b9dcff",
        "#d5baff",
        "#aaf2dd",
        "#ffe8b5",
        "#ffaec1"
    ];

    const shapeNames = [
        "circle",
        "star",
        "heart",
        "burst",
        "ring"
    ];

    const rockets = [];
    const particles = [];
    const shockwaves = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    let pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        1.5
    );

    let currentScene = 0;
    let changingScene = false;
    let introDone = false;
    let candlesBlown = false;
    let huntHits = 0;

    let giftStarted = false;
    let giftOpened = false;

    let letterOpened = false;
    let letterFinished = false;

    let heartRevealFinished = false;
    let countdownFinished = false;
    let playfulRevealed = false;

    let musicEnabled = false;
    let musicRequest = 0;

    let animationFrame = 0;
    let canvasRunning = false;
    let lastFrame = 0;

    let introTimers = [];
    let sceneTimers = [];
    let finaleTimers = [];

    let finaleGlyphs = [];

    heartReveal.addEventListener(
        "animationend",
        (event) => {
            if (event.animationName === "heart-reveal-in") {
                heartRevealFinished = true;
            }
        }
    );
    let finaleGlyphStarted = 0;


    /* =========================
       MUSIC
    ========================= */

    function updateMusicButton() {
        musicToggle.textContent = musicEnabled
            ? "♫ Music: On"
            : "♫ Music: Off";

        musicToggle.setAttribute(
            "aria-pressed",
            String(musicEnabled)
        );

        musicToggle.setAttribute(
            "aria-label",
            musicEnabled
                ? "Turn birthday music off"
                : "Turn birthday music on"
        );
    }


    async function startMusic() {
        if (musicEnabled) return;

        const request = ++musicRequest;

        try {
            await music.play();

            if (request !== musicRequest) return;

            musicEnabled = true;
            updateMusicButton();

        } catch {
            musicEnabled = false;
            updateMusicButton();
        }
    }


    function stopMusic() {
        musicRequest++;

        music.pause();
        musicEnabled = false;

        updateMusicButton();
    }


    musicToggle.addEventListener("click", (event) => {
        event.stopPropagation();

        if (musicEnabled) {
            stopMusic();
        } else {
            startMusic();
        }
    });


    /* =========================
       STARS
    ========================= */

    function addStars() {
        const fragment = document.createDocumentFragment();

        // Reduced from 115 to 70
        for (let index = 0; index < 70; index++) {

            const star = document.createElement("i");

            star.className = "night-star";

            star.style.setProperty(
                "--x",
                `${Math.random() * 100}%`
            );

            star.style.setProperty(
                "--y",
                `${Math.random() * 100}%`
            );

            star.style.setProperty(
                "--size",
                `${1 + Math.random() * 2}px`
            );

            star.style.setProperty(
                "--twinkle",
                `${2.4 + Math.random() * 4.5}s`
            );

            star.style.setProperty(
                "--delay",
                `${Math.random() * 5}s`
            );

            fragment.append(star);
        }

        nightSky.append(fragment);
    }


    /* =========================
       CANVAS
    ========================= */

    function resizeCanvas() {

        width = window.innerWidth;
        height = window.innerHeight;

        pixelRatio = Math.min(
            window.devicePixelRatio || 1,
            1.5
        );

        canvas.width = Math.round(
            width * pixelRatio
        );

        canvas.height = Math.round(
            height * pixelRatio
        );

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );

    }


    function startCanvasAnimation() {

        if (canvasRunning) return;

        canvasRunning = true;
        lastFrame = 0;

        animationFrame =
            requestAnimationFrame(animate);
    }


    function heartPoint(angle) {

        const x =
            16 * Math.pow(Math.sin(angle), 3);

        const y =
            13 * Math.cos(angle)
            - 5 * Math.cos(2 * angle)
            - 2 * Math.cos(3 * angle)
            - Math.cos(4 * angle);

        return {
            x: x / 16,
            y: -y / 16
        };
    }


    /* =========================
       FIREWORK
    ========================= */

    function launchFirework(
        targetX,
        targetY,
        large = false,
        forcedShape = null
    ) {

        const safeX =
            Math.max(
                0,
                Math.min(width, targetX)
            );

        const safeY =
            Math.max(
                0,
                Math.min(height, targetY)
            );

        const offset =
            (Math.random() - 0.5)
            * Math.min(120, width * 0.18);

        const color =
            colors[
                Math.floor(
                    Math.random() * colors.length
                )
            ];

        const shape =
            forcedShape ||
            (
                large
                    ? shapeNames[
                        Math.floor(
                            Math.random()
                            * shapeNames.length
                        )
                    ]
                    : (
                        Math.random() < 0.35
                            ? "circle"
                            : shapeNames[
                                Math.floor(
                                    Math.random()
                                    * shapeNames.length
                                )
                            ]
                    )
            );

        rockets.push({

            x: safeX + offset,

            y: height + 12,

            startX: safeX + offset,

            startY: height + 12,

            targetX: safeX,

            targetY: safeY,

            color,

            shape,

            size:
                (large ? 4.5 : 2.6)
                + Math.random() * 2,

            progress: 0,

            duration:
                0.48 + Math.random() * 0.25,

            trail: []
        });


        // Maximum 12 rockets
        if (rockets.length > 12) {
            rockets.shift();
        }

        startCanvasAnimation();
    }


    function createExplosion(rocket) {

        // Reduced particle count
        const count =
            rocket.shape === "heart"
                ? 32
                : 48;

        const spread =
            rocket.shape === "ring"
                ? 3
                : 2.25;


        shockwaves.push({

            x: rocket.targetX,

            y: rocket.targetY,

            radius: 5,

            alpha: 0.72,

            color: rocket.color
        });


        for (
            let index = 0;
            index < count;
            index++
        ) {

            let angle;
            let speed;


            if (rocket.shape === "heart") {

                const point =
                    heartPoint(
                        (Math.PI * 2 * index)
                        / count
                    );

                angle =
                    Math.atan2(
                        point.y,
                        point.x
                    );

                speed =
                    Math.hypot(
                        point.x,
                        point.y
                    )
                    * spread
                    * (0.68 + Math.random() * 0.3);

            } else if (rocket.shape === "star") {

                const pointIndex =
                    index % 10;

                angle =
                    (Math.PI * 2 * pointIndex)
                    / 10
                    + Math.random() * 0.12;

                speed =
                    (
                        pointIndex % 2 === 0
                            ? spread
                            : spread * 0.45
                    )
                    * (
                        0.72
                        + Math.random() * 0.44
                    );

            } else if (rocket.shape === "ring") {

                angle =
                    (Math.PI * 2 * index)
                    / count
                    + (Math.random() - 0.5) * 0.08;

                speed =
                    spread
                    * (
                        0.9
                        + Math.random() * 0.14
                    );

            } else if (rocket.shape === "burst") {

                angle =
                    Math.random()
                    * Math.PI
                    * 2;

                speed =
                    Math.random() < 0.28
                        ? spread
                            * (1.35 + Math.random() * 0.5)
                        : spread
                            * (0.55 + Math.random() * 0.65);

            } else {

                angle =
                    (Math.PI * 2 * index)
                    / count
                    + (Math.random() - 0.5) * 0.15;

                speed =
                    spread
                    * (
                        0.55
                        + Math.random() * 0.8
                    );
            }


            const velocity =
                speed * (rocket.size / 3);


            particles.push({

                x: rocket.targetX,

                y: rocket.targetY,

                vx:
                    Math.cos(angle)
                    * velocity,

                vy:
                    Math.sin(angle)
                    * velocity,

                color:
                    Math.random() < 0.18
                        ? "#fff9ec"
                        : rocket.color,

                alpha: 1,

                radius:
                    1 + Math.random() * 1.5,

                gravity:
                    0.045
                    + Math.random() * 0.035,

                decay:
                    0.006
                    + Math.random() * 0.008,

                drag:
                    0.985
                    + Math.random() * 0.009
            });
        }


        // Hard limit particles
        if (particles.length > 900) {

            particles.splice(
                0,
                particles.length - 700
            );
        }
    }


    /* =========================
       DRAW FIREWORKS
    ========================= */

    function drawFireworks(delta) {

        context.clearRect(
            0,
            0,
            width,
            height
        );

        context.globalCompositeOperation =
            "lighter";


        /* ROCKETS */

        for (
            let index = rockets.length - 1;
            index >= 0;
            index--
        ) {

            const rocket = rockets[index];

            rocket.progress +=
                delta / rocket.duration;

            const progress =
                Math.min(
                    rocket.progress,
                    1
                );

            const eased =
                1 - Math.pow(
                    1 - progress,
                    2
                );


            rocket.x =
                rocket.startX
                + (
                    rocket.targetX
                    - rocket.startX
                ) * eased;

            rocket.y =
                rocket.startY
                + (
                    rocket.targetY
                    - rocket.startY
                ) * eased;


            rocket.trail.push({
                x: rocket.x,
                y: rocket.y
            });


            if (rocket.trail.length > 6) {
                rocket.trail.shift();
            }


            for (
                let trailIndex = 0;
                trailIndex < rocket.trail.length;
                trailIndex++
            ) {

                const point =
                    rocket.trail[trailIndex];

                context.globalAlpha =
                    (
                        trailIndex
                        / rocket.trail.length
                    ) * 0.65;

                context.fillStyle =
                    rocket.color;

                context.beginPath();

                context.arc(
                    point.x,
                    point.y,
                    rocket.size
                    * (
                        trailIndex
                        / rocket.trail.length
                    ),
                    0,
                    Math.PI * 2
                );

                context.fill();
            }


            context.globalAlpha = 1;

            context.fillStyle =
                "#fff9ef";

            context.beginPath();

            context.arc(
                rocket.x,
                rocket.y,
                rocket.size,
                0,
                Math.PI * 2
            );

            context.fill();


            if (progress >= 1) {

                createExplosion(rocket);

                rockets.splice(
                    index,
                    1
                );
            }
        }


        /* SHOCKWAVES */

        for (
            let index = shockwaves.length - 1;
            index >= 0;
            index--
        ) {

            const wave =
                shockwaves[index];

            wave.radius += 2.6;
            wave.alpha -= 0.022;

            context.globalAlpha =
                Math.max(
                    0,
                    wave.alpha
                );

            context.strokeStyle =
                wave.color;

            context.lineWidth = 2;

            context.beginPath();

            context.arc(
                wave.x,
                wave.y,
                wave.radius,
                0,
                Math.PI * 2
            );

            context.stroke();


            if (wave.alpha <= 0) {
                shockwaves.splice(
                    index,
                    1
                );
            }
        }


        /* PARTICLES */

        for (
            let index = particles.length - 1;
            index >= 0;
            index--
        ) {

            const particle =
                particles[index];


            particle.x += particle.vx;
            particle.y += particle.vy;

            particle.vx *= particle.drag;

            particle.vy =
                particle.vy
                * particle.drag
                + particle.gravity;

            particle.alpha -=
                particle.decay
                * delta
                * 60;


            context.globalAlpha =
                Math.max(
                    0,
                    particle.alpha
                );

            context.fillStyle =
                particle.color;

            context.beginPath();

            context.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2
            );

            context.fill();


            if (particle.alpha <= 0) {

                particles.splice(
                    index,
                    1
                );
            }
        }


        drawFinaleGlyphs(
            performance.now()
        );


        context.globalAlpha = 1;

        context.globalCompositeOperation =
            "source-over";
    }


    /* =========================
       FINALE TEXT
    ========================= */

    function drawFinaleGlyphs(timestamp) {

        if (!finaleGlyphs.length) {
            return;
        }

        const elapsed =
            timestamp - finaleGlyphStarted;

        const gather =
            Math.min(
                1,
                elapsed / 1200
            );

        const dissolve =
            elapsed < 3000
                ? 1
                : Math.max(
                    0,
                    1 -
                    (elapsed - 3000) / 1300
                );

        const ease =
            1 - Math.pow(
                1 - gather,
                3
            );


        context.globalAlpha =
            dissolve;

        context.fillStyle =
            "#fff0fa";


        for (
            const dot of finaleGlyphs
        ) {

            const x =
                dot.startX
                + (
                    dot.x
                    - dot.startX
                ) * ease;

            const y =
                dot.startY
                + (
                    dot.y
                    - dot.startY
                ) * ease;


            context.beginPath();

            context.arc(
                x,
                y,
                dot.radius,
                0,
                Math.PI * 2
            );

            context.fill();
        }


        context.globalAlpha = 1;


        if (elapsed >= 4400) {
            finaleGlyphs = [];
        }
    }


    function gatherFinaleText() {

        const source =
            document.createElement("canvas");

        const sourceContext =
            source.getContext("2d");

        if (!sourceContext) return;


        source.width =
            Math.min(
                760,
                Math.floor(width * 0.9)
            );

        source.height = 125;


        sourceContext.clearRect(
            0,
            0,
            source.width,
            source.height
        );

        sourceContext.fillStyle = "#fff";

        sourceContext.textAlign =
            "center";

        sourceContext.textBaseline =
            "middle";

        sourceContext.font =
            `600 ${Math.max(
                42,
                Math.min(86, width / 8)
            )}px Georgia, serif`;


        sourceContext.fillText(
            "POOJA ♥",
            source.width / 2,
            source.height / 2
        );


        const image =
            sourceContext.getImageData(
                0,
                0,
                source.width,
                source.height
            );


        const stride =
            width < 600 ? 5 : 4;

        const offsetX =
            (width - source.width) / 2;

        const offsetY =
            height * 0.72
            - source.height / 2;

        const sampled = [];


        for (
            let y = 0;
            y < source.height;
            y += stride
        ) {

            for (
                let x = 0;
                x < source.width;
                x += stride
            ) {

                const alpha =
                    image.data[
                        (y * source.width + x)
                        * 4 + 3
                    ];


                if (alpha > 100) {

                    sampled.push({
                        x: offsetX + x,
                        y: offsetY + y
                    });
                }
            }
        }


        const maximum = 500;

        const step =
            Math.max(
                1,
                Math.ceil(
                    sampled.length / maximum
                )
            );


        finaleGlyphs =
            sampled
                .filter(
                    (_, index) =>
                        index % step === 0
                )
                .map((point) => ({
                    ...point,
                    startX:
                        Math.random() * width,
                    startY:
                        Math.random() * height,
                    radius:
                        1 + Math.random() * 1.35
                }));


        finaleGlyphStarted =
            performance.now();

        startCanvasAnimation();
    }


    /* =========================
       ANIMATION LOOP
    ========================= */

    function animate(timestamp) {

        const delta =
            Math.min(
                (
                    timestamp
                    - (lastFrame || timestamp)
                ) / 1000,
                0.04
            );

        lastFrame = timestamp;


        if (
            rockets.length ||
            particles.length ||
            shockwaves.length ||
            finaleGlyphs.length
        ) {

            drawFireworks(delta);

            animationFrame =
                requestAnimationFrame(
                    animate
                );

        } else {

            context.clearRect(
                0,
                0,
                width,
                height
            );

            canvasRunning = false;
            animationFrame = 0;
        }
    }


    /* =========================
       INTRO FIREWORKS
    ========================= */

    function scheduleIntroFireworks() {

        introTimers.push(
            setTimeout(
                () =>
                    launchFirework(
                        width * 0.24,
                        height * 0.36
                    ),
                1150
            )
        );

        introTimers.push(
            setTimeout(
                () =>
                    launchFirework(
                        width * 0.77,
                        height * 0.31
                    ),
                1900
            )
        );

        introTimers.push(
            setTimeout(
                () =>
                    launchFirework(
                        width * 0.52,
                        height * 0.24,
                        true
                    ),
                2750
            )
        );

        introTimers.push(
            setTimeout(
                () =>
                    launchFirework(
                        width * 0.39,
                        height * 0.26
                    ),
                4250
            )
        );

        introTimers.push(
            setTimeout(
                () =>
                    launchFirework(
                        width * 0.67,
                        height * 0.29,
                        true
                    ),
                5950
            )
        );

        introTimers.push(
            setTimeout(
                () =>
                    launchFirework(
                        width * 0.52,
                        height * 0.2,
                        true
                    ),
                8250
            )
        );
    }


    /* =========================
       CONFETTI
    ========================= */

    function addConfetti(
        scene = finalScene
    ) {

        scene
            .querySelectorAll(".confetti")
            .forEach(
                piece => piece.remove()
            );


        const palette = [
            "#f0a5bd",
            "#f7c7d5",
            "#e8a9d1",
            "#f6d8a8",
            "#cdb8e8",
            "#fff"
        ];


        // Reduced from 48 to 30
        for (
            let index = 0;
            index < 30;
            index++
        ) {

            const piece =
                document.createElement("span");

            piece.className =
                "confetti";

            piece.setAttribute(
                "aria-hidden",
                "true"
            );

            piece.style.setProperty(
                "--left",
                `${Math.random() * 100}%`
            );

            piece.style.setProperty(
                "--width",
                `${5 + Math.random() * 7}px`
            );

            piece.style.setProperty(
                "--height",
                `${8 + Math.random() * 12}px`
            );

            piece.style.setProperty(
                "--delay",
                `${Math.random() * 4}s`
            );

            piece.style.setProperty(
                "--fall",
                `${3.5 + Math.random() * 4}s`
            );

            piece.style.setProperty(
                "--sway",
                `${Math.round(
                    Math.random() * 120 - 60
                )}px`
            );

            piece.style.setProperty(
                "--confetti-color",
                palette[
                    Math.floor(
                        Math.random()
                        * palette.length
                    )
                ]
            );

            scene.append(piece);
        }
    }


    /* =========================
       SMALL SPARKLES
    ========================= */

    function sprinkleAt(
        x,
        y,
        amount = 6
    ) {

        const glyphs = [
            "♥",
            "♡",
            "✦",
            "✧",
            "·"
        ];


        for (
            let index = 0;
            index < amount;
            index++
        ) {

            const spark =
                document.createElement("span");

            spark.className =
                "scene-transition-spark";

            spark.setAttribute(
                "aria-hidden",
                "true"
            );

            spark.textContent =
                glyphs[
                    Math.floor(
                        Math.random()
                        * glyphs.length
                    )
                ];


            spark.style.setProperty(
                "--x",
                `${x}px`
            );

            spark.style.setProperty(
                "--y",
                `${y}px`
            );

            spark.style.setProperty(
                "--dx",
                `${Math.round(
                    Math.random() * 100 - 50
                )}px`
            );

            spark.style.setProperty(
                "--dy",
                `${Math.round(
                    Math.random() * 100 - 55
                )}px`
            );

            spark.style.setProperty(
                "--size",
                `${12 + Math.random() * 13}px`
            );


            document.body.append(spark);


            spark.addEventListener(
                "animationend",
                () => spark.remove(),
                { once: true }
            );
        }
    }


    function heartBurst(
        x,
        y,
        amount = 24
    ) {

        sprinkleAt(
            x,
            y,
            amount
        );

        launchFirework(
            x,
            y,
            true,
            "heart"
        );
    }


    /* =========================
       HEART HUNT
    ========================= */

    function moveHuntHeart() {

        const left =
            12 + Math.random() * 76;

        const top =
            29 + Math.random() * 53;

        huntHeart.style.left =
            `${left}%`;

        huntHeart.style.top =
            `${top}%`;
    }


    function catchHuntHeart() {

        if (huntHits >= 3) return;

        huntHits++;


        const bounds =
            huntHeart.getBoundingClientRect();


        heartBurst(
            bounds.left + bounds.width / 2,
            bounds.top + bounds.height / 2,
            24
        );


        huntIndicators[
            huntHits - 1
        ].classList.add("is-found");


        document
            .getElementById("huntCount")
            .setAttribute(
                "aria-label",
                `Hearts found: ${huntHits} of 3`
            );


        if (huntHits === 3) {

            huntHeart.hidden = true;

            huntCopy.textContent =
                "You found every little heart. Your next surprise is ready! ✨";

            return;
        }


        huntCopy.textContent =
            `${3 - huntHits} more little ${
                3 - huntHits === 1
                    ? "heart"
                    : "hearts"
            } to find...`;


        moveHuntHeart();
    }


    /* =========================
       GIFT
    ========================= */

    function openGift() {

        if (giftStarted) return;

        giftStarted = true;

        giftStage.classList.add(
            "is-opening"
        );


        const bounds =
            giftStage.getBoundingClientRect();


        heartBurst(
            bounds.left + bounds.width / 2,
            bounds.top + bounds.height / 2,
            28
        );


        setTimeout(() => {

            giftOpened = true;

            giftScene.classList.add(
                "is-open"
            );

            giftContinue.classList.add(
                "is-visible"
            );

            document.getElementById(
                "giftPrompt"
            ).textContent =
                "A little something, wrapped up with love.";

        }, 650);
    }


    /* =========================
       LETTER
    ========================= */

    function openLetter() {

        if (letterOpened) return;

        letterOpened = true;

        envelopeStage.classList.add(
            "is-open"
        );

        letterPrompt.textContent =
            "A note from the heart...";


        const bounds =
            envelopeStage.getBoundingClientRect();


        sprinkleAt(
            bounds.left + bounds.width / 2,
            bounds.top + bounds.height / 2,
            18
        );


        const message =
            "tumsa koi pyara koi,\nmasum nhi hai \ntum cheez kya ho\n khud tumhe malum nhi hai. ❤️";

        let character = 0;


        function typeNext() {

            if (character >= message.length) {

                letterFinished = true;

                letterTyped.classList.remove(
                    "typing-caret"
                );

                letterPrompt.textContent =
                    "Keep this little note close to your heart.";

                letterContinue.classList.add(
                    "is-visible"
                );

                return;
            }


            letterTyped.textContent +=
                message[character];

            character++;


            sceneTimers.push(
                setTimeout(
                    typeNext,
                    message[
                        character - 1
                    ] === "\n"
                        ? 340
                        : 44
                )
            );
        }


        sceneTimers.push(
            setTimeout(
                typeNext,
                1050
            )
        );
    }


    /* =========================
       COUNTDOWN
    ========================= */

    function beginCountdown() {

        if (
            countdownScene.dataset.started ===
            "true"
        ) {
            return;
        }


        countdownScene.dataset.started =
            "true";


        [0, 1, 2].forEach(
            (step) => {

                sceneTimers.push(
                    setTimeout(
                        () => {

                            countdownNumber.textContent =
                                String(3 - step);

                            countdownNumber.classList.remove(
                                "is-counting"
                            );

                            void countdownNumber.offsetWidth;

                            countdownNumber.classList.add(
                                "is-counting"
                            );

                        },
                        step * 950
                    )
                );
            }
        );


        sceneTimers.push(
            setTimeout(
                () => {

                    countdownScene.classList.add(
                        "is-celebrating"
                    );

                    countdownHint.textContent =
                        "This whole day belongs to you, Pooja!";

                    countdownFinished = true;

                    addConfetti(
                        countdownScene
                    );


                    [
                        [
                            width * 0.2,
                            height * 0.4,
                            "star"
                        ],
                        [
                            width * 0.5,
                            height * 0.28,
                            "heart"
                        ],
                        [
                            width * 0.8,
                            height * 0.4,
                            "circle"
                        ],
                        [
                            width * 0.35,
                            height * 0.3,
                            "burst"
                        ],
                        [
                            width * 0.68,
                            height * 0.3,
                            "ring"
                        ]
                    ].forEach(
                        ([x, y, shape]) =>
                            launchFirework(
                                x,
                                y,
                                true,
                                shape
                            )
                    );


                    heartBurst(
                        width / 2,
                        height / 2,
                        28
                    );

                },
                3100
            )
        );
    }


    /* =========================
       PLAYFUL BUTTON
    ========================= */

    function revealPlayfulButton() {

        if (playfulRevealed) return;

        playfulRevealed = true;


        const bounds =
            playfulButton.getBoundingClientRect();


        playfulButton.classList.add(
            "is-vanishing"
        );

        playfulScene.classList.add(
            "is-revealed"
        );


        heartBurst(
            bounds.left + bounds.width / 2,
            bounds.top + bounds.height / 2,
            30
        );


        setTimeout(() => {

            playfulButton.hidden = true;

        }, 420);
    }


    /* =========================
       PHOTO LIGHTBOX
    ========================= */

    function openPhoto(photo) {

        if (
            document.querySelector(
                ".photo-lightbox"
            )
        ) {
            return;
        }


        const overlay =
            document.createElement("div");

        overlay.className =
            "photo-lightbox";

        overlay.setAttribute(
            "role",
            "dialog"
        );

        overlay.setAttribute(
            "aria-modal",
            "true"
        );

        overlay.setAttribute(
            "aria-label",
            photo.alt ||
            "Birthday memory"
        );


        const enlarged =
            document.createElement("img");

        enlarged.src =
            photo.currentSrc ||
            photo.src;

        enlarged.alt =
            photo.alt;


        overlay.append(enlarged);


        overlay.addEventListener(
            "click",
            () => overlay.remove(),
            { once: true }
        );


        document.body.append(overlay);
    }


    /* =========================
       FINAL SCENE
    ========================= */

    function startFinale() {

        if (
            finalScene.dataset.started ===
            "true"
        ) {
            return;
        }


        finalScene.dataset.started =
            "true";


        body.classList.add(
            "final-fireworks"
        );


        addConfetti(
            finalScene
        );


        setTimeout(() => {

            const shapes = [
                "heart",
                "star",
                "circle",
                "ring",
                "burst",
                "heart",
                "star",
                "circle",
                "burst"
            ];


            shapes.forEach(
                (shape, index) => {

                    const angle =
                        Math.PI * 2
                        * index
                        / shapes.length;


                    const x =
                        width / 2
                        + Math.cos(angle)
                        * width * 0.34;


                    const y =
                        height * 0.42
                        + Math.sin(angle)
                        * height * 0.31;


                    setTimeout(
                        () =>
                            launchFirework(
                                x,
                                y,
                                true,
                                shape
                            ),
                        index * 210
                    );
                }
            );

        }, 1700);


        finaleTimers.push(
            setTimeout(
                () => {

                    launchFirework(
                        width * 0.25,
                        height * 0.3,
                        true,
                        "heart"
                    );

                    launchFirework(
                        width * 0.75,
                        height * 0.3,
                        true,
                        "star"
                    );

                    launchFirework(
                        width * 0.5,
                        height * 0.18,
                        true,
                        "circle"
                    );

                },
                3900
            )
        );


        finaleTimers.push(
            setTimeout(
                gatherFinaleText,
                6200
            )
        );
    }


    /* =========================
       BLOW CANDLES
    ========================= */

    function blowOutCandles() {

        if (candlesBlown) return;

        candlesBlown = true;

        cakeScene.classList.add(
            "candles-out"
        );


        cakeScene
            .querySelectorAll(".candle")
            .forEach(
                (candle, index) => {

                    setTimeout(
                        () =>
                            candle.classList.add(
                                "is-blown"
                            ),
                        index * 130
                    );
                }
            );


        cakeHint.textContent =
            "Your wish is on its way";


        const symbols = [
            "✦",
            "♥",
            "✧",
            "♡",
            "✦",
            "♥",
            "✧",
            "♡"
        ];


        const rect =
            cakeScene
                .querySelector(".cake-wrap")
                .getBoundingClientRect();


        symbols.forEach(
            (symbol) => {

                const particle =
                    document.createElement("span");

                particle.className =
                    "cake-confetti";

                particle.textContent =
                    symbol;


                particle.style.setProperty(
                    "--particle-color",
                    colors[
                        Math.floor(
                            Math.random()
                            * colors.length
                        )
                    ]
                );


                particle.style.setProperty(
                    "--dx",
                    `${Math.round(
                        Math.random() * 260 - 130
                    )}px`
                );


                particle.style.setProperty(
                    "--dy",
                    `${Math.round(
                        Math.random() * 210 - 120
                    )}px`
                );


                particle.style.left =
                    `${rect.left + rect.width / 2}px`;

                particle.style.top =
                    `${rect.top + rect.height * 0.48}px`;


                document.body.append(
                    particle
                );


                particle.addEventListener(
                    "animationend",
                    () => particle.remove(),
                    { once: true }
                );
            }
        );
    }


    /* =========================
       CHANGE SCENE
    ========================= */

    function showScene(index) {

        sceneTimers.forEach(
            timer => clearTimeout(timer)
        );

        sceneTimers = [];


        const outgoingScene =
            scenes[currentScene];


        outgoingScene.classList.remove(
            "is-active"
        );

        outgoingScene.classList.add(
            "is-leaving"
        );


        setTimeout(
            () =>
                outgoingScene.classList.remove(
                    "is-leaving"
                ),
            950
        );


        currentScene = index;

        body.dataset.scene =
            String(index + 1);


        if (index === 1) {

            const wishScene =
                scenes[index];


            wishScene.classList.remove(
                "animate-cake"
            );


            requestAnimationFrame(() => {

                wishScene.classList.add(
                    "animate-cake"
                );

            });


            setTimeout(
                () =>
                    wishScene.classList.remove(
                        "animate-cake"
                    ),
                1650
            );
        }


        if (index === 2) {

            huntHeart.hidden = false;

            moveHuntHeart();
        }


        if (index === 6) {
            beginCountdown();
        }


        scenes[currentScene].classList.add(
            "is-active"
        );


        progressNumber.textContent =
            `${index + 1} / ${scenes.length}`;


        progressFill.style.width =
            `${
                ((index + 1) / scenes.length)
                * 100
            }%`;


        nextHint.textContent =
            index === scenes.length - 1
                ? "Made with love, just for you ♥"
                : "Tap anywhere to continue →";


        nextHint.setAttribute(
            "aria-label",
            index === scenes.length - 1
                ? "Birthday surprise complete"
                : "Continue to the next birthday scene"
        );


        if (
            index === scenes.length - 1
        ) {
            startFinale();
        }
    }


    /* =========================
       NEXT SCENE
    ========================= */

    function advanceScene(
        x = width / 2,
        y = height / 2
    ) {

        if (
            !introDone ||
            changingScene
        ) {
            return;
        }


        startMusic();


        sprinkleAt(
            x,
            y,
            4
        );


        if (
            currentScene === 0 &&
            !candlesBlown
        ) {

            blowOutCandles();

            return;
        }


        if (
            currentScene === 2 &&
            huntHits < 3
        ) {
            return;
        }


        if (
            currentScene === 3 &&
            !giftOpened
        ) {
            return;
        }


        if (
            currentScene === 4 &&
            !letterFinished
        ) {
            return;
        }


        if (
            currentScene === 5 &&
            !heartRevealFinished
        ) {
            return;
        }


        if (
            currentScene === 6 &&
            !countdownFinished
        ) {
            return;
        }


        if (
            currentScene === 11 &&
            !playfulRevealed
        ) {
            return;
        }


        if (
            currentScene ===
            scenes.length - 1
        ) {

            launchFinaleFireworks();

            return;
        }


        changingScene = true;


        showScene(
            currentScene + 1
        );


        setTimeout(
            () => {
                changingScene = false;
            },
            950
        );
    }


    /* =========================
       FINALE FIREWORKS
    ========================= */

    function launchFinaleFireworks() {

        [
            [
                width * 0.22,
                height * 0.35,
                "heart"
            ],
            [
                width * 0.48,
                height * 0.2,
                "star"
            ],
            [
                width * 0.76,
                height * 0.38,
                "circle"
            ],
            [
                width * 0.37,
                height * 0.55,
                "ring"
            ],
            [
                width * 0.69,
                height * 0.58,
                "burst"
            ]
        ].forEach(
            ([x, y, shape]) =>
                launchFirework(
                    x,
                    y,
                    true,
                    shape
                )
        );
    }


    /* =========================
       START BIRTHDAY
    ========================= */

    function beginBirthday() {

        if (introDone) return;

        introDone = true;
        changingScene = true;


        intro.classList.add(
            "is-dissolving"
        );

        body.classList.add(
            "intro-done"
        );


        introTimers.forEach(
            timer => clearTimeout(timer)
        );


        canvas.classList.add(
            "canvas-show"
        );


        body.append(canvas);


        startMusic();


        setTimeout(
            () => {

                intro.remove();

                changingScene = false;

            },
            1900
        );
    }


    /* =========================
       EVENTS
    ========================= */

    introContinue.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            beginBirthday();
        }
    );


    giftStage.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !== "Enter" &&
                event.key !== " "
            ) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            openGift();
        }
    );


    envelopeStage.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !== "Enter" &&
                event.key !== " "
            ) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            openLetter();
        }
    );


    giftContinue.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            advanceScene();
        }
    );


    letterContinue.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            advanceScene();
        }
    );


    playfulButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            revealPlayfulButton();
        }
    );


    document.addEventListener(
        "click",
        (event) => {

            const target =
                event.target instanceof Element
                    ? event.target
                    : null;


            if (
                !target ||
                target.closest(
                    "#musicToggle, #introContinue, #nextHint, #giftContinue, #letterContinue, .photo-lightbox, video"
                )
            ) {
                return;
            }


            startMusic();


            if (!introDone) {

                launchFirework(
                    event.clientX,
                    event.clientY,
                    Math.random() > 0.62
                );

                return;
            }


            sprinkleAt(
                event.clientX,
                event.clientY,
                7
            );


            if (
                target.closest("#huntHeart")
            ) {

                catchHuntHeart();

                return;
            }


            if (
                target.closest("#giftStage")
            ) {

                openGift();

                return;
            }


            if (
                target.closest("#envelopeStage")
            ) {

                openLetter();

                return;
            }


            if (
                target.closest(
                    "#playfulButton"
                )
            ) {
                return;
            }


            const photo =
                target.closest(
                    ".memory-photo"
                );


            if (
                photo instanceof HTMLImageElement
            ) {

                openPhoto(photo);

                return;
            }


            advanceScene(
                event.clientX,
                event.clientY
            );
        }
    );


    nextHint.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            advanceScene();
        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !== "Enter" &&
                event.key !== " "
            ) {
                return;
            }


            if (
                event.target instanceof Element &&
                event.target.closest(
                    "button, [role='button'], #musicToggle, #nextHint, #introContinue, video"
                )
            ) {
                return;
            }


            event.preventDefault();


            if (!introDone) {
                beginBirthday();
            } else {
                advanceScene();
            }
        }
    );


    /* =========================
       RESIZE
    ========================= */

    window.addEventListener(
        "resize",
        resizeCanvas
    );


    /* =========================
       INITIALIZE
    ========================= */

    addStars();

    resizeCanvas();

    scheduleIntroFireworks();

    updateMusicButton();

})();
