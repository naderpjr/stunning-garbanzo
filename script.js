(() => {
    "use strict";

    const hero = document.querySelector("#hero");
    const cardsContainer = document.querySelector("#cardsContainer");
    const introText = document.querySelector("#introText");
    const visionContent = document.querySelector("#visionContent");

    const MAX_SCROLL = 3000;

    const reduceMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );
    let prefersReducedMotion = reduceMotionQuery.matches;

    const images = [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&q=75&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=75&auto=format&fit=crop"
    ];

    const TOTAL_IMAGES = images.length;

    let width = 0;
    let height = 0;

    let scrollValue = 0;
    let targetScroll = 0;

    let mouseX = 0;
    let targetMouseX = 0;

    let morphValue = 0;
    let targetMorph = 0;

    let rotationValue = 0;
    let targetRotation = 0;

    let introPhase = prefersReducedMotion ? "circle" : "scatter";

    let rafId = null;
    let lastTime = 0;

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function smooth(current, target, factor, dt) {
        const t = 1 - Math.pow(1 - factor, dt / 16.6667);
        return current + (target - current) * t;
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    const scatterPositions = images.map(() => ({
        x: random(-750, 750),
        y: random(-500, 500),
        rotation: random(-90, 90),
        scale: 0.6,
        opacity: 0
    }));

    const cards = [];
    const cardStates = [];

    const fragment = document.createDocumentFragment();

    images.forEach((src, index) => {
        const card = document.createElement("div");

        card.className = "flip-card";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `View details, card ${index + 1}`);

        const eager = index < 6;
        const highPriority = index < 3;

        card.innerHTML = `
            <div class="card-inner">

                <div class="card-face card-front">
                    <img
                        src="${src}"
                        alt="AI vision ${index + 1}"
                        loading="${eager ? "eager" : "lazy"}"
                        decoding="async"
                        ${highPriority ? 'fetchpriority="high"' : ""}
                    >

                    <div class="card-overlay"></div>
                </div>

                <div class="card-face card-back">
                    <div class="card-back-content">
                        <p class="card-back-label">View</p>
                        <p class="card-back-title">Details</p>
                    </div>
                </div>

            </div>
        `;

        const toggleFlip = () => card.classList.toggle("is-flipped");

        card.addEventListener("click", toggleFlip);

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleFlip();
            }
        });

        fragment.appendChild(card);

        cards.push(card);
        cardStates.push({ x: 0, y: 0, rotation: 0, scale: 1, opacity: 0 });
    });

    cardsContainer.appendChild(fragment);

    function updateSize() {
        const rect = hero.getBoundingClientRect();

        width = rect.width;
        height = rect.height;
    }

    const resizeObserver = new ResizeObserver(updateSize);

    resizeObserver.observe(hero);

    updateSize();


    function calculateCard(index) {

        if (introPhase === "scatter") {
            return {
                x: scatterPositions[index].x,
                y: scatterPositions[index].y,
                rotation: scatterPositions[index].rotation,
                scale: scatterPositions[index].scale,
                opacity: scatterPositions[index].opacity
            };
        }

        if (introPhase === "line") {
            const spacing = 70;
            const totalWidth = TOTAL_IMAGES * spacing;
            const x = index * spacing - totalWidth / 2;

            return {
                x,
                y: 0,
                rotation: 0,
                scale: 1,
                opacity: 1
            };
        }

        const isMobile = width < 768;

        const minDimension = Math.min(width, height);

        const circleRadius = Math.min(minDimension * 0.35, 350);

        const circleAngle = (index / TOTAL_IMAGES) * 360;
        const circleRad = (circleAngle * Math.PI) / 180;

        const circleX = Math.cos(circleRad) * circleRadius;
        const circleY = Math.sin(circleRad) * circleRadius;

        const circleRotation = circleAngle + 90;

        const baseRadius = Math.min(width, height * 1.5);
        const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);

        const arcApexY = height * (isMobile ? 0.35 : 0.25);
        const arcCenterY = arcApexY + arcRadius;

        const spreadAngle = isMobile ? 100 : 130;
        const startAngle = -90 - spreadAngle / 2;
        const step = spreadAngle / (TOTAL_IMAGES - 1);

        const scrollProgress = clamp(rotationValue / 360, 0, 1);
        const maxRotation = spreadAngle * 0.8;
        const boundedRotation = -scrollProgress * maxRotation;

        const currentAngle = startAngle + index * step + boundedRotation;
        const arcRad = (currentAngle * Math.PI) / 180;

        const arcX = Math.cos(arcRad) * arcRadius + mouseX;
        const arcY = Math.sin(arcRad) * arcRadius + arcCenterY;

        const arcRotation = currentAngle + 90;
        const arcScale = isMobile ? 1.4 : 1.8;

        return {
            x: lerp(circleX, arcX, morphValue),
            y: lerp(circleY, arcY, morphValue),
            rotation: lerp(circleRotation, arcRotation, morphValue),
            scale: lerp(1, arcScale, morphValue),
            opacity: 1
        };
    }

    function lerp(start, end, amount) {
        return start + (end - start) * amount;
    }

    function applyCardState(card, state) {
        card.style.transform =
            `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) ` +
            `rotate(${state.rotation.toFixed(2)}deg) scale(${state.scale.toFixed(3)})`;

        card.style.opacity = state.opacity;
    }

    cards.forEach((card, index) => {
        const initial = calculateCard(index);

        cardStates[index] = initial;

        applyCardState(card, initial);
    });


    let introTimers = [];

    if (!prefersReducedMotion) {
        introTimers.push(
            setTimeout(() => {
                introPhase = "line";
            }, 500)
        );

        introTimers.push(
            setTimeout(() => {
                introPhase = "circle";
            }, 2500)
        );
    } else {
        introPhase = "circle";
    }


    hero.addEventListener(
        "wheel",
        (event) => {
            event.preventDefault();

            targetScroll += event.deltaY;
            targetScroll = clamp(targetScroll, 0, MAX_SCROLL);
        },
        { passive: false }
    );


    let touchStartY = 0;

    hero.addEventListener(
        "touchstart",
        (event) => {
            if (!event.touches.length) return;

            touchStartY = event.touches[0].clientY;
        },
        { passive: true }
    );

    hero.addEventListener(
        "touchmove",
        (event) => {
            if (!event.touches.length) return;

            const currentY = event.touches[0].clientY;
            const delta = touchStartY - currentY;

            touchStartY = currentY;

            targetScroll += delta;
            targetScroll = clamp(targetScroll, 0, MAX_SCROLL);
        },
        { passive: true }
    );


    hero.addEventListener(
        "mousemove",
        (event) => {
            const rect = hero.getBoundingClientRect();
            const relativeX = event.clientX - rect.left;
            const normalized = (relativeX / rect.width) * 2 - 1;

            targetMouseX = normalized * 100;
        },
        { passive: true }
    );

    hero.addEventListener("mouseleave", () => {
        targetMouseX = 0;
    });


    reduceMotionQuery.addEventListener("change", (event) => {
        prefersReducedMotion = event.matches;
    });


    function render(now) {
        const dt = lastTime ? Math.min(now - lastTime, 100) : 16.6667;

        lastTime = now;

        const posFactor = prefersReducedMotion ? 1 : 0.16;
        const driveFactor = prefersReducedMotion ? 1 : 0.075;
        const morphFactor = prefersReducedMotion ? 1 : 0.055;

        scrollValue = smooth(scrollValue, targetScroll, driveFactor, dt);
        mouseX = smooth(mouseX, targetMouseX, 0.06, dt);

        const rawMorph = clamp(scrollValue / 600, 0, 1);

        targetMorph = easeOutCubic(rawMorph);
        morphValue = smooth(morphValue, targetMorph, morphFactor, dt);

        const rawRotation = clamp(
            (scrollValue - 600) / (MAX_SCROLL - 600),
            0,
            1
        );

        targetRotation = rawRotation * 360;
        rotationValue = smooth(rotationValue, targetRotation, morphFactor, dt);

        cards.forEach((card, index) => {
            const target = calculateCard(index);
            const state = cardStates[index];

            state.x = smooth(state.x, target.x, posFactor, dt);
            state.y = smooth(state.y, target.y, posFactor, dt);
            state.rotation = smooth(state.rotation, target.rotation, posFactor, dt);
            state.scale = smooth(state.scale, target.scale, posFactor, dt);
            state.opacity = smooth(state.opacity, target.opacity, posFactor, dt);

            applyCardState(card, state);
        });

        const introFade = clamp(1 - morphValue * 2, 0, 1);

        introText.style.opacity = introFade;
        introText.style.filter = `blur(${(1 - introFade) * 10}px)`;
        introText.style.transform =
            `translate(-50%, calc(-50% + ${(1 - introFade) * -10}px))`;

        const contentProgress = clamp((morphValue - 0.8) / 0.2, 0, 1);

        visionContent.style.opacity = contentProgress;
        visionContent.style.transform =
            `translate(-50%, ${20 - contentProgress * 20}px)`;
        visionContent.classList.toggle("is-visible", contentProgress > 0.5);

        rafId = requestAnimationFrame(render);
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        } else if (rafId === null) {
            lastTime = 0;
            rafId = requestAnimationFrame(render);
        }
    });

    rafId = requestAnimationFrame(render);
})();