const API_URL = 'http://localhost:3001/api';
let productosOriginales = [];
let filtrosActivos = [];
let maxFiltros = 3;

async function cargarProductos() {
    const tbody = document.getElementById('tabla-productos');
    
    try {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Cargando productos...</td></tr>';
        
        const response = await fetch(API_URL + '/productos');
        
        if (!response.ok) {
            throw new Error('Error en la peticion: ' + response.status);
        }
        
        const data = await response.json();
        
        let productos = [];
        if (Array.isArray(data)) {
            productos = data;
        } else if (data.data && Array.isArray(data.data)) {
            productos = data.data;
        } else {
            throw new Error('Formato de datos invalido');
        }
        
        productosOriginales = productos;
        aplicarFiltrosYOrden();
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: red;">Error al cargar productos: ' + error.message + '</td></tr>';
    }
}

function aplicarFiltrosYOrden() {
    let productosFiltrados = [...productosOriginales];
    
    
    for (var i = 0; i < filtrosActivos.length; i++) {
        var filtro = filtrosActivos[i];
        productosFiltrados = aplicarFiltro(productosFiltrados, filtro);
    }
    

    var campoOrden = document.getElementById('ordenarPor').value;
    var direccion = document.getElementById('direccionOrden').value;
    productosFiltrados = ordenarProductos(productosFiltrados, campoOrden, direccion);
    
   
    document.getElementById('contadorProductos').textContent = 'Mostrando ' + productosFiltrados.length + ' productos';
    
    renderizarProductos(productosFiltrados);
}

function aplicarFiltro(productos, filtro) {
    var campo = filtro.campo;
    var operador = filtro.operador;
    var valor = filtro.valor.toLowerCase().trim();
    
    if (!valor) return productos;
    
    return productos.filter(function(producto) {
        var valorCampo = String(producto[campo] || '').toLowerCase();
        
        switch(operador) {
            case 'contiene':
                return valorCampo.indexOf(valor) !== -1;
            case 'igual':
                return valorCampo === valor;
            case 'empieza':
                return valorCampo.indexOf(valor) === 0;
            case 'termina':
                return valorCampo.lastIndexOf(valor) === valorCampo.length - valor.length;
            case 'mayor':
                return parseFloat(producto[campo]) > parseFloat(valor);
            case 'menor':
                return parseFloat(producto[campo]) < parseFloat(valor);
            default:
                return true;
        }
    });
}

function ordenarProductos(productos, campo, direccion) {
    var sorted = [...productos];
    
    sorted.sort(function(a, b) {
        var valorA = a[campo];
        var valorB = b[campo];
        
        
        if (campo === 'precio' || campo === 'stock' || campo === 'id') {
            valorA = parseFloat(valorA) || 0;
            valorB = parseFloat(valorB) || 0;
        } else if (campo === 'fecha_registro') {
            valorA = new Date(valorA).getTime() || 0;
            valorB = new Date(valorB).getTime() || 0;
        } else {
            // String
            valorA = String(valorA).toLowerCase();
            valorB = String(valorB).toLowerCase();
        }
        
        if (valorA < valorB) return direccion === 'ASC' ? -1 : 1;
        if (valorA > valorB) return direccion === 'ASC' ? 1 : -1;
        return 0;
    });
    
    return sorted;
}

