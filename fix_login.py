import re

# 1. Update app/page.tsx
with open('app/page.tsx', 'r') as f:
    page_content = f.read()

# Remove getLocalSession import and add getSession from next-auth/react
page_content = page_content.replace(
    'import { getLocalSession } from "@/lib/authClient";',
    'import { getSession } from "next-auth/react";'
)

page_content = page_content.replace(
    'setSession(getLocalSession());',
    'getSession().then(setSession);'
)

with open('app/page.tsx', 'w') as f:
    f.write(page_content)

# 2. Update app/login/page.tsx
with open('app/login/page.tsx', 'r') as f:
    login_content = f.read()

# Add a check on mount to redirect if already logged in
redirect_hook = """
  useEffect(() => {
    getSession().then(session => {
      if (session) {
        router.push("/dashboard");
      }
    });
  }, [router]);
"""

# Insert the hook right after the searchParams declaration
login_content = re.sub(
    r'(const searchParams = useSearchParams\(\);\s*)',
    r'\1' + redirect_hook,
    login_content
)

with open('app/login/page.tsx', 'w') as f:
    f.write(login_content)

