"use strict";

/*
 * Motor de estereogramas — port fiel de "Hugo 24bit" (24bit.frm, Visual Basic 6).
 *
 * El algoritmo original construye cada fila desde el centro hacia afuera:
 *   1. Copia un período completo (Tau píxeles) del patrón visible en el
 *      centro de la fila.
 *   2. Propaga hacia la izquierda y la derecha copiando el píxel que está
 *      a una distancia tai[] (el período local), que varía según la
 *      profundidad del mapa oculto:  tai(k) = Tau - (fondo - h(k)) * paso
 *   3. Si ambos frentes se traban, rellena tomando del patrón original con
 *      envoltura (wrap) y sigue.
 *
 * Diferencias deliberadas con el original (de interfaz, no de lógica):
 *   - Entrada/salida como buffers RGBA (compatibles con ImageData de canvas)
 *     en vez de archivos BMP.
 *   - La profundidad sale de la luminancia (0-255) cuantizada a `niveles`,
 *     en vez del índice de paleta de un BMP de 8 bits. Equivalente funcional.
 *   - Guardas de rango en los pocos casos en que el original accedería
 *     fuera del array (VB6 habría cortado con "Subscript out of range").
 *
 * Optimizaciones (misma lógica y salida idéntica byte a byte, menos trabajo):
 *   - Cada píxel viaja empaquetado en un entero de 32 bits con el orden de
 *     bytes de ImageData, y la propagación escribe DIRECTO sobre el buffer
 *     de salida: se elimina la pasada final de volcado píxel por píxel.
 *   - La cuantización gris→período se precalcula en una tabla de 256
 *     entradas (una consulta por píxel en vez de una llamada con aritmética).
 *   - Sin arrays intermedios por fila (h y p eliminados).
 */

var LITTLE_ENDIAN = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;

// Empaqueta un color como se ve en memoria dentro de ImageData ([r,g,b,a]),
// con alfa opaco, según el orden de bytes de la plataforma.
function empaquetar(r, g, b) {
    return LITTLE_ENDIAN
        ? (0xff000000 | (b << 16) | (g << 8) | r) >>> 0
        : (((r << 24) | (g << 16) | (b << 8) | 0xff) >>> 0);
}

// Luminancia 0..255 -> nivel de profundidad 0..(niveles-1)
function cuantizarNivel(gris, niveles) {
    var n = Math.floor((gris * niveles) / 256);
    if (n > niveles - 1) n = niveles - 1;
    if (n < 0) n = 0;
    return n;
}

/*
 * opts:
 *   ancho, alto   : dimensiones de salida (= dimensiones del mapa oculto)
 *   ocultoGris    : Uint8Array ancho*alto, luminancia del mapa de profundidad
 *   visible       : { data: RGBA Uint8ClampedArray, width, height } patrón
 *   t0            : Tau, período base en píxeles (se fuerza a par, como el original)
 *   paso          : desplazamiento en px por nivel de profundidad.
 *                   Con fondo=0 y paso NEGATIVO, los tonos claros del oculto
 *                   "salen hacia adelante" en visión paralela (Magic Eye).
 *   fondo         : nivel de profundidad del fondo (default 0)
 *   niveles       : cantidad de niveles de profundidad (default 8)
 *
 * Devuelve { data: Uint8ClampedArray RGBA, width, height }
 */
