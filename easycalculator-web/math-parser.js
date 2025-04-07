const math = {
    evaluate: function(expr, xValue = null) {
        try {
            // Paso 1: Limpieza y preparación de la expresión
            let cleanExpr = expr
                .replace(/\s+/g, '') // Elimina todos los espacios
                .replace(/\^/g, '**') // Reemplaza ^ con ** (potencia en JS)
                .replace(/x/g, '(x)'); // Asegura que x esté entre paréntesis
            
            // Paso 2: Crear función evaluadora segura
            const evaluator = new Function('x', `
                'use strict';
                try {
                    return ${cleanExpr};
                } catch (e) {
                    return NaN;
                }
            `);
            
            // Paso 3: Evaluar (con o sin valor x)
            return xValue !== null ? evaluator(xValue) : evaluator;
        } catch (e) {
            console.error(`Error al evaluar "${expr}":`, e);
            return NaN;
        }
    },
    
    // Función adicional para integrar
    integrate: function(func, a, b, n = 1000) {
        const evaluator = this.evaluate(func);
        if (typeof evaluator !== 'function') return NaN;
        
        const h = (b - a) / n;
        let sum = 0.5 * (evaluator(a) + evaluator(b));
        
        for (let i = 1; i < n; i++) {
            sum += evaluator(a + i * h);
        }
        
        return sum * h;
    },
    
    // Función adicional para derivar
    derivative: function(func, x, h = 0.0001) {
        const evaluator = this.evaluate(func);
        if (typeof evaluator !== 'function') return NaN;
        
        return (evaluator(x + h) - evaluator(x - h)) / (2 * h);
    }
};