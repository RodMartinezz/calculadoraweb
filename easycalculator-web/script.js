document.addEventListener('DOMContentLoaded', function() {
    // Elementos de la interfaz
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.buttons button');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    
    // Variables de estado
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let resetScreen = false;
    const h = 0.0001; // Para derivadas
    let calculationHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];
    
    // Modales
    const integralModal = document.getElementById('integral-modal');
    const derivativeModal = document.getElementById('derivative-modal');
    const equationsModal = document.getElementById('equations-modal');
    const closeButtons = document.querySelectorAll('.close');
    
    // Actualizar display
    function updateDisplay() {
        display.value = currentInput;
    }
    
    // Actualizar historial
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        calculationHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <span class="expression">${item.expression}</span>
                <span class="result">= ${item.result}</span>
                <div style="clear: both;"></div>
            `;
            historyList.appendChild(historyItem);
        });
    }
    
    // Agregar al historial
    function addToHistory(expression, result) {
        calculationHistory.unshift({
            expression: expression,
            result: result,
            timestamp: new Date()
        });
        
        if (calculationHistory.length > 50) {
            calculationHistory.pop();
        }
        
        updateHistoryDisplay();
        localStorage.setItem('calcHistory', JSON.stringify(calculationHistory));
    }
    
    // Manejar clicks en botones
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;
            
            if (button.classList.contains('btn-number')) {
                if (currentInput === '0' || resetScreen) {
                    currentInput = value;
                    resetScreen = false;
                } else {
                    currentInput += value;
                }
                updateDisplay();
            } 
            else if (button.classList.contains('btn-clear')) {
                currentInput = '0';
                previousInput = '';
                operation = null;
                updateDisplay();
            } 
            else if (button.classList.contains('btn-equals')) {
                if (operation && previousInput) {
                    const result = calculate(previousInput, currentInput, operation);
                    addToHistory(`${previousInput} ${operation} ${currentInput}`, result);
                    currentInput = result;
                    operation = null;
                    previousInput = '';
                    resetScreen = true;
                    updateDisplay();
                }
            } 
            else if (button.classList.contains('btn-operator')) {
                if (operation) {
                    currentInput = calculate(previousInput, currentInput, operation);
                }
                previousInput = currentInput;
                operation = value;
                resetScreen = true;
                updateDisplay();
            }
            else if (button.classList.contains('btn-special')) {
                if (value === '±') {
                    if (currentInput !== '0') {
                        currentInput = (parseFloat(currentInput) * -1).toString();
                        updateDisplay();
                    }
                }
            }
            else if (button.classList.contains('btn-function')) {
                const result = applyTrigFunction(value);
                addToHistory(`${value}(${currentInput})`, result);
            }
            else if (button.classList.contains('btn-advanced')) {
                if (value === '∫') {
                    integralModal.style.display = 'block';
                } 
                else if (value === 'dx') {
                    derivativeModal.style.display = 'block';
                } 
                else if (value === 'se') {
                    equationsModal.style.display = 'block';
                }
            }
            else if (value === '.') {
                if (!currentInput.includes('.')) {
                    currentInput += '.';
                    updateDisplay();
                }
            }
        });
    });
    
    // Función de cálculo básico
    function calculate(a, b, op) {
        a = parseFloat(a);
        b = parseFloat(b);
        let result;
        
        switch(op) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/': 
                if (b === 0) return 'Error: Div/0';
                result = a / b; break;
            case '^': result = Math.pow(a, b); break;
            default: return b.toString();
        }
        
        return result.toString();
    }
    
    // Funciones trigonométricas
    function applyTrigFunction(func) {
        try {
            const valor = parseFloat(currentInput);
            let resultado = 0;
            
            switch(func) {
                case 'cos': resultado = Math.cos(Math.PI * valor / 180); break;
                case 'sin': resultado = Math.sin(Math.PI * valor / 180); break;
                case 'tan': resultado = Math.tan(Math.PI * valor / 180); break;
            }
            
            currentInput = resultado.toString();
            updateDisplay();
            return resultado;
        } catch (e) {
            currentInput = 'Error';
            updateDisplay();
            return 'Error';
        }
    }
    
    // Cálculo de integrales (método trapezoidal) - CORREGIDO
    function calculateIntegral(func, a, b, n = 1000) {
        try {
            // Limpiar y preparar la función
            func = func.replace(/\s+/g, ''); // Eliminar espacios
            const cleanFunc = func.replace(/\^/g, '**'); // Convertir ^ a **
            
            // Crear función evaluable
            const evaluator = new Function('x', `
                try {
                    return ${cleanFunc.replace(/x/g, '(x)')};
                } catch (e) {
                    return NaN;
                }
            `);
            
            // Método trapezoidal
            const h = (b - a) / n;
            let sum = 0.5 * (evaluator(a) + evaluator(b));
            
            for (let i = 1; i < n; i++) {
                const x = a + i * h;
                const fx = evaluator(x);
                if (isNaN(fx)) {
                    throw new Error('La función no pudo evaluarse en x=' + x);
                }
                sum += fx;
            }
            
            const result = sum * h;
            addToHistory(`∫(${func}) de ${a} a ${b}`, result.toFixed(6));
            return result;
        } catch (e) {
            console.error("Error en integral:", e);
            return NaN;
        }
    }
    
    // Cálculo de derivadas (diferencias finitas) - CORREGIDO
    function calculateDerivative(func, x, option = 1) {
        try {
            // Manejar funciones predefinidas
            if (option !== 1) {
                const predefined = {
                    2: 'sin(x)',
                    3: 'cos(x)',
                    4: 'exp(x)'
                };
                func = predefined[option] || func;
            }
            
            // Limpiar la función
            func = func.replace(/\s+/g, '');
            const cleanFunc = func.replace(/\^/g, '**');
            
            // Crear función evaluable
            const evaluator = new Function('x', `
                try {
                    return ${cleanFunc.replace(/x/g, '(x)')};
                } catch (e) {
                    return NaN;
                }
            `);
            
            // Diferencias finitas centradas
            const f_xh = evaluator(x + h);
            const f_xmh = evaluator(x - h);
            
            if (isNaN(f_xh) || isNaN(f_xmh)) {
                throw new Error('La función no pudo evaluarse en los puntos requeridos');
            }
            
            const result = (f_xh - f_xmh) / (2 * h);
            addToHistory(`d/dx(${func}) en x=${x}`, result.toFixed(6));
            return result;
        } catch (e) {
            console.error("Error en derivada:", e);
            return NaN;
        }
    }
    
    // Resolver sistema de ecuaciones (eliminación de Gauss) - CORREGIDO
    function solveEquations(matrix) {
        try {
            const n = matrix.length;
            
            // Validar matriz
            for (let i = 0; i < n; i++) {
                if (matrix[i].length !== n + 1) {
                    throw new Error(`La fila ${i+1} no tiene el número correcto de coeficientes`);
                }
            }
            
            // Eliminación gaussiana
            for (let i = 0; i < n; i++) {
                // Búsqueda de pivote máximo
                let maxRow = i;
                for (let k = i + 1; k < n; k++) {
                    if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
                        maxRow = k;
                    }
                }
                
                // Intercambio de filas
                [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
                
                // Verificar si el sistema es singular
                if (Math.abs(matrix[i][i]) < 1e-10) {
                    throw new Error('El sistema no tiene solución única (matriz singular)');
                }
                
                // Eliminación hacia adelante
                for (let k = i + 1; k < n; k++) {
                    const factor = matrix[k][i] / matrix[i][i];
                    for (let j = i; j <= n; j++) {
                        matrix[k][j] -= factor * matrix[i][j];
                    }
                }
            }
            
            // Sustitución hacia atrás
            const solution = new Array(n);
            for (let i = n - 1; i >= 0; i--) {
                solution[i] = matrix[i][n] / matrix[i][i];
                for (let k = i - 1; k >= 0; k--) {
                    matrix[k][n] -= matrix[k][i] * solution[i];
                }
            }
            
            return solution;
        } catch (e) {
            console.error("Error al resolver ecuaciones:", e);
            throw e; // Re-lanzar para manejar en el llamador
        }
    }
    
    // Eventos para los modales - ACTUALIZADOS
    document.getElementById('calculate-integral').addEventListener('click', function() {
        try {
            const func = document.getElementById('integral-function').value;
            const a = parseFloat(document.getElementById('integral-a').value);
            const b = parseFloat(document.getElementById('integral-b').value);
            
            if (!func || isNaN(a) || isNaN(b)) {
                throw new Error('Datos de entrada inválidos');
            }
            
            const result = calculateIntegral(func, a, b);
            if (isNaN(result)) {
                throw new Error('No se pudo calcular la integral. Verifica la función.');
            }
            
            currentInput = `∫=${result.toFixed(6)}`;
            updateDisplay();
            integralModal.style.display = 'none';
        } catch (e) {
            alert(e.message);
            console.error("Error en integral:", e);
        }
    });
    
    document.getElementById('calculate-derivative').addEventListener('click', function() {
        try {
            const option = parseInt(document.getElementById('derivative-option').value);
            const func = option === 1 ? document.getElementById('derivative-function').value : '';
            const x = parseFloat(document.getElementById('derivative-x').value);
            
            if (isNaN(x)) {
                throw new Error('Valor de x inválido');
            }
            
            const result = calculateDerivative(func, x, option);
            if (isNaN(result)) {
                throw new Error('No se pudo calcular la derivada. Verifica la función.');
            }
            
            currentInput = `f'(${x})=${result.toFixed(5)}`;
            updateDisplay();
            derivativeModal.style.display = 'none';
        } catch (e) {
            alert(e.message);
            console.error("Error en derivada:", e);
        }
    });
    
    document.getElementById('equations-count').addEventListener('change', function() {
        try {
            const n = parseInt(this.value);
            const container = document.getElementById('equations-inputs');
            container.innerHTML = '';
            
            if (n > 0 && n <= 10) {
                for (let i = 0; i < n; i++) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = `Ecuación ${i+1} (${n+1} coeficientes separados por espacios)`;
                    input.dataset.row = i;
                    container.appendChild(input);
                    container.appendChild(document.createElement('br'));
                }
            } else {
                throw new Error('Número de ecuaciones debe ser entre 1 y 10');
            }
        } catch (e) {
            alert(e.message);
        }
    });
    
    document.getElementById('calculate-equations').addEventListener('click', function() {
        try {
            const n = parseInt(document.getElementById('equations-count').value);
            const inputs = document.querySelectorAll('#equations-inputs input');
            
            if (inputs.length !== n) {
                throw new Error('Número de ecuaciones no coincide');
            }
            
            const matrix = [];
            for (let i = 0; i < n; i++) {
                const values = inputs[i].value.trim().split(/\s+/);
                if (values.length !== n + 1) {
                    throw new Error(`La ecuación ${i+1} debe tener ${n+1} coeficientes`);
                }
                
                const row = values.map(val => {
                    const num = parseFloat(val);
                    if (isNaN(num)) {
                        throw new Error(`Coeficiente inválido en ecuación ${i+1}`);
                    }
                    return num;
                });
                
                matrix.push(row);
            }
            
            const solution = solveEquations(matrix);
            let solutionText = "Soluciones:\n";
            solution.forEach((val, i) => {
                solutionText += `x${i+1} = ${val.toFixed(4)}\n`;
            });
            
            currentInput = `Solución: x1=${solution[0].toFixed(2)}...`;
            updateDisplay();
            alert(solutionText);
            addToHistory(`Sistema ${n}x${n}`, solutionText.replace(/\n/g, ', '));
            equationsModal.style.display = 'none';
        } catch (e) {
            alert(e.message);
            console.error("Error al resolver ecuaciones:", e);
        }
    });
    
    // Limpiar historial
    clearHistoryBtn.addEventListener('click', function() {
        calculationHistory = [];
        updateHistoryDisplay();
        localStorage.setItem('calcHistory', JSON.stringify(calculationHistory));
    });
    
    // Cerrar modales
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Inicializar
    updateDisplay();
    updateHistoryDisplay();
});