class AxyraInventario{constructor(){this.productos = [];this.movimientos = [];this.categorias = [];this.usuarioActual = null;this.isInitialized = false;this.filters ={categoria:null,stockBajo:false,activo:null,busqueda:'',};this.stockMinimo = 10;this.init();}async init(){try{console.log('🚀 Inicializando Sistema de Inventario AXYRA...');await this.verificarAutenticacion();await this.cargarDatos();this.configurarInterfaz();this.configurarEventListeners();this.renderizarProductos();this.actualizarEstadisticas();this.isInitialized = true;console.log('✅ Sistema de Inventario inicializado correctamente');}catch(error){console.error('❌ Error inicializando Inventario:',error);this.mostrarNotificacion('Error inicializando el sistema de inventario','error');}}async verificarAutenticacion(){try{if(window.axyraFirebase?.auth?.currentUser){this.usuarioActual ={id:window.axyraFirebase.auth.currentUser.uid,email:window.axyraFirebase.auth.currentUser.email,nombre:window.axyraFirebase.auth.currentUser.displayName || 'Usuario',};console.log('✅ Usuario autenticado en Firebase:',this.usuarioActual.email);return;}const usuario = localStorage.getItem('axyra_isolated_user')|| localStorage.getItem('axyra_usuario_actual');if(usuario){this.usuarioActual = JSON.parse(usuario);console.log('✅ Usuario cargado desde localStorage:',this.usuarioActual.nombre);return;}this.usuarioActual ={id:'usuario_' + Date.now(),nombre:'Usuario',email:'usuario@axyra.com',};console.log('⚠️ Usando usuario temporal');}catch(error){console.error('❌ Error verificando autenticación:',error);throw error;}}async cargarDatos(){try{await this.cargarCategorias();await this.cargarProductos();await this.cargarMovimientos();console.log(`✅ Datos cargados:${this.categorias.length}categorías,${this.productos.length}productos,${this.movimientos.length}movimientos`);}catch(error){console.error('❌ Error cargando datos:',error);throw error;}}async cargarCategorias(){try{if(window.axyraFirebase?.firestore && this.usuarioActual){const snapshot = await window.axyraFirebase.firestore .collection('categorias_inventario').where('userId','==',this.usuarioActual.id).get();this.categorias = snapshot.docs.map((doc)=>({id:doc.id,...doc.data(),}));return;}const categoriasData = localStorage.getItem('axyra_categorias_inventario');if(categoriasData){this.categorias = JSON.parse(categoriasData);return;}this.categorias = [{id:'cat_1',nombre:'Electrónicos',descripcion:'Dispositivos electrónicos',activa:true},{id:'cat_2',nombre:'Oficina',descripcion:'Artículos de oficina',activa:true},{id:'cat_3',nombre:'Limpieza',descripcion:'Productos de limpieza',activa:true},];}catch(error){console.error('❌ Error cargando categorías:',error);this.categorias = [];}}async cargarProductos(){try{if(window.axyraFirebase?.firestore && this.usuarioActual){const snapshot = await window.axyraFirebase.firestore .collection('productos').where('userId','==',this.usuarioActual.id).orderBy('nombre').get();this.productos = snapshot.docs.map((doc)=>({id:doc.id,...doc.data(),}));return;}const productosData = localStorage.getItem('axyra_productos');if(productosData){this.productos = JSON.parse(productosData);return;}this.productos = [{id:'prod_1',codigo:'PROD001',nombre:'Laptop Dell',categoria:'Electrónicos',categoriaId:'cat_1',stock:5,stockMinimo:2,precioCompra:2500000,precioVenta:3000000,descripcion:'Laptop Dell Inspiron 15',activo:true,fechaCreacion:new Date().toISOString(),userId:this.usuarioActual.id,},{id:'prod_2',codigo:'PROD002',nombre:'Papel A4',categoria:'Oficina',categoriaId:'cat_2',stock:50,stockMinimo:10,precioCompra:5000,precioVenta:8000,descripcion:'Resma de papel A4 500 hojas',activo:true,fechaCreacion:new Date().toISOString(),userId:this.usuarioActual.id,},];}catch(error){console.error('❌ Error cargando productos:',error);this.productos = [];}}async cargarMovimientos(){try{if(window.axyraFirebase?.firestore && this.usuarioActual){const snapshot = await window.axyraFirebase.firestore .collection('movimientos_inventario').where('userId','==',this.usuarioActual.id).orderBy('fecha','desc').get();this.movimientos = snapshot.docs.map((doc)=>({id:doc.id,...doc.data(),}));return;}const movimientosData = localStorage.getItem('axyra_movimientos_inventario');if(movimientosData){this.movimientos = JSON.parse(movimientosData);return;}this.movimientos = [];}catch(error){console.error('❌ Error cargando movimientos:',error);this.movimientos = [];}}configurarInterfaz(){this.configurarSelectCategorias();const busquedaInput = document.getElementById('busquedaProductos');if(busquedaInput){busquedaInput.addEventListener('input',(e)=>{this.filters.busqueda = e.target.value;this.aplicarFiltros();});}}configurarSelectCategorias(){const selectCategoria = document.getElementById('filtroCategoria');if(!selectCategoria)return;selectCategoria.innerHTML = '<option value="">Todas las categorías</option>';this.categorias.forEach((categoria)=>{if(categoria.activa){const option = document.createElement('option');option.value = categoria.id;option.textContent = categoria.nombre;selectCategoria.appendChild(option);}});}configurarEventListeners(){const btnAgregarProducto = document.getElementById('btnAgregarProducto');if(btnAgregarProducto){btnAgregarProducto.addEventListener('click',()=> this.mostrarModalAgregarProducto());}const btnAgregarCategoria = document.getElementById('btnAgregarCategoria');if(btnAgregarCategoria){btnAgregarCategoria.addEventListener('click',()=> this.mostrarModalAgregarCategoria());}const btnExportar = document.getElementById('btnExportarInventario');if(btnExportar){btnExportar.addEventListener('click',()=> this.exportarInventario());}const filtros = ['filtroCategoria','filtroStockBajo','filtroActivo'];filtros.forEach((filtroId)=>{const elemento = document.getElementById(filtroId);if(elemento){elemento.addEventListener('change',()=> this.aplicarFiltros());}});const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltrosInventario');if(btnLimpiarFiltros){btnLimpiarFiltros.addEventListener('click',()=> this.limpiarFiltros());}}mostrarModalAgregarProducto(){const modalHTML = ` <div id="modalAgregarProducto" class="axyra-modal" style="display:flex;"> <div class="axyra-modal-content"> <div class="axyra-modal-header"> <h3 class="axyra-modal-title"> <i class="fas fa-plus"></i> Agregar Producto </h3> <button class="axyra-modal-close" onclick="cerrarModalAgregarProducto()"> <i class="fas fa-times"></i> </button> </div> <div class="axyra-modal-body"> <form id="formAgregarProducto"> <div class="axyra-form-row"> <div class="axyra-form-group"> <label for="codigoProducto" class="axyra-form-label">Código:</label> <input type="text" id="codigoProducto" class="axyra-form-input" required> </div> <div class="axyra-form-group"> <label for="nombreProducto" class="axyra-form-label">Nombre:</label> <input type="text" id="nombreProducto" class="axyra-form-input" required> </div> </div> <div class="axyra-form-row"> <div class="axyra-form-group"> <label for="categoriaProducto" class="axyra-form-label">Categoría:</label> <select id="categoriaProducto" class="axyra-form-input" required> <option value="">Seleccionar categoría</option> ${this.categorias.map((cat)=> `<option value="${cat.id}">${cat.nombre}</option>`).join('')}</select> </div> <div class="axyra-form-group"> <label for="stockProducto" class="axyra-form-label">Stock:</label> <input type="number" id="stockProducto" class="axyra-form-input" min="0" required> </div> </div> <div class="axyra-form-row"> <div class="axyra-form-group"> <label for="stockMinimoProducto" class="axyra-form-label">Stock Mínimo:</label> <input type="number" id="stockMinimoProducto" class="axyra-form-input" min="0" required> </div> <div class="axyra-form-group"> <label for="precioCompraProducto" class="axyra-form-label">Precio Compra:</label> <input type="number" id="precioCompraProducto" class="axyra-form-input" min="0" step="100" required> </div> </div> <div class="axyra-form-row"> <div class="axyra-form-group"> <label for="precioVentaProducto" class="axyra-form-label">Precio Venta:</label> <input type="number" id="precioVentaProducto" class="axyra-form-input" min="0" step="100" required> </div> <div class="axyra-form-group"> <label for="activoProducto" class="axyra-form-label">Estado:</label> <select id="activoProducto" class="axyra-form-input" required> <option value="true">Activo</option> <option value="false">Inactivo</option> </select> </div> </div> <div class="axyra-form-group"> <label for="descripcionProducto" class="axyra-form-label">Descripción:</label> <textarea id="descripcionProducto" class="axyra-form-input" rows="3"></textarea> </div> </form> </div> <div class="axyra-modal-footer"> <button class="axyra-btn axyra-btn-secondary" onclick="cerrarModalAgregarProducto()"> Cancelar </button> <button class="axyra-btn axyra-btn-primary" onclick="axyraInventario.agregarProducto()"> <i class="fas fa-save"></i> Guardar </button> </div> </div> </div> `;document.body.insertAdjacentHTML('beforeend',modalHTML);}async agregarProducto(){try{const form = document.getElementById('formAgregarProducto');if(!form.checkValidity()){form.reportValidity();return;}const categoria = this.categorias.find((cat)=> cat.id === document.getElementById('categoriaProducto').value);const producto ={id:'prod_' + Date.now(),codigo:document.getElementById('codigoProducto').value,nombre:document.getElementById('nombreProducto').value,categoria:categoria?.nombre || '',categoriaId:document.getElementById('categoriaProducto').value,stock:parseInt(document.getElementById('stockProducto').value),stockMinimo:parseInt(document.getElementById('stockMinimoProducto').value),precioCompra:parseFloat(document.getElementById('precioCompraProducto').value),precioVenta:parseFloat(document.getElementById('precioVentaProducto').value),descripcion:document.getElementById('descripcionProducto').value,activo:document.getElementById('activoProducto').value === 'true',fechaCreacion:new Date().toISOString(),userId:this.usuarioActual.id,};if(this.productos.some((p)=> p.codigo === producto.codigo)){this.mostrarNotificacion('El código del producto ya existe','error');return;}if(window.axyraFirebase?.firestore){await window.axyraFirebase.firestore.collection('productos').doc(producto.id).set(producto);}this.productos.push(producto);localStorage.setItem('axyra_productos',JSON.stringify(this.productos));await this.crearMovimiento({tipo:'entrada',producto:producto.nombre,productoId:producto.id,cantidad:producto.stock,motivo:'Stock inicial',usuario:this.usuarioActual.nombre,});this.cerrarModalAgregarProducto();this.renderizarProductos();this.actualizarEstadisticas();this.mostrarNotificacion('Producto agregado exitosamente','success');}catch(error){console.error('❌ Error agregando producto:',error);this.mostrarNotificacion('Error agregando producto','error');}}cerrarModalAgregarProducto(){const modal = document.getElementById('modalAgregarProducto');if(modal){modal.remove();}}async editarProducto(productoId){const producto = this.productos.find((p)=> p.id === productoId);if(!producto)return;this.mostrarNotificacion('Función de edición en desarrollo','info');}async eliminarProducto(productoId){if(!confirm('¿Estás seguro de que quieres eliminar este producto?'))return;try{if(window.axyraFirebase?.firestore){await window.axyraFirebase.firestore.collection('productos').doc(productoId).delete();}this.productos = this.productos.filter((p)=> p.id !== productoId);localStorage.setItem('axyra_productos',JSON.stringify(this.productos));this.renderizarProductos();this.actualizarEstadisticas();this.mostrarNotificacion('Producto eliminado exitosamente','success');}catch(error){console.error('❌ Error eliminando producto:',error);this.mostrarNotificacion('Error eliminando producto','error');}}mostrarModalAgregarCategoria(){const modalHTML = ` <div id="modalAgregarCategoria" class="axyra-modal" style="display:flex;"> <div class="axyra-modal-content"> <div class="axyra-modal-header"> <h3 class="axyra-modal-title"> <i class="fas fa-plus"></i> Agregar Categoría </h3> <button class="axyra-modal-close" onclick="cerrarModalAgregarCategoria()"> <i class="fas fa-times"></i> </button> </div> <div class="axyra-modal-body"> <form id="formAgregarCategoria"> <div class="axyra-form-group"> <label for="nombreCategoria" class="axyra-form-label">Nombre:</label> <input type="text" id="nombreCategoria" class="axyra-form-input" required> </div> <div class="axyra-form-group"> <label for="descripcionCategoria" class="axyra-form-label">Descripción:</label> <textarea id="descripcionCategoria" class="axyra-form-input" rows="3"></textarea> </div> </form> </div> <div class="axyra-modal-footer"> <button class="axyra-btn axyra-btn-secondary" onclick="cerrarModalAgregarCategoria()"> Cancelar </button> <button class="axyra-btn axyra-btn-primary" onclick="axyraInventario.agregarCategoria()"> <i class="fas fa-save"></i> Guardar </button> </div> </div> </div> `;document.body.insertAdjacentHTML('beforeend',modalHTML);}async agregarCategoria(){try{const form = document.getElementById('formAgregarCategoria');if(!form.checkValidity()){form.reportValidity();return;}const categoria ={id:'cat_' + Date.now(),nombre:document.getElementById('nombreCategoria').value,descripcion:document.getElementById('descripcionCategoria').value,activa:true,fechaCreacion:new Date().toISOString(),userId:this.usuarioActual.id,};if(this.categorias.some((c)=> c.nombre === categoria.nombre)){this.mostrarNotificacion('El nombre de la categoría ya existe','error');return;}if(window.axyraFirebase?.firestore){await window.axyraFirebase.firestore.collection('categorias_inventario').doc(categoria.id).set(categoria);}this.categorias.push(categoria);localStorage.setItem('axyra_categorias_inventario',JSON.stringify(this.categorias));this.cerrarModalAgregarCategoria();this.configurarSelectCategorias();this.mostrarNotificacion('Categoría agregada exitosamente','success');}catch(error){console.error('❌ Error agregando categoría:',error);this.mostrarNotificacion('Error agregando categoría','error');}}cerrarModalAgregarCategoria(){const modal = document.getElementById('modalAgregarCategoria');if(modal){modal.remove();}}async crearMovimiento(movimientoData){try{const movimiento ={id:'mov_' + Date.now(),...movimientoData,fecha:new Date().toISOString(),userId:this.usuarioActual.id,};if(window.axyraFirebase?.firestore){await window.axyraFirebase.firestore.collection('movimientos_inventario').doc(movimiento.id).set(movimiento);}this.movimientos.unshift(movimiento);localStorage.setItem('axyra_movimientos_inventario',JSON.stringify(this.movimientos));return movimiento;}catch(error){console.error('❌ Error creando movimiento:',error);throw error;}}async ajustarStock(productoId,cantidad,motivo){try{const producto = this.productos.find((p)=> p.id === productoId);if(!producto){throw new Error('Producto no encontrado');}const nuevoStock = producto.stock + cantidad;if(nuevoStock < 0){this.mostrarNotificacion('No hay suficiente stock para realizar esta operación','error');return;}producto.stock = nuevoStock;if(window.axyraFirebase?.firestore){await window.axyraFirebase.firestore.collection('productos').doc(productoId).update({stock:nuevoStock});}localStorage.setItem('axyra_productos',JSON.stringify(this.productos));await this.crearMovimiento({tipo:cantidad > 0 ? 'entrada':'salida',producto:producto.nombre,productoId:productoId,cantidad:Math.abs(cantidad),motivo:motivo,usuario:this.usuarioActual.nombre,});this.renderizarProductos();this.actualizarEstadisticas();this.mostrarNotificacion(`Stock ajustado:${cantidad > 0 ? '+':''}${cantidad}unidades`,'success');}catch(error){console.error('❌ Error ajustando stock:',error);this.mostrarNotificacion('Error ajustando stock','error');}}renderizarProductos(){const tbody = document.getElementById('productosTableBody');if(!tbody)return;const productosFiltrados = this.obtenerProductosFiltrados();tbody.innerHTML = productosFiltrados .map((producto)=> ` <tr class="${producto.stock <= producto.stockMinimo ? 'stock-bajo':''}"> <td>${producto.codigo}</td> <td>${producto.nombre}</td> <td>${producto.categoria}</td> <td> <span class="stock-amount ${producto.stock <= producto.stockMinimo ? 'stock-low':''}"> ${producto.stock}</span> ${producto.stock <= producto.stockMinimo ? '<i class="fas fa-exclamation-triangle text-warning"></i>':''}</td> <td>${producto.stockMinimo}</td> <td>$${producto.precioCompra.toLocaleString()}</td> <td>$${producto.precioVenta.toLocaleString()}</td> <td> <span class="axyra-status axyra-status-${producto.activo ? 'active':'inactive'}"> ${producto.activo ? 'Activo':'Inactivo'}</span> </td> <td> <div class="axyra-action-buttons"> <button class="axyra-btn axyra-btn-sm axyra-btn-info" onclick="axyraInventario.mostrarModalAjustarStock('${producto.id}')" title="Ajustar Stock"> <i class="fas fa-warehouse"></i> </button> <button class="axyra-btn axyra-btn-sm axyra-btn-warning" onclick="axyraInventario.editarProducto('${producto.id}')" title="Editar"> <i class="fas fa-edit"></i> </button> <button class="axyra-btn axyra-btn-sm axyra-btn-danger" onclick="axyraInventario.eliminarProducto('${producto.id}')" title="Eliminar"> <i class="fas fa-trash"></i> </button> </div> </td> </tr> `).join('');}obtenerProductosFiltrados(){let productos = [...this.productos];if(this.filters.categoria){productos = productos.filter((p)=> p.categoriaId === this.filters.categoria);}if(this.filters.stockBajo){productos = productos.filter((p)=> p.stock <= p.stockMinimo);}if(this.filters.activo !== null){productos = productos.filter((p)=> p.activo ===(this.filters.activo === 'true'));}if(this.filters.busqueda){const busqueda = this.filters.busqueda.toLowerCase();productos = productos.filter((p)=> p.nombre.toLowerCase().includes(busqueda)|| p.codigo.toLowerCase().includes(busqueda)|| p.categoria.toLowerCase().includes(busqueda));}return productos;}actualizarEstadisticas(){const productosFiltrados = this.obtenerProductosFiltrados();const totalProductos = productosFiltrados.length;const productosActivos = productosFiltrados.filter((p)=> p.activo).length;const productosStockBajo = productosFiltrados.filter((p)=> p.stock <= p.stockMinimo).length;const valorTotalInventario = productosFiltrados.reduce((sum,p)=> sum + p.stock * p.precioCompra,0);const totalProductosEl = document.getElementById('totalProductos');const productosActivosEl = document.getElementById('productosActivos');const productosStockBajoEl = document.getElementById('productosStockBajo');const valorTotalEl = document.getElementById('valorTotalInventario');if(totalProductosEl)totalProductosEl.textContent = totalProductos;if(productosActivosEl)productosActivosEl.textContent = productosActivos;if(productosStockBajoEl)productosStockBajoEl.textContent = productosStockBajo;if(valorTotalEl)valorTotalEl.textContent = `$${valorTotalInventario.toLocaleString()}`;}mostrarModalAjustarStock(productoId){const producto = this.productos.find((p)=> p.id === productoId);if(!producto)return;const modalHTML = ` <div id="modalAjustarStock" class="axyra-modal" style="display:flex;"> <div class="axyra-modal-content"> <div class="axyra-modal-header"> <h3 class="axyra-modal-title"> <i class="fas fa-warehouse"></i> Ajustar Stock - ${producto.nombre}</h3> <button class="axyra-modal-close" onclick="cerrarModalAjustarStock()"> <i class="fas fa-times"></i> </button> </div> <div class="axyra-modal-body"> <div class="axyra-stock-info"> <p><strong>Stock actual:</strong> ${producto.stock}unidades</p> <p><strong>Stock mínimo:</strong> ${producto.stockMinimo}unidades</p> </div> <form id="formAjustarStock"> <div class="axyra-form-group"> <label for="tipoAjuste" class="axyra-form-label">Tipo de ajuste:</label> <select id="tipoAjuste" class="axyra-form-input" required> <option value="entrada">Entrada(+)</option> <option value="salida">Salida(-)</option> </select> </div> <div class="axyra-form-group"> <label for="cantidadAjuste" class="axyra-form-label">Cantidad:</label> <input type="number" id="cantidadAjuste" class="axyra-form-input" min="1" required> </div> <div class="axyra-form-group"> <label for="motivoAjuste" class="axyra-form-label">Motivo:</label> <textarea id="motivoAjuste" class="axyra-form-input" rows="3" required></textarea> </div> </form> </div> <div class="axyra-modal-footer"> <button class="axyra-btn axyra-btn-secondary" onclick="cerrarModalAjustarStock()"> Cancelar </button> <button class="axyra-btn axyra-btn-primary" onclick="axyraInventario.procesarAjusteStock('${productoId}')"> <i class="fas fa-save"></i> Ajustar Stock </button> </div> </div> </div> `;document.body.insertAdjacentHTML('beforeend',modalHTML);}async procesarAjusteStock(productoId){try{const form = document.getElementById('formAjustarStock');if(!form.checkValidity()){form.reportValidity();return;}const tipo = document.getElementById('tipoAjuste').value;const cantidad = parseInt(document.getElementById('cantidadAjuste').value);const motivo = document.getElementById('motivoAjuste').value;const cantidadAjuste = tipo === 'entrada' ? cantidad:-cantidad;await this.ajustarStock(productoId,cantidadAjuste,motivo);this.cerrarModalAjustarStock();}catch(error){console.error('❌ Error procesando ajuste de stock:',error);this.mostrarNotificacion('Error procesando ajuste de stock','error');}}cerrarModalAjustarStock(){const modal = document.getElementById('modalAjustarStock');if(modal){modal.remove();}}aplicarFiltros(){const categoria = document.getElementById('filtroCategoria')?.value;const stockBajo = document.getElementById('filtroStockBajo')?.checked;const activo = document.getElementById('filtroActivo')?.value;this.filters.categoria = categoria;this.filters.stockBajo = stockBajo;this.filters.activo = activo;this.renderizarProductos();this.actualizarEstadisticas();}limpiarFiltros(){const categoria = document.getElementById('filtroCategoria');const stockBajo = document.getElementById('filtroStockBajo');const activo = document.getElementById('filtroActivo');const busqueda = document.getElementById('busquedaProductos');if(categoria)categoria.value = '';if(stockBajo)stockBajo.checked = false;if(activo)activo.value = '';if(busqueda)busqueda.value = '';this.filters ={categoria:null,stockBajo:false,activo:null,busqueda:'',};this.renderizarProductos();this.actualizarEstadisticas();}async exportarInventario(){try{const productosFiltrados = this.obtenerProductosFiltrados();if(productosFiltrados.length === 0){this.mostrarNotificacion('No hay productos para exportar','warning');return;}const wb = XLSX.utils.book_new();const datosExcel = productosFiltrados.map((producto)=>({Código:producto.codigo,Nombre:producto.nombre,Categoría:producto.categoria,Stock:producto.stock,'Stock Mínimo':producto.stockMinimo,'Precio Compra':producto.precioCompra,'Precio Venta':producto.precioVenta,Estado:producto.activo ? 'Activo':'Inactivo',Descripción:producto.descripcion || '',}));const ws = XLSX.utils.json_to_sheet(datosExcel);XLSX.utils.book_append_sheet(wb,ws,'Inventario');const nombreArchivo = `inventario_${new Date().toISOString().split('T')[0]}.xlsx`;XLSX.writeFile(wb,nombreArchivo);this.mostrarNotificacion('Inventario exportado exitosamente','success');}catch(error){console.error('❌ Error exportando inventario:',error);this.mostrarNotificacion('Error exportando inventario','error');}}mostrarNotificacion(mensaje,tipo = 'info'){if(window.axyraNotifications){window.axyraNotifications.show(mensaje,tipo);return;}const iconos ={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️',};console.log(`${iconos[tipo]}${mensaje}`);const notificacion = document.createElement('div');notificacion.className = `axyra-notification axyra-notification-${tipo}`;notificacion.innerHTML = ` <div class="axyra-notification-content"> <div class="axyra-notification-message"> <i class="fas fa-${tipo === 'success' ? 'check':tipo === 'error' ? 'times':tipo === 'warning' ? 'exclamation':'info'}-circle"></i> <span>${mensaje}</span> </div> <button class="axyra-notification-close" onclick="this.parentElement.parentElement.remove()"> <i class="fas fa-times"></i> </button> </div> `;document.body.appendChild(notificacion);setTimeout(()=>{if(notificacion.parentElement){notificacion.remove();}},5000);}}function cerrarModalAgregarProducto(){if(window.axyraInventario){window.axyraInventario.cerrarModalAgregarProducto();}}function cerrarModalAgregarCategoria(){if(window.axyraInventario){window.axyraInventario.cerrarModalAgregarCategoria();}}function cerrarModalAjustarStock(){if(window.axyraInventario){window.axyraInventario.cerrarModalAjustarStock();}}// Funciones globales para los botones del HTML
window.mostrarModalProducto = function() {
  if (window.axyraInventario) {
    window.axyraInventario.mostrarModalAgregarProducto();
  }
};

