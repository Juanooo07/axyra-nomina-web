/**
 * 📦 MÉTODOS ADICIONALES DEL SISTEMA DE INVENTARIO AXYRA
 */

// Agregar métodos al InventarioSystem
if (window.InventarioSystem) {
  InventarioSystem.prototype.showAgregarProductoModal = function () {
    const modal = document.getElementById('modalProducto');
    if (modal) {
      modal.style.display = 'block';
      this.limpiarFormularioProducto();
    }
  };

  InventarioSystem.prototype.showAgregarCategoriaModal = function () {
    const modal = document.getElementById('modalCategoria');
    if (modal) {
      modal.style.display = 'block';
      this.limpiarFormularioCategoria();
    }
  };

  InventarioSystem.prototype.showAgregarProveedorModal = function () {
    const modal = document.getElementById('modalProveedor');
    if (modal) {
      modal.style.display = 'block';
      this.limpiarFormularioProveedor();
    }
  };

  InventarioSystem.prototype.guardarProducto = function () {
    const form = document.getElementById('formProducto');
    const formData = new FormData(form);

    const producto = {
      id: 'prod_' + Date.now(),
      nombre: formData.get('nombre'),
      categoria: formData.get('categoria'),
      proveedor: formData.get('proveedor'),
      precio: parseFloat(formData.get('precio')),
      stock: parseInt(formData.get('stock')),
      stockMinimo: parseInt(formData.get('stockMinimo')),
      codigo: formData.get('codigo'),
      descripcion: formData.get('descripcion'),
      fechaIngreso: new Date().toISOString(),
      activo: true,
    };

    this.productos.push(producto);
    this.saveData();
    this.renderProductos();
    this.updateStats();
    this.cerrarModal('modalProducto');
    this.showNotification('Producto agregado', 'El producto se ha agregado correctamente', 'success');
  };

  InventarioSystem.prototype.guardarCategoria = function () {
    const form = document.getElementById('formCategoria');
    const formData = new FormData(form);

    const categoria = {
      id: 'cat_' + Date.now(),
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      activo: true,
    };

    this.categorias.push(categoria);
    this.saveData();
    this.renderCategorias();
    this.updateStats();
    this.cerrarModal('modalCategoria');
    this.showNotification('Categoría agregada', 'La categoría se ha agregado correctamente', 'success');
  };

  InventarioSystem.prototype.guardarProveedor = function () {
    const form = document.getElementById('formProveedor');
    const formData = new FormData(form);

    const proveedor = {
      id: 'prov_' + Date.now(),
      nombre: formData.get('nombre'),
      contacto: formData.get('contacto'),
      telefono: formData.get('telefono'),
      activo: true,
    };

    this.proveedores.push(proveedor);
    this.saveData();
    this.renderProveedores();
    this.updateStats();
    this.cerrarModal('modalProveedor');
    this.showNotification('Proveedor agregado', 'El proveedor se ha agregado correctamente', 'success');
  };

  InventarioSystem.prototype.editarProducto = function (id) {
    const producto = this.productos.find((p) => p.id === id);
    if (!producto) return;

    const modal = document.getElementById('modalProducto');
    if (modal) {
      modal.style.display = 'block';
      this.llenarFormularioProducto(producto);
    }
  };

  InventarioSystem.prototype.editarCategoria = function (id) {
    const categoria = this.categorias.find((c) => c.id === id);
    if (!categoria) return;

    const modal = document.getElementById('modalCategoria');
    if (modal) {
      modal.style.display = 'block';
      this.llenarFormularioCategoria(categoria);
    }
  };

  InventarioSystem.prototype.editarProveedor = function (id) {
    const proveedor = this.proveedores.find((p) => p.id === id);
    if (!proveedor) return;

    const modal = document.getElementById('modalProveedor');
    if (modal) {
      modal.style.display = 'block';
      this.llenarFormularioProveedor(proveedor);
    }
  };

  InventarioSystem.prototype.eliminarProducto = function (id) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      const index = this.productos.findIndex((p) => p.id === id);
      if (index !== -1) {
        this.productos[index].activo = false;
        this.saveData();
        this.renderProductos();
        this.updateStats();
        this.showNotification('Producto eliminado', 'El producto se ha eliminado correctamente', 'success');
      }
    }
  };

  InventarioSystem.prototype.eliminarCategoria = function (id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      const index = this.categorias.findIndex((c) => c.id === id);
      if (index !== -1) {
        this.categorias[index].activo = false;
        this.saveData();
        this.renderCategorias();
        this.updateStats();
        this.showNotification('Categoría eliminada', 'La categoría se ha eliminado correctamente', 'success');
      }
    }
  };

  InventarioSystem.prototype.eliminarProveedor = function (id) {
    if (confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      const index = this.proveedores.findIndex((p) => p.id === id);
      if (index !== -1) {
        this.proveedores[index].activo = false;
        this.saveData();
        this.renderProveedores();
        this.updateStats();
        this.showNotification('Proveedor eliminado', 'El proveedor se ha eliminado correctamente', 'success');
      }
    }
  };

  InventarioSystem.prototype.agregarStock = function (id) {
    const cantidad = prompt('Ingresa la cantidad a agregar:');
    if (cantidad && !isNaN(cantidad) && parseInt(cantidad) > 0) {
      const producto = this.productos.find((p) => p.id === id);
      if (producto) {
        producto.stock += parseInt(cantidad);
        this.saveData();
        this.renderProductos();
        this.updateStats();
        this.showNotification('Stock actualizado', `Se agregaron ${cantidad} unidades`, 'success');
      }
    }
  };

  InventarioSystem.prototype.quitarStock = function (id) {
    const cantidad = prompt('Ingresa la cantidad a quitar:');
    if (cantidad && !isNaN(cantidad) && parseInt(cantidad) > 0) {
      const producto = this.productos.find((p) => p.id === id);
      if (producto) {
        if (producto.stock >= parseInt(cantidad)) {
          producto.stock -= parseInt(cantidad);
          this.saveData();
          this.renderProductos();
          this.updateStats();
          this.showNotification('Stock actualizado', `Se quitaron ${cantidad} unidades`, 'success');
        } else {
          this.showNotification('Error', 'No hay suficiente stock', 'error');
        }
      }
    }
  };

  InventarioSystem.prototype.buscarProductos = function (termino) {
    const productosFiltrados = this.productos.filter(
      (producto) =>
        producto.activo &&
        (producto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
          producto.codigo.toLowerCase().includes(termino.toLowerCase()) ||
          producto.categoria.toLowerCase().includes(termino.toLowerCase()))
    );

    const container = document.getElementById('productosContainer');
    if (!container) return;

    if (productosFiltrados.length === 0) {
      container.innerHTML = `
                <div class="axyra-empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron productos</h3>
                    <p>Intenta con otros términos de búsqueda</p>
                </div>
            `;
      return;
    }

    // Renderizar productos filtrados
    const productosHTML = productosFiltrados
      .map(
        (producto) => `
            <div class="axyra-product-card" data-id="${producto.id}">
                <div class="axyra-product-header">
                    <div class="axyra-product-info">
                        <h4 class="axyra-product-name">${producto.nombre}</h4>
                        <p class="axyra-product-code">Código: ${producto.codigo}</p>
                    </div>
                    <div class="axyra-product-actions">
                        <button class="axyra-btn-icon" onclick="inventarioSystem.editarProducto('${
                          producto.id
                        }')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="axyra-btn-icon axyra-btn-danger" onclick="inventarioSystem.eliminarProducto('${
                          producto.id
                        }')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="axyra-product-details">
                    <div class="axyra-product-detail">
                        <span class="axyra-detail-label">Categoría:</span>
                        <span class="axyra-detail-value">${producto.categoria}</span>
                    </div>
                    <div class="axyra-product-detail">
                        <span class="axyra-detail-label">Proveedor:</span>
                        <span class="axyra-detail-value">${producto.proveedor}</span>
                    </div>
                    <div class="axyra-product-detail">
                        <span class="axyra-detail-label">Precio:</span>
                        <span class="axyra-detail-value">$${this.formatNumber(producto.precio)}</span>
                    </div>
                    <div class="axyra-product-detail">
                        <span class="axyra-detail-label">Stock:</span>
                        <span class="axyra-detail-value ${
                          producto.stock <= producto.stockMinimo ? 'axyra-stock-low' : ''
                        }">
                            ${producto.stock} ${producto.stock <= producto.stockMinimo ? '(Bajo)' : ''}
                        </span>
                    </div>
                </div>
                <div class="axyra-product-actions-bottom">
                    <button class="axyra-btn axyra-btn-sm axyra-btn-success" onclick="inventarioSystem.agregarStock('${
                      producto.id
                    }')">
                        <i class="fas fa-plus"></i>
                        Agregar Stock
                    </button>
                    <button class="axyra-btn axyra-btn-sm axyra-btn-warning" onclick="inventarioSystem.quitarStock('${
                      producto.id
                    }')">
                        <i class="fas fa-minus"></i>
                        Quitar Stock
                    </button>
                </div>
            </div>
        `
      )
      .join('');

    container.innerHTML = productosHTML;
  };

  InventarioSystem.prototype.llenarFormularioProducto = function (producto) {
    document.getElementById('productoId').value = producto.id;
    document.getElementById('productoNombre').value = producto.nombre;
    document.getElementById('productoCategoria').value = producto.categoria;
    document.getElementById('productoProveedor').value = producto.proveedor;
    document.getElementById('productoPrecio').value = producto.precio;
    document.getElementById('productoStock').value = producto.stock;
    document.getElementById('productoStockMinimo').value = producto.stockMinimo;
    document.getElementById('productoCodigo').value = producto.codigo;
    document.getElementById('productoDescripcion').value = producto.descripcion;
  };

  InventarioSystem.prototype.llenarFormularioCategoria = function (categoria) {
    document.getElementById('categoriaId').value = categoria.id;
    document.getElementById('categoriaNombre').value = categoria.nombre;
    document.getElementById('categoriaDescripcion').value = categoria.descripcion;
  };

  InventarioSystem.prototype.llenarFormularioProveedor = function (proveedor) {
    document.getElementById('proveedorId').value = proveedor.id;
    document.getElementById('proveedorNombre').value = proveedor.nombre;
    document.getElementById('proveedorContacto').value = proveedor.contacto;
    document.getElementById('proveedorTelefono').value = proveedor.telefono;
  };

  InventarioSystem.prototype.limpiarFormularioProducto = function () {
    document.getElementById('formProducto').reset();
    document.getElementById('productoId').value = '';
  };

  InventarioSystem.prototype.limpiarFormularioCategoria = function () {
    document.getElementById('formCategoria').reset();
    document.getElementById('categoriaId').value = '';
  };

  InventarioSystem.prototype.limpiarFormularioProveedor = function () {
    document.getElementById('formProveedor').reset();
    document.getElementById('proveedorId').value = '';
  };

  InventarioSystem.prototype.cerrarModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  };

  InventarioSystem.prototype.showNotification = function (title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `axyra-notification axyra-notification-${type}`;
    notification.innerHTML = `
            <div class="axyra-notification-content">
                <div class="axyra-notification-icon">
                    <i class="fas fa-${
                      type === 'success'
                        ? 'check'
                        : type === 'error'
                        ? 'times'
                        : type === 'warning'
                        ? 'exclamation'
                        : 'info'
                    }"></i>
                </div>
                <div class="axyra-notification-text">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
                <button class="axyra-notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  };

  InventarioSystem.prototype.formatNumber = function (num) {
    return new Intl.NumberFormat('es-CO').format(num);
  };
}
