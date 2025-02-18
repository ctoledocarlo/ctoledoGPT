  module.exports = {
    content: [
      './src/**/*.{html,js,jsx,ts,tsx}', // Adjust paths to include your files
    ],
    purge: [],
    darkMode: true, // or 'media' or 'class'
    theme: {
      extend: {},
    },
    variants: {
      extend: {},
    },
    plugins: [],
    safelist: [
      'bg-blue-500',
      'bg-gray-300',
      'text-blue-500',
      'text-white',
      'text-black',
    ],
  }
