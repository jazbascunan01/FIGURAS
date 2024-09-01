    /*|¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|*/
    /*|                                          |*/
    /*|              INICIALIZACIÓN              |*/
    /*|                                          |*/
    /*|__________________________________________|*/

/**@type{HTMLCanvasElement} */
/**@type{CanvasRenderingContext2D} */
const canvas = document.getElementById('miCanvas');
const ctx = canvas.getContext('2d');
const mensajeElemento = document.getElementById('mensaje');
const regenerarBtn = document.getElementById('regenerarFiguras');
const deshacerBtn = document.getElementById('deshacer');
const rehacerBtn = document.getElementById('rehacer');
const reiniciarBtn = document.getElementById('reiniciar');
const descargarImagenBtn = document.getElementById('descargarImagen');

    /*|¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|*/
    /*|                                          |*/
    /*|            VARIABLES GLOBALES            |*/
    /*|                                          |*/
    /*|__________________________________________|*/

const cantFiguras = 5;
const delayIncrement = 200;
const velocidadMovimiento = 5;
const velocidadMovimientoRapida = 20;

let figuras = [];
let historialEstados = [];
let indiceHistorial = -1;
let coloresCirculos = [];
let coloresComplementariosUsados = new Set();

let figuraSeleccionada = null;
let offsetX, offsetY;
let isDragging = false;
let movimientoRapido = false;

let estadoInicial = null;
let cambiosRealizados = false;


    /*|¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|*/
    /*|                                          |*/
    /*|          FUNCIONES AUXILIARES            |*/
    /*|                                          |*/
    /*|__________________________________________|*/

