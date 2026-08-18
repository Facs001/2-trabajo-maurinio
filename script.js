const API_URL = 'http://localhost:3001/api';

async function cargarProductos(sortBy) {
    const tbody = document.getElementById('tabla-productos');
    const criterio = sortBy || 'id';
    
    try {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Cargando productos...</td></tr>';
        
        const response = await fetch(API_URL + '/productos?sortBy=' + criterio);
        
        if (!response.ok) {
            throw new Error('Error en la peticion: ' + response.status);
        }
        
        const data = await response.json();
        
        // Verificar si data es un array directamente o tiene la propiedad data
        let productos = [];
        if (Array.isArray(data)) {
            productos = data;
        } else if (data.data && Array.isArray(data.data)) {
            productos = data.data;
        } else {
            throw new Error('Formato de datos invalido');
        }
        
        renderizarProductos(productos);
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: red;">Error al cargar productos: ' + error.message + '</td></tr>';
    }
}

function renderizarProductos(productos) {
    const tbody = document.getElementById('tabla-productos');
    
    if (!productos || productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">No hay productos disponibles</td></tr>';
        return;
    }
    
    let html = '';
    
    for (var i = 0; i < productos.length; i++) {
        var p = productos[i];
        var fecha = formatearFecha(p.fecha_registro);
        var estadoClass = p.estado.toLowerCase() === 'activo' ? 'estado-activo' : 'estado-inactivo';
        var precio = parseFloat(p.precio).toFixed(2);
        
        html += '<tr>';
        html += '<td>' + p.id + '</td>';
        html += '<td>' + p.nombre + '</td>';
        html += '<td>' + p.sku + '</td>';
        html += '<td>' + (p.descripcion || '-') + '</td>';
        html += '<td>$' + precio + '</td>';
        html += '<td>' + p.stock + '</td>';
        html += '<td><span class="' + estadoClass + '">' + p.estado + '</span></td>';
        html += '<td>' + fecha + '</td>';
        html += '<td>' + p.categoria + '</td>';
        html += '<td>' + p.marca + '</td>';
        html += '</tr>';
    }
    
    tbody.innerHTML = html;
}

function formatearFecha(fechaString) {
    if (!fechaString) return '-';
    
    try {
        var fecha = new Date(fechaString);
        if (isNaN(fecha.getTime())) {
            return fechaString;
        }
        var dia = ('0' + fecha.getDate()).slice(-2);
        var mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
        var anio = fecha.getFullYear();
        var horas = ('0' + fecha.getHours()).slice(-2);
        var minutos = ('0' + fecha.getMinutes()).slice(-2);
        
        return dia + '/' + mes + '/' + anio + ' ' + horas + ':' + minutos;
    } catch (e) {
        return fechaString;
    }
}

function probarConexion() {
    var tbody = document.getElementById('tabla-productos');
    
    fetch(API_URL + '/productos')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Error HTTP: ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            console.log('Conexion exitosa. Datos recibidos:', data);
            var productos = Array.isArray(data) ? data : (data.data || []);
            renderizarProductos(productos);
        })
        .catch(function(error) {
            console.error('Error al conectar:', error);
            tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: red;">No se pudo conectar al servidor en ' + API_URL + '. Asegurate de que el backend este corriendo.</td></tr>';
        });
}

document.getElementById('Producto').addEventListener('change', function() {
    var criterio = this.value;
    cargarProductos(criterio);
});

document.addEventListener('DOMContentLoaded', function() {
    probarConexion();
});