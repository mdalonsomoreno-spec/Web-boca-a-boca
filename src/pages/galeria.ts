type Slide = { src: string; alt: string; caption: string };

// Solo fotografías reales de Boca a Boca. Cuando el restaurante nos pase más
// (interior, equipo, más platos) se añaden aquí — no se rellena con stock genérico.
const SLIDES: Slide[] = [
  {
    src: "/images/hero-pizza.webp",
    alt: "Pizza Boca a Boca recién horneada",
    caption: "La pizza que da nombre a la casa",
  },
  {
    src: "/images/story-slice.webp",
    alt: "Porción de pizza Boca a Boca",
    caption: "Masa artesana, cocida en su punto",
  },
  {
    src: "/images/specialty-cheesepull.webp",
    alt: "Queso fundido de la Pizza Boca a Boca",
    caption: "Queso fundido, boca a boca",
  },
];

let initialized = false;
let current = 0;
let timer: ReturnType<typeof setInterval> | null = null;

function render(): void {
  const root = document.getElementById("gallery-fullscreen")!;
  root.innerHTML = "";

  SLIDES.forEach((slide, i) => {
    const div = document.createElement("div");
    div.className = "gallery-slide" + (i === 0 ? " is-active" : "");
    div.innerHTML = `<img src="${slide.src}" alt="${slide.alt}" loading="${i === 0 ? "eager" : "lazy"}" />`;
    root.appendChild(div);
  });

  const caption = document.createElement("div");
  caption.className = "gallery-caption";
  caption.innerHTML = `<p class="eyebrow">Galería</p><h2 id="gallery-caption-text">${SLIDES[0].caption}</h2>`;
  root.appendChild(caption);

  const dots = document.createElement("div");
  dots.className = "gallery-dots";
  SLIDES.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "gallery-dot" + (i === 0 ? " is-active" : "");
    dot.type = "button";
    dot.setAttribute("aria-label", `Foto ${i + 1}`);
    dot.addEventListener("click", () => goTo(i, true));
    dots.appendChild(dot);
  });
  root.appendChild(dots);
}

function goTo(index: number, userInitiated = false): void {
  current = (index + SLIDES.length) % SLIDES.length;
  document.querySelectorAll(".gallery-slide").forEach((el, i) => el.classList.toggle("is-active", i === current));
  document.querySelectorAll(".gallery-dot").forEach((el, i) => el.classList.toggle("is-active", i === current));
  const captionText = document.getElementById("gallery-caption-text");
  if (captionText) captionText.textContent = SLIDES[current].caption;
  if (userInitiated) restartTimer();
}

function restartTimer(): void {
  if (timer) clearInterval(timer);
  timer = setInterval(() => goTo(current + 1), 5000);
}

export function initGaleria(): void {
  if (!initialized) {
    initialized = true;
    render();
  }
  restartTimer();
}

export function stopGaleria(): void {
  if (timer) clearInterval(timer);
  timer = null;
}
