#!/usr/bin/env python3
from PIL import Image, ImageDraw
import math

# Create a new image for favicon with white background
size = 192
icon = Image.new('RGBA', (size, size), (247, 246, 242, 255))
draw = ImageDraw.Draw(icon)

# Color palette - use the primary color for better visibility
primary_color = (1, 105, 111, 255)  # #01696f with alpha

# Draw a 4-pointed star rotated 45 degrees
center_x, center_y = size / 2, size / 2
outer_radius = size / 2.5
inner_radius = size / 5.5
stroke_width = 8

points = []
for i in range(8):
    angle = i * (math.pi / 4)  # 45 degrees between points
    if i % 2 == 0:  # Outer points
        r = outer_radius
    else:  # Inner points
        r = inner_radius
    
    x = center_x + r * math.cos(angle)
    y = center_y + r * math.sin(angle)
    points.append((x, y))

# Draw the star shape with strokes for better visibility
for i in range(len(points)):
    p1 = points[i]
    p2 = points[(i + 1) % len(points)]
    draw.line([p1, p2], fill=primary_color, width=stroke_width)

# Save as icon.png
icon.save('public/icon.png', 'PNG')
print("✓ icon.png created")

# Create apple-icon.png (similar)
apple_icon = icon.copy()
apple_icon.save('public/apple-icon.png', 'PNG')
print("✓ apple-icon.png created")

print("Favicon icons updated with better visibility!")
