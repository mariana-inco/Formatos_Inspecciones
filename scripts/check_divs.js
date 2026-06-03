const fs=require('fs');
const s=fs.readFileSync(process.argv[2],'utf8');
let inSingle=false,inDouble=false,inTemplate=false,inComment=false;
let idx=0;const stack=[];
while(idx<s.length){
  const ch=s[idx];
  const next=s.slice(idx,idx+6);
  const prev=s[idx-1];
  if(!inSingle && !inDouble && !inTemplate){
    if(!inComment && ch==='/' && s[idx+1]==='*'){ inComment=true; idx+=2; continue; }
    if(inComment && ch==='*' && s[idx+1]==='/'){ inComment=false; idx+=2; continue; }
  }
  if(inComment){ idx++; continue; }
  if(!inSingle && !inDouble && !inTemplate){
    if(ch==="'") { inSingle=true; idx++; continue; }
    if(ch==='"') { inDouble=true; idx++; continue; }
    if(ch==='`') { inTemplate=true; idx++; continue; }
  } else {
    if(inSingle && ch==="'" && prev!=='\\'){ inSingle=false; idx++; continue; }
    if(inDouble && ch==='"' && prev!=='\\'){ inDouble=false; idx++; continue; }
    if(inTemplate && ch==='`' && prev!=='\\'){ inTemplate=false; idx++; continue; }
    idx++; continue;
  }
  if(next.startsWith('<div') && /<div[\s>]/.test(next)){
    stack.push({pos:idx}); idx+=4; continue;
  }
  if(next.startsWith('</div>')){ if(stack.length===0){ console.log('extra closing at',idx); process.exit(0);} stack.pop(); idx+=6; continue; }
  idx++;
}
if(stack.length) console.log('unclosed <div> at pos',stack[stack.length-1].pos);
else console.log('all divs closed');
