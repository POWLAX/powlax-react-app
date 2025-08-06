#!/usr/bin/env node

/**
 * Monitors Claude Code usage patterns and suggests relevant commands
 * Usage: node claude-tips-monitor.js "your input text here"
 */

class ClaudeTipsMonitor {
  constructor() {
    this.patterns = {
      workflowStart: {
        patterns: [
          /begin working/i,
          /start.*task/i,
          /working on/i,
          /let's (start|begin)/i,
          /I'm going to/i,
          /going to work on/i
        ],
        command: '/workflow-start',
        message: '💡 Starting new work? Use the Explore→Plan→Execute approach.\nTry: `claude /workflow-start` for guidance.'
      },
      
      needsPlanning: {
        patterns: [
          /how should (we|I)/i,
          /what's the best way/i,
          /architecture/i,
          /plan.*approach/i,
          /design.*system/i,
          /structure.*this/i
        ],
        command: '/workflow-plan',
        message: '🎯 Planning phase detected. Get structured approach with risk assessment.\nTry: `claude /workflow-plan`'
      },
      
      contextIssues: {
        patterns: [
          /context.*full/i,
          /token.*limit/i,
          /running out.*space/i,
          /confused/i,
          /Claude.*lost/i,
          /doesn't.*understand/i
        ],
        command: '/context-rescue',
        message: '🚨 Context window issues? Don\'t use compact - use better strategies.\nTry: `claude /context-rescue`'
      },
      
      qualityNeeded: {
        patterns: [
          /review/i,
          /check.*code/i,
          /does this look/i,
          /is this.*good/i,
          /quality/i,
          /test.*this/i
        ],
        command: '/quality-check',
        message: '🔍 Ready for quality review? Use comprehensive quality guidelines.\nTry: `claude /quality-check`'
      },
      
      needsHandoff: {
        patterns: [
          /(done|finished|complete)/i,
          /ready.*(for|to)/i,
          /what's next/i,
          /handoff/i,
          /pass.*along/i,
          /next.*developer/i
        ],
        command: '/workflow-review',
        message: '✅ Task completion detected. Prepare proper handoff documentation.\nTry: `claude /workflow-review`'
      }
    };
  }

  analyzeInput(text) {
    const suggestions = [];
    
    for (const [category, config] of Object.entries(this.patterns)) {
      if (config.patterns.some(pattern => pattern.test(text))) {
        suggestions.push({
          category,
          command: config.command,
          message: config.message
        });
      }
    }
    
    return suggestions;
  }

  formatOutput(suggestions) {
    if (suggestions.length === 0) {
      return '';
    }

    let output = '\n📋 Claude Code Workflow Tips:\n';
    output += '=' .repeat(40) + '\n';
    
    suggestions.forEach((suggestion, index) => {
      output += `\n${suggestion.message}\n`;
      if (index < suggestions.length - 1) {
        output += '-'.repeat(40) + '\n';
      }
    });
    
    output += '\n' + '='.repeat(40);
    return output;
  }
}

// CLI Usage
if (require.main === module) {
  const monitor = new ClaudeTipsMonitor();
  const input = process.argv.slice(2).join(' ');
  
  if (!input) {
    console.log('Usage: node claude-tips-monitor.js "your input text here"');
    console.log('\nExample: node claude-tips-monitor.js "I\'m going to start working on authentication"');
    process.exit(1);
  }
  
  const suggestions = monitor.analyzeInput(input);
  const output = monitor.formatOutput(suggestions);
  
  if (output) {
    console.log(output);
  } else {
    console.log('💬 No specific workflow tips detected for this input.');
  }
}

module.exports = ClaudeTipsMonitor;