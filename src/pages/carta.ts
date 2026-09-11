import { gsap } from "gsap";
import { menu, ORDER_URL, type MenuCategory, type MenuItem } from "../content/menu";
import { ingredients } from "../content/data";
import { getRouteQuery } from "../router";
import { shouldUseWebGL } from "../scene/capabilities";
import type { IngredientBurstScene as BurstSceneType } from "../scene/IngredientBurstScene";

let initialized = false;
let activeCategory = menu[0].id;
let burstScene: BurstSceneType | null = null;

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function renderPills(): void {
  const nav = el<HTMLElement>("category-pills");
  nav.innerHTML = "";
  menu.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "category-pill";
    btn.type = "button";
    btn.textContent = cat.label;
    btn.dataset.cat = cat.id;
    btn.classList.toggle("is-active", cat.id === activeCategory);
    btn.addEventListener("click", () => selectCategory(cat.id));
    nav.appendChild(btn);
  });
}

function selectCategory(id: string): void {
  if (id === activeCategory) return;
  activeCategory = id;
  document.querySelectorAll<HTMLButtonElement>(".category-pill").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.cat === id);
  });
  renderCategoryPanel(true);
}

function renderCategoryPanel(animate: boolean): void {
  const panel = el<HTMLElement>("menu-panel");
  const category = menu.find((c) => c.id === activeCategory) as MenuCategory;

  const build = () => {
    panel.innerHTML = "";
    if (category.intro) {
      const intro = document.createElement("p");
      intro.className = "menu-category-intro";
      intro.textContent = category.intro;
      panel.appendChild(intro);
    }
    const list = document.createElement("div");
    list.className = "menu-list";
    category.items.forEach((item) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "menu-item";
      row.innerHTML = `
        <div class="menu-item-main">
          <div class="menu-item-name">${item.name}${item.tag ? `<span class="menu-item-tag">${item.tag}</span>` : ""}</div>
          ${item.description ? `<div class="menu-item-desc">${item.description}</div>` : ""}
        </div>
        <span class="menu-item-cta">${item.photo ? "Ver →" : "Pedir →"}</span>
      `;
      row.addEventListener("click", () => openModal(item, category.label));
      list.appendChild(row);
    });
    panel.appendChild(list);
  };

  if (animate) {
    gsap.to(panel, {
      opacity: 0,
      y: 12,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        build();
        gsap.fromTo(panel, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" });
      },
    });
  } else {
    build();
  }
}

async function openModal(item: MenuItem, categoryLabel: string): Promise<void> {
  const modal = el<HTMLElement>("product-modal");
  const media = el<HTMLElement>("product-modal-media");
  const eyebrow = el<HTMLElement>("product-modal-eyebrow");
  const name = el<HTMLElement>("product-modal-name");
  const desc = el<HTMLElement>("product-modal-desc");
  const ingredientsEl = el<HTMLUListElement>("product-modal-ingredients");
  const cta = el<HTMLAnchorElement>("product-modal-cta");

  eyebrow.textContent = categoryLabel;
  name.textContent = item.name;
  desc.textContent = item.description ?? "";
  desc.hidden = !item.description;
  cta.href = ORDER_URL;

  media.innerHTML = "";
  media.classList.toggle("has-media", !!item.photo);
  document.querySelector(".product-modal-card")?.classList.toggle("no-media", !item.photo);

  if (item.special) {
    ingredientsEl.hidden = false;
    ingredientsEl.innerHTML = ingredients.map((ing) => `<li>${ing.label}</li>`).join("");
  } else {
    ingredientsEl.hidden = true;
    ingredientsEl.innerHTML = "";
  }

  if (item.photo) {
    const img = document.createElement("img");
    img.src = item.photo;
    img.alt = item.name;
    media.appendChild(img);

    if (item.special && shouldUseWebGL()) {
      const canvas = document.createElement("canvas");
      canvas.className = "product-modal-burst-canvas";
      media.appendChild(canvas);
      const { IngredientBurstScene } = await import("../scene/IngredientBurstScene");
      burstScene = new IngredientBurstScene(canvas);
      burstScene.onResize();
      burstScene.start();
    }
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("nav-open");
}

export function closeCartaModal(): void {
  closeModal();
}

function closeModal(): void {
  const modal = el<HTMLElement>("product-modal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("nav-open");
  burstScene?.stop();
  burstScene = null;
}

function setupModal(): void {
  el<HTMLButtonElement>("product-modal-close").addEventListener("click", closeModal);
  el<HTMLElement>("product-modal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  window.addEventListener("resize", () => burstScene?.onResize());
}

export function initCarta(): void {
  const requestedCat = getRouteQuery().get("cat");
  if (requestedCat && menu.some((c) => c.id === requestedCat)) {
    activeCategory = requestedCat;
  }

  if (!initialized) {
    initialized = true;
    renderPills();
    setupModal();
  } else {
    document.querySelectorAll<HTMLButtonElement>(".category-pill").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.cat === activeCategory);
    });
  }
  renderCategoryPanel(false);
}
