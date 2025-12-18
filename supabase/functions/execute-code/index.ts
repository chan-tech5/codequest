import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple code execution simulator (for MVP - replace with Judge0 API in production)
const executeCode = (code: string, language: string): { output?: string; error?: string } => {
  try {
    // For Python, simulate basic print statements
    if (language === 'python') {
      const printMatches = code.matchAll(/print\s*\(\s*["']([^"']*)["']\s*\)/g);
      const outputs: string[] = [];
      
      for (const match of printMatches) {
        outputs.push(match[1]);
      }
      
      // Handle f-strings and expressions simplistically
      const fStringMatches = code.matchAll(/print\s*\(\s*f["']([^"']*)["']\s*\)/g);
      for (const match of fStringMatches) {
        outputs.push(match[1].replace(/\{[^}]+\}/g, '[value]'));
      }
      
      if (outputs.length > 0) {
        return { output: outputs.join('\n') };
      }
      
      return { output: 'Code executed successfully (no output)' };
    }
    
    // For JavaScript
    if (language === 'javascript') {
      const logMatches = code.matchAll(/console\.log\s*\(\s*["']([^"']*)["']\s*\)/g);
      const outputs: string[] = [];
      
      for (const match of logMatches) {
        outputs.push(match[1]);
      }
      
      if (outputs.length > 0) {
        return { output: outputs.join('\n') };
      }
      
      return { output: 'Code executed successfully (no output)' };
    }
    
    return { output: 'Language not fully supported in demo mode' };
  } catch (e) {
    return { error: `Execution error: ${String(e)}` };
  }
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language } = await req.json();
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'No code provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Executing ${language} code:`, code.substring(0, 100));
    
    const result = executeCode(code, language || 'python');
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to execute code' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
