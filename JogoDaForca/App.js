import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';

// Lista de palavras relacionadas a futebol
const WORDS = [
  'ZAGUEIRO', 'GOLEIRO', 'ATAQUE', 'LATERAL', 'CHUTEIRA',
  'TRAVE', 'GOL', 'PENALTI', 'ESCANTEIO', 'JUIZ',
  'CAMISA', 'ARQUIBANCADA', 'GRAMADO', 'BANDERA', 'FALTA',
  'ESCUDO', 'CAPITAO', 'CONVOCACAO', 'COPINHA', 'MARACANA',
  'HEXACAMPEAO', 'TORCEDOR', 'VITORIA', 'EMPATE', 'DERROTA',
  'CARRINHO', 'PASSES', 'TITE', 'PELÉ', 'NEYMAR'
];

// Número máximo de tentativas (partes do boneco)
const MAX_ATTEMPTS = 6;

/**
 * Componente que renderiza o boneco da Forca baseado no número de erros.
 * Usa Views e estilos para simular o desenho sobre uma trave de futebol.
 */
const HangmanDrawing = ({ attempts }) => {
  // Array de componentes (Views) que representam as partes do corpo
  const BODY_PARTS = [
    // 1. Cabeça (attempts >= 1) - Com cor de pele clara
    <View key="head" style={[styles.hangmanHead, { backgroundColor: '#FFDEAD' }]} />,
    // 2. Corpo (attempts >= 2) - Com cor de camisa de time
    <View key="body" style={[styles.hangmanBody, { backgroundColor: '#FFD700' }]} />,
    // 3. Braço esquerdo (attempts >= 3)
    <View key="left-arm" style={[styles.hangmanArm, styles.hangmanLeftArm]} />,
    // 4. Braço direito (attempts >= 4)
    <View key="right-arm" style={[styles.hangmanArm, styles.hangmanRightArm]} />,
    // 5. Perna esquerda (attempts >= 5) - Com cor de chuteira
    <View key="left-leg" style={[styles.hangmanLeg, styles.hangmanLeftLeg]} />,
    // 6. Perna direita (attempts >= 6)
    <View key="right-leg" style={[styles.hangmanLeg, styles.hangmanRightLeg]} />,
  ];

  // Filtra as partes do corpo para desenhar apenas as correspondentes aos erros
  const partsToDraw = BODY_PARTS.slice(0, attempts);

  return (
    <View style={styles.drawingContainer}>
      {/* Desenha o Boneco */}
      {partsToDraw}
      
      {/* Estrutura da Forca (Estilo Trave/Gol) */}
      {/* Corda/Cabo da Forca (pendura o boneco) */}
      <View style={styles.gallowsRope} /> 
      {/* Viga horizontal (Travessão) */}
      <View style={styles.gallowsTop} /> 
      {/* Poste vertical (Trave Esquerda) */}
      <View style={styles.gallowsVertical} /> 
      {/* Chão (Linha de Fundo) */}
      <View style={styles.gallowsBase} /> 
      {/* Rede (apenas decorativa) */}
      <View style={styles.goalNet} />
    </View>
  );
};

/**
 * Componente do Teclado Virtual (Botões de Letras).
 */
