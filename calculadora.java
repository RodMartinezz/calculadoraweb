


import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.text.DecimalFormat;
import java.util.Scanner;

public class calculadora extends JFrame implements ActionListener {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private JTextField display;
    private String operador = "";
    private double numero1 = 0;
    private boolean nuevaOperacion = true;

    private String funcionUsuario = "sin"; // Función por defecto

    private String[] botones = {
            "7", "8", "9", "+", "cos", "^", "C",
            "4", "5", "6", "-", "sen", "(", "±",
            "1", "2", "3", "*", "tan", ")", "∫",
            "=", "0", ".", "/", "x", "se", "dx"
    };

    static double h = 0.0001;  // Valor pequeño para aproximación numérica

    public calculadora() {
        setTitle("Calculadora Científica");
        setSize(350, 450);
        setLayout(new BorderLayout());
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        display = new JTextField();
        display.setEditable(false);
        display.setFont(new Font("SansSerif", Font.PLAIN, 24));
        display.setHorizontalAlignment(JTextField.RIGHT);
        display.setBackground(new Color(245, 245, 245));
        display.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        add(display, BorderLayout.NORTH);

        JPanel panelBotones = new JPanel();
        panelBotones.setLayout(new GridLayout(4, 7, 5, 5)); // 4 filas y 7 columnas
        panelBotones.setBackground(new Color(255, 255, 255));

        for (String text : botones) {
            JButton button = new JButton(text);
            button.setFont(new Font("SansSerif", Font.PLAIN, 18));
            button.setFocusPainted(false);
            button.setBackground(new Color(220, 220, 220));
            button.setBorder(BorderFactory.createLineBorder(new Color(200, 200, 200), 1));
            button.addActionListener(this);
            panelBotones.add(button);
        }

        add(panelBotones, BorderLayout.CENTER);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        String comando = e.getActionCommand();

        if (comando.equals("C")) {
            display.setText("");
            operador = "";
            numero1 = 0;
            nuevaOperacion = true;
        } else if (comando.equals("±")) {
            if (!display.getText().isEmpty()) {
                try {
                    double valor = Double.parseDouble(display.getText());
                    valor *= -1;
                    display.setText(String.valueOf(valor));
                } catch (NumberFormatException ex) {
                    display.setText("Error");
                }
            }
        } else if (comando.equals("=")) {
            calcular();
            nuevaOperacion = true;
        } else if (comando.equals("+") || comando.equals("-") || comando.equals("*") || comando.equals("/")) {
            if (!display.getText().isEmpty()) {
                try {
                    numero1 = Double.parseDouble(display.getText());
                    operador = comando;
                    nuevaOperacion = true;
                } catch (NumberFormatException ex) {
                    display.setText("Error");
                }
            }
        } else if (comando.equals("^")) {
            if (!display.getText().isEmpty()) {
                try {
                    numero1 = Double.parseDouble(display.getText());
                    operador = "^";
                    nuevaOperacion = true;
                } catch (NumberFormatException ex) {
                    display.setText("Error");
                }
            }
        } else if (comando.equals("cos") || comando.equals("sen") || comando.equals("tan")) {
            aplicarFuncionTrigonometrica(comando);
        } else if (comando.equals("∫")) {
            calcularIntegral();
        } else if (comando.equals("dx")) {
            calcularDerivada();
        } else if (comando.equals("se")) {
            resolverSistemaEcuaciones();
        } else {
            if (nuevaOperacion) {
                display.setText("");
                nuevaOperacion = false;
            }
            if (comando.equals(".") && display.getText().contains(".")) {
                return;
            }
            display.setText(display.getText() + comando);
        }
    }

    private void calcular() {
        if (!display.getText().isEmpty() && !operador.isEmpty()) {
            try {
                double numero2 = Double.parseDouble(display.getText());
                double resultado = 0;

                switch (operador) {
                    case "+":
                        resultado = numero1 + numero2;
                        break;
                    case "-":
                        resultado = numero1 - numero2;
                        break;
                    case "*":
                        resultado = numero1 * numero2;
                        break;
                    case "/":
                        if (numero2 != 0) {
                            resultado = numero1 / numero2;
                        } else {
                            display.setText("Error: División por cero");
                            return;
                        }
                        break;
                    case "^":
                        resultado = Math.pow(numero1, numero2);
                        break;
                }
                display.setText(String.valueOf(resultado));
                operador = "";
            } catch (NumberFormatException ex) {
                display.setText("Error");
            }
        }
    }

