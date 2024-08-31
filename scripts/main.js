/**@type{HTMLCanvasElement} */
/**@type{CanvasRenderingContext2D} */
const canvas = document.getElementById('miCanvas');
const ctx = canvas.getContext('2d');
const mensajeElemento = document.getElementById('mensaje');
const regenerarBtn = document.getElementById('regenerarFiguras');
const deshacerBtn = document.getElementById('deshacer');
const rehacerBtn = document.getElementById('rehacer');
const cantFiguras = 5;
const delayIncrement = 200; // Tiempo de retraso entre dibujos
const velocidadMovimiento = 5; // Velocidad normal
const velocidadMovimientoRapida = 20; // Velocidad rápida para deshacer/rehacer
const reiniciarBtn = document.getElementById('reiniciar');

let figuras = [];
let historialEstados = [];
let indiceHistorial = -1;
let coloresCirculos = []; // Array para almacenar colores de los círculos
let coloresComplementariosUsados = new Set(); // Set para colores complementarios usados

let figuraSeleccionada = null;
let offsetX, offsetY;
let isDragging = false;
let movimientoRapido = false; // Controlar si el movimiento es rápido

// Funciones Auxiliares
function generarColorAleatorio() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r},${g},${b},1)`;
}

function colorComplementario(color) {
    const regex = /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([.\d]*)\)/;
    const matches = regex.exec(color);
    if (!matches) return 'rgba(0, 0, 0, 1)'; // Valor por defecto si no hay match

    const r = 255 - parseInt(matches[1]);
    const g = 255 - parseInt(matches[2]);
    const b = 255 - parseInt(matches[3]);
    return `rgba(${r},${g},${b},1)`;
}

// Funciones de Creación de Figuras
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
        const width = lado * 2;  // Asegúrate de definir width correctamente
        const height = lado;     // Asegúrate de definir height correctamente

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

// Funciones de Dibujo
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

// Funciones de Eventos
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
    reiniciarBtn.disabled = true; 
}

function handleCanvasClick(event) {
    const { x, y } = getCanvasCoordinates(event);
    procesarClick(x, y);
}

function handleCanvasMouseDown(event) {
    const { x, y } = getCanvasCoordinates(event);
    deseleccionarFiguras();
    seleccionarFigura(x, y);
}

function handleCanvasMouseMove(event) {
    if (figuraSeleccionada && isDragging) {
        const { x, y } = getCanvasCoordinates(event);
        moverFigura(x, y);
    }
}

function handleCanvasMouseUp() {
    figuraSeleccionada = null;
    isDragging = false;
    guardarEstado(); // Guardar estado después de mover la figura
    dibujarFiguras();
}

function handleDocumentKeyDown(event) {
    if (event.ctrlKey && event.key === 'z') {
        deshacer();
    } else if (event.ctrlKey && event.key === 'y') {
        rehacer();
    } else if (figuraSeleccionada) {
        moverFiguraConTeclado(event.key);
        guardarEstado(); // Guardar estado después de mover con teclado
    }
}
function actualizarEstadoBotones() {
    deshacerBtn.disabled = indiceHistorial <= 0;
    rehacerBtn.disabled = indiceHistorial >= historialEstados.length - 1;
}

function guardarEstado() {
    const figuraSeleccionadaIndex = figuraSeleccionada ? figuras.indexOf(figuraSeleccionada) : -1;

    historialEstados = historialEstados.slice(0, indiceHistorial + 1);
    historialEstados.push(JSON.stringify({
        figuras: figuras.map(figura => figura.toJSON()),
        figuraSeleccionadaIndex
    }));
    indiceHistorial++;
    actualizarEstadoBotones(); // Actualizar el estado de los botones después de guardar
}

let estadoInicial = null;
let cambiosRealizados = false;

// Función para guardar el estado inicial
function guardarEstadoInicial() {
    estadoInicial = JSON.stringify({
        figuras: figuras.map(figura => figura.toJSON())
    });
    cambiosRealizados = true;
}

// Función para restaurar el estado inicial
function restaurarEstadoInicial() {
    if (estadoInicial) {
        const estado = JSON.parse(estadoInicial);
        figuras = estado.figuras.map(figuraData => reconstruirFigura(figuraData));
        dibujarFiguras();
    }
}

function reiniciarCanvas() {
    if (cambiosRealizados) { // Verifica si se han realizado cambios
        // Restaurar el estado inicial del lienzo
        restaurarEstadoInicial();

        // Limpiar el historial de deshacer/rehacer
        historialEstados = [];
        indiceHistorial = -1;

        // Actualizar el estado de los botones
        actualizarEstadoBotones();

        cambiosRealizados = false; // Restablecer la variable después de reiniciar
        reiniciarBtn.disabled = true; // Bloquear el botón de reiniciar después de reiniciar
    }
}


function deshacer() {
    if (indiceHistorial > 0) {
        figuraSeleccionadaAntesAccion = figuraSeleccionada;

        // Realizar deshacer
        indiceHistorial--;
        movimientoRapido = true; // Activar movimiento rápido para deshacer
        const estado = JSON.parse(historialEstados[indiceHistorial]);
        figuras = estado.figuras.map(figuraData => reconstruirFigura(figuraData));
        const figuraIndex = estado.figuraSeleccionadaIndex;
        figuraSeleccionada = (figuraIndex >= 0 && figuraIndex < figuras.length) ? figuras[figuraIndex] : null;

        console.log('Después de deshacer - Figura seleccionada:', figuraSeleccionada);

        dibujarFiguras();
        movimientoRapido = false; // Desactivar movimiento rápido después de deshacer

        if (figuraSeleccionada) {
            figuraSeleccionada.seleccionada = true;
        }
        dibujarFiguras(); // Redibujar para reflejar la selección
        actualizarEstadoBotones(); 
    }
}

function rehacer() {
    if (indiceHistorial < historialEstados.length - 1) {
        figuraSeleccionadaAntesAccion = figuraSeleccionada;

        // Realizar rehacer
        indiceHistorial++;
        movimientoRapido = true; // Activar movimiento rápido para rehacer
        const estado = JSON.parse(historialEstados[indiceHistorial]);
        figuras = estado.figuras.map(figuraData => reconstruirFigura(figuraData));
        const figuraIndex = estado.figuraSeleccionadaIndex;
        figuraSeleccionada = (figuraIndex >= 0 && figuraIndex < figuras.length) ? figuras[figuraIndex] : null;

        console.log('Después de rehacer - Figura seleccionada:', figuraSeleccionada);

        dibujarFiguras();
        movimientoRapido = false; // Desactivar movimiento rápido después de rehacer

        if (figuraSeleccionada) {
            figuraSeleccionada.seleccionada = true;
        }
        dibujarFiguras(); // Redibujar para reflejar la selección
        actualizarEstadoBotones(); 
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



// Funciones de Utilidad
function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function procesarClick(x, y) {
    let figuraEncontrada = false;

    figuras.forEach(figura => figura.seleccionada = false);

    for (let i = figuras.length - 1; i >= 0; i--) {
        if (figuras[i].contienePunto(x, y)) {
            figuraSeleccionada = figuras[i];
            figuraSeleccionada.seleccionada = true;
            figuraEncontrada = true;
            break;
        }
    }

    mensajeElemento.textContent = figuraEncontrada ? '¡Clic dentro de una figura!' : 'En ese lugar no se encuentra ninguna figura.';
    dibujarFiguras();
}

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
    switch (key) {
        case 'ArrowUp':
            figuraSeleccionada.y -= step;
            break;
        case 'ArrowDown':
            figuraSeleccionada.y += step;
            break;
        case 'ArrowLeft':
            figuraSeleccionada.x -= step;
            break;
        case 'ArrowRight':
            figuraSeleccionada.x += step;
            break;
    }
    figuraSeleccionada.ajustarPosicionFigura(figuraSeleccionada);
    dibujarFiguras();
}

function deseleccionarFiguras() {
    figuras.forEach(figura => figura.seleccionada = false);
}


function regenerarFiguras() {
    // Deshabilitar el botón de deshacer mientras se regeneran las figuras
    deshacerBtn.disabled = true;

    // Limpiar el historial de estados
    historialEstados = [];
    indiceHistorial = -1;

    figuras = []; // Limpiar figuras existentes
    coloresCirculos = []; // Limpiar colores de círculos
    coloresComplementariosUsados = new Set(); // Limpiar colores complementarios usados

    // Crear nuevas figuras y dibujarlas
    crearFigurasIniciales();

    // Guardar el estado después de crear las nuevas figuras
    guardarEstado();
    guardarEstadoInicial(); // Actualizar el estado inicial después de regenerar las figuras

    // Habilitar el botón de deshacer después de que el canvas ha sido actualizado
    setTimeout(() => {
        actualizarEstadoBotones(); // Actualizar el estado de los botones
    }, cantFiguras * delayIncrement); // Ajustar el tiempo según el retraso total de los dibujos

    cambiosRealizados = false; // Después de regenerar, no hay cambios hasta que se mueva una figura
}



// Función Principal
function main() {
    crearFigurasIniciales();
    guardarEstado(); // Guardar el estado después de crear las figuras iniciales
    guardarEstadoInicial(); // Guardar el estado inicial
    configurarEventos();
    actualizarEstadoBotones();
}


function crearFigurasIniciales() {
    crearFiguras(0, cantFiguras); // Círculos
    crearFiguras(1, cantFiguras); // Cuadrados
    crearFiguras(2, cantFiguras); // Rectángulos
    dibujarFigurasConDelay(); // Inicialmente dibujar con retraso
}

// Inicializar la aplicación
main();
