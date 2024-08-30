/**@type{HTMLCanvasElement} */
/**@type{CanvasRenderingContext2D} */
const canvas = document.getElementById('miCanvas');
const ctx = canvas.getContext('2d');
const mensajeElemento = document.getElementById('mensaje');
const regenerarBtn = document.getElementById('regenerarFiguras');
const cantFiguras = 5;
const delayIncrement = 200; // Tiempo de retraso entre dibujos

let figuras = [];
let coloresCirculos = []; // Array para almacenar colores de los círculos
let coloresComplementariosUsados = new Set(); // Set para colores complementarios usados

let figuraSeleccionada = null;
let offsetX, offsetY;
let isDragging = false;

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

        return new Rectangulo(x, y, width, height, null, ctx, false);
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
    figuras.forEach(figura => figura.dibujar(ctx));
}

// Funciones de Eventos
function configurarEventos() {
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    document.addEventListener('keydown', handleDocumentKeyDown);
    regenerarBtn.addEventListener('click', regenerarFiguras);
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
    dibujarFiguras();
}

function handleDocumentKeyDown(event) {
    if (figuraSeleccionada) {
        moverFiguraConTeclado(event.key);
    }
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
    figuraSeleccionada.x = x - offsetX;
    figuraSeleccionada.y = y - offsetY;
    figuraSeleccionada.ajustarPosicionFigura(figuraSeleccionada);
    dibujarFiguras();
}

function moverFiguraConTeclado(key) {
    const step = 5;
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
    figuras = []; // Limpiar figuras existentes
    coloresCirculos = []; // Limpiar colores de círculos
    coloresComplementariosUsados = new Set(); // Limpiar colores complementarios usados
    crearFigurasIniciales(); // Crear nuevas figuras
}


// Función Principal
function main() {
    crearFigurasIniciales();
    configurarEventos();
}

function crearFigurasIniciales() {
    crearFiguras(0, cantFiguras); // Círculos
    crearFiguras(1, cantFiguras); // Cuadrados
    crearFiguras(2, cantFiguras); // Rectángulos
    dibujarFigurasConDelay(); // Inicialmente dibujar con retraso
}

// Inicializar la aplicación
main();
