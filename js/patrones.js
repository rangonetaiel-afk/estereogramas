"use strict";

/*
 * Generación del patrón VISIBLE: un mosaico con los emojis de la temática
 * elegida, teñido con los 3 colores del comensal.
 *
 * El teñido es un "gradient map" por luminosidad (técnica estándar de
 * duotono/tritono): los 3 colores se ordenan de oscuro a claro y cada píxel
 * se pinta según su luminosidad. Eso garantiza contraste (clave para que el
 * estereograma "enganche") sin importar qué colores elija el comensal.
 *
 * El mosaico se dibuja con envoltura horizontal (cada estampa se repite en
 * x±ancho) para que el patrón sea perfectamente repetible sin costuras.
 * Se agrega un ruido fino de luminosidad para que ninguna zona quede plana
 * (las zonas planas hacen ambigua la correspondencia entre ojos).
 */

function hexARgb(hex) {
    var v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function luminancia(rgb) {
    return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
}

/*
 * tema     : entrada de TEMAS (usa tema.patron, lista de emojis)
 * coloresHex: array de 3 strings "#rrggbb" elegidos por el comensal
 * ancho    : ancho del tile en px (= período t0 del estereograma)
 * alto     : alto en px (= alto del estereograma, sin repetición vertical)
 * Devuelve { data, width, height } listo para el motor.
 */
function generarPatron(tema, coloresHex, ancho, alto) {
    var canvas = document.createElement("canvas");
    canvas.width = ancho;
    canvas.height = alto;
    var ctx = canvas.getContext("2d", { willReadFrequently: true });

    // Base gris medio: el gradient map la lleva al color del medio
    ctx.fillStyle = "#8a8a8a";
    ctx.fillRect(0, 0, ancho, alto);

    // Estampa emojis sobre una grilla con jitter (estratificada): cubre todo
    // el tile de manera pareja — las zonas planas grandes hacen ambiguo el
    // enganche estéreo y delatan los cortes de la figura oculta.
    var fuente = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
    var celda = ancho * 0.30;
    var cols = Math.ceil(ancho / celda);
    var filas = Math.ceil(alto / celda);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var i = 0;
    for (var fy = 0; fy < filas; fy++) {
        for (var fx = 0; fx < cols; fx++) {
            var em = tema.patron[i % tema.patron.length];
            i++;
            var tam = ancho * (0.20 + Math.random() * 0.16);
            var x = (fx + 0.5 + (Math.random() - 0.5) * 0.8) * celda;
            var y = (fy + 0.5 + (Math.random() - 0.5) * 0.8) * celda;
            var rot = Math.random() * Math.PI * 2;
            ctx.font = Math.round(tam) + "px " + fuente;
            for (var rep = -1; rep <= 1; rep++) {
                ctx.save();
                ctx.translate(x + rep * ancho, y);
                ctx.rotate(rot);
                ctx.fillText(em, 0, 0);
                ctx.restore();
            }
        }
    }

    // Ordena los colores elegidos de oscuro a claro
    var colores = coloresHex.map(hexARgb).sort(function (a, b) {
        return luminancia(a) - luminancia(b);
    });

    // Gradient map + ruido fino de luminosidad
    var imagen = ctx.getImageData(0, 0, ancho, alto);
    var d = imagen.data;
    for (var p = 0; p < d.length; p += 4) {
        var lum = (0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2]) / 255;
        lum += (Math.random() - 0.5) * 0.14; // ruido: evita zonas planas
        if (lum < 0) lum = 0;
        if (lum > 1) lum = 1;

        var c0, c1, t;
        if (lum < 0.5) { c0 = colores[0]; c1 = colores[1]; t = lum * 2; }
        else { c0 = colores[1]; c1 = colores[2]; t = (lum - 0.5) * 2; }

        d[p] = Math.round(c0[0] + (c1[0] - c0[0]) * t);
        d[p + 1] = Math.round(c0[1] + (c1[1] - c0[1]) * t);
        d[p + 2] = Math.round(c0[2] + (c1[2] - c0[2]) * t);
        d[p + 3] = 255;
    }

    return { data: d, width: ancho, height: alto };
}
