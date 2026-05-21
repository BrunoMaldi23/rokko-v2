export type ProductCategory =
  | "poleras"
  | "polerones"
  | "parkas"
  | "pantalones";

export type Product = {
  id: string;
  category: ProductCategory;
  name: string;
  shortName: string;
  description: string;
  extract: string;
  image: string;
  price: number;
  wholesalePrice?: number;
  wholesaleFrom?: number;
  sizes: string[];
  colors: string[];
  composition: string;
  weight: string;
  technologies: string[];
  certifications: string[];

  logoZones: Record<string, string>;
};

export const products: Product[] = [
  {
    id: "heavy-cotton-mc",

    category: "poleras",

    name: "Polera Heavy Cotton Manga Corta",

    shortName: "Heavy Cotton MC",

    description:
      "100% algodón, 170 gramos, corte regular chileno.",

    extract:
      "Polera de estructura tubular con excelente durabilidad, resistencia al desgaste y protección UV integrada. Ideal para equipos corporativos que buscan comodidad, buena presentación y uso diario.",

    image:
      "/products/poleras/polera-heavy-cotton-manga-corta.png",

    price: 10990,

    wholesalePrice: 9490,

    wholesaleFrom: 15,

    sizes: [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL",
    ],

    colors: [
      "Blanco",
      "Negro",
      "Gris jaspeado",
      "Rojo",
      "Azul Rey",
      "Azul Marino",
    ],

    composition:
      "Tela Jersey · 100% algodón · 170 gramos",

    weight: "170 grs",

    technologies: [
      "Antipilling",
      "Estabilidad dimensional",
      "Solidez de color por luz",
      "Protección UPF+",
      "Durable lavado tras lavado",
    ],

    certifications: [
      "Vartest",
      "SGS",
      "OEKO-TEX Standard 100",
      "TÜV Rheinland",
      "Intertek",
      "SATRA",
    ],

    logoZones: {
      "Pecho izquierdo":
        "left-[44%] top-[37%] w-12",

      "Pecho derecho":
        "right-[31%] top-[37%] w-12",

      "Pecho centro":
        "left-1/2 top-[38%] w-16 -translate-x-1/2",

      "Brazo izquierdo":
        "left-[26%] top-[38%] w-10",

      "Brazo derecho":
        "right-[26%] top-[38%] w-10",

      "Espalda alta":
        "left-1/2 top-[28%] w-24 -translate-x-1/2",
    },
  },

  {
    id: "heavy-cotton-ml",

    category: "poleras",

    name: "Polera Heavy Cotton Manga Larga",

    shortName: "Heavy Cotton ML",

    description:
      "100% algodón, manga larga con puño en muñeca.",

    extract:
      "Versión manga larga de algodón natural, ideal para equipos que requieren mayor cobertura sin perder comodidad ni presencia corporativa.",

    image:
      "/products/poleras/polera-heavy-cotton-manga-larga.png",

    price: 11900,

    wholesalePrice: 10590,

    wholesaleFrom: 15,

    sizes: [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL",
    ],

    colors: [
      "Azul Marino",
      "Negro",
      "Blanco",
      "Gris",
    ],

    composition:
      "Tela Jersey · 100% algodón · 170 gramos",

    weight: "170 grs",

    technologies: [
      "Antipilling",
      "Estabilidad dimensional",
      "Solidez de color por luz",
      "Protección UPF+",
      "Durable lavado tras lavado",
    ],

    certifications: [
      "Vartest",
      "SGS",
      "OEKO-TEX Standard 100",
      "TÜV Rheinland",
      "Intertek",
      "SATRA",
    ],

    logoZones: {
      "Pecho izquierdo":
        "left-[44%] top-[37%] w-12",

      "Pecho derecho":
        "right-[31%] top-[37%] w-12",

      "Pecho centro":
        "left-1/2 top-[38%] w-16 -translate-x-1/2",

      "Brazo izquierdo":
        "left-[24%] top-[38%] w-10",

      "Brazo derecho":
        "right-[24%] top-[38%] w-10",

      "Espalda alta":
        "left-1/2 top-[28%] w-24 -translate-x-1/2",
    },
  },

  {
    id: "cuello-camisa-essential",

    category: "poleras",

    name: "Polera Cuello Camisa Essential",

    shortName: "Essential",

    description:
      "Opción funcional y corporativa de excelente relación precio/calidad.",

    extract:
      "Polera cuello camisa con interior suave al tacto y tratamiento soft touch. Una alternativa más cómoda y corporativa que una piqué tradicional.",

    image:
      "/products/poleras/polo-essential.jpg",

    price: 12990,

    wholesalePrice: 10990,

    wholesaleFrom: 15,

    sizes: [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
      "4XL",
    ],

    colors: [
      "Blanco",
      "Gris oscuro",
      "Negro",
      "Celeste",
      "Gris claro",
      "Verde Pino",
      "Rojo",
      "Azul Rey",
      "Azul Marino",
    ],

    composition:
      "60% algodón · 40% poliéster · 230 gramos",

    weight: "230 grs",

    technologies: [
      "Antipilling",
      "Durable",
      "Estabilidad dimensional",
      "Solidez de color",
      "Soft touch",
    ],

    certifications: [
      "Vartest",
      "SGS",
      "OEKO-TEX Standard 100",
      "TÜV Rheinland",
      "Intertek",
      "SATRA",
    ],

    logoZones: {
      "Pecho izquierdo":
        "left-[42%] top-[37%] w-12",

      "Pecho derecho":
        "right-[29%] top-[37%] w-12",

      "Pecho centro":
        "left-1/2 top-[39%] w-16 -translate-x-1/2",

      "Brazo izquierdo":
        "left-[24%] top-[38%] w-10",

      "Brazo derecho":
        "right-[24%] top-[38%] w-10",

      "Espalda alta":
        "left-1/2 top-[27%] w-24 -translate-x-1/2",
    },
  },

  {
    id: "cuello-camisa-sport",

    category: "poleras",

    name: "Polera Cuello Camisa Sport",

    shortName: "Sport",

    description:
      "Tela liviana y fresca para trabajo activo y uso diario.",

    extract:
      "Diseño tipo polo que combina elegancia y funcionalidad. Su tecnología de control de humedad, secado rápido y tela ultra liviana entrega comodidad para oficina, terreno o actividades corporativas.",

    image:
      "/products/poleras/polo-sport.jpg",

    price: 14990,

    wholesalePrice: 12490,

    wholesaleFrom: 15,

    sizes: [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
    ],

    colors: [
      "Negro",
      "Azul Marino",
    ],

    composition:
      "60% algodón · 40% poliéster · 180 gramos",

    weight: "180 grs",

    technologies: [
      "Control de humedad",
      "Liviano",
      "Respirable",
      "Secado rápido",
      "Solidez de color",
    ],

    certifications: [
      "Vartest",
      "SGS",
      "OEKO-TEX Standard 100",
      "TÜV Rheinland",
      "Intertek",
      "SATRA",
    ],

    logoZones: {
      "Pecho izquierdo":
        "left-[43%] top-[36%] w-12",

      "Pecho derecho":
        "right-[30%] top-[36%] w-12",

      "Pecho centro":
        "left-1/2 top-[37%] w-16 -translate-x-1/2",

      "Brazo izquierdo":
        "left-[24%] top-[37%] w-10",

      "Brazo derecho":
        "right-[24%] top-[37%] w-10",

      "Espalda alta":
        "left-1/2 top-[27%] w-24 -translate-x-1/2",
    },
  },

  {
    id: "polo-ejecutiva-dryfresh",

    category: "poleras",

    name: "Polo Ejecutiva DryFresh®",

    shortName: "DryFresh®",

    description:
      "Línea premium técnica, respirable y de imagen profesional superior.",

    extract:
      "Polera de alta funcionalidad y rendimiento, diseñada para ofrecer máxima comodidad y durabilidad. Gracias a sus tecnologías de control de humedad, secado rápido y protección UV, es ideal para actividades exigentes al aire libre y entornos corporativos.",

    image:
      "/products/poleras/polo-ejecutiva-dryfresh.jpg",

    price: 16990,

    wholesalePrice: 13990,

    wholesaleFrom: 15,

    sizes: [
      "S",
      "M",
      "L",
      "XL",
      "2XL",
      "3XL",
    ],

    colors: [
      "Negro",
      "Gris acero",
      "Rojo",
      "Azul Marino",
      "Azul Rey",
      "Verde Laguna",
    ],

    composition:
      "60% algodón · 40% poliéster · 230 gramos",

    weight: "230 grs",

    technologies: [
      "Antipilling",
      "Control de humedad",
      "Durable",
      "Estabilidad dimensional",
      "Liviano",
      "Secado rápido",
      "Solidez de color",
      "Protección UPF+",
    ],

    certifications: [
      "Vartest",
      "SGS",
      "OEKO-TEX Standard 100",
      "TÜV Rheinland",
      "Intertek",
      "SATRA",
    ],

    logoZones: {
      "Pecho izquierdo":
        "left-[44%] top-[35%] w-12",

      "Pecho derecho":
        "right-[30%] top-[35%] w-12",

      "Pecho centro":
        "left-1/2 top-[37%] w-16 -translate-x-1/2",

      "Brazo izquierdo":
        "left-[24%] top-[37%] w-10",

      "Brazo derecho":
        "right-[24%] top-[37%] w-10",

      "Espalda alta":
        "left-1/2 top-[26%] w-24 -translate-x-1/2",
    },
  },
];

export const certificationLogos = [
  "/certifications/CERTIFICACIONES 1_Mesa de trabajo 1.png",
  "/certifications/CERTIFICACIONES 1-02.png",
  "/certifications/CERTIFICACIONES 1-03.png",
  "/certifications/CERTIFICACIONES 1-04.png",
  "/certifications/CERTIFICACIONES 1-05.png",
  "/certifications/CERTIFICACIONES 1-06.png",
  "/certifications/CERTIFICACIONES 1-07.png",
  "/certifications/CERTIFICACIONES 1-08.png",
  "/certifications/CERTIFICACIONES 1-09.png",
  "/certifications/CERTIFICACIONES 1-10.png",
  "/certifications/CERTIFICACIONES 1-11.png",
  "/certifications/CERTIFICACIONES 1-12.png",
];