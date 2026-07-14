"use strict";

/*
 * Carga de la imagen oculta (mapa de profundidad): PNG de silueta blanca
 * sobre negro en assets/ocultos/, dibujada centrada sobre un lienzo del
 * tamaño del estereograma y convertida a luminancia (Uint8Array).
 */
function cargarOculto(rutaPng, ancho, alto, escalaFigura) {
    return new Promise(function (resolver, rechazar) {
        var img = new Image();
        img.onload = function () {
            var canvas = document.createElement("canvas");
            canvas.width = ancho;
            canvas.height = alto;
            var ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, ancho, alto);

            // Encaja la figura centrada, ocupando escalaFigura del ancho
            var lado = Math.min(ancho, alto) * (escalaFigura || 0.72);
            var fx = (ancho - lado) / 2;
            var fy = (alto - lado) / 2;
            ctx.drawImage(img, fx, fy, lado, lado);

            var datos = ctx.getImageData(0, 0, ancho, alto).data;
            var gris = new Uint8Array(ancho * alto);
            for (var i = 0; i < gris.length; i++) {
                var p = i * 4;
                gris[i] = (0.299 * datos[p] + 0.587 * datos[p + 1] + 0.114 * datos[p + 2]) | 0;
            }
            resolver(gris);
        };
        img.onerror = function () {
            rechazar(new Error("No se pudo cargar " + rutaPng));
        };
        img.src = rutaPng;
    });
}
