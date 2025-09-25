import React, { useState, useCallback, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { KnowledgeBaseManager } from './components/KnowledgeBaseManager';
import { generateCourseContent, parseCoursesFromText } from './services/geminiService';
import { downloadAsWord } from './utils/fileUtils';
import type { CourseInput, KnowledgeFile, GeneratedCourseContent } from './types';

// Declare global libraries loaded from CDN
declare var mammoth: any;
declare var pdfjsLib: any;


const App: React.FC = () => {
  const [page, setPage] = useState<'generator' | 'knowledge'>('generator');
  const [courses, setCourses] = useState<CourseInput[]>([
    { id: Date.now(), skill: '情绪识别', ageGroup: '3-5岁' }
  ]);
  
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<number>>(new Set());

  const [generatedContent, setGeneratedContent] = useState<GeneratedCourseContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs';
    }
  }, []);
  
  const handleAddKnowledgeFile = async (file: File) => {
    setError(null);
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const newFile: KnowledgeFile = {
      id: Date.now() + Math.random(),
      file: file,
      content: null,
      status: 'pending',
      contentType: 'text',
    };
    
    setKnowledgeFiles(prev => [...prev, newFile]);

    const updateFileState = (id: number, updates: Partial<KnowledgeFile>) => {
        setKnowledgeFiles(prev => prev.map(kf => kf.id === id ? { ...kf, ...updates } : kf));
    };

    try {
      const reader = new FileReader();

      if (fileExtension === 'txt' || fileExtension === 'md') {
        reader.onload = (e) => updateFileState(newFile.id, { content: e.target?.result as string, status: 'loaded', contentType: 'text' });
        reader.readAsText(file);
      } else if (fileExtension === 'pdf' && typeof pdfjsLib !== 'undefined') {
          reader.onload = async (e) => {
              const arrayBuffer = e.target?.result as ArrayBuffer;
              const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
              let fullText = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                  const page = await pdf.getPage(i);
                  const textContent = await page.getTextContent();
                  fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
              }
              updateFileState(newFile.id, { content: fullText, status: 'loaded', contentType: 'text' });
          };
          reader.readAsArrayBuffer(file);
      } else if ((fileExtension === 'docx') && typeof mammoth !== 'undefined') {
          reader.onload = async (e) => {
              const arrayBuffer = e.target?.result as ArrayBuffer;
              const result = await mammoth.convertToHtml({ arrayBuffer });
              updateFileState(newFile.id, { content: result.value, status: 'loaded', contentType: 'html' });
          };
          reader.readAsArrayBuffer(file);
      } else {
        updateFileState(newFile.id, { status: 'unsupported' });
      }
      reader.onerror = () => updateFileState(newFile.id, { status: 'error' });
    } catch (e) {
      console.error("Error processing file:", e);
      updateFileState(newFile.id, { status: 'error' });
    }
  };

  const handleDeleteKnowledgeFile = (id: number) => {
    setKnowledgeFiles(prev => prev.filter(file => file.id !== id));
    setSelectedFileIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
    });
  };

  const handleUpdateKnowledgeFileContent = (id: number, newContent: string) => {
    setKnowledgeFiles(prev => prev.map(kf => kf.id === id ? { ...kf, content: newContent } : kf));
  };

  const handleToggleFileSelection = (id: number) => {
      setSelectedFileIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) {
              newSet.delete(id);
          } else {
              newSet.add(id);
          }
          return newSet;
      });
  };

  const handleTextBatchImport = async (text: string) => {
    if (!text.trim()) return;
    setError(null);
    setIsParsing(true);
    try {
      const parsedCourses = await parseCoursesFromText(text);
      if (parsedCourses && parsedCourses.length > 0) {
        const newCourses: CourseInput[] = parsedCourses.map(course => ({
          id: Date.now() + Math.random(),
          skill: course.skill,
          ageGroup: course.ageGroup,
        }));

        setCourses(prev => {
          const filteredPrev = prev.filter(c => c.skill.trim() || c.ageGroup.trim());
          return [...filteredPrev, ...newCourses];
        });
      } else {
        setError('无法从文本中解析出课程信息。 (Could not parse any course information from the text.)');
      }
    } catch (err) {
      const errorMessage = '解析失败，已多次尝试但API仍无响应。请检查您的账户状态或稍后再试。';
      setError(errorMessage);
    } finally {
      setIsParsing(false);
    }
  };


  const handleFileBatchImport = (file: File) => {
    setError(null);
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'txt' && extension !== 'csv') {
      setError("请上传 .txt 或 .csv 格式的批量导入文件。 (Please upload a .txt or .csv file for batch import.)");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      await handleTextBatchImport(text);
    };
    reader.onerror = () => {
      setError('读取批量导入文件失败。 (Failed to read batch import file.)');
    };
    reader.readAsText(file);
  };
  
  const handleClearCourses = () => {
    setCourses([]);
  };

  const handleGenerate = useCallback(async () => {
    if (courses.length === 0 || courses.every(c => !c.skill || !c.ageGroup)) {
      setError('请至少添加一个有效的课程进行生成。 (Please add at least one valid course to generate.)');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedContent([]);
    setProgress('');
    
    const knowledgeBase = knowledgeFiles
      .filter(file => selectedFileIds.has(file.id) && file.content)
      .map(file => {
          let content = file.content || '';
          if (file.contentType === 'html') {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = content;
              content = tempDiv.textContent || tempDiv.innerText || '';
          }
          return `--- 内容来源: ${file.file.name} ---\n${content}`
      })
      .join('\n\n');

    try {
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        if (!course.skill || !course.ageGroup) continue;
        setProgress(`正在生成 ${i + 1} / ${courses.length}: ${course.skill}...`);
        const content = await generateCourseContent(
          course.skill,
          course.ageGroup,
          knowledgeBase
        );
        
        const newContent: GeneratedCourseContent = {
          courseId: course.id,
          skill: course.skill,
          ageGroup: course.ageGroup,
          content: content,
        };
        setGeneratedContent(prev => [...prev, newContent]);

        // Add a delay between API calls to avoid rate limiting, but not after the last one.
        if (i < courses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    } catch (err) {
       setError('生成失败，已多次尝试但仍超出API用量限制。请检查您的账户方案或稍后再试。');
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  }, [courses, knowledgeFiles, selectedFileIds]);

  const handleDownloadAll = () => {
    if (generatedContent.length > 0) {
        const combinedContent = generatedContent.map(c => c.content).join('\n\n<--PAGE_BREAK-->\n\n');
        const filename = `SEL-课程-批量生成.doc`;
        downloadAsWord(combinedContent, filename);
    }
  };
  
  const handleDownloadSingle = (courseId: number) => {
      const course = generatedContent.find(c => c.courseId === courseId);
      if (course) {
          const filename = `SEL-课程-${course.skill.replace(/ /g, '_')}.doc`;
          downloadAsWord(course.content, filename);
      }
  };
  
  const NavLink: React.FC<{
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm sm:text-base font-medium transition-colors rounded-md ${
            active
                ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
    >
        {children}
    </button>
  );

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200">
      <header className="bg-white/80 dark:bg-slate-800/80 shadow-md backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                <h1 className="text-xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                SEL 课程生成器
                </h1>
                <nav className="flex items-center space-x-2 sm:space-x-4">
                  <NavLink active={page === 'generator'} onClick={() => setPage('generator')}>课程生成</NavLink>
                  <NavLink active={page === 'knowledge'} onClick={() => setPage('knowledge')}>知识库管理</NavLink>
                </nav>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {page === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 xl:col-span-3">
              <InputForm
                courses={courses}
                setCourses={setCourses}
                onGenerate={handleGenerate}
                isLoading={isLoading}
                isParsing={isParsing}
                onTextBatchImport={handleTextBatchImport}
                onFileBatchImport={handleFileBatchImport}
                onClearCourses={handleClearCourses}
                knowledgeFiles={knowledgeFiles}
                selectedFileIds={selectedFileIds}
                onToggleFileSelection={handleToggleFileSelection}
                onManageKnowledge={() => setPage('knowledge')}
              />
            </div>
            <div className="lg:col-span-8 xl:col-span-9">
              <OutputDisplay
                isLoading={isLoading}
                progress={progress}
                error={error}
                generatedContent={generatedContent}
                onDownloadAll={handleDownloadAll}
                onDownloadSingle={handleDownloadSingle}
              />
            </div>
          </div>
        )}
        {page === 'knowledge' && (
           <KnowledgeBaseManager 
              files={knowledgeFiles}
              onAddFile={handleAddKnowledgeFile}
              onDeleteFile={handleDeleteKnowledgeFile}
              onUpdateContent={handleUpdateKnowledgeFileContent}
           />
        )}
      </main>
    </div>
  );
};

export default App;