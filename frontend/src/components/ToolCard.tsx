import React from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { PDFTool } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ToolCardProps {
  tool: PDFTool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  // @ts-ignore
  const Icon = LucideIcons[tool.icon] || LucideIcons.File;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={tool.href}
        className="group relative flex flex-col items-start rounded-[12px] border border-zinc-200 bg-white p-6 transition-all hover:border-brand hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]"
      >
        {tool.id === 'ocr' && (
          <span className="absolute top-3 right-3 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
            New
          </span>
        )}
        <div className="mb-4 flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-rose-50 text-brand">
          <Icon size={24} strokeWidth={2} />
        </div>
        <h3 className="mb-1 text-[16px] font-bold text-zinc-900 group-hover:text-brand transition-colors">
          {tool.name}
        </h3>
        <p className="text-[12px] leading-relaxed text-zinc-500">
          {tool.description}
        </p>
      </Link>
    </motion.div>
  );
}
