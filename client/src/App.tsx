import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from "react-markdown";
import TypingEffect from './TypingEffect';
import './index.css';
import { load } from 'cheerio';

const App = () => {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { text: userInput, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsThinking(true);
    setIsTyping(false);

    try {
      const response = await fetch("http://localhost:5000/askGPT", {
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

      setMessages(prev => [...prev, { text: bodyContent, sender: 'ai' }]);
      setIsTyping(true);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages(prev => [...prev, { text: "Sorry, I encountered an error. Please try again.", sender: 'ai' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 font-sans overflow-hidden">
      {/* Header with Glassmorphism Effect */}
      <header className="w-full backdrop-filter backdrop-blur-md bg-gray-900/80 text-white p-4 flex items-center justify-between border-b border-gray-700/50 fixed top-0 z-10 h-16 shadow-lg">
        <div className="flex items-center space-x-4 w-full max-w-6xl mx-auto">
          <div className="flex items-center">
            <img 
              src="/CToledoLogo.png" 
              alt="Logo" 
              className="h-10 w-10 rounded-full border-2 border-blue-500 shadow-lg transform hover:scale-105 transition-transform duration-300" 
            /> 
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            CToledo GPT
          </h1>
          <a 
            href="https://github.com/ctoledocarlo/ctoledoGPT/" 
            target='_blank' 
            rel="noopener noreferrer"
            className="hidden md:flex items-center ml-auto text-sm text-gray-300 hover:text-blue-400 transition-colors duration-200 group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub
          </a>
        </div>
      </header>

      {/* Main Content Area - Container with max width */}
      <div className="flex flex-col flex-1 pt-20 pb-24 px-4 overflow-hidden">
        {/* Centered container with max width */}
        <div className="w-full max-w-6xl mx-auto">
          {/* Chat Window with scrollable content */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 bg-gray-800/50 backdrop-filter backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 space-y-6 scroll-smooth h-[calc(100vh-11rem)]"
          >
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 max-w-md bg-gray-800/30 backdrop-filter backdrop-blur-sm rounded-xl border border-gray-700/50 transform transition-all duration-300 hover:scale-105">
                  <div className="mb-6">
                    <svg className="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-200 mb-3">Welcome to CToledo GPT</h2>
                  <p className="text-gray-400">Start a conversation by typing a message below</p>
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl whitespace-pre-wrap break-words shadow-lg ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-none border-t border-r border-blue-500/30'
                      : 'bg-gradient-to-r from-gray-700 to-gray-700 text-gray-100 rounded-tl-none border-t border-l border-gray-600/30'
                  } transition-all duration-200 ease-in-out hover:shadow-xl`}
                >
                  {message.sender === 'user' ? (
                    <ReactMarkdown className="prose prose-invert prose-sm [&>ul]:space-y-1 [&>ul]:my-2 [&>li]:my-1 [&>h2]:my-3 [&>p]:my-2 [&>ul]:list-disc [&>ul]:pl-5 [&>h2]:text-lg [&>h2]:font-semibold">
                      {message.text}
                    </ReactMarkdown>
                  ) : (
                    isTyping && index === messages.length - 1 ? (
                      <TypingEffect
                        text={message.text}
                        onComplete={() => setIsTyping(false)}
                        onTypingStart={scrollToBottom}
                        onTyping={scrollToBottom}
                      />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: message.text }} />
                    )
                  )}

                  <div className="flex justify-end mt-2 text-xs opacity-70">
                    {message.sender === 'user' ? 'You' : 'CToledo GPT'} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex justify-start animate-fadeIn">
                <div className="max-w-[70%] p-4 rounded-xl bg-gray-700/80 text-gray-100 rounded-tl-none flex items-center space-x-3 shadow-lg border border-gray-600/30">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-gray-300">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Fixed Input Section with Glass Effect - Contained Width */}
      <div className="fixed bottom-0 left-0 right-0 backdrop-filter backdrop-blur-md bg-gray-900/80 p-4 border-t border-gray-700/50 shadow-lg z-10">
        <div className="max-w-3xl mx-auto flex space-x-3">
          <input
            type="text"
            className="flex-1 p-3 bg-gray-800/70 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-transparent placeholder-gray-400 transition-all duration-200 shadow-inner"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message here..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && userInput.trim()) {
                sendMessage();
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!userInput.trim() || isThinking}
            className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${
              userInput.trim() && !isThinking
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-md transform hover:scale-105'
                : 'bg-gray-700/70 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11h2v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;