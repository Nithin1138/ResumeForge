from PIL import Image

def create_og():
    # 1. Create a 1200x630 off-white canvas
    bg_color = (247, 246, 242, 255) # #F7F6F2
    og = Image.new('RGBA', (1200, 630), bg_color)
    
    # 2. Open the logo
    logo = Image.open('public/logo.png').convert("RGBA")
    
    # 3. Resize logo to 300x300 (or fit appropriately)
    max_size = 400
    logo.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    
    # 4. Paste logo in the center
    offset_x = (1200 - logo.width) // 2
    offset_y = (630 - logo.height) // 2
    
    og.paste(logo, (offset_x, offset_y), logo)
    
    # 5. Save og-image.png
    og.save('public/og-image.png', "PNG")

create_og()