function renderizarProductos(productos) {
    const tbody = document.getElementById('tabla-productos');
    
    if (!productos || productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">No hay productos que coincidan con los filtros</td></tr>';
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
        html += '<td class="precio">$' + precio + '</td>';
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

function agregarFiltro() {
    if (filtrosActivos.length >= maxFiltros) {
        alert('Solo se pueden agregar hasta ' + maxFiltros + ' filtros');
        return;
    }
    
    var campos = ['id', 'nombre', 'sku', 'descripcion', 'precio', 'stock', 'estado', 'categoria', 'marca'];
    var operadores = ['contiene', 'igual', 'empieza', 'termina'];
    
    
    var camposNumericos = ['id', 'precio', 'stock'];
    
    var filtro = {
        id: Date.now(),
        campo: 'nombre',
        operador: 'contiene',
        valor: ''
    };
    
    filtrosActivos.push(filtro);
    renderizarFiltros();
}

function eliminarFiltro(id) {
    filtrosActivos = filtrosActivos.filter(function(f) {
        return f.id !== id;
    });
    renderizarFiltros();
}

function renderizarFiltros() {
    var container = document.getElementById('filtrosActivos');
    var html = '';
    
    
    var campos = ['id', 'nombre', 'sku', 'descripcion', 'precio', 'stock', 'estado', 'categoria', 'marca'];
    var operadoresTexto = ['contiene', 'igual', 'empieza', 'termina'];
    var operadoresNumero = ['contiene', 'igual', 'mayor', 'menor'];
    
    for (var i = 0; i < filtrosActivos.length; i++) {
        var filtro = filtrosActivos[i];
        var esNumerico = ['id', 'precio', 'stock'].indexOf(filtro.campo) !== -1;
        var operadores = esNumerico ? operadoresNumero : operadoresTexto;
        
        html += '<div class="filtro-item">';
        html += '<span>Filtro ' + (i + 1) + ':</span>';
        
        
        html += '<select class="filtro-campo" data-id="' + filtro.id + '">';
        for (var c = 0; c < campos.length; c++) {
            var selected = campos[c] === filtro.campo ? 'selected' : '';
            html += '<option value="' + campos[c] + '" ' + selected + '>' + capitalizar(campos[c]) + '</option>';
        }
        html += '</select>';
        
       
        html += '<select class="filtro-operador" data-id="' + filtro.id + '">';
        for (var o = 0; o < operadores.length; o++) {
            var selectedOp = operadores[o] === filtro.operador ? 'selected' : '';
            html += '<option value="' + operadores[o] + '" ' + selectedOp + '>' + capitalizar(operadores[o]) + '</option>';
        }
        html += '</select>';
        
       
        html += '<input type="text" class="filtro-valor" data-id="' + filtro.id + '" placeholder="Valor..." value="' + filtro.valor + '">';
        
      
        html += '<button class="btn-eliminar-filtro" onclick="eliminarFiltro(' + filtro.id + ')">×</button>';
        html += '</div>';
    }
    
    container.innerHTML = html;
    
  
    var camposSelect = container.querySelectorAll('.filtro-campo');
    for (var s = 0; s < camposSelect.length; s++) {
        camposSelect[s].addEventListener('change', function(e) {
            var id = parseInt(this.dataset.id);
            var filtro = filtrosActivos.find(function(f) { return f.id === id; });
            if (filtro) {
                filtro.campo = this.value;
                // Actualizar operadores segun el campo
                actualizarOperadores(filtro.id);
                aplicarFiltrosYOrden();
            }
        });
    }
    
    var operadoresSelect = container.querySelectorAll('.filtro-operador');
    for (var o2 = 0; o2 < operadoresSelect.length; o2++) {
        operadoresSelect[o2].addEventListener('change', function(e) {
            var id = parseInt(this.dataset.id);
            var filtro = filtrosActivos.find(function(f) { return f.id === id; });
            if (filtro) {
                filtro.operador = this.value;
                aplicarFiltrosYOrden();
            }
        });
    }
    
    var valoresInput = container.querySelectorAll('.filtro-valor');
    for (var v = 0; v < valoresInput.length; v++) {
        valoresInput[v].addEventListener('input', function(e) {
            var id = parseInt(this.dataset.id);
            var filtro = filtrosActivos.find(function(f) { return f.id === id; });
            if (filtro) {
                filtro.valor = this.value;
                aplicarFiltrosYOrden();
            }
        });
    }
}

function actualizarOperadores(id) {
    var filtro = filtrosActivos.find(function(f) { return f.id === id; });
    if (!filtro) return;
    
    var esNumerico = ['id', 'precio', 'stock'].indexOf(filtro.campo) !== -1;
    var operadores = esNumerico ? ['contiene', 'igual', 'mayor', 'menor'] : ['contiene', 'igual', 'empieza', 'termina'];
    
    var select = document.querySelector('.filtro-operador[data-id="' + id + '"]');
    if (!select) return;
    
    var valorActual = select.value;
    var html = '';
    
    for (var i = 0; i < operadores.length; i++) {
        var selected = operadores[i] === valorActual ? 'selected' : '';
        html += '<option value="' + operadores[i] + '" ' + selected + '>' + capitalizar(operadores[i]) + '</option>';
    }
    
    select.innerHTML = html;
    
   
    if (operadores.indexOf(valorActual) === -1) {
        filtro.operador = operadores[0];
        select.value = operadores[0];
    }
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function limpiarFiltros() {
    filtrosActivos = [];
    renderizarFiltros();
    aplicarFiltrosYOrden();
}

document.getElementById('ordenarPor').addEventListener('change', function() {
    aplicarFiltrosYOrden();
});

document.getElementById('direccionOrden').addEventListener('change', function() {
    aplicarFiltrosYOrden();
});

document.getElementById('btnAgregarFiltro').addEventListener('click', agregarFiltro);
document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);

document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
});