function generarEstereograma(opts) {
    var an = opts.ancho;
    var al = opts.alto;
    var ocultoGris = opts.ocultoGris;
    var visible = opts.visible;
    var t0 = opts.t0 !== undefined ? opts.t0 : 110;
    var paso = opts.paso !== undefined ? opts.paso : -3;
    var fondo = opts.fondo !== undefined ? opts.fondo : 0;
    var niveles = opts.niveles !== undefined ? opts.niveles : 8;

    // Original: If t0 Mod 2 <> 0 Then t0 = t0 - 1
    if (t0 % 2 !== 0) t0 = t0 - 1;

    // Original: centro = an/2 si es par, (an-1)/2 si es impar
    var centro = Math.floor(an / 2);

    // Tabla gris -> período local (la fórmula original, precalculada)
    var taiLUT = new Int32Array(256);
    for (var g = 0; g < 256; g++) {
        taiLUT[g] = t0 - (fondo - cuantizarNivel(g, niveles)) * paso;
    }

    var out32 = new Uint32Array(an * al);
    var tai = new Int32Array(an);
    var ori = new Uint32Array(t0);
    var NEGRO = empaquetar(0, 0, 0); // VB inicializa los arrays en negro

    var vw = visible.width;
    var vh = visible.height;
    var vdata = visible.data;

    for (var y = 0; y < al; y++) {

        // ori: un período del patrón visible en esta fila (el original leía
        // los primeros t0 píxeles de la fila y exigía anchoVisible >= t0;
        // acá tileamos por si el patrón es más angosto)
        var vfila = (y % vh) * vw;
        for (var k = 0; k < t0; k++) {
            var voff = (vfila + (k % vw)) * 4;
            ori[k] = empaquetar(vdata[voff], vdata[voff + 1], vdata[voff + 2]);
        }

        // tai: período local según la profundidad del oculto en esta fila
        var filaOc = y * an;
        for (k = 0; k < an; k++) {
            tai[k] = taiLUT[ocultoGris[filaOc + k]];
        }

        // p es directamente la fila del buffer de salida
        var p = out32.subarray(filaOc, filaOc + an);
        p.fill(NEGRO);

        var tm = tai[centro];
        if (tm < 2 || tm > t0 * 2) {
            throw new Error("Configuracion invalida: tai(centro)=" + tm +
                " (revisar t0/paso/niveles)");
        }
        var av = Math.floor((t0 - tm) / 2);
        var izq = Math.floor(centro - tm / 2);
        var der = Math.floor(centro + tm / 2);

        // Copia el período central del patrón (con wrap por seguridad; en el
        // caso normal es idéntico al original, que indexaba ori(n+av) directo)
        for (var n2 = 0; n2 < tm; n2++) {
            var idx = n2 + av;
            if (idx < 0 || idx >= t0) idx = ((idx % t0) + t0) % t0;
            p[izq + n2] = ori[idx];
        }

        // Propagación hacia ambos lados. di/dd son constantes por fila
        // (el original los recalculaba dentro del loop con el mismo valor).
        var di = 1 + Math.floor(tm / 2);
        var dd = Math.floor(tm / 2);
        var n = izq - 1;
        var m = der;
        var iteraciones = 0;

        for (;;) {
            while (n >= 0 && n + tai[n + di] <= m) {
                p[n] = p[n + tai[n + di]];
                n = n - 1;
            }

            while (m < an && m - tai[m - dd] >= n) {
                p[m] = p[m - tai[m - dd]];
                m = m + 1;
            }

            // Deadlock: ninguno de los dos frentes puede avanzar.
            // Fórmula original: toma del patrón ori con envoltura.
            if (n >= 0 && m < an &&
                n + tai[n + di] > m && m - tai[m - dd] < n) {
                var e = n + av - izq;
                var idxd = e > 0 ? e : (e < 0 ? t0 + e : 0);
                if (idxd < 0 || idxd >= t0) idxd = ((idxd % t0) + t0) % t0;
                p[n] = ori[idxd];
                n = n - 1;
            } else if (n < 0 && m < an && m - tai[m - dd] < n) {
                // Caso simétrico del deadlock que el original no cubría
                // (habría dado subíndice fuera de rango): relleno espejado.
                var em = m + av - izq;
                if (em < 0 || em >= t0) em = ((em % t0) + t0) % t0;
                p[m] = ori[em];
                m = m + 1;
            }

            if (n < 0 && m >= an) break;

            // Red de seguridad ante un ciclo sin progreso (imposible en la
            // práctica; el original se colgaría). Nunca debería correr.
            iteraciones++;
            if (iteraciones > an * 4) {
                while (n >= 0) { p[n] = ori[(((n + av - izq) % t0) + t0) % t0]; n--; }
                while (m < an) { p[m] = ori[(((m + av - izq) % t0) + t0) % t0]; m++; }
                break;
            }
        }
    }

    // El buffer de 32 bits ES el buffer RGBA: se comparte, no se copia.
    return { data: new Uint8ClampedArray(out32.buffer), width: an, height: al };
}

// Uso dual: navegador (window.Estereograma) y Node (require) para los tests.
if (typeof module !== "undefined" && module.exports) {
    module.exports = { generarEstereograma: generarEstereograma, cuantizarNivel: cuantizarNivel };
} else {
    (typeof window !== "undefined" ? window : globalThis).Estereograma = {
        generarEstereograma: generarEstereograma,
        cuantizarNivel: cuantizarNivel
    };
}
