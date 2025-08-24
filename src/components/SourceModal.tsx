import React, { useEffect, useRef, useState } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileTextIcon, Link, LinkIcon, Loader2Icon, Text, UploadIcon } from 'lucide-react'
import { Button } from './ui/button'
import axios from 'axios'
import { IndexingStepper } from './IndexingStepper'

const SourceModal = ({ notebookId, setNotebooks, onClose }) => {
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [loader, setLoader] = useState(false)
  const [stage, setStage] = React.useState<'idle' | 'uploading' | 'parsing' | 'chunking' | 'embedding' | 'persisting' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = React.useState(0);
  console.log('notebookId', notebookId)
  console.log('stage', stage)

  // keep timer IDs so we can cancel them
  const timersRef = useRef<number[]>([]);

  const clearMilestones = () => {
    timersRef.current.forEach(id => clearTimeout(id));
    timersRef.current = [];
  };

  const startMilestones = (opts?: { initialStage?: string; initialPct?: number }) => {
    clearMilestones();
    setStage((opts?.initialStage as any) ?? 'uploading');
    setProgress(opts?.initialPct ?? 5);

    const schedule = [
      { after: 600, stage: 'parsing', pct: 20 },
      { after: 1200, stage: 'chunking', pct: 45 },
      { after: 1800, stage: 'embedding', pct: 70 },
      { after: 2400, stage: 'persisting', pct: 90 },
    ];

    schedule.forEach(s => {
      const id = window.setTimeout(() => {
        setStage(s.stage as any);
        setProgress(prev => (prev < s.pct ? s.pct : prev)); // never go backwards
      }, s.after);
      timersRef.current.push(id);
    });
  };

  // finish / fail helpers
  const finishMilestones = () => {
    clearMilestones();
    setStage('ready');
    setProgress(100);
  };
  const failMilestones = () => {
    clearMilestones();
    setStage('error');
    setProgress(0);
  };

  // optional: cleanup if the modal unmounts
  useEffect(() => () => clearMilestones(), []);

  const handleClose = () => {
    // reset all states
    setText('');
    setUrl('');
    setLoader(false);
    setStage('idle');
    setProgress(0);
    onClose();
  };

  const saveText = async () => {
    try {
      startMilestones();
      setLoader(true);
      const response = await axios.post('/api/upload', { text, notebookId });

      if (response?.data?.resource) {
        const newSource = response.data.resource;
        setNotebooks((prev: any) =>
          prev.map(nb =>
            nb.id === notebookId
              ? { ...nb, sources: [...nb.sources, newSource] }
              : nb
          )
        );
      }
      console.log('response (text):', response);
      finishMilestones();
      setLoader(false);
      setTimeout(() => {
        handleClose();
      }, 300);
    } catch (error: any) {
      console.error('Error saving text source:', error?.response?.data || error.message);
    }
  };

  const saveUrl = async () => {
    try {
      startMilestones();
      setLoader(true);
      const response = await axios.post('/api/upload', { url, notebookId });

      if (response?.data?.resource) {
        const newSource = response.data.resource;
        setNotebooks((prev: any) =>
          prev.map(nb =>
            nb.id === notebookId
              ? { ...nb, sources: [...nb.sources, newSource] }
              : nb
          )
        );
      }

      console.log('response (url):', response);
      finishMilestones();
      setLoader(false);
      setTimeout(() => {
        handleClose();
      }, 300);
    } catch (error: any) {
      console.error('Error saving URL source:', error?.response?.data || error.message);
    }
  };

  const saveFile = async (file: File) => {
    console.log('filen', file)
    if (!file) return alert("Please select a PDF first!");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("notebookId", notebookId);
    try {
      startMilestones();
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-type': 'multipart/form-data' }
      })
      if (response?.data?.resource) {
        const newSource = response?.data?.resource;
        setNotebooks((prev: any) =>
          prev.map(nb =>
            nb.id === notebookId ? { ...nb, sources: [...nb.sources, newSource], } : nb
          )
        );
      }
      console.log('Upload success:', response.data)
      finishMilestones();
      setTimeout(() => {
        handleClose();
      }, 300);
    } catch (error) {
      console.error("Upload error:", error);
    }
  }

  return (
    <DialogContent className="w-7xl">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-gray-700">
          Add Source
        </DialogTitle>
      </DialogHeader>

      {/* Tabs for Upload / URL / Text */}
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="upload" className="flex items-center gap-2 cursor-pointer">
            <UploadIcon className="h-4 w-4" />
            Upload Files
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2 cursor-pointer">
            <LinkIcon className="h-4 w-4" />
            Add URL
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2 cursor-pointer">
            <FileTextIcon className="h-4 w-4" />
            Add Text
          </TabsTrigger>
        </TabsList>

        {/* Upload Files Tab */}
        <TabsContent value="upload" className="mt-4">
          <label
            htmlFor="file-upload"
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-400 transition"
          >
            <FileTextIcon className="h-10 w-10 text-gray-400 mb-2" />
            <p className="font-medium text-gray-700">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports PDF, TXT files up to 10MB
            </p>
            {/* hidden input */}
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                console.log('filek', file)
                if (file)
                  saveFile(file);
              }}
            />
          </label>
          {stage !== "idle" && <IndexingStepper stage={stage} progress={progress} />}

        </TabsContent>

        {/* Add URL Tab */}
        <TabsContent value="url" className="mt-4">
          <input
            type="url"
            placeholder="Enter a URL"
            className="w-full border rounded-md p-2 text-sm"
            onChange={(e) => setUrl(e.target.value)}
          />
          {stage !== "idle" && <IndexingStepper stage={stage} progress={progress} />}
          <Button variant="outline" className='mt-3 w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white hover:text-white' onClick={saveUrl} disabled={url.trim() == ""}>
            {loader && <Loader2Icon className="animate-spin" />}
            <Link className='w-4 h-4' /> Add URL</Button>
        </TabsContent>

        {/* Add Text Tab */}
        <TabsContent value="text" className="mt-4">
          <textarea
            placeholder="Paste your text here..."
            className="w-full h-32 border rounded-md p-2 text-sm"
            onChange={(e) => setText(e.target.value)}
          />
          {stage !== "idle" && <IndexingStepper stage={stage} progress={progress} />}
          <Button variant="outline" className='mt-2 w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white hover:text-white' onClick={saveText} disabled={text.trim() == ""}>
            {loader && <Loader2Icon className="animate-spin" />}
            <Text className='w-4 h-4' /> Add Text</Button>
        </TabsContent>
      </Tabs>
    </DialogContent>
  )
}

export default SourceModal