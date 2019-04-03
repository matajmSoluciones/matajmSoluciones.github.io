module.exports.mailto = function () {
    window.location = `mailto:${process.env.EMAIL}`;
}