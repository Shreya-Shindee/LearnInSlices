import { MicroCardViewer } from '../components/learning';
import { sampleCards } from '../data/sampleCards';

export default function MicroCardDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Micro-Card Learning Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience our interactive micro-learning cards designed to make learning 
            engaging and effective. Navigate through React fundamentals with our 
            spaced-repetition approach.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <MicroCardViewer
            pathId="path-1"
            cards={sampleCards}
            currentCardIndex={0}
            onComplete={() => {
              alert('Congratulations! You completed the learning path!');
            }}
            onCardChange={(index) => {
              console.log('Card changed to index:', index);
            }}
          />
        </div>
        
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Learning Path Progress
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {sampleCards.length}
                </div>
                <div className="text-sm text-gray-600">Total Cards</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ~25 min
                </div>
                <div className="text-sm text-gray-600">Estimated Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  Beginner
                </div>
                <div className="text-sm text-gray-600">Difficulty Level</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}