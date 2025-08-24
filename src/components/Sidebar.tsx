import { DocumentIcon, DotsIcon } from '@/lib/icons/icons'
import { useChat } from '@ai-sdk/react';
import { CogIcon, FileText, GlobeIcon, PlusIcon, RefreshCwIcon, Text, Upload } from 'lucide-react'
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog"

import React, { useState } from 'react'
import { Button } from './ui/button';
import SourceModal from './SourceModal';
import { formatTime } from '@/lib/utils';

const Sidebar = ({ notebooks, setNotebooks, selectedNotebookId, setSelectedNotebookId }: any) => {
const [open, setOpen] = useState(false);

    const totalSources = notebooks.reduce((acc, nb) => acc + nb.sources?.length, 0);
    console.log('notebooks',notebooks)

    // Add source to current notebook
    const addSource = () => {
        const sourceTypes = ['document', 'web'];
        const sourceNames = [
            'Research Paper.pdf',
            'Data Analysis.xlsx',
            'wikipedia.org/article',
            'github.com/repository',
            'Technical Guide.pdf'
        ];

        const newSource = {
            id: Date.now().toString(),
            title: sourceNames[Math.floor(Math.random() * sourceNames.length)],
            type: sourceTypes[Math.floor(Math.random() * sourceTypes.length)],
            status: Math.random() > 0.2 ? 'ready' : 'processing',
            url: `https://example.com/${Date.now()}`
        };

        setNotebooks(prev =>
            prev.map(nb =>
                nb.id === selectedNotebookId
                    ? { ...nb, sources: [...nb.sources, newSource], lastModified: 'Just now' }
                    : nb
            )
        );
    };
    // Create new notebook
    const createNewNotebook = () => {
        const newNotebook = {
            id: Date.now().toString(),
            name: `Notebook ${notebooks.length + 1}`,
            sources: [],
            lastModified: formatTime(new Date()),
            messages: []
        };
        setNotebooks(prev => [...prev, newNotebook]);
        setSelectedNotebookId(newNotebook.id);
        setOpen(true)
        console.log('id : ', newNotebook.id)
    };

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-lg font-medium text-gray-800">NoteFlow</h1>
                    <div className="flex items-center space-x-2">
                        {/* <CogIcon className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" /> */}
                        <span className="text-sm text-gray-500">{totalSources} sources available</span>
                        <RefreshCwIcon className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setNotebooks([])}/>
                    </div>
                </div>

                <div className='flex flex-col gap-3'>
                    <Button
                        onClick={createNewNotebook}
                        className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span className="font-medium">New Notebook</span>
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger>
                            <Button
                                // onClick={addSource}
                                disabled={notebooks.length === 0}
                                variant={'outline'}
                                className="w-full cursor-pointer hover:bg-gray-100 text-gray-800 border-1 py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                            >
                                <Upload className="w-4 h-4" />
                                <span>Add Source</span>
                            </Button>
                        </DialogTrigger>
                        <SourceModal notebookId={selectedNotebookId} setNotebooks={setNotebooks} onClose={() => setOpen(false)}/>
                    </Dialog>

                </div>
            </div>

            {/* Notebooks List */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {notebooks.map((notebook) => (
                    <div
                        key={notebook.id}
                        onClick={() => setSelectedNotebookId(notebook.id)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedNotebookId === notebook.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <DocumentIcon className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-800">{notebook.name}</span>
                            </div>
                            <DotsIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <span>{notebook.sources?.length} sources</span>
                            <span>{notebook?.lastModified}</span>
                        </div>

                        {/* Sources */}
                        {notebook.sources?.length >0 && <div className="space-y-2">
                            <hr className='mb-3'/>
                            {notebook.sources?.map((source) => (
                                <div key={source.id} className="flex items-center space-x-3">
                                    {source.type === 'file' ? (
                                        <FileText className="w-4 h-4 text-gray-400" />
                                    ) : source.type === 'url' ? (
                                        <GlobeIcon className="w-4 h-4 text-gray-400" />
                                    ) : <Text className="w-4 h-4 text-gray-400" /> }
                                    <span className="text-sm text-gray-700 truncate flex-1">{source.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded bg-green-100 text-green-700`}>
                                        ready
                                    </span>
                                </div>
                            ))}
                        </div> }
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Sidebar