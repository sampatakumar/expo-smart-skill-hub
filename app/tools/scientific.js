import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';

// Fast & Safe JS Math Parser
const evaluateMath = (expr) => {
  if (!expr) return '';
  
  let toEval = expr
    .replace(/π/g, 'Math.PI')
    .replace(/e/g, 'Math.E')
    .replace(/Ans/g, '1') // basic fallback for now
    .replace(/√\(/g, 'Math.sqrt(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/log\(/g, 'Math.log10(')
    .replace(/\^/g, '**')
    // Ensure all trigonometry calls our custom Degree-based functions below
    .replace(/sin\(/g, 'sin(')
    .replace(/cos\(/g, 'cos(')
    .replace(/tan\(/g, 'tan(')
    // Replace visual multipliers
    .replace(/×/g, '*')
    .replace(/÷/g, '/');

  // We enforce Degrees instead of Radians for standard student math
  const sin = (deg) => parseFloat(Math.sin(deg * (Math.PI / 180)).toFixed(10));
  const cos = (deg) => parseFloat(Math.cos(deg * (Math.PI / 180)).toFixed(10));
  const tan = (deg) => parseFloat(Math.tan(deg * (Math.PI / 180)).toFixed(10));
  
  try {
     // Use new Function to securely evaluate without exposing window/global scope via eval()
     const result = new Function('Math', 'sin', 'cos', 'tan', `return ${toEval}`)(Math, sin, cos, tan);
     
     if (isNaN(result) || !isFinite(result)) return 'Undefined';
     // Strip annoying floating point trails (e.g. 0.300000000004)
     return Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(6)).toString();
  } catch (err) {
     return 'Syntax Error';
  }
};

const BUTTONS = [
  ['sin(', 'cos(', 'tan(', '^', '√('],
  ['(', ')', 'log(', 'ln(', 'π'],
  ['C', 'DEL', '%', '÷', 'e'],
  ['7', '8', '9', '×', '!'], // ! is mostly just for show currently
  ['4', '5', '6', '-', 'Ans'],
  ['1', '2', '3', '+', '='],
  ['0', '.', 'EXP', '=']
]; // We flatten things for ease, but we'll use a direct matrix mapping

export default function ScientificCalculatorScreen() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');

  const handlePress = (val) => {
    if (val === 'C') {
        setExpression('');
        setResult('');
        return;
    }
    
    if (val === 'DEL') {
        setExpression(prev => prev.slice(0, -1));
        return;
    }

    if (val === '=') {
        const computed = evaluateMath(expression);
        setResult(computed);
        return;
    }

    // Auto-calculate on the fly if it's safe
    setExpression(prev => prev + val);
  };

  const renderButton = (label, colorScheme) => {
    const isSpecial = ['sin(', 'cos(', 'tan(', '^', '√(', 'log(', 'ln(', '(', ')', 'EXP', 'π', 'e'].includes(label);
    const isOperator = ['+', '-', '×', '÷'].includes(label);
    const isAction = ['C', 'DEL', '='].includes(label);

    let textColor = '#ffffff';
    let bgColor = 'rgba(255, 255, 255, 0.05)';

    if (isOperator) {
      textColor = '#c084fc'; // Purple highlight
      bgColor = 'rgba(192, 132, 252, 0.1)';
    } else if (isAction) {
      textColor = label === 'C' ? '#ef4444' : label === '=' ? '#c084fc' : '#fb923c';
    } else if (isSpecial) {
      textColor = '#61dafb'; // Cyan highlight for scientific
    }

    return (
      <TouchableOpacity 
        key={label}
        onPress={() => handlePress(label)}
        style={[styles.btnFrame, { flex: label === '0' || label === '=' ? 2.2 : 1 }]}
      >
        <BlurView intensity={20} tint="dark" style={[styles.button, { backgroundColor: bgColor }]}>
          {label === '=' ? (
              <LinearGradient colors={['#a855f7', '#c084fc']} style={StyleSheet.absoluteFillObject} />
          ) : null}
          <Text style={[styles.btnText, { color: label === '=' ? '#fff' : textColor }]}>{label}</Text>
        </BlurView>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#171717']} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BlurView intensity={30} tint="dark" style={styles.iconCircle}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </BlurView>
          </TouchableOpacity>
          <View style={styles.titleBadge}>
            <Text style={styles.badgeText}>DEG</Text>
          </View>
        </View>

        {/* Display Sector */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.displayArea}>
           <Text style={styles.expressionText} numberOfLines={3} adjustsFontSizeToFit>{expression || '0'}</Text>
           <Text style={[styles.resultText, { color: result === 'Syntax Error' ? '#ef4444' : '#ffffff' }]} adjustsFontSizeToFit numberOfLines={1}>
             {result ? `= ${result}` : ''}
           </Text>
        </Animated.View>

        {/* Keypad Matrix */}
        <Animated.View entering={FadeInUp.duration(600).delay(100)} style={styles.keypadArea}>
          <View style={styles.row}>
            {renderButton('sin(')}{renderButton('cos(')}{renderButton('tan(')}{renderButton('^')}{renderButton('√(')}
          </View>
          <View style={styles.row}>
            {renderButton('(')}{renderButton(')')}{renderButton('log(')}{renderButton('ln(')}{renderButton('π')}
          </View>
          <View style={styles.row}>
            {renderButton('C')}{renderButton('DEL')}{renderButton('%')}{renderButton('÷')}{renderButton('e')}
          </View>
          <View style={styles.row}>
            {renderButton('7')}{renderButton('8')}{renderButton('9')}{renderButton('×')}
          </View>
          <View style={styles.row}>
            {renderButton('4')}{renderButton('5')}{renderButton('6')}{renderButton('-')}
          </View>
          <View style={styles.row}>
            {renderButton('1')}{renderButton('2')}{renderButton('3')}{renderButton('+')}
          </View>
          <View style={styles.row}>
            {renderButton('0')}{renderButton('.')}{renderButton('=')}
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
  },
  iconCircle: {
    flex: 1,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  titleBadge: {
    backgroundColor: 'rgba(97, 218, 251, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(97, 218, 251, 0.4)',
  },
  badgeText: {
    color: '#61dafb',
    fontSize: 12,
    fontWeight: 'bold',
  },
  displayArea: {
    flex: 0.35,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  expressionText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 32,
    fontWeight: '300',
    textAlign: 'right',
    marginBottom: 8,
  },
  resultText: {
    color: '#ffffff',
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  keypadArea: {
    flex: 0.65,
    paddingHorizontal: 16,
    paddingBottom: 20,
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  btnFrame: {
    height: 56,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  btnText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