const Keyboard = ({ guessedLetters, handleGuess, gameStatus }) => {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <View style={styles.keyboardContainer}>
      {ALPHABET.map(letter => {
        const isGuessed = guessedLetters.includes(letter);
        const isDisabled = isGuessed || gameStatus !== 'playing';
        
        // Verifica se a letra foi correta ou incorreta (para cores do teclado)
        const isCorrect = isGuessed && guessedLetters.includes(letter) && gameStatus !== 'playing' && letter.includes(letter); // Simplificado para usar a lógica do guessedLetters
        const isWrong = isGuessed && !isCorrect;

        return (
          <TouchableOpacity
            key={letter}
            style={[
              styles.keyButton,
              isGuessed && styles.keyButtonGuessed,
              isGuessed && !isCorrect && styles.keyButtonWrong,
              isDisabled && styles.keyButtonDisabled,
            ]}
            onPress={() => handleGuess(letter)}
            disabled={isDisabled}
          >
            <Text style={styles.keyText}>{letter}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

/**
 * Componente principal do Jogo da Forca (Tema Futebol).
 */
export default function App() {
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [attempts, setAttempts] = useState(0); // Erros
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'

  /**
   * Inicializa um novo jogo.
   */
  const startNewGame = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    const randomWord = WORDS[randomIndex];
    
    setWord(randomWord);
    setGuessedLetters([]);
    setAttempts(0);
    setGameStatus('playing');
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Efeito para verificar o status do jogo (Vitória ou Derrota)
  useEffect(() => {
    if (!word || gameStatus !== 'playing') return;

    // Condição de Vitória: todas as letras únicas da palavra foram adivinhadas
    const uniqueLetters = [...new Set(word.split(''))];
    const hasWon = uniqueLetters.every(letter => guessedLetters.includes(letter));
    
    if (hasWon) {
      setGameStatus('won');
    } 
    // Condição de Derrota: número máximo de tentativas excedido
    else if (attempts >= MAX_ATTEMPTS) {
      setGameStatus('lost');
      Alert.alert('❌ CARTÃO VERMELHO!', `O boneco foi enforcado! A palavra era: ${word}`);
    }
  }, [guessedLetters, attempts, word, gameStatus]);

  /**
   * Lida com o chute de uma letra.
   */
  const handleGuess = (letter) => {
    if (gameStatus !== 'playing' || guessedLetters.includes(letter)) {
      return;
    }

    setGuessedLetters(prev => [...prev, letter]);

    // Verifica se a letra está na palavra
    if (!word.includes(letter)) {
      setAttempts(prev => prev + 1); // Incrementa erro
    }
  };

  /**
   * Palavra a ser exibida.
   */
  const displayWord = useMemo(() => {
    return word
      .split('')
      .map(letter => (guessedLetters.includes(letter) ? letter : '_'))
      .join(' ');
  }, [word, guessedLetters]);


  // Separa as letras em corretas (Acertos) e erradas (Faltas)
  const correctLetters = guessedLetters.filter(letter => word.includes(letter));
  const wrongLetters = guessedLetters.filter(letter => !word.includes(letter));


  // --- Renderização da Interface ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Título */}
        <Text style={styles.title}>
          Jogo da forca
        </Text>

        {/* Desenho do Boneco e da Trave */}
        <HangmanDrawing attempts={attempts} />

        {/* Palavra a ser adivinhada */}
        <Text style={styles.wordDisplay}>
          {displayWord}
        </Text>
        
        {/* Mensagem de Fim de Jogo */}
        {gameStatus !== 'playing' && (
          <View style={[styles.statusBox, gameStatus === 'won' ? styles.statusBoxWin : styles.statusBoxLose]}>
            <Text style={styles.statusText}>
              {gameStatus === 'won' ? '🏆 GOLAÇO! VOCÊ ACERTOU! 🏆' : '💀 FIM DE JOGO! O boneco foi enforcado! 💀'}
            </Text>
            <Text style={styles.wordRevealText}>A palavra era: <Text style={styles.wordRevealHighlight}>{word}</Text></Text>
          </View>
        )}
        
        {/* Tentativas restantes */}
        <Text style={styles.attemptsText}>
          Faltas Acumuladas: <Text style={styles.attemptsValue}>{attempts} / {MAX_ATTEMPTS}</Text>
        </Text>

        {/* Botão Reiniciar */}
        <TouchableOpacity 
          style={styles.restartButton}
          onPress={startNewGame}
        >
          <Text style={styles.restartButtonIcon}>🔄</Text> 
          <Text style={styles.restartButtonText}>Novo Confronto</Text>
        </TouchableOpacity>

        {/* Teclado Virtual (Teclado) */}
        <Keyboard 
          guessedLetters={guessedLetters} 
          handleGuess={handleGuess} 
          gameStatus={gameStatus}
        />
        
        {/* Lista de Tentativas Anteriores (Diferenciadas) */}
        <View style={styles.guessedLettersContainer}>
            <Text style={styles.guessedLettersTitle}>Acertos (Passes Certos):</Text>
            <View style={styles.letterList}>
                {correctLetters.map((letter, i) => (
                    <Text key={`c-${i}`} style={[styles.guessedLetter, styles.correctLetter]}>
                        {letter}
                    </Text>
                ))}
            </View>

            <Text style={styles.guessedLettersTitle}>Faltas (Erros no Passe):</Text>
            <View style={styles.letterList}>
                {wrongLetters.map((letter, i) => (
                    <Text key={`w-${i}`} style={[styles.guessedLetter, styles.wrongLetter]}>
                        {letter}
                    </Text>
                ))}
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos do React Native
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#006400', // Campo de futebol verde escuro
  },
  container: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 50,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFD700', // Dourado
    marginBottom: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#FFD700',
    paddingBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  wordDisplay: {
    fontSize: 40,
    letterSpacing: 10,
    fontWeight: 'bold',
    color: '#F0F4F8', // Branco no verde
    marginVertical: 20,
    minHeight: 50,
  },
  attemptsText: {
    fontSize: 18,
    color: '#E0E0E0',
    marginTop: 10,
  },
  attemptsValue: {
    fontWeight: 'bold',
    color: '#FF4500', // Vermelho/Laranja (Cartão)
  },
  // --- Estilos da Cena de Penalidade (Drawing) ---
  drawingContainer: {
    height: 200,
    width: 250,
    marginVertical: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#38761D', // Verde um pouco mais claro para a área do gol
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF', // Linha branca do campo
  },
  // Estrutura do Gol (Forca)
  gallowsBase: {
    width: '100%',
    height: 5,
    backgroundColor: '#FFFFFF', // Linha de Fundo
    position: 'absolute',
    bottom: 0,
  },
  gallowsVertical: {
    width: 5,
    height: 150,
    backgroundColor: '#FFFFFF', // Trave Vertical
    position: 'absolute',
    left: 40,
    bottom: 0,
  },
  gallowsTop: {
    width: 100,
    height: 5,
    backgroundColor: '#FFFFFF', // Travessão
    position: 'absolute',
    top: 45,
    left: 40,
  },
  gallowsRope: {
    width: 3,
    height: 25,
    backgroundColor: '#B22222', // Cor de Árbitro/Suspensão
    position: 'absolute',
    top: 50,
    left: 140,
  },
  goalNet: {
    width: '100%',
    height: '100%',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    opacity: 0.1,
    position: 'absolute',
    top: 0,
    left: 0,
  },

  // Partes do Boneco
  hangmanHead: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#333',
    position: 'absolute',
    top: 75,
    left: 125,
  },
  hangmanBody: {
    width: 3,
    height: 40,
    backgroundColor: '#FFD700', // Camisa Amarela
    position: 'absolute',
    top: 105,
    left: 140,
  },
  hangmanArm: {
    width: 3,
    height: 30,
    backgroundColor: '#FFD700',
    position: 'absolute',
    top: 110,
    left: 140,
  },
  hangmanLeftArm: {
    transform: [{ rotate: '45deg' }, { translateX: -15 }],
  },
  hangmanRightArm: {
    transform: [{ rotate: '-45deg' }, { translateX: 15 }],
  },
  hangmanLeg: {
    width: 3,
    height: 35,
    backgroundColor: '#333', // Chuteira/Calção
    position: 'absolute',
    top: 140,
    left: 140,
  },
  hangmanLeftLeg: {
    transform: [{ rotate: '30deg' }, { translateX: -10 }],
  },
  hangmanRightLeg: {
    transform: [{ rotate: '-30deg' }, { translateX: 10 }],
  },
  
  // --- Fim de Jogo ---
  statusBox: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 15,
    width: '90%',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  statusBoxWin: {
    backgroundColor: '#E6FFE6', // Verde pálido para Golaço
    borderColor: '#008000',
  },
  statusBoxLose: {
    backgroundColor: '#FFCCCC', // Vermelho pálido para Cartão
    borderColor: '#B22222',
  },
  statusText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  wordRevealText: {
    fontSize: 18,
    marginTop: 5,
    color: '#4B5563',
  },
  wordRevealHighlight: {
    fontWeight: 'bold',
    color: '#006400', // Verde escuro
  },
  // --- Botão Reiniciar ---
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B22222', // Marrom/Vermelho (Cor de árbitro)
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 50,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  restartButtonIcon: {
    color: '#FFF',
    fontSize: 20,
    marginRight: 10,
  },
  restartButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // --- Teclado ---
  keyboardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 30,
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 10,
  },
  keyButton: {
    width: 40,
    height: 40,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#FFD700', // Amarelo (Foco)
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  keyButtonGuessed: {
    backgroundColor: '#808080', // Cinza (Tentada)
  },
  keyButtonDisabled: {
    opacity: 0.5,
  },
  keyText: {
    color: '#1E293B', // Cor de texto escuro
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- Tentativas Anteriores ---
  guessedLettersContainer: {
    marginTop: 30,
    paddingHorizontal: 10,
    width: '100%',
    maxWidth: 400,
  },
  guessedLettersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 5,
    marginTop: 10,
  },
  letterList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 30,
    borderWidth: 1,
    borderColor: '#38761D',
    borderRadius: 8,
    padding: 5,
    backgroundColor: '#38761D', // Fundo verde da área
  },
  guessedLetter: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 3,
    borderRadius: 4,
  },
  correctLetter: {
    backgroundColor: '#00A000', // Verde escuro para acertos
    color: '#FFFFFF',
  },
  wrongLetter: {
    backgroundColor: '#B22222', // Vermelho para faltas
    color: '#FFFFFF',
    textDecorationLine: 'line-through', // Adiciona o risco
  },
});
