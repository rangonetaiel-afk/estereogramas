"use strict";

/*
 * Configuración general de la página. Esto es lo que se personaliza por
 * establecimiento (y lo que la futura app de administración va a editar).
 */
var CONFIG = {
    // Nombre del establecimiento que aparece en el encabezado
    RESTAURANTE: "Tu Restaurante",

    // Parámetros del estereograma, en píxeles CSS (se escalan solos según
    // la densidad de pantalla del celular). Valores según investigación:
    // período de 100-140 px para visión a 30-50 cm.
    T0_CSS: 110,      // período base del patrón
    PASO_CSS: 3,      // desplazamiento por nivel de profundidad
    NIVELES: 8,       // niveles de profundidad
    FONDO: 0,         // nivel del fondo

    // Proporción alto/ancho del estereograma generado
    PROPORCION_ALTO: 1.25,

    // Tamaño de la figura oculta relativo al ancho del lienzo
    ESCALA_FIGURA: 0.90,

    // Suavizado del borde de la figura (bisel): la imagen oculta se dibuja
    // reducida por este factor y se re-agranda, generando un gradiente en
    // los bordes que el motor convierte en niveles intermedios de
    // profundidad (borde redondeado, más fácil de "ver"). 1 = desactivado.
    SUAVIZADO: 4
};

/*
 * ==================================================================
 * TEXTO PROVISORIO — la redacción definitiva de la explicación la van
 * a escribir los dueños del proyecto; reemplazar acá cuando esté.
 * ==================================================================
 */
var EXPLICACION = [
    "Alejá el celular a unos 30 cm, con el brillo alto y sin reflejos en la pantalla.",
    "Mirá “a través” de la pantalla, como si enfocaras algo lejano detrás de ella. La imagen se te va a poner borrosa: está bien, no reenfoques.",
    "Mantené la mirada relajada unos segundos, sin esforzarte. La figura 3D aparece sola, de a poco.",
    "¿No sale? Acercá la pantalla casi hasta la nariz, “atravesala” con la mirada, y alejala muy despacio sin volver a enfocar.",
    "Si te resulta más fácil cruzar los ojos, tocá el botón “Versión para ojos cruzados”."
];

var NOTA_HONESTA = "A un pequeño porcentaje de personas le cuesta mucho verlo " +
    "(depende de la visión binocular de cada uno). Si no te sale, no es tu culpa ni la del mantel 😉";
