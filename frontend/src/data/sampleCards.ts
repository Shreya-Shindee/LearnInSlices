import type { MicroCard } from '../types';

// Sample cards for demonstration
export const sampleCards: MicroCard[] = [
  {
    id: 'card-1',
    learning_path_id: 'path-1',
    title: 'Introduction to React Components',
    type: 'concept',
    difficulty: 'beginner',
    estimatedTime: '3 min',
    prerequisites: [],
    metadata: {},
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    content: {
      text: 'React components are the building blocks of React applications. They let you split the UI into independent, reusable pieces, and think about each piece in isolation.',
      question: 'What are React components?',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      videoPoster: 'https://via.placeholder.com/1280x720/3B82F6/FFFFFF?text=React+Components+Video',
      hiddenContent: 'React components are JavaScript functions or classes that return JSX (React elements) to describe what should appear on the screen. They can accept inputs (called "props") and return a description of what should appear on the screen.',
      keyPoints: [
        'Components are reusable pieces of UI',
        'They can be functions or classes',
        'Components return JSX to describe the UI',
        'Props allow components to receive data from parents'
      ],
      examples: [
        'Function components',
        'Class components',
        'JSX syntax'
      ]
    }
  },
  {
    id: 'card-2',
    learning_path_id: 'path-1',
    title: 'Creating Your First Component',
    type: 'example',
    difficulty: 'beginner',
    estimatedTime: '4 min',
    prerequisites: ['card-1'],
    metadata: {},
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    content: {
      text: 'Let\'s create a simple React component. Here\'s a basic function component that displays a greeting message.',
      question: 'How do you create a React component?',
      hiddenContent: `
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// Or using arrow function syntax:
const Welcome = (props) => {
  return <h1>Hello, {props.name}!</h1>;
};`,
      keyPoints: [
        'Components start with a capital letter',
        'They must return JSX',
        'Props are passed as the first parameter',
        'Always use JSX syntax for the return value'
      ],
      examples: [
        'function Welcome(props) { return <h1>Hello!</h1>; }',
        'const Button = () => <button>Click me</button>;',
        '<Welcome name="Sarah" />'
      ]
    }
  },
  {
    id: 'card-3',
    learning_path_id: 'path-1',
    title: 'Understanding Props',
    type: 'concept',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    prerequisites: ['card-2'],
    metadata: {},
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    content: {
      text: 'Props (short for properties) are how you pass data from parent components to child components in React.',
      question: 'What are props in React?',
      hiddenContent: 'Props are read-only inputs that are passed to React components. They allow you to make components dynamic and reusable by passing different values each time you use the component.',
      keyPoints: [
        'Props are read-only',
        'They flow from parent to child',
        'Props make components reusable',
        'You can pass any JavaScript value as a prop'
      ],
      examples: [
        '<Button text="Submit" />',
        '<UserCard name="John" age={25} />',
        '<Avatar src={imageUrl} alt="Profile" />'
      ],
      quiz: {
        question: 'Which of the following statements about React props is correct?',
        options: [
          'Props can be modified by child components',
          'Props flow from child to parent components',
          'Props are read-only and flow from parent to child',
          'Props are only used for styling components'
        ],
        correctAnswer: 2,
        explanation: 'Props are read-only inputs that flow from parent components to child components. Child components cannot modify props they receive.',
        points: 10
      }
    }
  },
  {
    id: 'card-4',
    learning_path_id: 'path-1',
    title: 'React State Basics',
    type: 'concept',
    difficulty: 'intermediate',
    estimatedTime: '6 min',
    prerequisites: ['card-3'],
    metadata: {},
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    content: {
      text: 'State allows React components to remember and manage data that can change over time. Unlike props, state is internal to the component.',
      question: 'What is state in React?',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      videoPoster: 'https://via.placeholder.com/1280x720/8B5CF6/FFFFFF?text=React+State+Tutorial',
      hiddenContent: 'State is a JavaScript object that stores dynamic data for a component. When state changes, React automatically re-renders the component to reflect the new state.',
      keyPoints: [
        'State is internal to a component',
        'State can be updated over time',
        'Changing state triggers re-renders',
        'Use useState hook in function components'
      ],
      examples: [
        'const [count, setCount] = useState(0);',
        'const [name, setName] = useState("");',
        'const [isVisible, setIsVisible] = useState(true);'
      ],
      quiz: {
        question: 'What happens when you update state in a React component?',
        options: [
          'Nothing happens automatically',
          'The component re-renders to reflect the new state',
          'All components in the app re-render',
          'The browser page refreshes'
        ],
        correctAnswer: 1,
        explanation: 'When state is updated in React, the component automatically re-renders to reflect the new state. This is how React keeps the UI in sync with the data.',
        points: 15
      }
    }
  },
  {
    id: 'card-5',
    learning_path_id: 'path-1',
    title: 'Practice: Counter Component',
    type: 'practice',
    difficulty: 'intermediate',
    estimatedTime: '8 min',
    prerequisites: ['card-4'],
    metadata: {},
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    content: {
      text: 'Let\'s practice by building a simple counter component that uses state to track and display a number.',
      question: 'Can you create a counter component?',
      hiddenContent: `
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
}`,
      keyPoints: [
        'Import useState from React',
        'Initialize state with useState(initialValue)',
        'Use the setter function to update state',
        'State updates trigger component re-renders'
      ],
      examples: [
        'useState(0) for numbers',
        'onClick={() => setValue(newValue)}',
        'State updates are asynchronous'
      ]
    }
  }
];
