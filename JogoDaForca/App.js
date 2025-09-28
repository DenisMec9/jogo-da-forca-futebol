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

// Número máximo de tentativas (Faltas permitidas antes do Cartão Vermelho)
const MAX_ATTEMPTS = 6;

/**
 * Componente que renderiza a cena da penalidade (Gol e Cartões) baseada no número de erros.
 * O desenho é progressivo, de 1 a 6 faltas.
 */
const PenaltyDrawing = ({ attempts }) => {
  // Elementos da cena (Gol e Cartões)
  const SCENE_ELEMENTS = [
    // 1. Poste Esquerdo (attempts >= 1)
    <View key="post-left" style={[styles.goalPost, styles.goalPostLeft]} />,
    // 2. Poste Direito (attempts >= 2)
    <View key="post-right" style={[styles.goalPost, styles.goalPostRight]} />,
    // 3. Travessão (attempts >= 3)
    <View key="crossbar" style={styles.goalCrossbar} />,
    // 4. Rede (attempts >= 4) - Simulado com uma View simples
    <View key="net" style={styles.goalNet} />,
    // 5. Cartão Amarelo (attempts >= 5) - Grande aviso
    <View key="yellow-card" style={styles.yellowCard} />,
    // 6. Cartão Vermelho (attempts >= 6) - FIM DE JOGO
    <View key="red-card" style={styles.redCard} />,
  ];

  // Filtra os elementos para desenhar
  const elementsToDraw = SCENE_ELEMENTS.slice(0, attempts);

  return (
    <View style={styles.drawingContainer}>
      {/* O campo de fundo/base (Penalty Area) */}
      <View style={styles.penaltyArea} />
      
      {/* Desenha a Cena */}
      {elementsToDraw}
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

        return (
          <TouchableOpacity
            key={letter}
            style={[
              styles.keyButton,
              isGuessed && styles.keyButtonGuessed,
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
  const [attempts, setAttempts] = useState(0); // Faltas (erros)
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

  // Efeito para verificar o status do jogo (GOLAÇO ou Cartão Vermelho)
  useEffect(() => {
    if (!word || gameStatus !== 'playing') return;

    // Condição de GOLAÇO: todas as letras únicas da palavra foram adivinhadas
    const uniqueLetters = [...new Set(word.split(''))];
    const hasWon = uniqueLetters.every(letter => guessedLetters.includes(letter));
    
    if (hasWon) {
      setGameStatus('won');
    } 
    // Condição de Cartão Vermelho: número máximo de faltas excedido
    else if (attempts >= MAX_ATTEMPTS) {
      setGameStatus('lost');
      Alert.alert('❌ CARTÃO VERMELHO!', `Faltas demais! A palavra era: ${word}`);
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
      setAttempts(prev => prev + 1); // Incrementa falta
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
          Forca na Rede
        </Text>

        {/* Desenho da Cena de Penalidade */}
        <PenaltyDrawing attempts={attempts} />

        {/* Palavra a ser adivinhada */}
        <Text style={styles.wordDisplay}>
          {displayWord}
        </Text>
        
        {/* Mensagem de Fim de Jogo */}
        {gameStatus !== 'playing' && (
          <View style={[styles.statusBox, gameStatus === 'won' ? styles.statusBoxWin : styles.statusBoxLose]}>
            <Text style={styles.statusText}>
              {gameStatus === 'won' ? '⚽ GOLAÇO! VOCÊ ACERTOU! ⚽' : '🛑 FIM DE JOGO! CARTÃO VERMELHO! 🛑'}
            </Text>
            <Text style={styles.wordRevealText}>A palavra era: <Text style={styles.wordRevealHighlight}>{word}</Text></Text>
          </View>
        )}
        
        {/* Faltas restantes */}
        <Text style={styles.attemptsText}>
          Faltas Acumuladas: <Text style={styles.attemptsValue}>{attempts} / {MAX_ATTEMPTS}</Text>
        </Text>

        {/* Botão Reiniciar */}
        <TouchableOpacity 
          style={styles.restartButton}
          onPress={startNewGame}
        >
          <Text style={styles.restartButtonIcon}>🥅</Text> 
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
    backgroundColor: '#38761D', // Verde um pouco mais claro para a área
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF', // Linha branca do campo
  },
  penaltyArea: {
    position: 'absolute',
    height: '80%',
    width: '90%',
    borderColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 8,
    opacity: 0.2,
  },
  // Gol
  goalPost: {
    width: 5,
    height: 120,
    backgroundColor: '#FFFFFF', // Postes brancos
    position: 'absolute',
    bottom: 0,
  },
  goalPostLeft: { left: 45 },
  goalPostRight: { right: 45 },
  goalCrossbar: {
    width: 155,
    height: 5,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 75,
  },
  goalNet: {
    width: 155,
    height: 125,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    opacity: 0.5,
    position: 'absolute',
    bottom: 0,
  },
  // Cartões (Visíveis apenas nas últimas faltas)
  yellowCard: {
    width: 50,
    height: 70,
    backgroundColor: '#FFD700', // Amarelo
    borderWidth: 2,
    borderColor: '#333',
    position: 'absolute',
    top: 5,
    right: 5,
    transform: [{ rotate: '-15deg' }],
  },
  redCard: {
    width: 50,
    height: 70,
    backgroundColor: '#DC2626', // Vermelho
    borderWidth: 2,
    borderColor: '#333',
    position: 'absolute',
    top: 5,
    left: 5,
    transform: [{ rotate: '15deg' }],
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