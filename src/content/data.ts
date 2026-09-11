// Contenido real de Pizzería Boca a Boca (Daganzo de Arriba, Madrid).
// Fuente: pizzeriabocaaboca.es y directorios públicos del negocio.
// No se ha inventado ningún dato: nombre, dirección, teléfono, años de
// trayectoria e ingredientes de la pizza de la casa son reales.

export const restaurant = {
  name: "Boca a Boca",
  fullName: "Pizzería Boca a Boca",
  town: "Daganzo de Arriba",
  address: "Carretera de Alcalá, 7, 28814 Daganzo de Arriba, Madrid",
  phone: "918 875 043",
  phoneHref: "tel:+34918875043",
  phone2: "672 22 16 26",
  phone2Href: "tel:+34672221626",
  instagramHandle: "@pizzeria_boca_a_boca",
  instagramUrl: "https://www.instagram.com/pizzeria_boca_a_boca/",
  mapsQuery: "Pizzería Boca a Boca, Carretera de Alcalá 7, Daganzo de Arriba",
  orderUrl: "https://www.pizzeriabocaaboca.es/es/pedir-pizza-daganzo-de-arriba",
  menuUrl: "https://www.pizzeriabocaaboca.es/es/productos",
  siteUrl: "https://www.pizzeriabocaaboca.es/",
  tagline: "Más de 20 años haciendo que vuelvas.",
  hours: [
    { days: "Lunes a Viernes", time: "09:00 – 23:00" },
    { days: "Sábados", time: "09:00 – 00:00" },
    { days: "Domingos", time: "09:00 – 23:00" },
  ],
};

export const story = {
  eyebrow: "El sabor de Boca a Boca",
  title: "Más de 20 años de historia",
  paragraphs: [
    "En el centro de Daganzo de Arriba, a las afueras de Madrid, Pizzería Boca a Boca lleva más de veinte años elaborando pizza artesana con masa propia y un horno especializado, cocinando cada pizza en su punto exacto.",
    "Un local pensado tanto para comer en sala como para pedir a domicilio, con una carta que además de pizzas incluye hamburguesas, bocadillos camperos, ensaladas y pastas — siempre con la misma idea: que el sabor hable por sí solo, boca a boca.",
  ],
};

export const specialty = {
  eyebrow: "La especialidad de la casa",
  title: "Pizza Boca a Boca",
  description:
    "Llena de sabor y explosividad para los más atrevidos: la combinación que da nombre a la casa.",
};

export type Ingredient = {
  id: string;
  label: string;
  color: string;
  accent: string;
};

export const ingredients: Ingredient[] = [
  { id: "pimiento", label: "Pimiento", color: "#c62828", accent: "#2e7d32" },
  { id: "bacon", label: "Bacon", color: "#a83232", accent: "#e8b98a" },
  { id: "queso", label: "Queso", color: "#f4c95d", accent: "#fff3c4" },
  { id: "carne", label: "Carne", color: "#6b3626", accent: "#8a4a34" },
  { id: "guindilla", label: "Guindilla", color: "#8ecb4e", accent: "#5a9c2f" },
  { id: "cebolla", label: "Cebolla", color: "#e7dcc8", accent: "#c9377a" },
];
