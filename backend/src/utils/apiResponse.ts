const successResponse = (data: any, message = 'Success') => ({
    success: true,
    message,
    data,
});

const errorResponse = (message: string, statusCode = 500) => ({
    success: false,
    message,
    statusCode,
});

module.exports = { successResponse, errorResponse };