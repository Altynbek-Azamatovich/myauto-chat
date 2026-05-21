import { useEffect } from 'react';

interface Props {
  title: string;
  content: string;
}

export default function LegalDoc({ title, content }: Props) {
  useEffect(() => {
    document.title = `${title} — myAuto`;
  }, [title]);

  const lines = content.split('\n');
  const blocks: JSX.Element[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={key++} className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-6">
          {line.slice(2)}
        </h1>
      );
      i++;
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={key++} className="text-xl sm:text-2xl font-semibold text-neutral-900 mt-8 mb-3">
          {line.slice(3)}
        </h2>
      );
      i++;
    } else if (line.startsWith('---')) {
      blocks.push(<hr key={key++} className="my-8 border-neutral-200" />);
      i++;
    } else if (line.startsWith('• ') || line.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith('• ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="list-disc pl-6 space-y-2 text-[15px] sm:text-base text-neutral-700 leading-relaxed mb-4">
          {items.map((it, idx) => <li key={idx}>{it}</li>)}
        </ul>
      );
    } else if (line.trim() === '') {
      i++;
    } else {
      blocks.push(
        <p key={key++} className="text-[15px] sm:text-base text-neutral-700 leading-relaxed mb-4">
          {line}
        </p>
      );
      i++;
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
        {blocks}
      </div>
    </div>
  );
}
