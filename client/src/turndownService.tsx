import TurndownService from 'turndown';

export const customTurndownService = new TurndownService();

customTurndownService.addRule('section', {
  filter: 'section',
  replacement: function (content) {
    return `\n\n ${content}`; 
  }
});

customTurndownService.addRule('h2', {
  filter: 'h2',
  replacement: function (content) {
    return `\n **${content.toUpperCase()}**\n`; 
  }
});

customTurndownService.addRule('p', {
  filter: 'p',
  replacement: function (content) {
    return `\n\n ${content}`; 
  }
});

customTurndownService.addRule('li', {
  filter: 'li',
  replacement: function (content) {
    return `\n ${content}`; 
  }
});


// Both doesnt work hahahaha

// customTurndownService.addRule('ul', {
//   filter: 'ul',
//   replacement: function (content) {
//     return content.trim(); // Prevent extra newlines
//   }
// });

// customTurndownService.addRule('li', {
//   filter: 'li',
//   replacement: function (content, node, options) {
//     content = content.trim(); // Remove extra spaces/newlines
//     return `${options.bulletListMarker} ${content}\n`; // Ensure correct list formatting
//   }
// });