// filepath: frontend/src/components/ResultTable.jsx
const ResultTable = ({ results, type = 'admin' }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-100">
          <tr>
            {type === 'admin' && <th className="px-6 py-3 text-left">Student Name</th>}
            {type === 'admin' && <th className="px-6 py-3 text-left">Student Email</th>}
            <th className="px-6 py-3 text-left">Exam Title</th>
            <th className="px-6 py-3 text-center">Score</th>
            <th className="px-6 py-3 text-center">Percentage</th>
            <th className="px-6 py-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                No results found
              </td>
            </tr>
          ) : (
            results.map((result, index) => (
              <tr key={result._id || index} className="border-t hover:bg-gray-50">
                {type === 'admin' && (
                  <>
                    <td className="px-6 py-4">{result.student?.name || result.studentId?.name}</td>
                    <td className="px-6 py-4">{result.student?.email || result.studentId?.email}</td>
                  </>
                )}
                <td className="px-6 py-4">{result.exam?.title || result.examId?.title}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (result.score / result.totalQuestions) >= 0.6
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.score} / {result.totalQuestions}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`font-bold ${
                    parseFloat(result.percentage) >= 60 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.percentage}%
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(result.submittedAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;