    private void aplicarFuncionTrigonometrica(String funcion) {
        if (!display.getText().isEmpty()) {
            try {
                double valor = Double.parseDouble(display.getText());
                double resultado = 0;

                switch (funcion) {
                    case "cos":
                        resultado = Math.cos(Math.toRadians(valor));
                        break;
                    case "sen":
                        resultado = Math.sin(Math.toRadians(valor));
                        break;
                    case "tan":
                        resultado = Math.tan(Math.toRadians(valor));
                        break;
                }

                display.setText(String.valueOf(resultado));
            } catch (NumberFormatException ex) {
                display.setText("Error");
            }
        }
    }

    private void calcularIntegral() {
        try {
            funcionUsuario = JOptionPane.showInputDialog(this, "Ingresa la función (Ejemplo: 2*x^2):");
            double a = Double.parseDouble(JOptionPane.showInputDialog(this, "Ingresa el límite inferior:"));
            double b = Double.parseDouble(JOptionPane.showInputDialog(this, "Ingresa el límite superior:"));
            int n = 1000;

            // Calcular la integral usando el método trapezoidal
            double resultado = trapezoidalRule(a, b, n);
            display.setText(String.format("∫ ≈ %.6f", resultado));

        } catch (NumberFormatException ex) {
            display.setText("Syntax_Error");
        }
    }

    // Método que evalúa una función polinómica simple
    private double f(double x) {
        return evaluarFuncion(funcionUsuario, x);
    }

    private double evaluarFuncion(String funcion, double x) {
        funcion = funcion.replace("x", String.valueOf(x)); // Reemplaza x con su valor
        if (funcion.contains("^")) {
            String[] partes = funcion.split("\\^");
            double base = Double.parseDouble(partes[0]);
            double exponente = Double.parseDouble(partes[1]);
            return Math.pow(base, exponente);
        }
        return Double.parseDouble(funcion);
    }

    private double trapezoidalRule(double a, double b, int n) {
        double h = (b - a) / n;
        double sum = 0.5 * (f(a) + f(b));

        for (int i = 1; i < n; i++) {
            double x = a + i * h;
            sum += f(x);
        }

        return sum * h;
    }

    private void calcularDerivada() {
        Scanner sc = new Scanner(System.in);

        // Se pide al usuario que elija una función
        String opcionStr = JOptionPane.showInputDialog(this, 
                "Elige una función de las siguientes opciones a derivar:\n" +
                "1. Ingresar una función con x de forma manual (ejemplo: 2*x^2 + 3*x + 1)\n" +
                "2. f(x) = sin(x)\n" +
                "3. f(x) = cos(x)\n" +
                "4. f(x) = exp(x) (e^x)\n" +
                "Introduce el número de la función:");
        
        int opcion = Integer.parseInt(opcionStr);
        String funcion = "";

        if (opcion == 1) {
            funcion = JOptionPane.showInputDialog(this, "Ingrese la función de f(x):");
        }

        String xStr = JOptionPane.showInputDialog(this, "Ingrese el valor de x en el cual quiere derivar:");
        double x = Double.parseDouble(xStr);

        DecimalFormat df = new DecimalFormat("#.#####");
        double derivada = derivadaNewton(x, opcion, funcion);
        display.setText("La derivada de f(x) en x = " + df.format(derivada));
    }

    // Método para calcular la derivada usando diferencias finitas centradas (Newton)
    public static double derivadaNewton(double x, int opcion, String funcion) {
        double f_xh = f(x + h, opcion, funcion);
        double f_xmh = f(x - h, opcion, funcion);
        return (f_xh - f_xmh) / (2 * h);
    }

    // Función f(x) con diferentes opciones para el usuario
    public static double f(double x, int opcion, String funcion) {
        switch (opcion) {
            case 1:
                // Aquí se evalúa la función personalizada que el usuario ingresó
                return evaluarFuncionPersonalizada(funcion, x);
            case 2:
                // f(x) = sin(x)
                return Math.sin(x);
            case 3:
                // f(x) = cos(x)
                return Math.cos(x);
            case 4:
                // f(x) = exp(x)
                return Math.exp(x);
            default:
                System.out.println("Opción no válida.");
                return 0;
        }
    }

    // Método para evaluar la función personalizada ingresada por el usuario
    public static double evaluarFuncionPersonalizada(String funcion, double x) {
        // Reemplazar "x" por el valor numérico ingresado en la función
        String funcionEvaluada = funcion.replace("x", Double.toString(x));

        // Evaluar la expresión utilizando el evaluador de expresiones
        try {
            return eval(funcionEvaluada);
        } catch (Exception e) {
            System.out.println("Error al evaluar la función personalizada.");
            return 0;
        }
    }

