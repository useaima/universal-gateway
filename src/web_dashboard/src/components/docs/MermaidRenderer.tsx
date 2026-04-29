import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    primaryColor: '#fffaf1',
    primaryTextColor: '#2b2b2b',
    primaryBorderColor: '#eadfcf',
    lineColor: '#cfa95d',
    secondaryColor: '#fff8ea',
    tertiaryColor: '#fff',
  },
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis'
  }
});

export default function MermaidRenderer({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    const renderChart = async () => {
      try {
        const id = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvgContent(svg);
      } catch (error) {
        console.error("Failed to render Mermaid chart", error);
      }
    };
    renderChart();
  }, [chart]);

  return (
    <div 
      ref={ref} 
      className="mermaid-wrapper flex justify-center py-6 overflow-x-auto w-full"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
