//Js para la funcionalidad de importacion de datos 

let numTotal = 0;
const datos = [];





//<--Funciones para importar csv-->
function importar() {
    document.getElementById('file-input').click();
}

function procesarArchivo(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const contenido = e.target.result;
        parsearCSV(contenido);
    };
    reader.readAsText(archivo);
    document.getElementById('confirmar').style.display = 'block';

}

function parsearCSV(texto) {
    const lineas = texto.trim().split('\n');

    lineas.shift();


    lineas.forEach(function (linea) {
        const cols = linea.split(';').map(col => col.trim());

        // cols[0] = TIPO, cols[1] = POS, cols[2] = Ø, cols[3] = Nº, cols[4] = LONG
        if (cols.length < 5) return;

        datos.push({
            tipo: cols[0],
            pos: cols[1],
            diam: cols[2],
            num: cols[3],
            long: cols[4]
        });
        if (cols[3].trim() != '')
            numTotal = numTotal + parseInt(cols[3]);

    });

    rellenarTabla(datos);
}


function rellenarTabla(datos) {
    const tbody = document.getElementById('table-body');
    document.getElementById('empty-row').style.display = 'none';

    datos.forEach(function (fila) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${fila.tipo}</td>
            <td>${fila.pos}</td>
            <td>${fila.diam}</td>
            <td>${fila.num}</td>
            <td>${fila.long}</td>
        `;
        tr.querySelectorAll('td').forEach(function (td, index) {
            if (td.textContent.trim() === '') {
                td.style.background = 'rgba(224, 64, 64, 0.15)';
                td.style.borderLeft = '2px solid var(--danger)';
                td.textContent = '—';
            }
            if (index < 2) return;

            if (! /^\d+$/.test(td.textContent.trim())) {
                td.style.background = 'rgba(224, 64, 64, 0.15)';
                td.style.borderLeft = '2px solid var(--danger)';
            }

            td.addEventListener('dblclick', function (e) {

                const td = e.target.closest('td');
                if (!td) return;

                const valorActual = td.textContent.trim();

                // Crea el input
                const input = document.createElement('input');
                input.value = valorActual;
                input.style.cssText = `
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid var(--accent);
                    color: var(--text);
                    font-family: inherit;
                    font-size: 13px;
                    width: 100%;
                    outline: none;
                    padding: 2px 0;
                `;

                // Reemplaza la celda por el input
                td.textContent = '';
                td.appendChild(input);
                input.focus();
                input.select();

                // Al salir o pulsar Enter, guarda el valor
                function guardar(index) {
                    const nuevoValor = input.value.trim();
                    td.textContent = nuevoValor === '' ? '—' : nuevoValor;

                    // Vuelve a remarcar si está vacío
                    if (nuevoValor === '—' || ! /^\d+$/.test(nuevoValor)) {
                        td.style.background = 'rgba(224, 64, 64, 0.15)';
                        td.style.borderLeft = '2px solid var(--danger)';
                    } else {
                        td.style.background = '';
                        td.style.borderLeft = '';
                        if (index == 3) {
                            numTotal = document.getElementById('stat-tot').textContent;
                            console.log(parseInt(numTotal) + parseInt(nuevoValor))
                            document.getElementById('stat-tot').textContent = parseInt(numTotal) + parseInt(nuevoValor);
                        }
                    }
                }
                input.addEventListener('blur', function () { guardar(index); });
                input.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') input.blur();
                    if (e.key === 'Escape') {
                        td.textContent = valorActual; // cancela el cambio
                    }

                });
                console.log(index)

            });



        });

        tbody.appendChild(tr);

    });
    document.getElementById('stat-rows').textContent = datos.length;
    document.getElementById('row-count').textContent = `${datos.length} elementos`;
    document.getElementById('stat-tot').textContent = `${numTotal}`;

}







//<--Funciones para insertar en la base de datos-->
function comprobar() {
    peligro = false;
    mensaje = true;

    const tbody = document.getElementById('table-body');
    tbody.querySelectorAll('tr').forEach(function (tr) {

        tr.querySelectorAll('td').forEach(function (td, index) {
            if (index < 2) return;
            if (!/^\d+$/.test(td.textContent.trim()) && td.textContent.trim() !== '—') {
                document.getElementById('overlay-confirm2').classList.add('open');
                peligro = true
                mensaje = false;
            }

        })

    });

    if (mensaje) {

        tbody.querySelectorAll('tr').forEach(function (tr) {

            tr.querySelectorAll('td').forEach(function (td, index) {

                if (index < 2) return;
                if (td.textContent.trim() === '—') {
                    document.getElementById('overlay-confirm').classList.add('open');
                    peligro = true
                }

            });
        });
    }
    return peligro
}



function confirmar() {
    if (!comprobar()) {
        enviarDatos();
    }
}
function cerrarConfirm() {
    document.getElementById('overlay-confirm').classList.remove('open');
}
function cerrarConfirm2() {
    document.getElementById('overlay-confirm2').classList.remove('open');
}

function enviarDatos() {
    cerrarConfirm();
    console.log('Enviando datos...');

}
