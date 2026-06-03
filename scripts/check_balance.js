const fs = require('fs');
const path = process.argv[2];
const src = fs.readFileSync(path, 'utf8');
let stack = [];
let inSingle=false, inDouble=false, inTemplate=false, inComment=false;
for (let i=0;i<src.length;i++){
  const ch = src[i];
  const prev = src[i-1];
  // handle comment start/end (simple)
  if (!inSingle && !inDouble && !inTemplate) {
    if (!inComment && ch==='/' && src[i+1]==='*') { inComment=true; i++; continue; }
    if (inComment && ch==='*' && src[i+1]==='/') { inComment=false; i++; continue; }
  }
  if (inComment) continue;
  if (!inSingle && !inDouble && !inTemplate) {
    if (ch==="'") { inSingle=true; continue; }
    if (ch==='"') { inDouble=true; continue; }
    if (ch==='`') { inTemplate=true; continue; }
  } else {
    if (inSingle && ch==="'" && prev!=="\\") { inSingle=false; continue; }
    if (inDouble && ch==='"' && prev!=="\\") { inDouble=false; continue; }
    if (inTemplate && ch==='`' && prev!=="\\") { inTemplate=false; continue; }
    continue;
  }
  if (ch==='('||ch==='{'||ch==='[') stack.push({ch, i});
  if (ch===')'||ch==='}'||ch===']'){
    const last = stack.pop();
    if (!last){
      console.log('Unmatched closing', ch, 'at', i);
      process.exit(0);
    }
    const match = (last.ch==='('&&ch===')')||(last.ch==='{'&&ch==='}')||(last.ch==='['&&ch===']');
    if (!match){
      console.log('Mismatched', last.ch, 'with', ch, 'at', i);
      process.exit(0);
    }
  }
}
if (stack.length) {
  console.log('Unclosed tokens:');
  stack.forEach(s=>console.log(s.ch+' at '+s.i));
} else console.log('All good');
