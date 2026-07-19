module.exports = {
  standard: 'WCAG2AA',
  threshold: 0,
  chromeLaunchConfig: {
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
};