function generarColorAleatorio() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r},${g},${b},1)`;
}

function colorComplementario(color) {
    const regex = /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([.\d]*)\)/;
    const matches = regex.exec(color);
    if (!matches) return 'rgba(0, 0, 0, 1)';

    const r = 255 - parseInt(matches[1]);
    const g = 255 - parseInt(matches[2]);
    const b = 255 - parseInt(matches[3]);
    return `rgba(${r},${g},${b},1)`;
}
function actualizarEstadoBotones() {
    deshacerBtn.disabled = indiceHistorial <= 0;
    rehacerBtn.disabled = indiceHistorial >= historialEstados.length - 1;
}

function guardarEstado() {
    const estadoActual = JSON.stringify({
        figuras: figuras.map(figura => figura.toJSON()),
        figuraSeleccionadaIndex: figuraSeleccionada ? figuras.indexOf(figuraSeleccionada) : -1
    });

    // No guardar si el estado actual es igual al último guardado
    if (historialEstados.length === 0 || historialEstados[indiceHistorial] !== estadoActual) {
        historialEstados = historialEstados.slice(0, indiceHistorial + 1);
        historialEstados.push(estadoActual);
        indiceHistorial++;
        actualizarEstadoBotones();
        cambiosRealizados = true;
        reiniciarBtn.disabled = false; // Habilitar el botón de reinicio si se ha realizado un cambio
    }
}

function guardarEstadoInicial() {
    estadoInicial = JSON.stringify({
        figuras: figuras.map(figura => figura.toJSON())
    });
    cambiosRealizados = true;
}

function restaurarEstadoInicial() {
    if (estadoInicial) {
        const estado = JSON.parse(estadoInicial);
        figuras = estado.figuras.map(figuraData => reconstruirFigura(figuraData));
        dibujarFiguras();
    }
}

function reiniciarCanvas() {
    if (cambiosRealizados) {
        restaurarEstadoInicial();
        historialEstados = [];
        indiceHistorial = -1;
        guardarEstado();
        actualizarEstadoBotones();
        cambiosRealizados = false;
        reiniciarBtn.disabled = true;
    }
}

    /*|¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|*/
    /*|                                          |*/
    /*|            CREACIÓN DE FIGURAS           |*/
    /*|                                          |*/
    /*|__________________________________________|*/

const crearFiguraFuncs = [
    () => {
        const radio = Math.random() * 40 + 25;
        const color = generarColorAleatorio();
        coloresCirculos.push(color);
        console.log(`Círculo - Color: ${color}`);
        return new Circulo(
            Math.random() * (canvas.width - radio * 2) + radio,
            Math.random() * (canvas.height - radio * 2) + radio,
            radio,
            color,
            ctx,
            false
        );
    },
    () => {
        const lado = Math.random() * 40 + 25;
        let colorComplementarioCuadrado;
        do {
            const colorCirculo = coloresCirculos[Math.floor(Math.random() * coloresCirculos.length)];
            colorComplementarioCuadrado = colorComplementario(colorCirculo);
        } while (coloresComplementariosUsados.has(colorComplementarioCuadrado));

        coloresComplementariosUsados.add(colorComplementarioCuadrado);
        console.log(`Cuadrado - Color complementario: ${colorComplementarioCuadrado}`);
        return new Cuadrado(
            Math.random() * (canvas.width - lado),
            Math.random() * (canvas.height - lado),
            lado,
            colorComplementarioCuadrado,
            ctx,
            false
        );
    },
    () => {
        const lado = Math.random() * 40 + 25;
        const x = Math.random() * (canvas.width - lado);
        const y = Math.random() * (canvas.height - lado);
        const width = lado * 2;
        const height = lado;

        return new Rectangulo(x, y, width, height, generarColorAleatorio(), ctx, false);
    }
];

function crearFiguras(figuraIndex, cantidad) {
    for (let i = 0; i < cantidad; i++) {
        const nuevaFigura = crearFiguraFuncs[figuraIndex]();
        if (nuevaFigura) {
            figuras.push(nuevaFigura);
        }
    }
}
function crearFigurasIniciales() {
    crearFiguras(0, cantFiguras); // Círculos
    crearFiguras(1, cantFiguras); // Cuadrados
    crearFiguras(2, cantFiguras); // Rectángulos
    dibujarFigurasConDelay(); // Inicialmente dibujar con retraso
}


    /*|¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|*/
    /*|                                          |*/
    /*|          FUNCIONES DE DIBUJO             |*/
    /*|                                          |*/
    /*|__________________________________________|*/

function dibujarFigurasConDelay() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    figuras.forEach((figura, index) => {
        setTimeout(() => figura.dibujar(ctx), index * delayIncrement);
    });
}

function dibujarFiguras() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    figuras.forEach(figura => {
        if (figura) {
            figura.dibujar(ctx);
        }
    });
}

    /*|¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|*/
    /*|                                          |*/
    /*|                 EVENTOS                  |*/
    /*|                                          |*/
    /*|__________________________________________|*/

function configurarEventos() {
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    document.addEventListener('keydown', handleDocumentKeyDown);
    regenerarBtn.addEventListener('click', regenerarFiguras);
    deshacerBtn.addEventListener('click', deshacer);
    rehacerBtn.addEventListener('click', rehacer);
    reiniciarBtn.addEventListener('click', reiniciarCanvas);
    canvas.addEventListener('mouseleave', handleCanvasMouseLeave);
    descargarImagenBtn.addEventListener('click', handleDownloadButton)
    reiniciarBtn.disabled = true;
}
function handleDownloadButton() {
    const canvas = document.getElementById('miCanvas');
    const link = document.createElement('a');
    link.download = 'canvas_image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
};
function handleCanvasClick(event) {
    const { x, y } = getCanvasCoordinates(event);
    procesarClick(x, y);
}

function handleCanvasMouseDown(event) {
    const { x, y } = getCanvasCoordinates(event);
    deseleccionarFiguras();
    seleccionarFigura(x, y);
    if (figuraSeleccionada) {
        canvas.style.cursor = 'move';
    }
}

function handleCanvasMouseMove(event) {
    if (figuraSeleccionada && isDragging) {
        const { x, y } = getCanvasCoordinates(event);
        moverFigura(x, y);
        canvas.style.cursor = 'move';
    }
}
function handleCanvasMouseUp() {
    if (isDragging) {
        guardarEstado();
    }
    figuraSeleccionada = null;
    isDragging = false;
    dibujarFiguras();
    canvas.style.cursor = 'default';
}

function handleDocumentKeyDown(event) {
    if (event.ctrlKey && event.key === 'z') {
        deshacer();
    } else if (event.ctrlKey && event.key === 'y') {
        rehacer();
    } else if (figuraSeleccionada) {
        moverFiguraConTeclado(event.key);
        guardarEstado();
    }
}
function handleCanvasMouseLeave() {
    if (isDragging) {
        // Soltar la figura si se está arrastrando cuando el cursor sale del canvas
        isDragging = false;
        // Mantener la figura seleccionada
        if (figuraSeleccionada) {
            figuraSeleccionada.seleccionada = true;
        }
        else {
            canvas.style.cursor = 'default';
        }
        guardarEstado();
        dibujarFiguras();
    }
    if (!isDragging) {
        canvas.style.cursor = 'default';
    }
}
function deshacer() {
    if (indiceHistorial > 0) {
        figuraSeleccionadaAntesAccion = figuraSeleccionada;
        indiceHistorial--;
        movimientoRapido = true;
        const estado = JSON.parse(historialEstados[indiceHistorial]);
        figuras = estado.figuras.map(figuraData => reconstruirFigura(figuraData));
        const figuraIndex = estado.figuraSeleccionadaIndex;
        figuraSeleccionada = (figuraIndex >= 0 && figuraIndex < figuras.length) ? figuras[figuraIndex] : null;

        console.log('Después de deshacer - Figura seleccionada:', figuraSeleccionada);

        dibujarFiguras();
        movimientoRapido = false;

        if (figuraSeleccionada) {
            figuraSeleccionada.seleccionada = true;
        }
        dibujarFiguras();
        actualizarEstadoBotones();
        if (indiceHistorial === 0) {
            reiniciarBtn.disabled = true;
        }
    }
}

function rehacer() {
    if (indiceHistorial < historialEstados.length - 1) {
        figuraSeleccionadaAntesAccion = figuraSeleccionada;
        indiceHistorial++;
        movimientoRapido = true;
        const estado = JSON.parse(historialEstados[indiceHistorial]);
        figuras = estado.figuras.map(figuraData => reconstruirFigura(figuraData));
        const figuraIndex = estado.figuraSeleccionadaIndex;
        figuraSeleccionada = (figuraIndex >= 0 && figuraIndex < figuras.length) ? figuras[figuraIndex] : null;

        console.log('Después de rehacer - Figura seleccionada:', figuraSeleccionada);

        dibujarFiguras();
        movimientoRapido = false;

        if (figuraSeleccionada) {
            figuraSeleccionada.seleccionada = true;
        }
        dibujarFiguras();
        actualizarEstadoBotones();

        // Habilitar el botón de "Reiniciar" si se han realizado cambios
        reiniciarBtn.disabled = false;
        cambiosRealizados = true;
    }
}


function reconstruirFigura(figuraData) {
    let figura;
    switch (figuraData.tipo) {
        case 'Circulo':
            figura = new Circulo(figuraData.x, figuraData.y, figuraData.radio, figuraData.color);
            break;
        case 'Cuadrado':
            figura = new Cuadrado(figuraData.x, figuraData.y, figuraData.ancho, figuraData.color);
            break;
        case 'Rectangulo':
            figura = new Rectangulo(
                figuraData.x,
                figuraData.y,
                figuraData.ancho,
                figuraData.alto,
                figuraData.color,
                figuraData.colorInicio,
                figuraData.colorFin
            );
            break;
        default:
            return null;
    }
    figura.seleccionada = figuraData.seleccionada; // Restaurar el estado de selección
    return figura;
}

    /*|¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|*/
    /*|                                          |*/
    /*|          FUNCIONES DE UTILIDAD           |*/
    /*|                                          |*/
    /*|__________________________________________|*/

function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function procesarClick(x, y) {
    let figuraEncontrada = false;
    let figuraAnteriormenteSeleccionada = figuraSeleccionada;

    figuras.forEach(figura => figura.seleccionada = false);

    for (let i = figuras.length - 1; i >= 0; i--) {
        if (figuras[i].contienePunto(x, y)) {
            figuraSeleccionada = figuras[i];
            figuraSeleccionada.seleccionada = true;
            figuraEncontrada = true;
            break;
        }
    }

    // Solo guarda el estado si se realizó un cambio significativo
    if (figuraAnteriormenteSeleccionada !== figuraSeleccionada || !figuraSeleccionada) {
        guardarEstado();
    }

    mensajeElemento.textContent = figuraEncontrada ? '¡Clic dentro de una figura!' : 'En ese lugar no se encuentra ninguna figura.';
    dibujarFiguras();
}

    /*|¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|*/
    /*|                                          |*/
    /*|                  FIGURAS                 |*/
    /*|                                          |*/
    /*|__________________________________________|*/

function seleccionarFigura(x, y) {
    for (let i = figuras.length - 1; i >= 0; i--) {
        if (figuras[i].contienePunto(x, y)) {
            figuraSeleccionada = figuras[i];
            offsetX = x - figuraSeleccionada.x;
            offsetY = y - figuraSeleccionada.y;
            isDragging = true;
            figuraSeleccionada.seleccionada = true;
            break;
        }
    }
}

function moverFigura(x, y) {
    if (figuraSeleccionada) {
        figuraSeleccionada.mover(x - offsetX, y - offsetY, isDragging);
        dibujarFiguras();
        cambiosRealizados = true;
        reiniciarBtn.disabled = false;
    }
}

function moverFiguraConTeclado(key) {
    const step = movimientoRapido ? velocidadMovimientoRapida : velocidadMovimiento;
    let cambio = false;
    switch (key) {
        case 'ArrowUp':
            figuraSeleccionada.y -= step;
            cambio = true;
            break;
        case 'ArrowDown':
            figuraSeleccionada.y += step;
            cambio = true;
            break;
        case 'ArrowLeft':
            figuraSeleccionada.x -= step;
            cambio = true;
            break;
        case 'ArrowRight':
            figuraSeleccionada.x += step;
            cambio = true;
            break;
    }

    if (cambio) {
        figuraSeleccionada.ajustarPosicionFigura(figuraSeleccionada);
        guardarEstado();
        dibujarFiguras();
        cambiosRealizados = true; // Indicar que se han realizado cambios
        reiniciarBtn.disabled = false; // Habilitar el botón de reinicio
    }
}


function deseleccionarFiguras() {
    figuras.forEach(figura => figura.seleccionada = false);
}


function regenerarFiguras() {
    deshacerBtn.disabled = true;
    historialEstados = [];
    indiceHistorial = -1;
    figuras = [];
    coloresCirculos = [];
    coloresComplementariosUsados = new Set();
    crearFigurasIniciales();
    guardarEstado();
    guardarEstadoInicial();
    setTimeout(() => {
        actualizarEstadoBotones();
    }, cantFiguras * delayIncrement);
    cambiosRealizados = false;
}


    /*|¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯|*/
    /*|                                          |*/
    /*|                   MAIN                   |*/
    /*|                                          |*/
    /*|__________________________________________|*/

function main() {
    crearFigurasIniciales();
    guardarEstado();
    guardarEstadoInicial();
    configurarEventos();
    actualizarEstadoBotones();
}

main();


