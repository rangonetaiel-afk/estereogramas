"use strict";

/*
 * Lógica de la página: selección de temáticas y colores, generación del
 * estereograma en el propio celular, guardado y versión para ojos cruzados.
 */
(function () {

    var estado = {
        oculto: null,      // id de tema para la imagen oculta
        visible: null,     // id de tema para el patrón visible
        colores: [],       // hasta 3 hex
        cruzado: false,    // false = visión paralela, true = ojos cruzados
        ultimaGeneracion: null
    };

    function $(id) { return document.getElementById(id); }

    function temaPorId(id) {
        for (var i = 0; i < TEMAS.length; i++) if (TEMAS[i].id === id) return TEMAS[i];
        return null;
    }

    // ---------- armado de las grillas ----------

    function armarGrillaTemas(contenedorId, clave) {
        var cont = $(contenedorId);
        TEMAS.forEach(function (tema) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "chip";
            b.innerHTML = "<span class='chip-emoji'>" + tema.emoji + "</span>" +
                "<span class='chip-nombre'>" + tema.nombre + "</span>";
            b.addEventListener("click", function () {
                estado[clave] = tema.id;
                Array.prototype.forEach.call(cont.children, function (h) {
                    h.classList.remove("elegido");
                });
                b.classList.add("elegido");
                actualizarBoton();
            });
            cont.appendChild(b);
        });
    }

    function armarPaleta() {
        var cont = $("grilla-colores");
        PALETA.forEach(function (color) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "swatch";
            b.style.background = color.hex;
            b.title = color.nombre;
            b.setAttribute("aria-label", color.nombre);
            b.addEventListener("click", function () {
                var idx = estado.colores.indexOf(color.hex);
                if (idx >= 0) {
                    estado.colores.splice(idx, 1);
                    b.classList.remove("elegido");
                } else if (estado.colores.length < 3) {
                    estado.colores.push(color.hex);
                    b.classList.add("elegido");
                }
                $("contador-colores").textContent = estado.colores.length + " de 3";
                actualizarBoton();
            });
            cont.appendChild(b);
        });
    }

    function actualizarBoton() {
        var listo = estado.oculto && estado.visible && estado.colores.length === 3;
        $("boton-crear").disabled = !listo;
    }

    // ---------- generación ----------

    function pantalla(nombre) {
        $("pantalla-crear").classList.toggle("oculta", nombre !== "crear");
        $("pantalla-resultado").classList.toggle("oculta", nombre !== "resultado");
        window.scrollTo(0, 0);
    }

    function generar() {
        var boton = $("boton-crear");
        boton.disabled = true;
        boton.textContent = "Creando tu estereograma...";

        var dpr = Math.min(window.devicePixelRatio || 1, 3);
        var contAncho = Math.min($("pantalla-crear").clientWidth || 360, 480);
        var W = Math.round(contAncho * dpr);
        var H = Math.round(W * CONFIG.PROPORCION_ALTO);
        var t0 = Math.round(CONFIG.T0_CSS * dpr);
        if (t0 % 2 !== 0) t0 -= 1;
        var paso = Math.max(2, Math.round(CONFIG.PASO_CSS * dpr));
        if (!estado.cruzado) paso = -paso; // paralelo: la figura "sale" hacia adelante

        var temaOculto = temaPorId(estado.oculto);
        var temaVisible = temaPorId(estado.visible);

        cargarOculto("assets/ocultos/" + temaOculto.id + ".png", W, H,
                     CONFIG.ESCALA_FIGURA, CONFIG.SUAVIZADO)
            .then(function (gris) {
                var patron = generarPatron(temaVisible, estado.colores, t0, H);
                var resultado = Estereograma.generarEstereograma({
                    ancho: W, alto: H, ocultoGris: gris, visible: patron,
                    t0: t0, paso: paso, fondo: CONFIG.FONDO, niveles: CONFIG.NIVELES
                });

                var canvas = $("lienzo");
                canvas.width = W;
                canvas.height = H;
                canvas.style.width = contAncho + "px";
                canvas.getContext("2d").putImageData(new ImageData(resultado.data, W, H), 0, 0);

                estado.ultimaGeneracion = { temaOculto: temaOculto, temaVisible: temaVisible };
                $("titulo-resultado").textContent =
                    "Buscá: " + temaOculto.nombre + " " + temaOculto.emoji;
                $("boton-cruzado").textContent = estado.cruzado
                    ? "Volver a la versión normal"
                    : "Versión para ojos cruzados";
                pantalla("resultado");
            })
            .catch(function (err) {
                alert("No se pudo generar la imagen: " + err.message);
            })
            .then(function () {
                boton.textContent = "✨ Crear mi estereograma";
                actualizarBoton();
            });
    }

    // ---------- acciones del resultado ----------

    function guardar() {
        var nombre = "estereograma-" +
            (estado.ultimaGeneracion ? estado.ultimaGeneracion.temaOculto.id : "img") + ".png";
        $("lienzo").toBlob(function (blob) {
            var a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = nombre;
            a.click();
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
        });
    }

    function alternarCruzado() {
        estado.cruzado = !estado.cruzado;
        generar();
    }

    // ---------- arranque ----------

    document.addEventListener("DOMContentLoaded", function () {
        $("nombre-restaurante").textContent = CONFIG.RESTAURANTE;

        armarGrillaTemas("grilla-ocultos", "oculto");
        armarGrillaTemas("grilla-visibles", "visible");
        armarPaleta();

        var lista = $("lista-explicacion");
        EXPLICACION.forEach(function (paso) {
            var li = document.createElement("li");
            li.textContent = paso;
            lista.appendChild(li);
        });
        $("nota-honesta").textContent = NOTA_HONESTA;

        $("boton-crear").addEventListener("click", generar);
        $("boton-guardar").addEventListener("click", guardar);
        $("boton-cruzado").addEventListener("click", alternarCruzado);
        $("boton-volver").addEventListener("click", function () {
            estado.cruzado = false;
            pantalla("crear");
        });
        $("boton-menu").addEventListener("click", function () {
            $("aviso-menu").classList.toggle("oculta");
        });
    });

})();
