// Carta de Pizzería Boca a Boca (Daganzo de Arriba).
//
// Fuente: pizzeriabocaaboca.es y agregadores públicos del negocio
// (carta.menu, restaurantguru, gastroranking, rutaculinaria). El dominio
// oficial no es accesible directamente desde este entorno, así que solo se
// incluyen aquí nombres e ingredientes que aparecen confirmados en esas
// fuentes. Deliberadamente NO se incluyen precios por artículo: no hay una
// fuente fiable con el desglose exacto, y el encargo es explícito en no
// inventarlos. Cada producto enlaza en su lugar al pedido/carta oficial,
// donde el precio real y actualizado siempre está disponible.

export type MenuItem = {
  name: string;
  description?: string;
  tag?: string;
  /** Solo se rellena cuando hay una fotografía real del producto. */
  photo?: string;
  /** Activa la mini-escena de ingredientes separándose sobre la foto. */
  special?: boolean;
};

export type MenuCategory = {
  id: string;
  label: string;
  intro?: string;
  items: MenuItem[];
};

export const ORDER_URL = "https://www.pizzeriabocaaboca.es/es/pedir-pizza-daganzo-de-arriba";
export const MENU_URL = "https://www.pizzeriabocaaboca.es/es/producto/carta-y-precios/";

export const menu: MenuCategory[] = [
  {
    id: "pizzas",
    label: "Pizzas",
    intro: "Masa artesana propia, horno especializado y cocción en su punto exacto.",
    items: [
      {
        name: "Boca a Boca",
        description: "Pimiento, bacon, queso, carne, guindilla y cebolla — la especialidad de la casa.",
        tag: "La de la casa",
        photo: "/images/hero-pizza.webp",
        special: true,
      },
      { name: "Margarita" },
      { name: "Cuatro Quesos" },
      { name: "Jamón y Queso" },
      { name: "Barbacoa" },
      { name: "Carbonara" },
      { name: "Ahumada" },
      { name: "Picante" },
    ],
  },
  {
    id: "camperos",
    label: "Camperos",
    intro: "Bocadillos camperos y dobladillos, uno de los platos más pedidos de la casa.",
    items: [{ name: "Campero Boca a Boca" }, { name: "Dobladillos" }],
  },
  {
    id: "hamburguesas",
    label: "Hamburguesas",
    intro: "Hamburguesas caseras.",
    items: [{ name: "Hamburguesas caseras" }],
  },
  {
    id: "pasta",
    label: "Pasta",
    items: [
      { name: "Lasaña" },
      { name: "Canelones" },
      { name: "Macarrones" },
      { name: "Tallarines" },
      { name: "Espaguetis a la boloñesa" },
      { name: "Carbonara" },
    ],
  },
  {
    id: "ensaladas",
    label: "Ensaladas",
    intro: "De las tradicionales a las más innovadoras.",
    items: [{ name: "Ensaladas de la casa" }],
  },
  {
    id: "sandwiches",
    label: "Sándwiches",
    items: [
      {
        name: "Boca a Boca",
        description: "Lechuga, tomate, cebolla, mayonesa, carne, queso, huevo, bacon y jamón.",
      },
      {
        name: "Lover",
        description: "Lechuga, tomate, cebolla, bacon, huevo, pollo, queso y salsa barbacoa.",
      },
    ],
  },
  {
    id: "entrantes",
    label: "Entrantes",
    items: [
      { name: "Alitas de pollo" },
      { name: "Aros de cebolla" },
      { name: "Patatas gajo" },
      { name: "Empanadillas" },
      { name: "Palitos de queso" },
      { name: "Nuggets" },
      { name: "Croquetas" },
    ],
  },
  {
    id: "postres",
    label: "Postres",
    intro: "Selección de postres dulces.",
    items: [{ name: "Postres de la casa" }],
  },
  {
    id: "ofertas",
    label: "Ofertas",
    intro: "Promociones de pizza grande con bebida y pizza adicional (ahumada, especial Boca, picante, carbonara o barbacoa).",
    items: [{ name: "Oferta especial" }],
  },
];
