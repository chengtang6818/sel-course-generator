import React, { useState } from 'react';
import type { CourseInput, KnowledgeFile } from '../types';

interface InputFormProps {
  courses: CourseInput[];
  setCourses: React.Dispatch<React.SetStateAction<CourseInput[]>>;
  onGenerate: () => void;
  isLoading: boolean;
  isParsing: boolean;
  onTextBatchImport: (text: string) => void;
  onFileBatchImport: (file: File) => void;
  onClearCourses: () => void;
  knowledgeFiles: KnowledgeFile[];
  selectedFileIds: Set<number>;
  onToggleFileSelection: (id: number) => void;
  onManageKnowledge: () => void;
}

const FileUploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 mr-2"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const GenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

export const InputForm: React.FC<InputFormProps> = ({
  courses,
  setCourses,
  onGenerate,
  isLoading,
  isParsing,
  onTextBatchImport,
  onFileBatchImport,
  onClearCourses,
  knowledgeFiles,
  selectedFileIds,
  onToggleFileSelection,
  onManageKnowledge
}) => {
  const [inputMode, setInputMode] = useState<'manual' | 'batch'>('manual');
  const [batchText, setBatchText] = useState('');

  const handleCourseChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === id ? { ...course, [name]: value } : course
      )
    );
  };

  const addCourse = () => {
    setCourses(prev => [...prev, { id: Date.now(), skill: '', ageGroup: '' }]);
  };
  
  const removeCourse = (id: number) => {
    setCourses(prev => prev.filter(course => course.id !== id));
  };
  
  const handleBatchTextParse = async () => {
      if (batchText.trim()) {
          await onTextBatchImport(batchText);
          setBatchText('');
      }
  };

  const handleBatchFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          onFileBatchImport(file);
          event.target.value = '';
      }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg h-full sticky top-28">
      <h2 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">课程参数</h2>
      
      <div className="mb-4">
          <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button onClick={() => setInputMode('manual')} className={`px-4 py-2 text-sm font-medium transition-colors ${inputMode === 'manual' ? 'border-b-2 border-sky-500 text-sky-600 dark:text-sky-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>手动添加</button>
              <button onClick={() => setInputMode('batch')} className={`px-4 py-2 text-sm font-medium transition-colors ${inputMode === 'batch' ? 'border-b-2 border-sky-500 text-sky-600 dark:text-sky-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>批量导入</button>
          </div>
      </div>
      
      {inputMode === 'manual' && (
           <button
              type="button"
              onClick={addCourse}
              className="w-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-600 mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              添加新课程
            </button>
      )}
      
      {inputMode === 'batch' && (
          <div className="space-y-4 mb-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="输入或粘贴您的课程想法，AI会自动为您整理成列表。&#10;例如:&#10;我想为3到5岁的孩子设计一个关于认识情绪的课程，再来一个给大一点的9-12岁孩子的情绪管理课。"
                className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition h-32"
                disabled={isParsing}
              />
              <button 
                onClick={handleBatchTextParse} 
                disabled={isParsing}
                className="w-full flex items-center justify-center text-sm py-2 px-4 bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-md hover:bg-sky-200 dark:hover:bg-sky-800 transition disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-wait"
              >
                 {isParsing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      解析中...
                    </>
                 ) : (
                    '从文本导入'
                 )}
              </button>
              <div>
                  <label htmlFor="batch-file-upload" className={`w-full flex items-center justify-center text-sm py-2 px-4 rounded-md transition ${isParsing ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 cursor-pointer'}`}>
                      <FileUploadIcon className="h-4 w-4 mr-2"/>
                      从文件导入 (.txt, .csv)
                  </label>
                  <input id="batch-file-upload" type="file" className="sr-only" onChange={handleBatchFileChange} accept=".txt,.csv" disabled={isParsing} />
              </div>
          </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); onGenerate(); }} className="space-y-6">
        <div className="space-y-4 max-h-[calc(100vh-600px)] min-h-[100px] overflow-y-auto pr-2">
          {courses.map((course, index) => (
            <div key={course.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg relative bg-white dark:bg-slate-800">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">课程 {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeCourse(course.id)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition"
                  aria-label={`Remove course ${index + 1}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              <div className="space-y-4">
                 <div>
                  <label htmlFor={`skill-${course.id}`} className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    具体技能点 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`skill-${course.id}`}
                    name="skill"
                    value={course.skill}
                    onChange={(e) => handleCourseChange(course.id, e)}
                    placeholder="例如: 情绪识别"
                    className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    required
                  />
                </div>
                <div>
                  <label htmlFor={`ageGroup-${course.id}`} className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    年龄段 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`ageGroup-${course.id}`}
                    name="ageGroup"
                    value={course.ageGroup}
                    onChange={(e) => handleCourseChange(course.id, e)}
                    placeholder="例如: 3-5岁"
                    className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
              <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
                  请添加或导入课程...
              </div>
          )}
        </div>
        
        {courses.length > 0 && (
            <button type="button" onClick={onClearCourses} className="w-full text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition">清空列表</button>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                知识库 (Knowledge Base)
             </label>
             <button type="button" onClick={onManageKnowledge} className="text-xs text-sky-600 dark:text-sky-400 hover:underline">管理知识库</button>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-2 rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
             {knowledgeFiles.length > 0 ? knowledgeFiles.map(file => (
                <div key={file.id} className="flex items-center">
                    <input 
                        type="checkbox"
                        id={`file-${file.id}`}
                        checked={selectedFileIds.has(file.id)}
                        onChange={() => onToggleFileSelection(file.id)}
                        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        disabled={file.status !== 'loaded'}
                    />
                    <label htmlFor={`file-${file.id}`} className={`ml-2 text-sm truncate ${file.status === 'loaded' ? 'text-slate-700 dark:text-slate-300 cursor-pointer' : 'text-slate-400 dark:text-slate-500'}`} title={file.file.name}>
                        {file.file.name}
                    </label>
                </div>
             )) : (
                <div className="text-center py-3 text-slate-400 dark:text-slate-500 text-xs">
                    知识库为空。
                </div>
             )}
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || courses.length === 0 || courses.every(c => !c.skill || !c.ageGroup)}
          className="w-full flex items-center justify-center bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:bg-sky-700 hover:shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生成中...
            </>
          ) : (
            <>
              <GenerateIcon />
              生成课程
            </>
          )}
        </button>
      </form>
    </div>
  );
};