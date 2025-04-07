document.addEventListener('DOMContentLoaded', function() {
    // Elementos de la interfaz
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.buttons button');
    
    // Variables de estado
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let resetScreen = false;
    const h = 0.0001; // Para derivadas
    
    // Modales
    const integralModal = document.getElementById('integral-modal');
    const derivativeModal = document.getElementById('derivative-modal');
    const equationsModal = document.getElementById('equations-modal');
    const closeButtons = document.querySelectorAll('.close');
    
    // Actualizar display
    function updateDisplay() {
        display.value = currentInput;
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
                    currentInput = calculate(previousInput, currentInput, operation);
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
                applyTrigFunction(value);
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
        
        switch(op) {
            case '+': return (a + b).toString();
            case '-': return (a - b).toString();
            case '*': return (a * b).toString();
            case '/': 
                if (b === 0) return 'Error: Div/0';
                return (a / b).toString();
            case '^': return Math.pow(a, b).toString();
            default: return b.toString();
        }
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
        } catch (e) {
            currentInput = 'Error';
            updateDisplay();
        }
    }
    
    // Cálculo de integrales (método trapezoidal)
    function calculateIntegral(func, a, b, n = 1000) {
        const h = (b - a) / n;
        let sum = 0.5 * (evaluateFunction(func, a) + evaluateFunction(func, b));
        
        for (let i = 1; i < n; i++) {
            const x = a + i * h;
            sum += evaluateFunction(func, x);
        }
        
        return sum * h;
    }
    
    // Cálculo de derivadas (diferencias finitas)
    function calculateDerivative(func, x, option) {
        const f_xh = evaluateFunction(func, x + h, option);
        const f_xmh = evaluateFunction(func, x - h, option);
        return (f_xh - f_xmh) / (2 * h);
    }
    
    // Evaluador de funciones
    // Reemplaza las funciones de evaluación existentes por estas:

function evaluateFunction(func, x, option = 1) {
    try {
        // Para funciones predefinidas
        if (option !== 1) {
            const predefined = {
                2: 'sin(x)',
                3: 'cos(x)',
                4: 'exp(x)'
            };
            func = predefined[option] || func;
        }
        return math.evaluate(func, x);
    } catch (e) {
        console.error("Error en evaluateFunction:", e);
        return NaN;
    }
}

function calculateIntegral(func, a, b) {
    return math.integrate(func, a, b);
}

function calculateDerivative(func, x) {
    return math.derivative(func, x);
}
    
    // Resolver sistema de ecuaciones (eliminación de Gauss)
    function solveEquations(matrix) {
        const n = matrix.length;
        
        for (let i = 0; i < n; i++) {
            // Buscar el máximo en la columna actual
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
                    maxRow = k;
                }
            }
            
            // Intercambiar filas
            [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
            
            // Hacer ceros debajo del pivote actual
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
    }
    
    // Eventos para los modales
    document.getElementById('calculate-integral').addEventListener('click', function() {
        const func = document.getElementById('integral-function').value;
        const a = parseFloat(document.getElementById('integral-a').value);
        const b = parseFloat(document.getElementById('integral-b').value);
        
        if (func && !isNaN(a) && !isNaN(b)) {
            const result = calculateIntegral(func, a, b);
            currentInput = `∫=${result.toFixed(6)}`;
            updateDisplay();
            integralModal.style.display = 'none';
        }
    });
    
    document.getElementById('calculate-derivative').addEventListener('click', function() {
        const option = parseInt(document.getElementById('derivative-option').value);
        const func = document.getElementById('derivative-function').value;
        const x = parseFloat(document.getElementById('derivative-x').value);
        
        if (!isNaN(x)) {
            const result = calculateDerivative(func, x, option);
            currentInput = `f'(${x})=${result.toFixed(5)}`;
            updateDisplay();
            derivativeModal.style.display = 'none';
        }
    });
    
    document.getElementById('equations-count').addEventListener('change', function() {
        const n = parseInt(this.value);
        const container = document.getElementById('equations-inputs');
        container.innerHTML = '';
        
        if (n > 0 && n <= 10) {
            for (let i = 0; i < n; i++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = `Ecuación ${i+1} (coeficientes separados por espacios)`;
                input.dataset.row = i;
                container.appendChild(input);
                container.appendChild(document.createElement('br'));
            }
        }
    });
    
    document.getElementById('calculate-equations').addEventListener('click', function() {
        const n = parseInt(document.getElementById('equations-count').value);
        const inputs = document.querySelectorAll('#equations-inputs input');
        const matrix = [];
        
        if (inputs.length === n) {
            for (let i = 0; i < n; i++) {
                const values = inputs[i].value.trim().split(/\s+/).map(Number);
                if (values.length === n + 1) {
                    matrix.push(values);
                } else {
                    alert(`La ecuación ${i+1} no tiene el formato correcto`);
                    return;
                }
            }
            
            const solution = solveEquations(matrix);
            let solutionText = "Soluciones:\n";
            solution.forEach((val, i) => {
                solutionText += `x${i+1} = ${val.toFixed(4)}\n`;
            });
            
            currentInput = solutionText.split('\n')[0];
            updateDisplay();
            alert(solutionText);
            equationsModal.style.display = 'none';
        }
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
});