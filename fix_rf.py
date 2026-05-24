import os
import re

files = [
    "app/adminpanel/page.tsx",
    "app/result/[resumeId]/page.tsx",
    "app/success/[resumeId]/page.tsx",
    "app/dashboard/page.tsx",
    "app/build/page.tsx",
    "app/login/page.tsx"
]

def update_file(filepath):
    if not os.path.exists(filepath):
        return
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    # Replace the text: Resume<span className="...">Forge</span>
    content = re.sub(
        r'Resume<span className="([^"]*)">Forge</span>',
        r'ATS<span className="\1">Lift</span>',
        content
    )
    
    # Replace the circle RF logo with the img logo
    content = re.sub(
        r'<Link href="/" className="[^"]*rounded-full[^"]*">\s*RF\s*</Link>',
        r'<Link href="/" className="flex items-center justify-center">\n            <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain" />\n          </Link>',
        content
    )
    
    content = re.sub(
        r'<div className="[^"]*rounded-full[^"]*">\s*RF\s*</div>',
        r'<div className="flex items-center justify-center">\n            <img src="/logo.png" alt="ATSLift Logo" className="w-8 h-8 rounded-md object-contain" />\n          </div>',
        content
    )

    # Also replace plain "ResumeForge" if it exists anywhere
    content = content.replace("ResumeForge", "ATSLift")
    
    with open(filepath, 'w') as f:
        f.write(content)

for f in files:
    update_file(f)
