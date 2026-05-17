function ReviewCard({ username, rating, reviewText, date }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{username}</h3>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
              ★
            </span>
          ))}
        </div>
      </div>
      <p className="text-gray-700">{reviewText}</p>
    </div>
  )
}

export default ReviewCard
