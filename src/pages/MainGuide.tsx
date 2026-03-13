import { useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { guideData } from '../data/guide';
import { clsx } from 'clsx';
import { ChevronRight, BookOpen, Clock, Target, Lightbulb, Zap, ShieldCheck } from 'lucide-react';

export default function MainGuide() {
  const [activeSection, setActiveSection] = useState(guideData[0].id);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Intersection Observer to update active section on scroll
  useEffect(() => {
    const mainContainer = document.getElementById('main-scroll-container');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        root: mainContainer,
        rootMargin: '-10% 0px -80% 0px' 
      }
    );

    guideData.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    const mainContainer = document.getElementById('main-scroll-container');
    
    if (element && mainContainer) {
      // Calculate offset relative to the main container
      const y = element.getBoundingClientRect().top + mainContainer.scrollTop - mainContainer.getBoundingClientRect().top - 40;
      mainContainer.scrollTo({ top: y, behavior: 'smooth' });
    } else if (element) {
      // Fallback
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-16 max-w-7xl mx-auto"
    >
      {/* Reading Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-emerald-500 z-[60] origin-left"
        style={{ scaleX }}
      />

      <header className="mb-12">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 border border-emerald-100 shadow-sm">
          <BookOpen size={14} />
          <span>Core Strategy</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 mb-6 leading-[1.1]">
          The Profit-Lock™ <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Method Guide
          </span>
        </h1>
        <p className="text-[17px] md:text-2xl text-neutral-500 font-light max-w-3xl leading-relaxed">
          The exact strategy and implementation steps to turn your WhatsApp into a high-converting sales channel.
        </p>
        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center gap-2 text-[12px] font-bold text-neutral-400 uppercase tracking-widest">
            <Clock size={14} />
            <span>12 min read</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-neutral-300"></div>
          <div className="flex items-center gap-2 text-[12px] font-bold text-neutral-400 uppercase tracking-widest">
            <Target size={14} />
            <span>Practical Implementation</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 items-start relative">
        
        {/* Mobile TOC - Horizontal Scroll */}
        <div className="lg:hidden sticky top-[68px] z-30 bg-neutral-50/95 backdrop-blur-xl -mx-4 px-4 py-3 border-b border-neutral-200/50 mb-6 overflow-x-auto no-scrollbar flex gap-3 whitespace-nowrap">
          {guideData.map((section, index) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={clsx(
                  "px-4 py-2.5 rounded-full text-[13px] font-bold transition-all flex items-center gap-2 shrink-0 active:scale-95",
                  isActive 
                    ? "bg-neutral-900 text-white shadow-md" 
                    : "bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                )}
              >
                <span className="opacity-50 text-[11px]">{index + 1}</span>
                {section.title}
              </button>
            );
          })}
        </div>
        
        {/* Sticky TOC for Desktop */}
        <div className="hidden lg:block w-72 shrink-0 sticky top-[100px]">
          <div className="bg-white border border-neutral-200 rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6 px-2">Table of Contents</h3>
            <nav className="space-y-1.5 relative">
              {/* Active indicator line */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-100 rounded-full"></div>
              
              {guideData.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={clsx(
                      "w-full text-left px-4 py-3 rounded-2xl text-[14px] font-bold transition-all flex items-center justify-between group relative",
                      isActive 
                        ? "bg-neutral-900 text-white shadow-md ml-2" 
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 ml-2"
                    )}
                  >
                    {/* Active dot on the line */}
                    {isActive && (
                      <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500"></div>
                    )}
                    <span className="truncate pr-2">{section.title}</span>
                    <ChevronRight size={16} className={clsx(
                      "transition-transform",
                      isActive ? "text-emerald-400" : "text-transparent group-hover:text-neutral-300"
                    )} />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full bg-white border border-neutral-200 rounded-[2rem] shadow-sm overflow-hidden">
          {guideData.map((section, index) => (
            <div 
              key={section.id} 
              id={section.id}
              className={clsx(
                "p-6 sm:p-8 md:p-12 lg:p-16",
                index !== guideData.length - 1 ? "border-b border-neutral-100" : ""
              )}
            >
              <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg md:text-xl">
                  {index + 1}
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-neutral-900 tracking-tight">{section.title}</h2>
              </div>
              
              <div className="prose prose-lg prose-neutral max-w-none 
                prose-p:leading-relaxed prose-p:text-neutral-600 prose-p:text-[17px]
                prose-headings:text-neutral-900 prose-headings:tracking-tight
                prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
                prose-a:text-emerald-600 hover:prose-a:text-emerald-700 prose-a:font-semibold
                prose-strong:text-neutral-900 prose-strong:font-bold
                prose-ul:my-6 prose-li:text-neutral-600 prose-li:text-[17px] prose-li:marker:text-emerald-500
                prose-blockquote:border-l-emerald-500 prose-blockquote:bg-emerald-50/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:text-neutral-700 prose-blockquote:not-italic prose-blockquote:font-medium"
              >
                {section.content.split('\n\n').map((paragraph, i) => {
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return <h3 key={i}>{paragraph.replace(/\*\*/g, '')}</h3>;
                  }
                  if (paragraph.startsWith('PRO TIP:')) {
                    return (
                      <div key={i} className="my-8 bg-amber-50 border border-amber-100 rounded-3xl p-6 md:p-8 flex gap-4 md:gap-6 group">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Lightbulb size={24} />
                        </div>
                        <div>
                          <h4 className="text-amber-900 font-bold mb-1 text-lg">Pro Tip</h4>
                          <p className="text-amber-800/80 text-[15px] leading-relaxed font-medium">{paragraph.replace('PRO TIP:', '').trim()}</p>
                        </div>
                      </div>
                    );
                  }
                  if (paragraph.startsWith('ACTION:')) {
                    return (
                      <div key={i} className="my-8 bg-emerald-50 border border-emerald-100 rounded-3xl p-6 md:p-8 flex gap-4 md:gap-6 group">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Zap size={24} />
                        </div>
                        <div>
                          <h4 className="text-emerald-900 font-bold mb-1 text-lg">Implementation Step</h4>
                          <p className="text-emerald-800/80 text-[15px] leading-relaxed font-medium">{paragraph.replace('ACTION:', '').trim()}</p>
                        </div>
                      </div>
                    );
                  }
                  if (paragraph.startsWith('> ')) {
                    return <blockquote key={i}>{paragraph.replace('> ', '')}</blockquote>;
                  }
                  if (paragraph.startsWith('- ')) {
                    return (
                      <ul key={i}>
                        {paragraph.split('\n').map((item, j) => (
                          <li key={j}>{item.replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={i}>{paragraph}</p>;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
