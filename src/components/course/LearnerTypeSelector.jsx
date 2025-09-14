import { useState } from 'react';
import { GraduationCap, RefreshCw, CheckCircle, Clock, Target, BookOpen, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function LearnerTypeSelector({ onSelect, initialType = null }) {
  const [selectedType, setSelectedType] = useState(initialType);
  const [showDetails, setShowDetails] = useState(false);

  const learnerTypes = [
    {
      id: 'first-time',
      title: 'First-time Learner',
      subtitle: 'New to this subject area',
      icon: GraduationCap,
      color: 'blue',
      description: 'You\'re starting your learning journey in this subject area.',
      features: [
        'Comprehensive foundational content',
        'Step-by-step explanations',
        'Practice exercises and examples',
        'Regular knowledge checks',
        'Full course completion path'
      ],
      estimatedTime: 'Complete course duration',
      recommendations: [
        'Start from the beginning',
        'Complete all lessons in order',
        'Take time with foundational concepts',
        'Use practice exercises to reinforce learning'
      ],
      badges: ['Beginner-friendly', 'Comprehensive', 'Structured']
    },
    {
      id: 'refresher',
      title: 'Refresher Learner',
      subtitle: 'Experienced but need a review',
      icon: RefreshCw,
      color: 'green',
      description: 'You have experience but want to refresh your knowledge or fill gaps.',
      features: [
        'Quick review of key concepts',
        'Test-out options for known content',
        'Focused on advanced topics',
        'Flexible learning paths',
        'Accelerated completion options'
      ],
      estimatedTime: '30-70% of course duration',
      recommendations: [
        'Take pre-assessment to identify gaps',
        'Use test-out options for familiar content',
        'Focus on challenging areas',
        'Skip basic explanations when possible'
      ],
      badges: ['Advanced', 'Flexible', 'Efficient']
    }
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setShowDetails(true);
  };

  const handleConfirm = () => {
    if (onSelect && selectedType) {
      onSelect(selectedType);
    }
  };

  const handleChangeType = () => {
    setShowDetails(false);
    setSelectedType(null);
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  const renderTypeCard = (type) => {
    const colors = getColorClasses(type.color);
    const IconComponent = type.icon;

    return (
      <Card 
        key={type.id}
        className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
          selectedType?.id === type.id 
            ? `${colors.border} border-2` 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => handleTypeSelect(type)}
      >
        <div className="text-center space-y-4">
          <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mx-auto`}>
            <IconComponent className={`w-8 h-8 ${colors.icon}`} />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{type.title}</h3>
            <p className="text-gray-600">{type.subtitle}</p>
          </div>

          <p className="text-sm text-gray-600">{type.description}</p>

          <div className="flex flex-wrap gap-2 justify-center">
            {type.badges.map((badge, index) => (
              <span 
                key={index}
                className={`px-3 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}
              >
                {badge}
              </span>
            ))}
          </div>

          {selectedType?.id === type.id && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Selected</span>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderTypeDetails = () => {
    if (!selectedType || !showDetails) return null;

    const colors = getColorClasses(selectedType.color);
    const IconComponent = selectedType.icon;

    return (
      <div className="mt-8">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center`}>
              <IconComponent className={`w-8 h-8 ${colors.icon}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedType.title}</h2>
              <p className="text-gray-600">{selectedType.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                What You'll Get
              </h3>
              <ul className="space-y-2">
                {selectedType.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Learning Recommendations
              </h3>
              <ul className="space-y-2">
                {selectedType.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Estimated Time:</span>
                <span className="text-gray-600">{selectedType.estimatedTime}</span>
              </div>
              
              {selectedType.id === 'refresher' && (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800 font-medium">Test-out Available</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleChangeType} variant="outline">
              Change Selection
            </Button>
            <Button onClick={handleConfirm} className={colors.button}>
              Continue with {selectedType.title}
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-8xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Learning Path</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the learning path that best matches your experience level. 
          This will help us personalize your learning experience and optimize your course progression.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {learnerTypes.map(renderTypeCard)}
      </div>

      {renderTypeDetails()}

      {!showDetails && (
        <div className="text-center text-gray-500">
          <p>Select a learning type above to see detailed information</p>
        </div>
      )}
    </div>
  );
} 