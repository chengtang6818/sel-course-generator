import React from 'react';
import type { GeneratedCourseContent } from '../types';

interface OutputDisplayProps {
  isLoading: boolean;
  progress: string;
  error: string | null;
  generatedContent: GeneratedCourseContent[];
  onDownloadAll: () => void;
  onDownloadSingle: (courseId: number) => void;
}

const DownloadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5 mr-2"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


const formatSingleContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
        if (line.startsWith('1. 本堂课标题：')) {
            const title = line.substring(line.indexOf('：') + 1);
            return <h2 key={index} className="text-2xl font-bold text-sky-700 dark:text-sky-400 mb-6 pb-2 border-b border-slate-200 dark:border-slate-700">{title}</h2>;
        }
        if (/^\d+\.\s/.test(line) && line.length > 5) {
             const title = line.substring(line.indexOf(' ')+1);
             return <h3 key={index} className="text-xl font-semibold text-slate-700 dark:text-slate-300 mt-6 mb-3">{title}</h3>;
        }
        if (line.startsWith('* ') || line.startsWith('- ')) {
            return <li key={index} className="ml-6 list-disc mb-2 text-slate-600 dark:text-slate-300">{line.substring(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
             return <p key={index} className="font-bold my-2">{line.replace(/\*\*/g, '')}</p>
        }
        return <p key={index} className="mb-3 text-slate-600 dark:text-slate-300 leading-relaxed">{line}</p>;
    });
};

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ isLoading, progress, error, generatedContent, onDownloadAll, onDownloadSingle }) => {
  const hasContent = generatedContent.length > 0;
  
  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg relative min-h-[600px] flex flex-col">
      {hasContent && (
        <button
          onClick={onDownloadAll}
          className="absolute top-6 right-6 flex items-center bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:bg-emerald-600 hover:shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105"
        >
          <DownloadIcon className="h-4 w-4 mr-2" />
          下载全部
        </button>
      )}

      <div className="flex-grow prose prose-slate dark:prose-invert max-w-none">
        {isLoading && (
          <div className="text-center my-8">
            <div className="flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="ml-4 text-lg text-slate-500 dark:text-slate-400">{progress || '正在生成您的专属课程内容...'}</p>
            </div>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">已生成的内容会立即显示在下方。</p>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center text-center my-8">
             <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">发生错误!</strong>
                <span className="block sm:inline ml-2">{error}</span>
            </div>
          </div>
        )}
        {!isLoading && !error && !hasContent && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-slate-400 dark:text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-medium">您的课程内容将在这里生成</h3>
                <p className="mt-2 max-w-md mx-auto">请在左侧添加并填写课程参数，然后点击“生成课程”按钮。</p>
            </div>
          </div>
        )}
        {hasContent && (
            <article>
               {generatedContent.map((item, index) => (
                  <React.Fragment key={item.courseId}>
                    <div className="relative group pt-4">
                      <button
                        onClick={() => onDownloadSingle(item.courseId)}
                        className="absolute top-2 right-0 flex items-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold py-1 px-3 rounded-full transition-all duration-300 ease-in-out shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 hover:shadow-md opacity-0 group-hover:opacity-100"
                        title={`下载 "${item.skill}"`}
                      >
                        <DownloadIcon className="h-4 w-4 mr-1" />
                        下载
                      </button>
                      {formatSingleContent(item.content)}
                    </div>
                    {index < generatedContent.length - 1 && (
                      <hr className="my-12 border-slate-300 dark:border-slate-600 border-dashed" />
                    )}
                  </React.Fragment>
               ))}
            </article>
        )}
      </div>
    </div>
  );
};