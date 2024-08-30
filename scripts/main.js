let figuras = [];
const colores = ['red', 'green', 'blue', 'orange', 'purple', 'cyan'];
const mensajeElemento = document.getElementById('mensaje');
const cantFiguras = 5;
let delay = 100;
const crearFiguraFuncs = [
    () => {
        let radio = Math.random() * 40 + 25; // Definir radio aleatorio
        let color = generarColorAleatorio(); // Color aleatorio en formato rgba
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
        let lado = Math.random() * 40 + 25; // Definir lado aleatorio
        let color = generarColorAleatorio(); // Color aleatorio en formato rgba
        return new Cuadrado(
            Math.random() * (canvas.width - lado),
            Math.random() * (canvas.height - lado),
            lado,
            colorComplementario(color), // Color complementario
            ctx,
            false
        );
    },
    () => {
        let lado = Math.random() * 40 + 25; // Definir lado aleatorio
        let color = generarColorAleatorio(); // Color aleatorio en formato rgba
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
    /* let a = Math.floor(Math.random() * 30) + 246; // Transparencia aleatoria entre 200 y 255 */
    return `rgba(${r},${g},${b},1)`;
}

// Función para generar un color complementario en formato rgba
function colorComplementario(color) {
    // Extraer los valores de red, verde, azul y alfa del string rgba
    const regex = /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([.\d]*)\)/;
    const matches = regex.exec(color);
    if (!matches) return 'rgba(0, 0, 0, 1)'; // Valor por defecto si no hay match

    let r = 255 - parseInt(matches[1]);
    let g = 255 - parseInt(matches[2]);
    let b = 255 - parseInt(matches[3]);
    let a = 1;

    return `rgba(${r},${g},${b},${a})`;
}


let figuraIndex = 0;
main();
function main() {
    crearFiguras();
}

// Generar figuras al azar
function agregarFigura() {
    const crearFigura = crearFiguraFuncs[figuraIndex];
    const nuevaFigura = crearFigura();
    figuras.push(nuevaFigura);
    // Actualizar el índice para la siguiente figura
    figuraIndex = (figuraIndex + 1) % crearFiguraFuncs.length;
}


// Dibujar todas las figuras
function crearFiguras() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpia el canvas
    if (figuras.length < cantFiguras * crearFiguraFuncs.length) {
        agregarFigura();
        delay = Math.max(40, delay - 5);
        setTimeout(crearFiguras, delay);
    }

    // Dibuja todas las figuras
    figuras.forEach(figura => figura.dibujar(ctx));
    /*     ctx.clearRect(0, 0, canvas.width, canvas.height);
        figuras.forEach(figura => {
            if (figura.seleccionada) {
                // Aumenta el tamaño de la figura en un 1% cuando está seleccionada
                ctx.save(); // Guarda el estado actual del contexto
    
                // Aumentar el tamaño de la figura temporalmente
                ctx.translate(figura.x, figura.y); // Mueve el contexto al centro de la figura
                ctx.scale(1.15, 1.15); // Escala la figura al 101%
                ctx.translate(-figura.x, -figura.y); // Mueve el contexto de vuelta
                delay = Math.max(10, delay - 10);
                setTimeout(() => { figura.dibujar(ctx); }, delay);
    
                // Dibuja el borde de selección
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 3;
                if (figura instanceof Circulo) {
                    ctx.beginPath();
                    ctx.arc(figura.x, figura.y, figura.radio, 0, Math.PI * 2);
                    ctx.stroke();
                } else if (figura instanceof Rectangulo || figura instanceof Cuadrado) {
                    ctx.strokeRect(figura.x, figura.y, figura.ancho, figura.alto);
                }
    
                ctx.restore(); // Restaura el estado original del contexto
            } else {
                delay = Math.max(10, delay - 10);
                setTimeout(() => { figura.dibujar(ctx); }, delay);
    
            }
        }); */
}




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

    crearFiguras();
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
    crearFiguras();
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
    crearFiguras();
});