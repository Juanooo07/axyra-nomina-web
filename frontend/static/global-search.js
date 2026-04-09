/**
 * 🔍 BÚSQUEDA GLOBAL FUNCIONAL - AXYRA
 * 
 * Sistema de búsqueda que funciona en todas las páginas
 * y busca en empleados, nóminas, movimientos, etc.
 */

class GlobalSearch {
    constructor() {
        this.searchResults = [];
        this.searchIndex = {};
        this.isSearching = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.buildSearchIndex();
        console.log('🔍 Búsqueda global inicializada');
    }

    setupEventListeners() {
        const searchInput = document.getElementById('global-search');
        const searchBtn = document.getElementById('search-btn');
        const searchResults = document.getElementById('search-results');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });

            searchInput.addEventListener('focus', () => {
                this.showSearchResults();
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput?.value || '';
                this.performSearch(query);
            });
        }

        // Cerrar resultados al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchResults();
            }
        });
    }

    async buildSearchIndex() {
        try {
            this.searchIndex = {
                empleados: await this.getEmpleadosData(),
                nominas: await this.getNominasData(),
                movimientos: await this.getMovimientosData(),
                departamentos: await this.getDepartamentosData()
            };
            console.log('📚 Índice de búsqueda construido');
        } catch (error) {
            console.error('Error construyendo índice de búsqueda:', error);
        }
    }

    async getEmpleadosData() {
        try {
            if (window.firebase && window.firebase.firestore) {
                const db = firebase.firestore();
                const snapshot = await db.collection('empleados').get();
                
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data(),
                    type: 'empleado',
                    searchableText: this.buildSearchableText(doc.data(), [
                        'nombre', 'apellido', 'cedula', 'cargo', 'departamento', 'email'
                    ])
                }));
            }
        } catch (error) {
            console.error('Error obteniendo datos de empleados:', error);
        }
        return [];
    }

    async getNominasData() {
        try {
            if (window.firebase && window.firebase.firestore) {
                const db = firebase.firestore();
                const snapshot = await db.collection('nominas').get();
                
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data(),
                    type: 'nomina',
                    searchableText: this.buildSearchableText(doc.data(), [
                        'periodo', 'empleado', 'totalPagar', 'fechaGeneracion'
                    ])
                }));
            }
        } catch (error) {
            console.error('Error obteniendo datos de nóminas:', error);
        }
        return [];
    }

    async getMovimientosData() {
        try {
            if (window.firebase && window.firebase.firestore) {
                const db = firebase.firestore();
                const snapshot = await db.collection('movimientos_caja').get();
                
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data(),
                    type: 'movimiento',
                    searchableText: this.buildSearchableText(doc.data(), [
                        'concepto', 'tipo', 'categoria', 'observaciones'
                    ])
                }));
            }
        } catch (error) {
            console.error('Error obteniendo datos de movimientos:', error);
        }
        return [];
    }

    async getDepartamentosData() {
        try {
            if (window.firebase && window.firebase.firestore) {
                const db = firebase.firestore();
                const snapshot = await db.collection('departamentos').get();
                
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data(),
                    type: 'departamento',
                    searchableText: this.buildSearchableText(doc.data(), [
                        'nombre', 'descripcion', 'responsable'
                    ])
                }));
            }
        } catch (error) {
            console.error('Error obteniendo datos de departamentos:', error);
        }
        return [];
    }

    buildSearchableText(data, fields) {
        return fields.map(field => {
            const value = data[field];
            return value ? value.toString().toLowerCase() : '';
        }).join(' ');
    }

    handleSearch(query) {
        if (query.length < 2) {
            this.hideSearchResults();
            return;
        }

        this.searchResults = this.searchInIndex(query);
        this.showSearchResults();
    }

    searchInIndex(query) {
        const results = [];
        const searchTerm = query.toLowerCase();

        Object.keys(this.searchIndex).forEach(category => {
            this.searchIndex[category].forEach(item => {
                if (item.searchableText.includes(searchTerm)) {
                    results.push({
                        ...item,
                        relevance: this.calculateRelevance(item.searchableText, searchTerm)
                    });
                }
            });
        });

        // Ordenar por relevancia
        return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
    }

    calculateRelevance(text, query) {
        const words = query.split(' ');
        let score = 0;
        
        words.forEach(word => {
            if (text.includes(word)) {
                score += 1;
                // Bonus por coincidencia exacta
                if (text.includes(word + ' ')) {
                    score += 0.5;
                }
            }
        });

        return score;
    }

    showSearchResults() {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        if (this.searchResults.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No se encontraron resultados</div>';
        } else {
            searchResults.innerHTML = this.searchResults.map(result => `
                <div class="search-result-item" data-type="${result.type}" data-id="${result.id}">
                    <div class="search-result-icon">
                        <i class="fas fa-${this.getResultIcon(result.type)}"></i>
                    </div>
                    <div class="search-result-content">
                        <div class="search-result-title">${this.getResultTitle(result)}</div>
                        <div class="search-result-description">${this.getResultDescription(result)}</div>
                        <div class="search-result-type">${this.getResultTypeLabel(result.type)}</div>
                    </div>
                </div>
            `).join('');
        }

        searchResults.style.display = 'block';

        // Agregar event listeners a los resultados
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                this.handleResultClick(item);
            });
        });
    }

    hideSearchResults() {
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.style.display = 'none';
        }
    }

    getResultIcon(type) {
        const icons = {
            empleado: 'user',
            nomina: 'calculator',
            movimiento: 'cash-register',
            departamento: 'building'
        };
        return icons[type] || 'file';
    }

    getResultTitle(result) {
        switch (result.type) {
            case 'empleado':
                return `${result.data.nombre || ''} ${result.data.apellido || ''}`.trim() || 'Empleado';
            case 'nomina':
                return `Nómina - ${result.data.periodo || 'Período'}`;
            case 'movimiento':
                return result.data.concepto || 'Movimiento de caja';
            case 'departamento':
                return result.data.nombre || 'Departamento';
            default:
                return 'Resultado';
        }
    }

    getResultDescription(result) {
        switch (result.type) {
            case 'empleado':
                return `${result.data.cargo || ''} - ${result.data.departamento || ''}`.trim() || 'Sin descripción';
            case 'nomina':
                return `Total: $${this.formatCurrency(result.data.totalPagar || 0)}`;
            case 'movimiento':
                return `${result.data.tipo || ''} - $${this.formatCurrency(result.data.monto || 0)}`;
            case 'departamento':
                return result.data.descripcion || 'Sin descripción';
            default:
                return 'Sin descripción';
        }
    }

    getResultTypeLabel(type) {
        const labels = {
            empleado: 'Empleado',
            nomina: 'Nómina',
            movimiento: 'Movimiento',
            departamento: 'Departamento'
        };
        return labels[type] || 'Otro';
    }

    handleResultClick(item) {
        const type = item.dataset.type;
        const id = item.dataset.id;

        // Navegar a la página correspondiente
        switch (type) {
            case 'empleado':
                this.navigateToEmpleados();
                break;
            case 'nomina':
                this.navigateToNominas();
                break;
            case 'movimiento':
                this.navigateToCuadreCaja();
                break;
            case 'departamento':
                this.navigateToDepartamentos();
                break;
        }

        this.hideSearchResults();
        
        // Limpiar búsqueda
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.value = '';
        }
    }

    navigateToEmpleados() {
        window.location.href = '/modulos/gestion_personal/gestion_personal.html#empleados';
    }

    navigateToNominas() {
        window.location.href = '/modulos/gestion_personal/gestion_personal.html#nomina';
    }

    navigateToCuadreCaja() {
        window.location.href = '/modulos/cuadre_caja/index.html';
    }

    navigateToDepartamentos() {
        window.location.href = '/modulos/gestion_personal/gestion_personal.html#departamentos';
    }

    performSearch(query) {
        if (!query.trim()) return;

        this.handleSearch(query);
        
        // Mostrar notificación de búsqueda
        if (window.notificationsSystem) {
            window.notificationsSystem.showInfo(
                'Búsqueda realizada',
                `Se encontraron ${this.searchResults.length} resultados para "${query}"`
            );
        }
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    }

    // Método público para actualizar el índice
    async refreshSearchIndex() {
        await this.buildSearchIndex();
        console.log('🔄 Índice de búsqueda actualizado');
    }
}

// Inicializar búsqueda global
let globalSearch;

document.addEventListener('DOMContentLoaded', () => {
    globalSearch = new GlobalSearch();
    window.globalSearch = globalSearch;
});

// Exportar para uso global
window.GlobalSearch = GlobalSearch;
