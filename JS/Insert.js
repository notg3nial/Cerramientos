//Js para la funcionalidad de importacion de datos 
let numTotal = 0;
let datos = [];

//<--Funciones para importar csv-->
function importar() {
    document.getElementById('file-input').click();
}

function procesarArchivo(event) {

    limpiar()

    const archivo = event.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const contenido = e.target.result;
        parsearCSV(contenido);
    };
    reader.readAsText(archivo);
    document.getElementById('confirmar').style.display = 'block';
    event.target.value = '';
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
    console.log(datos)
    const tbody = document.getElementById('table-body');
    // tbody.innerHTML = ``
    document.getElementById('empty-row').style.display = 'none';

    datos.forEach(function (fila, i) {
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
                        if (index == 2) {
                            datos[i].diam = nuevoValor;
                        } else if (index == 3) {
                            numTotal = document.getElementById('stat-tot').textContent;
                            if (!/^\d+$/.test(valorActual.trim())) {
                                document.getElementById('stat-tot').textContent = parseInt(numTotal) + parseInt(nuevoValor);
                            } else {
                                document.getElementById('stat-tot').textContent = parseInt(numTotal) - parseInt(valorActual) + parseInt(nuevoValor);
                            }
                            datos[i].num = nuevoValor;

                        } else if (index == 4) {
                            datos[i].long = nuevoValor;

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

            });

        });

        tbody.appendChild(tr);

    });
    document.getElementById('stat-rows').textContent = datos.length;
    document.getElementById('row-count').textContent = `${datos.length} elementos`;
    document.getElementById('stat-tot').textContent = `${numTotal}`;

}

function limpiar() {
    datos = [];
    document.getElementById('table-body').innerHTML = `
        <tr id="empty-row">
            <td colspan="6">
                <div class="empty-state">
                    <div class="empty-icon">⬡</div>
                    <p>Sin datos — Importa un registro</p>
                </div>
            </td>
        </tr>
        `;

    document.getElementById('row-count').textContent = "0 elementos";
    document.getElementById('stat-rows').textContent = 0;
    numTotal = 0;
    document.getElementById('stat-tot').textContent = "—";
    document.getElementById('confirmar').style.display = 'none';
    document.getElementById('stat-ref-obra').value = '';
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
        if (!getIdByRef(document.getElementById('stat-ref-obra').value)) {
            document.getElementById('overlay-confirm3').classList.add('open');
            peligro = true
            mensaje = false;


        }
    }

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
    document.getElementById('overlay-confirm2').classList.remove('open');
    document.getElementById('overlay-confirm3').classList.remove('open');

}

function enviarDatos() {
    cerrarConfirm();



    //Api, conexion de la base de datos
    console.log('Enviando datos...');
    datos.forEach(fila => {
        parseInt(fila.tipo);
        String(fila.pos)
        parseInt(fila.diam) || 0;
        parseInt(fila.num) || 0;
        parseInt(fila.long) || 0;


    });
    limpiar()
}




/*Pruebas*/

const referenciasObras = [];
for (let i = 1; i <= 400; i++) {
    // formato libre, aquí sólo para que se vea la numeración
    referenciasObras.push({
        id: i,
        ref: 'OBRA' + i.toString().padStart(3, '0')
    });
}

async function cargarReferencias() {
    try {
        // si tuvieras API descomenta estas líneas
        // const response = await fetch('/api/obras');
        // if (!response.ok) throw new Error('Error al cargar referencias');
        // const obras = await response.json();

        // mientras tanto usa el array simulado
        const obras = referenciasObras;

        const datalist = document.getElementById('obra-list');
        datalist.innerHTML = '';
        obras.forEach(obra => {
            const option = document.createElement('option');
            option.value = obra.ref;
            datalist.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando referencias:', error);
    }
}

document.addEventListener('DOMContentLoaded', cargarReferencias);


function getIdByRef(ref) {
    const obra = referenciasObras.find(item => item.ref === ref);

    if (!obra) {
        return null;
    }

    return obra.id;
}