window.mostrarModalEntrada = function() {
  if (window.axyraInventario) {
    // Crear modal para entrada de productos
    const modalHTML = `
      <div id="modalEntrada" class="axyra-modal" style="display:flex;">
        <div class="axyra-modal-content">
          <div class="axyra-modal-header">
            <h3 class="axyra-modal-title">
              <i class="fas fa-arrow-up"></i> Registrar Entrada
            </h3>
            <button class="axyra-modal-close" onclick="cerrarModalEntrada()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="axyra-modal-body">
            <form id="formEntrada">
              <div class="axyra-form-group">
                <label for="productoEntrada" class="axyra-form-label">Producto:</label>
                <select id="productoEntrada" class="axyra-form-input" required>
                  <option value="">Seleccionar producto</option>
                  ${window.axyraInventario.productos.map(p => 
                    `<option value="${p.id}">${p.nombre} (${p.codigo})</option>`
                  ).join('')}
                </select>
              </div>
              <div class="axyra-form-group">
                <label for="cantidadEntrada" class="axyra-form-label">Cantidad:</label>
                <input type="number" id="cantidadEntrada" class="axyra-form-input" min="1" required>
              </div>
              <div class="axyra-form-group">
                <label for="motivoEntrada" class="axyra-form-label">Motivo:</label>
                <textarea id="motivoEntrada" class="axyra-form-input" rows="3" required></textarea>
              </div>
            </form>
          </div>
          <div class="axyra-modal-footer">
            <button class="axyra-btn axyra-btn-secondary" onclick="cerrarModalEntrada()">
              Cancelar
            </button>
            <button class="axyra-btn axyra-btn-primary" onclick="procesarEntrada()">
              <i class="fas fa-save"></i> Registrar Entrada
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
};

window.mostrarModalSalida = function() {
  if (window.axyraInventario) {
    // Crear modal para salida de productos
    const modalHTML = `
      <div id="modalSalida" class="axyra-modal" style="display:flex;">
        <div class="axyra-modal-content">
          <div class="axyra-modal-header">
            <h3 class="axyra-modal-title">
              <i class="fas fa-arrow-down"></i> Registrar Salida
            </h3>
            <button class="axyra-modal-close" onclick="cerrarModalSalida()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="axyra-modal-body">
            <form id="formSalida">
              <div class="axyra-form-group">
                <label for="productoSalida" class="axyra-form-label">Producto:</label>
                <select id="productoSalida" class="axyra-form-input" required>
                  <option value="">Seleccionar producto</option>
                  ${window.axyraInventario.productos.map(p => 
                    `<option value="${p.id}">${p.nombre} (${p.codigo}) - Stock: ${p.stock}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="axyra-form-group">
                <label for="cantidadSalida" class="axyra-form-label">Cantidad:</label>
                <input type="number" id="cantidadSalida" class="axyra-form-input" min="1" required>
              </div>
              <div class="axyra-form-group">
                <label for="motivoSalida" class="axyra-form-label">Motivo:</label>
                <textarea id="motivoSalida" class="axyra-form-input" rows="3" required></textarea>
              </div>
            </form>
          </div>
          <div class="axyra-modal-footer">
            <button class="axyra-btn axyra-btn-secondary" onclick="cerrarModalSalida()">
              Cancelar
            </button>
            <button class="axyra-btn axyra-btn-primary" onclick="procesarSalida()">
              <i class="fas fa-save"></i> Registrar Salida
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
};

window.exportarInventarioExcel = function() {
  if (window.axyraInventario) {
    window.axyraInventario.exportarInventario();
  }
};

// Funciones para cerrar modales
window.cerrarModalEntrada = function() {
  const modal = document.getElementById('modalEntrada');
  if (modal) modal.remove();
};

window.cerrarModalSalida = function() {
  const modal = document.getElementById('modalSalida');
  if (modal) modal.remove();
};

// Funciones para procesar entradas y salidas
window.procesarEntrada = function() {
  if (window.axyraInventario) {
    const form = document.getElementById('formEntrada');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    const productoId = document.getElementById('productoEntrada').value;
    const cantidad = parseInt(document.getElementById('cantidadEntrada').value);
    const motivo = document.getElementById('motivoEntrada').value;
    
    window.axyraInventario.ajustarStock(productoId, cantidad, motivo);
    window.cerrarModalEntrada();
  }
};

window.procesarSalida = function() {
  if (window.axyraInventario) {
    const form = document.getElementById('formSalida');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    const productoId = document.getElementById('productoSalida').value;
    const cantidad = parseInt(document.getElementById('cantidadSalida').value);
    const motivo = document.getElementById('motivoSalida').value;
    
    window.axyraInventario.ajustarStock(productoId, -cantidad, motivo);
    window.cerrarModalSalida();
  }
};

document.addEventListener('DOMContentLoaded',function(){window.axyraInventario = new AxyraInventario();});console.log('📦 Sistema de Inventario AXYRA cargado');