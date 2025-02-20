import { useState } from 'react';
import ReactMarkdown from "react-markdown";
import { load } from 'cheerio';
import TypingEffect from './TypingEffect';
import './index.css';

const App = () => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);

  function extractAllowedHtml(html: string, allowedTags: string[]): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

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
      const parent = (currentNode as HTMLElement).parentElement;
      if (!parent || !allowedTags.includes(parent.tagName.toLowerCase())) {
        result.push((currentNode as HTMLElement).outerHTML);
      }
      currentNode = walker.nextNode();
    }

    return result.join('');
  }

  function addTailwindClasses(html: string): string {
    const $ = load(html);

    $('p').each((_: number, el: any) => {
      $(el)
        .removeClass()
        .addClass('mb-4 text-base text-gray-200');
    });

    $('ul').each((_: number, el: any) => {
      $(el)
        .removeClass()
        .addClass('list-disc pl-5 mb-4 text-gray-200');
    });

    $('li').each((_: number, el: any) => {
      $(el)
        .removeClass()
        .addClass('text-gray-200');
    });

    $('a').each((_: number, el: any) => {
      const $el = $(el);
      let href = $el.attr('href');
      
      if (href) {
        href = href.replace(/=""\s+/g, '')
                   .replace(/""=/g, '')
                   .replace(/\s+/g, '');
      }
      
      $el.removeClass()
         .addClass('text-blue-400 hover:underline')
         .attr('href', href || '');
    });

    $('strong').each((_: number, el: any) => {
      $(el)
        .removeClass()
        .addClass('font-bold text-white');
    });

    return $.html().replace(/>\s+</g, '><');
  }

  const sendMessage = async () => {
    const userMessage = { text: userInput, sender: 'user' };
    setMessages([...messages, userMessage]);
    setUserInput('');
    setIsThinking(true);

    try {
      const response = await fetch("https://ctoledogpt-backend.onrender.com/askGPT", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interaction: { role: "user", content: userInput } }),
      });

      let data = await response.text();
      data = data.slice(1, -1);

      const allowedTags = ['p', 'strong', 'a', 'ul', 'li', 'section'];
      const extractedHtml = extractAllowedHtml(data, allowedTags);
      let bodyContent = extractedHtml
        .replace(/\\n/g, '\n')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/\\&quot;/g, '"');

      bodyContent = addTailwindClasses(bodyContent);

      console.log(bodyContent);

      setMessages((prev) => [...prev, { text: bodyContent, sender: 'ai' }]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-[30%] p-6 bg-gray-800 text-white">
        <h1 className="text-3xl font-bold mb-4">CToledo GPT</h1>
        <p className="text-lg">This sidebar can contain navigation, info, or settings.</p>
      </div>
      
      {/* Chat Area */}
      <div className="w-[70%] flex flex-col p-4">
        {/* Chat Window */}
        <div className="flex-1 overflow-auto p-4 bg-gray-800 rounded-lg shadow-lg space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`${
                  message.sender === 'user' ? 'w-fit' : 'w-[75%]'
                } p-3 rounded-lg whitespace-pre-wrap break-words ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                {message.sender === 'user' ? (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                ) : (
                  <TypingEffect text={message.text} />
                )}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="w-[75%] p-3 rounded-lg bg-gray-700 text-gray-100">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="mt-4 flex space-x-2">
          <input
            type="text"
            className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && userInput.trim()) {
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition duration-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
