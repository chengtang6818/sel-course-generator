import React, { useState, useMemo, useEffect } from 'react';
import type { KnowledgeFile } from '../types';

interface KnowledgeBaseManagerProps {
    files: KnowledgeFile[];
    onAddFile: (file: File) => void;
    onDeleteFile: (id: number) => void;
    onUpdateContent: (id: number, newContent: string) => void;
}

const FileUploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 mr-2"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'txt': return '📄';
        case 'md': return '📝';
        case 'pdf': return '📕';
        case 'doc':
        case 'docx': return '📘';
        default: return '📁';
    }
};

export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({ files, onAddFile, onDeleteFile, onUpdateContent }) => {
    const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles) {
            Array.from(selectedFiles).forEach(file => onAddFile(file));
        }
    };
    
    const selectedFile = useMemo(() => {
        return files.find(f => f.id === selectedFileId) || null;
    }, [files, selectedFileId]);

    useEffect(() => {
        setIsEditing(false);
        if (selectedFile && selectedFile.status === 'loaded') {
            setEditText(selectedFile.content || '');
        }
    }, [selectedFile]);

    const handleSave = () => {
        if (selectedFile) {
            onUpdateContent(selectedFile.id, editText);
            setIsEditing(false);
        }
    };

    const isEditable = selectedFile && selectedFile.status === 'loaded' && selectedFile.contentType === 'text';

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4 lg:col-span-3">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">知识库文件</h2>
                    <label htmlFor="kb-file-upload" className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition mb-4">
                        <FileUploadIcon />
                        <span className="text-sm text-slate-500 dark:text-slate-400">上传新文件</span>
                    </label>
                    <input id="kb-file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept=".txt,.md,.doc,.docx,.pdf" />

                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {files.length === 0 && (
                            <p className="text-sm text-center text-slate-400 dark:text-slate-500 py-4">知识库为空。</p>
                        )}
                        {files.map(file => (
                            <div key={file.id} 
                                 onClick={() => setSelectedFileId(file.id)}
                                 className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedFileId === file.id ? 'bg-sky-100 dark:bg-sky-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                                <div className="flex items-center truncate">
                                    <span className="text-lg mr-3">{getFileIcon(file.file.name)}</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate" title={file.file.name}>
                                        {file.file.name}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); if (selectedFileId === file.id) setSelectedFileId(null); }}
                                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition ml-2 flex-shrink-0"
                                    aria-label={`Delete ${file.file.name}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="md:col-span-8 lg:col-span-9">
                <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg min-h-[75vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">文件预览</h2>
                        {selectedFile && !isEditing && (
                             <button
                                onClick={() => setIsEditing(true)}
                                disabled={!isEditable}
                                className="flex items-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-slate-300 dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed"
                                title={isEditable ? "编辑文件内容" : "不支持编辑此文件类型"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                                编辑
                            </button>
                        )}
                        {isEditing && (
                            <div className="flex space-x-2">
                                <button onClick={() => setIsEditing(false)} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-slate-300 dark:hover:bg-slate-600">取消</button>
                                <button onClick={handleSave} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:bg-sky-700">保存</button>
                            </div>
                        )}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 flex-grow h-full">
                         {selectedFile ? (
                             <>
                                <h3 className="font-bold text-lg mb-2 pb-2 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">{selectedFile.file.name}</h3>
                                {isEditing ? (
                                    <textarea 
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full h-[calc(75vh-200px)] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition font-mono"
                                    />
                                ) : (
                                    <div className="prose prose-slate dark:prose-invert max-w-none h-[calc(75vh-150px)] overflow-y-auto">
                                        {selectedFile.status === 'loaded' && selectedFile.contentType === 'html' && <div dangerouslySetInnerHTML={{ __html: selectedFile.content || ''}} />}
                                        {selectedFile.status === 'loaded' && selectedFile.contentType === 'text' && <pre className="whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-300 font-sans">{selectedFile.content}</pre>}
                                        {selectedFile.status === 'pending' && <p className="text-slate-500">正在加载...</p>}
                                        {selectedFile.status === 'error' && <p className="text-red-500">读取文件失败。</p>}
                                        {selectedFile.status === 'unsupported' && <p className="text-slate-500">此文件类型不支持预览。</p>}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-slate-400 dark:text-slate-500">请从左侧选择一个文件进行预览。</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};