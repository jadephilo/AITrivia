const questionElement = document.getElementById('question');
const choicesElement = document.getElementById('choices');
const nextButton = document.getElementById('next-button');
const scoreElement = document.getElementById('score');

let score = 0;

// Function to generate a trivia question using OpenAI
async function generateTriviaQuestion(topic, difficulty) {
  const endpoint = 'https://geoji-m8ajv2qy-eastus2.openai.azure.com/'; // Replace with your Azure OpenAI endpoint
  const apiKey = ''; // Replace with your Azure OpenAI API key

  try {
    const response = await fetch(`${endpoint}/openai/deployments/gpt-4o/chat/completions?api-version=2024-05-01-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Replace with your deployed model name
        messages: [
          { role: 'system', content: 'You are an AI assistant that helps people create trivia questions.' },
          { role: 'user', content: `Generate a ${difficulty} trivia question about ${topic} with 4 multiple-choice answers. Mark the correct answer with an asterisk (*).` }
        ],
        max_tokens: 100,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    // Check if the response is OK
    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('Azure OpenAI Response:', data);

    // Check if the response contains choices
    if (!data.choices || !data.choices[0]) {
      console.error('Unexpected response format:', data);
      return null;
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching trivia question:', error);
    return null;
  }
}

// Function to parse the OpenAI response into a question and choices
function parseQuestion(response) {
  const lines = response.split('\n');
  const question = lines[0];
  const choices = lines.slice(1).map(line => line.trim());

  // Remove the asterisk from the correct answer
  const correctAnswer = choices.find(choice => choice.includes('*')).replace('*', '').trim();

  // Remove the asterisk from the choices before displaying
  const cleanChoices = choices.map(choice => choice.replace('*', '').trim());

  return { question, cleanChoices, correctAnswer };
}

// Function to load and display a new question
async function loadQuestion() {
  const topic = 'history';  // You can change the topic here
  const difficulty = getDifficulty(score);
  const response = await generateTriviaQuestion(topic, difficulty);

  if (!response) {
    alert('Failed to fetch question. Please check the console for details.');
    return;
  }

  const { question, cleanChoices, correctAnswer } = parseQuestion(response);
  console.log('Parsed Question:', { question, cleanChoices, correctAnswer });

  questionElement.innerText = question;
  choicesElement.innerHTML = '';

  cleanChoices.forEach(choice => {
    const button = document.createElement('button');
    button.innerText = choice;
    button.addEventListener('click', () => checkAnswer(choice, correctAnswer));
    choicesElement.appendChild(button);
  });
}

// Function to check the user's answer
function checkAnswer(selectedAnswer, correctAnswer) {
  if (selectedAnswer === correctAnswer) {
    score++;
    scoreElement.innerText = `Score: ${score}`;
    alert('Correct! 🎉');
  } else {
    alert(`Incorrect. The correct answer is: ${correctAnswer} 😢`);
  }

  // Load the next question after answering
  setTimeout(loadQuestion, 1000); // Delay of 1 second before loading the next question
}

// Function to determine difficulty based on score
function getDifficulty(score) {
  if (score < 3) return 'easy';
  if (score < 6) return 'medium';
  return 'hard';
}

// Load the first question when the page loads
loadQuestion();

// Load a new question when the "Next Question" button is clicked
nextButton.addEventListener('click', loadQuestion);
