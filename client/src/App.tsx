import React, { useState } from 'react';
import ReactMarkdown from "react-markdown";
import { customTurndownService } from './turndownService';
import { load } from 'cheerio';
import './index.css'; // Ensure this is the correct path


const App = () => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const turndownService = customTurndownService;

  function extractAllowedHtml(html: string, allowedTags: string[]): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
  
    // Create a TreeWalker to traverse all element nodes in the body
    const walker = document.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          return allowedTags.includes((node as HTMLElement).tagName.toLowerCase())
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
        }
      }
    );
  
    const result: string[] = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      // Only add the node if its parent is not allowed
      const parent = (currentNode as HTMLElement).parentElement;
      if (!parent || !allowedTags.includes(parent.tagName.toLowerCase())) {
        result.push((currentNode as HTMLElement).outerHTML);
      }
      currentNode = walker.nextNode();
    }
  
    return result.join('\n\n');
  }

  function addTailwindClasses(html: string): string {
    const $ = load(html);
    $('p').addClass('mb-4 text-base text-gray-700');
    $('a').addClass('text-blue-500 hover:underline');
    // ... add classes to other tags as needed
    return $.html();
  }

  const sendMessage = async () => {
    // Adding the user's message
    const userMessage = { text: userInput, sender: 'user' };
    setMessages([...messages, userMessage]);
    setUserInput('');

    // Call to the backend API to send the user message to AI and get a response
    try {
      const response = await fetch(`http://localhost:5000/askGPT/${encodeURIComponent(userInput)}`);
      let data = await response.text();
      data = data.slice(1, -1)

      const allowed = ['p', 'section', 'strong', 'a', 'ul', 'li'];
      const extractedHtml = extractAllowedHtml(data, allowed);      
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = extractedHtml;

      let bodyContent = tempDiv.innerHTML.trim();

      bodyContent = bodyContent.replace(/\\n/g, '\n'); // Replace escaped newlines with actual newlines
      bodyContent = bodyContent.replace(/<style[\s\S]*?<\/style>/gi, '').trim();
      bodyContent = bodyContent.replace(/\\&quot;/g, '"');
      bodyContent = bodyContent.replace(/href=""(.*?)""/g, 'href="$1"');
      bodyContent = addTailwindClasses(bodyContent);
      bodyContent = turndownService.turndown(bodyContent);

      console.log(bodyContent);


      // Adding the AI's response
      const aiMessage = { text: bodyContent, sender: 'ai' };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
    {/* Chat Window */}
    <div className="flex-1 overflow-auto p-4 bg-white rounded-lg shadow-lg space-y-4">
      {messages.map((message, index) => (
        <div 
          key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>

          <div className={`w-fit max-w-[75%] p-3 rounded-lg whitespace-pre-wrap break-words
            ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
            
            <ReactMarkdown>{message.text}</ReactMarkdown>

          </div>
        </div>
      ))}
    </div>
  
      {/* Input Section */}
      <div className="mt-4 flex space-x-2">
        <input
          type="text"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default App;
