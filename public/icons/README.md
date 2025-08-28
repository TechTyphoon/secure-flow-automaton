# PWA Icons

This directory contains the Progressive Web App icons in various sizes for different platforms and use cases.

## Required Sizes

- **72x72**: Basic icon for Android
- **96x96**: Standard icon for most platforms
- **128x128**: Chrome Web Store
- **144x144**: Windows tile
- **152x152**: iOS touch icon
- **192x192**: Android Chrome recommended
- **384x384**: Android Chrome splash screen
- **512x512**: PWA manifest requirement

## Icon Guidelines

- Use PNG format for best compatibility
- Ensure icons work on both light and dark backgrounds
- Consider making icons "maskable" for adaptive icon support
- Test icons on various devices and platforms

For production deployment, use the existing logo.svg converted to PNG format in these sizes, or generate appropriate app icons using tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://maskable.app/ (for maskable icons)
