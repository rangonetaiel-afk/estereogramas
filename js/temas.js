"use strict";

/*
 * Las 20 categorías temáticas y la paleta de 20 colores.
 * Esto es lo que la futura app de administración va a regenerar por
 * establecimiento (imágenes ocultas nuevas desde prompts de IA, etc.).
 *
 * Cada tema sirve tanto de imagen OCULTA (archivo en assets/ocultos/,
 * silueta blanca sobre negro = mapa de profundidad) como de patrón
 * VISIBLE (emojis que se estampan y tiñen con los colores elegidos).
 */
var TEMAS = [
    { id: "futbol",     nombre: "Fútbol",     emoji: "⚽", patron: ["⚽", "🏆", "👟"] },
    { id: "dinosaurio", nombre: "Dinos",      emoji: "🦖", patron: ["🦖", "🦕", "🌋"] },
    { id: "elefante",   nombre: "Elefante",   emoji: "🐘", patron: ["🐘", "🌿", "🥜"] },
    { id: "delfin",     nombre: "Mar",        emoji: "🐬", patron: ["🐬", "🌊", "🐚"] },
    { id: "guitarra",   nombre: "Música",     emoji: "🎸", patron: ["🎸", "🎵", "🎶"] },
    { id: "cohete",     nombre: "Espacio",    emoji: "🚀", patron: ["🚀", "🪐", "✨"] },
    { id: "corazon",    nombre: "Amor",       emoji: "❤️", patron: ["❤️", "💌", "💕"] },
    { id: "estrella",   nombre: "Estrellas",  emoji: "⭐", patron: ["⭐", "✨", "🌟"] },
    { id: "flor",       nombre: "Flores",     emoji: "🌻", patron: ["🌻", "🌸", "🌼"] },
    { id: "mariposa",   nombre: "Mariposas",  emoji: "🦋", patron: ["🦋", "🌺", "🍀"] },
    { id: "aguila",     nombre: "Aves",       emoji: "🦅", patron: ["🦅", "🪶", "☁️"] },
    { id: "gato",       nombre: "Gatos",      emoji: "🐱", patron: ["🐱", "🐾", "🧶"] },
    { id: "perro",      nombre: "Perros",     emoji: "🐶", patron: ["🐶", "🦴", "🐾"] },
    { id: "caballo",    nombre: "Caballos",   emoji: "🐴", patron: ["🐴", "🌾", "🍎"] },
    { id: "auto",       nombre: "Autos",      emoji: "🏎️", patron: ["🏎️", "🏁", "💨"] },
    { id: "avion",      nombre: "Aviones",    emoji: "✈️", patron: ["✈️", "☁️", "🌍"] },
    { id: "mate",       nombre: "Mate",       emoji: "🧉", patron: ["🧉", "🌿", "🫖"] },
    { id: "pizza",      nombre: "Pizza",      emoji: "🍕", patron: ["🍕", "🧀", "🍅"] },
    { id: "arbol",      nombre: "Naturaleza", emoji: "🌳", patron: ["🌳", "🍃", "🌿"] },
    { id: "luna",       nombre: "Luna",       emoji: "🌙", patron: ["🌙", "⭐", "☁️"] }
];

/*
 * Paleta de 20 colores cubriendo el espectro con tonos de uso frecuente,
 * con variedad de luminosidad (los 3 elegidos se ordenan de oscuro a claro
 * para el teñido del patrón).
 */
var PALETA = [
    { hex: "#6D1A36", nombre: "Vino" },
    { hex: "#E63946", nombre: "Rojo" },
    { hex: "#FF6F61", nombre: "Coral" },
    { hex: "#F77F00", nombre: "Naranja" },
    { hex: "#FFB703", nombre: "Dorado" },
    { hex: "#FFE066", nombre: "Amarillo" },
    { hex: "#FFF3B0", nombre: "Crema" },
    { hex: "#A7C957", nombre: "Lima" },
    { hex: "#38B000", nombre: "Verde" },
    { hex: "#1B4332", nombre: "Verde oscuro" },
    { hex: "#74C69D", nombre: "Menta" },
    { hex: "#2A9D8F", nombre: "Turquesa" },
    { hex: "#56CFE1", nombre: "Celeste" },
    { hex: "#3A86FF", nombre: "Azul" },
    { hex: "#1D3557", nombre: "Azul marino" },
    { hex: "#7209B7", nombre: "Violeta" },
    { hex: "#C77DFF", nombre: "Lila" },
    { hex: "#FF5D8F", nombre: "Rosa" },
    { hex: "#FFC2D1", nombre: "Rosa claro" },
    { hex: "#8B5E34", nombre: "Marrón" }
];
