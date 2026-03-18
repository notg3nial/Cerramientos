let obras = [];
let erroneos = [];

//Funciones para uso de datos-->
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
        if (!document.getElementById('stat-ref-obra').value) {
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

function cerrarConfirm() {
    document.getElementById('overlay-confirm').classList.remove('open');
    document.getElementById('overlay-confirm2').classList.remove('open');
    document.getElementById('overlay-confirm3').classList.remove('open');
    document.getElementById('overlay-confirm4').classList.remove('open');


}

async function enviarDatos() {
    const nombreObra = document.getElementById('stat-ref-obra').value.trim();
    cerrarConfirm();
    const prog = mostrarProgreso('Insertando cerramientos...');
    window.onbeforeunload = (e) => {
        e.preventDefault();
    };
    try {
        for (let i = 0; i < datos.length; i++) {
            await postCerramiento({ ...datos[i] }, nombreObra);
            prog.actualizar(i + 1, datos.length);
        }
        prog.completar('Cerramientos insertados correctamente');

    } catch (error) {
        prog.error('Error al insertar cerramiento');
        console.error(error);
    } finally {
        window.onbeforeunload = null;
    }
    limpiar();

    erroneos = await getErroneos(nombreObra);
    rellenarTablaError(erroneos);
}

function mostrarProgreso(label = 'Enviando datos...') {
    const overlay = document.getElementById('progress-overlay');
    const bar = document.getElementById('progress-bar');
    const lbl = document.getElementById('progress-label');

    lbl.textContent = label;
    bar.style.width = '0%';
    overlay.classList.add('visible');

    return {
        actualizar: (actual, total) => {
            const pct = Math.round((actual / total) * 100);
            bar.style.width = pct + '%';
            lbl.textContent = `Insertando... ${actual} / ${total}`;
        },
        completar: (msg = 'Completado') => {
            bar.style.width = '100%';
            bar.style.background = 'var(--accent2)';
            lbl.textContent = msg;
            setTimeout(() => {
                overlay.classList.remove('visible');
                bar.style.background = 'var(--accent)';
            }, 1500);
        },
        error: (msg = 'Error en la petición') => {
            bar.style.background = '#ef4444';
            lbl.textContent = msg;
            setTimeout(() => {
                overlay.classList.remove('visible');
                bar.style.background = 'var(--accent)';
            }, 1500);
        }
    };
}

async function cargarReferencias() {
    try {
        obras = await getObras();

        const datalist = document.getElementById('obra-list');
        datalist.innerHTML = '';
        obras.forEach(obra => {
            const option = document.createElement('option');
            option.value = obra.Obra;
            datalist.appendChild(option);
        });

    } catch (error) {
        console.error('Error cargando referencias:', error);
    }
}



function formatear(valor) {
    return 'T' + String(valor).padStart(3, '0');
}

/*Api*/
// Función para insertar un cerramiento en la base de datos
async function postCerramiento(datos, nombreObra) {
    const response = await fetch('http://10.20.20.85:8001/api/cerramiento/insertar', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            Tipo: formatear(datos.tipo),
            Posicion: datos.pos,
            Diametro: datos.diam ? Number(datos.diam) : 0,
            Numero: datos.num ? Number(datos.num) : 0,
            Longitud: datos.long ? Number(datos.long) : 0,
            nombreObra: nombreObra
        })
    });
    if (!response.ok) throw new Error(`Error ${response.status}`);

    const result = await response.json();
    return result;
}

async function getObras() {
    try {
        const response = await fetch('http://10.20.20.85:8001/obras', {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);

        const obras = await response.json();
        return obras;

    } catch (error) {
        console.error('Error al obtener obras:', error);
    }
}

async function getErroneos(nombreObra) {
    try {
        const response = await fetch(`http://10.20.20.85:8001/api/cerramiento/diferencias/${encodeURIComponent(nombreObra)}`, {//cambiar endpoint

            method: 'GET',
            Headers: {
                'accept': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);

        const cerramientos = await response.json();
        return cerramientos;


    } catch (error) {
        console.error('Error al obtener cerramientos:', error);

    }

}
