from PIL import Image

def process_image():
    # 1. Open logo and convert to RGBA
    img = Image.open('public/logo.png').convert("RGBA")
    datas = img.getdata()

    # The background is off-white, let's pick the top-left pixel
    bg_color = datas[0]
    threshold = 20

    new_data = []
    for item in datas:
        if abs(item[0] - bg_color[0]) < threshold and \
           abs(item[1] - bg_color[1]) < threshold and \
           abs(item[2] - bg_color[2]) < threshold:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)

    # 2. Crop to bounding box
    bbox = img.getbbox()
    if bbox:
        # add a little padding
        padding = 20
        bbox = (max(0, bbox[0]-padding), max(0, bbox[1]-padding), 
                min(img.width, bbox[2]+padding), min(img.height, bbox[3]+padding))
        img = img.crop(bbox)

    # 3. Save as the new main logo
    img.save('public/logo.png', "PNG")

    # 4. Create proper scaled favicons
    # For a favicon, a square canvas is best. Let's pad it to square.
    max_dim = max(img.width, img.height)
    square_img = Image.new('RGBA', (max_dim, max_dim), (255, 255, 255, 0))
    offset = ((max_dim - img.width) // 2, (max_dim - img.height) // 2)
    square_img.paste(img, offset)

    icon_32 = square_img.resize((32, 32), Image.Resampling.LANCZOS)
    icon_32.save('app/icon.png', "PNG")

    icon_180 = square_img.resize((180, 180), Image.Resampling.LANCZOS)
    icon_180.save('app/apple-icon.png', "PNG")

process_image()
