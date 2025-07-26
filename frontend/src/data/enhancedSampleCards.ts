import type { MicroCard, VideoContent } from '../types';

// Enhanced sample cards with video content and improved structure
export const enhancedSampleCards: MicroCard[] = [
  {
    id: 'card-1',
    learning_path_id: 'path-1',
    title: 'Introduction to React Components',
    type: 'concept',
    difficulty: 'beginner',
    estimatedTime: '3 min',
    prerequisites: [],
    metadata: {
      hasVideo: true,
      videoCount: 2,
      interactionLevel: 'high'
    },
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    content: {
      text: 'React components are the building blocks of React applications. They let you split the UI into independent, reusable pieces, and think about each piece in isolation.',
      question: 'What are React components and why are they important?',
      hiddenContent: 'React components are JavaScript functions or classes that return JSX (React elements) to describe what should appear on the screen. They can accept inputs (called "props") and return a description of what should appear on the screen.',
      keyPoints: [
        'Components are reusable pieces of UI',
        'They can be functions or classes',
        'Components return JSX to describe the UI',
        'Props allow components to receive data from parents'
      ],
      examples: [
        'Function components: const Welcome = () => <h1>Hello!</h1>',
        'Class components: class Welcome extends React.Component',
        'JSX syntax: <Welcome name="John" />'
      ],
      videos: [
        {
          id: 'v1-intro',
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          title: 'React Components Explained',
          description: 'A visual introduction to React components with live examples',
          thumbnail: 'https://via.placeholder.com/1280x720/3B82F6/FFFFFF?text=React+Components+Intro',
          duration: 180,
          skillLevel: 'beginner',
          tags: ['react', 'components', 'introduction'],
          transcript: 'In this video, we explore what React components are and how they form the foundation of React applications...'
        },
        {
          id: 'v1-examples',
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
          title: 'Building Your First Component',
          description: 'Step-by-step guide to creating your first React component',
          thumbnail: 'https://via.placeholder.com/1280x720/10B981/FFFFFF?text=First+Component',
          duration: 240,
          skillLevel: 'beginner',
          tags: ['react', 'tutorial', 'hands-on']
        }
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
    metadata: {
      hasVideo: true,
      videoCount: 1,
      interactionLevel: 'medium'
    },
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
      ],
      codeSnippet: `// Your first React component
function Greeting({ name = "World" }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Welcome to React!</p>
    </div>
  );
}

// Using the component
<Greeting name="Developer" />`,
      videos: [
        {
          id: 'v2-coding',
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          title: 'Live Coding: First Component',
          description: 'Watch as we code a React component from scratch',
          thumbnail: 'https://via.placeholder.com/1280x720/8B5CF6/FFFFFF?text=Live+Coding',
          duration: 300,
          skillLevel: 'beginner',
          tags: ['coding', 'tutorial', 'live-demo']
        }
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
    metadata: {
      hasVideo: true,
      videoCount: 2,
      hasQuiz: true
    },
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
      videos: [
        {
          id: 'v3-props',
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
          title: 'React Props Deep Dive',
          description: 'Understanding how props work in React applications',
          thumbnail: 'https://via.placeholder.com/1280x720/EF4444/FFFFFF?text=Props+Deep+Dive',
          duration: 280,
          skillLevel: 'beginner',
          tags: ['props', 'data-flow', 'react']
        },
        {
          id: 'v3-examples',
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          title: 'Props Examples and Best Practices',
          description: 'Common patterns and best practices when using props',
          thumbnail: 'https://via.placeholder.com/1280x720/F59E0B/FFFFFF?text=Props+Examples',
          duration: 200,
          skillLevel: 'intermediate',
          tags: ['best-practices', 'patterns', 'props']
        }
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
    metadata: {
      hasVideo: true,
      videoCount: 3,
      interactionLevel: 'high'
    },
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    content: {
      text: 'State allows React components to remember and manage data that can change over time. Unlike props, state is internal to the component.',
      question: 'What is state in React?',
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
      codeSnippet: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`,
      videos: [
        {
          id: 'v4-state-intro',
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
          title: 'React State Explained',
          description: 'Understanding state and how it differs from props',
          thumbnail: 'https://via.placeholder.com/1280x720/8B5CF6/FFFFFF?text=React+State',
          duration: 250,
          skillLevel: 'intermediate',
          tags: ['state', 'hooks', 'react']
        },
        {
          id: 'v4-usestate',
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          title: 'useState Hook Tutorial',
          description: 'How to use the useState hook in React components',
          thumbnail: 'https://via.placeholder.com/1280x720/10B981/FFFFFF?text=useState+Hook',
          duration: 320,
          skillLevel: 'intermediate',
          tags: ['hooks', 'useState', 'tutorial']
        },
        {
          id: 'v4-examples',
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
          title: 'State Management Examples',
          description: 'Real-world examples of state management in React',
          thumbnail: 'https://via.placeholder.com/1280x720/EC4899/FFFFFF?text=State+Examples',
          duration: 280,
          skillLevel: 'intermediate',
          tags: ['examples', 'state-management', 'practical']
        }
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
    metadata: {
      hasVideo: true,
      videoCount: 1,
      isPractice: true
    },
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
      <button onClick={() => setCount(0)}>
        Reset
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
      ],
      videos: [
        {
          id: 'v5-counter',
          url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
          title: 'Building a Counter Component',
          description: 'Step-by-step tutorial for creating a counter with React state',
          thumbnail: 'https://via.placeholder.com/1280x720/6366F1/FFFFFF?text=Counter+Tutorial',
          duration: 420,
          skillLevel: 'intermediate',
          tags: ['tutorial', 'practice', 'hands-on', 'counter']
        }
      ],
      practiceExercises: [
        {
          id: 'ex1',
          type: 'coding',
          question: 'Create a counter that increments by 2 instead of 1',
          answer: 'setCount(count + 2)',
          hints: ['Use the same pattern but add 2 instead of 1'],
          difficulty: 'easy'
        },
        {
          id: 'ex2',
          type: 'multiple-choice',
          question: 'What is the initial value of count in useState(5)?',
          answer: '5',
          difficulty: 'easy'
        }
      ]
    }
  }
];

// Video content for each card skill level
export const skillBasedVideos: Record<string, VideoContent[]> = {
  'react-components-beginner': [
    {
      id: 'rb1',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      title: 'React Basics for Beginners',
      description: 'Start your React journey with simple explanations',
      thumbnail: 'https://via.placeholder.com/320x180/3B82F6/FFFFFF?text=React+Basics',
      duration: 180,
      skillLevel: 'beginner',
      tags: ['basics', 'beginner-friendly']
    }
  ],
  'react-components-intermediate': [
    {
      id: 'ri1',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      title: 'Advanced React Patterns',
      description: 'Learn advanced React component patterns and techniques',
      thumbnail: 'https://via.placeholder.com/320x180/8B5CF6/FFFFFF?text=Advanced+React',
      duration: 360,
      skillLevel: 'intermediate',
      tags: ['advanced', 'patterns']
    }
  ]
};

// Quiz collections for different topics
export const quizCollections = {
  'react-fundamentals': [
    {
      id: 'q1',
      question: 'What is JSX?',
      options: [
        'A JavaScript extension',
        'A syntax extension for JavaScript',
        'A new programming language',
        'A CSS framework'
      ],
      correctAnswer: 1,
      explanation: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.',
      points: 5
    }
  ]
};