    // Evaluador simple de expresiones matemáticas con soporte para potencias
    public static double eval(final String str) {
        return new Object() {
            int pos = -1, ch;

            void nextChar() {
                ch = (++pos < str.length()) ? str.charAt(pos) : -1;
            }

            boolean eat(int charToEat) {
                while (ch == ' ') nextChar();
                if (ch == charToEat) {
                    nextChar();
                    return true;
                }
                return false;
            }

            double parse() {
                nextChar();
                double x = parseExpression();
                if (pos < str.length()) throw new RuntimeException("Carácter inesperado: " + (char) ch);
                return x;
            }

            double parseExpression() {
                double x = parseTerm();
                for (;;) {
                    if      (eat('+')) x += parseTerm(); // suma
                    else if (eat('-')) x -= parseTerm(); // resta
                    else return x;
                }
            }

            double parseTerm() {
                double x = parseFactor();
                for (;;) {
                    if      (eat('*')) x *= parseFactor(); // multiplicación
                    else if (eat('/')) x /= parseFactor(); // división
                    else return x;
                }
            }

            double parseFactor() {
                if (eat('+')) return parseFactor();
                if (eat('-')) return -parseFactor();

                double x;
                int startPos = this.pos;
                if (eat('(')) { 
                    x = parseExpression();
                    eat(')');
                } else if ((ch >= '0' && ch <= '9') || ch == '.') { 
                    while ((ch >= '0' && ch <= '9') || ch == '.') nextChar();
                    x = Double.parseDouble(str.substring(startPos, this.pos));
                } else if (ch == '^') {
                    eat('^');
                    x = Math.pow(parseFactor(), 2);  // Elevar al cuadrado
                } else if (ch == -1) {  // Fin de la cadena
                    return 1;
                } else {
                    throw new RuntimeException("Carácter inesperado: " + (char) ch);
                }

                // Evaluar potencias (como x^2)
                while (eat('^')) x = Math.pow(x, parseFactor());

                return x;
            }
        }.parse();
    }

    private void resolverSistemaEcuaciones() {
        Scanner sc = new Scanner(System.in);

        // Leer el número de ecuaciones
        String nStr = JOptionPane.showInputDialog(this, "Ingrese el número de ecuaciones:");
        int n = Integer.parseInt(nStr);

        // Matriz aumentada del sistema de ecuaciones
        double[][] augmentedMatrix = new double[n][n + 1];

        // Leer los coeficientes de las ecuaciones
        StringBuilder coeficientes = new StringBuilder("Ingrese los coeficientes de la matriz aumentada (incluyendo términos independientes):\n");
        for (int i = 0; i < n; i++) {
            String filaStr = JOptionPane.showInputDialog(this, coeficientes.toString() + "Ecuación " + (i + 1) + ":");
            String[] elementos = filaStr.split(" ");
            for (int j = 0; j <= n; j++) {
                augmentedMatrix[i][j] = Double.parseDouble(elementos[j]);
            }
        }

        // Aplicar eliminación de Gauss
        for (int i = 0; i < n; i++) {
            // Verificar si el pivote es cero
            if (augmentedMatrix[i][i] == 0) {
                JOptionPane.showMessageDialog(this, "El sistema no tiene solución única.");
                return;
            }

            // Hacer el pivote igual a 1
            double pivot = augmentedMatrix[i][i];
            for (int j = 0; j <= n; j++) {
                augmentedMatrix[i][j] /= pivot;
            }

            // Hacer ceros en la columna del pivote para las filas restantes
            for (int k = 0; k < n; k++) {
                if (k != i) {
                    double factor = augmentedMatrix[k][i];
                    for (int j = 0; j <= n; j++) {
                        augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j];
                    }
                }
            }
        }

        // Extraer las soluciones
        double[] solution = new double[n];
        for (int i = 0; i < n; i++) {
            solution[i] = augmentedMatrix[i][n];
        }

        // Mostrar las soluciones
        StringBuilder solucionesStr = new StringBuilder("Las soluciones son:\n");
        for (int i = 0; i < n; i++) {
            solucionesStr.append("x").append(i + 1).append(" = ").append(solution[i]).append("\n");
        }
        JOptionPane.showMessageDialog(this, solucionesStr.toString());
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            calculadora calculadora = new calculadora();
            calculadora.setVisible(true);
        });
    }
}