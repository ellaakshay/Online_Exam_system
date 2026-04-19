// filepath: frontend/src/components/QuestionCard.jsx
const QuestionCard = ({ question, index, selectedAnswer, onAnswerChange }) => {
  const options = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">
        Question {index + 1}: {question.questionText}
      </h3>
      <div className="space-y-3">
        {question.options.map((option, i) => (
          <label
            key={i}
            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition ${
              selectedAnswer === options[i]
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name={`question-${question._id}`}
              value={options[i]}
              checked={selectedAnswer === options[i]}
              onChange={() => onAnswerChange(question._id, options[i])}
              className="mr-3"
            />
            <span className="font-medium mr-2">{options[i]}.</span>
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;