let numTotal = 0;
let datos = [];
document.addEventListener('DOMContentLoaded', cargarReferencias);

//<--Funciones para importar csv-->
function importar() {
    document.getElementById('file-input').click();
}

function procesarArchivo(event) {

    limpiar()

    const archivo = event.target.files[0];
    if (!archivo) return;

    const esCSV = archivo.name.endsWith('.csv') || archivo.type === 'text/csv';
    if (!esCSV) {
        document.getElementById('overlay-confirm4').classList.add('open');  
        return;
    }
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
        if (cols[3].trim() != '' && /^\d+$/.test(cols[3].trim())) {
            numTotal = numTotal + parseInt(cols[3]);
        }
    });

    rellenarTabla(datos);
}

function rellenarTabla(datos) {
    const tbody = document.getElementById('table-body');
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
                    numTotal = document.getElementById('stat-tot').textContent;

                    // Vuelve a remarcar si está vacío
                    if (nuevoValor === '—' || ! /^\d+$/.test(nuevoValor)) {
                        td.style.background = 'rgba(224, 64, 64, 0.15)';
                        td.style.borderLeft = '2px solid var(--danger)';

                        if (index == 3 && /^\d+$/.test(valorActual.trim())) {
                            document.getElementById('stat-tot').textContent = parseInt(numTotal) - parseInt(valorActual);

                        }
                    } else {
                        td.style.background = '';
                        td.style.borderLeft = '';
                        if (index == 2) {
                            datos[i].diam = nuevoValor;
                        } else if (index == 3) {
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
}

function confirmar() {
    if (!comprobar()) {
        enviarDatos();
    }
}


