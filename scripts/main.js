let figuras = [];
const mensajeElemento = document.getElementById('mensaje');
const cantFiguras = 5;
let delay = 100;

let coloresCirculos = []; // Array para almacenar colores de los círculos
let coloresComplementariosUsados = new Set(); // Set para almacenar colores complementarios usados para los cuadrados

function crearFigurasIniciales() {
    // Crear todos los círculos primero
    for (let i = 0; i < cantFiguras; i++) {
        agregarFigura(0); // Índice 0 para círculos
    }

    // Crear todos los cuadrados después de que se hayan creado todos los círculos
    for (let i = 0; i < cantFiguras; i++) {
        agregarFigura(1); // Índice 1 para cuadrados
    }

    // Crear todos los rectángulos después
    for (let i = 0; i < cantFiguras; i++) {
        agregarFigura(2); // Índice 2 para rectángulos
    }

    // Finalmente, dibujar todas las figuras
    dibujarFiguras();
}

const crearFiguraFuncs = [
    // Función para crear círculos
    () => {
        let radio = Math.random() * 40 + 25; // Definir radio aleatorio
        let color = generarColorAleatorio(); // Generar un color aleatorio
        coloresCirculos.push(color); // Guardar color del círculo
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
    // Función para crear cuadrados
    () => {
        let lado = Math.random() * 40 + 25; // Definir lado aleatorio

        // Calcular un color complementario a todos los colores de los círculos
        let colorComplementarioCuadrado;
        do {
            const colorCirculoSeleccionado = coloresCirculos[Math.floor(Math.random() * coloresCirculos.length)];
            colorComplementarioCuadrado = colorComplementario(colorCirculoSeleccionado);
        } while (coloresComplementariosUsados.has(colorComplementarioCuadrado)); // Repetir si ya se usó este color complementario

        coloresComplementariosUsados.add(colorComplementarioCuadrado); // Marcar el color como usado
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
    // Función para crear rectángulos
    () => {
        let lado = Math.random() * 40 + 25; // Definir lado aleatorio
        // Asignar color blanco o negro aleatoriamente
        let color = Math.random() < 0.5 ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)';
        return new Rectangulo(
            Math.random() * (canvas.width - lado),
            Math.random() * (canvas.height - lado),
            lado * 2,
            lado,
            color,
            ctx,
            false
        );
    },
];


function generarColorAleatorio() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return `rgba(${r},${g},${b},1)`;
}

// Función para generar un color complementario en formato rgba
function colorComplementario(color) {
    const regex = /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([.\d]*)\)/;
    const matches = regex.exec(color);
    if (!matches) return 'rgba(0, 0, 0, 1)'; // Valor por defecto si no hay match

    let r = 255 - parseInt(matches[1]);
    let g = 255 - parseInt(matches[2]);
    let b = 255 - parseInt(matches[3]);
    let a = 1;

    return `rgba(${r},${g},${b},${a})`;
}

// Función para agregar figuras al array de figuras
function agregarFigura(figuraIndex) {
    const crearFigura = crearFiguraFuncs[figuraIndex];
    const nuevaFigura = crearFigura();
    if (nuevaFigura) {  // Verificar que la figura se haya creado correctamente
        figuras.push(nuevaFigura);
    }
}

// Función para dibujar todas las figuras
function dibujarFiguras() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas
    figuras.forEach(figura => figura.dibujar(ctx));
}

// Función principal para iniciar la creación de figuras
function main() {
    crearFigurasIniciales();
}

main();



// Verificar si se hace clic dentro de una figura
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let figuraEncontrada = false;

    // Deseleccionar todas las figuras antes de seleccionar la nueva
    figuras.forEach(figura => {
        figura.seleccionada = false;
    });

    // Recorre las figuras en orden inverso para detectar la más "superior"
    for (let i = figuras.length - 1; i >= 0; i--) {
        if (figuras[i].contienePunto(x, y)) {
            figuraSeleccionada = figuras[i];
            figuras[i].seleccionada = true;
            figuraEncontrada = true;
            break;  // Rompe el bucle después de seleccionar la figura superior
        }
    }

    if (figuraEncontrada) {
        mensajeElemento.textContent = '¡Clic dentro de una figura!';
    } else {
        mensajeElemento.textContent = 'En ese lugar no se encuentra ninguna figura.';
        figuraSeleccionada = null;
    }

    dibujarFiguras();
});


// Variables para arrastrar figuras
let figuraSeleccionada = null;
let offsetX, offsetY;
function deseleccionarFiguras() {
    figuras.forEach(figura => {
        figura.seleccionada = false;
    });
}
// Evento de mousedown para seleccionar la figura
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Deseleccionar todas las figuras antes de seleccionar la nueva
    deseleccionarFiguras();

    // Recorre las figuras en orden inverso para detectar la más "superior"
    for (let i = figuras.length - 1; i >= 0; i--) {
        if (figuras[i].contienePunto(x, y)) {
            figuraSeleccionada = figuras[i];
            offsetX = x - figuras[i].x;
            offsetY = y - figuras[i].y;
            // Activar arrastre
            isDragging = true;
            figuras[i].seleccionada = true
            break;  // Rompe el bucle después de seleccionar la figura superior
        }
    }
});

// Evento de mousemove para arrastrar la figura
canvas.addEventListener('mousemove', (event) => {
    // Mover solo si se está arrastrand
    if (!figuraSeleccionada || !isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    figuraSeleccionada.x = x - offsetX;
    figuraSeleccionada.y = y - offsetY;
    figuraSeleccionada.ajustarPosicionFigura(figuraSeleccionada);
    dibujarFiguras();
});

// Evento de mouseup para soltar la figura
canvas.addEventListener('mouseup', () => {
    figuraSeleccionada = null;
    isDragging = false;
});

// Evento de teclado para mover la figura seleccionada
document.addEventListener('keydown', (event) => {
    if (!figuraSeleccionada) return;

    const step = 5;  // Tamaño del paso de movimiento
    switch (event.key) {
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
});