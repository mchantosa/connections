// Error handling wrapper for async middleware
const catchError = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

module.exports = catchError;
