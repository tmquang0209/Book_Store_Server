const jsonFormat = (success, message, data) => {
    return {
        success,
        message,
        data,
    };
};

module.exports = jsonFormat;
