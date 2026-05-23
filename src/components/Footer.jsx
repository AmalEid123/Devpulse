import { Link } from 'react-router-dom';
import { Code2, MessageCircle, FileText, Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-footer)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-[var(--color-primary)]">DevPulse</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Empowering the open-source community with intelligent insights.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
              <FileText className="w-4 h-4" /> Docs
            </a>
            <a href="#" className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
              <MessageCircle className="w-4 h-4" /> Discord
            </a>
            <a href="#" className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
              <Code2 className="w-4 h-4" /> GitHub
            </a>
            <a href="#" className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
              <Activity className="w-4 h-4" /> API
            </a>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
          2026 DevPulse. All rights reserved.
        </div>
      </div>
    </footer>
  );
}