import React from 'react';
import { MicroCardViewer } from '../components/learning';
import type { MicroCard } from '../types';

// Sample cards for demonstration
const sampleCards: MicroCard[] = [
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
      text: 'Let\'s create a simple React component that displays a welcome message.',
      question: 'How do you create a basic React component?',
      codeSnippet: `function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// Usage
<Welcome name="Alice" />`,
      hiddenContent: 'This component takes a "name" prop and displays a personalized greeting. The curly braces {} allow us to embed JavaScript expressions in JSX.',
      keyPoints: [
        'Function components are declared like regular JavaScript functions',
        'Props are passed as the first parameter',
        'Return JSX to define what the component renders',
        'Use curly braces to embed JavaScript in JSX'
      ]
    }
  },
  {
    id: 'card-3',
    learning_path_id: 'path-1',
    title: 'Component Props in Detail',
    type: 'concept',
    difficulty: 'intermediate',
    estimatedTime: '5 min',
    prerequisites: ['card-1', 'card-2'],
    metadata: {},
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    content: {
      text: 'Props (short for properties) are how components receive data from their parent components. They are read-only and help make components reusable.',
      question: 'What are props and how do they work?',
      hiddenContent: 'Props are passed down from parent to child components and should never be modified by the child. This unidirectional data flow makes React applications predictable and easier to debug.',
      keyPoints: [
        'Props are read-only inputs to components',
        'They enable parent-child communication',
        'Props make components reusable with different data',
        'Never modify props directly inside a component',
        'Use destructuring to extract specific props'
      ],
      codeSnippet: `// Destructuring props
function UserCard({ name, email, avatar }) {
  return (
    <div className="user-card">
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
}`,
      resources: [
        { title: 'React Props Documentation', url: 'https://react.dev/learn/passing-props-to-a-component', type: 'docs' },
        { title: 'Props vs State Guide', url: 'https://react.dev/learn/thinking-in-react', type: 'tutorial' }
      ]
    }
  },
  {
    id: 'card-4',
    learning_path_id: 'path-1',
    title: 'Practice: Build a User Profile Component',
    type: 'practice',
    difficulty: 'intermediate',
    estimatedTime: '8 min',
    prerequisites: ['card-1', 'card-2', 'card-3'],
    metadata: {},
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    content: {
      text: 'Now it\'s time to practice! Create a UserProfile component that displays user information including name, bio, and social links.',
      question: 'Can you build a UserProfile component that takes user data as props?',
      hiddenContent: `Here's a solution:

function UserProfile({ user }) {
  return (
    <div className="profile">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
      <div className="social-links">
        {user.socialLinks?.map(link => (
          <a key={link.platform} href={link.url}>
            {link.platform}
          </a>
        ))}
      </div>
    </div>
  );
}`,
      keyPoints: [
        'Use object destructuring for cleaner code',
        'Handle optional props with conditional rendering',
        'Map over arrays to render lists',
        'Always provide keys when rendering lists'
      ]
    }
  },
  {
    id: 'card-5',
    learning_path_id: 'path-1',
    title: 'Quiz: Component Knowledge Check',
    type: 'quiz',
    difficulty: 'intermediate',
    estimatedTime: '3 min',
    prerequisites: ['card-1', 'card-2', 'card-3', 'card-4'],
    metadata: {},
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    content: {
      text: 'Test your knowledge of React components with this quick quiz.',
      question: 'Which of the following statements about React components is correct?',
      hiddenContent: `Correct answers:
1. Components are reusable pieces of UI ✓
2. Props are read-only ✓
3. Components can be functions or classes ✓
4. JSX is returned to describe the UI ✓

Components should NOT modify their props directly - this breaks React's unidirectional data flow principle.`,
      keyPoints: [
        'Components are the building blocks of React apps',
        'Props flow down from parent to child',
        'Components should be pure functions when possible',
        'Always return JSX or null from components'
      ]
    }
  }
];

export const MicroCardDemo: React.FC = () => {
  const handleCardComplete = () => {
    console.log('Learning session completed!');
    alert('Great job! You\'ve completed this learning session.');
  };

  const handleCardChange = (index: number) => {
    console.log('Current card:', index + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            React Components - Interactive Learning
          </h1>
          <p className="text-lg text-gray-600">
            Learn React components through interactive micro-cards
          </p>
        </div>

        <MicroCardViewer
          pathId="path-1"
          cards={sampleCards}
          currentCardIndex={0}
          onComplete={handleCardComplete}
          onCardChange={handleCardChange}
        />

        {/* Learning Path Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-600">
            <span>🎯 5 Interactive Cards</span>
            <span>⏱️ ~23 minutes total</span>
            <span>📈 Beginner to Intermediate</span>
            <span>🏆 React Components Mastery</span>
          </div>
        </div>
      </div>
    </div>
  );
};
