// App.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Svg, Line, Circle, Path } from 'react-native-svg';

const WORDS = [
  'REACT', 'JAVASCRIPT', 'EXPRESS', 'NODE', 'POSTGRESQL',
  'SEQUELIZE', 'VERCEL', 'GITHUB', 'MOBILE', 'ANDROID',
  'IOS', 'TYPESCRIPT', 'EXPO', 'FORCA', 'DESENVOLVEDOR',
  'PROGRAMACAO', 'ALGORITMO', 'FUNCAO', 'COMPONENTE', 'ESTADO',
  'PROPS', 'HOOKS', 'USESTATE', 'USEEFFECT', 'API',
  'BANCO', 'DADOS', 'CRUD', 'HTTP', 'JSON'
];

const MAX_ATTEMPTS = 6;

export default function App() {
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing');
  const [inputValue, setInputValue] = useState('');

  const startNewGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(randomWord);
    setGuessedLetters([]);
    setAttempts(0);
    setGameStatus('playing');
    setInputValue('');
  };

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    const revealed = word.split('').every(letter => guessedLetters.includes(letter));
    if (revealed && word) {
      setGameStatus('won');
    } else if (attempts >= MAX_ATTEMPTS) {
      setGameStatus('lost');
    }
  }, [guessedLetters, attempts, word]);

  const handleGuess = () => {
    const letter = inputValue.trim().toUpperCase();
    if (!letter || letter.length !== 1 || !/[A-Z]/.test(letter)) {
      Alert.alert('Inválido', 'Digite uma única letra.');
      setInputValue('');
      return;
    }

    if (guessedLetters.includes(letter)) {
      Alert.alert('Atenção', 'Você já tentou essa letra!');
      setInputValue('');
      return;
    }

    setGuessedLetters(prev => [...prev, letter]);

    if (!word.includes(letter)) {
      setAttempts(prev => prev + 1);
    }

    setInputValue('');
  };

  const displayWord = word
    .split('')
    .map(letter => (guessedLetters.includes(letter) ? letter : '_'))
    .join(' ');

  const correctLetters = guessedLetters.filter(letter => word.includes(letter));
  const wrongLetters = guessedLetters.filter(letter => !word.includes(letter));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Jogo da Forca</Text>

      {/* Boneco da forca */}
      <View style={styles.hangmanContainer}>
        <Svg width="200" height="250" viewBox="0 0 200 250">
          {/* Forca */}
          <Line x1="50" y1="230" x2="150" y2="230" stroke="#333" strokeWidth="4" />
          <Line x1="100" y1="230" x2="100" y2="30" stroke="#333" strokeWidth="4" />
          <Line x1="100" y1="30" x2="160" y2="30" stroke="#333" strokeWidth="4" />
          <Line x1="160" y1="30" x2="160" y2="60" stroke="#333" strokeWidth="4" />

          {/* Cabeça */}
          {attempts >= 1 && <Circle cx="160" cy="75" r="15" stroke="#333" strokeWidth="3" fill="none" />}
          {/* Corpo */}
          {attempts >= 2 && <Line x1="160" y1="90" x2="160" y2="150" stroke="#333" strokeWidth="3" />}
          {/* Braço esquerdo */}
          {attempts >= 3 && <Line x1="160" y1="110" x2="130" y2="100" stroke="#333" strokeWidth="3" />}
          {/* Braço direito */}
          {attempts >= 4 && <Line x1="160" y1="110" x2="190" y2="100" stroke="#333" strokeWidth="3" />}
          {/* Perna esquerda */}
          {attempts >= 5 && <Line x1="160" y1="150" x2="140" y2="190" stroke="#333" strokeWidth="3" />}
          {/* Perna direita */}
          {attempts >= 6 && <Line x1="160" y1="150" x2="180" y2="190" stroke="#333" strokeWidth="3" />}
        </Svg>
      </View>

      {/* Palavra */}
      <Text style={styles.word}>{displayWord}</Text>

      {/* Input de letra */}
      {gameStatus === 'playing' && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite uma letra"
            value={inputValue}
            onChangeText={setInputValue}
            maxLength={1}
            autoCapitalize="characters"
            keyboardType="default"
          />
          <TouchableOpacity style={styles.button} onPress={handleGuess}>
            <Text style={styles.buttonText}>Chutar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Letras tentadas */}
      <View style={styles.lettersContainer}>
        <Text style={styles.sectionTitle}>Letras usadas:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lettersScroll}>
          {correctLetters.map((letter, i) => (
            <Text key={`c-${i}`} style={[styles.letter, styles.correctLetter]}>{letter}</Text>
          ))}
          {wrongLetters.map((letter, i) => (
            <Text key={`w-${i}`} style={[styles.letter, styles.wrongLetter]}>{letter}</Text>
          ))}
        </ScrollView>
      </View>

      {/* Mensagem de fim de jogo */}
      {gameStatus !== 'playing' && (
        <View style={styles.messageContainer}>
          <Text style={gameStatus === 'won' ? styles.winText : styles.loseText}>
            {gameStatus === 'won' ? '🎉 Parabéns! Você venceu!' : '💀 Você perdeu!'}
          </Text>
          <Text style={styles.finalWord}>A palavra era: {word}</Text>
        </View>
      )}

      {/* Botão Reiniciar */}
      <TouchableOpacity style={styles.restartButton} onPress={startNewGame}>
        <Text style={styles.restartButtonText}>🔄 Novo Jogo</Text>
      </TouchableOpacity>

      {/* Tentativas restantes */}
      <Text style={styles.attemptsText}>
        Tentativas restantes: {MAX_ATTEMPTS - attempts}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 10,
  },
  hangmanContainer: {
    marginVertical: 20,
  },
  word: {
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 8,
    color: '#2c3e50',
    marginVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  input: {
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    fontSize: 20,
    width: 80,
    textAlign: 'center',
    marginRight: 10,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lettersContainer: {
    marginVertical: 15,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  lettersScroll: {
    flexDirection: 'row',
  },
  letter: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    marginHorizontal: 2,
    borderRadius: 6,
  },
  correctLetter: {
    backgroundColor: '#2ecc71',
    color: 'white',
  },
  wrongLetter: {
    backgroundColor: '#e74c3c',
    color: 'white',
  },
  messageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  winText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 10,
  },
  loseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  finalWord: {
    fontSize: 20,
    color: '#2c3e50',
  },
  restartButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
  },
  restartButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  attemptsText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
  },
});