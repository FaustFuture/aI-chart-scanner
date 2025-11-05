"use client";

import ReactMarkdown from "react-markdown";

type MarkdownRendererProps = {
	content: string;
	className?: string;
};

export function MarkdownRenderer({
	content,
	className = "",
}: MarkdownRendererProps) {
	return (
		<div className={`markdown-content ${className}`}>
			<ReactMarkdown
				components={{
					h1: ({ children }) => (
						<h1 className="text-2xl font-bold text-white mt-4 mb-2">
							{children}
						</h1>
					),
					h2: ({ children }) => (
						<h2 className="text-xl font-bold text-white mt-4 mb-2">
							{children}
						</h2>
					),
					h3: ({ children }) => (
						<h3 className="text-lg font-semibold text-white mt-3 mb-2">
							{children}
						</h3>
					),
					h4: ({ children }) => (
						<h4 className="text-base font-semibold text-white mt-2 mb-1">
							{children}
						</h4>
					),
					p: ({ children }) => (
						<p className="text-sm text-[#E0E0E0] mb-2 leading-relaxed">
							{children}
						</p>
					),
					ul: ({ children }) => (
						<ul className="list-disc list-inside text-sm text-[#E0E0E0] mb-2 ml-4 space-y-1">
							{children}
						</ul>
					),
					ol: ({ children }) => (
						<ol className="list-decimal list-inside text-sm text-[#E0E0E0] mb-2 ml-4 space-y-1">
							{children}
						</ol>
					),
					li: ({ children }) => (
						<li className="text-sm text-[#E0E0E0] leading-relaxed">
							{children}
						</li>
					),
					strong: ({ children }) => (
						<strong className="font-semibold text-white">{children}</strong>
					),
					em: ({ children }) => (
						<em className="italic text-[#E0E0E0]">{children}</em>
					),
					code: ({ children }) => (
						<code className="bg-[#2A2A2A] text-[#FFD700] px-1 py-0.5 rounded text-xs font-mono">
							{children}
						</code>
					),
					pre: ({ children }) => (
						<pre className="bg-[#2A2A2A] p-3 rounded-lg overflow-x-auto mb-2 border border-[#424242]">
							{children}
						</pre>
					),
					blockquote: ({ children }) => (
						<blockquote className="border-l-4 border-[#FFD700] pl-4 italic text-[#B0B0B0] my-2">
							{children}
						</blockquote>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}

