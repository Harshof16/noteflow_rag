// app/page.js (Next.js 13+ App Router)
'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import Sidebar from './Sidebar';
import { DocumentIcon } from '@/lib/icons/icons';
import { CogIcon, UserIcon } from 'lucide-react';
import Chat from './Chat';

// Dummy data with enhanced structure for AI Elements
const demoNotebook = [{
  id: "notebook-1",
  name: "Demo Notebook",
  sources: [
    { id: "src-1", name: "Intro to AI.pdf", type: "document" },
    { id: "src-2", name: "ML Basics.txt", type: "document" },
  ],
  messages: [
    {
      id: "msg-1",
      role: "user",
      content: "What is artificial intelligence?",
      timestamp: 1692879123456,
    },
    {
      id: "msg-2",
      role: "assistant",
      content:
        "Artificial Intelligence (AI) refers to systems designed to simulate human intelligence.\n\nHere’s an example in code:\n```python\nclass AI:\n    def __init__(self, name):\n        self.name = name\n\n    def think(self):\n        return f\"{self.name} is thinking...\"\n\nbot = AI(\"Jarvis\")\nprint(bot.think())\n```",
      timestamp: 1692879125678,
      sources: ["Intro to AI.pdf"],
    },
    {
      id: "msg-3",
      role: "user",
      content: "Give me a simple ML example.",
      timestamp: 1692879130456,
    },
    {
      id: "msg-4",
      role: "assistant",
      content:
        "Sure! A very basic machine learning example is linear regression.\n```js\nimport * as tf from '@tensorflow/tfjs';\n\nconst xs = tf.tensor([1, 2, 3, 4], [4, 1]);\nconst ys = tf.tensor([1, 3, 5, 7], [4, 1]);\n\nconst model = tf.sequential();\nmodel.add(tf.layers.dense({units: 1, inputShape: [1]}));\n\nmodel.compile({loss: 'meanSquaredError', optimizer: 'sgd'});\n\nawait model.fit(xs, ys, {epochs: 200});\n\nmodel.predict(tf.tensor2d([5], [1, 1])).print();\n```",
      timestamp: 1692879134567,
      sources: ["ML Basics.txt"],
    },
  ],
}];


const dummyResponses = [
    "That's a great question! Based on the sources you've uploaded, I can help you understand this concept better.",
    "According to the research document, this topic involves several key components that work together to achieve optimal results.",
    "The information in your sources suggests that this approach has been proven effective in multiple studies and real-world applications.",
    "From what I can see in your uploaded materials, there are three main aspects to consider when thinking about this topic.",
    "The research you've shared provides excellent insights into this area. Let me break down the key findings for you."
];

const suggestionPrompts = [
    "Summarize the main concepts",
    "Create a study guide",
    "Compare different approaches",
    "Explain the key benefits",
    "What are the limitations?"
];

export default function NotebookLM() {
    const [notebooks, setNotebooks] = useState(demoNotebook || []);
    const [selectedNotebookId, setSelectedNotebookId] = useState('1');

    // Get current notebook
    const currentNotebook = notebooks?.find(nb => nb.id === selectedNotebookId) || {};

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar */}
            <Sidebar notebooks={notebooks} setNotebooks={setNotebooks} selectedNotebookId={selectedNotebookId} setSelectedNotebookId={setSelectedNotebookId}/>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <h2 className="font-medium text-gray-800">{currentNotebook?.name}</h2>
                        {currentNotebook?.sources?.length > 0 && (
                            <span className="text-sm text-gray-500">
                                · {currentNotebook.sources?.length} sources
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>

                {/* Chat Area using AI Elements */}
                <Chat currentNotebook={currentNotebook} setNotebooks={setNotebooks}/>
            </div>
        </div>
    );
}