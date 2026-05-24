with open('app/page.tsx', 'r') as f:
    lines = f.readlines()

new_content = """        {/* Editorial Horizontal Flow - No Vertical Cards */}
        <motion.div 
          className="flex flex-col border border-border/40 rounded-[32px] overflow-hidden shadow-2xl relative z-10 bg-surface/30"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Top Row: The Old Way */}
          <motion.div 
            className="flex flex-col md:flex-row items-stretch border-b border-border/40"
            variants={cardVariants}
          >
            <div className="md:w-[40%] p-8 md:p-12 bg-surface/80 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/40">
              <div className="inline-flex items-center space-x-2 text-error/80 mb-4">
                <XCircle className="w-5 h-5" />
                <span className="font-bold tracking-widest text-[10px] uppercase">The Standard Way</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif text-text-muted mb-3">Lost in the noise</h3>
              <p className="text-sm md:text-base text-text-muted/70 leading-relaxed">
                Recruiters spend an average of 6 seconds scanning a resume. Standard templates list technologies but fail to show actual engineering competence, resulting in immediate rejection.
              </p>
            </div>
            
            <div className="md:w-[60%] p-8 md:p-12 bg-bg-base flex flex-col justify-center space-y-4 relative">
              {/* Feature list horizontally structured */}
              <div className="bg-surface/50 p-4 rounded-2xl border border-border/30 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <div className="w-1.5 h-1.5 rounded-full bg-error/50 shrink-0 hidden sm:block" />
                <div className="flex-1">
                  <span className="text-error/80 text-xs font-bold block mb-1">Vague Bullet Points</span>
                  <span className="text-text-muted text-sm font-medium">Describes effort, not outcomes. Missing critical metrics.</span>
                </div>
              </div>
              <div className="bg-surface/50 p-4 rounded-2xl border border-border/30 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <div className="w-1.5 h-1.5 rounded-full bg-error/50 shrink-0 hidden sm:block" />
                <div className="flex-1">
                  <span className="text-error/80 text-xs font-bold block mb-1">ATS Parsing Failures</span>
                  <span className="text-text-muted text-sm font-medium">Visual templates from Canva choke legacy recruitment software.</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Row: The ATSLift Engine */}
          <motion.div 
            className="flex flex-col md:flex-row items-stretch bg-gradient-to-br from-surface to-primary/5 relative overflow-hidden"
            variants={cardVariants}
          >
            {/* Ambient Glow */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="md:w-[40%] p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-primary/10 relative z-10">
              <div className="inline-flex items-center space-x-2 text-primary mb-4">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="font-bold tracking-widest text-[10px] uppercase">The ATSLift Engine</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-serif text-text mb-3">Hiring signal amplified</h3>
              <p className="text-sm md:text-base text-text-muted leading-relaxed mb-6">
                We restructure your raw experience into the exact format tech recruiters and automated parsers search for.
              </p>
              <div className="w-fit inline-flex items-center px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-bold tracking-widest uppercase shadow-sm transition-all duration-300">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span>Higher Selection Rate</span>
              </div>
            </div>
            
            <div className="md:w-[60%] p-8 md:p-12 flex flex-col justify-center space-y-4 relative z-10">
              <div className="bg-surface p-5 rounded-2xl border border-primary/20 shadow-[0_8px_30px_rgba(1,105,111,0.06)] flex items-start sm:items-center space-x-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-primary text-xs font-bold uppercase tracking-wider block mb-1">Quantified Impact & Outcomes</span>
                  <span className="text-text text-sm font-medium">Metrics, scale, and engineering decisions are extracted and highlighted.</span>
                </div>
              </div>
              <div className="bg-surface p-5 rounded-2xl border border-primary/20 shadow-[0_8px_30px_rgba(1,105,111,0.06)] flex items-start sm:items-center space-x-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-primary text-xs font-bold uppercase tracking-wider block mb-1">Recruiter-Optimized Structure</span>
                  <span className="text-text text-sm font-medium">Reordered to show your strongest technical signals in the first 6 seconds.</span>
                </div>
              </div>
              <div className="bg-surface p-5 rounded-2xl border border-primary/20 shadow-[0_8px_30px_rgba(1,105,111,0.06)] flex items-start sm:items-center space-x-4 transition-transform hover:-translate-y-1 duration-300">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-primary text-xs font-bold uppercase tracking-wider block mb-1">100% Parser Safe Output</span>
                  <span className="text-text text-sm font-medium">Clean, structured output that passes all legacy and modern ATS filters.</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>\n"""

lines[267:411] = [new_content]

with open('app/page.tsx', 'w') as f:
    f.writelines(lines)
