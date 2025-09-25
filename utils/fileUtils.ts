function processSingleMarkdownToHtml(markdown: string): string {
  let finalHtml = '';
  let inList = false;
  
  const originalLines = markdown.split('\n');

  originalLines.forEach(line => {
    if (line.trim() === '') {
        if (inList) {
            finalHtml += '</ul>';
            inList = false;
        }
        return;
    }

    if (line.startsWith('1. 本堂课标题：')) {
        if (inList) { finalHtml += '</ul>'; inList = false; }
        const title = line.substring(line.indexOf('：') + 1);
        finalHtml += `<h1>${title}</h1>`;
        return;
    }
    
    if (/^\d+\.\s(.+?)$/.test(line)) {
        if(inList) { finalHtml += '</ul>'; inList = false; }
        finalHtml += `<h2>${line.substring(line.indexOf(' ')+1)}</h2>`;
    } else if (/^[\*\-]\s(.*)$/.test(line)) {
        if(!inList) { finalHtml += '<ul>'; inList = true; }
        finalHtml += `<li>${line.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`;
    } else {
        if(inList) { finalHtml += '</ul>'; inList = false; }
        finalHtml += `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
    }
  });

  if(inList) { finalHtml += '</ul>'; }

  return finalHtml;
}


function markdownToHtml(markdown: string): string {
  const courseContents = markdown.split('<--PAGE_BREAK-->');
  const allCoursesHtml = courseContents.map((content, index) => {
      const singleHtml = processSingleMarkdownToHtml(content.trim());
      if (index > 0) {
          return `<br style="page-break-before: always">${singleHtml}`;
      }
      return singleHtml;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.6; font-size: 12pt; }
          h1, h2, h3 { font-family: 'Arial', sans-serif; color: #333; }
          h1 { font-size: 22pt; text-align: center; margin-bottom: 1.5em; }
          h2 { font-size: 16pt; margin-top: 1.5em; margin-bottom: 0.8em; border-bottom: 1px solid #ccc; padding-bottom: 0.3em; }
          p { margin-bottom: 1em; }
          ul { margin-left: 20px; padding-left: 20px; }
          li { margin-bottom: 0.5em; }
          strong { font-weight: bold; }
        </style>
      </head>
      <body>
        ${allCoursesHtml}
      </body>
    </html>
  `;
}


export function downloadAsWord(content: string, filename: string) {
  const htmlContent = markdownToHtml(content);
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
